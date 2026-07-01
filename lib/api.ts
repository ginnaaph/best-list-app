import { resolveEntryPhotoInput } from "@/lib/entry-photo-upload";
import {
  getPublicSupabaseClient,
  getSupabaseClient,
} from "@/lib/supabase";
import type { Category, CategoryCardTone } from "@/types/category";
import type { Entry } from "@/types/entry";

type CategoryRow = {
  id: string;
  name: string;
  cover_photo: string | null;
  tone: string;
  is_shared: boolean;
  share_id: string | null;
  created_at: string;
};

type EntryRow = {
  id: string;
  category_id: string;
  place_name: string;
  city: string;
  notes: string | null;
  photo_url: string | null;
  created_at: string;
  taste: number;
  value: number;
  portion: number;
  vibe: number;
  overall_score: number;
};

type InsertCategoryPayload = {
  id?: string;
  name: string;
  tone: CategoryCardTone;
  coverPhoto?: string;
};

type UpdateCategoryPayload = {
  name: string;
};

type InsertEntryPayload = Omit<Entry, "createdAt" | "overallScore">;

type UpdateEntryPayload = Omit<
  Entry,
  "id" | "categoryId" | "createdAt" | "overallScore"
>;

const categoryColumns =
  "id,name,cover_photo,tone,is_shared,share_id,created_at";
const entryColumns =
  "id,category_id,place_name,city,notes,photo_url,created_at,taste,value,portion,vibe,overall_score";

const validCategoryTones: CategoryCardTone[] = [
  "gold",
  "clay",
  "tomato",
  "brick",
  "espresso",
  "caramel",
];

function toCategoryTone(tone: string): CategoryCardTone {
  if (validCategoryTones.includes(tone as CategoryCardTone)) {
    return tone as CategoryCardTone;
  }

  return "gold";
}

function mapCategory(row: CategoryRow): Category {
  return {
    id: row.id,
    name: row.name,
    topEntry: "No entries yet",
    entryCount: 0,
    coverPhoto: row.cover_photo ?? undefined,
    tone: toCategoryTone(row.tone),
    isPublic: row.is_shared,
    shareId: row.share_id ?? undefined,
  };
}

function mapEntry(row: EntryRow): Entry {
  return {
    id: row.id,
    categoryId: row.category_id,
    placeName: row.place_name,
    city: row.city,
    notes: row.notes ?? undefined,
    photoUrl: row.photo_url ?? undefined,
    createdAt: row.created_at,
    taste: Number(row.taste),
    value: Number(row.value),
    portion: Number(row.portion),
    vibe: Number(row.vibe),
    overallScore: Number(row.overall_score),
  };
}

function toInsertEntryPayload(entry: InsertEntryPayload) {
  return {
    id: entry.id,
    category_id: entry.categoryId,
    place_name: entry.placeName,
    city: entry.city,
    notes: entry.notes ?? null,
    photo_url: entry.photoUrl ?? null,
    taste: entry.taste,
    value: entry.value,
    portion: entry.portion,
    vibe: entry.vibe,
  };
}

function toUpdateEntryPayload(entry: UpdateEntryPayload) {
  return {
    place_name: entry.placeName,
    city: entry.city,
    notes: entry.notes ?? null,
    photo_url: entry.photoUrl ?? null,
    taste: entry.taste,
    value: entry.value,
    portion: entry.portion,
    vibe: entry.vibe,
  };
}

export async function getCategories(): Promise<Category[]> {
  const { data, error } = await getSupabaseClient()
    .from("categories")
    .select(categoryColumns)
    .order("created_at", { ascending: true })
    .returns<CategoryRow[]>();

  if (error) {
    throw error;
  }

  return data.map(mapCategory);
}

export async function getEntries(): Promise<Entry[]> {
  const { data, error } = await getSupabaseClient()
    .from("entries")
    .select(entryColumns)
    .order("created_at", { ascending: true })
    .returns<EntryRow[]>();

  if (error) {
    throw error;
  }

  return data.map(mapEntry);
}

export async function insertCategory(
  category: InsertCategoryPayload,
): Promise<Category> {
  const { data, error } = await getSupabaseClient()
    .from("categories")
    .insert({
      id: category.id,
      name: category.name,
      tone: category.tone,
      cover_photo: category.coverPhoto ?? null,
      is_shared: false,
      share_id: null,
    })
    .select(categoryColumns)
    .single()
    .returns<CategoryRow>();

  if (error) {
    throw error;
  }

  return mapCategory(data);
}

export async function updateCategoryVisibility(
  categoryId: string,
  isPublic: boolean,
  shareId?: string,
): Promise<Category> {
  const update: { is_shared: boolean; share_id?: string } = {
    is_shared: isPublic,
  };

  if (shareId) {
    update.share_id = shareId;
  }

  const { data, error } = await getSupabaseClient()
    .from("categories")
    .update(update)
    .eq("id", categoryId)
    .select(categoryColumns)
    .single()
    .returns<CategoryRow>();

  if (error) {
    throw error;
  }

  return mapCategory(data);
}

export async function updateCategory(
  categoryId: string,
  category: UpdateCategoryPayload,
): Promise<Category> {
  const { data, error } = await getSupabaseClient()
    .from("categories")
    .update({ name: category.name })
    .eq("id", categoryId)
    .select(categoryColumns)
    .single()
    .returns<CategoryRow>();

  if (error) {
    throw error;
  }

  return mapCategory(data);
}

export async function deleteCategory(categoryId: string): Promise<Category> {
  const { data, error } = await getSupabaseClient()
    .from("categories")
    .delete()
    .eq("id", categoryId)
    .select(categoryColumns)
    .single()
    .returns<CategoryRow>();

  if (error) {
    throw error;
  }

  return mapCategory(data);
}

export async function getPublicCategoryByShareId(
  shareId: string,
): Promise<Category | null> {
  const { data, error } = await getPublicSupabaseClient()
    .from("categories")
    .select(categoryColumns)
    .eq("share_id", shareId)
    .eq("is_shared", true)
    .maybeSingle()
    .returns<CategoryRow | null>();

  if (error) {
    throw error;
  }

  return data ? mapCategory(data) : null;
}

export async function getPublicCategoryOwnerUsername(
  shareId: string,
): Promise<string | null> {
  const { data, error } = await getPublicSupabaseClient().rpc(
    "get_shared_category_owner_username",
    { category_share_id: shareId },
  );

  if (error) {
    throw error;
  }

  return data;
}

export async function getPublicEntries(categoryId: string): Promise<Entry[]> {
  const { data, error } = await getPublicSupabaseClient()
    .from("entries")
    .select(entryColumns)
    .eq("category_id", categoryId)
    .order("created_at", { ascending: true })
    .returns<EntryRow[]>();

  if (error) {
    throw error;
  }

  return data.map(mapEntry);
}

export async function insertEntry(entry: InsertEntryPayload): Promise<Entry> {
  const client = getSupabaseClient();
  const entryWithPhoto = await resolveEntryPhotoInput(entry, {
    client,
    entryId: entry.id,
  });
  const { data, error } = await client
    .from("entries")
    .insert(toInsertEntryPayload(entryWithPhoto))
    .select(entryColumns)
    .single()
    .returns<EntryRow>();

  if (error) {
    throw error;
  }

  return mapEntry(data);
}

export async function updateEntry(
  entryId: string,
  entry: UpdateEntryPayload,
): Promise<Entry> {
  const client = getSupabaseClient();
  const entryWithPhoto = await resolveEntryPhotoInput(entry, {
    client,
    entryId,
  });
  const { data, error } = await client
    .from("entries")
    .update(toUpdateEntryPayload(entryWithPhoto))
    .eq("id", entryId)
    .select(entryColumns)
    .single()
    .returns<EntryRow>();

  if (error) {
    throw error;
  }

  return mapEntry(data);
}

export async function deleteEntry(entryId: string): Promise<Entry> {
  const { data, error } = await getSupabaseClient()
    .from("entries")
    .delete()
    .eq("id", entryId)
    .select(entryColumns)
    .single()
    .returns<EntryRow>();

  if (error) {
    throw error;
  }

  return mapEntry(data);
}
