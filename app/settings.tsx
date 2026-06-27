import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import { Linking, Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { DeleteAccountSheet } from "@/components/delete-account-sheet";

const aboutRows = [
  {
    label: "Privacy policy",
    showsChevron: true,
    url: "https://docs.google.com/document/d/1ajcu8poYGEjaV1qFvriZV4Sa1v6-JAtUIGnp7RwdtMw/edit?usp=sharing",
  },
  {
    label: "Terms of service",
    showsChevron: true,
    url: "https://docs.google.com/document/d/1BNlqGjMY2Ls9v4s8AksbBkvHv2LN0HGVzYN5hHv6-Rs/edit?usp=sharing",
  },
  { label: "App version", value: "1.0.0", showsChevron: false },
];

const supportRows = [
  { label: "Contact us", showsChevron: true },
  { label: "Rate BestList", showsChevron: true },
];

type SettingsRow = {
  label: string;
  value?: string;
  showsChevron: boolean;
  url?: string;
};

function SettingsSection({
  label,
  rows,
}: {
  label: string;
  rows: SettingsRow[];
}) {
  return (
    <View className="gap-3">
      <Text className="px-0.5 font-body text-[12px] font-medium uppercase tracking-[2px] text-[#8E8E93]">
        {label}
      </Text>

      <View className="overflow-hidden rounded-[18px] border border-[#E5E5E5] bg-white">
        {rows.map((row, index) => {
          const url = row.url;
          const content = (
            <View className="h-15.5 flex-row items-center justify-between px-5">
              <Text className="font-body text-[17px] font-medium text-[#1C1C1E]">
                {row.label}
              </Text>

              {row.showsChevron ? (
                <Ionicons
                  name="chevron-forward"
                  size={22}
                  color="#C7C7CC"
                />
              ) : (
                <Text className="font-body text-[17px] text-[#8E8E93]">
                  {row.value}
                </Text>
              )}
            </View>
          );

          return (
            <View key={row.label}>
              {url ? (
                <Pressable onPress={() => Linking.openURL(url)}>
                  {content}
                </Pressable>
              ) : (
                content
              )}

              {index < rows.length - 1 ? (
                <View className="h-px bg-[#E5E5E5]" />
              ) : null}
            </View>
          );
        })}
      </View>
    </View>
  );
}

export default function SettingsScreen() {
  const [isDeleteSheetVisible, setIsDeleteSheetVisible] = useState(false);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#FAFAFA" }}>
      <ScrollView
        className="flex-1"
        contentContainerClassName="grow px-5 pb-8 pt-2"
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
            Settings
          </Text>
        </View>

        <View className="gap-8 pt-8">
          <SettingsSection label="About" rows={aboutRows} />
          <SettingsSection label="Support" rows={supportRows} />

          <Pressable
            accessibilityLabel="Delete account"
            accessibilityRole="button"
            className="mt-1 h-14 items-center justify-center rounded-full border border-[#FFC7CC] bg-[#FFF4F5]"
            onPress={() => setIsDeleteSheetVisible(true)}
          >
            <Text className="font-body text-[17px] font-semibold text-[#E52D35]">
              Delete account
            </Text>
          </Pressable>
        </View>
      </ScrollView>

      <DeleteAccountSheet
        onBackToSignIn={() => {
          setIsDeleteSheetVisible(false);
          router.replace("/sign-in");
        }}
        onClose={() => setIsDeleteSheetVisible(false)}
        visible={isDeleteSheetVisible}
      />
    </SafeAreaView>
  );
}
