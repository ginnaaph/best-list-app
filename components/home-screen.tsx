import { type Href, useRouter } from "expo-router";
import { ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import {
  CategoryGrid,
  FloatingAddButton,
  HomeHeader,
  SearchPill,
} from "@/components";
import { colors } from "@/constants/theme";
import { sortEntries } from "@/lib/entry-score";
import { useStore } from "@/store";

const addCategoryRoute = "/add-category" as Href;

export function HomeScreen() {
  const router = useRouter();
  const categories = useStore((state) => state.categories);
  const entries = useStore((state) => state.entries);
  const categoriesWithStats = categories.map((category) => {
    const categoryEntries = entries.filter(
      (entry) => entry.categoryId === category.id,
    );
    const topEntry = sortEntries(categoryEntries, "overall")[0];

    return {
      ...category,
      entryCount: categoryEntries.length,
      topEntry: topEntry?.placeName ?? "No entries yet",
    };
  });

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.surface }}>
      <View className="flex-1 px-5 pb-5 pt-4">
        <HomeHeader />

        <ScrollView
          className="mt-5 flex-1"
          showsVerticalScrollIndicator={false}
        >
          <View className="gap-5 pb-24">
            <SearchPill />
            <CategoryGrid categories={categoriesWithStats} />
          </View>
        </ScrollView>

        <FloatingAddButton onPress={() => router.push(addCategoryRoute)} />
      </View>
    </SafeAreaView>
  );
}
