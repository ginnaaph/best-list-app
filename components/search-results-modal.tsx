import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  FlatList,
  Modal,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";
import {
  SafeAreaProvider,
  SafeAreaView,
} from "react-native-safe-area-context";

import { colors } from "@/constants/theme";
import { searchEntries } from "@/lib/search-entries";
import { useStore } from "@/store";

type SearchResultsModalProps = {
  visible: boolean;
  onClose: () => void;
};

/**
 * Renders the full-screen entry search modal.
 */
export function SearchResultsModal({
  visible,
  onClose,
}: SearchResultsModalProps) {
  const router = useRouter();
  const categories = useStore((state) => state.categories);
  const entries = useStore((state) => state.entries);
  const [query, setQuery] = useState("");
  const results = searchEntries(entries, categories, query);
  const hasQuery = query.trim().length > 0;

  function closeModal() {
    setQuery("");
    onClose();
  }

  function openEntry(entryId: string) {
    closeModal();
    requestAnimationFrame(() => router.push(`/entry/${entryId}`));
  }

  return (
    <Modal
      animationType="slide"
      onRequestClose={closeModal}
      presentationStyle="fullScreen"
      visible={visible}
    >
      <SafeAreaProvider>
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.surface }}>
          <View className="flex-1 px-5 pb-5 pt-4">
          <View className="flex-row items-center gap-3">
            <View className="h-10 flex-1 flex-row items-center gap-2 rounded-bestlist-md border border-subtle bg-white px-3">
              <Ionicons name="search" size={17} color="#888888" />
              <TextInput
                accessibilityLabel="Search entries"
                autoCapitalize="none"
                autoCorrect={false}
                autoFocus
                className="flex-1 text-body text-primary"
                onChangeText={setQuery}
                placeholder="Search dishes, places..."
                placeholderTextColor="#888888"
                returnKeyType="search"
                value={query}
              />
              {hasQuery ? (
                <Pressable
                  accessibilityLabel="Clear search"
                  accessibilityRole="button"
                  className="h-7 w-7 items-center justify-center"
                  onPress={() => setQuery("")}
                >
                  <Ionicons name="close-circle" size={18} color="#888888" />
                </Pressable>
              ) : null}
            </View>

            <Pressable
              accessibilityLabel="Close search"
              accessibilityRole="button"
              className="h-10 justify-center"
              onPress={closeModal}
            >
              <Text className="text-body font-bold text-accent">Close</Text>
            </Pressable>
          </View>

          {hasQuery ? (
            <Text className="pb-3 pt-6 text-caption uppercase text-secondary">
              {results.length} {results.length === 1 ? "result" : "results"}
            </Text>
          ) : null}

          <FlatList
            contentContainerClassName={
              results.length > 0 ? "gap-3 pb-8" : "flex-grow"
            }
            data={results}
            keyboardShouldPersistTaps="handled"
            keyExtractor={(result) => result.entry.id}
            renderItem={({ item }) => (
              <Pressable
                accessibilityLabel={`Open ${item.entry.placeName}`}
                accessibilityRole="button"
                className="rounded-bestlist-xl bg-white px-5 py-4 shadow-card"
                onPress={() => openEntry(item.entry.id)}
              >
                <View className="flex-row items-center justify-between gap-4">
                  <View className="min-w-0 flex-1 gap-1">
                    <Text
                      className="text-label uppercase text-secondary"
                      numberOfLines={1}
                    >
                      {item.categoryName}
                    </Text>
                    <Text
                      className="text-card-title text-primary"
                      numberOfLines={1}
                    >
                      {item.entry.placeName}
                    </Text>
                    <Text
                      className="text-body text-secondary"
                      numberOfLines={1}
                    >
                      {item.entry.city}
                    </Text>
                  </View>

                  <Text className="text-screen-title text-accent">
                    {item.overallScore.toFixed(1)}
                  </Text>
                </View>
              </Pressable>
            )}
            ListEmptyComponent={
              <View className="flex-1 items-center justify-center px-8 pb-20">
                <Ionicons name="search" size={28} color="#888888" />
                <Text className="mt-3 text-center text-card-title text-primary">
                  {hasQuery ? "No matching entries" : "Search your entries"}
                </Text>
                <Text className="mt-2 text-center text-body text-secondary">
                  {hasQuery
                    ? "Try a category, place, or city."
                    : "Find dishes by category, place, or city."}
                </Text>
              </View>
            }
            showsVerticalScrollIndicator={false}
          />
          </View>
        </SafeAreaView>
      </SafeAreaProvider>
    </Modal>
  );
}
