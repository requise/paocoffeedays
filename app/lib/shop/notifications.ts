import type { Database } from "./database";

type Message = { to: string; subject: string; text: string };
export const emailConfigured = () => Boolean(process.env.RESEND_API_KEY && process.env.SIFT_EMAIL_FROM);

export async function notificationStatus(db: Database) {
  const { rows } = await db.query<{ pending: number; failed: number }>("SELECT count(*) FILTER (WHERE attempts<8)::int AS pending,count(*) FILTER (WHERE attempts>=8)::int AS failed FROM sift_outbox WHERE sent_at IS NULL");
  return rows[0];
}

// The outbox is committed with the order. A leased row survives a worker crash.
export async function flushNotifications(db: Database, limit = 2, send: typeof fetch = fetch) {
  if (!emailConfigured()) return { sent: 0, failed: 0 };
  let sent = 0, failed = 0;
  for (let i = 0; i < Math.min(limit, 20); i++) {
    const item = await db.transaction(async tx => {
      const { rows } = await tx.query<{ id: string; payload: Message; attempts: number }>("SELECT id,payload,attempts FROM sift_outbox WHERE sent_at IS NULL AND attempts<8 AND next_attempt_at<=now() ORDER BY created_at FOR UPDATE SKIP LOCKED LIMIT 1");
      if (!rows[0]) return null;
      await tx.query("UPDATE sift_outbox SET attempts=attempts+1,next_attempt_at=now()+interval '5 minutes' WHERE id=$1", [rows[0].id]);
      return rows[0];
    });
    if (!item) break;
    try {
      const response = await send("https://api.resend.com/emails", { method: "POST", headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, "Content-Type": "application/json", "Idempotency-Key": item.id }, body: JSON.stringify({ from: process.env.SIFT_EMAIL_FROM, ...item.payload }), signal: AbortSignal.timeout(5000) });
      if (!response.ok) throw new Error(`Email provider returned ${response.status}`);
      await db.query("UPDATE sift_outbox SET sent_at=now(),last_error=NULL WHERE id=$1", [item.id]); sent++;
    } catch {
      // Do not persist provider responses, which may contain customer details or secrets.
      await db.query("UPDATE sift_outbox SET last_error='Delivery failed; retry scheduled',next_attempt_at=now()+($2 * interval '1 second') WHERE id=$1", [item.id, Math.min(3600, 60 * 2 ** item.attempts)]); failed++;
    }
  }
  return { sent, failed };
}
