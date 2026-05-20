import { ScrollView, View } from "react-native";

import { CategoryGrid, FloatingAddButton, HomeHeader, SearchPill } from "@/components";
import { categories } from "@/data";

export default function Index() {
  return (
    <View className="flex-1 bg-app">
      <ScrollView
        className="flex-1"
        contentContainerClassName="min-h-full px-5 pb-28 pt-16"
        contentInsetAdjustmentBehavior="automatic"
        showsVerticalScrollIndicator={false}
      >
        <View className="gap-5">
          <HomeHeader />
          <SearchPill />
          <CategoryGrid categories={categories} />
        </View>
      </ScrollView>

      <FloatingAddButton />
    </View>
  );
}
