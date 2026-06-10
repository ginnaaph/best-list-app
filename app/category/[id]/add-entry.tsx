import * as ImagePicker from "expo-image-picker";
import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { CategoryNotFoundScreen, ScoreSlider } from "@/components";
import { categories } from "@/data";
import { colors } from "@/constants/theme";
import { useStore } from "@/store";

function TextField({
  label,
  placeholder,
  value,
  onChange,
  multiline,
}: {
  label: string;
  placeholder: string;
  value: string;
  onChange: (val: string) => void;
  multiline?: boolean;
}) {
  return (
    <View className="gap-1.5">
      <Text className="font-mono-bestlist text-[10px] font-bold uppercase tracking-[1.5px] text-accent">
        {label}
      </Text>
      <TextInput
        className={`rounded-xl border border-subtle bg-white px-4 font-body text-[15px] text-primary ${
          multiline ? "py-3" : "h-11"
        }`}
        placeholder={placeholder}
        placeholderTextColor={colors.secondaryText}
        value={value}
        onChangeText={onChange}
        multiline={multiline}
        numberOfLines={multiline ? 4 : 1}
        textAlignVertical={multiline ? "top" : "center"}
        returnKeyType={multiline ? "default" : "next"}
      />
    </View>
  );
}

export default function AddEntryScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
export default function AddEntryScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const categories = useStore((state) => state.categories);
  const category = categories.find((item) => item.id === id);
  const addEntry = useStore((state) => state.addEntry);
  const addEntry = useStore((state) => state.addEntry);

  const [placeName, setPlaceName] = useState("");
  const [city, setCity] = useState("");
  const [taste, setTaste] = useState(7);
  const [value, setValue] = useState(7);
  const [portion, setPortion] = useState(7);
  const [vibe, setVibe] = useState(7);
  const [notes, setNotes] = useState("");
  const [photoUrl, setPhotoUrl] = useState<string | undefined>();
  const [isSaving, setIsSaving] = useState(false);

  const handlePickPhoto = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert(
        "Photo access needed",
        "Please allow photo access to add an entry photo."
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      aspect: [4, 3],
      mediaTypes: ["images"],
      quality: 0.8,
    });

    if (!result.canceled) {
      setPhotoUrl(result.assets[0]?.uri);
    }
  };

  const handleSave = () => {
    if (isSaving) {
      return;
    }

    if (!category) {
      return;
    }

    if (!placeName.trim() || !city.trim()) {
      Alert.alert(
        "Missing fields",
        "Please fill in Place Name and City."
      );
      return;
    }

    try {
      setIsSaving(true);
      addEntry({
        categoryId: category.id,
        placeName: placeName.trim(),
        city: city.trim(),
        taste,
        value,
        portion,
        vibe,
        notes: notes.trim() || undefined,
        photoUrl,
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
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
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

        <ScrollView
          className="flex-1 px-5"
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View className="gap-4 pb-10 pt-4">
            <View className="gap-2">
              <Text className="font-mono-bestlist text-[10px] font-bold uppercase tracking-[1.5px] text-secondary">
                Photo (optional)
              </Text>
              {photoUrl ? (
                <Image
                  className="h-44 w-full rounded-xl bg-white"
                  source={{ uri: photoUrl }}
                />
              ) : (
                <View className="h-44 items-center justify-center rounded-xl border border-dashed border-subtle bg-white">
                  <Text className="font-body text-[14px] text-secondary">
                    No photo selected
                  </Text>
                </View>
              )}
              <View className="flex-row gap-3">
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={
                    photoUrl ? "Change photo" : "Choose photo"
                  }
                  className="h-11 flex-1 items-center justify-center rounded-full bg-primary px-4"
                  onPress={handlePickPhoto}
                >
                  <Text className="text-label uppercase text-white">
                    {photoUrl ? "Change Photo" : "Choose Photo"}
                  </Text>
                </Pressable>

                {photoUrl ? (
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Remove photo"
                    className="h-11 items-center justify-center rounded-full border border-subtle bg-white px-4"
                    onPress={() => setPhotoUrl(undefined)}
                  >
                    <Text className="text-label uppercase text-primary">
                      Remove
                    </Text>
                  </Pressable>
                ) : null}
              </View>
            </View>

            <TextField
              label="Place Name"
              placeholder="e.g. Nopalito"
              value={placeName}
              onChange={setPlaceName}
            />

            <TextField
              label="City"
              placeholder="e.g. San Francisco, CA"
              value={city}
              onChange={setCity}
            />

            <View className="rounded-2xl bg-white p-4 shadow-card">
              <Text className="mb-3 font-mono-bestlist text-[10px] font-bold uppercase tracking-[1.5px] text-accent">
                Scores
              </Text>
              <View className="gap-3">
                <ScoreSlider label="Taste" value={taste} onChange={setTaste} />
                <ScoreSlider label="Value" value={value} onChange={setValue} />
                <ScoreSlider
                  label="Portion"
                  value={portion}
                  onChange={setPortion}
                />
                <ScoreSlider label="Vibe" value={vibe} onChange={setVibe} />
              </View>
            </View>

            <TextField
              label="Note (optional)"
              placeholder="Anything worth remembering..."
              value={notes}
              onChange={setNotes}
              multiline
            />

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Save entry"
              className="mt-2 h-13 items-center justify-center rounded-full bg-accent shadow-card"
              onPress={handleSave}
            >
              <Text className="font-body text-[15px] font-bold uppercase tracking-[1px] text-white">
                Save Entry
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
