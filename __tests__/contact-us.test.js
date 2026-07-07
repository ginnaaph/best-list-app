import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const screenSource = await readFile(
  new URL("../app/contact-us.tsx", import.meta.url),
  "utf8",
);

test("shows feedback when the contact form submission fails", () => {
  assert.match(screenSource, /const FORMSPREE_URL =/);
  assert.match(screenSource, /await fetch\(FORMSPREE_URL,/);
  assert.match(
    screenSource,
    /if \(response\.ok\)[\s\S]*else \{[\s\S]*setSubmitError\(getFormspreeError\(payload\) \?\? GENERIC_ERROR_MESSAGE\);/,
  );
});

test("shows the same feedback if the contact form submission rejects", () => {
  assert.match(
    screenSource,
    /try \{[\s\S]*await fetch\(FORMSPREE_URL,[\s\S]*\} catch \{[\s\S]*setSubmitError\(GENERIC_ERROR_MESSAGE\);/,
  );
});
