import { Ionicons } from "@expo/vector-icons";
import { Text, View } from "react-native";

export function SearchPill() {
  return (
    <View className="h-9 flex-row items-center gap-2 rounded-bestlist-md border border-subtle bg-white px-3">
      <Ionicons name="search" size={17} color="#888888" />
      <Text className="text-body text-secondary">Search dishes, places...</Text>
    </View>
  );
}
