import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const apiSource = readFileSync(new URL("./api.ts", import.meta.url), "utf8");
const joinWaitlistSource = apiSource.match(
  /export async function joinWaitlist[\s\S]*?(?=\nexport async function)/,
)?.[0];

assert.ok(joinWaitlistSource, "joinWaitlist source should exist");

test("joins the public waitlist with a normalized email and fixed source", () => {
  assert.match(
    joinWaitlistSource,
    /export async function joinWaitlist\(\s*email: string,\s*\): Promise<WaitlistJoinResult>/,
  );
  assert.match(
    joinWaitlistSource,
    /const normalizedEmail = email\.trim\(\)\.toLowerCase\(\)/,
  );
  assert.match(
    joinWaitlistSource,
    /getPublicSupabaseClient\(\)[\s\S]*\.from\("waitlist_signups"\)[\s\S]*\.insert\(\{[\s\S]*email: normalizedEmail,[\s\S]*source: "public_share",[\s\S]*\}\)/,
  );
  assert.match(joinWaitlistSource, /return "joined"/);
  assert.doesNotMatch(joinWaitlistSource, /\.select\(/);
});

test("maps only unique violations to the already joined result", () => {
  assert.match(joinWaitlistSource, /error\?\.code === "23505"/);
  assert.match(joinWaitlistSource, /return "already_joined"/);
  assert.match(joinWaitlistSource, /throw error/);
});
