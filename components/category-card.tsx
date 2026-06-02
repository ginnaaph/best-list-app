import { Link } from "expo-router";
import { Pressable, Text, View } from "react-native";

import type { Category } from "@/types/category";

type CategoryCardProps = {
  category: Category;
};

const toneClassNames: Record<Category["tone"], string> = {
  gold: "bg-category-gold",
  clay: "bg-category-clay",
  tomato: "bg-category-tomato",
  brick: "bg-category-brick",
  espresso: "bg-category-espresso",
  caramel: "bg-category-caramel",
};

export function CategoryCard({ category }: CategoryCardProps) {
  return (
    <Link href={`./category/${category.id}`} asChild>
      <Pressable className="w-[47%] gap-2">
        <View
          className={`h-40 w-full rounded-bestlist-md ${toneClassNames[category.tone]}`}
        >
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
