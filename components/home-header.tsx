import { Link, useFocusEffect, type Href } from "expo-router";
import { useCallback, useState } from "react";
import { Pressable, Text, View } from "react-native";

import { CurrentUserAvatar } from "@/components/current-user-avatar";
import { getSupabaseClient } from "@/lib/supabase";
import { useStore } from "@/store";

const profileRoute = "/profile" as Href;

export function HomeHeader() {
  const [username, setUsername] = useState<string>();
  const entries = useStore((state) => state.entries);
  const loggedCount = entries.length;
  const cityCount = new Set(entries.map((entry) => entry.city).filter(Boolean))
    .size;

  useFocusEffect(
    useCallback(() => {
      let isMounted = true;

      async function loadUsername() {
        const supabase = getSupabaseClient();
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError) {
          throw userError;
        }

        if (!user) {
          return;
        }

        const { data, error } = await supabase
          .from("profiles")
          .select("username")
          .eq("id", user.id)
          .maybeSingle<{ username: string | null }>();

        if (error) {
          throw error;
        }

        if (isMounted) {
          setUsername(data?.username?.trim() || undefined);
        }
      }

      void loadUsername().catch((error: unknown) => {
        console.error("Failed to load username:", error);
      });

      return () => {
        isMounted = false;
      };
    }, []),
  );

  return (
    <View className="flex-row items-center justify-between">
      <View className="gap-2 mt-2">
        <Text
          className={`font-[Roboto_400Regular] text-caption text-secondary ${
            loggedCount === 0 ? "uppercase tracking-[1.5px]" : "uppercase"
          }`}
        >
          {loggedCount === 0
            ? username
              ? `Welcome ${username}`
              : "WELCOME"
            : `${loggedCount} logged - ${cityCount} cities`}
        </Text>
        <View className="flex-row">
          <Text className="font-display text-[44px] font-bold leading-[44px] text-primary">
            Best
          </Text>
          <Text className="font-display text-[44px] font-bold leading-[44px] text-bestlist-green">
            List
          </Text>
        </View>
      </View>

      <Link href={profileRoute} asChild>
        <Pressable
          accessibilityLabel="Open profile"
          className="h-9 w-9 items-center justify-center rounded-full shadow-card"
        >
          <CurrentUserAvatar />
        </Pressable>
      </Link>
    </View>
  );
}
