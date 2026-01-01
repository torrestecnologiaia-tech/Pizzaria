import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://bvhufwyxchcmzqzvlrkg.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ2aHVmd3l4Y2hjbXpxenZscmtnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjcwOTc5MjAsImV4cCI6MjA4MjY3MzkyMH0.1B_mNPPuwh2_zouIqAEDxaom7esxEfTacKJu1l3-IeQ';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
