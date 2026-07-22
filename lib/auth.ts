import * as AppleAuthentication from "expo-apple-authentication";
import {
  GoogleSignin,
  isCancelledResponse,
} from "@react-native-google-signin/google-signin";
import * as Linking from "expo-linking";
import * as WebBrowser from "expo-web-browser";
import { Platform } from "react-native";

import { prepareAppleNameProfileUpdate } from "@/lib/profile-data";
import { getSupabaseClient, assertSupabaseConfigured } from "@/lib/supabase";

WebBrowser.maybeCompleteAuthSession();

const googleWebClientId = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;
const googleIosClientId = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID;

GoogleSignin.configure({
  webClientId: googleWebClientId,
  iosClientId: googleIosClientId,
});

export type EmailAuthMode = "sign-up" | "sign-in";
export type SocialAuthProvider = "google" | "apple";

export const authRedirectTo =
  Platform.OS === "web"
    ? Linking.createURL("auth/callback")
    : "bestlist://auth/callback";

/**
 * Sends an email OTP for sign-up or sign-in.
 *
 * @param email - The email address to authenticate.
 * @param mode - The email auth flow to use.
 * @returns The normalized email address.
 */
export async function sendEmailOtp(email: string, mode: EmailAuthMode) {
  assertSupabaseConfigured();

  const normalizedEmail = email.trim().toLowerCase();

  if (!normalizedEmail) {
    throw new Error("Enter an email address.");
  }

  const supabase = getSupabaseClient();

  const { error } = await supabase.auth.signInWithOtp({
    email: normalizedEmail,
    options: {
      shouldCreateUser: true,
    },
  });

  if (error) {
    throw new Error(getAuthErrorMessage(error.message, mode));
  }

  return normalizedEmail;
}

/**
 * Creates a Supabase account with email and password.
 *
 * @param email - The email address to register.
 * @param password - The password to register.
 * @returns The auth session state after sign-up.
 */
export async function signUpWithPassword(email: string, password: string) {
  assertSupabaseConfigured();

  const credentials = getPasswordCredentials(email, password);
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.auth.signUp(credentials);

  if (error) {
    throw new Error(getAuthErrorMessage(error.message, "sign-up"));
  }

  if (!data.session) {
    return { needsEmailConfirmation: true, session: null } as const;
  }

  return { needsEmailConfirmation: false, session: data.session } as const;
}

/**
 * Signs in with a Supabase email and password.
 *
 * @param email - The account email address.
 * @param password - The account password.
 * @returns The authenticated session.
 */
export async function signInWithPassword(email: string, password: string) {
  assertSupabaseConfigured();

  const credentials = getPasswordCredentials(email, password);
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.auth.signInWithPassword(credentials);

  if (error) {
    throw error;
  }

  if (!data.session) {
    throw new Error("Sign in did not return a session. Try again.");
  }

  return data.session;
}

/**
 * Signs in with a Supabase anonymous guest session.
 *
 * @returns The anonymous authenticated session.
 */
export async function signInAsGuest() {
  assertSupabaseConfigured();

  const supabase = getSupabaseClient();
  const { data, error } = await supabase.auth.signInAnonymously();

  if (error) {
    throw error;
  }

  if (!data.session) {
    throw new Error("Guest sign in did not return a session. Try again.");
  }

  return data.session;
}

/**
 * Verifies an email OTP and creates a session.
 *
 * @param email - The email address being verified.
 * @param code - The OTP code to verify.
 * @returns The authenticated session.
 */
export async function verifyEmailOtp(email: string, code: string) {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase.auth.verifyOtp({
    email: email.trim().toLowerCase(),
    token: code,
    type: "email",
  });

  if (error) {
    throw error;
  }

  return data.session;
}

/**
 * Starts a browser-based social sign-in flow.
 *
 * @param provider - The social auth provider to use.
 */
export async function signInWithSocialProvider(provider: SocialAuthProvider) {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: authRedirectTo,
      skipBrowserRedirect: true,
      queryParams: provider === "google" ? { prompt: "select_account" } : {},
    },
  });

  if (error) {
    throw error;
  }

  if (!data.url) {
    throw new Error("Supabase did not return an OAuth URL.");
  }

  const oauthError = await getOAuthProviderError(data.url, provider);
  if (oauthError) {
    throw new Error(oauthError);
  }
  await WebBrowser.coolDownAsync();

  const result = await WebBrowser.openAuthSessionAsync(
    data.url,
    authRedirectTo,
  );

  if (result.type === "success") {
    const session = await createSessionFromUrl(result.url);
    if (!session) {
      throw new Error(
        "Supabase returned from OAuth without a session. Check the provider and redirect URL settings.",
      );
    }
    return;
  }

  if (result.type === "cancel") {
    throw new Error(`${getProviderLabel(provider)} sign in was canceled.`);
  }

  throw new Error(`${getProviderLabel(provider)} sign in did not complete.`);
}

/**
 * Signs in with native Google Sign-In.
 */
export async function signInWithGoogle() {
  if (!googleWebClientId || !googleIosClientId) {
    throw new Error(
      "Google sign in is not configured. Add the Google web and iOS client IDs.",
    );
  }

  const response = await GoogleSignin.signIn();

  if (isCancelledResponse(response)) {
    throw new Error("Google sign in was canceled.");
  }

  if (!response.data.idToken) {
    throw new Error("Google sign in did not return an ID token.");
  }

  const supabase = getSupabaseClient();
  const { data, error } = await supabase.auth.signInWithIdToken({
    provider: "google",
    token: response.data.idToken,
  });

  if (error) {
    throw error;
  }

  if (!data.user) {
    throw new Error("Google sign in did not return a user.");
  }
}

/**
 * Signs in with Apple on iOS or browser OAuth elsewhere.
 */
export async function signInWithApple() {
  if (Platform.OS !== "ios") {
    return signInWithSocialProvider("apple");
  }

  let credential: AppleAuthentication.AppleAuthenticationCredential;

  try {
    credential = await AppleAuthentication.signInAsync({
      requestedScopes: [
        AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
        AppleAuthentication.AppleAuthenticationScope.EMAIL,
      ],
    });
  } catch (error: unknown) {
    if (isAppleCancellationError(error)) {
      throw new Error("Apple sign in was canceled.");
    }

    throw error;
  }

  if (!credential.identityToken) {
    throw new Error("Apple sign in did not return an identity token.");
  }

  const supabase = getSupabaseClient();
  const { data, error } = await supabase.auth.signInWithIdToken({
    provider: "apple",
    token: credential.identityToken,
  });

  if (error) {
    throw error;
  }

  if (!data.user) {
    throw new Error("Apple sign in did not return a user.");
  }

  if (credential.fullName) {
    const profileUpdate = prepareAppleNameProfileUpdate(
      AppleAuthentication.formatFullName(credential.fullName),
    );

    if (profileUpdate) {
      const { error: profileError } = await supabase.from("profiles").upsert(
        {
          id: data.user.id,
          ...profileUpdate,
        },
        { onConflict: "id" },
      );

      if (profileError) {
        throw profileError;
      }
    }
  }
}

/**
 * Creates a Supabase session from an auth callback URL.
 *
 * @param url - The auth callback URL containing a code or tokens.
 * @returns The authenticated session, or null when the URL has no tokens.
 */
export async function createSessionFromUrl(url: string) {
  const supabase = getSupabaseClient();

  const params = getAuthParams(url);
  const errorCode = params.get("error_code") ?? params.get("error");

  if (errorCode) {
    throw new Error(params.get("error_description") ?? errorCode);
  }

  const code = params.get("code");
  if (code) {
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) {
      throw error;
    }
    return data.session;
  }

  const accessToken = params.get("access_token");
  const refreshToken = params.get("refresh_token");

  if (!accessToken || !refreshToken) {
    return null;
  }

  const { data, error } = await supabase.auth.setSession({
    access_token: accessToken,
    refresh_token: refreshToken,
  });

  if (error) {
    throw error;
  }

  return data.session;
}

async function getOAuthProviderError(
  url: string,
  provider: SocialAuthProvider,
) {
  try {
    const response = await fetch(url, {
      method: "GET",
      redirect: "manual",
    });

    const contentType = response.headers.get("content-type");
    if (!contentType?.includes("application/json")) {
      return null;
    }

    const body: unknown = await response.json();

    if (!isOAuthErrorBody(body)) {
      return null;
    }

    if (body.msg.includes("provider is not enabled")) {
      const providerName = provider === "google" ? "Google" : "Apple";
      return `${providerName} sign-in is not enabled yet. Use email sign-in for now.`;
    }

    return body.msg;
  } catch {
    return null;
  }
}

function isOAuthErrorBody(body: unknown): body is { msg: string } {
  return (
    typeof body === "object" &&
    body !== null &&
    "msg" in body &&
    typeof body.msg === "string"
  );
}

function isAppleCancellationError(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === "ERR_REQUEST_CANCELED"
  );
}

function getAuthParams(url: string) {
  const parsedUrl = new URL(url);
  const params = new URLSearchParams(parsedUrl.search);

  if (parsedUrl.hash.startsWith("#")) {
    const hashParams = new URLSearchParams(parsedUrl.hash.slice(1));
    hashParams.forEach((value, key) => params.set(key, value));
  }

  return params;
}

function getAuthErrorMessage(message: string, mode: EmailAuthMode) {
  if (message.toLowerCase().includes("signups not allowed")) {
    return mode === "sign-up"
      ? "Email sign up is disabled in Supabase Auth settings."
      : "No account exists for this email yet. Create an account first.";
  }

  return message;
}

function getPasswordCredentials(email: string, password: string) {
  const normalizedEmail = email.trim().toLowerCase();

  if (!normalizedEmail) {
    throw new Error("Enter an email address.");
  }

  if (!password) {
    throw new Error("Enter a password.");
  }

  return { email: normalizedEmail, password };
}

function getProviderLabel(provider?: SocialAuthProvider | null) {
  return provider ?? "Social provider";
}
