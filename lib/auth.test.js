import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const authSource = readFileSync(new URL("./auth.ts", import.meta.url), "utf8");
const authScreenSource = readFileSync(
  new URL("../components/auth-screen.tsx", import.meta.url),
  "utf8",
);

test("native Apple auth is platform-contained in the auth helper", () => {
  assert.match(authSource, /export async function signInWithApple\(\)/);
  assert.match(authSource, /Platform\.OS !== "ios"/);
  assert.match(authSource, /return signInWithSocialProvider\("apple"\)/);
});

test("native Apple auth exchanges Apple's identity token with Supabase", () => {
  assert.match(authSource, /AppleAuthentication\.signInAsync\(/);
  assert.match(authSource, /AppleAuthenticationScope\.FULL_NAME/);
  assert.match(authSource, /AppleAuthenticationScope\.EMAIL/);
  assert.match(authSource, /signInWithIdToken\(\{[\s\S]*provider: "apple"[\s\S]*token: credential\.identityToken/);
  assert.match(authSource, /prepareAppleNameProfileUpdate\(/);
  assert.match(authSource, /from\("profiles"\)\.upsert\(/);
  assert.match(authSource, /id: data\.user\.id/);
});

test("the existing Apple button delegates to the dedicated auth helper", () => {
  assert.match(authScreenSource, /await signInWithApple\(\)/);
  assert.match(
    authScreenSource,
    /label="Continue with Apple"[\s\S]*onPress=\{handleApplePress\}/,
  );
});
