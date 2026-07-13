import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  Share,
  Text,
  TextInput,
  View,
  type ImageSourcePropType,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { images } from "@/constants/images";
import {
  getPublicCategoryByShareId,
  getPublicCategoryOwnerUsername,
  getPublicEntries,
  joinWaitlist,
} from "@/lib/api";
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

const sharedListLogoSource: ImageSourcePropType = { uri: "/favicon.ico" };
const sharedListLogoFallbackSource: ImageSourcePropType = {
  uri: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Crect width='64' height='64' rx='32' fill='%232D6A4F'/%3E%3Ctext x='32' y='39' text-anchor='middle' font-family='Arial,sans-serif' font-size='18' font-weight='700' fill='white'%3EBL%3C/text%3E%3C/svg%3E",
};

export default function ShareListScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [category, setCategory] = useState<Category | null>(null);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [ownerUsername, setOwnerUsername] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const sortedEntries = sortEntries(entries, "overall");
  const shareUrl = getCategoryShareUrl(id);
  const normalizedOwnerUsername =
    ownerUsername?.replace(/^@+/, "").trim() || null;
  const ownerHandle = normalizedOwnerUsername
    ? `@${normalizedOwnerUsername}`
    : null;

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
        const [publicCategory, publicOwnerUsername] = await Promise.all([
          getPublicCategoryByShareId(id),
          getPublicCategoryOwnerUsername(id).catch((error: unknown) => {
            console.error(
              "Failed to load shared list owner:",
              error instanceof Error ? error.message : String(error),
            );
            return null;
          }),
        ]);

        if (!isMounted) {
          return;
        }

        if (!publicCategory) {
          setCategory(null);
          setEntries([]);
          setOwnerUsername(null);
          return;
        }

        const publicEntries = await getPublicEntries(publicCategory.id);

        if (!isMounted) {
          return;
        }

        setCategory(publicCategory);
        setEntries(publicEntries);
        setOwnerUsername(publicOwnerUsername);
      } catch (error: unknown) {
        console.error(
          "Failed to load shared list:",
          error instanceof Error ? error.message : String(error),
        );

        if (isMounted) {
          setCategory(null);
          setEntries([]);
          setOwnerUsername(null);
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
          <View className="h-11 w-11 overflow-hidden rounded-full bg-accent">
            <SharedListLogo />
          </View>

          <View className="mt-12 gap-3">
            {/* leading-10 compiles to two conflicting rules on web export; see 2026-07-13 debugging session; leading-[40px] avoids it. */}
            <Text className="text-center font-display text-[38px] font-bold leading-[40px] text-primary">
              List not found
            </Text>
            <Text className="text-center font-body text-[15px] leading-6 text-secondary">
              This shared BestList is not available.
            </Text>

            <WaitlistCapture
              buttonClassName="mt-4 h-12 items-center justify-center rounded-full bg-accent px-6 shadow-card"
              labelClassName="font-body text-[16px] font-bold text-white"
            />
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#f8f8f7" }}>
      <View className="flex-1 px-5 pb-5 pt-4">
        <View className="flex-row items-center justify-between">
          <View className="items-center gap-1">
            <View className="h-9 w-9 overflow-hidden rounded-full bg-white shadow-card">
              <SharedListLogo />
            </View>

            {ownerHandle ? (
              <Text className="font-mono-bestlist text-[10px] font-bold leading-4 text-secondary">
                {ownerHandle}
              </Text>
            ) : null}
          </View>

          <Pressable
            accessibilityLabel={`Share ${category.name}`}
            accessibilityRole="button"
            className="h-9 w-9 items-center justify-center rounded-full bg-white shadow-card"
            onPress={shareList}
          >
            <Ionicons name="share-outline" size={18} color="#000000" />
          </Pressable>
        </View>

        <View className="gap-2">
          {/* leading-10 compiles to two conflicting rules on web export; see 2026-07-13 debugging session; leading-[40px] avoids it. */}
          <Text className="text-center font-display text-[38px] font-bold leading-[40px] text-primary">
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
          <View className="gap-4 pb-20">
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

            <View className="items-center gap-4 pt-20">
              <View className="h-px w-14 bg-secondary" />
              <Text className="text-card-title text-primary">
                Best<Text className="text-accent">List</Text>
              </Text>
              <WaitlistCapture
                buttonClassName="h-11 items-center justify-center rounded-full bg-accent px-6 shadow-card"
                labelClassName="text-label uppercase text-white"
              />
            </View>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

function SharedListLogo() {
  const [hasImageError, setHasImageError] = useState(false);
  const logoSource = hasImageError
    ? sharedListLogoFallbackSource
    : sharedListLogoSource;

  return (
    <Image
      className="h-full w-full"
      onError={() => setHasImageError(true)}
      resizeMode="cover"
      source={logoSource}
    />
  );
}

type WaitlistCaptureProps = {
  buttonClassName: string;
  labelClassName: string;
};

type WaitlistState = "idle" | "form" | "joined" | "already_joined";

function WaitlistCapture({
  buttonClassName,
  labelClassName,
}: WaitlistCaptureProps) {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<WaitlistState>("idle");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function submitWaitlist() {
    const normalizedEmail = email.trim().toLowerCase();
    const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail);

    if (!isValidEmail) {
      setErrorMessage("Enter a valid email address.");
      return;
    }

    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      const result = await joinWaitlist(email);
      setState(result);
    } catch (error: unknown) {
      console.error(
        "Failed to join waitlist:",
        error instanceof Error ? error.message : String(error),
      );
      setErrorMessage("We couldn't save your email. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (state === "joined") {
    return (
      <Text className="max-w-sm text-center font-body text-[14px] leading-5 text-accent">
        {"You're on the list — we'll email you when BestList is live."}
      </Text>
    );
  }

  if (state === "already_joined") {
    return (
      <Text className="max-w-sm text-center font-body text-[14px] leading-5 text-accent">
        {"You're already on the list — we'll email you when BestList is live."}
      </Text>
    );
  }

  if (state === "idle") {
    return (
      <Pressable
        accessibilityRole="button"
        className={buttonClassName}
        onPress={() => setState("form")}
      >
        <Text className={labelClassName}>Join the App Store waitlist</Text>
      </Pressable>
    );
  }

  return (
    <View className="w-full max-w-sm gap-2">
      <TextInput
        autoCapitalize="none"
        autoComplete="email"
        className="h-12 rounded-full border border-subtle bg-white px-5 font-body text-[16px] text-primary"
        editable={!isSubmitting}
        inputMode="email"
        keyboardType="email-address"
        onChangeText={setEmail}
        onSubmitEditing={() => void submitWaitlist()}
        placeholder="you@example.com"
        placeholderTextColor="#78716C"
        returnKeyType="done"
        textContentType="emailAddress"
        value={email}
      />
      {errorMessage ? (
        <Text className="text-center font-body text-[13px] leading-5 text-red-700">
          {errorMessage}
        </Text>
      ) : null}
      <Pressable
        accessibilityRole="button"
        className="h-11 items-center justify-center rounded-full bg-accent px-6 shadow-card disabled:opacity-60"
        disabled={isSubmitting}
        onPress={() => void submitWaitlist()}
      >
        <Text className="text-label uppercase text-white">
          {isSubmitting ? "Joining…" : "Join waitlist"}
        </Text>
      </Pressable>
    </View>
  );
}

type SharedEntryCardProps = {
  entry: Entry;
  rank: number;
};

function SharedEntryCard({ entry, rank }: SharedEntryCardProps) {
  const overallScore = calculateOverallScore(entry);
  const rankingLabel = `#${rank} - ${entry.city.toUpperCase()}`;
  const [hasImageError, setHasImageError] = useState(false);
  const entryImageSource =
    entry.photoUrl && !hasImageError
      ? { uri: entry.photoUrl }
      : images.noImages;

  return (
    <View className="rounded-bestlist-xl bg-white px-4.5 py-4 shadow-card">
      <View className="gap-2">
        <View className="flex-row items-start justify-between gap-3">
          <View className="flex-1 pr-1">
            <Text className="font-mono-bestlist text-[11px] font-medium uppercase leading-5 mb-1.5 mt-2 tracking-[2px] text-accent">
              {rankingLabel}
            </Text>
            <View className="mt-1 flex-row items-center gap-1.5">
              <View className="h-17 w-17 shrink-0 overflow-hidden rounded-lg bg-subtle">
                <Image
                  className="h-full w-full"
                  onError={() => setHasImageError(true)}
                  resizeMode="cover"
                  source={entryImageSource}
                />
              </View>
              <View className="min-w-0 flex-1 gap-1">
                <Text
                  className="font-display text-[18px] font-medium leading-6 text-primary"
                  numberOfLines={2}
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

          <View className="w-20 shrink-0 items-center pt-3">
            <Text className="font-display mt-2 text-[29px] font-extrabold leading-13.5 text-accent">
              {overallScore.toFixed(1)}
            </Text>
          </View>
        </View>

        <View className="flex-row gap-3">
          {scoreDimensions.map((dimension) => (
            <View
              key={dimension.key}
              className="min-w-16px flex-1 items-center rounded-bestlist-sm  bg-white px-2 py-3"
            >
              <Text className="font-mono-bestlist text-[10px] uppercase leading-3.25 tracking-[2px] text-secondary">
                {dimension.label}
              </Text>
              <Text className="mt-1 font-body text-[20px] font-bold leading-5 text-accent">
                {entry[dimension.key].toFixed(1)}
              </Text>
            </View>
          ))}
        </View>
        {entry.notes ? (
          <Text className="font-body text-[12px] leading-4 ml-3 text-primary">
            {entry.notes}
          </Text>
        ) : null}
      </View>
    </View>
  );
}
