import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

type InviteRequest = {
  emails?: string[];
  redirectTo?: string;
};

const jsonResponse = (body: unknown, status = 200) => {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
    },
  });
};

const normalizeEmail = (email: string) => email.trim().toLowerCase();

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return jsonResponse({ error: "Method not allowed" }, 405);
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const allowedEmails = (Deno.env.get("INVITE_ALLOWED_EMAILS") ?? "")
    .split(",")
    .map(normalizeEmail)
    .filter(Boolean);

  if (!supabaseUrl || !serviceRoleKey) {
    return jsonResponse({ error: "Missing Supabase function secrets" }, 500);
  }

  const authorization = req.headers.get("Authorization") ?? "";
  const token = authorization.replace("Bearer ", "");

  if (!token) {
    return jsonResponse({ error: "Missing bearer token" }, 401);
  }

  const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);
  const { data: userData, error: userError } = await supabaseAdmin.auth.getUser(token);
  const callerEmail = userData.user?.email ? normalizeEmail(userData.user.email) : "";

  if (userError || !callerEmail || !allowedEmails.includes(callerEmail)) {
    return jsonResponse({ error: "Not allowed to send invitations" }, 403);
  }

  const body = await req.json() as InviteRequest;
  const emails = [...new Set((body.emails ?? []).map(normalizeEmail).filter(Boolean))];

  if (!emails.length) {
    return jsonResponse({ error: "At least one email is required" }, 400);
  }

  const results = await Promise.all(emails.map(async (email) => {
    const { error } = await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
      redirectTo: body.redirectTo,
    });

    return {
      email,
      invited: !error,
      error: error?.message,
    };
  }));

  return jsonResponse({ results });
});
