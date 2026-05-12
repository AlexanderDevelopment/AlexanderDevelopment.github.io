create extension if not exists pgcrypto;

create table if not exists public.nmc_playtest_campaigns (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  public_token text not null unique,
  is_active boolean not null default true,
  starts_at timestamptz,
  ends_at timestamptz,
  keys_per_claim integer not null default 2 check (keys_per_claim > 0 and keys_per_claim <= 10),
  max_total_claims integer check (max_total_claims is null or max_total_claims > 0),
  daily_claim_limit_per_requester_hash integer check (
    daily_claim_limit_per_requester_hash is null
    or daily_claim_limit_per_requester_hash > 0
  ),
  created_at timestamptz not null default now()
);

create table if not exists public.nmc_playtest_claims (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references public.nmc_playtest_campaigns(id),
  receipt_token_hash text not null unique,
  requester_hash text,
  user_agent_hash text,
  key_count integer not null default 2,
  claimed_at timestamptz not null default now()
);

create table if not exists public.nmc_playtest_keys (
  id bigint generated always as identity primary key,
  steam_key text not null unique,
  status text not null default 'available' check (status in ('available', 'issued', 'void')),
  issued_claim_id uuid references public.nmc_playtest_claims(id),
  issued_at timestamptz,
  created_at timestamptz not null default now(),
  check (
    (status = 'available' and issued_claim_id is null and issued_at is null)
    or (status in ('issued', 'void'))
  )
);

create index if not exists nmc_playtest_keys_available_idx
  on public.nmc_playtest_keys (id)
  where status = 'available' and issued_claim_id is null;

create index if not exists nmc_playtest_claims_campaign_idx
  on public.nmc_playtest_claims (campaign_id, claimed_at);

create index if not exists nmc_playtest_claims_requester_idx
  on public.nmc_playtest_claims (campaign_id, requester_hash, claimed_at)
  where requester_hash is not null;

alter table public.nmc_playtest_campaigns enable row level security;
alter table public.nmc_playtest_claims enable row level security;
alter table public.nmc_playtest_keys enable row level security;

create or replace function public.claim_nmc_playtest_keys(
  p_campaign_token text,
  p_receipt_token_hash text,
  p_requester_hash text default null,
  p_user_agent_hash text default null
)
returns table (
  claim_id uuid,
  issued_at timestamptz,
  keys text[],
  is_existing boolean,
  remaining_keys integer
)
language plpgsql
security definer
set search_path = public
as $$
declare
  active_campaign public.nmc_playtest_campaigns%rowtype;
  existing_claim public.nmc_playtest_claims%rowtype;
  new_claim_id uuid;
  selected_key_ids bigint[];
  issued_keys text[];
  requested_key_count integer;
  existing_claim_count integer;
  requester_claim_count integer;
  available_key_count integer;
begin
  if nullif(trim(p_campaign_token), '') is null
    or nullif(trim(p_receipt_token_hash), '') is null then
    raise exception 'invalid_request';
  end if;

  select *
  into active_campaign
  from public.nmc_playtest_campaigns
  where public_token = trim(p_campaign_token)
  for update;

  if not found then
    raise exception 'campaign_not_active';
  end if;

  select *
  into existing_claim
  from public.nmc_playtest_claims
  where campaign_id = active_campaign.id
    and receipt_token_hash = trim(p_receipt_token_hash);

  if found then
    select coalesce(array_agg(steam_key order by id), array[]::text[])
    into issued_keys
    from public.nmc_playtest_keys
    where issued_claim_id = existing_claim.id;

    select count(*)::integer
    into available_key_count
    from public.nmc_playtest_keys
    where status = 'available'
      and issued_claim_id is null;

    return query
      select existing_claim.id,
        existing_claim.claimed_at,
        issued_keys,
        true,
        available_key_count;
    return;
  end if;

  if active_campaign.is_active is not true
    or (active_campaign.starts_at is not null and active_campaign.starts_at > now())
    or (active_campaign.ends_at is not null and active_campaign.ends_at < now()) then
    raise exception 'campaign_not_active';
  end if;

  if active_campaign.max_total_claims is not null then
    select count(*)::integer
    into existing_claim_count
    from public.nmc_playtest_claims
    where campaign_id = active_campaign.id;

    if existing_claim_count >= active_campaign.max_total_claims then
      raise exception 'not_enough_keys';
    end if;
  end if;

  if active_campaign.daily_claim_limit_per_requester_hash is not null
    and nullif(trim(coalesce(p_requester_hash, '')), '') is not null then
    select count(*)::integer
    into requester_claim_count
    from public.nmc_playtest_claims
    where campaign_id = active_campaign.id
      and requester_hash = trim(p_requester_hash)
      and claimed_at >= date_trunc('day', now());

    if requester_claim_count >= active_campaign.daily_claim_limit_per_requester_hash then
      raise exception 'claim_limit_reached';
    end if;
  end if;

  requested_key_count := active_campaign.keys_per_claim;

  select coalesce(array_agg(candidate.id order by candidate.id), array[]::bigint[])
  into selected_key_ids
  from (
    select id
    from public.nmc_playtest_keys
    where status = 'available'
      and issued_claim_id is null
    order by id
    limit requested_key_count
    for update skip locked
  ) as candidate;

  if coalesce(array_length(selected_key_ids, 1), 0) < requested_key_count then
    raise exception 'not_enough_keys';
  end if;

  insert into public.nmc_playtest_claims (
    campaign_id,
    receipt_token_hash,
    requester_hash,
    user_agent_hash,
    key_count
  )
  values (
    active_campaign.id,
    trim(p_receipt_token_hash),
    nullif(trim(coalesce(p_requester_hash, '')), ''),
    nullif(trim(coalesce(p_user_agent_hash, '')), ''),
    requested_key_count
  )
  returning id into new_claim_id;

  update public.nmc_playtest_keys
  set status = 'issued',
    issued_claim_id = new_claim_id,
    issued_at = now()
  where id = any(selected_key_ids);

  select coalesce(array_agg(steam_key order by id), array[]::text[])
  into issued_keys
  from public.nmc_playtest_keys
  where issued_claim_id = new_claim_id;

  select count(*)::integer
  into available_key_count
  from public.nmc_playtest_keys
  where status = 'available'
    and issued_claim_id is null;

  return query
    select new_claim_id,
      now(),
      issued_keys,
      false,
      available_key_count;
end;
$$;

revoke all on table public.nmc_playtest_campaigns from anon, authenticated;
revoke all on table public.nmc_playtest_claims from anon, authenticated;
revoke all on table public.nmc_playtest_keys from anon, authenticated;
revoke execute on function public.claim_nmc_playtest_keys(text, text, text, text) from public;
grant execute on function public.claim_nmc_playtest_keys(text, text, text, text) to service_role;
