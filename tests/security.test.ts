import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import { scryptSync } from "node:crypto";
import { PGlite } from "@electric-sql/pglite";
import { localDatabase, migrate } from "../app/lib/shop/database";
import { createSession, validSession, verifyPassword, receiptToken, requireSameOrigin, rateLimit, securityConfigured, validCron } from "../app/lib/shop/security";
import { body, json } from "../app/lib/shop/http";

const original = { ...process.env };
const salt = "test-salt-at-least-sixteen";
const hash = (password: string) => `${salt}:${scryptSync(password, salt, 64).toString("hex")}`;
const db = localDatabase(new PGlite());
before(async () => {
  process.env.SIFT_SESSION_SECRET = "test-secret-only-32-characters-or-more";
  process.env.SIFT_ADMIN_PASSWORD_HASH = hash("correct-password");
  Object.assign(process.env, { NODE_ENV: "development" });
  delete process.env.PUBLIC_SITE_URL;
  await migrate(db);
});
after(async () => {
  for (const key of ["SIFT_SESSION_SECRET", "SIFT_ADMIN_PASSWORD_HASH", "PUBLIC_SITE_URL", "NODE_ENV", "CRON_SECRET"]) {
    if (original[key] === undefined) delete process.env[key]; else process.env[key] = original[key];
  }
  await db.close();
});
test("scrypt password verification rejects the wrong password", async () => {
  assert.equal(await verifyPassword("correct-password"), true);
  assert.equal(await verifyPassword("wrong-password"), false);
});
test("signed admin sessions reject tampering, expiry and password rotation", () => {
  const now = Date.now(); const token = createSession(now);
  assert.equal(validSession(token, now), true);
  assert.equal(validSession(`${token.slice(0, -5)}wrong`, now), false);
  assert.equal(validSession(token, now + 8 * 3600 * 1000), false);
  assert.equal(validSession("invalid"), false);
  process.env.SIFT_ADMIN_PASSWORD_HASH = hash("new-password");
  assert.equal(validSession(token, now), false);
  process.env.SIFT_ADMIN_PASSWORD_HASH = hash("correct-password");
});
test("receipt retries derive identical opaque tokens without exposing the idempotency key", () => {
  const first = receiptToken("first-key");
  assert.equal(first, receiptToken("first-key"));
  assert.notEqual(first, receiptToken("second-key"));
  assert.equal(first.includes("first-key"), false);
  assert.ok(first.length >= 40);
});
test("auth fails closed without a long secret or valid password hash", () => {
  const secret = process.env.SIFT_SESSION_SECRET;
  process.env.SIFT_SESSION_SECRET = "short";
  assert.equal(securityConfigured(), false);
  assert.throws(() => receiptToken("anything"), /not configured/);
  process.env.SIFT_SESSION_SECRET = secret;
  assert.equal(securityConfigured(), true);
});
test("mutations reject missing, foreign and spoofed origins", () => {
  assert.throws(() => requireSameOrigin(new Request("http://localhost:3100/api/orders")), /website/);
  assert.throws(() => requireSameOrigin(new Request("http://localhost:3100/api/orders", { headers: { origin: "https://evil.test", "x-forwarded-host": "evil.test" } })), /website/);
  assert.doesNotThrow(() => requireSameOrigin(new Request("http://localhost:3100/api/orders", { headers: { origin: "http://localhost:3100" } })));
  Object.assign(process.env, { NODE_ENV: "production" });
  assert.throws(() => requireSameOrigin(new Request("https://shop.test/api/orders", { headers: { origin: "https://shop.test" } })), /not configured/);
  process.env.PUBLIC_SITE_URL = "http://shop.test";
  assert.throws(() => requireSameOrigin(new Request("http://shop.test/api/orders", { headers: { origin: "http://shop.test" } })), /not configured/);
  process.env.PUBLIC_SITE_URL = "https://shop.test";
  assert.doesNotThrow(() => requireSameOrigin(new Request("http://internal:3000/api/orders", { headers: { origin: "https://shop.test" } })));
  assert.throws(() => requireSameOrigin(new Request("https://evil.test/api/orders", { headers: { origin: "https://evil.test" } })), /website/);
  delete process.env.PUBLIC_SITE_URL; Object.assign(process.env, { NODE_ENV: "development" });
});
test("durable rate limit atomically caps simultaneous requests and resets expired buckets", async () => {
  const results = await Promise.allSettled(Array.from({ length: 8 }, () => rateLimit(db, "test", 3, 60)));
  assert.equal(results.filter(r => r.status === "fulfilled").length, 3);
  assert.equal(results.filter(r => r.status === "rejected").length, 5);
  await db.query("UPDATE sift_rate_limits SET reset_at=now()-interval '1 second' WHERE key='test'");
  await assert.doesNotReject(rateLimit(db, "test", 3, 60));
});
test("body size is enforced even without Content-Length", async () => {
  await assert.rejects(body(new Request("http://localhost", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ value: "x".repeat(100) }) }), 20), /too large/);
  await assert.rejects(body(new Request("http://localhost", { method: "POST", headers: { "content-type": "application/json" }, body: "{" })), /Invalid JSON/);
  assert.deepEqual(await body(new Request("http://localhost", { method: "POST", headers: { "content-type": "application/json" }, body: '{"ok":true}' })), { ok: true });
});
test("private responses prevent caching, indexing and referrer leakage", () => {
  const response = json({ ok: true });
  assert.match(response.headers.get("cache-control") || "", /no-store/);
  assert.match(response.headers.get("x-robots-tag") || "", /noindex/);
  assert.equal(response.headers.get("referrer-policy"), "no-referrer");
});
test("cron requires a long configured bearer secret", () => {
  delete process.env.CRON_SECRET;
  assert.equal(validCron(new Request("http://localhost")), false);
  process.env.CRON_SECRET = "cron-secret-at-least-thirty-two-characters";
  assert.equal(validCron(new Request("http://localhost", { headers: { authorization: `Bearer ${process.env.CRON_SECRET}` } })), true);
  assert.equal(validCron(new Request("http://localhost", { headers: { authorization: "Bearer wrong" } })), false);
});
