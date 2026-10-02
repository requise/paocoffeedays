import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { PGlite } from "@electric-sql/pglite";
import { localDatabase, migrate } from "../app/lib/shop/database";
import { createOrder, saveSettings, updateOrder, getReceipt, submitReference, expireOrders, getSettings } from "../app/lib/shop/service";
import { defaultSettings, type OrderInput } from "../app/lib/shop-contract";
import { flushNotifications } from "../app/lib/shop/notifications";

const db = localDatabase(new PGlite());
const receipt = "test-only-opaque-receipt-token-123456789012345";
const input = (overrides: Partial<OrderInput> = {}): OrderInput => ({ idempotencyKey: randomUUID(), quantity: 1, expectedTotalCentavos: 56000, name: "Test Customer", email: "test@example.test", phone: "09171234567", address: "123 Test Street, Barangay Sample", city: "Test City", postalCode: "1000", zoneId: "test-zone", paymentMethod: "gcash", notes: "", ...overrides });
const configure = async (stock = 10) => saveSettings(db, { ...defaultSettings, revision: (await getSettings(db)).revision, enabled: true, priceCentavos: 50000, stock, zones: [{ id: "test-zone", name: "Test delivery", feeCentavos: 6000, cities: ["Test City"] }], methods: ["gcash", "cod"], instructions: { gcash: "TEST ONLY. Do not send payment.", bank_transfer: "" } });
before(() => migrate(db));
after(() => db.close());
test("checkout is closed until the owner supplies valid settings", async () => {
  await assert.rejects(createOrder(db, input(), receipt), /closed/i);
  await assert.rejects(saveSettings(db, { ...defaultSettings, enabled: true }), /price|delivery|payment/i);
});
test("server rejects changed totals and unsupported delivery cities without deducting stock", async () => {
  await configure();
  await assert.rejects(createOrder(db, input({ expectedTotalCentavos: 1 }), receipt), /total|price/i);
  await assert.rejects(createOrder(db, input({ city: "Elsewhere" }), receipt), /deliver/i);
  await assert.rejects(createOrder(db, input({ quantity: 0 }), receipt));
  assert.equal((await getSettings(db)).stock, 10);
});
test("a lost-response retry returns one order; changed payload cannot reuse its key", async () => {
  await configure(); const request = input();
  const a = await createOrder(db, request, receipt); const b = await createOrder(db, request, receipt);
  assert.equal(a.id, b.id); assert.equal((await getSettings(db)).stock, 9);
  await assert.rejects(createOrder(db, { ...request, name: "Different customer" }, receipt), /retry|different/i);
  assert.equal(await getReceipt(db, a.id, "wrong-token"), null);
  assert.equal((await getReceipt(db, a.id, receipt))?.reference, a.reference);
});
test("concurrent purchases cannot oversell the last tin", async () => {
  await configure(1);
  const attempts = await Promise.allSettled([createOrder(db, input(), receipt), createOrder(db, input(), receipt)]);
  assert.equal(attempts.filter(a => a.status === "fulfilled").length, 1);
  assert.equal((await getSettings(db)).stock, 0);
});
test("manual payment stays unconfirmed until owner verifies it; stale updates are rejected", async () => {
  await configure(); const order = await createOrder(db, input(), receipt);
  await assert.rejects(updateOrder(db, order.id, { action: "ship", version: 1, trackingNumber: "TEST-123" }), /paid|process/i);
  const pending = await submitReference(db, order.id, receipt, "TEST-REFERENCE");
  assert.equal(pending.paymentStatus, "reference_submitted");
  assert.equal(pending.expiresAt, null);
  await assert.rejects(updateOrder(db, order.id, { action: "mark_paid", version: 1 }), /changed|refresh/i);
  const paid = await updateOrder(db, order.id, { action: "mark_paid", version: pending.version });
  const processing = await updateOrder(db, order.id, { action: "process", version: paid.version });
  const shipped = await updateOrder(db, order.id, { action: "ship", version: processing.version, trackingNumber: "TEST-123" });
  assert.equal((await updateOrder(db, order.id, { action: "complete", version: shipped.version })).fulfillmentStatus, "completed");
});
test("cancellation restores stock once and is not allowed after confirmed payment", async () => {
  await configure(2); const order = await createOrder(db, input(), receipt);
  const cancelled = await updateOrder(db, order.id, { action: "cancel", version: order.version });
  assert.equal((await getSettings(db)).stock, 2);
  await assert.rejects(updateOrder(db, order.id, { action: "cancel", version: cancelled.version }), /cancelled/i);
  assert.equal((await getSettings(db)).stock, 2);
  const other = await createOrder(db, input(), receipt);
  const paid = await updateOrder(db, other.id, { action: "mark_paid", version: other.version });
  await assert.rejects(updateOrder(db, other.id, { action: "cancel", version: paid.version }), /refund/i);
});
test("expired unpaid reservations are released exactly once", async () => {
  await configure(1); const order = await createOrder(db, input(), receipt);
  await db.query("UPDATE sift_orders SET data=jsonb_set(data,'{expiresAt}',to_jsonb('2000-01-01T00:00:00Z'::text)) WHERE id=$1", [order.id]);
  await expireOrders(db); await expireOrders(db);
  assert.equal((await getSettings(db)).stock, 1);
  assert.equal((await getReceipt(db, order.id, receipt))?.fulfillmentStatus, "cancelled");
});

test("stale owner settings cannot overwrite stock sold since the form loaded", async () => {
  await configure(3); const stale = await getSettings(db);
  await createOrder(db, input(), receipt);
  await assert.rejects(saveSettings(db, stale), /changed|refresh/i);
  assert.equal((await getSettings(db)).stock, 2);
});

test("COD requires confirmed collection before completion", async () => {
  await configure(2); const order = await createOrder(db, input({ paymentMethod: "cod" }), receipt);
  const processing = await updateOrder(db, order.id, { action: "process", version: order.version });
  const shipped = await updateOrder(db, order.id, { action: "ship", version: processing.version, trackingNumber: "TEST-COD" });
  await assert.rejects(updateOrder(db, order.id, { action: "complete", version: shipped.version }), /payment/i);
  await assert.rejects(updateOrder(db, order.id, { action: "cancel", version: shipped.version }), /shipped/i);
  const paid = await updateOrder(db, order.id, { action: "mark_paid", version: shipped.version });
  assert.equal((await updateOrder(db, order.id, { action: "complete", version: paid.version })).fulfillmentStatus, "completed");
});

test("notification failure keeps the saved order and retries with the same provider key", async () => {
  const apiKey = process.env.RESEND_API_KEY, sender = process.env.SIFT_EMAIL_FROM;
  process.env.RESEND_API_KEY = "test-not-a-real-key"; process.env.SIFT_EMAIL_FROM = "test@example.test";
  try {
    await db.query("DELETE FROM sift_outbox");
    await configure(1); const order = await createOrder(db, input(), receipt);
    const keys: string[] = [];
    const fake: typeof fetch = async (_url, init) => { keys.push(new Headers(init?.headers).get("Idempotency-Key")!); return new Response("", { status: keys.length === 1 ? 503 : 200 }); };
    assert.deepEqual(await flushNotifications(db, 1, fake), { sent: 0, failed: 1 });
    assert.equal((await getReceipt(db, order.id, receipt))?.id, order.id);
    await db.query("UPDATE sift_outbox SET next_attempt_at=now()");
    assert.deepEqual(await flushNotifications(db, 1, fake), { sent: 1, failed: 0 });
    assert.equal(keys[0], keys[1]);
    assert.deepEqual(await flushNotifications(db, 1, fake), { sent: 0, failed: 0 });
  } finally {
    if (apiKey === undefined) delete process.env.RESEND_API_KEY; else process.env.RESEND_API_KEY = apiKey;
    if (sender === undefined) delete process.env.SIFT_EMAIL_FROM; else process.env.SIFT_EMAIL_FROM = sender;
  }
});
