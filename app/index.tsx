import { Redirect } from "expo-router";
import { useEffect, useState } from "react";

import { HomeScreen, SplashScreen } from "@/components";
import { useAuthSession } from "@/hooks/use-auth-session";
import { getPostAuthDestination } from "@/lib/profile-data";
import { getSupabaseClient } from "@/lib/supabase";

type ProfileSetupResult = {
  userId: string;
  destination: "/home" | "/setup-handle";
};

type UsernameRow = {
  username: string | null;
};

export default function Index() {
  const { isLoading, session } = useAuthSession();
  const [isGifLoaded, setIsGifLoaded] = useState(false);
  const [hasSplashFinished, setHasSplashFinished] = useState(false);
  const [profileSetupResult, setProfileSetupResult] =
    useState<ProfileSetupResult | null>(null);

  useEffect(() => {
    if (!isGifLoaded) {
      return;
    }

    const timer = setTimeout(() => {
      setHasSplashFinished(true);
    }, 6_000);

    return () => {
      clearTimeout(timer);
    };
  }, [isGifLoaded]);

  useEffect(() => {
    if (!hasSplashFinished || !session) {
      setProfileSetupResult(null);
      return;
    }

    let isCurrent = true;
    const userId = session.user.id;
    setProfileSetupResult(null);

    if (session.user.is_anonymous) {
      setProfileSetupResult({ userId, destination: "/home" });
      return;
    }

    async function checkProfileSetup() {
      try {
        const supabase = getSupabaseClient();
        const { data, error } = await supabase
          .from("profiles")
          .select("username")
          .eq("id", userId)
          .maybeSingle()
          .returns<UsernameRow | null>();

        if (error) {
          throw error;
        }

        if (isCurrent) {
          setProfileSetupResult({
            userId,
            destination: getPostAuthDestination(data),
          });
        }
      } catch (error: unknown) {
        console.error("Failed to check profile setup:", error);

        if (isCurrent) {
          setProfileSetupResult({ userId, destination: "/home" });
        }
      }
    }

    void checkProfileSetup();

    return () => {
      isCurrent = false;
    };
  }, [hasSplashFinished, session]);

  if (isLoading || !hasSplashFinished) {
    return <SplashScreen onGifLoad={() => setIsGifLoaded(true)} />;
  }

  if (!session) {
    return <Redirect href="/onboarding" />;
  }

  if (!profileSetupResult || profileSetupResult.userId !== session.user.id) {
    return <SplashScreen onGifLoad={() => setIsGifLoaded(true)} />;
  }

  if (profileSetupResult.destination === "/setup-handle") {
    return <Redirect href="/setup-handle" />;
  }

  return <HomeScreen />;
}
