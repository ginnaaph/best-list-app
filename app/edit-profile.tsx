import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
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
import {
  getProfileInitial,
  mapProfileRow,
  prepareSetupHandleProfileUpdate,
} from "@/lib/profile-data";
import { avatarsBucket, resolveAvatarDisplayUrl } from "@/lib/profile-avatar";
import { getSupabaseClient } from "@/lib/supabase";

type EditProfileRow = {
  id: string;
  username: string | null;
  city: string | null;
  bio: string | null;
  avatar_url: string | null;
};

type SaveStatus = "idle" | "saving" | "saved";

const profileColumns = "id,username,city,bio,avatar_url";

export default function EditProfileScreen() {
  const [existingUsername, setExistingUsername] = useState<string | null>(null);
  const [profileEmail, setProfileEmail] = useState<string | undefined>();
  const [username, setUsername] = useState("");
  const [city, setCity] = useState("");
  const [bio, setBio] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | undefined>();
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [saveError, setSaveError] = useState<string | null>(null);
  const successTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadProfile() {
      try {
        setIsLoadingProfile(true);
        setLoadError(null);

        const supabase = getSupabaseClient();
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError) {
          throw userError;
        }

        if (!user) {
          router.replace("/sign-in");
          return;
        }

        const { data, error } = await supabase
          .from("profiles")
          .select(profileColumns)
          .eq("id", user.id)
          .maybeSingle()
          .returns<EditProfileRow | null>();

        if (error) {
          throw error;
        }

        if (isMounted) {
          const profile = data
            ? mapProfileRow({
                id: data.id,
                username: data.username,
                full_name: null,
                city: data.city,
                bio: data.bio,
                avatar_url: data.avatar_url,
                created_at: "",
              })
            : null;

          setProfileEmail(user.email);
          setExistingUsername(profile?.username ?? null);
          setUsername(profile?.username ?? "");
          setCity(profile?.city ?? "");
          setBio(profile?.bio ?? "");
          setAvatarUrl(
            profile?.avatarUrl
              ? await resolveAvatarDisplayUrl(profile.avatarUrl)
              : undefined,
          );
        }
      } catch (error: unknown) {
        console.error("Failed to load profile for editing:", error);

        if (isMounted) {
          setLoadError("Unable to load your profile right now.");
        }
      } finally {
        if (isMounted) {
          setIsLoadingProfile(false);
        }
      }
    }

    void loadProfile();

    return () => {
      isMounted = false;

      if (successTimeoutRef.current) {
        clearTimeout(successTimeoutRef.current);
      }
    };
  }, []);

  async function handlePickAvatar() {
    if (isUploadingAvatar) {
      return;
    }

    setSaveError(null);

    try {
      const permission =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permission.granted) {
        setSaveError("Photo access is needed to update your avatar.");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
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
        setSaveError("Unable to use that photo. Try another one.");
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
        router.replace("/sign-in");
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

      const publicUrl = bucket.getPublicUrl(path).data.publicUrl;
      const { data: updatedProfile, error: updateError } = await supabase
        .from("profiles")
        .upsert({ id: user.id, avatar_url: publicUrl }, { onConflict: "id" })
        .select("avatar_url")
        .single()
        .returns<{ avatar_url: string | null }>();

      if (updateError) {
        throw updateError;
      }

      if (!updatedProfile.avatar_url) {
        throw new Error("Profile avatar URL was not saved.");
      }

      setAvatarUrl(await resolveAvatarDisplayUrl(updatedProfile.avatar_url));
    } catch (error: unknown) {
      console.error("Failed to update avatar:", error);
      setSaveError("Unable to update your avatar. Try again.");
    } finally {
      setIsUploadingAvatar(false);
    }
  }

  async function handleSave() {
    if (saveStatus === "saving") {
      return;
    }

    setSaveStatus("saving");
    setSaveError(null);

    if (successTimeoutRef.current) {
      clearTimeout(successTimeoutRef.current);
      successTimeoutRef.current = null;
    }

    try {
      const supabase = getSupabaseClient();
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) {
        throw userError;
      }

      if (!user) {
        router.replace("/sign-in");
        return;
      }

      const updateFields: {
        id: string;
        city: string;
        bio: string;
        username?: string;
      } = {
        id: user.id,
        city: city.trim(),
        bio: bio.trim(),
      };

      if (!existingUsername) {
        updateFields.username = prepareSetupHandleProfileUpdate(
          username,
          city,
        ).username;
      }

      const { error } = await supabase
        .from("profiles")
        .upsert(updateFields, { onConflict: "id" });

      if (error) {
        throw error;
      }

      setExistingUsername(updateFields.username ?? existingUsername);
      setUsername(updateFields.username ?? username);
      setSaveStatus("saved");
      successTimeoutRef.current = setTimeout(() => {
        setSaveStatus("idle");
        successTimeoutRef.current = null;
      }, 2000);
    } catch (error: unknown) {
      console.error("Failed to save profile edits:", error);
      setSaveStatus("idle");
      setSaveError("Unable to save your profile. Try again.");
    }
  }

  const isSaving = saveStatus === "saving";
  const buttonLabel = saveStatus === "saved" ? "Saved ✓" : "Save changes";

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
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Back to profile"
                className="h-11 w-11 items-center justify-center rounded-full border border-subtle bg-white"
                onPress={() => router.back()}
              >
                <Text className="font-body text-[34px] -mt-4.5 leading-9 text-primary">
                  ‹
                </Text>
              </Pressable>

              <Text className="mt-6 font-display text-[34px] font-bold leading-9.5 text-primary">
                Edit your profile.
              </Text>

              <Text className="mt-3 font-body text-[16px] leading-6 text-secondary">
                Keep your public list details current.
              </Text>

              {isLoadingProfile ? (
                <View className="items-center justify-center py-20">
                  <ActivityIndicator color="#2D5016" />
                  <Text className="mt-3 font-body text-[14px] leading-5 text-secondary">
                    Loading profile...
                  </Text>
                </View>
              ) : null}

              {!isLoadingProfile && loadError ? (
                <View className="py-20">
                  <Text className="text-center font-body text-[14px] leading-5 text-red-500">
                    {loadError}
                  </Text>
                </View>
              ) : null}

              {!isLoadingProfile && !loadError ? (
                <View className="mt-9 gap-4">
                  <View className="items-center pb-2">
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel="Change profile photo"
                      className="h-25 w-25 items-center justify-center overflow-visible"
                      disabled={isUploadingAvatar}
                      onPress={() => {
                        void handlePickAvatar();
                      }}
                    >
                      <View className="h-full w-full items-center justify-center overflow-hidden rounded-full bg-[#2D5016] shadow-card">
                        {avatarUrl ? (
                          <Image
                            source={{ uri: avatarUrl }}
                            resizeMode="cover"
                            className="h-full w-full"
                          />
                        ) : (
                          <Text className="font-body text-[44px] font-bold leading-10 text-white">
                            {getProfileInitial(
                              {
                                id: "",
                                username: existingUsername ?? username,
                                city,
                                bio,
                                avatarUrl,
                                createdAt: "",
                              },
                              profileEmail,
                            )}
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
                      {existingUsername ? (
                        <Text className="h-full flex-1 py-3.5 font-body text-[17px] leading-6 text-secondary">
                          {existingUsername}
                        </Text>
                      ) : (
                        <TextInput
                          autoCapitalize="none"
                          autoCorrect={false}
                          className="h-full min-w-0 flex-1 py-0 font-body text-[17px] leading-6 text-primary"
                          placeholder="yourname"
                          placeholderTextColor={colors.secondaryText}
                          returnKeyType="next"
                          value={username}
                          onChangeText={setUsername}
                        />
                      )}
                    </View>
                  </View>

                  <View className="gap-2">
                    <Text className="font-mono-bestlist text-[10px] font-bold uppercase tracking-[1.5px] text-secondary">
                      Bio
                    </Text>
                    <TextInput
                      className="min-h-28 rounded-xl border border-subtle bg-white px-4 py-3 font-body text-[17px] leading-6 text-primary"
                      multiline
                      placeholder="What are you always hunting for?"
                      placeholderTextColor={colors.secondaryText}
                      textAlignVertical="top"
                      value={bio}
                      onChangeText={setBio}
                    />
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
                  </View>
                </View>
              ) : null}
            </View>

            {!isLoadingProfile && !loadError ? (
              <View className="mt-6">
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Save profile changes"
                  className={`h-14 items-center justify-center rounded-full bg-[#2D5016] shadow-card ${
                    isSaving ? "opacity-60" : "opacity-100"
                  }`}
                  disabled={isSaving}
                  onPress={() => {
                    void handleSave();
                  }}
                >
                  <Text className="font-body text-[15px] font-bold uppercase tracking-[1px] text-white">
                    {isSaving ? "Saving..." : buttonLabel}
                  </Text>
                </Pressable>

                {saveError ? (
                  <Text className="mt-3 text-center font-body text-[14px] leading-5 text-red-500">
                    {saveError}
                  </Text>
                ) : null}
              </View>
            ) : null}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
