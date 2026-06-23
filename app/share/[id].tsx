import { Link, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  Share,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { images } from "@/constants/images";
import { getCategoryShareUrl } from "@/lib/category-sharing";
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
  const shareUrl = getCategoryShareUrl(id);

  const shareList = async () => {
    if (!category || !shareUrl) {
      return;
    }

    try {
      await Share.share({
        message: `My best ${category.name} list on BestList\n${shareUrl}`,
      });
    } catch (error: unknown) {
      console.error(
        "Failed to open share sheet:",
        error instanceof Error ? error.message : String(error),
      );
    }
  };

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
      <SafeAreaView style={{ flex: 1, backgroundColor: "#F8F8F7" }}>
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color="#2D6A4F" />
        </View>
      </SafeAreaView>
    );
  }

  if (!category) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: "#F8F8F7" }}>
        <View className="flex-1 px-5 pb-8 pt-10">
          <View className="h-11 w-11 items-center justify-center rounded-full bg-accent">
            <Text className="font-body text-[18px] font-bold leading-5 text-white">
              G
            </Text>
          </View>

          <View className="mt-12 gap-3">
            <Text className="text-center font-display text-[38px] font-bold leading-10 text-primary">
              List not found
            </Text>
            <Text className="text-center font-body text-[15px] leading-6 text-secondary">
              This shared BestList is not available.
            </Text>

            <Link href="/" asChild>
              <Pressable className="mt-4 h-12 items-center justify-center rounded-full bg-accent px-6 shadow-card">
                <Text className="font-body text-[16px] font-bold text-white">
                  Start your own list
                </Text>
              </Pressable>
            </Link>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#F8F8F7" }}>
      <View className="flex-1 px-4 pb-8 pt-5">
        <View className="flex-row items-center justify-between">
          <View className="h-11 w-11 items-center justify-center rounded-full bg-accent">
            <Text className="font-body text-[18px] font-bold leading-5 text-white">
              G
            </Text>
          </View>

          <Pressable
            accessibilityLabel={`Share ${category.name}`}
            accessibilityRole="button"
            className="h-12 w-12 items-center justify-center rounded-full border border-subtle bg-white shadow-card"
            onPress={shareList}
          >
            <FontAwesome name="share" size={19} color="#1A1A1A" />
          </Pressable>
        </View>

        <View className="mt-11 gap-2">
          <Text className="text-center font-display text-[38px] font-bold leading-10 text-primary">
            {category.name}
          </Text>
          <Text className="text-center font-mono-bestlist text-[12px] font-bold uppercase leading-5 tracking-[4px] text-secondary">
            Shared on BestList
          </Text>
        </View>

        <ScrollView
          className="mt-6 flex-1"
          showsVerticalScrollIndicator={false}
        >
          <View className="gap-5 pb-20">
            {sortedEntries.map((entry, index) => (
              <SharedEntryCard key={entry.id} entry={entry} rank={index + 1} />
            ))}

            {sortedEntries.length === 0 ? (
              <View className="rounded-bestlist-xl border border-subtle bg-white px-5 py-6 shadow-card">
                <Text className="text-center text-card-title text-primary">
                  No entries yet
                </Text>
              </View>
            ) : null}

            <View className="items-center gap-4 pt-16">
              <View className="h-px w-14 bg-[#EDEBE6]" />
              <Text className="font-display text-[18px] font-bold leading-6 text-primary">
                Best<Text className="text-accent">List</Text>
              </Text>
              {shareUrl ? (
                <Text
                  className="text-center font-mono-bestlist text-[11px] font-bold uppercase leading-4 tracking-[3px] text-secondary"
                  numberOfLines={1}
                >
                  {shareUrl.replace("https://", "")}
                </Text>
              ) : null}
              <Link href="/" asChild>
                <Pressable className="mt-2 h-14 items-center justify-center rounded-full bg-accent px-10 shadow-card">
                  <Text className="font-body text-[16px] font-bold text-white">
                    Start your own list
                  </Text>
                </Pressable>
              </Link>
            </View>
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
    <View className="rounded-bestlist-xl border border-subtle bg-white px-6 py-5 shadow-card">
      <View className="gap-3.5">
        <View className="flex-row items-start justify-between gap-3">
          <View className="flex-1 pr-2">
            <Text className="mb-1.5 font-mono-bestlist text-[11px] font-bold uppercase leading-5 tracking-[2px] text-secondary">
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
            <Text className="mt-1.5 font-display text-[42px] font-extrabold leading-13.5 text-accent">
              {overallScore.toFixed(1)}
            </Text>
            <Text className="font-mono-bestlist text-[10px] font-bold uppercase leading-3.25 tracking-[2px] text-secondary">
              Overall
            </Text>
          </View>
        </View>

        {entry.notes ? (
          <>
            <View className="h-px bg-[#EDEBE6]" />
            <Text className="font-body text-[14px] leading-6 text-secondary">
              {entry.notes}
            </Text>
          </>
        ) : null}

        <View className="flex-row flex-wrap gap-2">
          {scoreDimensions.map((dimension) => (
            <View
              key={dimension.key}
              className="min-w-[74px] flex-1 items-center rounded-bestlist-sm border border-subtle bg-white px-3 py-2"
            >
              <Text className="font-mono-bestlist text-[10px] font-bold uppercase leading-3.25 tracking-[2px] text-secondary">
                {dimension.label}
              </Text>
              <Text className="mt-1 font-body text-[16px] font-bold leading-5 text-primary">
                {entry[dimension.key].toFixed(1)}
              </Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}
