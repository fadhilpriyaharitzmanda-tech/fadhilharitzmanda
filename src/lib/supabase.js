import { createClient } from '@supabase/supabase-js';

const DEFAULT_SUPABASE_URL = 'https://kzqfseztqqmuohtvrqdb.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt6cWZzZXp0cXFtdW9odHZycWRiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTM0OTAzNTcsImV4cCI6MjEwOTA2NjM1N30.ZT3uI61WqvX_R5yuLfMs0qWylhFhiWWWU60yyGxtCbI';

// Normalize URL: remove trailing /rest/v1, /rest/v1/, or trailing slashes if user pasted REST endpoint
export const normalizeSupabaseUrl = (url) => {
  if (!url) return '';
  return url
    .replace(/\/rest\/v1\/?$/, '')
    .replace(/\/+$/, '')
    .trim();
};

const rawUrl = (
  import.meta.env.VITE_SUPABASE_URL ||
  import.meta.env.SUPABASE_URL ||
  DEFAULT_SUPABASE_URL
).trim();

const rawKey = (
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  import.meta.env.SUPABASE_ANON_KEY ||
  DEFAULT_SUPABASE_ANON_KEY
).trim();

const normalizedUrl = normalizeSupabaseUrl(rawUrl);

export const isSupabaseConfigured = Boolean(
  normalizedUrl &&
  rawKey &&
  normalizedUrl !== 'https://your-project.supabase.co' &&
  !normalizedUrl.includes('placeholder')
);

const validUrl = isSupabaseConfigured ? normalizedUrl : DEFAULT_SUPABASE_URL;
const validKey = isSupabaseConfigured ? rawKey : DEFAULT_SUPABASE_ANON_KEY;

export const supabase = createClient(validUrl, validKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});
