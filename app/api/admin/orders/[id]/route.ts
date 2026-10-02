import { NextRequest } from "next/server";
import { getDatabase } from "../../../../lib/shop/database";
import { updateOrder } from "../../../../lib/shop/service";
import { api, body, json, notifyLater, requireAdmin } from "../../../../lib/shop/http";
import { requireSameOrigin } from "../../../../lib/shop/security";
export const runtime = "nodejs";
export async function PATCH(request: NextRequest, context: { params: Promise<{ id: string }> }) { return api(async () => {
  requireSameOrigin(request); requireAdmin(request); const { id } = await context.params; const db = await getDatabase();
  const order = await updateOrder(db, id, await body(request, 4096)); notifyLater(db); return json(order);
}); }
