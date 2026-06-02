import { router } from "expo-router";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { colors } from "@/constants/theme";
import type { Category } from "@/types/category";

type CategoryDetailScreenProps = {
  category: Category;
};

export function CategoryDetailScreen({ category }: CategoryDetailScreenProps) {
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
              Just {category.entryCount}
            </Text>
            <Text className="font-mono-bestlist text-[10px] font-bold uppercase leading-3.25 text-secondary">
              Sort
            </Text>
          </View>

          <View className="flex-row gap-2">
            <View className="h-8 w-20 rounded-full border border-subtle bg-white" />
            <View className="h-8 w-16 rounded-full border border-subtle bg-white" />
            <View className="h-8 w-20 rounded-full border border-subtle bg-white" />
          </View>
        </View>

        <ScrollView
          className="mt-6 flex-1"
          showsVerticalScrollIndicator={false}
        >
          <View className="min-h-[520px] rounded-bestlist-lg border border-dashed border-subtle bg-white/50" />
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
