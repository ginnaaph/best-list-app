import { Link, router } from "expo-router";
import {
  ActionSheetIOS,
  Alert,
  Image,
  type ImageSourcePropType,
  Platform,
  Pressable,
  Share,
  Text,
  View,
  type GestureResponderEvent,
} from "react-native";

import { images } from "@/constants/images";
import { getCategoryShareUrl } from "@/lib/category-sharing";
import { useStore } from "@/store";
import type { Category } from "@/types/category";

type CategoryCardProps = {
  category: Category;
};

const categoryImages: Partial<Record<string, ImageSourcePropType>> = {
  "breakfast-burrito": images.food.breakfastBurrito,
  ramen: images.food.ramen,
  tacos: images.food.tacos,
  pizza: images.food.pizza,
  coffee: images.food.iceCoffee,
  cookies: images.food.cookies,
};

/**
 * Renders a category card for the home grid.
 */
export function CategoryCard({ category }: CategoryCardProps) {
  const deleteCategory = useStore((state) => state.deleteCategory);
  const categoryImage: ImageSourcePropType = category.coverPhoto
    ? { uri: category.coverPhoto }
    : (categoryImages[category.id] ?? images.noImages);
  const entrySummary =
    category.entryCount > 0 ? `#1 - ${category.topEntry}` : "No entries yet";
  const shareLink = getCategoryShareUrl(category.shareId);

  const handleShare = async () => {
    if (!category.isPublic || !shareLink) {
      Alert.alert(
        "Sharing is off",
        "Open this list and turn on sharing before sharing its public link.",
      );
      return;
    }

    try {
      await Share.share({
        message: `My best ${category.name} list on BestList\n${shareLink}`,
      });
    } catch (error: unknown) {
      console.error("Failed to share category:", error);
      Alert.alert("Share failed", "Unable to share this category. Try again.");
    }
  };

  const handleEdit = () => {
    router.push(`/add-category?categoryId=${category.id}`);
  };

  const handleDelete = () => {
    Alert.alert(
      "Delete category?",
      `This will delete "${category.name}" and its entries.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            void deleteCategory(category.id).catch((error: unknown) => {
              console.error("Failed to delete category:", error);
              Alert.alert(
                "Delete failed",
                "Unable to delete this category. Try again.",
              );
            });
          },
        },
      ],
    );
  };

  const showActions = () => {
    if (Platform.OS === "ios") {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ["Share", "Edit", "Delete", "Cancel"],
          cancelButtonIndex: 3,
          destructiveButtonIndex: 2,
        },
        (buttonIndex) => {
          if (buttonIndex === 0) {
            void handleShare();
          }

          if (buttonIndex === 1) {
            handleEdit();
          }

          if (buttonIndex === 2) {
            handleDelete();
          }
        },
      );
      return;
    }

    Alert.alert("Category actions", category.name, [
      {
        text: "Share",
        onPress: () => {
          void handleShare();
        },
      },
      { text: "Edit", onPress: handleEdit },
      { text: "Delete", style: "destructive", onPress: handleDelete },
      { text: "Cancel", style: "cancel" },
    ]);
  };

  const handleMenuPress = (event: GestureResponderEvent) => {
    event.stopPropagation();
    showActions();
  };

  return (
    <Link href={`./category/${category.id}`} asChild>
      <Pressable className="w-[47%] gap-2">
        <View className="h-40 w-full overflow-hidden rounded-bestlist-md">
          <Image
            source={categoryImage}
            resizeMode="cover"
            className="h-full w-full"
          />
          <View className="absolute right-2 top-2 min-w-7 items-center rounded-full bg-white px-2 py-1">
            <Text className="text-label text-primary">
              {category.entryCount}
            </Text>
          </View>
        </View>

        <View className="gap-0.5">
          <View className="flex-row items-center justify-between gap-1">
            <Text
              className="min-w-0 flex-1 text-card-title text-primary"
              numberOfLines={1}
            >
              {category.name}
            </Text>
            <Pressable
              accessibilityLabel={`Open actions for ${category.name}`}
              accessibilityRole="button"
              className="-mr-1 h-6 w-6 items-center justify-center"
              hitSlop={8}
              onPress={handleMenuPress}
            >
              <Text className="text-[24px] leading-6 text-primary">⋮</Text>
            </Pressable>
          </View>
          <Text className="text-caption text-secondary" numberOfLines={1}>
            {entrySummary}
          </Text>
        </View>
      </Pressable>
    </Link>
  );
}
