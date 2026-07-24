# Supabase Storage Setup Guide

## Required Storage Bucket

This application requires a Supabase Storage bucket for profile photo uploads.

### Bucket Configuration

**Bucket Name:** `avatars`

**Settings:**
- Public bucket: ✅ Enabled
- File size limit: 5MB
- Allowed MIME types: `image/jpeg`, `image/png`, `image/webp`, `image/gif`

### Setup Steps

1. Go to your Supabase project dashboard
2. Navigate to **Storage** → **Buckets**
3. Click **New bucket**
4. Enter bucket name: `avatars`
5. Enable **Public bucket**
6. Set file size limit to **5MB**
7. Click **Create bucket**

### Storage Policies

Run this SQL in the Supabase SQL Editor to set up proper access policies:

```sql
-- Allow public uploads to the avatars bucket
CREATE POLICY "Public Uploads"
ON storage.objects FOR INSERT
TO public
WITH CHECK (bucket_id = 'avatars');

-- Allow public reads from the avatars bucket
CREATE POLICY "Public Reads"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'avatars');

-- Allow users to update their own avatars
CREATE POLICY "User Updates"
ON storage.objects FOR UPDATE
TO public
USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Allow users to delete their own avatars
CREATE POLICY "User Deletes"
ON storage.objects FOR DELETE
TO public
USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);
```

### File Structure

Files are stored with the following path pattern:
```
{user_id}/avatar-{timestamp}.{extension}
```

Example: `123e4567-e89b-12d3-a456-426614174000/avatar-1699123456789.jpg`

### Error Handling

The application handles the following storage errors gracefully:

- **Missing bucket**: Shows clear error message with setup instructions
- **Upload failure**: Displays error and allows retry
- **Permission errors**: Prompts user to check bucket policies
- **Network errors**: Shows network error message with retry option

### Testing

To test the upload functionality:

1. Sign in to the application
2. Go to Profile → Upload a profile photo
3. Verify the photo uploads successfully
4. Check Supabase Storage → avatars bucket to confirm file is stored
5. Verify the photo displays in the profile and sidebar

### Troubleshooting

**Error: "Bucket not found"**
- Ensure the bucket name is exactly `avatars` (lowercase)
- Verify the bucket is set to public

**Error: "Permission denied"**
- Check that the storage policies are correctly set up
- Verify RLS (Row Level Security) is enabled on the storage.objects table

**Error: "File too large"**
- Ensure the file is under 5MB
- Compress the image if needed

**Upload succeeds but image doesn't display**
- Check that the bucket is public
- Verify the public URL is correctly generated
- Clear browser cache and reload