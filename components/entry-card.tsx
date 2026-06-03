import { Text, View } from "react-native";

import { calculateOverallScore } from "@/lib/entry-score";
import type { Entry } from "@/types/entry";

type EntryCardProps = {
  entry: Entry;
  rank: number;
};

export function EntryCard({ entry, rank }: EntryCardProps) {
  const overallScore = calculateOverallScore(entry);
  const rankingLabel = `#${rank} - ${entry.city.toUpperCase()}`;

  return (
    <View className="rounded-bestlist-xl bg-white px-5 py-4 shadow-card">
      <View className="gap-3.5">
        <View className="flex-row items-start justify-between gap-3">
          <View className="flex-1 pr-2">
            <Text className="font-mono-bestlist text-[11px] font-bold uppercase leading-5 tracking-[2px] text-secondary">
              {rankingLabel}
            </Text>
            <Text
              className="font-display mt-1 text-[28px] font-bold leading-7.5 text-primary"
              numberOfLines={1}
            >
              {entry.placeName}
            </Text>
            <Text
              className="mt-.75 font-body text-[16px] leading-5 text-secondary"
              numberOfLines={1}
            >
              {entry.dishName}
            </Text>
          </View>

          <View className="shrink-0 items-center pt-1">
            <Text className="font-display text-[50px] font-extrabold leading-13.5 text-accent">
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
