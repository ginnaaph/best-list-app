import { Text, View } from "react-native";

type CardConfig = {
  className: string;
  rotation: string;
  offsetX: number;
  zIndex: number;
};

const cards: CardConfig[] = [
  {
    className: "bg-category-tomato",
    rotation: "-10deg",
    offsetX: -42,
    zIndex: 1,
  },
  {
    className: "bg-category-clay",
    rotation: "0deg",
    offsetX: 0,
    zIndex: 3,
  },
  {
    className: "bg-category-gold",
    rotation: "11deg",
    offsetX: 42,
    zIndex: 2,
  },
];

export function OnboardingCardStack() {
  return (
    <View className="h-28 w-44 items-center justify-center">
      {cards.map((card, index) => (
        <View
          key={card.rotation}
          className={`absolute h-24 w-20 rounded-bestlist-sm border-2 border-white shadow-card ${card.className}`}
          style={{
            transform: [{ translateX: card.offsetX }, { rotate: card.rotation }],
            zIndex: card.zIndex,
          }}
        >
          {index === 1 ? (
            <View className="absolute left-2 top-2 h-4 w-4 items-center justify-center rounded-full bg-accent">
              <Text className="text-[8px] font-bold leading-[10px] text-white">1</Text>
            </View>
          ) : null}
        </View>
      ))}
    </View>
  );
}
