import type { Entry } from "@/types/entry";

export function calculateOverallScore(entry: Entry) {
  return (entry.taste + entry.value + entry.portion + entry.vibe) / 4;
}
