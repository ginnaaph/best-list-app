import { Image } from "expo-image";
import { Text, View } from "react-native";

import { calculateOverallScore } from "@/lib/entry-score";
import type { Entry } from "@/types/entry";

type EntryCardProps = {
  entry: Entry;
  rank: number;
};

export function EntryCard({ entry, rank }: EntryCardProps) {
  const overallScore = calculateOverallScore(entry);

  return (
    <View className="overflow-hidden rounded-bestlist-lg border border-subtle bg-white shadow-card">
      {entry.photoUrl ? (
        <Image
          source={{ uri: entry.photoUrl }}
          contentFit="cover"
          className="h-38 w-full bg-category-gold"
        />
      ) : null}

      <View className="gap-4 px-4 py-4">
        <View className="flex-row items-start justify-between gap-3">
          <View className="flex-1 gap-1">
            <Text className="text-label uppercase text-secondary">
              #{rank} - {entry.city}
            </Text>
            <Text className="text-card-title text-primary" numberOfLines={1}>
              {entry.placeName}
            </Text>
            <Text className="text-caption text-secondary" numberOfLines={1}>
              {entry.dishName}
            </Text>
          </View>

          <View className="min-w-14 items-center rounded-bestlist-md bg-accent px-3 py-2">
            <Text className="text-label uppercase text-white">Score</Text>
            <Text className="font-body text-[22px] font-bold leading-6 text-white">
              {overallScore.toFixed(1)}
            </Text>
          </View>
        </View>

        {entry.notes ? (
          <Text className="text-caption text-primary" numberOfLines={2}>
            {entry.notes}
          </Text>
        ) : null}

        <View className="flex-row justify-between rounded-bestlist-md bg-app px-3 py-3">
          <ScorePill label="Taste" value={entry.taste} />
          <ScorePill label="Value" value={entry.value} />
          <ScorePill label="Portion" value={entry.portion} />
          <ScorePill label="Vibe" value={entry.vibe} />
        </View>
      </View>
    </View>
  );
}

type ScorePillProps = {
  label: string;
  value: number;
};

function ScorePill({ label, value }: ScorePillProps) {
  return (
    <View className="items-center gap-1">
      <Text className="text-label uppercase text-secondary">{label}</Text>
      <Text className="text-score text-primary">{value.toFixed(1)}</Text>
    </View>
  );
}
