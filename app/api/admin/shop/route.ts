import { NextRequest } from "next/server";
import { z } from "zod";
import { getDatabase } from "../../../lib/shop/database";
import { getSettings, listOrders, saveSettings } from "../../../lib/shop/service";
import { api, body, json, notifyLater, requireAdmin } from "../../../lib/shop/http";
import { requireSameOrigin } from "../../../lib/shop/security";
import { emailConfigured, notificationStatus } from "../../../lib/shop/notifications";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export async function GET(request: NextRequest) { return api(async () => {
  requireAdmin(request); const offset = z.coerce.number().int().min(0).max(1000000).parse(request.nextUrl.searchParams.get("offset") || 0);
  const db = await getDatabase(); const result = await listOrders(db, offset); const settings = await getSettings(db);
  const notifications = await notificationStatus(db);
  notifyLater(db); return json({ settings, ...result, notifications, emailConfigured: emailConfigured(), databaseMode: process.env.DATABASE_URL ? "postgres" : "local" });
}); }
export async function PUT(request: NextRequest) { return api(async () => {
  requireSameOrigin(request); requireAdmin(request); const db = await getDatabase();
  return json(await saveSettings(db, await body(request, 524288)));
}); }
