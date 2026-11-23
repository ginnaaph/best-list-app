// The entry score columns taste, value, portion, and vibe are slots 1–4.
// Each criterion_N_label is the display name for slot N. The score column
// names stayed the same so older app installs keep working.
import type { Category, CriteriaLabels } from "@/types/category";

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
