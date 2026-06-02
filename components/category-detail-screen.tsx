import { router } from "expo-router";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { EntryCard } from "@/components/entry-card";
import { colors } from "@/constants/theme";
import { calculateOverallScore } from "@/lib/entry-score";
import type { Category } from "@/types/category";
import type { Entry } from "@/types/entry";

type CategoryDetailScreenProps = {
  category: Category;
  entries: Entry[];
};

export function CategoryDetailScreen({
  category,
  entries,
}: CategoryDetailScreenProps) {
  const sortedEntries = [...entries].sort(
    (firstEntry, secondEntry) =>
      calculateOverallScore(secondEntry) - calculateOverallScore(firstEntry),
  );

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
              <Text className="text-label text-white">K</Text>
            </View>
          </View>
        </View>

        <View className="mt-6 gap-3">
          <Text className="text-screen-title text-primary">
            {category.name}
          </Text>

          <View className="flex-row items-center justify-between">
            <Text className="font-mono-bestlist text-[10px] font-bold uppercase leading-3.25 text-secondary">
              Just {sortedEntries.length}
            </Text>
            <Text className="font-mono-bestlist text-[10px] font-bold uppercase leading-3.25 text-secondary">
              Sort: Overall
            </Text>
          </View>

          <View className="flex-row gap-2">
            <View className="h-8 items-center justify-center rounded-full border border-subtle bg-white px-4">
              <Text className="text-label uppercase text-primary">Taste</Text>
            </View>
            <View className="h-8 items-center justify-center rounded-full border border-subtle bg-white px-4">
              <Text className="text-label uppercase text-primary">Value</Text>
            </View>
            <View className="h-8 items-center justify-center rounded-full border border-subtle bg-white px-4">
              <Text className="text-label uppercase text-primary">Portion</Text>
            </View>
          </View>
        </View>

        <ScrollView
          className="mt-6 flex-1"
          showsVerticalScrollIndicator={false}
        >
          <View className="gap-4 pb-24">
            {sortedEntries.map((entry, index) => (
              <EntryCard key={entry.id} entry={entry} rank={index + 1} />
            ))}
          </View>
        </ScrollView>
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
              <Text className="text-label text-white">K</Text>
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
