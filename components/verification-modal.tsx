import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";

import { sendEmailOtp, verifyEmailOtp, type EmailAuthMode } from "@/lib/auth";

type VerificationModalProps = {
  email: string;
  mode: EmailAuthMode;
  visible: boolean;
  onClose: () => void;
};

const CODE_LENGTH = 6;

export function VerificationModal({
  email,
  mode,
  visible,
  onClose,
}: VerificationModalProps) {
  const inputRef = useRef<TextInput>(null);
  const [code, setCode] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);

  useEffect(() => {
    if (!visible) {
      setCode("");
      return;
    }

    const focusTimer = setTimeout(() => inputRef.current?.focus(), 250);
    return () => clearTimeout(focusTimer);
  }, [visible]);

  const handleCodeChange = async (value: string) => {
    const nextCode = value.replace(/\D/g, "").slice(0, CODE_LENGTH);
    setCode(nextCode);

    if (nextCode.length === CODE_LENGTH) {
      setIsVerifying(true);

      try {
        await verifyEmailOtp(email, nextCode);
        onClose();
        router.replace("/");
      } catch (error) {
        setCode("");
        Alert.alert("Verification error", getErrorMessage(error));
      } finally {
        setIsVerifying(false);
      }
    }
  };

  const handleResendPress = async () => {
    setIsResending(true);

    try {
      await sendEmailOtp(email, mode);
      setCode("");
      inputRef.current?.focus();
    } catch (error) {
      Alert.alert("Authentication error", getErrorMessage(error));
    } finally {
      setIsResending(false);
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

            <View className="h-14.5 w-14.5 items-center justify-center rounded-full bg-[#EAF2EE]">
              <Ionicons name="mail-outline" size={32} color="#2D6A4F" />
            </View>

            <View className="items-center gap-2">
              <Text className="font-mono-bestlist text-[13px] font-bold uppercase leading-4 tracking-[4px] text-accent">
                Check your inbox
              </Text>
              <Text className="text-center font-display text-[29px] font-bold leading-8.25 text-primary">
                Enter your verification code
              </Text>
              <Text className="text-center font-body text-[16px] leading-5.5 text-secondary">
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
              const isActive =
                index === code.length && code.length < CODE_LENGTH;

              return (
                <View
                  className={`h-15.25 flex-1 items-center justify-center rounded-bestlist-md border bg-card ${
                    isActive ? "border-accent" : "border-subtle"
                  }`}
                  key={index}
                >
                  <Text className="font-body text-[28px] font-bold leading-8 text-primary">
                    {digit ?? (isActive ? "|" : "")}
                  </Text>
                </View>
              );
            })}
          </Pressable>

          <View className="mt-6 flex-row items-center justify-between">
            <Text className="font-body text-[15px] leading-4.75 text-secondary">
              Didn&apos;t get it?{" "}
              <Text
                className="font-bold text-accent"
                onPress={handleResendPress}
              >
                Resend
              </Text>
            </Text>
            <Text className="font-mono-bestlist text-[16px] leading-5 text-secondary">
              00:42
            </Text>
          </View>

          <TextInput
            accessibilityLabel="Verification code"
            className="absolute h-0 w-0 opacity-0"
            inputMode="numeric"
            keyboardType="number-pad"
            maxLength={CODE_LENGTH}
            onChangeText={(value) => {
              if (!isVerifying && !isResending) {
                void handleCodeChange(value);
              }
            }}
            ref={inputRef}
            textContentType="oneTimeCode"
            value={code}
          />
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Please try again.";
}
