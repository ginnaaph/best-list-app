import { Link, Redirect } from "expo-router";
import { useState } from "react";
import { Alert, Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { OnboardingCardStack } from "@/components";
import { colors } from "@/constants/theme";
import { useAuthSession } from "@/hooks/use-auth-session";
import { signInAsGuest } from "@/lib/auth";

export default function Onboarding() {
  const { isLoading, session } = useAuthSession();
  const [isGuestSubmitting, setIsGuestSubmitting] = useState(false);

  const handleGuestPress = async () => {
    setIsGuestSubmitting(true);

    try {
      await signInAsGuest();
    } catch (error) {
      Alert.alert("Authentication error", getErrorMessage(error));
    } finally {
      setIsGuestSubmitting(false);
    }
  };

  if (isLoading) {
    return null;
  }

  if (session) {
    return <Redirect href="/" />;
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.surface }}>
      <View className="flex-1 px-5 pb-7 pt-4">
        <View className="items-center">
          <Text className="font-mono-bestlist text-[10px] font-bold uppercase text-secondary"></Text>
        </View>

        <View className="flex-1 items-center justify-center pb-14">
          <View className="items-center gap-7">
            <OnboardingCardStack />

            <View className="items-center gap-3">
              <View className="flex-row items-center justify-center">
                <Text className="font-display text-[44px] font-bold leading-[44px] text-primary">
                  Best
                </Text>
                <Text className="font-display text-[44px] font-bold leading-[44px] text-bestlist-green">
                  List
                </Text>
              </View>
              <Text className="max-w-44 text-center font-display text-[18px] leading-4 text-secondary">
                A place to store your favorite food — ranked, remembered, and
                ready to share.
              </Text>
            </View>
          </View>
        </View>

        <View className="gap-4">
          <Link href="./how-it-works" asChild>
            <Pressable className="h-12 items-center justify-center rounded-bestlist-md bg-accent">
              <Text className="text-label text-white">Get started</Text>
            </Pressable>
          </Link>

          <Link href="./sign-in" asChild>
            <Pressable className="items-center py-1">
              <Text className="text-caption text-secondary">
                I already have an account
              </Text>
            </Pressable>
          </Link>

          <Pressable
            className="items-center py-1"
            disabled={isGuestSubmitting}
            onPress={handleGuestPress}
          >
            <Text className="text-caption text-secondary">
              {isGuestSubmitting
                ? "Continuing..."
                : "Continue as guest"}
            </Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Something went wrong.";
}
