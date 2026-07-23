import { type Href, useRouter } from "expo-router";
import { Alert, ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import {
  CategoryGrid,
  FloatingAddButton,
  HomeEmptyState,
  HomeHeader,
  SearchPill,
} from "@/components";
import { colors } from "@/constants/theme";
import { useAuthSession } from "@/hooks/use-auth-session";
import { sortEntries } from "@/lib/entry-score";
import { useStore } from "@/store";

const addCategoryRoute = "/add-category" as Href;
const signUpRoute = "/sign-up" as Href;

/**
 * Renders the authenticated home screen.
 */
export function HomeScreen() {
  const router = useRouter();
  const { isLoading, session } = useAuthSession();
  const categories = useStore((state) => state.categories);
  const entries = useStore((state) => state.entries);
  const isGuest = Boolean(session?.user.is_anonymous);
  const categoriesWithStats = categories.map((category) => {
    const categoryEntries = entries.filter(
      (entry) => entry.categoryId === category.id,
    );
    const topEntry = sortEntries(categoryEntries, "overall")[0];

    return {
      ...category,
      entryCount: categoryEntries.length,
      topEntry: topEntry?.placeName ?? "No entries yet",
      coverPhoto: topEntry?.photoUrl ?? category.coverPhoto,
    };
  });
  const handleAddCategoryPress = () => {
    if (isLoading) {
      return;
    }

    if (isGuest && categories.length >= 1) {
      Alert.alert(
        "Create an account to keep going",
        "Guests can save one list. Create an account to keep this one and start more.",
        [
          { text: "Not now", style: "cancel" },
          {
            text: "Create account",
            onPress: () => {
              // Temporary placeholder: plain sign-up creates a separate account today
              // and does not carry over the guest's existing lists. Real
              // guest-to-account linking is scope 3.
              router.push(signUpRoute);
            },
          },
        ],
      );
      return;
    }

    router.push(addCategoryRoute);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.surface }}>
      <View className="flex-1 px-5 pb-5 pt-4">
        <HomeHeader />

        <ScrollView
          className="mt-5 flex-1"
          showsVerticalScrollIndicator={false}
        >
          {categories.length === 0 ? (
            <HomeEmptyState />
          ) : (
            <View className="gap-5 pb-24">
              <SearchPill />
              <CategoryGrid categories={categoriesWithStats} />
            </View>
          )}
        </ScrollView>

        {categories.length > 0 && (
          <FloatingAddButton onPress={handleAddCategoryPress} />
        )}
      </View>
    </SafeAreaView>
  );
}
