import { useLocalSearchParams } from "expo-router";

import { CategoryDetailScreen, CategoryNotFoundScreen } from "@/components";
import { categories, entriesByCategory } from "@/data";

export default function CategoryDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const category = categories.find((item) => item.id === id);

  if (!category) {
    return <CategoryNotFoundScreen />;
  }

  const categoryEntries = entriesByCategory[category.id];

  return <CategoryDetailScreen category={category} entries={categoryEntries} />;
}
