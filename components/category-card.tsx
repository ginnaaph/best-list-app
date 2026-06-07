import { Link } from "expo-router";
import { Image, Pressable, Text, View } from "react-native";

import { images } from "@/constants/images";
import type { Category } from "@/types/category";

type CategoryCardProps = {
  category: Category;
};

const categoryImages: Record<Category["id"], number> = {
  "breakfast-burrito": images.food.breakfastBurrito,
  ramen: images.food.ramen,
  tacos: images.food.tacos,
  pizza: images.food.pizza,
  coffee: images.food.iceCoffee,
  cookies: images.food.cookies,
};

export function CategoryCard({ category }: CategoryCardProps) {
  return (
    <Link href={`./category/${category.id}`} asChild>
      <Pressable className="w-[47%] gap-2">
        <View className="h-40 w-full overflow-hidden rounded-bestlist-md">
          <Image
            source={categoryImages[category.id]}
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
          <Text className="text-card-title text-primary" numberOfLines={1}>
            {category.name}
          </Text>
          <Text className="text-caption text-secondary" numberOfLines={1}>
            #1 - {category.topEntry}
          </Text>
        </View>
      </Pressable>
    </Link>
  );
}
