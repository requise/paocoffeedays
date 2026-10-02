import { NextRequest } from "next/server";
import { z } from "zod";
import { getDatabase } from "../../../lib/shop/database";
import { ShopError } from "../../../lib/shop/service";
import { api, body, json, secureCookie } from "../../../lib/shop/http";
import { ADMIN_COOKIE, createSession, rateLimit, requireSameOrigin, SESSION_SECONDS, verifyPassword } from "../../../lib/shop/security";
export const runtime = "nodejs";
export async function POST(request: NextRequest) { return api(async () => {
  requireSameOrigin(request); const db = await getDatabase(); await rateLimit(db, "login:global", 20, 900);
  const { password } = z.object({ password: z.string().min(1).max(1024) }).strict().parse(await body(request, 4096));
  if (!await verifyPassword(password)) throw new ShopError("Incorrect password.", 401);
  const response = json({ ok: true });
  response.cookies.set(ADMIN_COOKIE, createSession(), { httpOnly: true, secure: secureCookie(), sameSite: "strict", path: "/api/admin", maxAge: SESSION_SECONDS });
  return response;
}); }
