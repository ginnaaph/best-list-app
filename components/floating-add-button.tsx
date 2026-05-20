import { Ionicons } from "@expo/vector-icons";
import { Pressable } from "react-native";

export function FloatingAddButton() {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Add category"
      className="absolute bottom-11 right-4 h-14 w-14 items-center justify-center rounded-full bg-accent shadow-card"
    >
      <Ionicons name="add" size={28} color="#FFFFFF" />
    </Pressable>
  );
}
