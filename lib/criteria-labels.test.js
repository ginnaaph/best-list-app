import assert from "node:assert/strict";
import test from "node:test";

import {
  DEFAULT_CRITERIA_LABELS,
  getCriteriaLabels,
} from "./criteria-labels.ts";

test("uses the defaults for categories without saved labels", () => {
  assert.deepEqual(getCriteriaLabels({ criteriaLabels: undefined }), [
    "Taste",
    "Value",
    "Portion",
    "Vibe",
  ]);
});

test("preserves a complete set of custom labels", () => {
  const criteriaLabels = [" Broth ", "Noodles", "Toppings", "Heat"];
  const labels = getCriteriaLabels({ criteriaLabels });

  assert.deepEqual(labels, criteriaLabels);
  assert.notStrictEqual(labels, criteriaLabels);
});

test("uses each slot's default for blank or whitespace-only labels", () => {
  assert.deepEqual(
    getCriteriaLabels({ criteriaLabels: ["Broth", "", "\t ", "Heat"] }),
    ["Broth", "Value", "Portion", "Heat"],
  );
});

test("uses each slot's default for missing or non-string labels", () => {
  assert.deepEqual(
    getCriteriaLabels({ criteriaLabels: ["Broth", 42, "Toppings"] }),
    ["Broth", "Value", "Toppings", "Vibe"],
  );
});

test("returns a fresh array when using the defaults", () => {
  const labels = getCriteriaLabels({});
  labels[0] = "Broth";

  assert.equal(DEFAULT_CRITERIA_LABELS[0], "Taste");
  assert.equal(getCriteriaLabels({})[0], "Taste");
});
