export const schema = `
CREATE TABLE IF NOT EXISTS sift_shop (id integer PRIMARY KEY CHECK (id=1), settings jsonb NOT NULL);
CREATE TABLE IF NOT EXISTS sift_orders (
 id uuid PRIMARY KEY, idempotency_key uuid UNIQUE NOT NULL, fingerprint text NOT NULL,
 receipt_hash text NOT NULL, data jsonb NOT NULL, created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS sift_orders_created ON sift_orders (created_at DESC);
CREATE TABLE IF NOT EXISTS sift_events (
 id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY, order_id uuid NOT NULL REFERENCES sift_orders(id),
 event text NOT NULL, created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS sift_outbox (
 id text PRIMARY KEY, payload jsonb NOT NULL, sent_at timestamptz, attempts integer NOT NULL DEFAULT 0,
 next_attempt_at timestamptz NOT NULL DEFAULT now(), last_error text, created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS sift_rate_limits (key text PRIMARY KEY, hits integer NOT NULL, reset_at timestamptz NOT NULL);
`;
