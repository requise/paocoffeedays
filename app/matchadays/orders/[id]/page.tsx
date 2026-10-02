"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import { useParams } from "next/navigation";
import { money, paymentLabels, type Order } from "../../../lib/shop-contract";
import { dateTime, errorMessage, Frame, request, Status } from "../../checkout/ui";
import styles from "../../commerce.module.css";

export default function ReceiptPage() {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [emailConfigured, setEmailConfigured] = useState(false);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const load = useCallback(() => request<{ order: Order; emailConfigured: boolean }>(`/matchadays/orders/${encodeURIComponent(id)}/details`).then(result => {
    setOrder(result.order); setEmailConfigured(result.emailConfigured);
  }).catch(e => { setOrder(null); setError(errorMessage(e)); }).finally(() => setLoading(false)), [id]);
  useEffect(() => { void load(); }, [load]);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (busy) return;
    const reference = String(new FormData(event.currentTarget).get("reference") || "").trim();
    setBusy(true); setError(""); setMessage("");
    try { setOrder(await request<Order>(`/matchadays/orders/${encodeURIComponent(id)}/payment-reference`, { method: "POST", body: JSON.stringify({ reference }) })); setMessage("Reference received. Your payment will be checked by the shop."); }
    catch (e) { setError(errorMessage(e)); }
    finally { setBusy(false); }
  }
  if (!order) return <Frame><div className={styles.state}><h1>{loading ? "Opening your receipt…" : "We couldn’t open this order."}</h1>{loading ? <p role="status">Retrieving your order details.</p> : <><p className={styles.error} role="alert">{error}</p><p>This receipt is private. Open it in the browser you used to place your order.</p><button className={styles.button} onClick={() => { setLoading(true); setError(""); void load(); }}>Try again</button></>}</div></Frame>;
  const pending = order.paymentMethod !== "cod" && ["awaiting_payment", "reference_submitted"].includes(order.paymentStatus) && order.fulfillmentStatus !== "cancelled";
  return <Frame><div className={styles.toolbar}><div><h1>{order.fulfillmentStatus === "cancelled" ? "Order cancelled." : "Your order is here."}</h1><p>Reference <strong>{order.reference}</strong> · {dateTime(order.createdAt)} PHT</p></div><button className={styles.secondary} onClick={() => { setLoading(true); setError(""); void load(); }} disabled={loading || busy}>{loading ? "Refreshing…" : "Refresh status"}</button></div><Status order={order} />
    {error && <p role="alert" className={styles.error}>{error}</p>}{message && <p role="status" className={styles.success}>{message}</p>}
    <div className={styles.grid}><div><section className={styles.section}><h2>What happens next</h2>
      {order.fulfillmentStatus === "cancelled" ? <p>This order is cancelled. Please do not send a payment for this order.</p> : order.paymentStatus === "paid" ? <p>Your payment has been confirmed. Check this receipt for updates as your order is prepared and delivered.</p> : order.paymentMethod === "cod" ? <p>Your order has been received. Pay <strong>{money(order.totalCentavos)}</strong> on delivery. Check this receipt for fulfillment updates.</p> : <><p>{order.paymentStatus === "reference_submitted" ? "Your payment reference is with the shop for review. Payment is confirmed only after the shop checks the transfer." : "Your order is reserved and awaiting payment. Follow the instructions below, then send your transfer reference."}</p>{order.expiresAt && <p className={styles.notice}>Payment reservation ends <strong>{dateTime(order.expiresAt)} PHT</strong>. Refresh this page before transferring if this time has passed.</p>}</>}
      {order.trackingNumber && <p>Tracking number: <strong>{order.trackingNumber}</strong></p>}
      <p className={styles.hint}>{emailConfigured ? "Email updates are enabled. Keep this receipt as your source for the latest status." : "Email updates are not enabled. Keep this receipt and your order reference to check the latest status."} Access to this receipt stays in this browser.</p>
    </section>
    {pending && <section className={styles.section}><h2>{paymentLabels[order.paymentMethod]}</h2><p className={styles.instructions}>{order.paymentInstructions}</p><p>Amount to transfer: <strong>{money(order.totalCentavos)}</strong></p><form onSubmit={submit}><label className={styles.field}>Transfer reference<input name="reference" minLength={3} maxLength={120} defaultValue={order.paymentReference} required disabled={busy} autoComplete="off" /><span className={styles.hint}>Use the transaction or reference number from your payment app. Never enter a PIN or password.</span></label><button className={styles.button} style={{ marginTop: 16 }} disabled={busy}>{busy ? "Submitting…" : order.paymentReference ? "Update payment reference" : "Submit payment reference"}</button></form></section>}
    <section><h2>Delivery details</h2><dl className={styles.details}><div><dt>Recipient</dt><dd>{order.name}</dd></div><div><dt>Address</dt><dd>{order.address}<br />{order.city}, {order.postalCode}<br />{order.zoneName}</dd></div><div><dt>Contact</dt><dd>{order.email}<br />{order.phone}</dd></div>{order.notes && <div><dt>Delivery notes</dt><dd>{order.notes}</dd></div>}</dl></section></div>
    <aside className={styles.summary}><h2>Order summary</h2><p>Sift matcha · 30g<br />Quantity: {order.quantity}</p><dl className={styles.totals}><div><dt>{money(order.unitPriceCentavos)} × {order.quantity}</dt><dd>{money(order.unitPriceCentavos * order.quantity)}</dd></div><div><dt>Delivery</dt><dd>{money(order.shippingCentavos)}</dd></div><div className={styles.total}><dt>Total</dt><dd>{money(order.totalCentavos)}</dd></div></dl><p>{paymentLabels[order.paymentMethod]}</p>{order.paymentReference && <p className={styles.instructions}>Payment reference: <strong>{order.paymentReference}</strong></p>}</aside></div>
  </Frame>;
}
