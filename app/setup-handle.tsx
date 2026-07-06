import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
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

import { colors } from "@/constants/theme";
import { avatarsBucket, resolveAvatarDisplayUrl } from "@/lib/profile-avatar";
import { prepareSetupHandleProfileUpdate } from "@/lib/profile-data";
import { getSupabaseClient } from "@/lib/supabase";

type HandleAvailability = "idle" | "checking" | "available" | "taken";

function normalizeHandleForAvailability(value: string) {
  return value.trim().replace(/^@+/, "");
}

export default function SetupHandleScreen() {
  const [handle, setHandle] = useState("");
  const [city, setCity] = useState("");
  const [bio, setBio] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [avatarPreviewUrl, setAvatarPreviewUrl] = useState<string | null>(null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
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
          const { data, error } = await supabase.rpc("is_username_taken", {
            handle: normalizedHandle,
          });

          if (error) {
            throw error;
          }

          if (isCurrent) {
            setHandleAvailability(data === true ? "taken" : "available");
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

  const handlePickAvatar = () => {
    if (isUploadingAvatar || isSaving) {
      return;
    }

    Alert.alert("Add Photo", undefined, [
      {
        text: "Take Photo",
        onPress: () => void handleSelectAvatar("camera"),
      },
      {
        text: "Choose from Library",
        onPress: () => void handleSelectAvatar("library"),
      },
      { text: "Cancel", style: "cancel" },
    ]);
  };

  const handleSelectAvatar = async (source: "camera" | "library") => {
    if (isUploadingAvatar || isSaving) {
      return;
    }

    try {
      const permission =
        source === "camera"
          ? await ImagePicker.requestCameraPermissionsAsync()
          : await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permission.granted) {
        if (source === "camera") {
          Alert.alert(
            "Camera access needed",
            "Please allow camera access to take a profile picture.",
          );
        } else {
          Alert.alert(
            "Photo access required",
            "Allow photo access to choose a profile picture.",
          );
        }
        return;
      }

      const result =
        source === "camera"
          ? await ImagePicker.launchCameraAsync({
              allowsEditing: true,
              aspect: [1, 1],
              mediaTypes: ["images"],
              quality: 0.8,
              shape: "oval",
            })
          : await ImagePicker.launchImageLibraryAsync({
              allowsEditing: true,
              aspect: [1, 1],
              mediaTypes: ["images"],
              quality: 0.8,
              shape: "oval",
            });

      if (result.canceled) {
        return;
      }

      const selectedUri = result.assets[0]?.uri;

      if (!selectedUri) {
        Alert.alert(
          "Photo unavailable",
          "Choose a different photo and try again.",
        );
        return;
      }

      setIsUploadingAvatar(true);

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

      const response = await fetch(selectedUri);

      if (!response.ok) {
        throw new Error(
          `Failed to fetch avatar: ${response.status} ${response.statusText}`,
        );
      }

      const imageBytes = await response.arrayBuffer();
      const contentType = response.headers.get("Content-Type") ?? "image/jpeg";
      const path = `${user.id}/avatar.jpg`;
      const bucket = supabase.storage.from(avatarsBucket);
      const { error: uploadError } = await bucket.upload(path, imageBytes, {
        contentType,
        upsert: true,
      });

      if (uploadError) {
        throw uploadError;
      }

      const storageUrl = bucket.getPublicUrl(path).data.publicUrl;
      setAvatarUrl(storageUrl);
      setAvatarPreviewUrl(await resolveAvatarDisplayUrl(storageUrl));
    } catch (error: unknown) {
      console.error("Failed to upload setup avatar:", error);
      Alert.alert("Upload failed", "Unable to upload your photo. Try again.");
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleSave = async () => {
    if (isSaving || isUploadingAvatar) {
      return;
    }

    const profileUpdate = prepareSetupHandleProfileUpdate(
      handle,
      city,
      bio,
      avatarUrl,
    );

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
          bio: profileUpdate.bio,
          avatar_url: profileUpdate.avatar_url,
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
        <ScrollView
          contentContainerClassName="grow px-5 pb-5 pt-4"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View className="flex-1 justify-between">
            <View>
              <Text className="font-mono-bestlist text-[11px] font-bold uppercase leading-4 tracking-[2px] text-secondary">
                Step 3 of 3
              </Text>

              <Text className="mt-4 font-display text-[34px] font-bold leading-9.5 text-primary">
                Pick the name on your lists.
              </Text>

              <Text className="mt-3 font-body text-[16px] leading-6 text-secondary">
                Shown on shared lists — bestlist.app/[handle]
              </Text>

              <View className="mt-7 gap-5">
                <View className="items-center pb-1">
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Choose profile photo"
                    className="h-24 w-24 items-center justify-center"
                    disabled={isUploadingAvatar || isSaving}
                    onPress={() => {
                      void handlePickAvatar();
                    }}
                  >
                    <View className="h-full w-full items-center justify-center overflow-hidden rounded-full bg-[#2D5016] shadow-card">
                      {avatarPreviewUrl ? (
                        <Image
                          source={{ uri: avatarPreviewUrl }}
                          resizeMode="cover"
                          className="h-full w-full"
                        />
                      ) : (
                        <Text className="font-body text-[40px] font-bold leading-8 text-white">
                          {normalizeHandleForAvailability(handle)
                            .charAt(0)
                            .toUpperCase() || "?"}
                        </Text>
                      )}

                      {isUploadingAvatar ? (
                        <View className="absolute inset-0 items-center justify-center bg-black/20">
                          <ActivityIndicator color="#FFFFFF" />
                        </View>
                      ) : null}
                    </View>

                    <View className="absolute bottom-0 right-0 h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-[#F3A23A]">
                      <Ionicons name="camera" size={16} color="#FFFFFF" />
                    </View>
                  </Pressable>
                </View>

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
                      className="h-full min-w-0 flex-1 py-0 font-body text-[16px] leading-6 mb-1 text-primary"
                      placeholder="yourname"
                      placeholderTextColor={colors.secondaryText}
                      returnKeyType="next"
                      value={handle}
                      onChangeText={setHandle}
                    />
                    {handleAvailability === "available" ? (
                      <Text className="ml-3 font-body text-[11px] font-semibold leading-5 text-[#2D5016]">
                        ✓ Available
                      </Text>
                    ) : null}
                    {handleAvailability === "taken" ? (
                      <Text className="ml-3 font-body text-[11px] font-semibold leading-5 text-red-500">
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
                      className="ml-2 h-full min-w-0 flex-1 py-0 font-body text-[16px] leading-6 mb-1 text-primary"
                      placeholder="San Francisco, CA"
                      placeholderTextColor={colors.secondaryText}
                      returnKeyType="next"
                      value={city}
                      onChangeText={setCity}
                    />
                  </View>
                </View>

                <View className="gap-2">
                  <Text className="font-mono-bestlist text-[10px] font-bold uppercase tracking-[1.5px] text-secondary">
                    Bio
                  </Text>
                  <TextInput
                    autoCapitalize="sentences"
                    className="h-13 rounded-xl border border-subtle bg-white px-4 py-0 font-body text-[16px] leading-6 mb-1 text-primary"
                    maxLength={100}
                    placeholder="Taco enthusiast. SF local."
                    placeholderTextColor={colors.secondaryText}
                    returnKeyType="done"
                    value={bio}
                    onChangeText={setBio}
                    onSubmitEditing={() => {
                      void handleSave();
                    }}
                  />
                </View>
              </View>
            </View>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Start logging"
              className={`h-14 items-center justify-center rounded-full mt-10 bg-[#2D5016] shadow-card ${
                isSaving || isUploadingAvatar ? "opacity-60" : "opacity-100"
              }`}
              disabled={isSaving || isUploadingAvatar}
              onPress={() => {
                void handleSave();
              }}
            >
              <Text className="font-body text-[15px] font-bold uppercase tracking-[1px] text-white">
                {isSaving ? "Saving..." : "Start logging"}
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
