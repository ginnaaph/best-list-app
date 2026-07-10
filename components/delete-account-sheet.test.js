import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const componentSource = await readFile(
  new URL("./delete-account-sheet.tsx", import.meta.url),
  "utf8",
);
const settingsSource = await readFile(
  new URL("../app/settings.tsx", import.meta.url),
  "utf8",
);

test("uses the existing slide-up transparent modal pattern without implicit dismissal", () => {
  assert.match(componentSource, /<Modal/);
  assert.match(componentSource, /animationType="slide"/);
  assert.match(componentSource, /transparent/);
  assert.match(
    componentSource,
    /onRequestClose=\{step === "confirmation" \? returnToWarning : closeSheet\}/,
  );
  assert.doesNotMatch(componentSource, /<Pressable className="flex-1"/);
});

test("renders the warning, confirmation, and success steps", () => {
  assert.match(
    componentSource,
    /type DeleteAccountStep = "warning" \| "confirmation" \| "success"/,
  );
  assert.match(componentSource, /Delete your account\?/);
  assert.match(componentSource, /Confirm deletion/);
  assert.match(componentSource, /Account deleted/);
});

test("requires the exact DELETE confirmation before enabling deletion", () => {
  assert.match(componentSource, /confirmation === "DELETE"/);
  assert.match(componentSource, /disabled=\{!isConfirmed\}/);
  assert.match(componentSource, /Type DELETE to confirm/);
});

test("normalizes typed confirmation before storing it", () => {
  assert.match(
    componentSource,
    /function updateConfirmation\(value: string\) \{\s+setConfirmation\(value\.toUpperCase\(\)\);/,
  );
});

test("exposes explicit close and sign-in actions", () => {
  assert.match(componentSource, /onClose: \(\) => void/);
  assert.match(componentSource, /onBackToSignIn: \(\) => void/);
  assert.match(componentSource, /Back to sign in/);
});

test("wires the existing Settings action to the sheet and sign-in route", () => {
  assert.match(
    settingsSource,
    /import \{ DeleteAccountSheet \} from "@\/components\/delete-account-sheet"/,
  );
  assert.match(settingsSource, /accessibilityLabel="Delete account"/);
  assert.match(settingsSource, /setIsDeleteSheetVisible\(true\)/);
  assert.match(settingsSource, /<DeleteAccountSheet/);
  assert.match(settingsSource, /router\.replace\("\/sign-in"\)/);
});
