const DEFAULT_ALLOWED_ORIGINS = [
  "https://zweibier-indie.de",
  "https://www.zweibier-indie.de",
  "http://localhost:8080",
  "http://127.0.0.1:8080"
];

type ClaimResponse = {
  claim_id: string;
  issued_at: string;
  keys: string[];
  is_existing: boolean;
  remaining_keys: number;
};

function getAllowedOrigins(): string[] {
  const configuredOrigins = Deno.env.get("NMC_ALLOWED_ORIGINS");

  if (!configuredOrigins) {
    return DEFAULT_ALLOWED_ORIGINS;
  }

  return configuredOrigins
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
}

function getCorsHeaders(request: Request): HeadersInit {
  const allowedOrigins = getAllowedOrigins();
  const requestOrigin = request.headers.get("origin") || "";
  const allowedOrigin = allowedOrigins.includes(requestOrigin)
    ? requestOrigin
    : allowedOrigins[0];

  return {
    "Access-Control-Allow-Origin": allowedOrigin,
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Max-Age": "86400",
    "Vary": "Origin"
  };
}

function jsonResponse(request: Request, status: number, payload: unknown): Response {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      ...getCorsHeaders(request),
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store"
    }
  });
}

function getRequiredEnv(name: string): string {
  const value = Deno.env.get(name);

  if (!value) {
    throw new Error(`Missing ${name}`);
  }

  return value;
}

function normalizeToken(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function isValidToken(value: string, maxLength = 240): boolean {
  return value.length >= 8 && value.length <= maxLength;
}

function generateToken(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);

  return btoa(String.fromCharCode(...bytes))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

async function sha256(value: string): Promise<string> {
  const encoded = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest("SHA-256", encoded);

  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

function getClientIp(request: Request): string {
  const forwardedFor = request.headers.get("x-forwarded-for");

  if (forwardedFor) {
    return forwardedFor.split(",")[0].trim();
  }

  return request.headers.get("cf-connecting-ip")
    || request.headers.get("x-real-ip")
    || "unknown";
}

function mapRpcError(message: string): { status: number; error: string } {
  if (message.includes("campaign_not_active")) {
    return { status: 403, error: "campaign_not_active" };
  }

  if (message.includes("not_enough_keys")) {
    return { status: 409, error: "not_enough_keys" };
  }

  if (message.includes("claim_limit_reached")) {
    return { status: 429, error: "claim_limit_reached" };
  }

  if (message.includes("invalid_request")) {
    return { status: 400, error: "invalid_request" };
  }

  return { status: 500, error: "claim_failed" };
}

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: getCorsHeaders(request)
    });
  }

  if (request.method !== "POST") {
    return jsonResponse(request, 405, { error: "method_not_allowed" });
  }

  try {
    const supabaseUrl = getRequiredEnv("SUPABASE_URL").replace(/\/+$/g, "");
    const serviceRoleKey = getRequiredEnv("NMC_SUPABASE_SERVICE_ROLE_KEY");
    const hashSalt = getRequiredEnv("NMC_CLAIM_HASH_SALT");
    const body = await request.json().catch(() => null);
    const campaignToken = normalizeToken(body && body.campaignToken);
    const providedReceiptToken = normalizeToken(body && body.receiptToken);
    const receiptToken = providedReceiptToken || generateToken();

    if (!isValidToken(campaignToken) || !isValidToken(receiptToken)) {
      return jsonResponse(request, 400, { error: "invalid_request" });
    }

    const userAgent = request.headers.get("user-agent") || "";
    const requesterRaw = `${getClientIp(request)}|${userAgent}`;
    const receiptTokenHash = await sha256(`${hashSalt}:receipt:${receiptToken}`);
    const requesterHash = await sha256(`${hashSalt}:requester:${requesterRaw}`);
    const userAgentHash = userAgent
      ? await sha256(`${hashSalt}:user-agent:${userAgent}`)
      : null;

    const rpcResponse = await fetch(`${supabaseUrl}/rest/v1/rpc/claim_nmc_playtest_keys`, {
      method: "POST",
      headers: {
        "Accept": "application/json",
        "Authorization": `Bearer ${serviceRoleKey}`,
        "Content-Type": "application/json",
        "apikey": serviceRoleKey
      },
      body: JSON.stringify({
        p_campaign_token: campaignToken,
        p_receipt_token_hash: receiptTokenHash,
        p_requester_hash: requesterHash,
        p_user_agent_hash: userAgentHash
      })
    });

    const rpcPayload = await rpcResponse.json().catch(() => null);

    if (!rpcResponse.ok) {
      const message = String((rpcPayload && rpcPayload.message) || "");
      const mappedError = mapRpcError(message);

      return jsonResponse(request, mappedError.status, { error: mappedError.error });
    }

    const claim = (Array.isArray(rpcPayload) ? rpcPayload[0] : rpcPayload) as ClaimResponse | null;

    if (!claim || !Array.isArray(claim.keys) || claim.keys.length !== 2) {
      return jsonResponse(request, 500, { error: "claim_failed" });
    }

    return jsonResponse(request, 200, {
      receiptToken,
      claimId: claim.claim_id,
      issuedAt: claim.issued_at,
      keys: claim.keys,
      isExisting: claim.is_existing,
      remainingKeys: claim.remaining_keys
    });
  } catch (_error) {
    return jsonResponse(request, 500, { error: "claim_failed" });
  }
});
