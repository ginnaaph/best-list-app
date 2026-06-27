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

function jsonResponse(body: { success: boolean; error?: string }, status: number) {
  return Response.json(body, {
    headers: corsHeaders,
    status,
  });
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
