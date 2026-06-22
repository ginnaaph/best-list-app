import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { images } from "@/constants/images";
import {
  getPublicCategoryByShareId,
  getPublicEntries,
} from "@/lib/api";
import { calculateOverallScore, sortEntries } from "@/lib/entry-score";
import type { Category } from "@/types/category";
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
  const [category, setCategory] = useState<Category | null>(null);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const sortedEntries = sortEntries(entries, "overall");

  useEffect(() => {
    let isMounted = true;

    async function fetchSharedList() {
      if (!id) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);

      try {
        const publicCategory = await getPublicCategoryByShareId(id);

        if (!isMounted) {
          return;
        }

        if (!publicCategory) {
          setCategory(null);
          setEntries([]);
          return;
        }

        const publicEntries = await getPublicEntries(publicCategory.id);

        if (!isMounted) {
          return;
        }

        setCategory(publicCategory);
        setEntries(publicEntries);
      } catch (error: unknown) {
        console.error(
          "Failed to load shared list:",
          error instanceof Error ? error.message : String(error),
        );

        if (isMounted) {
          setCategory(null);
          setEntries([]);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void fetchSharedList();

    return () => {
      isMounted = false;
    };
  }, [id]);

  if (isLoading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: "#F5F0E8" }}>
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color="#2D5016" />
        </View>
      </SafeAreaView>
    );
  }

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
                  className="font-display text-[24px] font-bold leading-7.5 text-primary"
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

          <View className="shrink-0 items-center pt-4">
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
    </View>
  );
}
