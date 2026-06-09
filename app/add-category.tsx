import { router } from "expo-router";
import { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { colors } from "@/constants/theme";
import { useStore } from "@/store";

export default function AddCategoryScreen() {
  const addCategory = useStore((state) => state.addCategory);
  const [name, setName] = useState("");

  const handleSave = () => {
    const trimmedName = name.trim();

    if (!trimmedName) {
      Alert.alert("Missing name", "Please enter a category name.");
      return;
    }

    const newCategory = addCategory(trimmedName);
    router.replace(`/category/${newCategory.id}`);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.surface }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <View className="flex-1 px-5 pb-5 pt-4">
          <View className="flex-row items-center justify-between">
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Cancel"
              className="h-9 items-center justify-center rounded-full bg-white px-4 shadow-card"
              onPress={() => router.back()}
            >
              <Text className="text-label uppercase text-primary">Cancel</Text>
            </Pressable>

            <Text className="font-display text-[18px] font-bold text-primary">
              Add Category
            </Text>

            <View className="h-9 w-[77px]" />
          </View>

          <View className="mt-8 gap-5">
            <View className="gap-2">
              <Text className="font-mono-bestlist text-[10px] font-bold uppercase tracking-[1.5px] text-secondary">
                Category Name
              </Text>
              <TextInput
                autoCapitalize="words"
                autoFocus
                className="h-12 rounded-xl border border-subtle bg-white px-4 font-body text-[16px] text-primary"
                placeholder="e.g. Breakfast Burrito"
                placeholderTextColor={colors.secondaryText}
                returnKeyType="done"
                value={name}
                onChangeText={setName}
                onSubmitEditing={handleSave}
              />
            </View>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Save category"
              className="h-13 items-center justify-center rounded-full bg-accent shadow-card"
              onPress={handleSave}
            >
              <Text className="font-body text-[15px] font-bold uppercase tracking-[1px] text-white">
                Save Category
              </Text>
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
