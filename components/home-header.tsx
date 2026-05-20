import { Text, View } from "react-native";

export function HomeHeader() {
  return (
    <View className="flex-row items-center justify-between">
      <View className="gap-2">
        <Text className="text-caption uppercase text-secondary">108 logged - 14 cities</Text>
        <Text className="text-brand text-primary">BestList</Text>
      </View>

      <View className="h-7 w-7 items-center justify-center rounded-full bg-white shadow-card">
        <View className="h-5 w-5 items-center justify-center rounded-full bg-accent">
          <Text className="text-label text-white">K</Text>
        </View>
      </View>
    </View>
  );
}
