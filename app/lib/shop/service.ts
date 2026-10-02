import { createHash, randomUUID, timingSafeEqual } from "node:crypto";
import { z } from "zod";
import { defaultSettings, money, orderInputSchema, settingsSchema, updateOrderSchema, type Order, type ShopSettings, type Catalog } from "../shop-contract";
import type { Database, Sql } from "./database";

export class ShopError extends Error { constructor(message: string, public status = 400) { super(message); } }
const hash = (s: string) => createHash("sha256").update(s).digest("hex");
const authorized = (token: string, stored: string) => stored.length === 64 && timingSafeEqual(Buffer.from(hash(token)), Buffer.from(stored));
async function settings(tx: Sql, lock = false) {
  const { rows } = await tx.query<{ settings: ShopSettings }>(`SELECT settings FROM sift_shop WHERE id=1${lock ? " FOR UPDATE" : ""}`);
  if (!rows[0]) throw new ShopError("Shop setup is incomplete.", 503);
  return { ...defaultSettings, ...rows[0].settings };
}
async function writeSettings(tx: Sql, s: ShopSettings) {
  s.revision++; await tx.query("UPDATE sift_shop SET settings=$1::jsonb WHERE id=1", [JSON.stringify(s)]);
}
export const getSettings = (db: Database) => settings(db);
export async function saveSettings(db: Database, input: unknown) {
  const parsed = settingsSchema.parse(input);
  return db.transaction(async tx => {
    const current = await settings(tx, true);
    if (parsed.revision !== current.revision) throw new ShopError("Stock or settings changed. Refresh before saving.", 409);
    await writeSettings(tx, parsed); return parsed;
  });
}
async function record(tx: Sql, o: Order, event: string, ownerEmail: string) {
  await tx.query("INSERT INTO sift_events(order_id,event) VALUES($1,$2)", [o.id, event]);
  const site = process.env.PUBLIC_SITE_URL || "http://localhost:3100";
  const text = `Sift order ${o.reference}\n${event}\nQuantity: ${o.quantity}\nTotal: ${money(o.totalCentavos)}\nPayment: ${o.paymentStatus.replaceAll("_", " ")}\nOrder: ${o.fulfillmentStatus}\n${o.trackingNumber ? `Tracking: ${o.trackingNumber}\n` : ""}Keep your order receipt open in the browser you ordered from. Contact us on Instagram: https://ig.me/m/pao.coffeedays`;
  for (const [role, recipient] of [["customer", o.email], ["owner", ownerEmail]]) {
    if (!recipient) continue;
    await tx.query("INSERT INTO sift_outbox(id,payload) VALUES($1,$2::jsonb) ON CONFLICT DO NOTHING", [`${o.id}:${o.version}:${role}`, JSON.stringify({ to: recipient, subject: `Sift · ${o.reference} · ${event}`, text: role === "owner" ? `${text}\nManage orders: ${site}/matchadays/admin` : text })]);
  }
}
async function writeOrder(tx: Sql, o: Order, event: string, owner: string) {
  await tx.query("UPDATE sift_orders SET data=$2::jsonb WHERE id=$1", [o.id, JSON.stringify(o)]);
  await record(tx, o, event, owner);
}
async function expire(tx: Sql, s: ShopSettings) {
  const { rows } = await tx.query<{ data: Order }>("SELECT data FROM sift_orders WHERE data->>'paymentStatus'='awaiting_payment' AND (data->>'expiresAt')::timestamptz <= now() FOR UPDATE");
  for (const { data: o } of rows) {
    o.paymentStatus = "cancelled"; o.fulfillmentStatus = "cancelled"; o.expiresAt = null; o.version++;
    s.stock += o.quantity; await writeOrder(tx, o, "Unpaid reservation expired", s.ownerEmail);
  }
  if (rows.length) await writeSettings(tx, s);
}
export async function expireOrders(db: Database) { await db.transaction(async tx => { const s = await settings(tx, true); await expire(tx, s); }); }
export async function getCatalog(db: Database): Promise<Catalog> {
  await expireOrders(db); const s = await getSettings(db);
  return { ready: s.enabled && s.stock > 0, message: !s.enabled ? "Online ordering is being prepared. Message us to order in the meantime." : s.stock < 1 ? "This batch is sold out. Message us about the next one." : "", product: { name: "Saemidori × Okumidori", size: "30g · First flush · Premium grade", image: "/matchadays/sift-product-hero.png", priceCentavos: s.priceCentavos, stock: s.stock, maxQuantity: Math.min(s.maxQuantity, s.stock) }, zones: s.zones, methods: s.methods };
}
export async function createOrder(db: Database, input: unknown, receiptToken: string): Promise<Order> {
  const v = orderInputSchema.parse(input); const fingerprint = hash(JSON.stringify(v));
  return db.transaction(async tx => {
    const s = await settings(tx, true);
    const existing = await tx.query<{ data: Order; fingerprint: string; receipt_hash: string }>("SELECT data,fingerprint,receipt_hash FROM sift_orders WHERE idempotency_key=$1", [v.idempotencyKey]);
    if (existing.rows[0]) {
      const old = existing.rows[0];
      if (old.fingerprint !== fingerprint || !authorized(receiptToken, old.receipt_hash)) throw new ShopError("This retry key belongs to a different request. Please refresh checkout.", 409);
      return old.data;
    }
    await expire(tx, s);
    if (!s.enabled) throw new ShopError("Online ordering is currently closed.", 409);
    const zone = s.zones.find(zone => zone.id === v.zoneId);
    if (!zone || !zone.cities.some(city => city.toLowerCase() === v.city.toLowerCase())) throw new ShopError("We cannot deliver to that city with the selected delivery option.");
    if (!s.methods.includes(v.paymentMethod)) throw new ShopError("That payment method is unavailable. Refresh checkout.", 409);
    if (v.quantity > s.maxQuantity || v.quantity > s.stock) throw new ShopError("There is not enough stock for this quantity. Refresh checkout.", 409);
    const total = s.priceCentavos * v.quantity + zone.feeCentavos;
    if (total !== v.expectedTotalCentavos) throw new ShopError("The total has changed. Refresh checkout and review the new price.", 409);
    const id = randomUUID(); const now = new Date();
    const o: Order = { id, reference: `SIFT-${now.toISOString().slice(0,10).replaceAll("-", "")}-${id.slice(0,8).toUpperCase()}`, createdAt: now.toISOString(), quantity: v.quantity, unitPriceCentavos: s.priceCentavos, shippingCentavos: zone.feeCentavos, totalCentavos: total, name: v.name, email: v.email, phone: v.phone, address: v.address, city: v.city, postalCode: v.postalCode, zoneName: zone.name, notes: v.notes, paymentMethod: v.paymentMethod, paymentStatus: v.paymentMethod === "cod" ? "cod_due" : "awaiting_payment", fulfillmentStatus: "new", paymentReference: "", paymentInstructions: v.paymentMethod === "cod" ? "Please prepare the exact total for your delivery." : s.instructions[v.paymentMethod], trackingNumber: "", expiresAt: v.paymentMethod === "cod" ? null : new Date(now.getTime() + 24*60*60*1000).toISOString(), version: 1 };
    await tx.query("INSERT INTO sift_orders(id,idempotency_key,fingerprint,receipt_hash,data) VALUES($1,$2,$3,$4,$5::jsonb)", [id, v.idempotencyKey, fingerprint, hash(receiptToken), JSON.stringify(o)]);
    s.stock -= v.quantity; await writeSettings(tx, s); await record(tx, o, "Order received", s.ownerEmail); return o;
  });
}
async function row(tx: Sql, id: string) {
  if (!z.uuid().safeParse(id).success) throw new ShopError("Order not found.", 404);
  const { rows } = await tx.query<{ data: Order; receipt_hash: string }>("SELECT data,receipt_hash FROM sift_orders WHERE id=$1", [id]);
  if (!rows[0]) throw new ShopError("Order not found.", 404); return rows[0];
}
export async function getReceipt(db: Database, id: string, token: string): Promise<Order|null> {
  if (!z.uuid().safeParse(id).success) return null;
  await expireOrders(db);
  try { const r = await row(db, id); return authorized(token, r.receipt_hash) ? r.data : null; }
  catch (e) { if (e instanceof ShopError && e.status === 404) return null; throw e; }
}
export async function submitReference(db: Database, id: string, token: string, reference: string) {
  const ref = z.string().trim().min(3).max(120).parse(reference);
  return db.transaction(async tx => {
    const s = await settings(tx, true); await expire(tx, s); const r = await row(tx, id);
    if (!authorized(token, r.receipt_hash)) throw new ShopError("Order not found.", 404);
    const o = r.data;
    if (!["awaiting_payment", "reference_submitted"].includes(o.paymentStatus)) throw new ShopError("This order is no longer awaiting a payment reference.", 409);
    o.paymentReference = ref; o.paymentStatus = "reference_submitted"; o.expiresAt = null; o.version++;
    await writeOrder(tx, o, "Payment reference submitted — awaiting verification", s.ownerEmail); return o;
  });
}
export async function updateOrder(db: Database, id: string, input: unknown) {
  const v = updateOrderSchema.parse(input);
  return db.transaction(async tx => {
    const s = await settings(tx, true); await expire(tx, s); const o = (await row(tx, id)).data;
    if (o.version !== v.version) throw new ShopError("This order changed. Refresh before updating it.", 409);
    if (o.fulfillmentStatus === "cancelled" || o.fulfillmentStatus === "completed") throw new ShopError(`This order is already ${o.fulfillmentStatus}.`, 409);
    if (v.action === "mark_paid") {
      if (o.paymentStatus === "paid") throw new ShopError("Payment is already confirmed.", 409);
      o.paymentStatus = "paid"; o.expiresAt = null;
    } else if (v.action === "process") {
      if (o.fulfillmentStatus !== "new" || !["paid", "cod_due"].includes(o.paymentStatus)) throw new ShopError("Only a paid or COD new order can be processed.", 409);
      o.fulfillmentStatus = "processing";
    } else if (v.action === "ship") {
      if (o.fulfillmentStatus !== "processing" || !["paid", "cod_due"].includes(o.paymentStatus) || !v.trackingNumber) throw new ShopError("Process a paid or COD order and add tracking before shipping.", 409);
      o.fulfillmentStatus = "shipped"; o.trackingNumber = v.trackingNumber;
    } else if (v.action === "complete") {
      if (o.fulfillmentStatus !== "shipped" || o.paymentStatus !== "paid") throw new ShopError("Ship the order and confirm payment before completing it.", 409);
      o.fulfillmentStatus = "completed";
    } else {
      if (o.paymentStatus === "paid") throw new ShopError("A paid order needs a refund handled directly before cancellation. Contact the customer.", 409);
      if (o.fulfillmentStatus === "shipped") throw new ShopError("A shipped order cannot be cancelled here.", 409);
      o.fulfillmentStatus = "cancelled"; o.paymentStatus = "cancelled"; o.expiresAt = null;
      s.stock += o.quantity; await writeSettings(tx, s);
    }
    o.version++; await writeOrder(tx, o, `Order updated: ${v.action.replaceAll("_", " ")}`, s.ownerEmail); return o;
  });
}
export async function listOrders(db: Database, offset = 0) {
  await expireOrders(db);
  const { rows } = await db.query<{ data: Order }>("SELECT data FROM sift_orders ORDER BY created_at DESC,id DESC LIMIT 51 OFFSET $1", [offset]);
  return { orders: rows.slice(0,50).map(r => r.data), hasMore: rows.length > 50 };
}
