# Sift ordering

## Platform
Web; existing Next.js app.

## Purpose
Sell the 30g Sift Saemidori × Okumidori matcha tin through guest checkout, with a protected owner workspace for stock, delivery settings, payment confirmation and fulfillment.

## Confirmed constraints
Preserve the Sift landing page, its supplied artwork, Nunito/Inter fonts, and the portfolio at /about. Customers can still contact the existing Instagram and Facebook accounts.

## Open business decisions
The owner has not supplied price, stock, shipping zones/fees, payment account instructions or email service credentials. These must be configured by the owner. Checkout is closed by default. No invented live prices or accounts.

## Implementation assumptions
Currency PHP and Philippine delivery. Manual GCash/bank transfer and COD are implemented as optional methods; none are enabled by default. Online gateway processing remains dependent on the owner's provider selection and account access.
