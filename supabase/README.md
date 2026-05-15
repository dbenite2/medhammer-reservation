# Supabase Setup

## Google Sign In

1. In Supabase, open Authentication > Providers > Google.
2. Enable Google and add the Google OAuth client ID and secret.
3. Add your app URL to the redirect allow list. For local development, include:
   `http://localhost:5173/**`
4. In Google Cloud Console, add the Supabase callback URL shown in the Supabase Google provider settings.

## Tester Invitations

Invitations require a service-role key, so they run through the `invite-users` Edge Function instead of the browser.

Deploy and configure:

```bash
supabase functions deploy invite-users
supabase secrets set INVITE_ALLOWED_EMAILS="admin@example.com"
```

Call the function as an allowed signed-in admin:

```bash
curl -X POST "$SUPABASE_URL/functions/v1/invite-users" \
  -H "Authorization: Bearer $USER_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"emails":["tester@example.com"],"redirectTo":"http://localhost:5173/reserve"}'
```

The function uses `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`, which Supabase provides to Edge Functions when configured in your project.
