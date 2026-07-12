import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { Pressable, Text } from "react-native";

import { SearchResultsModal } from "@/components/search-results-modal";

/**
 * Renders the compact search launcher for the home screen.
 */
export function SearchPill() {
  const [isSearchVisible, setIsSearchVisible] = useState(false);

  return (
    <>
      <Pressable
        accessibilityLabel="Search entries"
        accessibilityRole="button"
        className="h-9 flex-row items-center gap-2 rounded-bestlist-md border border-subtle bg-white px-3"
        onPress={() => setIsSearchVisible(true)}
      >
        <Ionicons name="search" size={17} color="#888888" />
        <Text className="text-body text-secondary">
          Search dishes, places...
        </Text>
      </Pressable>

      <SearchResultsModal
        onClose={() => setIsSearchVisible(false)}
        visible={isSearchVisible}
      />
    </>
  );
}
