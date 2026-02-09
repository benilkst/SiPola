import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Check if credentials are valid (not placeholder values)
const isValidUrl = supabaseUrl &&
    supabaseUrl !== 'your_supabase_url_here' &&
    supabaseUrl.startsWith('https://');

const isValidKey = supabaseAnonKey &&
    supabaseAnonKey !== 'your_supabase_anon_key_here' &&
    supabaseAnonKey.length > 20;

let supabase = null;

if (isValidUrl && isValidKey) {
    try {
        supabase = createClient(supabaseUrl, supabaseAnonKey);
    } catch (error) {
        console.warn('Failed to initialize Supabase client:', error);
    }
} else {
    console.info('Supabase not configured. Running in demo mode.');
}

export { supabase };

// Helper to check if Supabase is configured
export const isSupabaseConfigured = () => !!supabase;
