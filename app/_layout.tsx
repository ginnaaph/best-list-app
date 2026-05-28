import "../global.css";

import { router, Stack } from "expo-router";
import * as Linking from "expo-linking";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";

import { useAppFonts } from "@/hooks/use-app-fonts";
import { createSessionFromUrl } from "@/lib/auth";
import { isSupabaseConfigured } from "@/lib/supabase";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const { fontsLoaded } = useAppFonts();

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      return;
    }

    const handleUrl = async (url: string | null) => {
      if (!url) {
        return;
      }

      try {
        const session = await createSessionFromUrl(url);
        if (session) {
          router.replace("/");
        }
      } catch (error) {
        console.warn("Unable to complete Supabase auth redirect.", error);
      }
    };

    Linking.getInitialURL().then(handleUrl);

    const subscription = Linking.addEventListener("url", ({ url }) => {
      void handleUrl(url);
    });

    return () => {
      subscription.remove();
    };
  }, []);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <Stack
      screenOptions={{
        contentStyle: { backgroundColor: "#F8F8F7" },
        headerShown: false,
      }}
    />
  );
}
