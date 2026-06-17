import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { Alert, Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { EntryForm, type EntryFormValues } from "@/components/entry-form";
import { colors } from "@/constants/theme";
import { useStore } from "@/store";

function EntryNotFoundScreen() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.surface }}>
      <View className="flex-1 px-5 pb-5 pt-4">
        <View className="flex-row items-center justify-between">
          <Pressable
            accessibilityLabel="Go back"
            className="h-9 w-9 items-center justify-center rounded-full bg-white shadow-card"
            onPress={() =>
              router.canGoBack() ? router.back() : router.replace("/")
            }
          >
            <Text className="text-card-title text-primary">‹</Text>
          </Pressable>
        </View>

        <View className="mt-6 gap-3">
          <Text className="text-screen-title text-primary">
            Entry not found
          </Text>
          <Text className="text-body text-secondary">
            This entry does not exist yet.
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

export default function EditEntryScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const entries = useStore((state) => state.entries);
  const entry = entries.find((item) => item.id === id);
  const updateEntry = useStore((state) => state.updateEntry);
  const deleteEntry = useStore((state) => state.deleteEntry);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async (values: EntryFormValues) => {
    if (isSaving || !entry) {
      return;
    }

    if (!values.placeName.trim() || !values.city.trim()) {
      Alert.alert("Missing fields", "Please fill in Place Name and City.");
      return;
    }

    try {
      setIsSaving(true);
      await updateEntry(entry.id, {
        placeName: values.placeName.trim(),
        city: values.city.trim(),
        taste: values.taste,
        value: values.value,
        portion: values.portion,
        vibe: values.vibe,
        notes: values.notes?.trim() || undefined,
        photoUrl: values.photoUrl,
      });

      router.replace(`/entry/${entry.id}`);
    } catch (error: unknown) {
      console.error("Failed to update entry:", error);
      Alert.alert("Save failed", "Unable to save this entry. Try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = () => {
    if (!entry) {
      return;
    }

    Alert.alert(
      "Delete entry?",
      "This will remove the entry from this category.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            if (isSaving) return;
            const categoryId = entry.categoryId;
            setIsSaving(true);

            try {
              const deletedEntry = await deleteEntry(entry.id);

              if (!deletedEntry) {
                Alert.alert(
                  "Delete failed",
                  "Unable to delete this entry. Try again.",
                );
                return;
              }

              router.replace(`/category/${categoryId}`);
            } catch (error: unknown) {
              console.error("Failed to delete entry:", error);
              Alert.alert(
                "Delete failed",
                "Unable to delete this entry. Try again.",
              );
            } finally {
              setIsSaving(false);
            }
          },
        },
      ],
    );
  };

  if (!entry) {
    return <EntryNotFoundScreen />;
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
          Edit Entry
        </Text>

        <View className="h-9 w-9" />
      </View>

      <EntryForm
        initialValues={{
          placeName: entry.placeName,
          city: entry.city,
          taste: entry.taste,
          value: entry.value,
          portion: entry.portion,
          vibe: entry.vibe,
          notes: entry.notes ?? "",
          photoUrl: entry.photoUrl,
        }}
        saveLabel={isSaving ? "Saving..." : "Save"}
        saving={isSaving}
        onSave={handleSave}
        onDelete={handleDelete}
      />
    </SafeAreaView>
  );
}
