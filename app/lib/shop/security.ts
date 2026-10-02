import { createHash, createHmac, scrypt as derive, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import type { Database } from "./database";
import { ShopError } from "./service";

const scrypt = promisify(derive);
export const ADMIN_COOKIE = "sift_admin";
export const RECEIPT_COOKIE = "sift_receipt";
export const SESSION_SECONDS = 8 * 60 * 60;
const equal = (a: string, b: string) => Buffer.byteLength(a) === Buffer.byteLength(b) && timingSafeEqual(Buffer.from(a), Buffer.from(b));
function secret() {
  const value = process.env.SIFT_SESSION_SECRET || "";
  if (value.length < 32) throw new ShopError("Ordering security is not configured.", 503);
  return value;
}
function passwordHash() {
  const value = process.env.SIFT_ADMIN_PASSWORD_HASH || "";
  if (!/^[^:]{16,128}:[a-f0-9]{128}$/i.test(value)) throw new ShopError("Admin access is not configured.", 503);
  return value;
}
export function securityConfigured() { try { secret(); passwordHash(); return true; } catch { return false; } }
function mac(value: string) { return createHmac("sha256", secret()).update(value).digest("base64url"); }
const passwordVersion = () => createHash("sha256").update(passwordHash()).digest("hex");
export function receiptToken(idempotencyKey: string) { return mac(`receipt:${idempotencyKey}`); }
export async function verifyPassword(password: string) {
  const [salt, expected] = passwordHash().split(":");
  const actual = await scrypt(password, salt, 64) as Buffer;
  return timingSafeEqual(actual, Buffer.from(expected, "hex"));
}
export function createSession(now = Date.now()) {
  const payload = Buffer.from(JSON.stringify({ expires: now + SESSION_SECONDS * 1000, version: passwordVersion() })).toString("base64url");
  return `${payload}.${mac(`admin:${payload}`)}`;
}
export function validSession(token: string, now = Date.now()) {
  try {
    if (token.length > 1024) return false;
    const parts = token.split(".");
    if (parts.length !== 2 || !equal(parts[1], mac(`admin:${parts[0]}`))) return false;
    const data = JSON.parse(Buffer.from(parts[0], "base64url").toString());
    return Number.isFinite(data.expires) && data.expires > now && data.expires <= now + SESSION_SECONDS * 1000 && equal(data.version, passwordVersion());
  } catch { return false; }
}
export function requireSameOrigin(request: Request) {
  const supplied = request.headers.get("origin");
  if (!supplied || supplied === "null") throw new ShopError("This request must come from the shop website.", 403);
  let allowed: string;
  try {
    if (process.env.PUBLIC_SITE_URL) {
      const configured = new URL(process.env.PUBLIC_SITE_URL);
      if (process.env.NODE_ENV === "production" && configured.protocol !== "https:") throw new Error();
      allowed = configured.origin;
    } else {
      const url = new URL(request.url);
      if (process.env.NODE_ENV === "production" || !["localhost", "127.0.0.1", "[::1]"].includes(url.hostname)) throw new Error();
      allowed = url.origin;
    }
  } catch { throw new ShopError("The shop website URL is not configured.", 503); }
  if (supplied !== allowed) throw new ShopError("This request must come from the shop website.", 403);
}
export async function rateLimit(db: Database, key: string, limit: number, seconds: number) {
  const { rows } = await db.query<{ hits: number }>(`INSERT INTO sift_rate_limits(key,hits,reset_at) VALUES($1,1,now()+$2*interval '1 second')
    ON CONFLICT(key) DO UPDATE SET hits=CASE WHEN sift_rate_limits.reset_at <= now() THEN 1 ELSE sift_rate_limits.hits+1 END,
    reset_at=CASE WHEN sift_rate_limits.reset_at <= now() THEN now()+$2*interval '1 second' ELSE sift_rate_limits.reset_at END RETURNING hits`, [key, seconds]);
  if (rows[0].hits > limit) throw new ShopError("Too many attempts. Please try again later.", 429);
}
export function validCron(request: Request) {
  const key = process.env.CRON_SECRET || "";
  return key.length >= 32 && equal(request.headers.get("authorization") || "", `Bearer ${key}`);
}
