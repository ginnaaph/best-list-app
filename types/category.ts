export type CategoryCardTone = "gold" | "clay" | "tomato" | "brick" | "espresso" | "caramel";

export type Category = {
  id: string;
  name: string;
  topEntry: string;
  entryCount: number;
  tone: CategoryCardTone;
};
