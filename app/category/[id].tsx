import { useLocalSearchParams } from "expo-router";

import { CategoryDetailScreen, CategoryNotFoundScreen } from "@/components";
import { categories, mockEntries } from "@/data";

export default function CategoryDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const category = categories.find((item) => item.id === id);
  const categoryEntries = mockEntries.filter((entry) => entry.categoryId === id);

  if (!category) {
    return <CategoryNotFoundScreen />;
  }

  return <CategoryDetailScreen category={category} entries={categoryEntries} />;
}
