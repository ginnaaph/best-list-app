import { Redirect } from "expo-router";
import { useEffect, useState } from "react";

import { HomeScreen, SplashScreen } from "@/components";
import { useAuthSession } from "@/hooks/use-auth-session";

export default function Index() {
  const { isLoading, session } = useAuthSession();
  const [isGifLoaded, setIsGifLoaded] = useState(false);
  const [hasSplashFinished, setHasSplashFinished] = useState(false);

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

  if (isLoading || !hasSplashFinished) {
    return <SplashScreen onGifLoad={() => setIsGifLoaded(true)} />;
  }

  if (!session) {
    return <Redirect href="/onboarding" />;
  }

  return <HomeScreen />;
}
