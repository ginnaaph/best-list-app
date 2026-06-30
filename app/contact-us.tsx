import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import {
  Linking,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ContactUsScreen() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  const canSend = Boolean(name.trim() && email.trim() && message.trim());

  function handleSend() {
    const body = `Name: ${name.trim()}\nEmail (reply-to): ${email.trim()}\n\nMessage:\n${message.trim()}`;
    const mailtoUrl = `mailto:bestlist.app@gmail.com?subject=${encodeURIComponent(
      subject.trim(),
    )}&body=${encodeURIComponent(body)}`;

    void Linking.openURL(mailtoUrl);
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
              canSend ? "bg-[#2D5016]" : "bg-[#2D5016]/40"
            }`}
            disabled={!canSend}
            onPress={handleSend}
          >
            <Text className="font-body text-[18px] font-bold text-white">
              Send
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
