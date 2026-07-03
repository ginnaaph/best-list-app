import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Linking, Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const MAGNIFIC_URL = "https://www.magnific.com";

const photoCredits = [
  { dish: "Tacos" },
  { dish: "Pizza" },
  { dish: "Ramen" },
  { dish: "Breakfast Burrito" },
  { dish: "Iced Coffee" },
  { dish: "Coffee" },
  { dish: "Cookie" },
];

export default function CreditsScreen() {
  async function handleMagnificPress() {
    try {
      await Linking.openURL(MAGNIFIC_URL);
    } catch (error: unknown) {
      console.warn("Unable to open the Magnific website.", error);
    }
  }

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
            Credits
          </Text>
        </View>

        <View className="gap-3 pt-8">
          <Text className="px-0.5 font-body text-[12px] font-medium uppercase tracking-[2px] text-[#8E8E93]">
            Photo Attributions
          </Text>

          <View className="overflow-hidden rounded-[18px] border border-[#E5E5E5] bg-white">
            {photoCredits.map((credit, index) => (
              <View key={credit.dish}>
                <Pressable
                  accessibilityHint="Opens the Magnific website"
                  accessibilityRole="link"
                  className="min-h-15.5 flex-row items-center justify-between px-5 py-3"
                  onPress={handleMagnificPress}
                >
                  <View className="flex-1 gap-0.5 pr-3">
                    <Text className="font-body text-[17px] font-medium text-[#1C1C1E]">
                      {credit.dish}
                    </Text>
                    <Text className="font-body text-[14px] text-[#2D5016]">
                      Designed by Magnific
                    </Text>
                  </View>

                  <Ionicons
                    name="open-outline"
                    size={21}
                    color="#2D5016"
                  />
                </Pressable>

                {index < photoCredits.length - 1 ? (
                  <View className="h-px bg-[#E5E5E5]" />
                ) : null}
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
