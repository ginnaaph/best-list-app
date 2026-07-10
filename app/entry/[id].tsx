import { router, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Image, Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { CurrentUserAvatar } from "@/components/current-user-avatar";
import { images } from "@/constants/images";
import { colors } from "@/constants/theme";
import { calculateOverallScore } from "@/lib/entry-score";
import { useStore } from "@/store";
import type { Entry } from "@/types/entry";

type ScoreKey = keyof Pick<Entry, "taste" | "value" | "portion" | "vibe">;

const scoreRows: { label: string; key: ScoreKey }[] = [
  { label: "Taste", key: "taste" },
  { label: "Value", key: "value" },
  { label: "Portion", key: "portion" },
  { label: "Vibe", key: "vibe" },
];

function formatLoggedDate(date: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date));
}

function EntryNotFoundScreen() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.surface }}>
      <View className="flex-1 px-5 pb-5 pt-4">
        <View className="flex-row items-center justify-between">
          <Pressable
            accessibilityLabel="Go back"
            className="h-9 w-9 items-center justify-center rounded-full bg-white shadow-card"
            onPress={() =>
              router.canGoBack() ? router.back() : router.replace("/")
            }
          >
            <Ionicons name="chevron-back" size={22} color="#000000" />
          </Pressable>

          <Pressable
            accessibilityLabel="Open profile"
            accessibilityRole="button"
            className="h-9 w-9 items-center justify-center rounded-full bg-white shadow-card"
            onPress={() => router.push("/profile")}
          >
            <CurrentUserAvatar />
          </Pressable>
        </View>

        <View className="mt-6 gap-3">
          <Text className="text-screen-title text-primary">
            Entry not found
          </Text>
          <Text className="text-body text-secondary">
            This entry does not exist yet.
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

export default function EntryDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const entries = useStore((state) => state.entries);
  const entry = entries.find((item) => item.id === id);

  if (!entry) {
    return <EntryNotFoundScreen />;
  }

  const overallScore = calculateOverallScore(entry);
  const entryImageSource = entry.photoUrl
    ? { uri: entry.photoUrl }
    : images.noImages;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.surface }}>
      <View className="flex-1 px-5 pb-5 pt-4">
        <View className="flex-row items-center justify-between">
          <Pressable
            accessibilityLabel="Go back"
            className="h-9 w-9 items-center justify-center rounded-full bg-white shadow-card"
            onPress={() =>
              router.canGoBack() ? router.back() : router.replace("/")
            }
          >
            <Ionicons name="chevron-back" size={22} color="#000000" />
          </Pressable>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Edit entry"
            className="h-9 w-9 items-center justify-center rounded-full bg-white shadow-card"
            onPress={() => router.push(`/entry/${entry.id}/edit`)}
          >
            <Ionicons name="create-outline" size={20} color="#000000" />
          </Pressable>
        </View>

        <ScrollView
          className="mt-5 flex-1"
          showsVerticalScrollIndicator={false}
        >
          <View className="gap-6 pb-8">
            <Image
              className="aspect-square w-full rounded-bestlist-xl bg-white"
              source={entryImageSource}
            />

            <View className="flex-row items-start justify-between gap-4">
              <View className="min-w-0 flex-1 gap-2 pt-2">
                <Text className="font-display text-[29px] font-bold leading-6 text-primary">
                  {entry.placeName}
                </Text>
                <Text className="font-mono-bestlist text-[10px] font-bold uppercase leading-3.25 tracking-[1.5px] text-secondary">
                  {entry.city}
                </Text>
                <Text className="font-mono-bestlist text-[10px] font-bold uppercase leading-3.25 tracking-[1.5px] text-secondary">
                  Logged {formatLoggedDate(entry.createdAt)}
                </Text>
              </View>

              <View className="shrink-0 items-center ">
                <Text className="font-mono-bestlist text-[10px] font-bold pt-3 uppercase leading-1 tracking-[1.5px] text-secondary">
                  Overall
                </Text>
                <Text className="font-display text-[52px] font-extrabold leading-7 text-accent">
                  {overallScore.toFixed(1)}
                </Text>
              </View>
            </View>

            <View className="gap-4 rounded-bestlist-xl bg-white p-4 shadow-card">
              {scoreRows.map((score) => {
                const value = entry[score.key];

                return (
                  <View key={score.key} className="gap-2">
                    <View className="flex-row items-center justify-between">
                      <Text className="font-body text-[15px] font-bold text-primary">
                        {score.label}
                      </Text>
                      <Text className="font-display text-[22px] font-bold text-accent">
                        {value.toFixed(1)}
                      </Text>
                    </View>
                    <View className="h-1.5 overflow-hidden rounded-full bg-border">
                      <View
                        className="h-full rounded-full bg-accent"
                        style={{
                          width: `${Math.max(0, Math.min(value, 10)) * 10}%`,
                        }}
                      />
                    </View>
                  </View>
                );
              })}
            </View>

            {entry.notes ? (
              <View className="gap-2">
                <Text className="font-mono-bestlist text-[10px] font-bold uppercase leading-3.25 tracking-[1.5px] text-secondary">
                  Notes
                </Text>
                <Text className="font-body text-[15px] leading-6 text-primary">
                  {entry.notes}
                </Text>
              </View>
            ) : null}
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}
