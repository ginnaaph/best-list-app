import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const screenSource = await readFile(
  new URL("../app/contact-us.tsx", import.meta.url),
  "utf8",
);

test("shows feedback when no email app can open the contact message", () => {
  assert.match(screenSource, /Alert/);
  assert.match(screenSource, /await Linking\.canOpenURL\(mailtoUrl\)/);
  assert.match(
    screenSource,
    /No email app found\. Please email bestlist\.app@gmail\.com directly\./,
  );
});

test("shows the same feedback if opening the email app rejects", () => {
  assert.match(
    screenSource,
    /try \{[\s\S]*await Linking\.openURL\(mailtoUrl\);[\s\S]*\} catch/,
  );
});
