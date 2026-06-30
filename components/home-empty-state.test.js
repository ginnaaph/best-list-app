import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const emptyStateSource = await readFile(
  new URL("./home-empty-state.tsx", import.meta.url),
  "utf8",
).catch(() => "");
const homeScreenSource = await readFile(
  new URL("./home-screen.tsx", import.meta.url),
  "utf8",
);
const homeHeaderSource = await readFile(
  new URL("./home-header.tsx", import.meta.url),
  "utf8",
);
const componentIndexSource = await readFile(
  new URL("./index.ts", import.meta.url),
  "utf8",
);

test("renders the new-user home empty state and links its CTA to add category", () => {
  assert.match(emptyStateSource, /Let's start your first list\./);
  assert.match(
    emptyStateSource,
    /Pick a food you have opinions about — or write your own\./,
  );
  assert.match(emptyStateSource, /Start a new list/);
  assert.match(emptyStateSource, /Name a food you eat often/);
  assert.match(emptyStateSource, /Log one entry — see where it ranks\./);
  assert.match(emptyStateSource, /router\.push\(addCategoryRoute\)/);
  assert.match(emptyStateSource, /border-dashed/);
});

test("shows only the empty-state CTA when the user has no categories", () => {
  assert.match(homeScreenSource, /categories\.length === 0/);
  assert.match(homeScreenSource, /<HomeEmptyState \/>/);
  assert.match(
    homeScreenSource,
    /categories\.length > 0 && \([\s\S]*<FloatingAddButton/,
  );
});

test("exports the empty state and personalizes the welcome for users with no logged entries", () => {
  assert.match(componentIndexSource, /export \{ HomeEmptyState \}/);
  assert.match(homeHeaderSource, /\.select\("username"\)/);
  assert.match(
    homeHeaderSource,
    /loggedCount === 0[\s\S]*`Welcome \$\{username\}`[\s\S]*loggedCount/,
  );
  assert.match(homeHeaderSource, /RobotoSlab_700Bold/);
  assert.match(homeHeaderSource, /Roboto_400Regular/);
  assert.match(
    homeHeaderSource,
    /loggedCount === 0 \? "uppercase tracking-\[1\.5px\]"/,
  );
});
