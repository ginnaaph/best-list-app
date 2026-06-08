import { Ionicons } from "@expo/vector-icons";
import { Pressable, type PressableProps } from "react-native";

type FloatingAddButtonProps = {
  accessibilityLabel?: string;
  onPress?: PressableProps["onPress"];
};

export function FloatingAddButton({
  accessibilityLabel = "Add category",
  onPress,
}: FloatingAddButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}
      className="absolute bottom-11 right-4 h-14 w-14 items-center justify-center rounded-full bg-accent shadow-card"
    >
      <Ionicons name="add" size={28} color="#FFFFFF" />
    </Pressable>
  );
}
