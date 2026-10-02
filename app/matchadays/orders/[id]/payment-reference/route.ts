import { NextRequest } from "next/server";
import { z } from "zod";
import { getDatabase } from "../../../../lib/shop/database";
import { submitReference, ShopError } from "../../../../lib/shop/service";
import { api, body, json, notifyLater } from "../../../../lib/shop/http";
import { rateLimit, RECEIPT_COOKIE, requireSameOrigin } from "../../../../lib/shop/security";
export const runtime = "nodejs";
export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }) { return api(async () => {
  requireSameOrigin(request); const { id } = await context.params; const token = request.cookies.get(RECEIPT_COOKIE)?.value;
  if (!token || !z.uuid().safeParse(id).success) throw new ShopError("Order not found in this browser.", 404);
  const db = await getDatabase(); await rateLimit(db, "reference:global", 100, 3600); await rateLimit(db, `reference:${id}`, 20, 3600);
  const { reference } = z.object({ reference: z.string().trim().min(3).max(120) }).strict().parse(await body(request, 2048));
  const order = await submitReference(db, id, token, reference); notifyLater(db); return json(order);
}); }
