type CategorySharingState = {
  isPublic: boolean;
  shareId?: string;
};

const shareBaseUrl = "https://bestlist-app.com/share";

/**
 * Builds the next sharing state for a category.
 *
 * @param category - The current sharing state.
 * @param isPublic - Whether the category should be public.
 * @param createShareId - Generates a share id when one is needed.
 * @returns The next sharing state.
 */
export function getNextCategorySharingState(
  category: CategorySharingState,
  isPublic: boolean,
  createShareId: () => string,
): CategorySharingState {
  return {
    isPublic,
    shareId: category.shareId ?? (isPublic ? createShareId() : undefined),
  };
}

/**
 * Builds a public category share URL.
 *
 * @param shareId - The category share id.
 * @returns The public share URL, or undefined when no share id exists.
 */
export function getCategoryShareUrl(shareId?: string) {
  return shareId ? `${shareBaseUrl}/${shareId}` : undefined;
}
