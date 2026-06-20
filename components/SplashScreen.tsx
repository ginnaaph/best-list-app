import { Image, View } from "react-native";

import { images } from "@/constants/images";

type SplashScreenProps = {
  onGifLoad: () => void;
};

export function SplashScreen({ onGifLoad }: SplashScreenProps) {
  return (
    <View className="flex-1 items-center justify-center bg-[#F5F0E8]">
      <Image
        source={images.bestListSplash}
        className="h-full w-full"
        onLoadEnd={onGifLoad}
        resizeMode="contain"
      />
    </View>
  );
}
