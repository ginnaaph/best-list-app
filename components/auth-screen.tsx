import { Ionicons } from "@expo/vector-icons";
import { Link, router } from "expo-router";
import { useState } from "react";
import {
  Alert,
  Image,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { VerificationModal } from "@/components/verification-modal";
import { images } from "@/constants/images";
import { colors } from "@/constants/theme";
import {
  sendEmailOtp,
  signInWithApple,
  signInWithSocialProvider,
  type SocialAuthProvider,
} from "@/lib/auth";

type AuthScreenProps = {
  mode: "sign-up" | "sign-in";
};

const authCopy = {
  "sign-up": {
    eyebrow: "Start your field guide",
    title: "Create your account.",
    subtitle: "Track your favorite dishes and share your list with friends.",
    email: "you@kitchen.com",
    button: "Sign up",
    footerLead: "Already have an account?",
    footerAction: "Sign in",
    footerHref: "./sign-in",
    legal: true,
  },
  "sign-in": {
    eyebrow: "Welcome back",
    title: "Sign in to your lists.",
    subtitle: "",
    email: "youremail@email.com",
    button: "Sign in",
    footerLead: "New to BestList?",
    footerAction: "Create an account",
    footerHref: "./sign-up",
    legal: false,
  },
} as const;

export function AuthScreen({ mode }: AuthScreenProps) {
  const copy = authCopy[mode];
  const [email, setEmail] = useState<string>(copy.email);
  const [isVerificationVisible, setIsVerificationVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [verifiedEmail, setVerifiedEmail] = useState<string>(copy.email);

  const handlePrimaryPress = async () => {
    setIsSubmitting(true);

    try {
      const normalizedEmail = await sendEmailOtp(email, mode);
      setVerifiedEmail(normalizedEmail);
      setIsVerificationVisible(true);
    } catch (error) {
      Alert.alert("Authentication error", getErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSocialPress = async (provider: SocialAuthProvider) => {
    setIsSubmitting(true);

    try {
      await signInWithSocialProvider(provider);
      router.replace("/");
    } catch (error) {
      Alert.alert("Authentication error", getErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleApplePress = async () => {
    setIsSubmitting(true);

    try {
      await signInWithApple();
      router.replace("/");
    } catch (error) {
      Alert.alert("Authentication error", getErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.surface }}>
      <ScrollView
        className="flex-1"
        contentContainerClassName="px-7 pb-8 pt-20"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View>
          <View className="flex-row items-center justify-center">
            <Text className="font-display text-[44px] font-bold leading-[44px] text-primary">
              Best
            </Text>
            <Text className="font-display text-[44px] font-bold leading-[44px] text-bestlist-green">
              List
            </Text>
          </View>

          <View className="mt-18.5 gap-4">
            <View className="gap-3">
              <Text className="font-mono-bestlist text-[13px] font-bold uppercase leading-4.5 tracking-[5px] text-accent">
                {copy.eyebrow}
              </Text>
              <Text className="font-display text-[39px] font-bold leading-10.75 text-primary">
                {copy.title}
              </Text>
              {copy.subtitle ? (
                <Text className="font-body text-[17px] leading-6 text-secondary">
                  {copy.subtitle}
                </Text>
              ) : null}
            </View>

            <View className="mt-5 gap-2">
              <Text className="font-mono-bestlist text-[13px] font-bold uppercase leading-4 tracking-[4px] text-secondary">
                Email
              </Text>
              <TextInput
                autoCapitalize="none"
                autoCorrect={false}
                className="h-15.5 rounded-bestlist-md border border-subtle bg-card px-5 font-body text-[21px] leading-6.25 text-primary"
                inputMode="email"
                keyboardType="email-address"
                onChangeText={setEmail}
                placeholder={copy.email}
                placeholderTextColor={colors.primaryText}
                textContentType="emailAddress"
                value={email}
              />
            </View>

            <Pressable
              className="mt-4 h-15.25 items-center justify-center rounded-bestlist-lg bg-accent"
              disabled={isSubmitting}
              onPress={handlePrimaryPress}
            >
              <Text className="font-body text-[18px] font-bold leading-5.5 text-white">
                {copy.button}
              </Text>
            </Pressable>

            {copy.legal ? (
              <Text className="text-center font-body text-[14px] leading-4.75 text-secondary">
                By signing up you agree to our{" "}
                <Text
                  className="text-primary underline"
                  onPress={() =>
                    Linking.openURL(
                      "https://docs.google.com/document/d/1BNlqGjMY2Ls9v4s8AksbBkvHv2LN0HGVzYN5hHv6-Rs/edit?usp=sharing",
                    )
                  }
                  onPress={() => router.push("/terms")}
                >
                  Terms
                </Text>{" "}
                and{" "}
                <Text
                  className="text-primary underline"
                  onPress={() =>
                    Linking.openURL(
                      "https://docs.google.com/document/d/1ajcu8poYGEjaV1qFvriZV4Sa1v6-JAtUIGnp7RwdtMw/edit?usp=sharing",
                    )
                  }
                  onPress={() => router.push("/privacy")}
                >
                  Privacy
                </Text>
                .
              </Text>
            ) : null}

            <View className="my-4 flex-row items-center gap-4">
              <View className="h-px flex-1 bg-[#E5E3DF]" />
              <Text className="font-mono-bestlist text-[13px] font-bold uppercase leading-4 text-secondary">
                Or
              </Text>
              <View className="h-px flex-1 bg-[#E5E3DF]" />
            </View>

            <SocialButton
              alignIconLeft={mode === "sign-up"}
              icon="google"
              label="Continue with Google"
              onPress={() => handleSocialPress("google")}
            />
            <SocialButton
              icon="apple"
              label="Continue with Apple"
              onPress={handleApplePress}
            />
          </View>
        </View>
      </ScrollView>

      <View className="items-center px-7 pb-2 pt-2">
        <Link href={copy.footerHref} asChild>
          <Pressable className="py-2">
            <Text className="font-body text-[16px] leading-5 text-secondary">
              {copy.footerLead}{" "}
              <Text className="font-bold text-accent">{copy.footerAction}</Text>
            </Text>
          </Pressable>
        </Link>
      </View>

      <VerificationModal
        email={verifiedEmail}
        mode={mode}
        onClose={() => setIsVerificationVisible(false)}
        visible={isVerificationVisible}
      />
    </SafeAreaView>
  );
}

type SocialButtonProps = {
  alignIconLeft?: boolean;
  icon: "google" | "apple";
  label: string;
  onPress: () => void;
};

function SocialButton({
  alignIconLeft = false,
  icon,
  label,
  onPress,
}: SocialButtonProps) {
  const isGoogle = icon === "google";

  return (
    <Pressable
      className={
        alignIconLeft
          ? "relative h-15.25 flex-row items-center justify-center rounded-bestlist-md border border-subtle bg-card px-6"
          : "h-15.25 flex-row items-center rounded-bestlist-md border border-subtle bg-card px-6"
      }
      onPress={onPress}
    >
      <View
        className={
          alignIconLeft
            ? "absolute left-6 h-8 w-8 items-center justify-center"
            : "w-8 items-center"
        }
      >
        {isGoogle ? (
          <Image
            source={images.googleLogo}
            resizeMode="contain"
            className={alignIconLeft ? "h-5.5 w-5.5" : "size-7"}
            style={
              Platform.OS === "web"
                ? {
                    height: alignIconLeft ? 22 : 28,
                    width: alignIconLeft ? 22 : 28,
                  }
                : undefined
            }
          />
        ) : (
          <Ionicons name="logo-apple" size={31} color="#000000" />
        )}
      </View>
      <Text
        className={
          alignIconLeft
            ? "text-center font-body text-[18px] font-bold leading-5.5 text-primary"
            : "flex-1 text-center font-body text-[18px] font-bold leading-5.5 text-primary"
        }
      >
        {label}
      </Text>
      {alignIconLeft ? null : <View className="w-8" />}
    </Pressable>
  );
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Please try again.";
}
