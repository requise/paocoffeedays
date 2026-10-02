import { NextRequest } from "next/server";
import { orderInputSchema } from "../../lib/shop-contract";
import { getDatabase } from "../../lib/shop/database";
import { createOrder, ShopError } from "../../lib/shop/service";
import { api, body, json, notifyLater, secureCookie } from "../../lib/shop/http";
import { rateLimit, receiptToken, RECEIPT_COOKIE, requireSameOrigin, securityConfigured } from "../../lib/shop/security";
export const runtime = "nodejs";
export async function POST(request: NextRequest) { return api(async () => {
  requireSameOrigin(request);
  if (!securityConfigured()) throw new ShopError("Ordering is not configured.", 503);
  const db = await getDatabase(); await rateLimit(db, "orders:global", 100, 3600);
  const input = orderInputSchema.parse(await body(request, 8192));
  const token = receiptToken(input.idempotencyKey); const order = await createOrder(db, input, token);
  const response = json({ id: order.id, reference: order.reference }, 201);
  response.cookies.set(RECEIPT_COOKIE, token, { httpOnly: true, secure: secureCookie(), sameSite: "strict", path: `/matchadays/orders/${order.id}`, maxAge: 60 * 60 * 24 * 30 });
  notifyLater(db); return response;
}); }
