import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { registerHooks } from "node:module";
import test from "node:test";

const apiSource = readFileSync(new URL("./api.ts", import.meta.url), "utf8");

const stubModules = new Map([
  ["react-native-url-polyfill/auto", ""],
  [
    "@react-native-async-storage/async-storage",
    `export default {
      getItem: async () => null,
      setItem: async () => undefined,
      removeItem: async () => undefined,
    };`,
  ],
  [
    "expo-secure-store",
    `export const getItemAsync = async () => null;
    export const setItemAsync = async () => undefined;
    export const deleteItemAsync = async () => undefined;`,
  ],
  ["react-native", `export const Platform = { OS: "web" };`],
  [
    "@supabase/supabase-js",
    `export const processLock = {};
    export function createClient() {
      return {};
    }`,
  ],
]);

registerHooks({
  resolve(specifier, context, nextResolve) {
    const stubSource = stubModules.get(specifier);

    if (stubSource !== undefined) {
      return {
        url: `data:text/javascript,${encodeURIComponent(stubSource)}`,
        shortCircuit: true,
      };
    }

    return nextResolve(specifier, context);
  },
});

const apiModule = await import("./api.ts");

test("does not expose an app-level public waitlist API", () => {
  assert.doesNotMatch(apiSource, /type WaitlistJoinResult/);
  assert.equal("joinWaitlist" in apiModule, false);
  assert.doesNotMatch(apiSource, /\.from\(\s*["'`]waitlist_signups["'`]\s*\)/);
  assert.doesNotMatch(apiSource, /source:\s*["'`]public_share["'`]/);
});
