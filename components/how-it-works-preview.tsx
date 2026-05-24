import { Text, View } from "react-native";

const dishCards = [
  { color: "bg-category-gold", badge: "12" },
  { color: "bg-[#C8AD9C]" },
  { color: "bg-[#958D86]" },
];

const scoreRows = [
  { label: "Taste", value: "9.5", width: "w-[162px]" },
  { label: "Value", value: "9.0", width: "w-[146px]" },
  { label: "Portion", value: "9.5", width: "w-[162px]" },
];

const rankingRows = [
  { rank: "1", name: "Nopalito", score: "9.4" },
  { rank: "2", name: "La Taqueria", score: "9.2", bar: true },
  { rank: "3", name: "Cancun", score: "8.9" },
];

export function DishCardPreview() {
  return (
    <View className="flex-row gap-2 pt-1">
      {dishCards.map((card, index) => (
        <View key={index} className={`h-[88px] w-[88px] overflow-hidden rounded-bestlist-sm ${card.color}`}>
          <View className="absolute inset-0 -rotate-45 opacity-25">
            <View className="h-[190px] w-[18px] translate-x-5 bg-white" />
            <View className="h-[190px] w-[18px] translate-x-12 -translate-y-[190px] bg-white" />
            <View className="h-[190px] w-[18px] translate-x-20 -translate-y-[380px] bg-white" />
          </View>
          {card.badge ? (
            <View className="absolute right-2 top-2 h-[24px] w-[24px] items-center justify-center rounded-full bg-white">
              <Text className="font-body text-[10px] font-bold leading-[12px] text-accent">{card.badge}</Text>
            </View>
          ) : null}
        </View>
      ))}
    </View>
  );
}

export function ScorePreview() {
  return (
    <View className="w-full rounded-bestlist-sm border border-subtle bg-white px-5 py-5">
      <View className="gap-4">
        {scoreRows.map((row) => (
          <View key={row.label} className="flex-row items-center gap-4">
            <Text className="w-16 font-body text-[14px] font-bold leading-[17px] text-primary">{row.label}</Text>
            <View className="h-1 flex-1 rounded-full bg-[#DAD8D3]">
              <View className={`h-1 rounded-full bg-accent ${row.width}`} />
            </View>
            <Text className="w-9 text-right font-body text-[14px] font-bold leading-[17px] text-accent">
              {row.value}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

export function RankingPreview() {
  return (
    <View className="w-full rounded-bestlist-sm border border-subtle bg-white px-5 py-4">
      <View className="gap-2">
        {rankingRows.map((row) => (
          <View key={row.name} className="flex-row items-center">
            <Text className="w-6 font-body text-[14px] font-bold leading-[17px] text-primary">{row.rank}</Text>
            <Text className="flex-1 font-display text-[16px] font-bold leading-[19px] text-primary">{row.name}</Text>
            {row.bar ? <View className="mr-4 h-2.5 w-16 rounded-full bg-accent" /> : null}
            <Text className="w-9 text-right font-body text-[14px] font-bold leading-[17px] text-accent">
              {row.score}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}
