import { NextRequest } from "next/server";
import { getDatabase } from "../../../../lib/shop/database";
import { getReceipt, ShopError } from "../../../../lib/shop/service";
import { api, json, notifyLater } from "../../../../lib/shop/http";
import { RECEIPT_COOKIE } from "../../../../lib/shop/security";
import { emailConfigured } from "../../../../lib/shop/notifications";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) { return api(async () => {
  const { id } = await context.params; const token = request.cookies.get(RECEIPT_COOKIE)?.value;
  if (!token) throw new ShopError("Order not found in this browser.", 404);
  const db = await getDatabase(); const order = await getReceipt(db, id, token);
  if (!order) throw new ShopError("Order not found in this browser.", 404);
  notifyLater(db); return json({ order, emailConfigured: emailConfigured() });
}); }
