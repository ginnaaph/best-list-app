import * as Linking from "expo-linking";
import * as WebBrowser from "expo-web-browser";

import { getSupabaseClient } from "@/lib/supabase";

WebBrowser.maybeCompleteAuthSession();

export type EmailAuthMode = "sign-up" | "sign-in";
export type SocialAuthProvider = "google" | "apple";

export const authRedirectTo = Linking.createURL("auth/callback");

export async function sendEmailOtp(email: string, mode: EmailAuthMode) {
  const supabase = getSupabaseClient();

  const normalizedEmail = email.trim().toLowerCase();

  if (!normalizedEmail) {
    throw new Error("Enter an email address.");
  }

  const { error } = await supabase.auth.signInWithOtp({
    email: normalizedEmail,
    options: {
      emailRedirectTo: authRedirectTo,
      shouldCreateUser: true,
    },
  });

  if (error) {
    throw new Error(getAuthErrorMessage(error.message, mode));
  }

  return normalizedEmail;
}

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

export async function signInWithSocialProvider(provider: SocialAuthProvider) {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: authRedirectTo,
      skipBrowserRedirect: true,
    },
  });

  if (error) {
    throw error;
  }

  if (!data.url) {
    throw new Error("Supabase did not return an OAuth URL.");
  }

  const result = await WebBrowser.openAuthSessionAsync(data.url, authRedirectTo);

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

function getProviderLabel(provider?: SocialAuthProvider | null) {
  return provider ?? "Social provider";
}
