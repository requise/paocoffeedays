# Sift ordering: implementation brief

This records the initial proposal. The implementation and final operating choices are documented in `ordering-setup.md` and verified in `ordering-verification.md`. The shipped local version uses PostgreSQL/PGlite and a protected single-owner workspace; no Supabase or payment gateway connection was provisioned.

## Intended outcome
Replace the Instagram/Facebook-only order handoff with a working single-product checkout for the 30g Sift Saemidori × Okumidori tin. Preserve the current Sift visual design and the portfolio at /about.

## Confirmed project state
- Next.js 16 App Router, React 19, TypeScript.
- The current order buttons link to an on-page social ordering section.
- There are no checkout endpoints, order database, authentication service, payment integration or environment configuration files in this workspace.
- Existing product images and Nunito/Inter typography can be reused.

## Proposed customer flow
1. Choose quantity and see the actual product price.
2. Enter name, contact information and delivery address.
3. Choose a supported delivery option; review the complete total before placing the order.
4. Pay through the selected method.
5. Receive an order reference and clear payment/fulfillment status.

Guest checkout is the proposed default; customers should not need an account to buy one product.

## Proposed operations
- Durable database storage for products, inventory, orders, order items, payment references and status history.
- Server-side validation and price/shipping calculations; never accept a browser-submitted total as authoritative.
- Idempotent order submission to prevent duplicate orders on retries.
- Transactional inventory checks to prevent overselling.
- Protected owner dashboard if requested: view orders, manage fulfillment and inventory, and confirm manual payments.
- Keep payment and fulfillment statuses separate.
- Customer confirmations and owner notifications through a configured email service; notification failures must not lose the saved order.
- If a payment gateway is selected, use its hosted payment UI and authenticated webhook events. A redirect back to the site alone must not mark an order paid.
- If manual transfers are selected, show the supplied business payment instructions and retain an awaiting-payment status until the owner confirms payment.
- Social contact links remain available for help.

## Proposed technical direction
Keep checkout in the existing Next.js application. Use a managed PostgreSQL database and established authentication rather than ephemeral files in the web deployment. Supabase is a candidate because its official Next.js integration supports database access and authentication; the actual service connection is not configured yet.

References:
- [Next.js authentication](https://nextjs.org/docs/app/guides/authentication)
- [Next.js forms and server validation](https://nextjs.org/docs/app/guides/forms)
- [Supabase Next.js integration](https://supabase.com/docs/guides/getting-started/quickstarts/nextjs)
- [Supabase row-level security](https://supabase.com/docs/guides/database/postgres/row-level-security)

## Business inputs required before finalizing the design
- Selling price and currency, initial stock and quantity limits.
- Supported delivery areas, fees, and whether pickup is offered.
- Payment method/provider and the business account to receive payment.
- Notification email and whether the owner wants an order dashboard.
- Access to the chosen database, payment and email services and the production deployment when connecting the live checkout.

These are unresolved business inputs, not assumed values. Do not accept live orders or advertise a completed payment until the corresponding services are configured and verified.

## Acceptance checks
- Customer can submit a valid order and see its persisted confirmation.
- Invalid quantity, unsupported delivery area and manipulated prices are rejected.
- Duplicate submissions do not create duplicate orders.
- Concurrent purchases cannot oversell available stock.
- Unauthorized users cannot read customer orders or perform owner actions.
- Payment success/failure/cancellation and repeated webhook delivery behave correctly for the chosen provider.
- Mobile checkout, keyboard interaction, errors and recovery are verified.
- A complete order is verified in the deployment before calling the system operational.
