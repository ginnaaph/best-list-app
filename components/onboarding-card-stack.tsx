import { Image, Text, View, type ImageSourcePropType } from "react-native";

type CardConfig = {
  image: ImageSourcePropType;
  rotation: string;
  offsetX: number;
  zIndex: number;
};

const cards: CardConfig[] = [
  {
    image: {
      uri: "https://images.unsplash.com/photo-1552332386-f8dd00dc2f85?auto=format&fit=crop&w=320&q=80",
    },
    rotation: "-10deg",
    offsetX: -42,
    zIndex: 1,
  },
  {
    image: {
      uri: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=320&q=80",
    },
    rotation: "0deg",
    offsetX: 0,
    zIndex: 3,
  },
  {
    image: {
      uri: "https://images.unsplash.com/photo-1626700051175-6818013e1d4f?auto=format&fit=crop&w=320&q=80",
    },
    rotation: "11deg",
    offsetX: 42,
    zIndex: 2,
  },
];

/**
 * Renders the stacked food cards shown during onboarding.
 */
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
