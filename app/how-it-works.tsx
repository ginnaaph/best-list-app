import { router } from "expo-router";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import {
  DishCardPreview,
  HowItWorksStep,
  RankingPreview,
  ScorePreview,
} from "@/components";
import { colors } from "@/constants/theme";

export default function HowItWorks() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.surface }}>
      <View className="flex-1 px-5 pb-7 pt-3">
        <View className="h-8 flex-row items-center justify-between">
          <Pressable
            accessibilityLabel="Go back"
            className="h-8 w-8 items-center justify-center rounded-full border border-subtle bg-white"
            onPress={() => router.back()}
          >
            <Text className="font-body text-[18px] leading-[20px] text-accent">
              ‹
            </Text>
          </Pressable>

          <Pressable className="px-1 py-2">
            <Text className="font-body text-[13px] font-medium leading-[16px] text-secondary">
              Skip
            </Text>
          </Pressable>
        </View>

        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          <View className="gap-5 pb-5 pt-4">
            <View>
              <Text className="font-mono-bestlist text-[11px] font-bold uppercase leading-[14px] text-accent">
                The idea
              </Text>
              <Text className="max-w-[320px] font-display text-[38px] font-bold leading-[43px] text-primary">
                One bite, one score, one running ranking.
              </Text>
            </View>

            <View className="gap-4">
              <HowItWorksStep
                number="1"
                title="Make a category"
                description="Burritos, ramen, oat-milk lattes - pick a thing you have opinions about."
              >
                <DishCardPreview />
              </HowItWorksStep>

              <HowItWorksStep
                number="2"
                title="Rate it your way"
                description="Taste, value, portion, vibe. We compute one overall score from your dials."
              >
                <ScorePreview />
              </HowItWorksStep>

              <HowItWorksStep
                number="3"
                title="Share the list"
                description="Send a clean, screenshot-ready ranking to friends - or keep it for yourself."
              >
                <RankingPreview />
              </HowItWorksStep>
            </View>
          </View>
        </ScrollView>

        <Pressable className="h-14 items-center justify-center rounded-bestlist-md bg-accent">
          <Text className="font-body text-[14px] font-bold leading-[18px] text-white">
            Next
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
