# NO MORE COWS Playtest Key Claims

## Overview

`no-more-cows-playtest.html` is a hidden, noindex claim page for the NO MORE COWS closed playtest. Email recipients should receive this shared campaign link:

```text
https://zweibier-indie.de/no-more-cows-playtest.html?invite=nmc-closed-playtest-2026
```

The page never contains Steam keys. It sends the invite token and an optional browser-saved receipt token to a Supabase Edge Function. The function calls a Postgres RPC that atomically reserves two unused keys and marks them as issued, so later visitors cannot receive the same keys.

Because the campaign link is shared, it can be forwarded. The repeat-display behavior is browser based: after the first successful claim, the page stores a receipt token in local storage and uses it to show the same two keys again from the same browser.

## Files

- `no-more-cows-playtest.html` contains the claim UI and client-side request logic.
- `supabase/functions/nmc-claim/index.ts` contains the Supabase Edge Function.
- `supabase/migrations/20260512170000_no_more_cows_playtest.sql` creates the key pool, campaign, claim tables, and `claim_nmc_playtest_keys` RPC.
- `supabase/seed/no-more-cows-keys.example.csv` shows the key import CSV format. Do not commit real Steam keys.
- `privacy-policy.html` describes the Supabase processing and browser storage used by the playtest claim page.

## Supabase Setup

1. Create or select the Supabase project that will hold the playtest database.
2. Apply `supabase/migrations/20260512170000_no_more_cows_playtest.sql`.
3. Create an active campaign:

```sql
insert into public.nmc_playtest_campaigns (
  name,
  public_token,
  keys_per_claim,
  max_total_claims,
  daily_claim_limit_per_requester_hash
)
values (
  'NO MORE COWS Closed Playtest',
  'nmc-closed-playtest-2026',
  2,
  null,
  null
);
```

4. Import the real Steam playtest keys into `public.nmc_playtest_keys` with one key per row in the `steam_key` column. Keep real key CSV files outside git or under `supabase/seed/`, where non-example CSV files are ignored.
5. Deploy the `nmc-claim` Edge Function. Use `--no-verify-jwt` because the public website claim page does not send a Supabase user JWT:

```powershell
npx.cmd supabase functions deploy nmc-claim --project-ref asameydhgajemivrcckb --use-api --no-verify-jwt
```

6. Set the function secrets:

```text
NMC_SUPABASE_SERVICE_ROLE_KEY=...
NMC_CLAIM_HASH_SALT=long-random-secret
NMC_ALLOWED_ORIGINS=https://zweibier-indie.de,https://www.zweibier-indie.de
```

`SUPABASE_URL` is provided automatically by Supabase Edge Functions. `NMC_SUPABASE_SERVICE_ROLE_KEY` must stay server-side only.

7. Confirm that `no-more-cows-playtest.html` points at the deployed function:

```js
const CLAIM_ENDPOINT = "https://asameydhgajemivrcckb.functions.supabase.co/nmc-claim";
```

## Claim Flow

1. Visitor opens the shared email link with `?invite=nmc-closed-playtest-2026`.
2. Visitor presses `Get 2 keys`.
3. The page sends the campaign token and, if present, the stored receipt token to the Edge Function.
4. The Edge Function hashes the receipt token and request metadata with `NMC_CLAIM_HASH_SALT`.
5. The RPC locks the campaign row, checks for an existing receipt, then reserves the next two available keys using row locks.
6. Issued keys are marked `status = 'issued'` and linked to the claim. They remain in the database for audit history but leave the available pool.
7. The page stores only the receipt token in browser local storage, not the Steam keys.

## Operations

- Available keys:

```sql
select count(*) from public.nmc_playtest_keys where status = 'available';
```

- Issued keys:

```sql
select c.claimed_at, k.steam_key
from public.nmc_playtest_claims c
join public.nmc_playtest_keys k on k.issued_claim_id = c.id
order by c.claimed_at desc, k.id;
```

- Disable the campaign:

```sql
update public.nmc_playtest_campaigns
set is_active = false
where public_token = 'nmc-closed-playtest-2026';
```

Disabling the campaign prevents new claims. Existing browser receipt tokens can still display the keys that were already issued to them.

## Privacy Notes

The claim page stores two local storage values:

- `zb-nmc-playtest:campaign-token`
- `zb-nmc-playtest:receipt-token`

Supabase stores claim records, hashed receipt tokens, hashed requester metadata, and issued keys. The function does not store raw IP addresses or raw user-agent strings.
