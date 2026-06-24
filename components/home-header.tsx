import { Link, type Href } from "expo-router";
import { Pressable, Text, View } from "react-native";

import { CurrentUserAvatar } from "@/components/current-user-avatar";
import { useStore } from "@/store";

const profileRoute = "/profile" as Href;

export function HomeHeader() {
  const entries = useStore((state) => state.entries);
  const loggedCount = entries.length;
  const cityCount = new Set(entries.map((entry) => entry.city).filter(Boolean))
    .size;

  return (
    <View className="flex-row items-center justify-between">
      <View className="gap-2">
        <Text className="text-caption uppercase text-secondary">
          {loggedCount} logged - {cityCount} cities
        </Text>
        <View className="flex-row">
          <Text className="text-brand text-primary">Best</Text>
          <Text className="text-brand text-bestlist-green">List</Text>
        </View>
      </View>

      <Link href={profileRoute} asChild>
        <Pressable
          accessibilityLabel="Open profile"
          className="h-7 w-7 items-center justify-center rounded-full bg-white shadow-card"
        >
          <CurrentUserAvatar />
        </Pressable>
      </Link>
    </View>
  );
}
