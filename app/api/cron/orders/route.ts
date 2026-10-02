import { getDatabase } from "../../../lib/shop/database";
import { expireOrders, ShopError } from "../../../lib/shop/service";
import { api, json } from "../../../lib/shop/http";
import { validCron } from "../../../lib/shop/security";
import { flushNotifications } from "../../../lib/shop/notifications";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export async function GET(request: Request) { return api(async () => {
  if (!validCron(request)) throw new ShopError("Unauthorized.", 401);
  const db = await getDatabase(); await expireOrders(db); await flushNotifications(db, 10); return json({ ok: true });
}); }
