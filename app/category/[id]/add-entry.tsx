import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { Alert, Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { CategoryNotFoundScreen } from "@/components";
import { EntryForm, type EntryFormValues } from "@/components/entry-form";
import { colors } from "@/constants/theme";
import { useStore } from "@/store";

export default function AddEntryScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const categories = useStore((state) => state.categories);
  const category = categories.find((item) => item.id === id);
  const addEntry = useStore((state) => state.addEntry);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = (values: EntryFormValues) => {
    if (isSaving) {
      return;
    }

    if (!category) {
      return;
    }

    if (!values.placeName.trim() || !values.city.trim()) {
      Alert.alert("Missing fields", "Please fill in Place Name and City.");
      return;
    }

    try {
      setIsSaving(true);
      addEntry({
        categoryId: category.id,
        placeName: values.placeName.trim(),
        city: values.city.trim(),
        taste: values.taste,
        value: values.value,
        portion: values.portion,
        vibe: values.vibe,
        notes: values.notes?.trim() || undefined,
        photoUrl: values.photoUrl,
      });

      router.replace(`/category/${category.id}`);
    } catch (error) {
      console.error("Failed to save entry:", error);
      setIsSaving(false);
    }
  };

  if (!category) {
    return <CategoryNotFoundScreen />;
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.surface }}>
      <View className="flex-row items-center justify-between px-5 pb-2 pt-4">
        <Pressable
          accessibilityLabel="Go back"
          className="h-9 w-9 items-center justify-center rounded-full bg-white shadow-card"
          onPress={() => router.back()}
        >
          <Text className="text-card-title text-primary">‹</Text>
        </Pressable>

        <Text className="font-display text-[18px] font-bold text-primary">
          Add Entry
        </Text>

        <View className="h-9 w-9" />
      </View>

      <EntryForm
        initialValues={{
          placeName: "",
          city: "",
          taste: 7,
          value: 7,
          portion: 7,
          vibe: 7,
          notes: "",
          photoUrl: undefined,
        }}
        saveLabel="Save Entry"
        saving={isSaving}
        onSave={handleSave}
      />
    </SafeAreaView>
  );
}
