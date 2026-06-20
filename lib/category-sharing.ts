type CategorySharingState = {
  isPublic: boolean;
  shareId?: string;
};

const shareBaseUrl = "https://bestlist.app/share";

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

export function getCategoryShareUrl(shareId?: string) {
  return shareId ? `${shareBaseUrl}/${shareId}` : undefined;
}
