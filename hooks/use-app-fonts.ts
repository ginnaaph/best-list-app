import { Roboto_400Regular, Roboto_700Bold } from "@expo-google-fonts/roboto";
import { RobotoSlab_700Bold } from "@expo-google-fonts/roboto-slab";
import { useFonts } from "expo-font";

export function useAppFonts() {
  const [fontsLoaded] = useFonts({
    Roboto_400Regular,
    Roboto_700Bold,
    RobotoSlab_700Bold,
  });

  return {
    fontsLoaded,
  };
}
