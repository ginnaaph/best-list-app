import * as ImagePicker from "expo-image-picker";
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

import { colors } from "@/constants/theme";
import { ScoreSlider } from "@/components/score-slider";

export type EntryFormValues = {
  placeName: string;
  city: string;
  taste: number;
  value: number;
  portion: number;
  vibe: number;
  notes?: string;
  photoUrl?: string;
};

type EntryFormProps = {
  initialValues: EntryFormValues;
  saveLabel: string;
  saving: boolean;
  onSave: (values: EntryFormValues) => void;
  onDelete?: () => void;
};

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

export function EntryForm({
  initialValues,
  saveLabel,
  saving,
  onSave,
  onDelete,
}: EntryFormProps) {
  const [placeName, setPlaceName] = useState(initialValues.placeName);
  const [city, setCity] = useState(initialValues.city);
  const [taste, setTaste] = useState(initialValues.taste);
  const [value, setValue] = useState(initialValues.value);
  const [portion, setPortion] = useState(initialValues.portion);
  const [vibe, setVibe] = useState(initialValues.vibe);
  const [notes, setNotes] = useState(initialValues.notes ?? "");
  const [photoUrl, setPhotoUrl] = useState<string | undefined>(
    initialValues.photoUrl,
  );

  const handlePickPhoto = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert(
        "Photo access needed",
        "Please allow photo access to add an entry photo.",
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
    onSave({
      placeName,
      city,
      taste,
      value,
      portion,
      vibe,
      notes,
      photoUrl,
    });
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
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

            <Pressable
              accessibilityRole="button"
              accessibilityLabel={photoUrl ? "Change photo" : "Add photo"}
              onPress={handlePickPhoto}
            >
              {photoUrl ? (
                <Image
                  className="h-44 w-full rounded-xl bg-white"
                  source={{ uri: photoUrl }}
                />
              ) : (
                <View className="h-44 items-center justify-center rounded-xl border border-dashed border-subtle bg-white gap-2">
                  <Text className="text-3xl">📷</Text>
                  <Text className="font-body text-[14px] text-secondary">
                    Tap to add a photo
                  </Text>
                </View>
              )}
            </Pressable>

            {photoUrl ? (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Remove photo"
                className="h-11 items-center justify-center rounded-full border border-subtle bg-white px-4"
                onPress={() => setPhotoUrl(undefined)}
              >
                <Text className="font-mono-bestlist text-[10px] font-bold uppercase tracking-[1.5px] text-primary">
                  Remove Photo
                </Text>
              </Pressable>
            ) : null}
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
            accessibilityLabel={saveLabel}
            className="mt-2 h-13 items-center justify-center rounded-full bg-accent shadow-card"
            onPress={handleSave}
            disabled={saving}
          >
            <Text className="font-body text-[15px] font-bold uppercase tracking-[1px] text-white">
              {saveLabel}
            </Text>
          </Pressable>

          {onDelete ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Delete entry"
              className="h-13 items-center justify-center rounded-full border border-subtle bg-white"
              onPress={onDelete}
              disabled={saving}
            >
              <Text className="font-body text-[15px] font-bold uppercase tracking-[1px] text-accent">
                Delete
              </Text>
            </Pressable>
          ) : null}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
