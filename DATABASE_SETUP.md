# Database Setup Guide - YogaAgeProof AI

This guide documents the manual steps required to complete Phase 2 database setup (Tasks T018-T021) that require Supabase console access.

## Prerequisites

- Supabase project created at https://xwttrcddxgjwemhdyglw.supabase.co
- Access to Supabase Dashboard
- Project credentials configured in `.env` file

## Task T018: Create Database Schema Migration

The complete schema is defined in `specs/001-yogaageproof-ai/contracts/supabase-schema.sql`.

### Steps:

1. **Open Supabase Dashboard**
   - Navigate to: https://supabase.com/dashboard/project/xwttrcddxgjwemhdyglw

2. **Go to SQL Editor**
   - Click "SQL Editor" in the left sidebar
   - Click "New Query"

3. **Copy and Execute Schema**
   - Copy the entire contents of `specs/001-yogaageproof-ai/contracts/supabase-schema.sql`
   - Paste into the SQL editor
   - Click "Run" to execute

4. **Verify Tables Created**
   - Go to "Table Editor" in left sidebar
   - Confirm all 13 tables are created:
     - user_profiles
     - skin_profiles
     - products
     - routines
     - routine_steps
     - routine_sessions
     - step_completions
     - diary_entries
     - progress_photos
     - photo_comparisons
     - notifications
     - ai_recommendations
     - subscriptions

## Task T019: Create progress-photos Storage Bucket

### Steps:

1. **Go to Storage Section**
   - Click "Storage" in the left sidebar
   - Click "New bucket"

2. **Create Bucket**
   - Name: `progress-photos`
   - Public bucket: **No** (private)
   - File size limit: 50 MB (recommended)
   - Allowed MIME types: `image/jpeg, image/png, image/heic`
   - Click "Create bucket"

## Task T020: Create RLS Policies for progress-photos Bucket

The storage policies enforce user-specific folder access for photo privacy (NFR-016, NFR-017).

### Steps:

1. **Go to Storage Policies**
   - In Storage section, click on `progress-photos` bucket
   - Click "Policies" tab
   - Click "New Policy"

2. **Create Upload Policy**
   - Policy name: "Users can upload own photos"
   - Operation: INSERT
   - Target roles: authenticated
   - Policy definition:
   ```sql
   bucket_id = 'progress-photos' AND auth.uid()::text = (storage.foldername(name))[1]
   ```
   - Click "Create policy"

3. **Create View Policy**
   - Policy name: "Users can view own photos"
   - Operation: SELECT
   - Target roles: authenticated
   - Policy definition:
   ```sql
   bucket_id = 'progress-photos' AND auth.uid()::text = (storage.foldername(name))[1]
   ```
   - Click "Create policy"

4. **Create Delete Policy**
   - Policy name: "Users can delete own photos"
   - Operation: DELETE
   - Target roles: authenticated
   - Policy definition:
   ```sql
   bucket_id = 'progress-photos' AND auth.uid()::text = (storage.foldername(name))[1]
   ```
   - Click "Create policy"

5. **Create Update Policy**
   - Policy name: "Users can update own photos"
   - Operation: UPDATE
   - Target roles: authenticated
   - Policy definition:
   ```sql
   bucket_id = 'progress-photos' AND auth.uid()::text = (storage.foldername(name))[1]
   ```
   - Click "Create policy"

## Task T021: Generate TypeScript Types

**Status**: ✅ Already completed manually in `src/types/supabase.types.ts`

If you need to regenerate types in the future:

### Option 1: Using Supabase CLI (Recommended)

```bash
npx supabase gen types typescript --project-id xwttrcddxgjwemhdyglw > src/types/supabase.types.ts
```

### Option 2: Using Supabase Dashboard

1. Go to Settings > API
2. Scroll to "Generate Types"
3. Select "TypeScript"
4. Copy the generated types
5. Replace contents of `src/types/supabase.types.ts`

## Task T038: Configure Supabase Auth JWT Expiry

Configure JWT tokens to expire after 30 days of inactivity (NFR-029).

### Steps:

1. **Go to Authentication Settings**
   - Click "Authentication" in left sidebar
   - Click "Settings" tab

2. **Configure JWT Expiry**
   - Scroll to "JWT Settings"
   - Set "JWT expiry limit": `2592000` seconds (30 days)
   - Enable "Automatic token refresh": Yes
   - Click "Save"

3. **Configure Refresh Token**
   - Set "Refresh token reuse interval": `10` seconds
   - Enable "Reuse interval enabled": Yes
   - Click "Save"

## Verification Checklist

After completing all steps, verify:

- [ ] All 13 database tables exist
- [ ] All RLS policies are enabled on tables
- [ ] `progress-photos` storage bucket exists and is private
- [ ] 4 storage policies are created for `progress-photos`
- [ ] JWT expiry is set to 30 days
- [ ] Automatic token refresh is enabled
- [ ] TypeScript types file exists at `src/types/supabase.types.ts`

## Optional: Auth Provider Configuration

To enable social authentication (FR-004, NFR-030, NFR-031):

### Google OAuth 2.0

1. Go to Authentication > Providers
2. Enable "Google"
3. Configure with Google Cloud Console credentials
4. Add authorized redirect URI: `yogaageproof://auth/callback`

### Apple Sign-In

1. Go to Authentication > Providers
2. Enable "Apple"
3. Configure with Apple Developer credentials
4. Required for iOS App Store submission (NFR-031)

## Troubleshooting

### Schema Migration Fails

- Check for existing tables with same names
- Ensure no active connections to database
- Try dropping existing tables first (if safe to do so)
- Run migration in smaller chunks

### Storage Policies Not Working

- Verify bucket name is exactly `progress-photos`
- Check that RLS is enabled on storage.objects table
- Test with a real authenticated user
- Check Supabase logs for policy violations

### TypeScript Types Out of Sync

- Regenerate types after any schema changes
- Ensure all enum values are reflected in types
- Check for nullable fields matching database constraints

## Support

For issues with Supabase setup:
- Supabase Documentation: https://supabase.com/docs
- Supabase Discord: https://discord.supabase.com
- Project-specific issues: Check Supabase project logs
