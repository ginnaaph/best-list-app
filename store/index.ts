import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Crypto from "expo-crypto";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import {
  deleteEntry as deleteSupabaseEntry,
  getCategories,
  getEntries,
  insertCategory,
  insertEntry,
  updateEntry as updateSupabaseEntry,
} from "@/lib/api";
import { sortEntries } from "@/lib/entry-score";
import type { Category, CategoryCardTone } from "@/types/category";
import type { Entry } from "@/types/entry";

const categoryTones: CategoryCardTone[] = [
  "gold",
  "clay",
  "tomato",
  "brick",
  "espresso",
  "caramel",
];

const storeStorageKey = "bestlist-store";

type AddEntryInput = Omit<Entry, "id" | "createdAt" | "overallScore">;
type UpdateEntryInput = Omit<
  Entry,
  "id" | "categoryId" | "createdAt" | "overallScore"
>;

type StoreState = {
  categories: Category[];
  entries: Entry[];
  isLoading: boolean;
  syncFromSupabase: () => Promise<void>;
  clearStore: () => Promise<void>;
  addCategory: (name: string) => Category;
  addEntry: (entry: AddEntryInput) => Entry;
  updateEntry: (entryId: string, entry: UpdateEntryInput) => Entry | undefined;
  deleteEntry: (entryId: string) => Entry | undefined;
  ensureCategorySeeded: (categoryId: string) => void;
};

function updateCategorySummaries(categories: Category[], entries: Entry[]) {
  return categories.map((category) => {
    const categoryEntries = entries.filter(
      (entry) => entry.categoryId === category.id,
    );
    const topEntry = sortEntries(categoryEntries, "overall")[0];

    return {
      ...category,
      entryCount: categoryEntries.length,
      topEntry: topEntry?.placeName ?? "No entries yet",
      coverPhoto: topEntry?.photoUrl ?? category.coverPhoto,
    };
  });
}

function updateCategorySummaryById(
  categories: Category[],
  entries: Entry[],
  categoryId: string,
) {
  return categories.map((category) => {
    if (category.id !== categoryId) {
      return category;
    }

    const categoryEntries = entries.filter(
      (entry) => entry.categoryId === category.id,
    );
    const topEntry = sortEntries(categoryEntries, "overall")[0];

    return {
      ...category,
      entryCount: categoryEntries.length,
      topEntry: topEntry?.placeName ?? "No entries yet",
      coverPhoto: topEntry?.photoUrl ?? category.coverPhoto,
    };
  });
}

function reportMutationError(action: string, error: unknown) {
  console.error(`Failed to ${action}:`, error);
}

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      categories: [],
      entries: [],
      isLoading: false,
      syncFromSupabase: async () => {
        set({ isLoading: true });

        try {
          const [categories, entries] = await Promise.all([
            getCategories(),
            getEntries(),
          ]);

          set({
            categories: updateCategorySummaries(categories, entries),
            entries,
          });
        } finally {
          set({ isLoading: false });
        }
      },
      clearStore: async () => {
        set({ categories: [], entries: [], isLoading: false });
        await AsyncStorage.removeItem(storeStorageKey);
      },
      addCategory: (name) => {
        const newCategory: Category = {
          id: Crypto.randomUUID(),
          name: name.trim(),
          topEntry: "No entries yet",
          entryCount: 0,
          tone: categoryTones[get().categories.length % categoryTones.length],
        };

        void insertCategory(newCategory)
          .then((savedCategory) => {
            set((state) => ({
              categories: updateCategorySummaries(
                [...state.categories, savedCategory],
                state.entries,
              ),
            }));
          })
          .catch((error: unknown) => reportMutationError("add category", error));

        return newCategory;
      },
      addEntry: (input) => {
        const pendingEntry: Entry = {
          ...input,
          id: Crypto.randomUUID(),
          createdAt: new Date().toISOString(),
        };

        void insertEntry(pendingEntry)
          .then((newEntry) => {
            set((state) => {
              const entries = [...state.entries, newEntry];
              const categories = updateCategorySummaryById(
                state.categories,
                entries,
                newEntry.categoryId,
              );

              return { categories, entries };
            });
          })
          .catch((error: unknown) => reportMutationError("add entry", error));

        return pendingEntry;
      },
      updateEntry: (entryId, input) => {
        const currentEntry = get().entries.find((entry) => entry.id === entryId);

        if (!currentEntry) {
          return undefined;
        }

        const pendingEntry: Entry = {
          ...currentEntry,
          ...input,
        };

        void updateSupabaseEntry(entryId, input)
          .then((updatedEntry) => {
            set((state) => {
              const entries = state.entries.map((entry) =>
                entry.id === entryId ? updatedEntry : entry,
              );
              const categories = updateCategorySummaryById(
                state.categories,
                entries,
                updatedEntry.categoryId,
              );

              return { categories, entries };
            });
          })
          .catch((error: unknown) =>
            reportMutationError("update entry", error),
          );

        return pendingEntry;
      },
      deleteEntry: (entryId) => {
        const currentEntry = get().entries.find((entry) => entry.id === entryId);

        if (!currentEntry) {
          return undefined;
        }

        void deleteSupabaseEntry(entryId)
          .then((deletedEntry) => {
            set((state) => {
              const entries = state.entries.filter(
                (entry) => entry.id !== entryId,
              );
              const categories = updateCategorySummaryById(
                state.categories,
                entries,
                deletedEntry.categoryId,
              );

              return { categories, entries };
            });
          })
          .catch((error: unknown) =>
            reportMutationError("delete entry", error),
          );

        return currentEntry;
      },
      ensureCategorySeeded: () => {},
    }),
    {
      name: storeStorageKey,
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        categories: state.categories,
        entries: state.entries,
      }),
    },
  ),
);
