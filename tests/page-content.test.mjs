import { existsSync, readFileSync } from "node:fs";
import { test } from "node:test";
import assert from "node:assert/strict";

const pageSource = readFileSync(new URL("../app/about/portfolio.tsx", import.meta.url), "utf8");
const constantsSource = readFileSync(new URL("../app/lib/constants.ts", import.meta.url), "utf8");
const layoutSource = readFileSync(new URL("../app/layout.tsx", import.meta.url), "utf8");

test("about page preserves the paocoffeedays portfolio sections", () => {
  for (const expected of [
    "Scroll-stopping UGC",
    "Hello fellow humans",
    "Audience Overview",
    "Brands collaborated with me",
    "My contents",
    "UGC PACKAGES"
  ]) {
    assert.match(pageSource, new RegExp(expected));
  }
});

test("portfolio image references resolve to existing public assets", () => {
  const assets = [...(pageSource + constantsSource).matchAll(/(?:src|logo):?\s*[=:]?\s*"(\/[^"\s]+\.(?:png|jpg|svg))"/g)];
  assert.ok(assets.length > 0);
  for (const [, asset] of assets) {
    assert.ok(existsSync(new URL(`../public${asset}`, import.meta.url)), `Missing asset: ${asset}`);
  }
});

test("metadata uses paocoffeedays as the canonical brand", () => {
  assert.match(layoutSource, /paocoffeedays/);
  assert.doesNotMatch(layoutSource, /paocanopin\.com/);
});
