import assert from "node:assert/strict";
import test from "node:test";

import {
  getCategoryShareUrl,
  getNextCategorySharingState,
} from "./category-sharing.ts";

test("creates a share ID only the first time sharing is enabled", () => {
  let generatedIds = 0;
  const createShareId = () => {
    generatedIds += 1;
    return "11111111-1111-4111-8111-111111111111";
  };

  const enabled = getNextCategorySharingState(
    { isPublic: false },
    true,
    createShareId,
  );
  const enabledAgain = getNextCategorySharingState(
    enabled,
    true,
    createShareId,
  );

  assert.deepEqual(enabled, {
    isPublic: true,
    shareId: "11111111-1111-4111-8111-111111111111",
  });
  assert.deepEqual(enabledAgain, enabled);
  assert.equal(generatedIds, 1);
});

test("keeps the share ID when sharing is disabled", () => {
  const result = getNextCategorySharingState(
    {
      isPublic: true,
      shareId: "11111111-1111-4111-8111-111111111111",
    },
    false,
    () => "unused",
  );

  assert.deepEqual(result, {
    isPublic: false,
    shareId: "11111111-1111-4111-8111-111111111111",
  });
});

test("builds public URLs from share IDs instead of category IDs", () => {
  assert.equal(
    getCategoryShareUrl("11111111-1111-4111-8111-111111111111"),
    "https://bestlist-app.com/share/11111111-1111-4111-8111-111111111111",
  );
  assert.equal(getCategoryShareUrl(), undefined);
});
