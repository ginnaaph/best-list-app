import { Redirect } from "expo-router";

import { AuthScreen } from "@/components/auth-screen";
import { useAuthSession } from "@/hooks/use-auth-session";

export default function SignIn() {
  const { isLoading, session } = useAuthSession();

  if (isLoading) {
    return null;
  }

  if (session && !session.user.is_anonymous) {
    return <Redirect href="/" />;
  }

  return <AuthScreen mode="sign-in" session={session} />;
}
