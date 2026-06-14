import { Link, router } from "expo-router";
import { useState } from "react";
import {
  Image,
  type ImageSourcePropType,
  Pressable,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { images } from "@/constants/images";
import { getSupabaseClient } from "@/lib/supabase";
import { useStore } from "@/store";

const profile = {
  initials: "G",
  displayName: "Gina",
  handle: "@gina",
  location: "SAN FRANCISCO",
  bio: "Eating my way through the Bay one burrito at a time. Ranking is a contact sport.",
};

const categoryImages: Partial<Record<string, ImageSourcePropType>> = {
  "breakfast-burrito": images.food.breakfastBurrito,
  ramen: images.food.ramen,
  tacos: images.food.tacos,
  pizza: images.food.pizza,
  coffee: images.food.iceCoffee,
  cookies: images.food.cookies,
};

export default function Profile() {
  const categories = useStore((state) => state.categories);
  const entries = useStore((state) => state.entries);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const listCategories = categories.slice(0, 4);
  const stats = [
    { label: "Logged", value: String(entries.length) },
    { label: "Categories", value: String(categories.length) },
  ];

  async function handleSignOut() {
    if (isSigningOut) {
      return;
    }

    setIsSigningOut(true);

    try {
      const supabase = getSupabaseClient();
      const { error } = await supabase.auth.signOut();

      if (error) {
        console.error("Sign out failed:", error.message);
        return;
      }

      router.replace("/sign-in");
    } finally {
      setIsSigningOut(false);
    }
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#f8f8f7" }}>
      <View className="flex-1 px-5 pb-3 pt-2">
        <View className="flex-row items-center justify-between">
          <Pressable
            onPress={() => router.back()}
            className="h-11 w-11 items-center justify-center rounded-full border border-subtle bg-white"
          >
            <Text className="font-body text-[34px] -mt-4.5 leading-9 text-primary">
              ‹
            </Text>
          </Pressable>

          <View className="h-11 w-11 items-center justify-center rounded-full border border-subtle bg-white">
            <Image
              source={images.setting}
              resizeMode="contain"
              className="h-5 w-5"
            />
          </View>
        </View>

        <View className="items-center pt-3">
          <View className="h-25 w-25 items-center justify-center rounded-full bg-[#2D5016] shadow-card">
            <Text className="font-body text-[44px] font-bold leading-10 text-white">
              {profile.initials}
            </Text>
          </View>

          <Text className="mt-1 font-display text-[33px] font-bold leading-9 text-primary">
            {profile.displayName}
          </Text>

          <Text className="mt-1 text-center font-mono-bestlist text-[11px] uppercase leading-3.5 tracking-[3px] text-secondary">
            {profile.handle} · {profile.location}
          </Text>

          <Text
            className="mt-2 max-w-77.5 text-center font-body text-[14px] leading-5.5 text-primary"
            numberOfLines={2}
          >
            {profile.bio}
          </Text>

          <View className="mt-2 h-10 items-center justify-center rounded-full border border-subtle bg-white px-5">
            <Text className="font-body text-[14px] font-semibold leading-5 text-primary">
              Edit profile
            </Text>
          </View>
        </View>

        <View className="mt-5 flex-row items-center rounded-bestlist-xl border border-subtle bg-white px-6 py-5 shadow-card">
          {stats.map((stat, index) => (
            <View key={stat.label} className="flex-1 flex-row items-center">
              <View className="flex-1 items-center">
                <Text className="font-display text-[31px] font-bold leading-8.5 text-primary">
                  {stat.value}
                </Text>
                <Text className="mt-1 font-mono-bestlist text-[9px] uppercase leading-3 tracking-[3px] text-secondary">
                  {stat.label}
                </Text>
              </View>

              {index < stats.length - 1 ? (
                <View className="h-10 w-px bg-bestlist-border" />
              ) : null}
            </View>
          ))}
        </View>

        <View className="mt-5 flex-1">
          <View className="flex-row items-center justify-between">
            <Text className="font-mono-bestlist text-[13px] uppercase leading-4 tracking-[2px] text-secondary">
              Your lists
            </Text>
            <Text className="font-body text-[13px] font-bold leading-5 text-[#2D5016] mb-2">
              See all
            </Text>
          </View>

          <View className="mt-1  gap-2">
            {listCategories.map((category) => {
              const categoryImage: ImageSourcePropType = category.coverPhoto
                ? { uri: category.coverPhoto }
                : (categoryImages[category.id] ?? images.noImages);

              return (
                <Link
                  key={category.id}
                  href={`./category/${category.id}`}
                  asChild
                >
                  <Pressable className="flex-row items-center rounded-bestlist-xl border border-subtle bg-white px-3 gap-2 shadow-card">
                    <View className="h-20 w-20 overflow-hidden rounded-bestlist-md">
                      <Image
                        source={categoryImage}
                        resizeMode="cover"
                        className="h-full w-full"
                      />
                    </View>

                    <View className="min-w-0 flex-1 px-2 p-4">
                      <Text
                        className="font-display text-[22px] font-bold leading-6 text-primary"
                        numberOfLines={1}
                      >
                        {category.name}
                      </Text>
                      <Text
                        className="mt-0.5 font-body text-[14px] leading-4.5 text-secondary"
                        numberOfLines={1}
                      >
                        {category.entryCount} ranked · #1 {category.topEntry}
                      </Text>
                    </View>

                    <Text className="font-body text-[44px] leading-11 text-bestlist-border">
                      ›
                    </Text>
                  </Pressable>
                </Link>
              );
            })}
          </View>
        </View>

        <Pressable
          onPress={handleSignOut}
          disabled={isSigningOut}
          className={`mt-4 h-10 items-center justify-center rounded-full border border-subtle bg-white px-5 ${
            isSigningOut ? "opacity-60" : "opacity-100"
          }`}
        >
          <Text className="font-body text-[14px] font-semibold leading-5 text-red-500">
            {isSigningOut ? "Signing out..." : "Sign Out"}
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
