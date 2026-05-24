import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";

type VerificationModalProps = {
  email: string;
  visible: boolean;
  onClose: () => void;
};

const CODE_LENGTH = 6;

export function VerificationModal({
  email,
  visible,
  onClose,
}: VerificationModalProps) {
  const inputRef = useRef<TextInput>(null);
  const [code, setCode] = useState("");

  useEffect(() => {
    if (!visible) {
      setCode("");
      return;
    }

    const focusTimer = setTimeout(() => inputRef.current?.focus(), 250);
    return () => clearTimeout(focusTimer);
  }, [visible]);

  const handleCodeChange = (value: string) => {
    const nextCode = value.replace(/\D/g, "").slice(0, CODE_LENGTH);
    setCode(nextCode);

    if (nextCode.length === CODE_LENGTH) {
      setTimeout(() => {
        onClose();
        router.replace("./home");
      }, 120);
    }
  };

  return (
    <Modal
      animationType="fade"
      onRequestClose={onClose}
      transparent
      visible={visible}
    >
      <KeyboardAvoidingView
        behavior={Platform.select({ ios: "padding", default: undefined })}
        className="flex-1 justify-end bg-black/35"
      >
        <Pressable className="flex-1" onPress={onClose} />

        <View className="rounded-t-[28px] bg-card px-7 pb-9 pt-5">
          <View className="items-center gap-4">
            <View className="h-1 w-11 rounded-full bg-[#E5E3DF]" />

            <View className="h-[58px] w-[58px] items-center justify-center rounded-full bg-[#EAF2EE]">
              <Ionicons name="mail-outline" size={32} color="#2D6A4F" />
            </View>

            <View className="items-center gap-2">
              <Text className="font-mono-bestlist text-[13px] font-bold uppercase leading-[16px] tracking-[4px] text-accent">
                Check your inbox
              </Text>
              <Text className="text-center font-display text-[29px] font-bold leading-[33px] text-primary">
                Enter your verification code
              </Text>
              <Text className="text-center font-body text-[16px] leading-[22px] text-secondary">
                We sent a 6-digit code to{"\n"}
                <Text className="font-bold text-primary">{email}</Text>
              </Text>
            </View>
          </View>

          <Pressable
            className="mt-8 flex-row justify-between gap-2"
            onPress={() => inputRef.current?.focus()}
          >
            {Array.from({ length: CODE_LENGTH }).map((_, index) => {
              const digit = code[index];
              const isActive = index === code.length && code.length < CODE_LENGTH;

              return (
                <View
                  className={`h-[61px] flex-1 items-center justify-center rounded-bestlist-md border bg-card ${
                    isActive ? "border-accent" : "border-subtle"
                  }`}
                  key={index}
                >
                  <Text className="font-body text-[28px] font-bold leading-[32px] text-primary">
                    {digit ?? (isActive ? "|" : "")}
                  </Text>
                </View>
              );
            })}
          </Pressable>

          <View className="mt-6 flex-row items-center justify-between">
            <Text className="font-body text-[15px] leading-[19px] text-secondary">
              Didn&apos;t get it?{" "}
              <Text className="font-bold text-accent">Resend</Text>
            </Text>
            <Text className="font-mono-bestlist text-[16px] leading-[20px] text-secondary">
              00:42
            </Text>
          </View>

          <TextInput
            accessibilityLabel="Verification code"
            className="absolute h-0 w-0 opacity-0"
            inputMode="numeric"
            keyboardType="number-pad"
            maxLength={CODE_LENGTH}
            onChangeText={handleCodeChange}
            ref={inputRef}
            textContentType="oneTimeCode"
            value={code}
          />
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
