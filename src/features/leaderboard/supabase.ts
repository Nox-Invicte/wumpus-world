import { createClient } from "@supabase/supabase-js";

// TODO: Replace with your Supabase project credentials
// Steps to get these:
// 1. Go to Supabase Dashboard (https://supabase.com/dashboard)
// 2. Create or select a project
// 3. Go to Project Settings → API
// 4. Copy the URL and publishable key
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabasePublishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || "";

export const supabase = createClient(supabaseUrl, supabasePublishableKey);
