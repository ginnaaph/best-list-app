import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect, useState } from "react";
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
import { prepareSetupHandleProfileUpdate } from "@/lib/profile-data";
import { getSupabaseClient } from "@/lib/supabase";

type HandleAvailability = "idle" | "checking" | "available" | "taken";

function normalizeHandleForAvailability(value: string) {
  return value.trim().replace(/^@+/, "");
}

export default function SetupHandleScreen() {
  const [handle, setHandle] = useState("");
  const [city, setCity] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [handleAvailability, setHandleAvailability] =
    useState<HandleAvailability>("idle");

  useEffect(() => {
    const normalizedHandle = normalizeHandleForAvailability(handle);

    if (normalizedHandle.length < 2) {
      setHandleAvailability("idle");
      return;
    }

    let isCurrent = true;
    setHandleAvailability("checking");

    const timeout = setTimeout(() => {
      async function checkHandleAvailability() {
        try {
          const supabase = getSupabaseClient();
          const { data, error } = await supabase
            .from("profiles")
            .select("id")
            .ilike("username", normalizedHandle)
            .limit(1)
            .returns<{ id: string }[]>();

          if (error) {
            throw error;
          }

          if (isCurrent) {
            setHandleAvailability(data.length > 0 ? "taken" : "available");
          }
        } catch (error: unknown) {
          console.error("Failed to check handle availability:", error);

          if (isCurrent) {
            setHandleAvailability("idle");
          }
        }
      }

      void checkHandleAvailability();
    }, 600);

    return () => {
      isCurrent = false;
      clearTimeout(timeout);
    };
  }, [handle]);

  const handleSave = async () => {
    if (isSaving) {
      return;
    }

    const profileUpdate = prepareSetupHandleProfileUpdate(handle, city);

    if (!profileUpdate.username || !profileUpdate.city) {
      Alert.alert("Missing details", "Please enter a handle and home city.");
      return;
    }

    try {
      setIsSaving(true);

      const supabase = getSupabaseClient();
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) {
        throw userError;
      }

      if (!user) {
        Alert.alert("Sign in required", "Please sign in to finish setup.");
        return;
      }

      const { error } = await supabase.from("profiles").upsert(
        {
          id: user.id,
          username: profileUpdate.username,
          city: profileUpdate.city,
        },
        { onConflict: "id" },
      );

      if (error) {
        throw error;
      }

      router.replace("/home");
    } catch (error: unknown) {
      console.error("Failed to save profile setup:", error);
      const isUsernameTaken =
        typeof error === "object" &&
        error !== null &&
        "code" in error &&
        (error as { code: string }).code === "23505";
      if (isUsernameTaken) {
        setHandleAvailability("taken");
      }
      Alert.alert(
        "Save failed",
        isUsernameTaken
          ? "That handle is already taken. Try a different one."
          : "Unable to save your profile. Try again.",
      );
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
        <View className="flex-1 px-5 pb-5 pt-4">
          <View className="flex-1 justify-between">
            <View>
              <Text className="font-mono-bestlist text-[11px] font-bold uppercase leading-4 tracking-[2px] text-secondary">
                Step 2 of 2
              </Text>

              <Text className="mt-4 font-display text-[34px] font-bold leading-9.5 text-primary">
                Pick the name on your lists.
              </Text>

              <Text className="mt-3 font-body text-[16px] leading-6 text-secondary">
                Shown on shared lists — bestlist.app/[handle]
              </Text>

              <View className="mt-9 gap-5">
                <View className="gap-2">
                  <Text className="font-mono-bestlist text-[10px] font-bold uppercase tracking-[1.5px] text-secondary">
                    Handle
                  </Text>
                  <View className="h-13 flex-row items-center rounded-xl border border-subtle bg-white px-4">
                    <Text className="mr-1 font-body text-[17px] leading-6 text-secondary">
                      @
                    </Text>
                    <TextInput
                      autoCapitalize="none"
                      autoCorrect={false}
                      className="h-full min-w-0 flex-1 py-0 font-body text-[17px] leading-6 text-primary"
                      placeholder="yourname"
                      placeholderTextColor={colors.secondaryText}
                      returnKeyType="next"
                      value={handle}
                      onChangeText={setHandle}
                    />
                    {handleAvailability === "available" ? (
                      <Text className="ml-3 font-body text-[13px] font-semibold leading-5 text-[#2D5016]">
                        ✓ Available
                      </Text>
                    ) : null}
                    {handleAvailability === "taken" ? (
                      <Text className="ml-3 font-body text-[13px] font-semibold leading-5 text-red-500">
                        ✗ Taken
                      </Text>
                    ) : null}
                  </View>
                </View>

                <View className="gap-2">
                  <Text className="font-mono-bestlist text-[10px] font-bold uppercase tracking-[1.5px] text-secondary">
                    Home city
                  </Text>
                  <View className="h-13 flex-row items-center rounded-xl border border-subtle bg-white px-4">
                    <Ionicons
                      name="location-outline"
                      size={18}
                      color={colors.secondaryText}
                    />
                    <TextInput
                      autoCapitalize="words"
                      className="ml-2 h-full min-w-0 flex-1 py-0 font-body text-[17px] leading-6 text-primary"
                      placeholder="San Francisco, CA"
                      placeholderTextColor={colors.secondaryText}
                      returnKeyType="done"
                      value={city}
                      onChangeText={setCity}
                      onSubmitEditing={() => {
                        void handleSave();
                      }}
                    />
                  </View>
                  <Text className="font-body text-[13px] leading-5 text-secondary">
                    {"We'll tag new entries with that city — change this anytime."}
                  </Text>
                </View>
              </View>
            </View>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Start logging"
              className={`h-14 items-center justify-center rounded-full bg-[#2D5016] shadow-card ${
                isSaving ? "opacity-60" : "opacity-100"
              }`}
              disabled={isSaving}
              onPress={() => {
                void handleSave();
              }}
            >
              <Text className="font-body text-[15px] font-bold uppercase tracking-[1px] text-white">
                {isSaving ? "Saving..." : "Start logging"}
              </Text>
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
