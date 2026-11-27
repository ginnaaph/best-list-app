import assert from "node:assert/strict";
import test from "node:test";

import {
  DEFAULT_CRITERIA_LABELS,
  getCriteriaLabels,
  haveCriteriaLabelsChanged,
  validateCriteriaLabels,
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

test("reports no change for identical labels", () => {
  assert.equal(
    haveCriteriaLabelsChanged(DEFAULT_CRITERIA_LABELS, [
      "Taste",
      "Value",
      "Portion",
      "Vibe",
    ]),
    false,
  );
});

test("ignores surrounding spaces in saved and current labels", () => {
  assert.equal(
    haveCriteriaLabelsChanged(
      [" Taste ", "Value", "Portion", "Vibe"],
      ["Taste", " Value ", "Portion", "Vibe"],
    ),
    false,
  );
});

test("reports a change when one label differs", () => {
  assert.equal(
    haveCriteriaLabelsChanged(DEFAULT_CRITERIA_LABELS, [
      "Taste",
      "Value",
      "Portion",
      "Heat",
    ]),
    true,
  );
});

test("accepts all four default labels", () => {
  assert.deepEqual(validateCriteriaLabels(DEFAULT_CRITERIA_LABELS), [
    null,
    null,
    null,
    null,
  ]);
});

test("flags empty and whitespace-only labels", () => {
  assert.deepEqual(validateCriteriaLabels(["Taste", "", "Portion", "Vibe"]), [
    null,
    "Give this criterion a name.",
    null,
    null,
  ]);
  assert.deepEqual(validateCriteriaLabels(["Taste", "Value", "\t ", "Vibe"]), [
    null,
    null,
    "Give this criterion a name.",
    null,
  ]);
});

test("flags only the later duplicate across differences in case and spacing", () => {
  assert.deepEqual(
    validateCriteriaLabels(["Broth Flavor", "Value", " broth   FLAVOR ", "Vibe"]),
    [null, null, "Already used — pick a different name.", null],
  );
});

test("flags the second and third occurrences of the same label", () => {
  assert.deepEqual(validateCriteriaLabels(["Taste", "Taste", "Taste", "Vibe"]), [
    null,
    "Already used — pick a different name.",
    "Already used — pick a different name.",
    null,
  ]);
});

test("flags each blank label with the blank message", () => {
  assert.deepEqual(validateCriteriaLabels(["", "Value", "  ", "Vibe"]), [
    "Give this criterion a name.",
    null,
    "Give this criterion a name.",
    null,
  ]);
});
