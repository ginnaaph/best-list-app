import { getSupabaseClient } from "@/lib/supabase";

export const avatarsBucket = "avatars";

const avatarSignedUrlExpiresIn = 60 * 60;

function appendAvatarCacheKey(url: string, cacheKey: number) {
  return `${url}${url.includes("?") ? "&" : "?"}v=${cacheKey}`;
}

function getAvatarStoragePath(avatarUrl: string) {
  const pathMarkers = [
    `/storage/v1/object/public/${avatarsBucket}/`,
    `/storage/v1/object/sign/${avatarsBucket}/`,
  ];
  const pathMarker = pathMarkers.find((marker) => avatarUrl.includes(marker));

  if (pathMarker) {
    const markerIndex = avatarUrl.indexOf(pathMarker);
    return decodeURIComponent(
      avatarUrl
        .slice(markerIndex + pathMarker.length)
        .split("?")[0] ?? "",
    );
  }

  if (!/^https?:\/\//i.test(avatarUrl)) {
    return avatarUrl.split("?")[0];
  }

  return null;
}

/**
 * Creates a signed avatar URL with a cache key.
 *
 * @param avatarUrl - The stored avatar URL or path.
 * @param cacheKey - The cache-busting value to append.
 * @returns The displayable avatar URL.
 */
export async function resolveAvatarDisplayUrl(
  avatarUrl: string,
  cacheKey = Date.now(),
) {
  const avatarPath = getAvatarStoragePath(avatarUrl);

  if (!avatarPath) {
    return avatarUrl;
  }

  const supabase = getSupabaseClient();
  const { data, error } = await supabase.storage
    .from(avatarsBucket)
    .createSignedUrl(avatarPath, avatarSignedUrlExpiresIn);

  if (error) {
    throw error;
  }

  return appendAvatarCacheKey(data.signedUrl, cacheKey);
}
