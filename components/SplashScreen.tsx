import { Image, View } from "react-native";

import { images } from "@/constants/images";

type SplashScreenProps = {
  onGifLoad: () => void;
};

/**
 * Renders the animated app splash screen.
 */
export function SplashScreen({ onGifLoad }: SplashScreenProps) {
  return (
    <View className="flex-1 items-center justify-center">
      <Image
        source={images.bestListSplash}
        className="h-full w-full"
        onLoadEnd={onGifLoad}
        resizeMode="contain"
      />
    </View>
  );
}
