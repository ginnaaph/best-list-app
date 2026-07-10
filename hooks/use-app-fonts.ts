import { Roboto_400Regular, Roboto_700Bold } from "@expo-google-fonts/roboto";
import { RobotoSlab_700Bold } from "@expo-google-fonts/roboto-slab";
import { useFonts } from "expo-font";

/**
 * Loads the app font family assets.
 *
 * @returns Whether fonts are ready for rendering.
 */
export function useAppFonts() {
  const [fontsLoaded, fontError] = useFonts({
    Roboto_400Regular,
    Roboto_700Bold,
    RobotoSlab_700Bold,
  });
  return {
    fontsLoaded: fontsLoaded || Boolean(fontError),
  };
}
