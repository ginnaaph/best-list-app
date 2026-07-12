import { View } from "react-native";

import { CategoryCard } from "@/components/category-card";
import type { Category } from "@/types/category";

type CategoryGridProps = {
  categories: Category[];
};

/**
 * Renders the responsive category card grid.
 */
export function CategoryGrid({ categories }: CategoryGridProps) {
  return (
    <View className="flex-row flex-wrap justify-between gap-y-4">
      {categories.map((category) => (
        <CategoryCard key={category.id} category={category} />
      ))}
    </View>
  );
}
