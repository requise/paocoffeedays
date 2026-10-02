# Sift Ordering Implementation Plan

**Goal:** Build durable guest ordering and protected owner operations, with live checkout closed until real settings are supplied.
**Architecture:** Existing Next.js UI and Node route handlers. PostgreSQL persistence in production; explicitly enabled PGlite persistence for local development only. Transactional stock changes, opaque guest receipts, password-authenticated owner sessions, and a durable notification outbox.
**Spec:** ordering-scope.md. The user instructed proceed/continue; execute the configurable application now without inventing missing commercial details.

## Constraints
- No fake payment success or live business data. Methods start disabled.
- Server recalculates PHP totals, validates delivery cities and stock.
- Database operations are serialized on one shop row; retries are idempotent.
- Every owner API verifies a signed HttpOnly session; every mutation verifies same origin.
- Customer data and payment reference are available only to the guest receipt holder or owner.
- Local file-backed storage cannot be used in production.

## Tasks
- [x] Domain contract and tests: validation, total tampering, stock, idempotency, status transitions, expiration, stock restoration.
- [x] Database/service: PostgreSQL schema, local PGlite adapter, transactional orders/settings, outbox and throttling.
- [x] Security/API: owner password hash, expiring HMAC cookie, same-origin checks, bounded payloads, opaque receipt cookies, protected settings/order handlers.
- [x] Customer interface: branded checkout, selectable supported delivery/payment, errors, confirmed receipt, payment-reference submission.
- [x] Owner interface: sign-in, price/stock/shipping/payment configuration, latest orders and explicit state actions.
- [x] Notification integration and setup: Resend text emails, durable retry queue, authenticated maintenance endpoint, setup scripts, documented deployment requirements.
- [x] Validation: integration suite against PostgreSQL-compatible PGlite, build/lint, desktop/mobile browser order journey, backend review and inline security checks (final review agent unavailable).

## Interface contract
app/lib/shop-contract.ts owns all shared types. GET /api/shop returns Catalog. POST /api/orders accepts OrderInput and returns {id,reference}; it sets a path-scoped guest receipt cookie and checkout navigates to /matchadays/orders/{id}. GET /api/admin/shop returns AdminSnapshot; PUT same URL accepts ShopSettings. PATCH /api/admin/orders/{id} accepts UpdateOrder and returns Order. POST /api/admin/login accepts {password}; POST /api/admin/logout clears session. POST /matchadays/orders/{id}/payment-reference accepts {reference}. All failures use {error:string}, with meaningful HTTP status.

## Review focus
Order retries after response loss; final-unit concurrent purchases; price changes while checkout is open; cancelled/expired order stock restoration exactly once; unauthorized state changes and receipt guessing. Exercise all in the backend suite.
