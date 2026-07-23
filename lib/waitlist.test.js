import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const apiSource = readFileSync(new URL("./api.ts", import.meta.url), "utf8");

test("does not expose an app-level public waitlist API", () => {
  assert.doesNotMatch(apiSource, /type WaitlistJoinResult/);
  assert.doesNotMatch(apiSource, /export async function joinWaitlist/);
  assert.doesNotMatch(apiSource, /\.from\("waitlist_signups"\)/);
  assert.doesNotMatch(apiSource, /source: "public_share"/);
});
