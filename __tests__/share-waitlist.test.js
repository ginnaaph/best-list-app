import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const screenSource = readFileSync(
  new URL("../app/share/[id].tsx", import.meta.url),
  "utf8",
);

test("renders the waitlist capture in both former CTA locations", () => {
  assert.equal((screenSource.match(/<WaitlistCapture/g) ?? []).length, 2);
  assert.doesNotMatch(screenSource, /import \{ Link,/);
  assert.doesNotMatch(screenSource, /href="\/"/);
  assert.match(screenSource, /Join the App Store waitlist/);
});

test("captures an email and renders friendly terminal states", () => {
  assert.match(screenSource, /joinWaitlist\(email\)/);
  assert.match(screenSource, /inputMode="email"/);
  assert.match(screenSource, /keyboardType="email-address"/);
  assert.match(screenSource, /textContentType="emailAddress"/);
  assert.match(
    screenSource,
    /You're on the list — we'll email you when BestList is live\./,
  );
  assert.match(
    screenSource,
    /You're already on the list — we'll email you when BestList is live\./,
  );
});
