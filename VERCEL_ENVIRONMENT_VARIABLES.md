# Vercel Environment Variables

Add these variables in Vercel under **Project Settings -> Environment Variables**.
Enable them for **Production** (and Preview/Development if needed).

```env
NEXT_PUBLIC_SUPABASE_URL=https://eitxjwlwmrgylboamyml.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVpdHhqd2x3bXJneWxib2FteW1sIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTAyMzcxNzQsImV4cCI6MjEwNTgxMzE3NH0.rkXd8djhGdV8zgO_Qb__fGIA4q_rWkqaChuofHB6V-Y
NEXT_PUBLIC_APP_URL=https://app.hirelyandjobly.in
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVpdHhqd2x3bXJneWxib2FteW1sIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5MDIzNzE3NCwiZXhwIjoyMTA1ODEzMTc0fQ.kN584sKsFgyCF_WzhTuqx5jMMuYBWvP7eo1ZrGIXGRA
```

## Where to get the values

- `NEXT_PUBLIC_SUPABASE_URL`: Supabase **Project Settings -> API -> Project URL**.
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Supabase **Project Settings -> API -> Publishable key** or legacy anon key.
- `NEXT_PUBLIC_APP_URL`: the full public Vercel URL, including `https://`.
- `SUPABASE_SERVICE_ROLE_KEY`: Supabase **Project Settings -> API -> Secret/service_role key**. Keep this server-only.

After adding the variables, redeploy the Vercel project. Do not commit a file containing the real key values.
