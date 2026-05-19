import { Image } from "expo-image";
import { ScrollView, Text, View } from "react-native";

import { images } from "@/constants/images";

export default function Index() {
  return (
    <ScrollView
      className="flex-1 bg-app"
      contentContainerClassName="min-h-full px-6 py-16"
      contentInsetAdjustmentBehavior="automatic"
    >
      <View className="gap-8">
        <View className="gap-2 border-b border-subtle pb-5">
          <Text className="text-screen-title text-primary">BestList</Text>
          <Text className="text-caption text-secondary">
            Color System - Clean & Minimal + Basil Green
          </Text>
        </View>

        <View className="gap-3">
          <Text className="text-label uppercase text-secondary">Typography</Text>
          <View className="flex-row flex-wrap items-end gap-x-8 gap-y-4">
            <View>
              <Text className="text-brand text-primary">BestList</Text>
              <Text className="text-caption text-secondary">Display / App Name</Text>
            </View>
            <View>
              <Text className="text-card-title text-primary">Breakfast Burrito</Text>
              <Text className="text-caption text-secondary">Category Title</Text>
            </View>
            <View>
              <Text className="text-body text-secondary">Nopalito - San Francisco</Text>
              <Text className="text-caption text-secondary">Entry Subtitle</Text>
            </View>
            <View>
              <Text className="text-score text-accent">#1 9.4</Text>
              <Text className="text-caption text-secondary">Rank / Score</Text>
            </View>
          </View>
        </View>

        <View className="gap-3">
          <Text className="text-label uppercase text-secondary">Entry Card Preview</Text>
          <View className="w-full max-w-80 flex-row items-center gap-3 rounded-bestlist-md border border-subtle bg-card p-3 shadow-card">
            <View className="h-6 w-6 items-center justify-center rounded-full bg-accent">
              <Text className="text-label text-white">1</Text>
            </View>
            <Image
              source={images.bestListMark}
              className="h-10 w-10 rounded-bestlist-sm bg-app"
              contentFit="cover"
            />
            <View className="flex-1">
              <Text className="text-label text-primary">Nopalito</Text>
              <Text className="text-caption text-secondary">San Francisco, CA</Text>
            </View>
            <Text className="text-score text-accent">9.4</Text>
          </View>
        </View>

        <View className="items-center gap-4 pt-2">
          <Image source={images.bestListLogo} className="h-14 w-36" contentFit="contain" />
          <Image source={images.bestListMark} className="h-16 w-16" contentFit="contain" />
        </View>
      </View>
    </ScrollView>
  );
}
