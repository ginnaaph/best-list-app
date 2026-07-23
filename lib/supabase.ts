import "react-native-url-polyfill/auto";

import {
  createClient,
  processLock,
  type SupportedStorage,
} from "@supabase/supabase-js";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
const secureStoreValueLimitBytes = 2048;

/**
 * Stores Supabase auth sessions in SecureStore and migrates existing
 * AsyncStorage sessions into SecureStore the first time they are read.
 */
const secureStoreAdapter: SupportedStorage = {
  getItem: async (key: string) => {
    const secureValue = await SecureStore.getItemAsync(key);

    if (secureValue != null) {
      return secureValue;
    }

    const legacyValue = await AsyncStorage.getItem(key);

    if (legacyValue == null) {
      return legacyValue;
    }

    await SecureStore.setItemAsync(key, legacyValue);
    await AsyncStorage.removeItem(key);

    return legacyValue;
  },
  setItem: (key: string, value: string) => {
    if (isOverSecureStoreValueLimit(value)) {
      console.warn(
        "Supabase auth session is larger than SecureStore's 2048-byte Android value limit.",
      );
    }

    return SecureStore.setItemAsync(key, value);
  },
  removeItem: (key: string) => SecureStore.deleteItemAsync(key),
};

function isOverSecureStoreValueLimit(value: string) {
  let bytes = 0;

  for (let index = 0; index < value.length; index++) {
    const codePoint = value.charCodeAt(index);

    if (codePoint >= 0xd800 && codePoint < 0xe000) {
      const nextCodePoint = value.charCodeAt(index + 1);

      if (
        codePoint < 0xdc00 &&
        nextCodePoint >= 0xdc00 &&
        nextCodePoint < 0xe000
      ) {
        bytes += 4;
        index++;
      } else {
        bytes += 3;
      }
    } else {
      bytes += codePoint < 0x80 ? 1 : codePoint < 0x800 ? 2 : 3;
    }

    if (bytes > secureStoreValueLimitBytes) {
      return true;
    }
  }

  return false;
}

export const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey);

/**
 * Throws when Supabase environment variables are missing.
 */
export function assertSupabaseConfigured() {
  if (!isSupabaseConfigured) {
    throw new Error(
      "Missing EXPO_PUBLIC_SUPABASE_URL or EXPO_PUBLIC_SUPABASE_ANON_KEY.",
    );
  }
}

export const supabase = createClient(supabaseUrl ?? "", supabaseAnonKey ?? "", {
  auth: {
    ...(Platform.OS !== "web" ? { storage: secureStoreAdapter } : {}),
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
    lock: processLock,
  },
});

export const publicSupabase = createClient(
  supabaseUrl ?? "",
  supabaseAnonKey ?? "",
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
      storageKey: "bestlist-public-share",
    },
  },
);

/**
 * Gets the configured Supabase client.
 *
 * @returns The configured Supabase client.
 */
export function getSupabaseClient() {
  assertSupabaseConfigured();
  return supabase;
}

/**
 * Gets the public Supabase client for read-only share flows.
 *
 * @returns The configured public Supabase client.
 */
export function getPublicSupabaseClient() {
  assertSupabaseConfigured();
  return publicSupabase;
}
