import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { Image, Text, View } from "react-native";

import { getProfileInitial, mapProfileRow } from "@/lib/profile-data";
import { resolveAvatarDisplayUrl } from "@/lib/profile-avatar";
import { getSupabaseClient } from "@/lib/supabase";
import type { Profile as DatabaseProfile, ProfileRow } from "@/types/profile";

type CurrentUserAvatarProps = {
  size?: "small" | "large";
};

const profileColumns = "id,username,full_name,city,bio,avatar_url,created_at";

const sizeStyles = {
  small: {
    container:
      "h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-accent",
    text: "text-label text-white",
  },
  large: {
    container:
      "h-25 w-25 items-center justify-center overflow-hidden rounded-full bg-[#2D5016] shadow-card",
    text: "font-body text-[44px] font-bold leading-10 text-white",
  },
};

type AvatarData = {
  profile: DatabaseProfile | null;
  email?: string;
};

async function loadCurrentUserAvatar(): Promise<AvatarData> {
  const supabase = getSupabaseClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) {
    throw userError;
  }

  if (!user) {
    return { profile: null };
  }

  const { data, error } = await supabase
    .from("profiles")
    .select(profileColumns)
    .eq("id", user.id)
    .maybeSingle()
    .returns<ProfileRow | null>();

  if (error) {
    throw error;
  }

  const profile = mapProfileRow(data);

  return {
    profile: profile?.avatarUrl
      ? {
          ...profile,
          avatarUrl: await resolveAvatarDisplayUrl(profile.avatarUrl),
        }
      : profile,
    email: user.email,
  };
}

/**
 * Renders the signed-in user's avatar or fallback initial.
 */
export function CurrentUserAvatar({ size = "small" }: CurrentUserAvatarProps) {
  const [avatarData, setAvatarData] = useState<AvatarData>({
    profile: null,
  });
  const styles = sizeStyles[size];
  const avatarUrl = avatarData.profile?.avatarUrl;

  useFocusEffect(
    useCallback(() => {
      let isMounted = true;

      async function loadAvatar() {
        try {
          const data = await loadCurrentUserAvatar();

          if (isMounted) {
            setAvatarData(data);
          }
        } catch (error) {
          console.error("Failed to load user avatar:", error);
          setAvatarData({ profile: null });
        }
      }

      void loadAvatar();

      return () => {
        isMounted = false;
      };
    }, []),
  );

  return (
    <View className={styles.container}>
      {avatarUrl ? (
        <Image
          source={{ uri: avatarUrl }}
          resizeMode="cover"
          className="h-full w-full"
        />
      ) : (
        <Text className={styles.text}>
          {getProfileInitial(avatarData.profile, avatarData.email)}
        </Text>
      )}
    </View>
  );
}
