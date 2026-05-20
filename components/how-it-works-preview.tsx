import { Text, View } from "react-native";

const dishCards = [
  { color: "bg-category-gold", badge: "12" },
  { color: "bg-[#C8AD9C]" },
  { color: "bg-[#958D86]" },
];

const scoreRows = [
  { label: "Taste", value: "9.5", width: "w-[112px]" },
  { label: "Value", value: "9.0", width: "w-[100px]" },
  { label: "Portion", value: "9.5", width: "w-[112px]" },
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
        <View key={index} className={`h-[59px] w-[59px] overflow-hidden rounded-bestlist-sm ${card.color}`}>
          <View className="absolute inset-0 -rotate-45 opacity-25">
            <View className="h-[130px] w-[12px] translate-x-4 bg-white" />
            <View className="h-[130px] w-[12px] translate-x-9 -translate-y-[130px] bg-white" />
            <View className="h-[130px] w-[12px] translate-x-14 -translate-y-[260px] bg-white" />
          </View>
          {card.badge ? (
            <View className="absolute right-1.5 top-1.5 h-[15px] w-[15px] items-center justify-center rounded-full bg-white">
              <Text className="font-body text-[6px] font-bold leading-[8px] text-accent">{card.badge}</Text>
            </View>
          ) : null}
        </View>
      ))}
    </View>
  );
}

export function ScorePreview() {
  return (
    <View className="w-full rounded-bestlist-sm border border-subtle bg-white px-4 py-3">
      <View className="gap-2">
        {scoreRows.map((row) => (
          <View key={row.label} className="flex-row items-center gap-3">
            <Text className="w-12 font-body text-[8px] font-bold leading-[10px] text-primary">{row.label}</Text>
            <View className="h-px flex-1 bg-[#DAD8D3]">
              <View className={`h-px bg-accent ${row.width}`} />
            </View>
            <Text className="w-6 text-right font-body text-[8px] font-bold leading-[10px] text-accent">
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
    <View className="w-full rounded-bestlist-sm border border-subtle bg-white px-4 py-2.5">
      <View className="gap-1">
        {rankingRows.map((row) => (
          <View key={row.name} className="flex-row items-center">
            <Text className="w-4 font-body text-[8px] font-bold leading-[10px] text-primary">{row.rank}</Text>
            <Text className="flex-1 font-display text-[9px] font-bold leading-[11px] text-primary">{row.name}</Text>
            {row.bar ? <View className="mr-3 h-1.5 w-9 rounded-full bg-accent" /> : null}
            <Text className="w-6 text-right font-body text-[8px] font-bold leading-[10px] text-accent">
              {row.score}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}
