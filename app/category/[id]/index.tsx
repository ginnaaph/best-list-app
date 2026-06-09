import { router, useLocalSearchParams } from "expo-router";
import { useEffect } from "react";

import { CategoryDetailScreen, CategoryNotFoundScreen } from "@/components";
import { categories } from "@/data";
import { useStore } from "@/store";

export default function CategoryDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const category = categories.find((item) => item.id === id);

  const entries = useStore((state) => state.entries);
  const ensureCategorySeeded = useStore((state) => state.ensureCategorySeeded);

  const categoryEntries = category
    ? entries.filter((entry) => entry.categoryId === category.id)
    : [];

  useEffect(() => {
    if (category) {
      ensureCategorySeeded(category.id);
    }
  }, [category, ensureCategorySeeded]);

  if (!category) {
    return <CategoryNotFoundScreen />;
  }

  return (
    <CategoryDetailScreen
      category={category}
      entries={categoryEntries}
      onAddEntry={() => router.push(`/category/${category.id}/add-entry`)}
    />
  );
}
