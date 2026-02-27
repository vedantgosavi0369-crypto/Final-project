import { createClient } from '@supabase/supabase-js';

// TODO: Replace with environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://ngbqhkqoazneombiczo.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5nYnFoa3FvYXpuZW9lbWJpY3pvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIxODQ0NTYsImV4cCI6MjA4Nzc2MDQ1Nn0.hqWYxe4jrk-b5qZBtER2qpdaJJd6F6PJdIOsD7s5VXo';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
