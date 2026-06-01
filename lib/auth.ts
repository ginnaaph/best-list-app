import * as Linking from "expo-linking";
import * as WebBrowser from "expo-web-browser";

import { assertSupabaseConfigured, supabase } from "@/lib/supabase";

WebBrowser.maybeCompleteAuthSession();

export type EmailAuthMode = "sign-up" | "sign-in";
export type SocialAuthProvider = "google" | "apple";

export const authRedirectTo = Linking.createURL("auth/callback");

export async function sendEmailOtp(email: string, _mode: EmailAuthMode) {
  assertSupabaseConfigured();

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
    throw error;
  }

  return normalizedEmail;
}

export async function verifyEmailOtp(email: string, code: string) {
  assertSupabaseConfigured();

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
  assertSupabaseConfigured();

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
    await createSessionFromUrl(result.url);
  }
}

export async function createSessionFromUrl(url: string) {
  assertSupabaseConfigured();

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

function getAuthParams(url: string) {
  const parsedUrl = new URL(url);
  const params = new URLSearchParams(parsedUrl.search);

  if (parsedUrl.hash.startsWith("#")) {
    const hashParams = new URLSearchParams(parsedUrl.hash.slice(1));
    hashParams.forEach((value, key) => params.set(key, value));
  }

  return params;
}
