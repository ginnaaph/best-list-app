// @ts-expect-error Deno resolves npm specifiers in the Edge Function runtime.
import { createClient } from "npm:@supabase/supabase-js@2";

declare const Deno: {
  env: {
    get(name: string): string | undefined;
  };
  serve(
    handler: (request: Request) => Response | Promise<Response>,
  ): void;
};

const corsHeaders = {
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Origin": "*",
};

type StorageObject = {
  id: string | null;
  name: string;
};

type StorageResult = {
  data: StorageObject[] | null;
  error: { message: string } | null;
};

type StorageBucket = {
  list(
    path?: string,
    options?: { limit?: number; offset?: number },
  ): Promise<StorageResult>;
  remove(paths: string[]): Promise<StorageResult>;
};

function jsonResponse(body: { success: boolean; error?: string }, status: number) {
  return Response.json(body, {
    headers: corsHeaders,
    status,
  });
}

async function listStorageObjects(
  bucket: StorageBucket,
  path: string,
): Promise<StorageResult> {
  const limit = 100;
  const objects: StorageObject[] = [];

  for (let offset = 0; ; offset += limit) {
    const { data, error } = await bucket.list(path, { limit, offset });

    if (error) {
      return { data: null, error };
    }

    objects.push(...(data ?? []));

    if (!data || data.length < limit) {
      return { data: objects, error: null };
    }
  }
}

Deno.serve(async (request: Request) => {
  if (request.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (request.method !== "POST") {
    return jsonResponse({ success: false, error: "Method not allowed." }, 405);
  }

  const authorization = request.headers.get("Authorization");
  const token = authorization?.replace(/^Bearer\s+/i, "");

  if (!token) {
    return jsonResponse(
      { success: false, error: "Authentication is required." },
      401,
    );
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!supabaseUrl || !serviceRoleKey) {
    console.error("Missing Supabase Edge Function environment variables.");
    return jsonResponse(
      { success: false, error: "Account deletion is not configured." },
      500,
    );
  }

  const admin = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
  const {
    data: { user },
    error: userError,
  } = await admin.auth.getUser(token);

  if (userError || !user) {
    return jsonResponse(
      { success: false, error: "Your session is invalid or has expired." },
      401,
    );
  }

  // Storage cleanup must succeed before deleteUser so the privacy deletion
  // promise includes uploaded files and failed runs can be safely retried.
  const entryPhotosBucket: StorageBucket = admin.storage.from("entry-photos");
  const avatarsBucket: StorageBucket = admin.storage.from("avatars");
  const entryPhotoPaths: string[] = [];
  const avatarPaths: string[] = [];

  const { data: entryFolders, error: entryFoldersError } =
    await listStorageObjects(entryPhotosBucket, user.id);

  if (entryFoldersError) {
    console.error(
      "Failed to list entry photo folders:",
      entryFoldersError.message,
    );
    return jsonResponse(
      { success: false, error: "Unable to delete your account." },
      500,
    );
  }

  for (const entryFolder of entryFolders ?? []) {
    if (entryFolder.id !== null) {
      continue;
    }

    const entryFolderPath = `${user.id}/${entryFolder.name}`;
    const { data: entryFiles, error: entryFilesError } =
      await listStorageObjects(entryPhotosBucket, entryFolderPath);

    if (entryFilesError) {
      console.error(
        "Failed to list entry photo files:",
        entryFilesError.message,
      );
      return jsonResponse(
        { success: false, error: "Unable to delete your account." },
        500,
      );
    }

    for (const entryFile of entryFiles ?? []) {
      entryPhotoPaths.push(`${entryFolderPath}/${entryFile.name}`);
    }
  }

  const { data: avatarFiles, error: avatarFilesError } =
    await listStorageObjects(avatarsBucket, user.id);

  if (avatarFilesError) {
    console.error("Failed to list avatar files:", avatarFilesError.message);
    return jsonResponse(
      { success: false, error: "Unable to delete your account." },
      500,
    );
  }

  for (const avatarFile of avatarFiles ?? []) {
    avatarPaths.push(`${user.id}/${avatarFile.name}`);
  }

  if (entryPhotoPaths.length > 0) {
    const { error: removeEntryPhotosError } =
      await entryPhotosBucket.remove(entryPhotoPaths);

    if (removeEntryPhotosError) {
      console.error(
        "Failed to delete entry photos:",
        removeEntryPhotosError.message,
      );
      return jsonResponse(
        { success: false, error: "Unable to delete your account." },
        500,
      );
    }
  }

  if (avatarPaths.length > 0) {
    const { error: removeAvatarsError } = await avatarsBucket.remove(avatarPaths);

    if (removeAvatarsError) {
      console.error("Failed to delete avatars:", removeAvatarsError.message);
      return jsonResponse(
        { success: false, error: "Unable to delete your account." },
        500,
      );
    }
  }

  const { error: deleteError } = await admin.auth.admin.deleteUser(user.id);

  if (deleteError) {
    console.error("Failed to delete account:", deleteError.message);
    return jsonResponse(
      { success: false, error: "Unable to delete your account." },
      500,
    );
  }

  return jsonResponse({ success: true }, 200);
});
