"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { money, orderInputSchema, paymentLabels, type Catalog, type OrderInput, type PaymentMethod } from "../../lib/shop-contract";
import { ApiError, errorMessage, Frame, request, SocialOrderLinks } from "./ui";
import styles from "../commerce.module.css";

export default function CheckoutPage() {
  const router = useRouter();
  const [catalog, setCatalog] = useState<Catalog | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [needsRefresh, setNeedsRefresh] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [zoneId, setZoneId] = useState("");
  const [city, setCity] = useState("");
  const [method, setMethod] = useState<PaymentMethod | "">("");
  const retry = useRef<{ payload: string; key: string } | null>(null);
  const sending = useRef(false);
  const load = useCallback(() => request<Catalog>("/api/shop").then(fresh => {
    setCatalog(fresh); setQuantity(value => Math.max(1, Math.min(value, fresh.product.stock, fresh.product.maxQuantity)));
    setMethod(value => value && fresh.methods.includes(value) ? value : ""); setNeedsRefresh(false);
  }).catch(e => setError(errorMessage(e))).finally(() => setLoading(false)), []);
  useEffect(() => { void load(); }, [load]);
  const zone = catalog?.zones.find(item => item.id === zoneId);
  const total = (catalog?.product.priceCentavos || 0) * quantity + (zone?.feeCentavos || 0);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!catalog?.ready || !zone || !method || sending.current) return;
    if (!zone.cities.includes(city)) { setError("Choose a city from your selected delivery area."); return; }
    const values = new FormData(event.currentTarget);
    const payload = { quantity, expectedTotalCentavos: total, name: String(values.get("name") || ""), email: String(values.get("email") || ""), phone: String(values.get("phone") || ""), address: String(values.get("address") || ""), city, postalCode: String(values.get("postalCode") || ""), zoneId, paymentMethod: method, notes: String(values.get("notes") || ""), website: String(values.get("website") || "") };
    const serialized = JSON.stringify(payload);
    if (!retry.current || retry.current.payload !== serialized) retry.current = { payload: serialized, key: crypto.randomUUID() };
    const input = orderInputSchema.safeParse({ ...payload, idempotencyKey: retry.current.key });
    if (!input.success) { setError(input.error.issues[0]?.message || "Please check your order details."); return; }
    sending.current = true; setBusy(true); setError("");
    try {
      const result = await request<{ id: string; reference: string }>("/api/orders", { method: "POST", body: JSON.stringify(input.data satisfies OrderInput) });
      retry.current = null;
      router.push(`/matchadays/orders/${encodeURIComponent(result.id)}`);
    } catch (e) { setError(errorMessage(e)); setNeedsRefresh(e instanceof ApiError && e.status === 409); sending.current = false; setBusy(false); }
  }

  if (loading && !catalog) return <Frame><div className={styles.state} role="status"><h1>A little matcha, on its way.</h1><p>Checking availability…</p></div></Frame>;
  if (!catalog) return <Frame><div className={styles.state}><h1>We couldn’t load the shop.</h1><p role="alert" className={styles.error}>{error}</p><button className={styles.button} onClick={() => { setLoading(true); setError(""); void load(); }} disabled={loading}>Try again</button></div></Frame>;
  if (!catalog.ready || catalog.product.stock < 1) return <Frame><div className={styles.state}><h1>{catalog.product.stock < 1 && catalog.ready ? "This batch is sold out." : "Good things take a little time."}</h1><p>{catalog.message || "Checkout is currently closed. Please check back soon."}</p>{error && <p className={styles.error} role="alert">{error}</p>}<button className={styles.secondary} onClick={() => { setLoading(true); setError(""); void load(); }} disabled={loading}>{loading ? "Checking…" : "Check availability"}</button><SocialOrderLinks /></div></Frame>;

  return <Frame><h1>Your next matcha ritual.</h1><p className={styles.intro}>Add your delivery details and choose how to pay. You’ll receive your order reference and payment instructions after placing your order.</p>
    <form onSubmit={submit} onChange={() => { retry.current = null; }}>
      <div className={styles.grid}><div>
        <fieldset className={styles.section} disabled={busy}><legend>1. Your details</legend><div className={styles.fields}>
          <label className={`${styles.field} ${styles.full}`}>Full name<input name="name" autoComplete="name" minLength={2} maxLength={100} required /></label>
          <label className={styles.field}>Email address<input name="email" type="email" autoComplete="email" maxLength={200} required /></label>
          <label className={styles.field}>Mobile number<input name="phone" type="tel" autoComplete="tel" pattern="(\+63|0)9[0-9]{9}" maxLength={13} placeholder="09171234567" required /><span className={styles.hint}>Philippine mobile number</span></label>
        </div></fieldset>
        <fieldset className={styles.section} disabled={busy}><legend>2. Delivery</legend><div className={styles.fields}>
          <label className={`${styles.field} ${styles.full}`}>Delivery area<select value={zoneId} onChange={e => { setZoneId(e.target.value); setCity(""); }} required><option value="">Choose a supported area</option>{catalog.zones.map(item => <option key={item.id} value={item.id}>{item.name} · {money(item.feeCentavos)}</option>)}</select></label>
          <label className={styles.field}>City or municipality<select value={city} onChange={e => setCity(e.target.value)} required disabled={!zone}><option value="">Choose your city</option>{zone?.cities.map(item => <option key={item} value={item}>{item}</option>)}</select></label>
          <label className={styles.field}>Postal code<input name="postalCode" autoComplete="postal-code" inputMode="numeric" pattern="[0-9]{4}" maxLength={4} required /></label>
          <label className={`${styles.field} ${styles.full}`}>Complete street address<textarea name="address" autoComplete="street-address" minLength={8} maxLength={400} rows={3} required /><span className={styles.hint}>House or unit, street, building and barangay.</span></label>
          <label className={`${styles.field} ${styles.full}`}>Delivery notes <span className={styles.hint}>Optional</span><textarea name="notes" maxLength={500} rows={2} /></label>
        </div></fieldset>
        <fieldset className={styles.section} disabled={busy}><legend>3. Payment</legend>{catalog.methods.map(item => <label className={styles.choice} key={item}><input type="radio" name="paymentMethod" value={item} checked={method === item} onChange={() => setMethod(item)} required /><span>{paymentLabels[item]}<br /><span className={styles.hint}>{item === "cod" ? "Pay the order total when it arrives." : "Transfer after placing your order, then submit your payment reference."}</span></span></label>)}</fieldset>
        <label className={styles.hidden} aria-hidden="true">Leave this blank<input name="website" tabIndex={-1} autoComplete="off" /></label>
      </div><aside className={styles.summary} aria-label="Order summary"><h2>Your order</h2><div className={styles.product}><Image src={catalog.product.image} alt={catalog.product.name} width={95} height={95} /><div><strong>{catalog.product.name}</strong><small>{catalog.product.size}</small></div></div>
        <label className={styles.field}>Quantity<select value={quantity} disabled={busy} onChange={e => setQuantity(Number(e.target.value))}>{Array.from({ length: Math.min(catalog.product.stock, catalog.product.maxQuantity) }, (_, index) => <option key={index + 1} value={index + 1}>{index + 1}</option>)}</select></label>
        <dl className={styles.totals}><div><dt>{money(catalog.product.priceCentavos)} × {quantity}</dt><dd>{money(catalog.product.priceCentavos * quantity)}</dd></div><div><dt>Delivery</dt><dd>{zone ? money(zone.feeCentavos) : "Select area"}</dd></div><div className={styles.total}><dt>Total</dt><dd>{zone ? money(total) : "—"}</dd></div></dl>
        <p className={styles.hint}>All amounts are in Philippine pesos. Stock and your total are checked again when you place your order.</p>
        {error && <div className={styles.error} role="alert">{error}<p className={styles.hint}>If your connection dropped, retry without changing your details to safely recover the same order.</p></div>}
        {needsRefresh && <button className={`${styles.secondary} ${styles.wide}`} style={{ marginBottom: 12 }} type="button" onClick={() => { setLoading(true); setError(""); void load(); }} disabled={busy || loading}>{loading ? "Refreshing…" : "Refresh price & availability"}</button>}
        <button className={`${styles.button} ${styles.wide}`} type="submit" disabled={busy || loading || !zone || !method || needsRefresh}>{busy ? "Placing your order…" : "Place order"}</button>
        <p className={styles.hint} style={{ marginTop: 16 }}>Your details are used to arrange payment and delivery. Keep your receipt open in this browser to check your order.</p>
      </aside></div>
    </form></Frame>;
}
