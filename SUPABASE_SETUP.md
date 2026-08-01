# Supabase Avatar Storage Setup

Run [`supabase/avatar_setup.sql`](supabase/avatar_setup.sql) in the Supabase SQL Editor before deploying the app.

The migration creates or updates the private `avatars` bucket, limits uploaded files to JPG, PNG, and WEBP at 5 MB, adds `profiles.avatar_url` and `profiles.profile_completed`, and applies RLS policies that limit each authenticated user to their own folder.

Uploaded avatar files use this structure:

```
avatars/{user_id}/{uuid}-{timestamp}.webp
```

`profiles.avatar_url` stores the storage path rather than a public URL. The client generates a short-lived signed URL only for the authenticated user's current avatar, so photos remain private and continue to render after refresh or sign-in.

Do not make the bucket public and do not add public storage policies. Supabase bucket administration belongs in the SQL migration or trusted server-side deployment automation; authenticated browser clients cannot safely grant themselves those permissions.
