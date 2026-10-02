"use client";

import { useState } from "react";
import { money, paymentLabels, type Order, type UpdateOrder } from "../../lib/shop-contract";
import { dateTime, errorMessage, Status } from "../checkout/ui";
import styles from "../commerce.module.css";

export default function OrderRow({ order, onUpdate }: { order: Order; onUpdate: (id: string, update: UpdateOrder) => Promise<void> }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [tracking, setTracking] = useState(order.trackingNumber);
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [confirmPaid, setConfirmPaid] = useState(false);
  const active = order.fulfillmentStatus !== "cancelled" && order.fulfillmentStatus !== "completed";
  const canPrepare = order.paymentStatus === "paid" || order.paymentMethod === "cod";
  async function update(action: UpdateOrder["action"]) {
    if (busy) return;
    setBusy(true); setError("");
    try { await onUpdate(order.id, { version: order.version, action, ...(action === "ship" ? { trackingNumber: tracking.trim() } : {}) }); setConfirmCancel(false); setConfirmPaid(false); }
    catch (e) { setError(errorMessage(e)); }
    finally { setBusy(false); }
  }
  return <details className={styles.order}><summary><span><strong>{order.reference} · {order.name}</strong><span className={styles.hint}>{dateTime(order.createdAt)} PHT · {order.quantity} {order.quantity === 1 ? "tin" : "tins"}</span></span><span><strong>{money(order.totalCentavos)}</strong><span className={styles.hint}>View order details</span></span></summary><Status order={order} /><div className={styles.orderGrid}>
    <dl className={styles.details}><div><dt>Customer</dt><dd>{order.name}<br />{order.email}<br />{order.phone}</dd></div><div><dt>Delivery address · {order.zoneName}</dt><dd>{order.address}<br />{order.city}, {order.postalCode}</dd></div>{order.notes && <div><dt>Delivery notes</dt><dd>{order.notes}</dd></div>}<div><dt>Tracking number</dt><dd>{order.trackingNumber || "Not added"}</dd></div></dl>
    <div><dl className={styles.details}><div><dt>Payment method</dt><dd>{paymentLabels[order.paymentMethod]}</dd></div><div><dt>Transfer reference</dt><dd>{order.paymentReference || "Not submitted"}</dd></div>{order.expiresAt && <div><dt>Reservation expires</dt><dd>{dateTime(order.expiresAt)} PHT</dd></div>}{order.paymentInstructions && <div><dt>Payment instructions sent to customer</dt><dd>{order.paymentInstructions}</dd></div>}</dl><dl className={styles.totals}><div><dt>{money(order.unitPriceCentavos)} × {order.quantity}</dt><dd>{money(order.unitPriceCentavos * order.quantity)}</dd></div><div><dt>Delivery</dt><dd>{money(order.shippingCentavos)}</dd></div><div className={styles.total}><dt>Total</dt><dd>{money(order.totalCentavos)}</dd></div></dl></div>
  </div>
  {error && <p className={styles.error} role="alert">{error}</p>}
  {active && <div>
    {order.fulfillmentStatus === "processing" && <label className={styles.field} style={{ maxWidth: 440, marginBottom: 16 }}>Tracking number<input value={tracking} onChange={e => setTracking(e.target.value)} maxLength={150} disabled={busy} /><span className={styles.hint}>Add the carrier’s tracking number before marking the order shipped.</span></label>}
    <div className={styles.actions}>
      {order.paymentStatus !== "paid" && order.paymentStatus !== "cancelled" && <button className={styles.secondary} disabled={busy} onClick={() => { setConfirmPaid(true); setConfirmCancel(false); }}>Confirm payment received</button>}
      {order.fulfillmentStatus === "new" && canPrepare && <button className={styles.button} disabled={busy} onClick={() => update("process")}>Start preparing</button>}
      {order.fulfillmentStatus === "processing" && <button className={styles.button} disabled={busy || !tracking.trim()} onClick={() => update("ship")}>Mark shipped</button>}
      {order.fulfillmentStatus === "shipped" && order.paymentStatus === "paid" && <button className={styles.button} disabled={busy} onClick={() => update("complete")}>Mark completed</button>}
      {["new", "processing"].includes(order.fulfillmentStatus) && <button className={styles.danger} disabled={busy || order.paymentStatus === "paid"} onClick={() => { setConfirmCancel(true); setConfirmPaid(false); }}>Cancel order</button>}
    </div>
    {order.paymentStatus === "paid" && <p className={styles.hint} style={{ marginTop: 12 }}>Paid orders cannot be cancelled here. Contact the customer and arrange any refund manually.</p>}
    {confirmPaid && <div className={styles.notice}><p>Confirm you have received <strong>{money(order.totalCentavos)}</strong> for <strong>{order.reference}</strong>. A submitted reference alone is not proof of payment.</p><div className={styles.actions}><button className={styles.button} disabled={busy} onClick={() => update("mark_paid")}>{busy ? "Updating…" : "Yes, payment received"}</button><button className={styles.secondary} disabled={busy} onClick={() => setConfirmPaid(false)}>Keep current status</button></div></div>}
    {confirmCancel && <div className={styles.notice}><p>Cancel <strong>{order.reference}</strong> and return {order.quantity} {order.quantity === 1 ? "tin" : "tins"} to available stock? {order.paymentStatus === "paid" && "Any refund must be arranged separately; cancelling does not send a refund."}</p><div className={styles.actions}><button className={styles.danger} disabled={busy} onClick={() => update("cancel")}>{busy ? "Cancelling…" : "Yes, cancel this order"}</button><button className={styles.secondary} disabled={busy} onClick={() => setConfirmCancel(false)}>Keep order</button></div></div>}
  </div>}
  </details>;
}
