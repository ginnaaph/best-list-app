import type { Category, CategoryCardTone } from "../types/category";
import type { Entry } from "../types/entry";
import type { Profile, ProfileRow } from "../types/profile";

export type ProfileCategoryRow = {
  id: string;
  name: string;
  cover_photo: string | null;
  tone: string;
  is_shared: boolean;
  share_id: string | null;
  created_at: string;
};

export type ProfileEntryRow = {
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

function mapProfileEntry(row: ProfileEntryRow): Entry {
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

export function mapProfileRow(row: ProfileRow | null): Profile | null {
  if (!row) {
    return null;
  }

  return {
    id: row.id,
    username: row.username ?? undefined,
    fullName: row.full_name ?? undefined,
    city: row.city ?? undefined,
    bio: row.bio ?? undefined,
    avatarUrl: row.avatar_url ?? undefined,
    createdAt: row.created_at,
  };
}

export function getProfileInitial(
  profile: Profile | null,
  email: string | undefined,
) {
  const label = profile?.fullName ?? profile?.username ?? email ?? "?";
  return label.trim().charAt(0).toUpperCase() || "?";
}

export function getPostAuthDestination(
  profile: { username: string | null } | null | undefined,
) {
  return profile?.username ? ("/home" as const) : ("/setup-handle" as const);
}

export function prepareAppleNameProfileUpdate(fullName: string) {
  const normalizedFullName = fullName.trim().replace(/\s+/g, " ");

  return normalizedFullName ? { full_name: normalizedFullName } : null;
}

export function prepareSetupHandleProfileUpdate(
  handle: string,
  city: string,
  bio = "",
  avatarUrl: string | null = null,
) {
  const username = handle.trim().replace(/^@+/, "");

  return {
    username: username || undefined,
    city: city.trim(),
    bio: bio.trim(),
    avatar_url: avatarUrl,
  };
}

export function summarizeProfileCategories(
  categories: ProfileCategoryRow[],
  entries: ProfileEntryRow[],
): Category[] {
  const mappedEntries = entries.map(mapProfileEntry);

  return categories.map((category) => {
    const categoryEntries = mappedEntries.filter(
      (entry) => entry.categoryId === category.id,
    );
    const topEntry = [...categoryEntries].sort(
      (firstEntry, secondEntry) =>
        (secondEntry.overallScore ?? 0) - (firstEntry.overallScore ?? 0),
    )[0];

    return {
      id: category.id,
      name: category.name,
      topEntry: topEntry?.placeName ?? "No entries yet",
      entryCount: categoryEntries.length,
      coverPhoto: topEntry?.photoUrl ?? category.cover_photo ?? undefined,
      tone: toCategoryTone(category.tone),
      isPublic: category.is_shared,
      shareId: category.share_id ?? undefined,
    };
  });
}
