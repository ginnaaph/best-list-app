import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const creditsSource = await readFile(
  new URL("../app/credits.tsx", import.meta.url),
  "utf8",
).catch(() => "");
const settingsSource = await readFile(
  new URL("../app/settings.tsx", import.meta.url),
  "utf8",
);

test("routes the Settings Credits row to the credits screen", () => {
  assert.match(
    settingsSource,
    /label: "Credits"[\s\S]*onPress: \(\) => router\.push\("\/credits"\)/,
  );
});

test("lists every required Magnific photo credit and link", () => {
  for (const dish of [
    "Tacos",
    "Pizza",
    "Ramen",
    "Breakfast Burrito",
    "Iced Coffee",
    "Coffee",
    "Cookie",
  ]) {
    assert.match(creditsSource, new RegExp(`dish: "${dish}"`));
  }

  assert.match(creditsSource, /Designed by Magnific/);
  assert.match(creditsSource, /https:\/\/www\.magnific\.com/);
  assert.match(creditsSource, /Linking\.openURL\(MAGNIFIC_URL\)/);
});
