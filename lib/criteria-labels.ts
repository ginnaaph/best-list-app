// The entry score columns taste, value, portion, and vibe are slots 1–4.
// Each criterion_N_label is the display name for slot N. The score column
// names stayed the same so older app installs keep working.
import type { Category, CriteriaLabels } from "@/types/category";

/** The maximum criterion label length allowed by the database. */
export const MAX_CRITERIA_LABEL_LENGTH = 15;

export const DEFAULT_CRITERIA_LABELS: CriteriaLabels = [
  "Taste",
  "Value",
  "Portion",
  "Vibe",
];

function getLabel(label: unknown, fallback: string): string {
  return typeof label === "string" && label.trim() ? label : fallback;
}

/**
 * Resolves the display label for each score slot.
 *
 * @param category - The category whose saved labels may be missing or blank.
 * @returns A new tuple with a default for each missing or invalid label.
 */
export function getCriteriaLabels(
  category: Pick<Category, "criteriaLabels">,
): CriteriaLabels {
  const labels = category.criteriaLabels;

  return [
    getLabel(labels?.[0], DEFAULT_CRITERIA_LABELS[0]),
    getLabel(labels?.[1], DEFAULT_CRITERIA_LABELS[1]),
    getLabel(labels?.[2], DEFAULT_CRITERIA_LABELS[2]),
    getLabel(labels?.[3], DEFAULT_CRITERIA_LABELS[3]),
  ];
}

/**
 * Checks criterion labels for blank names and duplicates.
 *
 * @param labels - The four labels in score slot order.
 * @returns One error message or null per slot.
 */
export function validateCriteriaLabels(
  labels: CriteriaLabels,
): [string | null, string | null, string | null, string | null] {
  const seen = new Set<string>();

  function validateLabel(label: string): string | null {
    const name = label.trim().toLowerCase().replace(/\s+/g, " ");
    if (!name) return "Give this criterion a name.";
    if (seen.has(name)) return "Already used — pick a different name.";

    seen.add(name);
    return null;
  }

  return [
    validateLabel(labels[0]),
    validateLabel(labels[1]),
    validateLabel(labels[2]),
    validateLabel(labels[3]),
  ];
}
