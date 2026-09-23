interface Env {
  DB: D1Database;
  APP_ORIGIN: string;
  VISITOR_SALT: string;
}

import qrcode from "qrcode-generator";

const json = (value: unknown, init: ResponseInit = {}) =>
  Response.json(value, {
    ...init,
    headers: { "cache-control": "no-store", ...init.headers },
  });

const bytesToHex = (bytes: Uint8Array) => Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");

async function sha256(value: string) {
  return bytesToHex(new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value))));
}

function randomToken(bytes = 32) {
  const value = crypto.getRandomValues(new Uint8Array(bytes));
  return btoa(String.fromCharCode(...value))
    .replaceAll("+", "-")
    .replaceAll("/", "_")
    .replaceAll("=", "");
}

function cors(request: Request, env: Env) {
  const origin = request.headers.get("origin");
  if (!origin) return {};
  const allowed = new Set([env.APP_ORIGIN, "https://amahdy59.github.io", "https://wa-zaker.com"].filter(Boolean));
  if (allowed.has(origin) || /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) {
    return { "access-control-allow-origin": origin, vary: "Origin" };
  }
  return {};
}

async function authenticatedDevice(request: Request, env: Env) {
  const credential = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  if (!credential) return null;
  const secretHash = await sha256(credential);
  return env.DB.prepare("SELECT id, account_id FROM devices WHERE secret_hash = ?")
    .bind(secretHash)
    .first<{ id: string; account_id: string }>();
}

async function createDevice(env: Env, accountId?: string) {
  const now = Date.now();
  const resolvedAccountId = accountId ?? crypto.randomUUID();
  const deviceId = crypto.randomUUID();
  const secret = randomToken();
  const secretHash = await sha256(secret);
  const statements = [];
  if (!accountId) {
    statements.push(env.DB.prepare("INSERT INTO accounts (id, created_at) VALUES (?, ?)").bind(resolvedAccountId, now));
  }
  statements.push(
    env.DB.prepare(
      "INSERT INTO devices (id, account_id, secret_hash, created_at, last_seen_at) VALUES (?, ?, ?, ?, ?)",
    ).bind(deviceId, resolvedAccountId, secretHash, now, now),
  );
  await env.DB.batch(statements);
  return { deviceId, secret };
}

async function handle(request: Request, env: Env) {
  const url = new URL(request.url);
  const path = url.pathname.replace(/\/$/, "");

  if (request.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        ...cors(request, env),
        "access-control-allow-headers": "authorization, content-type, if-match",
        "access-control-allow-methods": "GET, POST, PUT, DELETE, OPTIONS",
      },
    });
  }

  if (path === "/v1/health" && request.method === "GET") return json({ ok: true });

  const limits: Record<string, number> = {
    "/v1/devices": 10,
    "/v1/pairings": 20,
    "/v1/pairings/claim": 20,
    "/v1/pairings/qr": 30,
    "/v1/visitors": 30,
  };
  if (limits[path]) {
    const windowEnd = (Math.floor(Date.now() / 60_000) + 1) * 60_000;
    const key = await sha256(
      `${env.VISITOR_SALT}:${request.headers.get("cf-connecting-ip") ?? "local"}:${path}:${windowEnd}`,
    );
    const allowed = await env.DB.prepare(
      `INSERT INTO request_limits (key, hits, expires_at) VALUES (?, 1, ?)
       ON CONFLICT(key) DO UPDATE SET hits = hits + 1 WHERE hits < ? RETURNING hits`,
    )
      .bind(key, windowEnd, limits[path])
      .first();
    if (!allowed)
      return json(
        { error: "rate_limited" },
        {
          status: 429,
          headers: {
            ...cors(request, env),
            "retry-after": String(Math.max(1, Math.ceil((windowEnd - Date.now()) / 1000))),
          },
        },
      );
  }

  if (path === "/v1/visitors" && request.method === "POST") {
    const address = request.headers.get("cf-connecting-ip") ?? "unknown";
    const agent = request.headers.get("user-agent") ?? "unknown";
    // Production must set `VISITOR_SALT` via `wrangler secret put VISITOR_SALT`.
    const salt = env.VISITOR_SALT || "azkarapp-visitor-salt";
    const body = (await request.json().catch(() => ({}))) as { visitorId?: unknown };
    const visitorId =
      typeof body.visitorId === "string" && body.visitorId.length >= 1 && body.visitorId.length <= 128
        ? body.visitorId
        : null;
    const visitorHash = await sha256(
      visitorId ? `${salt}:${address}:${agent}:${visitorId}` : `${salt}:${address}:${agent}`,
    );
    await env.DB.prepare("INSERT OR IGNORE INTO visitors (visitor_hash, first_seen_at) VALUES (?, ?)")
      .bind(visitorHash, Date.now())
      .run();
    const row = await env.DB.prepare("SELECT COUNT(*) AS total FROM visitors").first<{ total: number }>();
    return json({ total: row?.total ?? 0 }, { headers: cors(request, env) });
  }

  if (path === "/v1/devices" && request.method === "POST") {
    return json(await createDevice(env), { status: 201, headers: cors(request, env) });
  }

  if (path === "/v1/pairings" && request.method === "POST") {
    const device = await authenticatedDevice(request, env);
    if (!device) return json({ error: "unauthorized" }, { status: 401, headers: cors(request, env) });
    const now = Date.now();
    await env.DB.prepare("DELETE FROM pairing_tokens WHERE expires_at < ?").bind(now).run();
    await env.DB.prepare("UPDATE devices SET last_seen_at = ? WHERE id = ?").bind(now, device.id).run();
    const token = randomToken(24);
    await env.DB.prepare("INSERT INTO pairing_tokens (token_hash, account_id, expires_at) VALUES (?, ?, ?)")
      .bind(await sha256(token), device.account_id, now + 5 * 60_000)
      .run();
    return json({ token, expiresIn: 300 }, { status: 201, headers: cors(request, env) });
  }

  if (path === "/v1/pairings/qr" && request.method === "GET") {
    const device = await authenticatedDevice(request, env);
    if (!device) return json({ error: "unauthorized" }, { status: 401, headers: cors(request, env) });
    const token = url.searchParams.get("token");
    if (!token || token.length > 128)
      return json({ error: "invalid_pairing" }, { status: 400, headers: cors(request, env) });
    const code = qrcode(0, "M");
    code.addData(`${env.APP_ORIGIN}/?pair=${encodeURIComponent(token)}`);
    code.make();
    return json({ dataUrl: code.createDataURL(5, 2) }, { headers: cors(request, env) });
  }

  if (path === "/v1/pairings/claim" && request.method === "POST") {
    const body = (await request.json().catch(() => ({}))) as { token?: string };
    if (typeof body.token !== "string" || !body.token || body.token.length > 128)
      return json({ error: "invalid_pairing" }, { status: 400, headers: cors(request, env) });
    const hash = await sha256(body.token);
    const now = Date.now();
    await env.DB.prepare("DELETE FROM pairing_tokens WHERE expires_at < ?").bind(now).run();
    const pairing = await env.DB.prepare(
      "SELECT account_id FROM pairing_tokens WHERE token_hash = ? AND expires_at > ? AND consumed_at IS NULL",
    )
      .bind(hash, now)
      .first<{ account_id: string }>();
    if (!pairing) return json({ error: "expired_pairing" }, { status: 410, headers: cors(request, env) });
    const consumed = await env.DB.prepare(
      "UPDATE pairing_tokens SET consumed_at = ? WHERE token_hash = ? AND consumed_at IS NULL",
    )
      .bind(now, hash)
      .run();
    if (consumed.meta.changes !== 1) {
      return json({ error: "expired_pairing" }, { status: 410, headers: cors(request, env) });
    }
    return json(await createDevice(env, pairing.account_id), { status: 201, headers: cors(request, env) });
  }

  if (path === "/v1/devices/current" && request.method === "DELETE") {
    const device = await authenticatedDevice(request, env);
    if (!device) return json({ error: "unauthorized" }, { status: 401, headers: cors(request, env) });
    await env.DB.prepare("DELETE FROM devices WHERE id = ?").bind(device.id).run();
    await env.DB.prepare(
      "DELETE FROM accounts WHERE id = ? AND NOT EXISTS (SELECT 1 FROM devices WHERE account_id = accounts.id)",
    )
      .bind(device.account_id)
      .run();
    return json({ ok: true }, { headers: cors(request, env) });
  }

  if (path === "/v1/sync") {
    const device = await authenticatedDevice(request, env);
    if (!device) return json({ error: "unauthorized" }, { status: 401, headers: cors(request, env) });
    const now = Date.now();
    await env.DB.prepare("UPDATE devices SET last_seen_at = ? WHERE id = ?").bind(now, device.id).run();
    if (request.method === "GET") {
      const row = await env.DB.prepare("SELECT snapshot, revision, updated_at FROM sync_snapshots WHERE account_id = ?")
        .bind(device.account_id)
        .first<{ snapshot: string; revision: number; updated_at: number }>();
      return json(
        row
          ? { snapshot: JSON.parse(row.snapshot), revision: row.revision, updatedAt: row.updated_at }
          : { snapshot: null },
        { headers: cors(request, env) },
      );
    }
    if (request.method === "PUT") {
      const body = (await request.json().catch(() => null)) as { snapshot?: unknown } | null;
      const serialized = JSON.stringify(body?.snapshot ?? null);
      if (serialized.length > 1_000_000)
        return json({ error: "snapshot_too_large" }, { status: 413, headers: cors(request, env) });
      const expectedRevision = Number(request.headers.get("if-match") ?? "0");
      if (!Number.isSafeInteger(expectedRevision) || expectedRevision < 0) {
        return json({ error: "invalid_revision" }, { status: 400, headers: cors(request, env) });
      }
      // The revision comparison and write must be one SQL operation.
      const saved =
        expectedRevision === 0
          ? await env.DB.prepare(
              "INSERT INTO sync_snapshots (account_id, snapshot, revision, updated_at) VALUES (?, ?, 1, ?) ON CONFLICT(account_id) DO NOTHING RETURNING revision",
            )
              .bind(device.account_id, serialized, now)
              .first<{ revision: number }>()
          : await env.DB.prepare(
              "UPDATE sync_snapshots SET snapshot = ?, revision = revision + 1, updated_at = ? WHERE account_id = ? AND revision = ? RETURNING revision",
            )
              .bind(serialized, now, device.account_id, expectedRevision)
              .first<{ revision: number }>();
      if (!saved) {
        return json({ error: "sync_conflict" }, { status: 409, headers: cors(request, env) });
      }
      return json({ ok: true, revision: saved.revision, updatedAt: now }, { headers: cors(request, env) });
    }
  }

  return json({ error: "not_found" }, { status: 404, headers: cors(request, env) });
}

export default {
  async scheduled(_event: unknown, env: Env) {
    const now = Date.now();
    await env.DB.batch([
      env.DB.prepare("DELETE FROM request_limits WHERE expires_at <= ?").bind(now),
      env.DB.prepare("DELETE FROM pairing_tokens WHERE expires_at <= ?").bind(now),
    ]);
  },
  async fetch(request: Request, env: Env) {
    try {
      return await handle(request, env);
    } catch (error) {
      console.error(error instanceof Error ? error.name : "unknown_error");
      return json({ error: "internal_error" }, { status: 500, headers: cors(request, env) });
    }
  },
};
