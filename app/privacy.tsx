import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const collectedInformation = [
  "Account information — your email address (we send a one-time code to your inbox, no password required), your name and email if you sign in with Google, or your Apple ID token if you use Sign in with Apple. Apple does not share your real email with us when you use their private relay option.",
  "Profile information — your display name and any profile details you choose to add.",
  "Content you create — your lists, dish names, restaurant names, notes, and ratings.",
  "Photos you upload — images you attach to your dishes, lists, or profile, either captured with your device's camera or selected from your photo library.",
  'Place and city search terms — when you type a restaurant, dish location, or city name while adding an entry, that text is sent to Google Places API to return autocomplete suggestions and address details (see "Third-Party Services" below).',
  "Shared links — when you share a list via link, we store that link so others can view it.",
];

const informationNotCollected = [
  "Your device's GPS location or precise location data",
  "Your contacts or address book",
  "Any payment or financial information (the app is free)",
  "Any data from other apps on your device",
  "Analytics or behavioral tracking beyond what Supabase provides by default",
];

const dataUses = [
  "To create and manage your account",
  "To store and display your lists, dishes, and photos",
  "To let you search for and autofill restaurant names, addresses, and cities when adding an entry",
  "To enable link sharing so others can view lists you choose to share",
  "To allow you to delete your account and all associated data",
];

const userRights = [
  "Access the data we have about you",
  "Correct any inaccurate information",
  "Delete your account and all associated data",
  "Stop using the app at any time",
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

export default function PrivacyScreen() {
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
            Privacy Policy
          </Text>
        </View>

        <View className="gap-7 pt-8">
          <Text className="font-body text-[14px] text-[#8E8E93]">
            Last updated: July 6, 2026
          </Text>

          <View className="gap-3">
            <Text className="font-body text-[19px] font-bold text-[#1C1C1E]">
              Overview
            </Text>
            <Text className="font-body text-[16px] leading-6 text-[#1C1C1E]">
              BestList is a free app for saving and sharing your favorite food
              dishes and restaurants, made by Gina Pham. This Privacy Policy
              explains what information we collect, how we use it, and how we
              keep it safe. We&apos;ve written this in plain English because you
              deserve to actually understand it.
            </Text>
            <Text className="font-body text-[16px] leading-6 text-[#1C1C1E]">
              By using BestList, you agree to the practices described here.
            </Text>
          </View>

          <View className="gap-3">
            <Text className="font-body text-[19px] font-bold text-[#1C1C1E]">
              What We Collect
            </Text>
            <Text className="font-body text-[16px] leading-6 text-[#1C1C1E]">
              When you create an account and use BestList, we collect the
              following:
            </Text>
            <BulletList items={collectedInformation} />
          </View>

          <View className="gap-3">
            <Text className="font-body text-[19px] font-bold text-[#1C1C1E]">
              What We Don&apos;t Collect
            </Text>
            <Text className="font-body text-[16px] leading-6 text-[#1C1C1E]">
              We do not collect:
            </Text>
            <BulletList items={informationNotCollected} />
          </View>

          <View className="gap-3">
            <Text className="font-body text-[19px] font-bold text-[#1C1C1E]">
              How We Use Your Data
            </Text>
            <Text className="font-body text-[16px] leading-6 text-[#1C1C1E]">
              We use your information only to make BestList work:
            </Text>
            <BulletList items={dataUses} />
            <Text className="font-body text-[16px] leading-6 text-[#1C1C1E]">
              We don&apos;t use your data for advertising, we don&apos;t sell it,
              and we don&apos;t share it with third parties except as described
              below.
            </Text>
          </View>

          <View className="gap-3">
            <Text className="font-body text-[19px] font-bold text-[#1C1C1E]">
              Third-Party Services
            </Text>
            <Text className="font-body text-[16px] leading-6 text-[#1C1C1E]">
              BestList is built on Supabase, which handles our database, file
              storage, and authentication. Your data is stored on Supabase&apos;s
              servers. You can read Supabase&apos;s privacy policy at
              supabase.com/privacy.
            </Text>
            <Text className="font-body text-[16px] leading-6 text-[#1C1C1E]">
              If you use Sign in with Apple, Apple handles authentication on
              their end. Apple&apos;s privacy policy applies to that interaction.
            </Text>
            <Text className="font-body text-[16px] leading-6 text-[#1C1C1E]">
              If you choose to sign in with Google, Google handles
              authentication on their end and shares your name and email
              address with us to create your account. Google&apos;s privacy policy
              applies to that interaction and can be found at
              policies.google.com/privacy.
            </Text>
            <Text className="font-body text-[16px] leading-6 text-[#1C1C1E]">
              We also use the Google Places API to help you find and autofill
              restaurants and cities when adding a new entry. When you type in
              the &quot;place&quot; or &quot;city&quot; field, what you type is sent
              to Google to return matching suggestions and, once you pick one,
              its address details (like city and state). We do not send your
              device&apos;s location — only the text you type. Google&apos;s privacy
              policy applies to this data and can be found at
              policies.google.com/privacy.
            </Text>
            <Text className="font-body text-[16px] leading-6 text-[#1C1C1E]">
              These are the only third-party services with access to your data.
            </Text>
          </View>

          <View className="gap-3">
            <Text className="font-body text-[19px] font-bold text-[#1C1C1E]">
              Camera &amp; Photo Library Access
            </Text>
            <Text className="font-body text-[16px] leading-6 text-[#1C1C1E]">
              BestList asks for access to your device&apos;s camera and photo
              library so you can attach a photo to a dish, list entry, or
              profile picture — either by taking a new photo or choosing an
              existing one. We only access the specific photo you take or
              select — we do not access or scan your full photo library, and
              the camera is only active when you&apos;ve chosen to take a photo
              within the app. Photos are uploaded to and stored securely in
              Supabase&apos;s file storage.
            </Text>
          </View>

          <View className="gap-3">
            <Text className="font-body text-[19px] font-bold text-[#1C1C1E]">
              Photos
            </Text>
            <Text className="font-body text-[16px] leading-6 text-[#1C1C1E]">
              Photos you upload are only accessible in the context of your
              lists — either by you, or by anyone you&apos;ve shared a link with.
              We do not use your photos for any other purpose.
            </Text>
          </View>

          <View className="gap-3">
            <Text className="font-body text-[19px] font-bold text-[#1C1C1E]">
              Link Sharing
            </Text>
            <Text className="font-body text-[16px] leading-6 text-[#1C1C1E]">
              When you share a list via a link, anyone with that link can view
              that list, including your public handle so viewers know who made
              it. BestList does not have a public feed or user discovery
              feature — your content is only visible to people you directly
              share a link with. You can stop sharing a list at any time from
              within the app.
            </Text>
          </View>

          <View className="gap-3">
            <Text className="font-body text-[19px] font-bold text-[#1C1C1E]">
              Data Retention
            </Text>
            <Text className="font-body text-[16px] leading-6 text-[#1C1C1E]">
              We keep your data for as long as your account is active. If you
              delete your account, all of your data — including your lists,
              dishes, photos, and account information — is permanently deleted
              from our systems. You can delete your account at any time from
              the Settings screen in the app.
            </Text>
          </View>

          <View className="gap-3">
            <Text className="font-body text-[19px] font-bold text-[#1C1C1E]">
              Your Rights
            </Text>
            <Text className="font-body text-[16px] leading-6 text-[#1C1C1E]">
              You have the right to:
            </Text>
            <BulletList items={userRights} />
            <Text className="font-body text-[16px] leading-6 text-[#1C1C1E]">
              To exercise any of these, use the account deletion option in
              Settings, or email us at bestlist.app@gmail.com.
            </Text>
          </View>

          <View className="gap-3">
            <Text className="font-body text-[19px] font-bold text-[#1C1C1E]">
              Children&apos;s Privacy
            </Text>
            <Text className="font-body text-[16px] leading-6 text-[#1C1C1E]">
              BestList is not directed at children under 13. We do not
              knowingly collect personal information from children under 13.
              If you believe a child has provided us with personal information,
              please contact us and we will delete it.
            </Text>
          </View>

          <View className="gap-3">
            <Text className="font-body text-[19px] font-bold text-[#1C1C1E]">
              Changes to This Policy
            </Text>
            <Text className="font-body text-[16px] leading-6 text-[#1C1C1E]">
              If we make meaningful changes to this privacy policy, we&apos;ll
              update the &quot;Last updated&quot; date at the top of this document.
              We encourage you to review it periodically. Continued use of the
              app after changes means you accept the updated policy.
            </Text>
          </View>

          <View className="gap-3">
            <Text className="font-body text-[19px] font-bold text-[#1C1C1E]">
              Contact
            </Text>
            <Text className="font-body text-[16px] leading-6 text-[#1C1C1E]">
              Questions or concerns about your privacy? Reach out via the
              contact option in the app&apos;s Settings screen, or email us at
              bestlist.app@gmail.com. We&apos;ll do our best to respond promptly.
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
