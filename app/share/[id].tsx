import { Link, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
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
import FontAwesome from "react-native-vector-icons/FontAwesome";

import { images } from "@/constants/images";
import { getPublicCategoryByShareId, getPublicEntries } from "@/lib/api";
import { getCategoryShareUrl } from "@/lib/category-sharing";
import { calculateOverallScore, sortEntries } from "@/lib/entry-score";
import type { Category } from "@/types/category";
import type { Entry } from "@/types/entry";

type ScoreDimension = keyof Pick<Entry, "taste" | "value" | "portion" | "vibe">;

const scoreDimensions: { label: string; key: ScoreDimension }[] = [
  { label: "TASTE", key: "taste" },
  { label: "VALUE", key: "value" },
  { label: "PORTION", key: "portion" },
  { label: "VIBE", key: "vibe" },
];

function getPublicEntryImageSource(photoUrl?: string) {
  return photoUrl
    ? { uri: photoUrl }
    : images.noImages;
}

type PublicCategoryOwner = Category & {
  displayName?: string;
  username?: string;
  handle?: string;
};

function getOwnerLabel(category: Category) {
  const publicCategory = category as PublicCategoryOwner;
  const displayName =
    publicCategory.displayName ?? publicCategory.username ?? publicCategory.handle;
  const normalizedName = displayName?.replace(/^@/, "").trim();

  return normalizedName || "BestList";
}

function getAvatarInitial(ownerLabel: string) {
  return ownerLabel.charAt(0).toUpperCase();
}

export default function ShareListScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [category, setCategory] = useState<Category | null>(null);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const sortedEntries = sortEntries(entries, "overall");
  const shareUrl = getCategoryShareUrl(id);
  const ownerLabel = category ? getOwnerLabel(category) : "BestList";
  const ownerHandle = `@${ownerLabel.replace(/^@/, "")}`;
  const ownerInitial = getAvatarInitial(ownerLabel);

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
          <View className="h-11 w-11 items-center justify-center rounded-full bg-accent">
            <Text className="font-body text-[18px] font-bold leading-5 text-white">
              B
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
    <SafeAreaView style={{ flex: 1, backgroundColor: "#F5F0E8" }}>
      <View className="flex-1 px-4 pb-8 pt-5">
        <View className="flex-row items-center justify-between">
          <View className="h-16 w-16 items-center justify-center rounded-full bg-accent">
            <Text className="font-body text-[18px] font-bold leading-5 text-white">
              {ownerInitial}
            </Text>
          </View>

          <Pressable
            accessibilityLabel={`Share ${category.name}`}
            accessibilityRole="button"
            className="h-12 w-12 items-center justify-center rounded-full border border-subtle bg-white shadow-card"
            onPress={shareList}
          >
            <FontAwesome name="share" size={18} color="#1A1A1A" />
          </Pressable>
        </View>

        <View className="mt-7 gap-2">
          <Text className="text-center font-display text-[56px] font-bold leading-[62px] text-primary">
            {category.name}
          </Text>
          <Text className="text-center font-mono-bestlist text-[13px] uppercase leading-5 tracking-[5px] text-secondary">
            Ranked by {ownerHandle}
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

            <View className="items-center gap-4 px-3 pt-20">
              <View className="h-px w-14 bg-[#EDEBE6]" />
              <Text className="font-display text-[18px] font-bold leading-6 text-primary">
                Best<Text className="text-accent">List</Text>
              </Text>
              {shareUrl ? (
                <Text
                  className="text-center font-mono-bestlist text-[11px] font-bold uppercase leading-4 tracking-[3px] text-secondary"
                  numberOfLines={1}
                >
                  {shareUrl.replace("https://", "").toUpperCase()}
                </Text>
              ) : null}
              <Link href="/" asChild>
                <Pressable className="mt-2 h-14 w-full items-center justify-center rounded-full bg-accent px-8 shadow-card">
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
  const entryImageSource = getPublicEntryImageSource(entry.photoUrl);

  return (
    <View className="rounded-bestlist-xl border border-subtle bg-white px-5 py-6 shadow-card">
      <View className="gap-4">
        <Text className="font-mono-bestlist text-[12px] uppercase leading-5 tracking-[4px] text-secondary">
          {rankingLabel}
        </Text>

        <View className="flex-row items-center gap-3">
          <Image
            className="h-14 w-14 rounded-lg"
            resizeMode="cover"
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
              className="font-body text-[15px] leading-5 text-secondary"
              numberOfLines={1}
            >
              {entry.city}
            </Text>
          </View>

          <View className="w-20 shrink-0 items-end">
            <Text className="font-display text-[40px] font-extrabold leading-[44px] text-accent">
              {overallScore.toFixed(1)}
            </Text>
            <Text className="font-mono-bestlist text-[10px] uppercase leading-3.25 tracking-[2px] text-secondary">
              OVERALL
            </Text>
          </View>
        </View>

        {entry.notes ? (
          <Text className="font-body text-[16px] leading-6 text-secondary">
            {entry.notes}
          </Text>
        ) : null}

        <View className="flex-row gap-3">
          {scoreDimensions.map((dimension) => (
            <View
              key={dimension.key}
              className="min-w-[64px] flex-1 items-center rounded-bestlist-sm border border-subtle bg-white px-2 py-3"
            >
              <Text className="font-mono-bestlist text-[10px] uppercase leading-3.25 tracking-[2px] text-secondary">
                {dimension.label}
              </Text>
              <Text className="mt-1 font-body text-[18px] font-bold leading-5 text-primary">
                {entry[dimension.key].toFixed(1)}
              </Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}
