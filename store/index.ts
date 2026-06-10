import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Crypto from "expo-crypto";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import { categories as seededCategories } from "@/data/categories";
import { entriesByCategory } from "@/data/entries";
import { calculateOverallScore } from "@/lib/entry-score";
import type { Category, CategoryCardTone } from "@/types/category";
import type { Entry } from "@/types/entry";

const seededEntries = Object.values(entriesByCategory).flat();
const categoryTones: CategoryCardTone[] = [
  "gold",
  "clay",
  "tomato",
  "brick",
  "espresso",
  "caramel",
];

type AddEntryInput = Omit<Entry, "id" | "createdAt" | "overallScore">;

type StoreState = {
  categories: Category[];
  entries: Entry[];
  addCategory: (name: string) => Category;
  addEntry: (entry: AddEntryInput) => Entry;
  ensureCategorySeeded: (categoryId: string) => void;
};

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      categories: seededCategories,
      entries: seededEntries,
      addCategory: (name) => {
        const newCategory: Category = {
          id: Crypto.randomUUID(),
          name: name.trim(),
          topEntry: "No entries yet",
          entryCount: 0,
          tone: categoryTones[get().categories.length % categoryTones.length],
        };

        set((state) => ({ categories: [...state.categories, newCategory] }));

        return newCategory;
      },
      addEntry: (input) => {
        const newEntry: Entry = {
          ...input,
          id: Crypto.randomUUID(),
          createdAt: new Date().toISOString(),
        };
        newEntry.overallScore = calculateOverallScore(newEntry);
        set((state) => ({ entries: [...state.entries, newEntry] }));
        return newEntry;
      },
      ensureCategorySeeded: (categoryId) => {
        set((state) => {
          const hasCategoryEntries = state.entries.some(
            (entry) => entry.categoryId === categoryId,
          );

          if (hasCategoryEntries) {
            return state;
          }

          const categoryEntries = entriesByCategory[categoryId] ?? [];

          return {
            entries: [...state.entries, ...categoryEntries],
          };
        });
      },
    }),
    {
      name: "bestlist-store",
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
