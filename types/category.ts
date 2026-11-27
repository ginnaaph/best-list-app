export type CategoryCardTone = "gold" | "clay" | "tomato" | "brick" | "espresso" | "caramel";

export type CriteriaLabels = [string, string, string, string];

export type Category = {
  id: string;
  name: string;
  topEntry: string;
  entryCount: number;
  coverPhoto?: string;
  tone: CategoryCardTone;
  isPublic: boolean;
  shareId?: string;
  criteriaLabels?: CriteriaLabels;
};
