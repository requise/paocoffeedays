import { NextRequest } from "next/server";
import { api, json, secureCookie } from "../../../lib/shop/http";
import { ADMIN_COOKIE, requireSameOrigin } from "../../../lib/shop/security";
export async function POST(request: NextRequest) { return api(async () => {
  requireSameOrigin(request); const response = json({ ok: true });
  response.cookies.set(ADMIN_COOKIE, "", { path: "/api/admin", maxAge: 0, httpOnly: true, secure: secureCookie(), sameSite: "strict" }); return response;
}); }
