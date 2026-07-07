import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const privacySource = await readFile(
  new URL("../app/privacy.tsx", import.meta.url),
  "utf8",
);
const termsSource = await readFile(
  new URL("../app/terms.tsx", import.meta.url),
  "utf8",
);
const settingsSource = await readFile(
  new URL("../app/settings.tsx", import.meta.url),
  "utf8",
);
const authSource = await readFile(
  new URL("../components/auth-screen.tsx", import.meta.url),
  "utf8",
);

test("legal screens use the established scrollable screen shell", () => {
  for (const source of [privacySource, termsSource]) {
    assert.match(source, /SafeAreaView/);
    assert.match(
      source,
      /contentContainerClassName="grow px-5 pb-8 pt-2"/,
    );
    assert.match(source, /name="chevron-back"/);
    assert.match(source, /router\.back\(\)/);
    assert.match(source, /font-display text-\[34px\]/);
  }
});

test("legal screens contain the approved copy", () => {
  assert.match(privacySource, /Overview/);
  assert.match(privacySource, /Apple ID token/);
  assert.match(privacySource, /bestlist\.app@gmail\.com/);
  assert.match(termsSource, /1\. Acceptance of Terms/);
  assert.match(
    termsSource,
    /Our total liability to\s+you for any claim is limited to \$0/,
  );
});

test("Settings and AuthScreen route legal links internally", () => {
  assert.match(
    settingsSource,
    /label: "Privacy policy"[\s\S]*?router\.push\("\/privacy"\)/,
  );
  assert.match(
    settingsSource,
    /label: "Terms of service"[\s\S]*?router\.push\("\/terms"\)/,
  );
  assert.match(
    authSource,
    /onPress=\{\(\) => router\.push\("\/terms"\)\}/,
  );
  assert.match(
    authSource,
    /onPress=\{\(\) => router\.push\("\/privacy"\)\}/,
  );
});

test("Terms links its Privacy Policy reference to the privacy route", () => {
  assert.match(termsSource, /href="\/privacy"[\s\S]*Privacy Policy/);
});
