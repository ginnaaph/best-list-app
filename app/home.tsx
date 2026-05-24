import { ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import {
  CategoryGrid,
  FloatingAddButton,
  HomeHeader,
  SearchPill,
} from "@/components";
import { colors } from "@/constants/theme";
import { categories } from "@/data";

export default function Home() {
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
            <CategoryGrid categories={categories} />
          </View>
        </ScrollView>

        <FloatingAddButton />
      </View>
    </SafeAreaView>
  );
}
