import { router } from "expo-router";
import { useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { EntryCard } from "@/components/entry-card";
import { FloatingAddButton } from "@/components/floating-add-button";
import { colors } from "@/constants/theme";
import { sortEntries, type SortDimension } from "@/lib/entry-score";
import type { Category } from "@/types/category";
import type { Entry } from "@/types/entry";

const sortOptions: { label: string; value: SortDimension }[] = [
  { label: "Overall", value: "overall" },
  { label: "Taste", value: "taste" },
  { label: "Value", value: "value" },
  { label: "Portion", value: "portion" },
  { label: "Vibe", value: "vibe" },
];

type CategoryDetailScreenProps = {
  category: Category;
  entries: Entry[];
  onAddEntry: () => void;
};

export function CategoryDetailScreen({
  category,
  entries,
  onAddEntry,
}: CategoryDetailScreenProps) {
  const [selectedSort, setSelectedSort] = useState<SortDimension>("overall");
  const selectedSortLabel =
    sortOptions.find((option) => option.value === selectedSort)?.label ??
    "Overall";
  const sortedEntries = sortEntries(entries, selectedSort);
  const hasEntries = sortedEntries.length > 0;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.surface }}>
      <View className="flex-1 px-5 pb-5 pt-4">
        <View className="flex-row items-center justify-between">
          <Pressable
            accessibilityLabel="Go back"
            className="h-9 w-9 items-center justify-center rounded-full bg-white shadow-card"
            onPress={() =>
              router.canGoBack() ? router.back() : router.replace("/")
            }
          >
            <Text className="text-card-title text-primary">‹</Text>
          </Pressable>

          <View className="h-7 w-7 items-center justify-center rounded-full bg-white shadow-card">
            <View className="h-7 w-7 items-center justify-center rounded-full bg-accent">
              <Text className="text-label text-white">G</Text>
            </View>
          </View>
        </View>

        <View className="gap-2">
          <Text className="text-center font-display text-[38px] font-bold leading-10 text-primary">
            {category.name}
          </Text>

          <View className="flex-row items-center justify-between">
            <Text className="font-mono-bestlist text-[10px] font-bold uppercase leading-3.25 text-secondary">
              Just {sortedEntries.length}
            </Text>
            <Text className="font-mono-bestlist text-[10px] font-bold uppercase leading-3.25 text-secondary">
              Sort: {selectedSortLabel}
            </Text>
          </View>

          <View className="flex-row flex-wrap gap-2">
            {sortOptions.map((option) => {
              const isSelected = option.value === selectedSort;

              return (
                <Pressable
                  key={option.value}
                  accessibilityRole="button"
                  accessibilityState={{ selected: isSelected }}
                  className={`h-8 items-center justify-center rounded-full border px-4 ${
                    isSelected
                      ? "border-accent bg-accent"
                      : "border-subtle bg-white"
                  }`}
                  onPress={() => setSelectedSort(option.value)}
                >
                  <Text
                    className={`text-label uppercase ${
                      isSelected ? "text-white" : "text-primary"
                    }`}
                  >
                    {option.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <ScrollView
          className="mt-6 flex-1"
          showsVerticalScrollIndicator={false}
        >
          {hasEntries ? (
            <View className="gap-4 pb-24">
              {sortedEntries.map((entry, index) => (
                <Pressable
                  key={entry.id}
                  accessibilityRole="button"
                  accessibilityLabel={`Open ${entry.placeName}`}
                  onPress={() => router.push(`/entry/${entry.id}`)}
                >
                  <EntryCard entry={entry} rank={index + 1} />
                </Pressable>
              ))}
            </View>
          ) : (
            <View className="items-center gap-4 pb-24 pt-20">
              <Text className="text-center text-screen-title text-primary">
                No entries yet. Add the first one!
              </Text>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Add the first entry"
                onPress={onAddEntry}
                className="h-11 items-center justify-center rounded-full bg-accent px-6 shadow-card"
              >
                <Text className="text-label uppercase text-white">
                  Add Entry
                </Text>
              </Pressable>
            </View>
          )}
        </ScrollView>

        {hasEntries ? (
          <FloatingAddButton
            accessibilityLabel="Add entry"
            onPress={onAddEntry}
          />
        ) : null}
      </View>
    </SafeAreaView>
  );
}

export function CategoryNotFoundScreen() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.surface }}>
      <View className="flex-1 px-5 pb-5 pt-4">
        <View className="flex-row items-center justify-between">
          <Pressable
            accessibilityLabel="Go back"
            className="h-9 w-9 items-center justify-center rounded-full bg-white shadow-card"
            onPress={() =>
              router.canGoBack() ? router.back() : router.replace("/")
            }
          >
            <Text className="text-card-title text-primary">‹</Text>
          </Pressable>

          <View className="h-7 w-7 items-center justify-center rounded-full bg-white shadow-card">
            <View className="h-5 w-5 items-center justify-center rounded-full bg-accent">
              <Text className="text-label text-white">g</Text>
            </View>
          </View>
        </View>

        <View className="mt-6 gap-3">
          <Text className="text-screen-title text-primary">
            Category not found
          </Text>
          <Text className="text-body text-secondary">
            This list does not exist yet.
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}
