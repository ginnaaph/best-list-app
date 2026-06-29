import assert from "node:assert/strict";
import test from "node:test";

import {
  getPostAuthDestination,
  getProfileInitial,
  mapProfileRow,
  prepareSetupHandleProfileUpdate,
  summarizeProfileCategories,
} from "./profile-data.ts";

const profileRow = {
  id: "user-1",
  username: "gina",
  full_name: "Gina Pham",
  city: "San Francisco",
  bio: "Breakfast burrito scout.",
  avatar_url: "https://example.com/avatar.jpg",
  created_at: "2026-06-24T00:00:00.000Z",
};

test("maps a profile row into the app profile type", () => {
  assert.deepEqual(mapProfileRow(profileRow), {
    id: "user-1",
    username: "gina",
    fullName: "Gina Pham",
    city: "San Francisco",
    bio: "Breakfast burrito scout.",
    avatarUrl: "https://example.com/avatar.jpg",
    createdAt: "2026-06-24T00:00:00.000Z",
  });
});

test("returns null when a user does not have a profile row yet", () => {
  assert.equal(mapProfileRow(null), null);
});

test("uses the user's name, username, or email for profile initials", () => {
  assert.equal(getProfileInitial(mapProfileRow(profileRow), "user@example.com"), "G");
  assert.equal(
    getProfileInitial({ ...mapProfileRow(profileRow), fullName: undefined }, ""),
    "G",
  );
  assert.equal(getProfileInitial(null, "user@example.com"), "U");
});

test("routes profiles without a username to setup handle", () => {
  assert.equal(getPostAuthDestination(null), "/setup-handle");
  assert.equal(
    getPostAuthDestination({ username: null }),
    "/setup-handle",
  );
  assert.equal(getPostAuthDestination({ username: "gina" }), "/home");
});

test("prepares all setup handle profile fields for Supabase", () => {
  assert.deepEqual(
    prepareSetupHandleProfileUpdate(
      " @Gina ",
      " San Francisco, CA ",
      " Taco enthusiast. ",
      "https://example.com/avatar.jpg",
    ),
    {
      username: "Gina",
      city: "San Francisco, CA",
      bio: "Taco enthusiast.",
      avatar_url: "https://example.com/avatar.jpg",
    },
  );
});

test("prepares setup without an optional avatar", () => {
  assert.deepEqual(
    prepareSetupHandleProfileUpdate("gina", "Oakland", "", null),
    {
      username: "gina",
      city: "Oakland",
      bio: "",
      avatar_url: null,
    },
  );
});

test("does not prepare an empty username from blank handles", () => {
  assert.deepEqual(prepareSetupHandleProfileUpdate(" @@@ ", " Oakland "), {
    username: undefined,
    city: "Oakland",
    bio: "",
    avatar_url: null,
  });
});

test("summarizes profile categories from real category and entry rows", () => {
  const categories = [
    {
      id: "category-burrito",
      name: "Breakfast Burrito",
      cover_photo: null,
      tone: "gold",
      is_shared: false,
      share_id: null,
      created_at: "2026-06-20T00:00:00.000Z",
    },
    {
      id: "category-ramen",
      name: "Ramen",
      cover_photo: "https://example.com/ramen.jpg",
      tone: "clay",
      is_shared: true,
      share_id: "share-1",
      created_at: "2026-06-21T00:00:00.000Z",
    },
  ];
  const entries = [
    {
      id: "entry-low",
      category_id: "category-burrito",
      place_name: "Corner Cafe",
      city: "Oakland",
      notes: null,
      photo_url: null,
      created_at: "2026-06-22T00:00:00.000Z",
      taste: 8,
      value: 8,
      portion: 8,
      vibe: 8,
      overall_score: 8,
    },
    {
      id: "entry-high",
      category_id: "category-burrito",
      place_name: "Sunrise Cafe",
      city: "San Francisco",
      notes: null,
      photo_url: "https://example.com/burrito.jpg",
      created_at: "2026-06-23T00:00:00.000Z",
      taste: 10,
      value: 9,
      portion: 9,
      vibe: 8,
      overall_score: 9,
    },
  ];

  assert.deepEqual(summarizeProfileCategories(categories, entries), [
    {
      id: "category-burrito",
      name: "Breakfast Burrito",
      topEntry: "Sunrise Cafe",
      entryCount: 2,
      coverPhoto: "https://example.com/burrito.jpg",
      tone: "gold",
      isPublic: false,
      shareId: undefined,
    },
    {
      id: "category-ramen",
      name: "Ramen",
      topEntry: "No entries yet",
      entryCount: 0,
      coverPhoto: "https://example.com/ramen.jpg",
      tone: "clay",
      isPublic: true,
      shareId: "share-1",
    },
  ]);
});
