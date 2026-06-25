import { Link, router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Image,
  type ImageSourcePropType,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { CurrentUserAvatar } from "@/components/current-user-avatar";
import { images } from "@/constants/images";
import { resolveAvatarDisplayUrl } from "@/lib/profile-avatar";
import {
  mapProfileRow,
  type ProfileCategoryRow,
  type ProfileEntryRow,
  summarizeProfileCategories,
} from "@/lib/profile-data";
import { getSupabaseClient } from "@/lib/supabase";
import { useStore } from "@/store";
import type { Category } from "@/types/category";
import type { Profile as DatabaseProfile, ProfileRow } from "@/types/profile";

const profileColumns = "id,username,full_name,city,bio,avatar_url,created_at";
const categoryColumns =
  "id,name,cover_photo,tone,is_shared,share_id,created_at";
const entryColumns =
  "id,category_id,place_name,city,notes,photo_url,created_at,taste,value,portion,vibe,overall_score";

type ProfileScreenData = {
  profile: DatabaseProfile | null;
  email?: string;
  categories: Category[];
  stats: {
    loggedEntries: number;
    distinctEntryCategories: number;
  };
};

function getDisplayName(profile: DatabaseProfile | null, email?: string) {
  return profile?.fullName ?? profile?.username ?? email ?? "No profile yet";
}

function getUsernameLabel(profile: DatabaseProfile | null) {
  return profile?.username ? `@${profile.username}` : "No username yet";
}

function getCityLabel(profile: DatabaseProfile | null) {
  return profile?.city?.toUpperCase() ?? null;
}

async function loadProfileScreenData(): Promise<ProfileScreenData> {
  const supabase = getSupabaseClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) {
    throw userError;
  }

  if (!user) {
    return {
      profile: null,
      categories: [],
      stats: { loggedEntries: 0, distinctEntryCategories: 0 },
    };
  }

  const [profileResult, categoriesResult, entriesResult] = await Promise.all([
    supabase
      .from("profiles")
      .select(profileColumns)
      .eq("id", user.id)
      .maybeSingle()
      .returns<ProfileRow | null>(),
    supabase
      .from("categories")
      .select(categoryColumns)
      .eq("user_id", user.id)
      .order("created_at", { ascending: true })
      .returns<ProfileCategoryRow[]>(),
    supabase
      .from("entries")
      .select(entryColumns)
      .eq("user_id", user.id)
      .order("created_at", { ascending: true })
      .returns<ProfileEntryRow[]>(),
  ]);

  if (profileResult.error) {
    throw profileResult.error;
  }

  if (categoriesResult.error) {
    throw categoriesResult.error;
  }

  if (entriesResult.error) {
    throw entriesResult.error;
  }

  const profile = mapProfileRow(profileResult.data);

  return {
    profile: profile?.avatarUrl
      ? {
          ...profile,
          avatarUrl: await resolveAvatarDisplayUrl(profile.avatarUrl),
        }
      : profile,
    email: user.email,
    categories: summarizeProfileCategories(
      categoriesResult.data,
      entriesResult.data,
    ),
    stats: {
      loggedEntries: entriesResult.data.length,
      distinctEntryCategories: new Set(
        entriesResult.data.map((entry) => entry.category_id),
      ).size,
    },
  };
}

export default function Profile() {
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [profileData, setProfileData] = useState<ProfileScreenData | null>(
    null,
  );
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [profileError, setProfileError] = useState<string | null>(null);
  const profile = profileData?.profile ?? null;
  const profileEmail = profileData?.email;
  const cityLabel = getCityLabel(profile);
  const listCategories = profileData?.categories.slice(0, 4) ?? [];
  const stats = [
    { label: "Logged", value: String(profileData?.stats.loggedEntries ?? 0) },
    {
      label: "Categories",
      value: String(profileData?.stats.distinctEntryCategories ?? 0),
    },
  ];

  useFocusEffect(
    useCallback(() => {
      let isMounted = true;

      async function loadProfile() {
        try {
          setIsLoadingProfile(true);
          setProfileError(null);
          const data = await loadProfileScreenData();

          if (isMounted) {
            setProfileData(data);
          }
        } catch (error) {
          console.error("Failed to load profile:", error);

          if (isMounted) {
            setProfileError("Unable to load profile right now.");
          }
        } finally {
          if (isMounted) {
            setIsLoadingProfile(false);
          }
        }
      }

      loadProfile();

      return () => {
        isMounted = false;
      };
    }, []),
  );

  async function handleSignOut() {
    if (isSigningOut) {
      return;
    }

    setIsSigningOut(true);

    try {
      const supabase = getSupabaseClient();
      const { error } = await supabase.auth.signOut();

      if (error) {
        console.error("Sign out failed:", error.message);
      }
    } catch (error) {
      console.error("Sign out failed:", error);
    } finally {
      await useStore.getState().clearStore();
      setIsSigningOut(false);
      router.replace("/sign-in");
    }
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#f8f8f7" }}>
      <ScrollView
        contentContainerClassName="grow px-5 pb-3 pt-2"
        showsVerticalScrollIndicator={false}
      >
        <View className="flex-row items-center justify-between">
          <Pressable
            onPress={() => router.back()}
            className="h-11 w-11 items-center justify-center rounded-full border border-subtle bg-white"
          >
            <Text className="font-body text-[34px] -mt-4.5 leading-9 text-primary">
              ‹
            </Text>
          </Pressable>

          <View className="h-11 w-11 items-center justify-center rounded-full border border-subtle bg-white">
            <Image
              source={images.setting}
              resizeMode="contain"
              className="h-5 w-5"
            />
          </View>
        </View>

        {isLoadingProfile ? (
          <View className="flex-1 items-center justify-center py-28">
            <ActivityIndicator color="#2D5016" />
            <Text className="mt-3 font-body text-[14px] leading-5 text-secondary">
              Loading profile...
            </Text>
          </View>
        ) : null}

        {!isLoadingProfile && profileError ? (
          <View className="flex-1 items-center justify-center py-28">
            <Text className="text-center font-body text-[14px] leading-5 text-secondary">
              {profileError}
            </Text>
          </View>
        ) : null}

        {!isLoadingProfile && !profileError ? (
          <>
            <View className="items-center pt-3">
              <CurrentUserAvatar size="large" />

              <Text className="mt-1 font-display text-[33px] font-bold leading-9 text-primary">
                {getDisplayName(profile, profileEmail)}
              </Text>

              <Text className="mt-1 text-center font-mono-bestlist text-[11px] uppercase leading-3.5 tracking-[3px] text-accent">
                {getUsernameLabel(profile)}
                {cityLabel ? ` · ${cityLabel}` : null}
              </Text>

              {profile?.bio ? (
                <Text
                  className="mt-2 max-w-77.5 text-center font-body text-[14px] leading-5.5 text-primary"
                  numberOfLines={2}
                >
                  {profile.bio}
                </Text>
              ) : null}

              <Pressable
                className="mt-2 h-10 items-center justify-center rounded-full border border-subtle bg-white px-5"
                onPress={() => {
                  router.push("/edit-profile");
                }}
              >
                <Text className="font-body text-[14px] font-semibold leading-5 text-primary">
                  Edit profile
                </Text>
              </Pressable>
            </View>

            <View className="mt-5 flex-row items-center rounded-bestlist-xl border border-subtle bg-white px-6 py-5 shadow-card">
              {stats.map((stat, index) => (
                <View key={stat.label} className="flex-1 flex-row items-center">
                  <View className="flex-1 items-center">
                    <Text className="font-display text-[31px] font-bold leading-8.5 text-primary">
                      {stat.value}
                    </Text>
                    <Text className="mt-1 font-mono-bestlist text-[9px] uppercase leading-4 tracking-[3px] text-secondary">
                      {stat.label}
                    </Text>
                  </View>

                  {index < stats.length - 1 ? (
                    <View className="h-10 w-px bg-bestlist-border" />
                  ) : null}
                </View>
              ))}
            </View>

            <View className="mt-5 flex-1">
              <View className="flex-row items-center justify-between">
                <Text className="font-mono-bestlist text-[13px] uppercase leading-4 tracking-[2px] text-secondary">
                  Your lists
                </Text>
                <Link href="/home" asChild>
                  <Pressable accessibilityRole="link" hitSlop={8}>
                    <Text className="font-body text-[13px] font-bold leading-5 text-[#2D5016] mb-2">
                      See all
                    </Text>
                  </Pressable>
                </Link>
              </View>

              <View className="mt-1  gap-2">
                {listCategories.map((category) => {
                  const categoryImage: ImageSourcePropType = category.coverPhoto
                    ? { uri: category.coverPhoto }
                    : images.noImages;

                  return (
                    <Link
                      key={category.id}
                      href={`./category/${category.id}`}
                      asChild
                    >
                      <Pressable className="flex-row items-center rounded-bestlist-xl border border-subtle bg-white px-3 gap-2 shadow-card">
                        <View className="h-20 w-20 overflow-hidden rounded-bestlist-md">
                          <Image
                            source={categoryImage}
                            resizeMode="cover"
                            className="h-full w-full"
                          />
                        </View>

                        <View className="min-w-0 flex-1 px-2 p-4">
                          <Text
                            className="font-display text-[22px] font-bold leading-6 text-primary"
                            numberOfLines={1}
                          >
                            {category.name}
                          </Text>
                          <Text
                            className="mt-0.5 font-body text-[14px] leading-4.5 text-secondary"
                            numberOfLines={1}
                          >
                            {category.entryCount} ranked · #1{" "}
                            {category.topEntry}
                          </Text>
                        </View>

                        <Text className="font-body text-[44px] leading-11 text-bestlist-border">
                          ›
                        </Text>
                      </Pressable>
                    </Link>
                  );
                })}
              </View>
            </View>
          </>
        ) : null}

        <Pressable
          onPress={handleSignOut}
          disabled={isSigningOut}
          className={`mt-4 h-10 items-center justify-center rounded-full border border-subtle bg-white px-5 ${
            isSigningOut ? "opacity-60" : "opacity-100"
          }`}
        >
          <Text className="font-body text-[14px] font-semibold leading-5 text-red-500">
            {isSigningOut ? "Signing out..." : "Sign Out"}
          </Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}
