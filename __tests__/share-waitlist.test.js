import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const screenSource = readFileSync(
  new URL("../app/share/[id].tsx", import.meta.url),
  "utf8",
);

// These are source-text checks with known blind spots: they will not catch a
// semantically equivalent reintroduction under different JSX or import syntax.
// Real rendered-output assertions would require adding @testing-library/react-native
// or react-test-renderer as a new dependency in a separate approved task.
test("does not render public share waitlist capture CTAs", () => {
  assert.doesNotMatch(screenSource, /<WaitlistCapture/);
  assert.doesNotMatch(screenSource, /function WaitlistCapture/);
  assert.doesNotMatch(screenSource, /import \{ Link,/);
  assert.doesNotMatch(screenSource, /href="\/"/);
});

// These are source-text checks with known blind spots: they will not catch a
// semantically equivalent reintroduction under different JSX or import syntax.
// Real rendered-output assertions would require adding @testing-library/react-native
// or react-test-renderer as a new dependency in a separate approved task.
test("does not collect anonymous visitor email addresses", () => {
  assert.doesNotMatch(screenSource, /joinWaitlist/);
  assert.doesNotMatch(screenSource, /TextInput/);
  assert.doesNotMatch(screenSource, /inputMode="email"/);
  assert.doesNotMatch(screenSource, /keyboardType="email-address"/);
  assert.doesNotMatch(screenSource, /textContentType="emailAddress"/);
  assert.doesNotMatch(screenSource, /Join the App Store waitlist/);
  assert.doesNotMatch(
    screenSource,
    /You're on the list — we'll email you when BestList is live\./,
  );
  assert.doesNotMatch(
    screenSource,
    /You're already on the list — we'll email you when BestList is live\./,
  );
});
