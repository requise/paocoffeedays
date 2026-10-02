import { NextRequest, NextResponse, after } from "next/server";
import { ZodError } from "zod";
import type { Database } from "./database";
import { ShopError } from "./service";
import { ADMIN_COOKIE, securityConfigured, validSession } from "./security";
import { flushNotifications } from "./notifications";

export const privateHeaders = { "Cache-Control": "no-store, private, max-age=0", "X-Robots-Tag": "noindex, nofollow", "Referrer-Policy": "no-referrer" };
export const json = (value: unknown, status = 200) => NextResponse.json(value, { status, headers: privateHeaders });
export async function api(action: () => Promise<NextResponse>) {
  try { return await action(); }
  catch (error) {
    if (error instanceof ShopError) return json({ error: error.message }, error.status);
    if (error instanceof ZodError) return json({ error: error.issues[0]?.message || "Check the submitted information." }, 400);
    console.error("Shop request failed", error instanceof Error ? error.name : "Unknown error");
    return json({ error: "The shop is temporarily unavailable. Please try again later." }, 503);
  }
}
export async function body(request: Request, maxBytes = 65536): Promise<unknown> {
  if (!request.headers.get("content-type")?.toLowerCase().startsWith("application/json")) throw new ShopError("Send a JSON request.", 415);
  if (Number(request.headers.get("content-length")) > maxBytes) throw new ShopError("Request is too large.", 413);
  const reader = request.body?.getReader();
  if (!reader) throw new ShopError("A request body is required.");
  const parts: Uint8Array[] = []; let size = 0;
  try {
    while (true) {
      const { done, value } = await reader.read(); if (done) break;
      size += value.byteLength;
      if (size > maxBytes) { await reader.cancel(); throw new ShopError("Request is too large.", 413); }
      parts.push(value);
    }
    try { return JSON.parse(Buffer.concat(parts).toString("utf8")); } catch { throw new ShopError("Invalid JSON request."); }
  } finally { reader.releaseLock(); }
}
export function requireAdmin(request: NextRequest) {
  if (!securityConfigured()) throw new ShopError("Admin access is not configured.", 503);
  if (!validSession(request.cookies.get(ADMIN_COOKIE)?.value || "")) throw new ShopError("Please sign in to manage the shop.", 401);
}
export function notifyLater(db: Database) {
  try { after(async () => { try { await flushNotifications(db, 2); } catch { console.error("Order notification delivery deferred."); } }); }
  catch { console.error("Order notification delivery deferred."); }
}
export const secureCookie = () => process.env.NODE_ENV === "production" || process.env.PUBLIC_SITE_URL?.startsWith("https://") === true;
