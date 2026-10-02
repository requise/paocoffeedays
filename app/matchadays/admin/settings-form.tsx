"use client";

import { useState, type FormEvent } from "react";
import { paymentLabels, paymentMethods, settingsSchema, type PaymentMethod, type ShopSettings } from "../../lib/shop-contract";
import { ApiError, errorMessage } from "../checkout/ui";
import styles from "../commerce.module.css";

type Draft = Omit<ShopSettings, "priceCentavos" | "zones" | "stock" | "maxQuantity"> & { price: string; stock: string; maxQuantity: string; zones: { id: string; name: string; fee: string; cities: string }[] };
function draftOf(settings: ShopSettings): Draft { return { ...settings, price: (settings.priceCentavos / 100).toFixed(2), stock: String(settings.stock), maxQuantity: String(settings.maxQuantity), zones: settings.zones.map(zone => ({ id: zone.id, name: zone.name, fee: (zone.feeCentavos / 100).toFixed(2), cities: zone.cities.join(", ") })) }; }
function centavos(value: string) { if (!/^\d+(?:\.\d{1,2})?$/.test(value.trim())) throw new Error("Enter prices and delivery fees in pesos, with up to two decimal places."); const [whole, fraction = ""] = value.trim().split("."); return Number(whole) * 100 + Number(fraction.padEnd(2, "0")); }

export default function SettingsForm({ settings, onSave, onReload, onDirty }: { settings: ShopSettings; onSave: (value: ShopSettings) => Promise<ShopSettings>; onReload: () => Promise<ShopSettings>; onDirty: (dirty: boolean) => void }) {
  const [draft, setDraft] = useState(() => draftOf(settings));
  const [busy, setBusy] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [stale, setStale] = useState(false);
  function edit(patch: Partial<Draft>) { setDraft(current => ({ ...current, ...patch })); setDirty(true); onDirty(true); setMessage(""); }
  function zoneEdit(index: number, patch: Partial<Draft["zones"][number]>) { edit({ zones: draft.zones.map((zone, position) => position === index ? { ...zone, ...patch } : zone) }); }
  function methodEdit(method: PaymentMethod, checked: boolean) { edit({ methods: checked ? [...draft.methods, method] : draft.methods.filter(item => item !== method) }); }
  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (busy) return;
    setError(""); setMessage("");
    try {
      const value = { revision: draft.revision, enabled: draft.enabled, priceCentavos: centavos(draft.price), stock: Number(draft.stock), maxQuantity: Number(draft.maxQuantity), zones: draft.zones.map(zone => ({ id: zone.id.trim(), name: zone.name.trim(), feeCentavos: centavos(zone.fee), cities: zone.cities.split(",").map(city => city.trim()).filter(Boolean) })), methods: draft.methods, instructions: draft.instructions, ownerEmail: draft.ownerEmail.trim() };
      const parsed = settingsSchema.safeParse(value);
      if (!parsed.success) throw new Error(parsed.error.issues[0]?.message || "Please check your settings.");
      setBusy(true); const saved = await onSave(parsed.data); setDraft(draftOf(saved)); setDirty(false); onDirty(false); setStale(false); setMessage("Shop settings saved.");
    } catch (e) { setError(errorMessage(e)); if (e instanceof ApiError && e.status === 409) setStale(true); }
    finally { setBusy(false); }
  }
  function discard() { setDraft(draftOf(settings)); setDirty(false); onDirty(false); setError(""); setMessage("Unsaved changes discarded."); }
  async function reload() {
    setBusy(true); setError("");
    try { setDraft(draftOf(await onReload())); setDirty(false); onDirty(false); setStale(false); setMessage("Latest settings loaded. Reapply any changes you still need."); }
    catch (e) { setError(errorMessage(e)); }
    finally { setBusy(false); }
  }
  return <form onSubmit={save}><fieldset disabled={busy} className={styles.section}><legend>Product & availability</legend>
    <p className={styles.intro}>Set the actual price and available stock for the 30g Sift matcha tin. Changes apply to new orders.</p>
    <div className={styles.fields}><label className={styles.field}>Price per tin (PHP)<input value={draft.price} onChange={e => edit({ price: e.target.value })} inputMode="decimal" pattern="[0-9]+(\.[0-9]{1,2})?" required /></label><label className={styles.field}>Available stock<input type="number" value={draft.stock} onChange={e => edit({ stock: e.target.value })} min={0} max={100000} step={1} required /><span className={styles.hint}>Sets the remaining stock; this is not an amount to add. Existing reservations have already been deducted.</span></label><label className={styles.field}>Maximum tins per order<input type="number" value={draft.maxQuantity} onChange={e => edit({ maxQuantity: e.target.value })} min={1} max={100} step={1} required /></label><label className={styles.field}>Owner notification email<input type="email" value={draft.ownerEmail} onChange={e => edit({ ownerEmail: e.target.value })} autoComplete="email" /><span className={styles.hint}>Optional. Email delivery also needs the server’s email service configured.</span></label></div>
  </fieldset>
  <fieldset disabled={busy} className={styles.section}><legend>Delivery areas</legend><p className={styles.intro}>Customers can only select the cities listed here. Enter fees in Philippine pesos.</p>
    {!draft.zones.length && <p className={styles.notice}>No delivery areas yet. Add at least one before opening checkout.</p>}
    {draft.zones.map((zone, index) => <div className={styles.zone} key={index}><h3>Delivery area {index + 1}</h3><div className={styles.fields}><label className={styles.field}>Area name<input value={zone.name} onChange={e => zoneEdit(index, { name: e.target.value })} minLength={2} maxLength={80} required /></label><label className={styles.field}>Delivery fee (PHP)<input value={zone.fee} onChange={e => zoneEdit(index, { fee: e.target.value })} inputMode="decimal" pattern="[0-9]+(\.[0-9]{1,2})?" required /></label><label className={`${styles.field} ${styles.full}`}>Cities or municipalities<textarea value={zone.cities} onChange={e => zoneEdit(index, { cities: e.target.value })} required /><span className={styles.hint}>Separate city names with commas.</span></label></div><div className={styles.actions}><button className={styles.danger} type="button" onClick={() => edit({ zones: draft.zones.filter((_, position) => position !== index) })}>Remove area {index + 1}</button></div></div>)}
    <button className={styles.secondary} type="button" disabled={draft.zones.length >= 20} onClick={() => edit({ zones: [...draft.zones, { id: crypto.randomUUID(), name: "", fee: "", cities: "" }] })}>Add delivery area</button>
  </fieldset>
  <fieldset disabled={busy} className={styles.section}><legend>Payment options</legend><p className={styles.intro}>Enable only the methods you accept. Manual transfers are checked by you before an order is marked paid.</p>
    {paymentMethods.map(method => <div key={method}><label className={styles.choice}><input type="checkbox" checked={draft.methods.includes(method)} onChange={e => methodEdit(method, e.target.checked)} /><span>{paymentLabels[method]}</span></label>{method !== "cod" && <label className={styles.field}>{paymentLabels[method]} instructions<textarea value={draft.instructions[method]} onChange={e => edit({ instructions: { ...draft.instructions, [method]: e.target.value } })} maxLength={1500} required={draft.enabled && draft.methods.includes(method)} /><span className={styles.hint}>Use your verified account name, account number and payment steps. These are shown on the customer’s receipt.</span></label>}</div>)}
  </fieldset>
  <fieldset disabled={busy} className={styles.section}><legend>Open checkout</legend><label className={styles.choice}><input type="checkbox" checked={draft.enabled} onChange={e => edit({ enabled: e.target.checked })} /><span>Accept new orders<br /><span className={styles.hint}>Requires a real price, delivery area and enabled payment method. Closing checkout keeps existing orders accessible.</span></span></label></fieldset>
  {error && <p className={styles.error} role="alert">{error}</p>}{stale && <div className={styles.notice}><p>Stock or settings changed while this form was open. Reload the latest settings before saving. This discards the edits currently in this form.</p><button type="button" className={styles.secondary} onClick={reload} disabled={busy}>Discard edits & reload latest settings</button></div>}{message && <p className={styles.success} role="status">{message}</p>}
  <div className={styles.actions}><button className={styles.button} disabled={busy || !dirty || stale}>{busy ? "Saving settings…" : "Save shop settings"}</button>{dirty && <button type="button" className={styles.secondary} onClick={discard} disabled={busy}>Discard changes</button>}<span className={styles.hint}>{dirty ? "Unsaved changes. Save or discard before switching views." : "No unsaved changes."}</span></div>
  </form>;
}
