"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import { type AdminSnapshot, type Order, type ShopSettings, type UpdateOrder } from "../../lib/shop-contract";
import { ApiError, errorMessage, Frame, request } from "../checkout/ui";
import SettingsForm from "./settings-form";
import OrderRow from "./order-row";
import styles from "../commerce.module.css";

export default function AdminPage() {
  const [snapshot, setSnapshot] = useState<AdminSnapshot | null>(null);
  const [loading, setLoading] = useState(true);
  const [signedOut, setSignedOut] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [tab, setTab] = useState<"orders" | "settings">("orders");
  const [filter, setFilter] = useState("active");
  const [dirty, setDirty] = useState(false);
  const [offset, setOffset] = useState(0);
  const [loadingMore, setLoadingMore] = useState(false);
  const expireSession = useCallback((e: unknown) => {
    if (e instanceof ApiError && e.status === 401) { setSnapshot(null); setSignedOut(true); setDirty(false); return true; } return false;
  }, []);
  const load = useCallback(() => request<AdminSnapshot>("/api/admin/shop").then(fresh => {
    setSnapshot(fresh); setOffset(fresh.orders.length); setSignedOut(false);
  }).catch(e => { if (!expireSession(e)) setError(errorMessage(e)); }).finally(() => setLoading(false)), [expireSession]);
  useEffect(() => { void load(); }, [load]);

  async function login(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (busy) return;
    const password = String(new FormData(event.currentTarget).get("password") || "");
    setBusy(true); setError("");
    try { await request("/api/admin/login", { method: "POST", body: JSON.stringify({ password }) }); await load(); }
    catch (e) { setError(errorMessage(e)); }
    finally { setBusy(false); }
  }
  async function logout() {
    setBusy(true); setError("");
    try { await request("/api/admin/logout", { method: "POST" }); setSnapshot(null); setSignedOut(true); setDirty(false); }
    catch (e) { if (!expireSession(e)) setError(errorMessage(e)); }
    finally { setBusy(false); }
  }
  async function saveSettings(settings: ShopSettings) {
    try { const saved = await request<ShopSettings>("/api/admin/shop", { method: "PUT", body: JSON.stringify(settings) }); setSnapshot(current => current ? { ...current, settings: saved } : current); return saved; }
    catch (e) { expireSession(e); throw e; }
  }
  async function reloadSettings() {
    try { const fresh = await request<AdminSnapshot>("/api/admin/shop"); setSnapshot(fresh); setOffset(fresh.orders.length); return fresh.settings; }
    catch (e) { expireSession(e); throw e; }
  }
  async function loadMore() {
    if (loadingMore) return;
    setLoadingMore(true); setError("");
    try {
      const next = await request<AdminSnapshot>(`/api/admin/shop?offset=${offset}`);
      setSnapshot(current => current ? { ...next, orders: [...current.orders, ...next.orders.filter(order => !current.orders.some(existing => existing.id === order.id))] } : next);
      setOffset(value => value + next.orders.length);
    } catch (e) { if (!expireSession(e)) setError(errorMessage(e)); }
    finally { setLoadingMore(false); }
  }
  async function updateOrder(id: string, update: UpdateOrder) {
    try {
      const order = await request<Order>(`/api/admin/orders/${encodeURIComponent(id)}`, { method: "PATCH", body: JSON.stringify(update) });
      setSnapshot(current => current ? { ...current, orders: current.orders.map(item => item.id === id ? order : item) } : current);
      await load();
    } catch (e) { if (!expireSession(e) && e instanceof ApiError && e.status === 409) await load(); throw e; }
  }
  if (loading && !snapshot && !signedOut) return <Frame owner><div className={styles.state} role="status"><h1>Owner workspace</h1><p>Checking your session…</p></div></Frame>;
  if (!snapshot) return <Frame owner><div className={`${styles.state} ${styles.small}`}><h1>Owner workspace</h1><p className={styles.intro}>Sign in to manage Sift orders, stock and checkout settings.</p>{error && <p role="alert" className={styles.error}>{error}</p>}{signedOut ? <form onSubmit={login}><label className={styles.field}>Owner password<input name="password" type="password" autoComplete="current-password" required disabled={busy} /></label><button className={`${styles.button} ${styles.wide}`} style={{ marginTop: 20 }} disabled={busy}>{busy ? "Signing in…" : "Sign in"}</button></form> : <button className={styles.button} onClick={() => { setLoading(true); setError(""); void load(); }} disabled={loading}>Try again</button>}</div></Frame>;
  const notificationCounts = snapshot.notifications ?? { pending: 0, failed: 0 };
  const orders = snapshot.orders.filter(order => filter === "all" || (filter === "active" ? !["cancelled", "completed"].includes(order.fulfillmentStatus) : order.fulfillmentStatus === filter));
  return <Frame owner><div className={styles.toolbar}><div><h1>Owner workspace</h1><span className={styles.badge}>{snapshot.settings.enabled ? "Checkout open" : "Checkout closed"}</span></div><div className={styles.actions}>{tab === "orders" && <button className={styles.secondary} onClick={() => { setLoading(true); setError(""); void load(); }} disabled={loading || busy}>{loading ? "Refreshing…" : "Refresh orders"}</button>}<button className={styles.secondary} onClick={logout} disabled={busy || dirty}>{busy ? "Signing out…" : "Sign out"}</button></div></div>
    {error && <p role="alert" className={styles.error}>{error}</p>}
    {(snapshot.databaseMode === "local" || !snapshot.emailConfigured) && <div className={styles.notice}>{snapshot.databaseMode === "local" && <p>Local development storage. These orders are for this local installation.</p>}{!snapshot.emailConfigured && <p>Email delivery is not configured. Review new orders here; customers can check their receipt in their browser.</p>}</div>}
    <div aria-live="polite">{snapshot.emailConfigured && notificationCounts.pending > 0 && <p className={styles.notice}>{notificationCounts.pending} email updates are queued for delivery.</p>}{notificationCounts.failed > 0 && <p className={styles.error}>{notificationCounts.failed} email updates could not be sent after repeated attempts. Contact customers directly and ask your site administrator to check the email service and retry failed messages.</p>}</div><nav className={styles.tabs} aria-label="Owner workspace views"><button aria-pressed={tab === "orders"} onClick={() => setTab("orders")} disabled={dirty}>Orders</button><button aria-pressed={tab === "settings"} onClick={() => setTab("settings")}>Shop settings</button></nav>
    {tab === "settings" ? <SettingsForm settings={snapshot.settings} onSave={saveSettings} onReload={reloadSettings} onDirty={setDirty} /> : <section aria-label="Orders"><div className={styles.toolbar}><h2>Orders</h2><label className={styles.field}>Show<select value={filter} onChange={e => setFilter(e.target.value)}><option value="active">Active orders</option><option value="all">All orders</option><option value="completed">Completed</option><option value="cancelled">Cancelled</option></select></label></div>{orders.length ? orders.map(order => <OrderRow key={order.id} order={order} onUpdate={updateOrder} />) : <div className={styles.state}><h3>{snapshot.orders.length ? "No orders in this view." : "Your first order will appear here."}</h3><p>{snapshot.orders.length ? "Choose another filter to see more orders." : "Set your price, stock, delivery areas and payment methods in Shop settings when you’re ready to open checkout."}</p></div>}{snapshot.hasMore && <div className={styles.notice}><p>More orders are available. Load older orders to include them in this view.</p><button className={styles.secondary} onClick={loadMore} disabled={loadingMore || loading}>{loadingMore ? "Loading older orders…" : "Load older orders"}</button></div>}</section>}
  </Frame>;
}
