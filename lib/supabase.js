import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://dvodaepwgobuqgajziym.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR2b2RhZXB3Z29idXFnYWp6aXltIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQwMzgwMjIsImV4cCI6MjA4OTYxNDAyMn0.LyvYL_upJ_1-v_LLZjgcpT1Xoek9a1LIdk8b_KN_LlE';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
