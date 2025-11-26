# Data Model: YogaAgeProof AI

**Branch**: `001-yogaageproof-ai` | **Date**: 2025-11-26
**Phase**: 1 - Design & Contracts

## Overview

This document defines the Supabase PostgreSQL data model for YogaAgeProof AI. All entities use UUID primary keys, timestamps for auditing, and support Row Level Security (RLS) for data isolation.

---

## Entity Relationship Diagram

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│     users       │────<│  skin_profiles  │     │    products     │
│  (Supabase)     │     │                 │     │                 │
└────────┬────────┘     └─────────────────┘     └────────┬────────┘
         │                                               │
         │              ┌─────────────────┐              │
         │              │    routines     │              │
         └─────────────>│                 │<─────────────┘
                        └────────┬────────┘
                                 │
                        ┌────────┴────────┐
                        ▼                 ▼
              ┌─────────────────┐  ┌─────────────────┐
              │  routine_steps  │  │ routine_sessions│
              │                 │  │                 │
              └─────────────────┘  └────────┬────────┘
                                            │
                                   ┌────────┴────────┐
                                   ▼
                        ┌─────────────────┐
                        │  step_completions│
                        └─────────────────┘

┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  diary_entries  │     │ progress_photos │────>│photo_comparisons│
└─────────────────┘     └─────────────────┘     └─────────────────┘

┌─────────────────┐     ┌─────────────────┐
│  notifications  │     │ai_recommendations│
└─────────────────┘     └─────────────────┘
```

---

## Entities

### 1. user_profiles

Extends Supabase auth.users with application-specific data.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK, FK → auth.users | Links to Supabase auth |
| display_name | VARCHAR(100) | NOT NULL | User's display name |
| date_of_birth | DATE | NULLABLE | Optional DOB |
| avatar_url | TEXT | NULLABLE | Profile picture URL |
| language_preference | VARCHAR(10) | DEFAULT 'en' | ISO language code |
| notification_enabled | BOOLEAN | DEFAULT true | Global notification toggle |
| notification_routine_reminders | BOOLEAN | DEFAULT true | Routine reminder notifications |
| notification_tips | BOOLEAN | DEFAULT true | AI tips notifications |
| notification_milestones | BOOLEAN | DEFAULT true | Progress milestone notifications |
| cloud_backup_enabled | BOOLEAN | DEFAULT false | Photo cloud backup opt-in |
| timezone | VARCHAR(50) | DEFAULT 'UTC' | User's timezone |
| onboarding_completed | BOOLEAN | DEFAULT false | Tutorial completion flag |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Creation timestamp |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() | Last update timestamp |

**Validation Rules**:
- FR-006: language_preference must be valid ISO code
- FR-079: Supports multi-language interface
- NFR-018: cloud_backup_enabled is opt-in (default false)

**RLS Policy**: Users can only read/write their own profile.

---

### 2. skin_profiles

AI-generated skin analysis results.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK, DEFAULT gen_random_uuid() | Unique identifier |
| user_id | UUID | FK → user_profiles, NOT NULL | Owner |
| skin_type | VARCHAR(20) | NOT NULL | oily, dry, combination, sensitive, normal |
| concerns | JSONB | DEFAULT '[]' | Array of detected concerns |
| analysis_confidence | DECIMAL(3,2) | CHECK (0-1) | AI confidence score |
| source_photo_url | TEXT | NOT NULL | Reference to analyzed photo |
| analysis_metadata | JSONB | DEFAULT '{}' | Full AI response data |
| is_active | BOOLEAN | DEFAULT true | Current active profile |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Analysis timestamp |

**Validation Rules**:
- FR-011: skin_type enum values enforced
- FR-012: concerns array contains valid concern types
- NFR-001: Analysis must complete within 10 seconds (client-side timeout)

**Concerns Structure**:
```json
{
  "concerns": [
    {"type": "fine_lines", "severity": "moderate", "areas": ["forehead", "eyes"]},
    {"type": "dark_spots", "severity": "mild", "areas": ["cheeks"]}
  ]
}
```

**State Transitions**:
- New scan creates new profile, marks previous as is_active=false
- Only one active profile per user at a time

---

### 3. routines

Personalized skincare and face yoga routines.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK, DEFAULT gen_random_uuid() | Unique identifier |
| user_id | UUID | FK → user_profiles, NOT NULL | Owner |
| skin_profile_id | UUID | FK → skin_profiles, NOT NULL | Source skin analysis |
| title | VARCHAR(100) | NOT NULL | Routine display name |
| description | TEXT | NULLABLE | Routine description |
| focus_area | VARCHAR(50) | NOT NULL | e.g., "Anti-Aging", "Hydration" |
| estimated_duration_minutes | INTEGER | NOT NULL, CHECK > 0 | Total routine time |
| benefits | JSONB | DEFAULT '[]' | Array of benefit strings |
| status | VARCHAR(20) | DEFAULT 'draft' | draft, active, archived |
| is_ai_generated | BOOLEAN | DEFAULT true | AI vs manual creation |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Creation timestamp |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() | Last update timestamp |

**Validation Rules**:
- FR-015: 3-5 routines generated per skin profile
- FR-017: Must include title, focus_area, duration, benefits
- FR-018: Only one routine can be status='active' per user

**State Transitions**:
```
draft → active (user selects routine)
active → archived (user switches routine)
archived → active (user reactivates)
```

---

### 4. routine_steps

Individual steps within a routine.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK, DEFAULT gen_random_uuid() | Unique identifier |
| routine_id | UUID | FK → routines, NOT NULL | Parent routine |
| step_number | INTEGER | NOT NULL | Order in routine |
| step_type | VARCHAR(20) | NOT NULL | 'face_yoga' or 'product_application' |
| title | VARCHAR(100) | NOT NULL | Step display name |
| instructions | TEXT | NOT NULL | Step-by-step instructions |
| tips | TEXT | NULLABLE | Helpful tips |
| duration_seconds | INTEGER | NOT NULL, CHECK > 0 | Step duration |
| image_url | TEXT | NULLABLE | Demonstration image |
| video_url | TEXT | NULLABLE | Demonstration video |
| product_id | UUID | FK → products, NULLABLE | Required product (if product step) |
| product_amount | VARCHAR(50) | NULLABLE | e.g., "pea-sized", "2 pumps" |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Creation timestamp |

**Validation Rules**:
- FR-025: step_number determines sequence
- FR-026: Face yoga steps must have duration, imagery
- FR-027: Product steps must have product_id, instructions, amount
- UNIQUE(routine_id, step_number)

---

### 5. products

Skincare product catalog.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK, DEFAULT gen_random_uuid() | Unique identifier |
| name | VARCHAR(200) | NOT NULL | Product name |
| brand | VARCHAR(100) | NOT NULL | Brand name |
| category | VARCHAR(50) | NOT NULL | cleanser, toner, serum, moisturizer, etc. |
| description | TEXT | NULLABLE | Product description |
| ingredients | JSONB | DEFAULT '[]' | Ingredient list |
| benefits | JSONB | DEFAULT '[]' | Product benefits |
| usage_instructions | TEXT | NULLABLE | How to use |
| skin_types | JSONB | DEFAULT '[]' | Suitable skin types |
| concerns_addressed | JSONB | DEFAULT '[]' | Skin concerns this helps |
| image_url | TEXT | NULLABLE | Product image |
| price_usd | DECIMAL(10,2) | NULLABLE | Price if known |
| external_url | TEXT | NULLABLE | Purchase link |
| is_available | BOOLEAN | DEFAULT true | Availability status |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Creation timestamp |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() | Last update timestamp |

**Validation Rules**:
- FR-064: category must be valid step type
- FR-065: Must include name, brand, category, image
- NFR-012: Product data cached, updated every 24 hours

**Category Enum**:
- cleanser, toner, serum, moisturizer, eye_cream, treatment, sunscreen, mask, oil

---

### 6. routine_sessions

Records of completed routine executions.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK, DEFAULT gen_random_uuid() | Unique identifier |
| user_id | UUID | FK → user_profiles, NOT NULL | Owner |
| routine_id | UUID | FK → routines, NOT NULL | Executed routine |
| started_at | TIMESTAMPTZ | NOT NULL | Session start time |
| completed_at | TIMESTAMPTZ | NULLABLE | Session end time |
| status | VARCHAR(20) | DEFAULT 'in_progress' | in_progress, completed, abandoned |
| total_duration_seconds | INTEGER | NULLABLE | Actual duration |
| steps_completed | INTEGER | DEFAULT 0 | Count of completed steps |
| steps_skipped | INTEGER | DEFAULT 0 | Count of skipped steps |
| notes | TEXT | NULLABLE | User session notes |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Creation timestamp |

**Validation Rules**:
- FR-031: Session logged with timestamp and completion status
- FR-034: Used for consistency metrics calculation

**State Transitions**:
```
in_progress → completed (all steps done or user ends)
in_progress → abandoned (app closed, timeout)
```

---

### 7. step_completions

Individual step completion records within a session.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK, DEFAULT gen_random_uuid() | Unique identifier |
| session_id | UUID | FK → routine_sessions, NOT NULL | Parent session |
| step_id | UUID | FK → routine_steps, NOT NULL | Completed step |
| status | VARCHAR(20) | NOT NULL | completed, skipped |
| started_at | TIMESTAMPTZ | NOT NULL | Step start time |
| completed_at | TIMESTAMPTZ | NULLABLE | Step end time |
| duration_seconds | INTEGER | NULLABLE | Actual step duration |

**Validation Rules**:
- FR-032: Steps can be marked completed or skipped
- UNIQUE(session_id, step_id)

---

### 8. diary_entries

Daily skin diary logs.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK, DEFAULT gen_random_uuid() | Unique identifier |
| user_id | UUID | FK → user_profiles, NOT NULL | Owner |
| entry_date | DATE | NOT NULL | Log date |
| mood | VARCHAR(20) | NULLABLE | stressed, calm, energized, tired, etc. |
| triggers | JSONB | DEFAULT '[]' | Array of trigger tags |
| skin_condition | TEXT | NULLABLE | Free-text skin notes |
| notes | TEXT | NULLABLE | Additional notes |
| routine_session_id | UUID | FK → routine_sessions, NULLABLE | Associated routine if any |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Creation timestamp |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() | Last update timestamp |

**Validation Rules**:
- FR-041: entry_date required
- FR-042: mood from predefined options
- FR-043: triggers as array of strings
- UNIQUE(user_id, entry_date) - one entry per day

**Mood Enum**:
- stressed, calm, energized, tired, happy, anxious, neutral

**Trigger Examples**:
```json
["stress", "poor_sleep", "diet_change", "weather_change", "travel", "exercise"]
```

---

### 9. progress_photos

Captured facial photos for progress tracking.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK, DEFAULT gen_random_uuid() | Unique identifier |
| user_id | UUID | FK → user_profiles, NOT NULL | Owner |
| local_path | TEXT | NULLABLE | Device file path |
| cloud_url | TEXT | NULLABLE | Supabase Storage URL |
| sync_status | VARCHAR(20) | DEFAULT 'local_only' | local_only, pending, synced |
| captured_at | TIMESTAMPTZ | NOT NULL | Photo capture time |
| lighting_conditions | VARCHAR(50) | NULLABLE | Detected lighting |
| analysis_result | JSONB | NULLABLE | AI analysis if performed |
| thumbnail_url | TEXT | NULLABLE | Compressed thumbnail |
| file_size_bytes | INTEGER | NULLABLE | Original file size |
| is_deleted | BOOLEAN | DEFAULT false | Soft delete flag |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Creation timestamp |

**Validation Rules**:
- FR-050: captured_at required
- FR-053: sync_status tracks cloud backup
- NFR-010: file_size_bytes < 2MB after compression

**Sync Status Transitions**:
```
local_only → pending (user enables backup)
pending → synced (upload complete)
synced → local_only (user disables backup, deletes from cloud)
```

---

### 10. photo_comparisons

AI-powered before/after photo analysis.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK, DEFAULT gen_random_uuid() | Unique identifier |
| user_id | UUID | FK → user_profiles, NOT NULL | Owner |
| before_photo_id | UUID | FK → progress_photos, NOT NULL | Earlier photo |
| after_photo_id | UUID | FK → progress_photos, NOT NULL | Later photo |
| analyzed_at | TIMESTAMPTZ | NOT NULL | Analysis timestamp |
| detected_changes | JSONB | NOT NULL | Array of changes |
| improvement_metrics | JSONB | DEFAULT '{}' | Quantified improvements |
| ai_summary | TEXT | NULLABLE | AI-generated summary |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Creation timestamp |

**Validation Rules**:
- FR-055: Two different photos required
- FR-056: detected_changes populated by AI
- before_photo must be earlier than after_photo

**Detected Changes Structure**:
```json
{
  "changes": [
    {"type": "fine_lines", "area": "forehead", "change": "reduced", "confidence": 0.85},
    {"type": "skin_texture", "area": "cheeks", "change": "improved", "confidence": 0.78}
  ]
}
```

---

### 11. notifications

In-app notification records.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK, DEFAULT gen_random_uuid() | Unique identifier |
| user_id | UUID | FK → user_profiles, NOT NULL | Recipient |
| type | VARCHAR(30) | NOT NULL | reminder, milestone, tip, update |
| title | VARCHAR(200) | NOT NULL | Notification title |
| message | TEXT | NOT NULL | Notification content |
| data | JSONB | DEFAULT '{}' | Additional payload |
| is_read | BOOLEAN | DEFAULT false | Read status |
| read_at | TIMESTAMPTZ | NULLABLE | When read |
| scheduled_for | TIMESTAMPTZ | NULLABLE | Scheduled delivery time |
| delivered_at | TIMESTAMPTZ | NULLABLE | Actual delivery time |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Creation timestamp |

**Validation Rules**:
- FR-076: type categorizes notification
- FR-078: is_read tracks read status

**Type Enum**:
- routine_reminder, progress_milestone, ai_tip, system_update, achievement

---

### 12. ai_recommendations

AI-generated personalized suggestions.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK, DEFAULT gen_random_uuid() | Unique identifier |
| user_id | UUID | FK → user_profiles, NOT NULL | Recipient |
| type | VARCHAR(30) | NOT NULL | routine_adjustment, product_suggestion, behavioral_tip |
| title | VARCHAR(200) | NOT NULL | Recommendation title |
| message | TEXT | NOT NULL | Detailed recommendation |
| data_sources | JSONB | DEFAULT '[]' | What data informed this |
| is_actioned | BOOLEAN | DEFAULT false | User took action |
| actioned_at | TIMESTAMPTZ | NULLABLE | When actioned |
| expires_at | TIMESTAMPTZ | NULLABLE | Recommendation expiry |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Creation timestamp |

**Validation Rules**:
- FR-037: Generated after minimum 7 sessions
- FR-082: Based on skin profile, routine history, progress

---

### 13. subscriptions

User subscription status (synced with Stripe).

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK, DEFAULT gen_random_uuid() | Unique identifier |
| user_id | UUID | FK → user_profiles, NOT NULL, UNIQUE | Owner |
| stripe_customer_id | VARCHAR(100) | NULLABLE | Stripe customer ID |
| stripe_subscription_id | VARCHAR(100) | NULLABLE | Stripe subscription ID |
| plan | VARCHAR(20) | DEFAULT 'free' | free, pro |
| status | VARCHAR(20) | DEFAULT 'active' | active, canceled, past_due |
| current_period_start | TIMESTAMPTZ | NULLABLE | Billing period start |
| current_period_end | TIMESTAMPTZ | NULLABLE | Billing period end |
| cancel_at_period_end | BOOLEAN | DEFAULT false | Pending cancellation |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Creation timestamp |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() | Last update timestamp |

**Plan Features**:
| Feature | Free | Pro |
|---------|------|-----|
| Face scans per month | 3 | Unlimited |
| Routine generation | 1 | Unlimited |
| Photo comparisons | 5 | Unlimited |
| Cloud backup | No | Yes |
| AI tips | Limited | Full |

---

## Indexes

```sql
-- Performance indexes
CREATE INDEX idx_skin_profiles_user_active ON skin_profiles(user_id, is_active);
CREATE INDEX idx_routines_user_status ON routines(user_id, status);
CREATE INDEX idx_routine_sessions_user_date ON routine_sessions(user_id, started_at DESC);
CREATE INDEX idx_diary_entries_user_date ON diary_entries(user_id, entry_date DESC);
CREATE INDEX idx_progress_photos_user_date ON progress_photos(user_id, captured_at DESC);
CREATE INDEX idx_notifications_user_unread ON notifications(user_id, is_read, created_at DESC);
CREATE INDEX idx_products_category ON products(category, is_available);
```

---

## Row Level Security (RLS) Policies

All tables implement RLS with user-scoped policies:

```sql
-- Example for user_profiles
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON user_profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  USING (auth.uid() = id);

-- Products table is public read
CREATE POLICY "Products are viewable by authenticated users"
  ON products FOR SELECT
  TO authenticated
  USING (true);
```

---

## Database Functions

### update_updated_at()
Trigger function to auto-update `updated_at` timestamp.

### calculate_routine_consistency(user_id, days)
Returns consistency percentage for given period.

### get_active_routine(user_id)
Returns the user's currently active routine with steps.

### generate_daily_notifications(user_id)
Creates scheduled notifications based on user preferences.
