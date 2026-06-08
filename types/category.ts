export type CategoryCardTone = "gold" | "clay" | "tomato" | "brick" | "espresso" | "caramel";

export type CategoryId =
  | "breakfast-burrito"
  | "ramen"
  | "tacos"
  | "pizza"
  | "coffee"
  | "cookies";

export type Category = {
  id: CategoryId;
  name: string;
  topEntry: string;
  entryCount: number;
  tone: CategoryCardTone;
};
