import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://usppufmcuywelqzzedjs.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVzcHB1Zm1jdXl3ZWxxenplZGpzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzc1MTQyMDIsImV4cCI6MjA1MzA5MDIwMn0.8xQOvTELWYf3XcKeaql-GPJl9eKn-KSg4VnWZ8Bg02Q';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
