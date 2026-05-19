import { readFileSync } from "node:fs";
import { test } from "node:test";
import assert from "node:assert/strict";

const pageSource = readFileSync(new URL("../app/page.tsx", import.meta.url), "utf8");
const layoutSource = readFileSync(new URL("../app/layout.tsx", import.meta.url), "utf8");

test("home page contains the paocoffeedays portfolio sections", () => {
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

test("home page keeps the planned asset filenames wired in", () => {
  for (const asset of [
    "pao-profile.jpg",
    "about-cup.jpg",
    "hero-woahhh.jpg",
    "hero-iced-americano.jpg",
    "hero-marastamp.jpg",
    "content-satire.jpg",
    "content-unboxing.jpg",
    "content-paid-collab.jpg",
    "content-lifestyle.jpg",
    "logo-outin.png",
    "logo-orea.png",
    "logo-ikape.png",
    "logo-brewista.png"
  ]) {
    assert.match(pageSource, new RegExp(asset));
  }
});

test("metadata uses paocoffeedays as the canonical brand", () => {
  assert.match(layoutSource, /paocoffeedays/);
  assert.doesNotMatch(layoutSource, /paocanopin\.com/);
});
