const entryPhotosBucket = "entry-photos";

type UploadOptions = {
  contentType: string;
  upsert: boolean;
};

type EntryPhotoStorageClient = {
  auth: {
    getUser: () => Promise<{
      data: { user: { id: string } | null };
      error: unknown;
    }>;
  };
  storage: {
    from: (bucket: string) => {
      upload: (
        path: string,
        body: ArrayBuffer,
        options: UploadOptions,
      ) => Promise<{ error: unknown }>;
      getPublicUrl: (path: string) => {
        data: { publicUrl: string };
      };
    };
  };
};

type ResolveEntryPhotoUrlOptions = {
  client: EntryPhotoStorageClient;
  entryId: string;
  photoUrl?: string;
  fetchFile?: typeof fetch;
  createFileName?: () => string;
};

type ResolveEntryPhotoInputOptions = Omit<
  ResolveEntryPhotoUrlOptions,
  "photoUrl"
>;

function isRemotePhotoUrl(photoUrl: string) {
  return /^https?:\/\//i.test(photoUrl);
}

function getImageMetadata(photoUrl: string, response: Response) {
  const responseContentType = response.headers.get("Content-Type");
  const uriExtension = photoUrl
    .split("?")[0]
    ?.match(/\.([a-zA-Z0-9]+)$/)?.[1]
    ?.toLowerCase();

  if (responseContentType?.startsWith("image/")) {
    const responseExtension = responseContentType.split("/")[1]?.split(";")[0];
    const extension = responseExtension === "jpeg" ? "jpg" : responseExtension;

    if (extension) {
      return { contentType: responseContentType, extension };
    }
  }

  if (uriExtension === "png") {
    return { contentType: "image/png", extension: "png" };
  }

  if (uriExtension === "webp") {
    return { contentType: "image/webp", extension: "webp" };
  }

  if (uriExtension === "heic" || uriExtension === "heif") {
    return { contentType: `image/${uriExtension}`, extension: uriExtension };
  }

  return { contentType: "image/jpeg", extension: "jpg" };
}

function createUniqueFileName() {
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export async function resolveEntryPhotoUrl({
  client,
  entryId,
  photoUrl,
  fetchFile = fetch,
  createFileName = createUniqueFileName,
}: ResolveEntryPhotoUrlOptions): Promise<string | undefined> {
  if (!photoUrl || isRemotePhotoUrl(photoUrl)) {
    return photoUrl;
  }

  const {
    data: { user },
    error: userError,
  } = await client.auth.getUser();

  if (userError) {
    throw userError;
  }

  if (!user) {
    throw new Error("You must be signed in to upload an entry photo.");
  }

  const response = await fetchFile(photoUrl);
  const imageBytes = await response.arrayBuffer();
  const { contentType, extension } = getImageMetadata(photoUrl, response);
  const path = `${user.id}/${entryId}/${createFileName()}.${extension}`;
  const bucket = client.storage.from(entryPhotosBucket);
  const { error: uploadError } = await bucket.upload(path, imageBytes, {
    contentType,
    upsert: false,
  });

  if (uploadError) {
    throw uploadError;
  }

  return bucket.getPublicUrl(path).data.publicUrl;
}

export async function resolveEntryPhotoInput<T extends { photoUrl?: string }>(
  input: T,
  options: ResolveEntryPhotoInputOptions,
): Promise<T> {
  const photoUrl = await resolveEntryPhotoUrl({
    ...options,
    photoUrl: input.photoUrl,
  });

  return { ...input, photoUrl };
}
