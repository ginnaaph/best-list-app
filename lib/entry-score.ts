import type { Entry } from "@/types/entry";

export type SortDimension = "overall" | "taste" | "value" | "portion" | "vibe";

export function calculateOverallScore(entry: Entry): number {
  const total =
    (entry.taste ?? 0) + (entry.value ?? 0) + (entry.portion ?? 0) + (entry.vibe ?? 0);

  return Math.round((total / 4) * 10) / 10;
}

export function sortEntries(entries: Entry[], dimension: SortDimension): Entry[] {
  return [...entries].sort((firstEntry, secondEntry) => {
    const firstScore =
      dimension === "overall" ? calculateOverallScore(firstEntry) : firstEntry[dimension];
    const secondScore =
      dimension === "overall" ? calculateOverallScore(secondEntry) : secondEntry[dimension];

    return secondScore - firstScore;
  });
}
