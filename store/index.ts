import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import { entriesByCategory } from "@/data/entries";
import { calculateOverallScore } from "@/lib/entry-score";
import type { Category } from "@/types/category";
import type { Entry } from "@/types/entry";

const seededEntries = Object.values(entriesByCategory).flat();

type AddEntryInput = Omit<
  Entry,
  "id" | "createdAt" | "overallScore"
>;

type StoreState = {
  entries: Entry[];
  addEntry: (entry: AddEntryInput) => Entry;
  ensureCategorySeeded: (categoryId: Category["id"]) => void;
};

export const useStore = create<StoreState>()(
  persist(
    (set) => ({
      entries: seededEntries,
      addEntry: (input) => {
        const newEntry: Entry = {
          ...input,
          id: Math.random().toString(36).slice(2),
          createdAt: new Date().toISOString(),
        };
        newEntry.overallScore = calculateOverallScore(newEntry);
        set((state) => ({ entries: [...state.entries, newEntry] }));
        return newEntry;
      },
      ensureCategorySeeded: (categoryId) => {
        set((state) => {
          const hasCategoryEntries = state.entries.some(
            (entry) => entry.categoryId === categoryId
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
    }
  )
);
