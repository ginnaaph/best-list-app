import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const authSource = readFileSync(new URL("./auth.ts", import.meta.url), "utf8");
const authScreenSource = readFileSync(
  new URL("../components/auth-screen.tsx", import.meta.url),
  "utf8",
);
const signInSource = readFileSync(
  new URL("../app/sign-in.tsx", import.meta.url),
  "utf8",
);
const signUpSource = readFileSync(
  new URL("../app/sign-up.tsx", import.meta.url),
  "utf8",
);
const envExampleSource = readFileSync(
  new URL("../.env.example", import.meta.url),
  "utf8",
);

test("native Apple auth is platform-contained in the auth helper", () => {
  assert.match(authSource, /export async function signInWithApple\(\)/);
  assert.match(authSource, /Platform\.OS !== "ios"/);
  assert.match(authSource, /return signInWithSocialProvider\("apple"\)/);
});

test("native social auth uses the BestList callback scheme", () => {
  assert.match(
    authSource,
    /Platform\.OS === "web"[\s\S]*Linking\.createURL\("auth\/callback"\)[\s\S]*"bestlist:\/\/auth\/callback"/,
  );
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

test("native Google auth exchanges Google's identity token with Supabase", () => {
  assert.match(authSource, /GoogleSignin\.configure\(/);
  assert.match(authSource, /GoogleSignin\.signIn\(\)/);
  assert.match(authSource, /response\.data\.idToken/);
  assert.match(
    authSource,
    /signInWithIdToken\(\{[\s\S]*provider: "google"[\s\S]*token: response\.data\.idToken/,
  );
  assert.match(authSource, /Google sign in was canceled\./);
});

test("the Google button delegates to the native Google auth helper", () => {
  assert.match(authScreenSource, /await signInWithGoogle\(\)/);
  assert.match(
    authScreenSource,
    /label="Continue with Google"[\s\S]*onPress=\{handleGooglePress\}/,
  );
});

test("documents both Google OAuth client IDs", () => {
  assert.match(envExampleSource, /EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=/);
  assert.match(envExampleSource, /EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID=/);
});

test("the existing Apple button delegates to the dedicated auth helper", () => {
  assert.match(authScreenSource, /await signInWithApple\(\)/);
  assert.match(
    authScreenSource,
    /label="Continue with Apple"[\s\S]*onPress=\{handleApplePress\}/,
  );
});

test("guest email sign-up links the current anonymous user", () => {
  assert.match(authSource, /export async function linkGuestEmail\(email: string\)/);
  assert.match(authSource, /supabase\.auth\.updateUser\(\{ email: normalizedEmail \}\)/);
  assert.match(
    authSource,
    /This email already has an account\. Sign in instead to use that account\./,
  );
  assert.match(
    authSource,
    /export async function verifyGuestEmailLink\(email: string, code: string\)/,
  );
  assert.match(authSource, /type: "email_change"/);
  assert.match(
    authScreenSource,
    /isGuestSignUp[\s\S]*await linkGuestEmail\(email\)[\s\S]*await sendEmailOtp\(email, mode\)/,
  );
  assert.match(
    authScreenSource,
    /flow=\{isGuestSignUp \? "guest-email-link" : "email-auth"\}/,
  );
});

test("auth routes allow anonymous guest sessions through", () => {
  assert.match(signInSource, /session && !session\.user\.is_anonymous/);
  assert.match(signUpSource, /session && !session\.user\.is_anonymous/);
});
