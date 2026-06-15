import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";

import { CategoryDetailScreen, CategoryNotFoundScreen } from "@/components";
import { sortEntries } from "@/lib/entry-score";
import { useStore } from "@/store";

export default function CategoryDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const categories = useStore((state) => state.categories);
  const category = categories.find((item) => item.id === id);
  const [isToggling, setIsToggling] = useState(false);

  const entries = useStore((state) => state.entries);
  const ensureCategorySeeded = useStore((state) => state.ensureCategorySeeded);
  const setCategoryPublic = useStore((state) => state.setCategoryPublic);

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

  const topEntry = sortEntries(categoryEntries, "overall")[0];
  const categoryWithStats = {
    ...category,
    entryCount: categoryEntries.length,
    topEntry: topEntry?.placeName ?? "No entries yet",
  };

  return (
    <CategoryDetailScreen
      category={categoryWithStats}
      entries={categoryEntries}
      onAddEntry={() => router.push(`/category/${category.id}/add-entry`)}
      onPublicChange={async (isPublic) => {
        setIsToggling(true);
        try {
          await setCategoryPublic(category.id, isPublic);
        } finally {
          setIsToggling(false);
        }
      }}
      toggleDisabled={isToggling}
    />
  );
}
