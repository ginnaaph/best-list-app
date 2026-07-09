import { Ionicons } from "@expo/vector-icons";
import { Link, router } from "expo-router";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const prohibitedContent = [
  "Illegal or infringes on someone else's copyright or privacy",
  "Offensive, harassing, or harmful to others",
  "Spam, misleading, or fraudulent",
];

function BulletList({ items }: { items: string[] }) {
  return (
    <View className="gap-2">
      {items.map((item) => (
        <View className="flex-row gap-2" key={item}>
          <Text className="font-body text-[16px] leading-6 text-[#1C1C1E]">
            •
          </Text>
          <Text className="flex-1 font-body text-[16px] leading-6 text-[#1C1C1E]">
            {item}
          </Text>
        </View>
      ))}
    </View>
  );
}

export default function TermsScreen() {
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
            Terms of Service
          </Text>
        </View>

        <View className="gap-7 pt-8">
          <Text className="font-body text-[14px] text-[#8E8E93]">
            Last updated: July 9, 2026
          </Text>

          <View className="gap-3">
            <Text className="font-body text-[19px] font-bold text-[#1C1C1E]">
              1. Acceptance of Terms
            </Text>
            <Text className="font-body text-[16px] leading-6 text-[#1C1C1E]">
              By downloading or using BestList, you agree to these Terms of
              Service. If you don&apos;t agree, please don&apos;t use the app. These
              terms apply to all users of BestList, including anyone who
              creates an account or shares content through the app.
            </Text>
          </View>

          <View className="gap-3">
            <Text className="font-body text-[19px] font-bold text-[#1C1C1E]">
              2. What BestList Is
            </Text>
            <Text className="font-body text-[16px] leading-6 text-[#1C1C1E]">
              BestList is a free personal app that lets you create and share
              lists of your favorite food dishes and restaurants. It&apos;s a
              hobby project, not a commercial product. That means it&apos;s
              provided as-is, with no guarantees of uptime, feature
              availability, or long-term support.
            </Text>
          </View>

          <View className="gap-3">
            <Text className="font-body text-[19px] font-bold text-[#1C1C1E]">
              3. Your Account
            </Text>
            <Text className="font-body text-[16px] leading-6 text-[#1C1C1E]">
              You&apos;re responsible for keeping your account credentials
              secure. Don&apos;t share your login with others. If you think your
              account has been compromised, contact us right away.
            </Text>
            <Text className="font-body text-[16px] leading-6 text-[#1C1C1E]">
              You can delete your account at any time from the Settings screen.
              When you delete your account, your data is permanently removed
              from our systems.
            </Text>
          </View>

          <View className="gap-3">
            <Text className="font-body text-[19px] font-bold text-[#1C1C1E]">
              4. Content You Create
            </Text>
            <Text className="font-body text-[16px] leading-6 text-[#1C1C1E]">
              You own the content you create in BestList — your lists, dish
              names, notes, and photos. By using the app, you give BestList a
              limited license to store and display that content to you (and to
              anyone you share a link with).
            </Text>
            <Text className="font-body text-[16px] leading-6 text-[#1C1C1E]">
              You agree not to upload content that is:
            </Text>
            <BulletList items={prohibitedContent} />
            <Text className="font-body text-[16px] leading-6 text-[#1C1C1E]">
              We reserve the right to remove content that violates these terms,
              though as a small hobby project, active moderation is limited.
            </Text>
          </View>

          <View className="gap-3">
            <Text className="font-body text-[19px] font-bold text-[#1C1C1E]">
              5. Link Sharing
            </Text>
            <Text className="font-body text-[16px] leading-6 text-[#1C1C1E]">
              BestList lets you share your lists via a link. When you share a
              link, anyone with that link can view that list. You control what
              you share. We don&apos;t have a public feed or user discovery
              feature — shared content is only accessible to people who have
              your specific link.
            </Text>
          </View>

          <View className="gap-3">
            <Text className="font-body text-[19px] font-bold text-[#1C1C1E]">
              6. Photos
            </Text>
            <Text className="font-body text-[16px] leading-6 text-[#1C1C1E]">
              You can upload photos to your lists, whether taken with your
              device&apos;s camera or chosen from your photo library. By uploading
              a photo, you confirm that you have the right to use it. Don&apos;t
              upload photos of people without their permission, or images you
              don&apos;t own or have a license to use.
            </Text>
          </View>

          <View className="gap-3">
            <Text className="font-body text-[19px] font-bold text-[#1C1C1E]">
              7. Privacy
            </Text>
            <Text className="font-body text-[16px] leading-6 text-[#1C1C1E]">
              How we collect and handle your data is covered in our{" "}
              <Link
                className="font-body font-semibold text-[#2D5016] underline"
                href="/privacy"
              >
                Privacy Policy
              </Link>
              , which is part of these terms. Please read it — it explains what
              Supabase stores on our behalf, what Sentry collects for crash
              and error reporting, and how we handle your information.
            </Text>
          </View>

          <View className="gap-3">
            <Text className="font-body text-[19px] font-bold text-[#1C1C1E]">
              8. Disclaimer of Warranties
            </Text>
            <Text className="font-body text-[16px] leading-6 text-[#1C1C1E]">
              BestList is provided &quot;as is&quot; without any warranties,
              express or implied. We don&apos;t guarantee the app will always be
              available, error-free, or that your data will never be lost. Use
              it at your own risk.
            </Text>
            <Text className="font-body text-[16px] leading-6 text-[#1C1C1E]">
              We&apos;re not responsible for the accuracy of restaurant
              information, dish descriptions, or any other content created by
              users.
            </Text>
          </View>

          <View className="gap-3">
            <Text className="font-body text-[19px] font-bold text-[#1C1C1E]">
              9. Limitation of Liability
            </Text>
            <Text className="font-body text-[16px] leading-6 text-[#1C1C1E]">
              To the fullest extent permitted by law, BestList and its developer
              will not be liable for any indirect, incidental, or consequential
              damages arising from your use of the app. Our total liability to
              you for any claim is limited to $0, since the app is free.
            </Text>
          </View>

          <View className="gap-3">
            <Text className="font-body text-[19px] font-bold text-[#1C1C1E]">
              10. Changes to These Terms
            </Text>
            <Text className="font-body text-[16px] leading-6 text-[#1C1C1E]">
              We may update these terms from time to time. If we make
              significant changes, we&apos;ll update the &quot;Last updated&quot;
              date at the top of this document. Continued use of the app after
              changes means you accept the new terms.
            </Text>
          </View>

          <View className="gap-3">
            <Text className="font-body text-[19px] font-bold text-[#1C1C1E]">
              11. Governing Law
            </Text>
            <Text className="font-body text-[16px] leading-6 text-[#1C1C1E]">
              These terms are governed by the laws of the United States and the
              state where the developer resides, without regard to conflict of
              law principles.
            </Text>
          </View>

          <View className="gap-3">
            <Text className="font-body text-[19px] font-bold text-[#1C1C1E]">
              12. Contact
            </Text>
            <Text className="font-body text-[16px] leading-6 text-[#1C1C1E]">
              Questions about these terms? Reach out via the contact option in
              the app&apos;s Settings screen.
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
