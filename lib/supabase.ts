import "react-native-url-polyfill/auto";

import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  createClient,
  processLock,
  type SupabaseClient,
} from "@supabase/supabase-js";
import { AppState, Platform, type NativeEventSubscription } from "react-native";

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabasePublishableKey = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

export const isSupabaseConfigured = !!(supabaseUrl && supabasePublishableKey);
export function assertSupabaseConfigured() {
  if (!isSupabaseConfigured) {
    throw new Error(
      "Missing EXPO_PUBLIC_SUPABASE_URL or EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY.",
    );
  }
}

let supabaseClient: SupabaseClient | null = null;
let appStateSubscription: NativeEventSubscription | null = null;

export function getSupabaseClient() {
  if (supabaseClient) {
    return supabaseClient;
  }

  const { publishableKey, url } = getSupabaseConfig();

  supabaseClient = createClient(url, publishableKey, {
    auth: {
      ...(Platform.OS !== "web" ? { storage: AsyncStorage } : {}),
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
      lock: processLock,
    },
  });

  startSupabaseAutoRefresh(supabaseClient);

  return supabaseClient;
}

function getSupabaseConfig() {
  assertSupabaseConfigured();

  return {
    publishableKey: supabasePublishableKey as string,
    url: supabaseUrl as string,
  };
}

function startSupabaseAutoRefresh(client: SupabaseClient) {
  if (Platform.OS === "web" || appStateSubscription) {
    return;
  }

  appStateSubscription = AppState.addEventListener("change", (state) => {
    if (state === "active") {
      client.auth.startAutoRefresh();
    } else {
      client.auth.stopAutoRefresh();
    }
  });
}
