# Ordering verification

Verified locally on September 27, 2026. No live payment or email was sent. Temporary prices, payment instructions, stock and the test order were removed after verification. The persistent local shop is closed and empty.

- 22 automated tests passed: product validation, server totals, supported delivery, concurrent stock reservations, idempotent retries, private receipt access, stale settings and order versions, payment/fulfillment transitions, expiry, cancellation, email retry, password/session/origin protections, rate limits, payload limits and private cache headers.
- HTTP smoke checks passed against the running app: unauthenticated admin denied, missing-origin mutation denied, receipt without its cookie denied, owner login/logout, completed order persisted, stock deducted once, tampered total rejected.
- Browser journey passed: owner login → configure labelled local test settings → checkout → private receipt → submit payment reference → owner verifies payment → prepares → adds tracking → ships → completes. The customer receipt reflected the status changes.
- Desktop checkout and 390px mobile checkout/receipt inspected. No horizontal overflow at the mobile viewport. Desktop/mobile captures are local verification artifacts under `.impeccable/review/`; they display synthetic QA prices, not approved product pricing.
- Impeccable detector returned no findings. Inline visual review substituted for the final review agent after the agent became unavailable. This extends the existing Sift cream/green, Nunito/Inter design; it does not replace the landing-page visual direction.
- Backend review found no stock/concurrency issue in the reviewed service. It identified notification failures exhausting retries without dashboard visibility; the owner dashboard now shows pending and failed notification counts, and the setup guide describes recovery.

Visual review disposition: **ship** for the local checkout surface. Persistence: PRODUCT.md records the known product facts and pending owner settings. Fidelity: existing palette/type match; checkout adapts to a two-column desktop form and a single mobile column. Ceiling: readable native form controls and clear totals serve checkout. Material fixes: none remain from the captured layout review. Keep: branded typography, restrained layout, clear payment state and server-calculated amounts.

Live deployment remains unverified because no production database, payment account details, delivery settings or email credentials were provided. Real payment collection is manual GCash/bank transfer or COD; there is no online card charge, automated refund or courier booking. See ordering-setup.md for deployment and daily operation.
