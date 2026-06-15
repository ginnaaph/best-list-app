import { router } from "expo-router";
import { useState } from "react";
import {
  Image,
  Pressable,
  ScrollView,
  Share,
  Switch,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { EntryCard } from "@/components/entry-card";
import { FloatingAddButton } from "@/components/floating-add-button";
import { images } from "@/constants/images";
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
  onPublicChange: (isPublic: boolean) => void;
  toggleDisabled: boolean;
};

export function CategoryDetailScreen({
  category,
  entries,
  onAddEntry,
  onPublicChange,
  toggleDisabled,
}: CategoryDetailScreenProps) {
  const [selectedSort, setSelectedSort] = useState<SortDimension>("overall");
  const selectedSortLabel =
    sortOptions.find((option) => option.value === selectedSort)?.label ??
    "Overall";
  const sortedEntries = sortEntries(entries, selectedSort);
  const hasEntries = sortedEntries.length > 0;
  const shareCategory = () => {
    if (!category.isPublic) {
      return;
    }

    void Share.share({
      message: `My best ${category.name} list on BestList 🌮\nbestlist://share/${category.id}`,
    });
  };

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

          <View className="flex-row items-center gap-2">
            <Pressable
              accessibilityLabel="Open profile"
              accessibilityRole="button"
              className="h-7 w-7 items-center justify-center rounded-full bg-white shadow-card"
              onPress={() => router.push("/profile")}
            >
              <View className="h-7 w-7 items-center justify-center rounded-full bg-accent">
                <Text className="text-label text-white">G</Text>
              </View>
            </Pressable>

            <View className="h-9 justify-center rounded-full bg-white px-2 shadow-card">
              <Switch
                accessibilityLabel="Make list public"
                disabled={toggleDisabled}
                onValueChange={onPublicChange}
                value={category.isPublic}
              />
            </View>

            <Pressable
              accessibilityLabel={`Share ${category.name}`}
              accessibilityRole="button"
              accessibilityState={{ disabled: !category.isPublic }}
              className={`h-9 w-9 items-center justify-center rounded-full bg-white shadow-card ${
                category.isPublic ? "" : "opacity-50"
              }`}
              disabled={!category.isPublic}
              onPress={shareCategory}
            >
              <Image
                source={images.shareIcon}
                className="h-5 w-5"
                resizeMode="contain"
              />
            </Pressable>
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

          <Pressable
            accessibilityLabel="Open profile"
            accessibilityRole="button"
            className="h-7 w-7 items-center justify-center rounded-full bg-white shadow-card"
            onPress={() => router.push("/profile")}
          >
            <View className="h-7 w-7 items-center justify-center rounded-full bg-accent">
              <Text className="text-label text-white">G</Text>
            </View>
          </Pressable>
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
