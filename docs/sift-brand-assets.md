# Sift visual assets

The supplied brand board is preserved in public/matchadays/sift-brand-board.png. The Sift wordmark and dancing cat are displayed as responsive crops of this source, preserving the original artwork. Crop coordinates live in app/matchadays/page.tsx and use the original 1214 × 1295 canvas. The standalone decorative spark graphics have been removed from the page.

The three small ritual photo crops have been replaced by full-resolution, 1254 × 1254 reference-inspired photos from the built-in ImageGen tool: public/matchadays/ritual-scoop.png, public/matchadays/ritual-whisk.png and public/matchadays/ritual-enjoy.png. Responsive next/image sizing avoids enlarging the tiny original crops. Prompts are recorded in sift-ritual-prompts.json.

## Ordering

The announcement bar, header, hero and product CTAs lead to #order. Customers can open Instagram messages at https://ig.me/m/pao.coffeedays or the existing Facebook page at https://www.facebook.com/Pao.coffeedays. The page clearly labels online checkout as coming soon; no payment or checkout form is implemented.

The product hero is public/matchadays/sift-product-hero.png, adapted from the board with the built-in ImageGen tool. Original generated image remains in the Codex generated_images directory.

## ImageGen prompt

Use case: precise-object-edit. Input image is the supplied Sift brand board, the edit target. Extract and expand ONLY the central product photograph (the tilted silver Sift matcha tin with green powder floating behind it) into a standalone high-resolution square website product hero photo. Preserve the exact tin design, red side panel, dark green front label, cream Sift logo, tiny cat mascot, Saemidori Okumidori cultivar and 30g packaging. Photorealistic aluminum, warm cream studio background #F8F5EB, small natural floating matcha powder to the left, gentle grounding shadow. The full tin is visible and fills roughly 72% of image height, centered. Remove all surrounding website UI, headline, button, annotations and extra typography outside the tin. No new objects or new branding. Match the reference faithfully. Output only one clean square product photograph.

## Brand styling

Color tokens are scoped to the Matcha Days CSS module: matcha green #4D5C33, olive #526138, sage #61683F, orange #D95723, burnt orange #D45521, gold #BF9847, cream #FCF6D0, ink #2F3224 and paper #FBFAF2.

Nunito is used for headings and Inter for body text/navigation, loaded and self-hosted by next/font in app/matchadays/layout.tsx. Both font variables are scoped to this route. The portfolio font is unchanged.

