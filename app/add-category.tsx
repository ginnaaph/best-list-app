import { router, useLocalSearchParams } from "expo-router";
import { useRef, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { colors } from "@/constants/theme";
import {
  DEFAULT_CRITERIA_LABELS,
  getCriteriaLabels,
  MAX_CRITERIA_LABEL_LENGTH,
} from "@/lib/criteria-labels";
import { useStore } from "@/store";
import type { CriteriaLabels } from "@/types/category";

const labelClassName =
  "font-mono-bestlist text-[10px] font-bold uppercase tracking-[1.5px] text-secondary";
const inputClassName =
  "h-12 rounded-xl border border-subtle bg-white px-4 font-body text-[16px] text-primary";

/** Renders the add or edit category form for the current route. */
export default function AddCategoryScreen() {
  const { categoryId: categoryIdParam } = useLocalSearchParams<{
    categoryId?: string | string[];
  }>();
  const categoryId = Array.isArray(categoryIdParam)
    ? categoryIdParam[0]
    : categoryIdParam;
  const isEditMode = Boolean(categoryId);
  const categories = useStore((state) => state.categories);
  const addCategory = useStore((state) => state.addCategory);
  const updateCategory = useStore((state) => state.updateCategory);
  const category = categoryId
    ? categories.find((item) => item.id === categoryId)
    : undefined;
  const [name, setName] = useState(() => category?.name ?? "");
  const [criteriaLabels, setCriteriaLabels] = useState<CriteriaLabels>(() =>
    category ? getCriteriaLabels(category) : DEFAULT_CRITERIA_LABELS,
  );
  const criterionInputs = useRef<(TextInput | null)[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  const updateCriterion = (index: number, value: string) => {
    setCriteriaLabels((labels) => {
      const nextLabels: CriteriaLabels = [...labels];
      nextLabels[index] = value;
      return nextLabels;
    });
  };

  const handleSave = async () => {
    if (isSaving) {
      return;
    }

    const trimmedName = name.trim();

    if (!trimmedName) {
      Alert.alert("Missing name", "Please enter a category name.");
      return;
    }

    try {
      setIsSaving(true);

      if (categoryId) {
        const updatedCategory = await updateCategory(categoryId, {
          name: trimmedName,
        });

        if (!updatedCategory) {
          Alert.alert("Category not found", "Unable to edit this category.");
          router.back();
          return;
        }

        router.back();
        return;
      }

      const newCategory = await addCategory(trimmedName);
      router.replace(`/category/${newCategory.id}`);
    } catch (error: unknown) {
      console.error("Failed to save category:", error);
      Alert.alert("Save failed", "Unable to save this category. Try again.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.surface }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <View className="flex-1 pt-4">
          <View className="flex-row items-center justify-between px-5">
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Cancel"
              className="h-9 items-center justify-center rounded-full bg-white px-4 shadow-card"
              onPress={() => router.back()}
            >
              <Text className="text-label uppercase text-primary">Cancel</Text>
            </Pressable>

            <Text className="font-display text-[18px] font-bold text-primary">
              {isEditMode ? "Edit Category" : "Add Category"}
            </Text>

            <View className="h-9 w-19.25" />
          </View>

          <ScrollView
            className="flex-1"
            contentContainerClassName="px-5 pb-5 pt-8"
            keyboardShouldPersistTaps="handled"
          >
            <View className="gap-2">
              <Text className={labelClassName}>Category Name</Text>
              <TextInput
                autoCapitalize="words"
                autoFocus
                className={inputClassName}
                placeholder="e.g. Breakfast Burrito"
                placeholderTextColor={colors.secondaryText}
                returnKeyType="next"
                submitBehavior="submit"
                value={name}
                onChangeText={setName}
                onSubmitEditing={() => criterionInputs.current[0]?.focus()}
              />
            </View>

            <View className="mt-7 gap-5">
              <View className="gap-1">
                <Text className={labelClassName}>Scoring Criteria</Text>
                <Text className="font-body text-[13px] text-secondary">
                  Rename these to fit this category.
                </Text>
              </View>

              {criteriaLabels.map((label, index) => {
                const fieldLabel = `Criterion ${index + 1}`;
                const isLastCriterion = index === criteriaLabels.length - 1;
                const counterColor =
                  label.length >= MAX_CRITERIA_LABEL_LENGTH
                    ? "text-primary"
                    : "text-secondary";

                return (
                  <View key={fieldLabel} className="gap-2">
                    <View className="flex-row items-center justify-between">
                      <Text className={labelClassName}>{fieldLabel}</Text>
                      <Text className={`font-mono-bestlist text-[10px] ${counterColor}`}>
                        {label.length}/{MAX_CRITERIA_LABEL_LENGTH}
                      </Text>
                    </View>
                    <TextInput
                      ref={(input) => {
                        criterionInputs.current[index] = input;
                      }}
                      accessibilityLabel={fieldLabel}
                      autoCapitalize="words"
                      className={inputClassName}
                      maxLength={MAX_CRITERIA_LABEL_LENGTH}
                      returnKeyType={isLastCriterion ? "done" : "next"}
                      submitBehavior={isLastCriterion ? "blurAndSubmit" : "submit"}
                      value={label}
                      onChangeText={(value) => updateCriterion(index, value)}
                      onSubmitEditing={() => {
                        if (isLastCriterion) {
                          void handleSave();
                          return;
                        }

                        criterionInputs.current[index + 1]?.focus();
                      }}
                    />
                  </View>
                );
              })}
            </View>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Save category"
              className={`mt-6 h-13 items-center justify-center rounded-full bg-accent shadow-card ${
                isSaving ? "opacity-60" : ""
              }`}
              disabled={isSaving}
              onPress={() => {
                void handleSave();
              }}
            >
              <Text className="font-body text-[15px] font-bold uppercase tracking-[1px] text-white">
                {isSaving ? "Saving..." : "Save Category"}
              </Text>
            </Pressable>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
