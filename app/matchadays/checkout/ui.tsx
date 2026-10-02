import Link from "next/link";
import type { ReactNode } from "react";
import type { Order } from "../../lib/shop-contract";
import styles from "../commerce.module.css";

export class ApiError extends Error {
  constructor(message: string, public status: number) { super(message); }
}

export async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(path, { ...options, cache: "no-store", headers: { "Content-Type": "application/json", ...options.headers } });
  const body = await response.json().catch(() => null);
  if (!response.ok) throw new ApiError(body?.error || "We couldn’t complete that request. Please try again.", response.status);
  return body as T;
}

export function errorMessage(error: unknown) { return error instanceof Error ? error.message : "Something went wrong. Please try again."; }
export const paymentStatus: Record<Order["paymentStatus"], string> = { awaiting_payment: "Awaiting payment", reference_submitted: "Payment under review", paid: "Paid", cod_due: "Payment due on delivery", cancelled: "Cancelled" };
export const fulfillmentStatus: Record<Order["fulfillmentStatus"], string> = { new: "Order received", processing: "Preparing your order", shipped: "Shipped", completed: "Completed", cancelled: "Cancelled" };
export function dateTime(value: string) { return new Intl.DateTimeFormat("en-PH", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Manila" }).format(new Date(value)); }

export function Frame({ children, owner = false }: { children: ReactNode; owner?: boolean }) {
  return <div className={styles.page}><header className={styles.header}><Link href="/matchadays" className={styles.brand} aria-label="Sift home">sift.</Link><Link href="/matchadays">Back to the shop</Link></header><main className={styles.main}>{children}</main><footer className={styles.footer}>Sift · worth the whisk.{owner && " Owner workspace"}</footer></div>;
}

export function Status({ order }: { order: Order }) {
  return <div className={styles.statusRow}><span className={styles.badge}>{paymentStatus[order.paymentStatus]}</span><span className={styles.badge}>{fulfillmentStatus[order.fulfillmentStatus]}</span></div>;
}

export function SocialOrderLinks() {
  return <div className={styles.actions} style={{ marginTop: 24 }}><a className={styles.button} href="https://ig.me/m/pao.coffeedays" target="_blank" rel="noopener noreferrer">Message on Instagram ↗</a><a className={styles.secondary} href="https://www.facebook.com/Pao.coffeedays" target="_blank" rel="noopener noreferrer">Order on Facebook ↗</a></div>;
}
