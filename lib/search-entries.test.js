import assert from "node:assert/strict";
import test from "node:test";

import { searchEntries } from "./search-entries.ts";

const categories = [
  {
    id: "category-burrito",
    name: "Breakfast Burrito",
    topEntry: "Sunrise Cafe",
    entryCount: 2,
    tone: "gold",
    isPublic: false,
  },
  {
    id: "category-ramen",
    name: "Ramen",
    topEntry: "Noodle House",
    entryCount: 1,
    tone: "clay",
    isPublic: false,
  },
];

const entries = [
  {
    id: "entry-low",
    categoryId: "category-burrito",
    placeName: "Sunrise Cafe",
    city: "Oakland",
    createdAt: "2026-06-01T00:00:00.000Z",
    taste: 7,
    value: 7,
    portion: 7,
    vibe: 7,
    overallScore: 7,
  },
  {
    id: "entry-high",
    categoryId: "category-ramen",
    placeName: "Noodle House",
    city: "San Francisco",
    createdAt: "2026-06-02T00:00:00.000Z",
    taste: 10,
    value: 9,
    portion: 9,
    vibe: 8,
    overallScore: 9,
  },
  {
    id: "entry-missing-category",
    categoryId: "missing",
    placeName: "City Diner",
    city: "Berkeley",
    createdAt: "2026-06-03T00:00:00.000Z",
    taste: 8,
    value: 8,
    portion: 8,
    vibe: 8,
    overallScore: 8,
  },
];

test("returns no results for a blank query", () => {
  assert.deepEqual(searchEntries(entries, categories, "   "), []);
});

test("matches category names, place names, and cities case-insensitively", () => {
  assert.deepEqual(
    searchEntries(entries, categories, "BURRITO").map(
      (result) => result.entry.id,
    ),
    ["entry-low"],
  );
  assert.deepEqual(
    searchEntries(entries, categories, "noodle").map(
      (result) => result.entry.id,
    ),
    ["entry-high"],
  );
  assert.deepEqual(
    searchEntries(entries, categories, "berkeley").map(
      (result) => result.entry.id,
    ),
    ["entry-missing-category"],
  );
});

test("sorts matching entries by overall score from highest to lowest", () => {
  assert.deepEqual(
    searchEntries(entries, categories, "a").map(
      (result) => result.entry.id,
    ),
    ["entry-high", "entry-missing-category", "entry-low"],
  );
});

test("uses a fallback label when an entry category is missing", () => {
  const [result] = searchEntries(entries, categories, "city diner");

  assert.equal(result.categoryName, "Unknown category");
});
