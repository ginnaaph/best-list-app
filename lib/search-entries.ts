import type { Category } from "@/types/category";
import type { Entry } from "@/types/entry";

export type EntrySearchResult = {
  entry: Entry;
  categoryName: string;
  overallScore: number;
};

function getOverallScore(entry: Entry) {
  if (entry.overallScore !== undefined) {
    return entry.overallScore;
  }

  const total = entry.taste + entry.value + entry.portion + entry.vibe;

  return Math.round((total / 4) * 10) / 10;
}

export function searchEntries(
  entries: Entry[],
  categories: Category[],
  query: string,
): EntrySearchResult[] {
  const normalizedQuery = query.trim().toLocaleLowerCase();

  if (!normalizedQuery) {
    return [];
  }

  const categoryNames = new Map(
    categories.map((category) => [category.id, category.name]),
  );

  return entries
    .map((entry) => {
      const categoryName =
        categoryNames.get(entry.categoryId) ?? "Unknown category";

      return {
        entry,
        categoryName,
        overallScore: getOverallScore(entry),
      };
    })
    .filter(({ entry, categoryName }) =>
      [categoryName, entry.placeName, entry.city].some((value) =>
        value.toLocaleLowerCase().includes(normalizedQuery),
      ),
    )
    .sort(
      (firstResult, secondResult) =>
        secondResult.overallScore - firstResult.overallScore,
    );
}
