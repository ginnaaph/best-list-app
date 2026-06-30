import { type Href, useRouter } from "expo-router";
import { Pressable, Text, View } from "react-native";

const addCategoryRoute = "/add-category" as Href;

export function HomeEmptyState() {
  const router = useRouter();

  return (
    <View className="gap-6">
      <View className="gap-3">
        <Text className="text-screen-title text-primary">
          {"Let's start your first list."}
        </Text>
        <Text className="text-body text-secondary">
          Pick a food you have opinions about — or write your own.
        </Text>
      </View>

      <Pressable
        accessibilityLabel="Start a new list"
        accessibilityRole="button"
        className="h-64 items-center justify-center gap-5 rounded-bestlist-xl border-2 border-dashed border-subtle bg-card"
        onPress={() => router.push(addCategoryRoute)}
      >
        <View className="h-16 w-16 items-center justify-center rounded-full border-2 border-dashed border-bestlist-green">
          <Text className="text-screen-title text-accent">+</Text>
        </View>

        <View className="items-center gap-1">
          <Text className="text-card-title text-primary">Start a new list</Text>
          <Text className="text-body text-secondary">
            Name a food you eat often
          </Text>
        </View>
      </Pressable>

      <Text className="text-center text-body text-secondary">
        Log one entry — see where it ranks.
      </Text>
    </View>
  );
}
