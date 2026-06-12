import { useLocalSearchParams } from "expo-router";
import { ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { categories } from "@/data/categories";
import { entriesByCategory } from "@/data/entries";
import { calculateOverallScore, sortEntries } from "@/lib/entry-score";
import type { Entry } from "@/types/entry";

type ScoreDimension = keyof Pick<Entry, "taste" | "value" | "portion" | "vibe">;

const scoreDimensions: { label: string; key: ScoreDimension }[] = [
  { label: "Taste", key: "taste" },
  { label: "Value", key: "value" },
  { label: "Portion", key: "portion" },
  { label: "Vibe", key: "vibe" },
];

export default function ShareListScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const category = categories.find((item) => item.id === id);
  const entries = category ? entriesByCategory[category.id] ?? [] : [];
  const sortedEntries = sortEntries(entries, "overall");

  if (!category) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: "#F5F0E8" }}>
        <View className="flex-1 px-5 pb-8 pt-10">
          <View className="h-7 w-7 items-center justify-center rounded-full bg-white shadow-card">
            <View className="h-7 w-7 items-center justify-center rounded-full bg-[#2D5016]">
              <Text className="text-label text-white">B</Text>
            </View>
          </View>

          <View className="mt-10 gap-3">
            <Text className="font-display text-[32px] font-bold leading-9 text-[#2D5016]">
              List not found
            </Text>
            <Text className="font-body text-[15px] leading-6 text-secondary">
              This shared BestList is not available.
            </Text>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#F5F0E8" }}>
      <View className="flex-1 px-5 pb-6 pt-5">
        <View className="items-end">
          <View className="h-7 w-7 items-center justify-center rounded-full bg-white shadow-card">
            <View className="h-7 w-7 items-center justify-center rounded-full bg-[#2D5016]">
              <Text className="text-label text-white">B</Text>
            </View>
          </View>
        </View>

        <View className="mt-4 gap-2">
          <Text className="text-center font-display text-[38px] font-bold leading-10 text-[#2D5016]">
            {category.name}
          </Text>
          <Text className="text-center font-mono-bestlist text-[10px] font-bold uppercase leading-3.25 text-secondary">
            Ranked by overall score
          </Text>
        </View>

        <ScrollView
          className="mt-6 flex-1"
          showsVerticalScrollIndicator={false}
        >
          <View className="gap-4 pb-8">
            {sortedEntries.map((entry, index) => (
              <SharedEntryCard key={entry.id} entry={entry} rank={index + 1} />
            ))}

            {sortedEntries.length === 0 ? (
              <View className="rounded-bestlist-xl bg-white px-5 py-6 shadow-card">
                <Text className="text-center text-card-title text-primary">
                  No entries yet
                </Text>
              </View>
            ) : null}

            <Text className="pt-4 text-center font-mono-bestlist text-[10px] font-bold uppercase leading-3.25 text-[#2D5016]">
              Made with BestList
            </Text>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

type SharedEntryCardProps = {
  entry: Entry;
  rank: number;
};

function SharedEntryCard({ entry, rank }: SharedEntryCardProps) {
  const overallScore = calculateOverallScore(entry);

  return (
    <View className="rounded-bestlist-xl bg-white px-5 py-4 shadow-card">
      <View className="flex-row items-start justify-between gap-4">
        <View className="min-w-0 flex-1">
          <Text className="font-mono-bestlist text-[11px] font-bold uppercase leading-5 tracking-[2px] text-secondary">
            #{rank} - {entry.city.toUpperCase()}
          </Text>
          <Text
            className="mt-1 font-display text-[24px] font-bold leading-7.5 text-primary"
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

        <View className="shrink-0 items-center">
          <Text className="font-display text-[42px] font-extrabold leading-13.5 text-[#2D5016]">
            {overallScore.toFixed(1)}
          </Text>
          <Text className="font-mono-bestlist text-[10px] font-bold uppercase leading-3.25 text-secondary">
            Overall
          </Text>
        </View>
      </View>

      <View className="mt-4 flex-row flex-wrap gap-2">
        {scoreDimensions.map((dimension) => (
          <View
            key={dimension.key}
            className="min-w-[74px] flex-1 rounded-bestlist-sm border border-subtle bg-[#F5F0E8] px-3 py-2"
          >
            <Text className="font-mono-bestlist text-[10px] font-bold uppercase leading-3.25 text-secondary">
              {dimension.label}
            </Text>
            <Text className="mt-1 font-body text-[15px] font-bold leading-5 text-primary">
              {entry[dimension.key].toFixed(1)}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}
