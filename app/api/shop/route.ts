import { getDatabase } from "../../lib/shop/database";
import { getCatalog } from "../../lib/shop/service";
import { json, notifyLater } from "../../lib/shop/http";
import { securityConfigured } from "../../lib/shop/security";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export async function GET() {
  try {
    if (!securityConfigured()) throw new Error();
    const db = await getDatabase(); const catalog = await getCatalog(db); notifyLater(db); return json(catalog);
  } catch {
    return json({ ready: false, message: "Online ordering is being prepared. Message us to order in the meantime.", product: { name: "Saemidori × Okumidori", size: "30g · First flush · Premium grade", image: "/matchadays/sift-product-hero.png", priceCentavos: 0, stock: 0, maxQuantity: 0 }, zones: [], methods: [] });
  }
}
