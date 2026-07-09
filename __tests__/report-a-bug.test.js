import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const screenSource = await readFile(
  new URL("../app/report-a-bug.tsx", import.meta.url),
  "utf8",
).catch(() => "");
const settingsSource = await readFile(
  new URL("../app/settings.tsx", import.meta.url),
  "utf8",
);

test("Report a bug submits required user feedback to Sentry", () => {
  assert.match(
    screenSource,
    /import \* as Sentry from "@sentry\/react-native";/,
  );
  assert.match(
    screenSource,
    /Sentry\.captureFeedback\(\{\s*message: message\.trim\(\),\s*name: name\.trim\(\),\s*email: email\.trim\(\),\s*\}\);/,
  );
  assert.match(
    screenSource,
    /const canSend = Boolean\(name\.trim\(\) && email\.trim\(\) && message\.trim\(\)\);/,
  );
});

test("Report a bug follows the Contact Us visual and state pattern", () => {
  assert.match(screenSource, /contentContainerClassName="grow px-5 pb-8 pt-2"/);
  assert.match(screenSource, /onPress=\{\(\) => router\.back\(\)\}/);
  assert.match(screenSource, /What went wrong\?/);
  assert.match(screenSource, /Message sent/);
  assert.match(screenSource, /Sending\.\.\./);
  assert.doesNotMatch(screenSource, /Subject/);
  assert.doesNotMatch(screenSource, /FORMSPREE_URL/);
});

test("Settings routes to the Report a bug screen below Contact us", () => {
  assert.match(
    settingsSource,
    /label: "Contact us"[\s\S]*?router\.push\("\/contact-us"\)[\s\S]*?label: "Report a bug"[\s\S]*?router\.push\("\/report-a-bug"\)/,
  );
});
