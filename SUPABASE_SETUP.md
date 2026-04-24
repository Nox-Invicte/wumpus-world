# Supabase Leaderboard Setup Guide

Follow these steps to set up Supabase for the Wumpus World leaderboard:

## Step 1: Create a Supabase Project

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Click **"New project"** or sign in to your account
3. Enter a project name (e.g., "wumpus-world")
4. Choose a strong database password
5. Select your preferred region
6. Click **"Create new project"** and wait for it to initialize

## Step 2: Create the Leaderboard Table

1. In the Supabase Dashboard, go to the **SQL Editor** tab
2. Click **"New Query"**
3. Copy and paste the following SQL to create the leaderboard table:

```sql
CREATE TABLE leaderboard (
  id BIGSERIAL PRIMARY KEY,
  player_name TEXT NOT NULL DEFAULT 'Anonymous',
  elapsed_ms INTEGER NOT NULL,
  wumpus_killed BOOLEAN NOT NULL DEFAULT false,
  treasure_collected BOOLEAN NOT NULL DEFAULT false,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT TIMEZONE('utc'::text, NOW()),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Create an index on elapsed_ms for faster queries
CREATE INDEX idx_leaderboard_elapsed_ms ON leaderboard(elapsed_ms ASC);

-- Create an index on timestamp for sorting by date
CREATE INDEX idx_leaderboard_timestamp ON leaderboard(timestamp DESC);
```

4. Click **"Run"** to execute the query
5. You should see a success message and the table will appear in the **Table Editor**

## Step 3: Set Up Row Level Security (Optional but Recommended)

1. Go to the **Authentication** tab in the sidebar
2. Click **"Policies"** (or go to Table Editor → leaderboard → RLS)
3. Enable RLS (Row Level Security) for the leaderboard table
4. Create the following policies:

**SELECT Policy (Allow public read):**
- Click **"New Policy"**
- Name: "Allow public select"
- For: `SELECT`
- With expressions: Leave blank (allows all)
- Click **"Save"**

**INSERT Policy (Allow public insert):**
- Click **"New Policy"**
- Name: "Allow public insert"
- For: `INSERT`
- With expressions: Leave blank (allows all)
- Click **"Save"**

This allows anyone to read scores and submit new ones without authentication.

## Step 4: Get Your Supabase Credentials

1. In the Supabase Dashboard, go to **Project Settings** (⚙️ gear icon)
2. Click **"API"** in the left sidebar
3. Copy the following:
   - **Project URL** - This is your `NEXT_PUBLIC_SUPABASE_URL`
   - **Publishable Key** - This is your `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`

## Step 5: Add Environment Variables

1. In your project root, create or edit `.env.local` file
2. Add these lines with your values from Step 4:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-publishable-key-here
```

⚠️ **Important**: These values are public (NEXT_PUBLIC prefix), so they're safe to expose. They're only used for client-side Supabase initialization.

## Step 6: Restart Your Dev Server

```bash
npm run dev
```

Now when you play and complete a game:
- A **popup** will appear showing the leaderboard
- If you **won**, you'll see a "Submit Run" button to enter your name
- Submitting will save your score to Supabase
- The leaderboard will display the top 10 fastest completion times

## Verifying Your Setup

1. Complete a game in the app and submit your score
2. In the Supabase Dashboard, go to **Table Editor**
3. Click on the **leaderboard** table
4. You should see your submitted run appear in the table

## Troubleshooting

### "Cannot find module '@supabase/supabase-js'"
- Run `npm install` to ensure all dependencies are installed
- Restart your dev server

### Leaderboard not loading
- Check that your `.env.local` has both `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- Verify the values match exactly from Supabase Dashboard
- Open browser DevTools Console (F12) to see any error messages
- Make sure RLS policies are configured correctly

### "relation 'leaderboard' does not exist"
- Verify you ran the SQL query from Step 2 to create the table
- Check the Table Editor to confirm the table exists

### Getting "403 Forbidden" errors
- Make sure RLS policies are enabled and configured correctly
- Verify the anon key has permission to INSERT and SELECT

## Migrating from Firebase

If you're migrating existing scores from Firebase:

1. Export your data from Firebase
2. Transform the data to match the Supabase schema (use snake_case for column names)
3. Import it into Supabase using the Table Editor → Upload Data feature

Example transformation:
```
Firebase: { playerName, elapsedMs, timestamp }
Supabase: { player_name, elapsed_ms, timestamp }
```
