import { Image, Text, View } from "react-native";

import { images } from "@/constants/images";
import { calculateOverallScore } from "@/lib/entry-score";
import type { Entry } from "@/types/entry";

type EntryCardProps = {
  entry: Entry;
  rank: number;
};

export function EntryCard({ entry, rank }: EntryCardProps) {
  const overallScore = calculateOverallScore(entry);
  const rankingLabel = `#${rank} - ${entry.city.toUpperCase()}`;
  const entryImageSource = entry.photoUrl
    ? { uri: entry.photoUrl }
    : images.noImages;

  return (
    <View className="rounded-bestlist-xl bg-white px-5 py-4 shadow-card">
      <View className="gap-3.5">
        <View className="flex-row items-start justify-between gap-3">
          <View className="flex-1 pr-2">
            <Text className="font-mono-bestlist text-[11px] font-bold uppercase leading-5 mb-1.5 tracking-[2px] text-secondary">
              {rankingLabel}
            </Text>
            <View className="mt-1 flex-row items-center gap-3">
              <Image
                className="h-16 w-16 rounded-lg"
                source={entryImageSource}
              />
              <View className="min-w-0 flex-1 gap-1">
                <Text
                  className="font-display text-[24px] font-bold leading-6 text-primary"
                  numberOfLines={1}
                >
                  {entry.placeName}
                </Text>
                <Text
                  className="mt-.75 font-body text-[12px] leading-5 text-secondary"
                  numberOfLines={1}
                >
                  {entry.city}
                </Text>
              </View>
            </View>
          </View>

          <View className="shrink-0 items-center pt-4 pb-4">
            <Text className="font-display mt-1.5 text-[42px] font-extrabold leading-13.5 text-accent">
              {overallScore.toFixed(1)}
            </Text>
          </View>
        </View>

        {entry.notes ? (
          <Text className="font-body text-[14px] leading-6 text-primary">
            {entry.notes}
          </Text>
        ) : null}
      </View>
    </View>
  );
}
