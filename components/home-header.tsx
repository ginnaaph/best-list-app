import { Link, type Href } from "expo-router";
import { Pressable, Text, View } from "react-native";

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
        <Text className="text-brand text-primary">BestList</Text>
      </View>

      <Link href={profileRoute} asChild>
        <Pressable
          accessibilityLabel="Open profile"
          className="h-7 w-7 items-center justify-center rounded-full bg-white shadow-card"
        >
          <View className="h-7 w-7 items-center justify-center rounded-full bg-accent">
            <Text className="text-label text-white">g</Text>
          </View>
        </Pressable>
      </Link>
    </View>
  );
}
