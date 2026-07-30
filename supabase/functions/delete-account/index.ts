import { createClient } from "npm:@supabase/supabase-js@2.56.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function json(body: unknown, status: number) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }
  if (request.method !== "POST") {
    return json({ error: "Method not allowed." }, 405);
  }

  const authorization = request.headers.get("Authorization");
  const jwt = authorization?.replace(/^Bearer\s+/i, "").trim();
  if (!jwt) {
    return json({ error: "Authentication required." }, 401);
  }

  const body = await request.json().catch(() => null);
  if (!body || body.confirm !== true) {
    return json({ error: "Explicit deletion confirmation is required." }, 400);
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabaseUrl || !serviceRoleKey) {
    console.error("Required Supabase function environment variables are unavailable.");
    return json({ error: "Account deletion is temporarily unavailable." }, 503);
  }

  const admin = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const { data: userData, error: userError } = await admin.auth.getUser(jwt);
  if (userError || !userData.user) {
    return json({ error: "Invalid or expired session." }, 401);
  }

  // Application rows reference auth.users with ON DELETE CASCADE.
  const { error: deletionError } = await admin.auth.admin.deleteUser(userData.user.id);
  if (deletionError) {
    console.error("Account deletion failed.", {
      userId: userData.user.id,
      code: deletionError.code,
    });
    return json({ error: "Could not delete the account." }, 500);
  }

  return json({ deleted: true }, 200);
});
