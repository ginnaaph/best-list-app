declare module "react-native-vector-icons/FontAwesome" {
  import type { ComponentType } from "react";
  import type { TextProps } from "react-native";

  type FontAwesomeName = "edit" | "lock" | "share" | "users";

  type FontAwesomeProps = TextProps & {
    name: FontAwesomeName;
    size?: number;
    color?: string;
  };

  const FontAwesome: ComponentType<FontAwesomeProps>;

  export default FontAwesome;
}
