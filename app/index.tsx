import { Redirect } from "expo-router";

import { HomeScreen } from "@/components";
import { useAuthSession } from "@/hooks/use-auth-session";

export default function Index() {
  const { isLoading, session } = useAuthSession();

  if (isLoading) {
    return null;
  }

  if (!session) {
    return <Redirect href="/onboarding" />;
  }

  return <HomeScreen />;
}
