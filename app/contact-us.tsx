import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import {
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const FORMSPREE_URL = "https://formspree.io/f/xlgyvylr";
const GENERIC_ERROR_MESSAGE = "Something went wrong, please try again";

function getFormspreeError(payload: unknown) {
  if (!payload || typeof payload !== "object") {
    return null;
  }

  if (
    "error" in payload &&
    typeof payload.error === "string" &&
    payload.error.trim()
  ) {
    return payload.error;
  }

  if ("errors" in payload && Array.isArray(payload.errors)) {
    const firstError = payload.errors.find(
      (error): error is { message: string } =>
        Boolean(
          error &&
            typeof error === "object" &&
            "message" in error &&
            typeof error.message === "string" &&
            error.message.trim(),
        ),
    );

    return firstError?.message ?? null;
  }

  return null;
}

export default function ContactUsScreen() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const canSend = Boolean(name.trim() && email.trim() && message.trim());

  async function handleSend() {
    if (!canSend || isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const response = await fetch(FORMSPREE_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          subject: subject.trim(),
          message: message.trim(),
        }),
      });

      if (response.ok) {
        setIsSubmitted(true);
      } else {
        const payload: unknown = await response.json().catch(() => null);
        setSubmitError(getFormspreeError(payload) ?? GENERIC_ERROR_MESSAGE);
      }
    } catch {
      setSubmitError(GENERIC_ERROR_MESSAGE);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView
        className="flex-1"
        contentContainerClassName="grow px-5 pb-8 pt-2"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View className="relative h-12 flex-row items-center justify-center">
          <Pressable
            accessibilityLabel="Go back"
            accessibilityRole="button"
            className="absolute left-0 h-11 w-11 items-center justify-center rounded-full border border-[#E5E5E5] bg-white"
            onPress={() => router.back()}
          >
            <Ionicons name="chevron-back" size={28} color="#1C1C1E" />
          </Pressable>

          <Text className="font-display text-[34px] font-bold text-[#1C1C1E]">
            Contact Us
          </Text>
        </View>

        {isSubmitted ? (
          <View accessibilityLiveRegion="polite" className="gap-3 pt-8">
            <Text className="font-body text-[19px] font-bold text-[#1C1C1E]">
              Message sent
            </Text>
            <Text className="font-body text-[17px] leading-6 text-[#1C1C1E]">
              Thanks for reaching out. We&apos;ll get back to you as soon as we
              can.
            </Text>
          </View>
        ) : (
          <View className="gap-5 pt-8">
            <View className="gap-2">
              <Text className="font-body text-[15px] font-semibold text-[#1C1C1E]">
                Name
              </Text>
              <TextInput
                autoCapitalize="words"
                className="h-15.5 rounded-[18px] border border-[#E5E5E5] bg-white px-5 font-body text-[17px] text-[#1C1C1E]"
                onChangeText={setName}
                placeholder="Your name"
                placeholderTextColor="#8E8E93"
                textContentType="name"
                value={name}
              />
            </View>

            <View className="gap-2">
              <Text className="font-body text-[15px] font-semibold text-[#1C1C1E]">
                Email
              </Text>
              <TextInput
                autoCapitalize="none"
                autoCorrect={false}
                className="h-15.5 rounded-[18px] border border-[#E5E5E5] bg-white px-5 font-body text-[17px] text-[#1C1C1E]"
                inputMode="email"
                keyboardType="email-address"
                onChangeText={setEmail}
                placeholder="you@example.com"
                placeholderTextColor="#8E8E93"
                textContentType="emailAddress"
                value={email}
              />
            </View>

            <View className="gap-2">
              <Text className="font-body text-[15px] font-semibold text-[#1C1C1E]">
                Subject
              </Text>
              <TextInput
                className="h-15.5 rounded-[18px] border border-[#E5E5E5] bg-white px-5 font-body text-[17px] text-[#1C1C1E]"
                onChangeText={setSubject}
                placeholder="How can we help?"
                placeholderTextColor="#8E8E93"
                value={subject}
              />
            </View>

            <View className="gap-2">
              <Text className="font-body text-[15px] font-semibold text-[#1C1C1E]">
                Message
              </Text>
              <TextInput
                className="min-h-40 rounded-[18px] border border-[#E5E5E5] bg-white px-5 py-4 pt-4 font-body text-[17px] text-[#1C1C1E]"
                multiline
                onChangeText={setMessage}
                placeholder="Tell us what's on your mind"
                placeholderTextColor="#8E8E93"
                textAlignVertical="top"
                value={message}
              />
            </View>

            <Pressable
              accessibilityRole="button"
              className={`mt-1 h-15.5 items-center justify-center rounded-full ${
                canSend && !isSubmitting
                  ? "bg-[#2D5016]"
                  : "bg-[#2D5016]/40"
              }`}
              disabled={!canSend || isSubmitting}
              onPress={handleSend}
            >
              <Text className="font-body text-[18px] font-bold text-white">
                {isSubmitting ? "Sending..." : "Send"}
              </Text>
            </Pressable>

            {submitError ? (
              <Text
                accessibilityLiveRegion="polite"
                className="text-center font-body text-[15px] text-[#B3261E]"
              >
                {submitError}
              </Text>
            ) : null}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
