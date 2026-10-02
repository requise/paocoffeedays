# Sift ordering

The site now has guest checkout at `/matchadays/checkout`, a private receipt with payment instructions and order status, and an owner workspace at `/matchadays/admin`. Instagram and Facebook ordering remain available. Checkout starts closed: no product price, inventory, delivery areas or payment accounts have been invented.

## Use locally

1. Run `npm install`, then `npm run shop:setup`.
2. Run `npm run dev -- --port 3100`.
3. Open `http://localhost:3100/matchadays/admin`. The generated owner password is in `.data/admin-access.txt`. This file, the local database and `.env.local` are excluded from Git.
4. In Shop settings, enter the actual price in pesos, available stock, maximum tins per order, supported cities and delivery fees. Enable the payment methods you accept and enter real GCash/bank instructions. Save and open checkout when ready.

This workspace's current preview uses port **3101**, because 3100 belongs to another local project. Open `http://localhost:3101/matchadays/admin` and use `npm run dev -- --port 3101` here. `PUBLIC_SITE_URL` in `.env.local` must match the origin used in your browser.

Local storage uses PGlite, a persistent local PostgreSQL-compatible database in `.data/sift-orders`. Run one development server against it. Do not use it for a public production deployment. For tests, use an isolated database and clearly labelled test orders. Never send payment to test instructions.

## Publish with real ordering

Use the existing Next.js hosting provider with Node.js support. A static export cannot run ordering.

1. Provision persistent PostgreSQL with backups. Set `DATABASE_URL` in the host's private environment configuration, using the provider's TLS connection string. Database migrations are additive and do not reset existing data.
2. Generate unique production credentials with `npm run shop:setup -- --production` in a separate private environment, or generate equivalent random secrets. Set `SIFT_SESSION_SECRET` (at least 32 characters), `SIFT_ADMIN_PASSWORD_HASH` (`salt:scrypt(password,salt,64)` in hex), and `CRON_SECRET` (at least 32 characters). Do not reuse demo credentials. The hash salt is a random hex string. Rotating the password hash invalidates owner sessions; rotating the session secret also invalidates guest receipt cookies.
3. Set `PUBLIC_SITE_URL` to the site's exact HTTPS origin. Do not include a path. Configure the application behind HTTPS and do not enable local database mode. No secrets may use the `NEXT_PUBLIC_` prefix.
4. With these environment values loaded, run `npm run shop:migrate`, `npm test`, `npm run lint`, and `npm run build`, then deploy.
5. Open the owner workspace and enter the real business settings. Test a complete order, payment confirmation and fulfillment before enabling public checkout. Configure hosting access logs so they do not record request bodies or cookies.
6. Schedule a request every five minutes to `GET /api/cron/orders` with `Authorization: Bearer <CRON_SECRET>` using your host's scheduler. The job releases expired unpaid reservations and drains queued email notifications. The request must have the secret header; do not put it in a URL. Run frequently enough to handle the shop's message volume.

Owner authentication, mutation origin checks and durable application rate limits are built in. Add host-level bot protection and IP rate limits before public launch; application limits deliberately do not trust arbitrary forwarded-IP headers. Restrict owner access operationally to the shop's staff and keep the owner password in a password manager.

## Payments and daily operation

- GCash and bank transfer are **manual transfers**. Customers see instructions after placing an order and submit a transaction reference. References never automatically mark orders paid. Verify the actual funds in your own account before confirming payment in the dashboard.
- Unpaid manual orders reserve stock for 24 hours. A submitted payment reference stops expiry while the owner reviews it. Review those references promptly to avoid indefinite reservations.
- Cash on delivery is optional. It can be prepared and shipped before payment is collected; mark paid after collection, then complete the order.
- Prepare an eligible order, add its courier/tracking reference, mark shipped, then complete it after payment and delivery. Arrange the actual courier separately; shipping labels and courier bookings are not automated.
- Cancelling an unpaid, unshipped order restores its stock once. Paid orders need a refund resolved directly with the customer; this version does not execute refunds or allow a paid order to be cancelled in the dashboard.
- If stock changes while Shop settings is open, saving is rejected. Reload current settings before making another change. Stock means tins still available, excluding existing reservations.
- Refresh orders to see new purchases. Older orders are paginated. The receipt works in the customer's original browser for 30 days; customers who lose browser access can contact you with their order reference. Do not share customer details based only on the public reference.
- Back up the database and regularly review access and order retention. Orders contain customer contact and delivery information. Deleting or anonymizing historical records should follow the shop's chosen retention policy and preserve necessary accounting records.

## Optional email notifications

Set `RESEND_API_KEY` and `SIFT_EMAIL_FROM` using a verified sending domain, and add the owner's email in Shop settings. Customers and the owner receive order and status notifications. Without these values, orders still save and the receipt/dashboard remain the source of truth; the UI explicitly says email is unavailable.

Messages are queued transactionally and retried with stable provider idempotency keys. The worker leases jobs, tries at most eight times, and does not log message content. Inspect failed delivery using `SELECT id,attempts,last_error FROM sift_outbox WHERE sent_at IS NULL` and your provider dashboard. After correcting configuration, reset failed jobs' `attempts` to 0 and `next_attempt_at` to `now()` to retry. Only retry known failures: an uncertain provider response older than the provider's idempotency retention can produce a duplicate email. Queued messages accumulated while email was disabled will send once enabled.

API reference: [Resend sending](https://resend.com/docs/api-reference/emails/send-email) and [idempotency](https://resend.com/docs/dashboard/emails/idempotency-keys). No live provider request is required for automated tests; the test transport is mocked.

## Verification

`npm test` covers stock concurrency, duplicate retries, server totals, delivery validation, stale owner saves, payment and fulfillment transitions, reservation expiry, receipt access, email retry and security behavior. `npm run lint` and `npm run build` check the application. Production PostgreSQL connectivity, the chosen email domain and real transfer/COD operations must be tested in the configured deployment before launch.
