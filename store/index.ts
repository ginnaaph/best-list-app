import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Crypto from "expo-crypto";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import {
  deleteCategory as deleteSupabaseCategory,
  deleteEntry as deleteSupabaseEntry,
  getCategories,
  getEntries,
  insertCategory,
  insertEntry,
  updateCategory as updateSupabaseCategory,
  updateCategoryVisibility,
  updateEntry as updateSupabaseEntry,
} from "@/lib/api";
import { getNextCategorySharingState } from "@/lib/category-sharing";
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
let syncGeneration = 0;

type AddEntryInput = Omit<Entry, "id" | "createdAt" | "overallScore">;
type UpdateEntryInput = Omit<
  Entry,
  "id" | "categoryId" | "createdAt" | "overallScore"
>;
type UpdateCategoryInput = Pick<Category, "name">;

type StoreState = {
  categories: Category[];
  entries: Entry[];
  isLoading: boolean;
  syncFromSupabase: () => Promise<void>;
  clearStore: () => Promise<void>;
  addCategory: (name: string) => Promise<Category>;
  updateCategory: (
    categoryId: string,
    category: UpdateCategoryInput,
  ) => Promise<Category | undefined>;
  deleteCategory: (categoryId: string) => Promise<Category | undefined>;
  addEntry: (entry: AddEntryInput) => Promise<Entry>;
  setCategoryPublic: (categoryId: string, isPublic: boolean) => Promise<void>;
  updateEntry: (
    entryId: string,
    entry: UpdateEntryInput,
  ) => Promise<Entry | undefined>;
  deleteEntry: (entryId: string) => Promise<Entry | undefined>;
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
        const generation = syncGeneration;
        set({ isLoading: true });

        try {
          const [categories, entries] = await Promise.all([
            getCategories(),
            getEntries(),
          ]);

          if (generation !== syncGeneration) {
            return;
          }

          set({
            categories: updateCategorySummaries(categories, entries),
            entries,
          });
        } finally {
          if (generation === syncGeneration) {
            set({ isLoading: false });
          }
        }
      },
      clearStore: async () => {
        syncGeneration += 1;
        set({ categories: [], entries: [], isLoading: false });
        await AsyncStorage.removeItem(storeStorageKey);
      },
      addCategory: async (name) => {
        const newCategory: Category = {
          id: Crypto.randomUUID(),
          name: name.trim(),
          topEntry: "No entries yet",
          entryCount: 0,
          tone: categoryTones[get().categories.length % categoryTones.length],
          isPublic: false,
        };

        try {
          const savedCategory = await insertCategory(newCategory);

          set((state) => ({
            categories: updateCategorySummaries(
              [...state.categories, savedCategory],
              state.entries,
            ),
          }));

          return savedCategory;
        } catch (error: unknown) {
          reportMutationError("add category", error);
          throw error;
        }
      },
      updateCategory: async (categoryId, input) => {
        const currentCategory = get().categories.find(
          (category) => category.id === categoryId,
        );

        if (!currentCategory) {
          return undefined;
        }

        try {
          const updatedCategory = await updateSupabaseCategory(categoryId, {
            name: input.name.trim(),
          });

          set((state) => {
            const categories = state.categories.map((category) =>
              category.id === categoryId
                ? { ...category, ...updatedCategory }
                : category,
            );

            return {
              categories: updateCategorySummaryById(
                categories,
                state.entries,
                categoryId,
              ),
            };
          });

          return updatedCategory;
        } catch (error: unknown) {
          reportMutationError("update category", error);
          throw error;
        }
      },
      deleteCategory: async (categoryId) => {
        const currentCategory = get().categories.find(
          (category) => category.id === categoryId,
        );

        if (!currentCategory) {
          return undefined;
        }

        try {
          const deletedCategory = await deleteSupabaseCategory(categoryId);

          set((state) => ({
            categories: state.categories.filter(
              (category) => category.id !== categoryId,
            ),
            entries: state.entries.filter(
              (entry) => entry.categoryId !== categoryId,
            ),
          }));

          return deletedCategory;
        } catch (error: unknown) {
          reportMutationError("delete category", error);
          throw error;
        }
      },
      addEntry: async (input) => {
        const pendingEntry: Entry = {
          ...input,
          id: Crypto.randomUUID(),
          createdAt: new Date().toISOString(),
        };

        try {
          const newEntry = await insertEntry(pendingEntry);

          set((state) => {
            const entries = [...state.entries, newEntry];
            const categories = updateCategorySummaryById(
              state.categories,
              entries,
              newEntry.categoryId,
            );

            return { categories, entries };
          });

          return newEntry;
        } catch (error: unknown) {
          reportMutationError("add entry", error);
          throw error;
        }
      },
      setCategoryPublic: async (categoryId, isPublic) => {
        const currentCategory = get().categories.find(
          (category) => category.id === categoryId,
        );

        if (!currentCategory) {
          return;
        }

        const previousSharingState = {
          isPublic: currentCategory.isPublic,
          shareId: currentCategory.shareId,
        };
        const nextSharingState = getNextCategorySharingState(
          currentCategory,
          isPublic,
          Crypto.randomUUID,
        );

        set((state) => ({
          categories: state.categories.map((category) =>
            category.id === categoryId
              ? { ...category, ...nextSharingState }
              : category,
          ),
        }));

        try {
          const savedCategory = await updateCategoryVisibility(
            categoryId,
            isPublic,
            nextSharingState.shareId,
          );

          set((state) => {
            const categories = state.categories.map((category) =>
              category.id === categoryId
                ? { ...category, ...savedCategory }
                : category,
            );

            return {
              categories: updateCategorySummaryById(
                categories,
                state.entries,
                categoryId,
              ),
            };
          });
        } catch (error: unknown) {
          reportMutationError("update category visibility", error);

          set((state) => ({
            categories: state.categories.map((category) =>
              category.id === categoryId
                ? { ...category, ...previousSharingState }
                : category,
            ),
          }));
        }
      },
      updateEntry: async (entryId, input) => {
        const currentEntry = get().entries.find((entry) => entry.id === entryId);

        if (!currentEntry) {
          return undefined;
        }

        try {
          const updatedEntry = await updateSupabaseEntry(entryId, input);

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

          return updatedEntry;
        } catch (error: unknown) {
          reportMutationError("update entry", error);
          throw error;
        }
      },
      deleteEntry: async (entryId) => {
        const currentEntry = get().entries.find((entry) => entry.id === entryId);

        if (!currentEntry) {
          return undefined;
        }

        try {
          const deletedEntry = await deleteSupabaseEntry(entryId);

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

          return deletedEntry;
        } catch (error: unknown) {
          reportMutationError("delete entry", error);
          throw error;
        }
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
