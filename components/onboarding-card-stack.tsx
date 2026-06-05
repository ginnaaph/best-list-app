import { Image, Text, View } from "react-native";

import { images } from "@/constants/images";

type CardConfig = {
  image: number;
  rotation: string;
  offsetX: number;
  zIndex: number;
};

const cards: CardConfig[] = [
  {
    image: images.food.tacos,
    rotation: "-10deg",
    offsetX: -42,
    zIndex: 1,
  },
  {
    image: images.food.ramen,
    rotation: "0deg",
    offsetX: 0,
    zIndex: 3,
  },
  {
    image: images.food.breakfastBurrito,
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
          className="absolute h-24 w-20 overflow-hidden rounded-bestlist-sm border-2 border-white shadow-card"
          style={{
            transform: [
              { translateX: card.offsetX },
              { rotate: card.rotation },
            ],
            zIndex: card.zIndex,
          }}
        >
          <Image
            source={card.image}
            resizeMode="cover"
            className="h-full w-full"
          />
          {index === 1 ? (
            <View className="absolute left-2 top-2 h-4 w-4 items-center justify-center rounded-full bg-accent">
              <Text className="text-[8px] font-bold leading-2.5 text-white">
                1
              </Text>
            </View>
          ) : null}
        </View>
      ))}
    </View>
  );
}
