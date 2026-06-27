import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";

type DeleteAccountStep = "warning" | "confirmation" | "success";

type DeleteAccountSheetProps = {
  visible: boolean;
  onClose: () => void;
  onBackToSignIn: () => void;
};

export function DeleteAccountSheet({
  visible,
  onClose,
  onBackToSignIn,
}: DeleteAccountSheetProps) {
  const [step, setStep] = useState<DeleteAccountStep>("warning");
  const [confirmation, setConfirmation] = useState("");
  const isConfirmed = confirmation === "DELETE";

  function resetFlow() {
    setStep("warning");
    setConfirmation("");
  }

  function closeSheet() {
    resetFlow();
    onClose();
  }

  function returnToWarning() {
    setConfirmation("");
    setStep("warning");
  }

  function returnToSignIn() {
    resetFlow();
    onBackToSignIn();
  }

  return (
    <Modal
      animationType="slide"
      onRequestClose={() => undefined}
      presentationStyle="overFullScreen"
      statusBarTranslucent
      transparent
      visible={visible}
    >
      <KeyboardAvoidingView
        behavior={process.env.EXPO_OS === "ios" ? "padding" : undefined}
        className="flex-1 justify-end bg-black/35"
      >
        <View className="flex-1" />

        <View className="rounded-t-[30px] bg-white px-6 pb-10 pt-3">
          <View className="items-center">
            <View className="h-1 w-11 rounded-full bg-[#E5E5E5]" />
          </View>

          {step === "warning" ? (
            <View className="pt-6">
              <View className="items-center">
                <View className="h-16 w-16 items-center justify-center rounded-full bg-[#FFF0F0]">
                  <Ionicons name="trash-outline" size={30} color="#DC2626" />
                </View>

                <Text className="pt-6 text-center font-display text-[24px] font-bold leading-8 text-[#1C1C1E]">
                  Delete your account?
                </Text>
                <Text className="pt-2 text-center font-body text-[16px] leading-6 text-[#8E8E93]">
                  This will permanently remove your account, all ranked lists,
                  and every entry you&apos;ve logged. This cannot be undone.
                </Text>
              </View>

              <View className="gap-3 pt-7">
                <Pressable
                  accessibilityLabel="Continue deleting account"
                  accessibilityRole="button"
                  className="h-13 items-center justify-center rounded-[14px] bg-[#DC2626]"
                  onPress={() => setStep("confirmation")}
                >
                  <Text className="font-body text-[17px] font-bold text-white">
                    Continue
                  </Text>
                </Pressable>

                <Pressable
                  accessibilityLabel="Cancel account deletion"
                  accessibilityRole="button"
                  className="h-13 items-center justify-center rounded-[14px] border border-[#E5E5E5] bg-[#FAFAFA]"
                  onPress={closeSheet}
                >
                  <Text className="font-body text-[17px] font-semibold text-[#8E8E93]">
                    Cancel
                  </Text>
                </Pressable>
              </View>
            </View>
          ) : null}

          {step === "confirmation" ? (
            <View className="pt-6">
              <Text className="font-display text-[24px] font-bold leading-8 text-[#1C1C1E]">
                Confirm deletion
              </Text>
              <Text className="pt-1 font-body text-[16px] leading-6 text-[#8E8E93]">
                Type <Text className="font-bold text-[#1C1C1E]">DELETE</Text> below
                to permanently delete your account.
              </Text>

              <TextInput
                accessibilityLabel="Type DELETE to confirm"
                autoCapitalize="characters"
                autoCorrect={false}
                autoFocus
                className={`mt-6 h-13 rounded-[13px] border bg-[#FAFAFA] px-4 font-mono-bestlist text-[16px] font-bold tracking-[3px] text-[#2D5016] ${
                  isConfirmed ? "border-[#2D7D5B]" : "border-[#E5E5E5]"
                }`}
                onChangeText={setConfirmation}
                placeholder="Type DELETE to confirm"
                placeholderTextColor="#8E8E93"
                returnKeyType="done"
                value={confirmation}
              />

              <View className="gap-3 pt-4">
                <Pressable
                  accessibilityLabel="Delete my account"
                  accessibilityRole="button"
                  className={`h-13 items-center justify-center rounded-[14px] ${
                    isConfirmed ? "bg-[#DC2626]" : "bg-[#E7E7E7]"
                  }`}
                  disabled={!isConfirmed}
                  onPress={() => setStep("success")}
                >
                  <Text
                    className={`font-body text-[17px] font-bold ${
                      isConfirmed ? "text-white" : "text-[#9A9A9A]"
                    }`}
                  >
                    Delete my account
                  </Text>
                </Pressable>

                <Pressable
                  accessibilityLabel="Back to delete account warning"
                  accessibilityRole="button"
                  className="h-13 items-center justify-center rounded-[14px] border border-[#E5E5E5] bg-[#FAFAFA]"
                  onPress={returnToWarning}
                >
                  <Text className="font-body text-[17px] font-semibold text-[#8E8E93]">
                    Back
                  </Text>
                </Pressable>
              </View>
            </View>
          ) : null}

          {step === "success" ? (
            <View className="pt-6">
              <View className="items-center">
                <View className="h-16 w-16 items-center justify-center rounded-full bg-[#EEF4EB]">
                  <Ionicons name="checkmark" size={34} color="#2D7D5B" />
                </View>

                <Text className="pt-6 text-center font-display text-[24px] font-bold leading-8 text-[#1C1C1E]">
                  Account deleted
                </Text>
                <Text className="pt-2 text-center font-body text-[16px] leading-6 text-[#8E8E93]">
                  Your account and all data have been permanently removed.
                  Thanks for using BestList.
                </Text>
              </View>

              <Pressable
                accessibilityLabel="Back to sign in"
                accessibilityRole="button"
                className="mt-7 h-13 items-center justify-center rounded-[14px] bg-[#1C1C1E]"
                onPress={returnToSignIn}
              >
                <Text className="font-body text-[17px] font-bold text-white">
                  Back to sign in
                </Text>
              </Pressable>
            </View>
          ) : null}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
