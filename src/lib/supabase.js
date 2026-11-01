import { createClient } from '@supabase/supabase-js';

const rawUrl = (
  import.meta.env.VITE_SUPABASE_URL ||
  import.meta.env.SUPABASE_URL ||
  ''
).trim();

const rawKey = (
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  import.meta.env.SUPABASE_ANON_KEY ||
  ''
).trim();

// Normalize URL: remove trailing /rest/v1, /rest/v1/, or trailing slashes if user pasted REST endpoint
export const normalizeSupabaseUrl = (url) => {
  if (!url) return '';
  return url
    .replace(/\/rest\/v1\/?$/, '')
    .replace(/\/+$/, '')
    .trim();
};

const normalizedUrl = normalizeSupabaseUrl(rawUrl);

export const isSupabaseConfigured = Boolean(
  normalizedUrl &&
  rawKey &&
  normalizedUrl !== 'https://your-project.supabase.co' &&
  !normalizedUrl.includes('placeholder')
);

// Fallback dummy URL to prevent createClient throwing during initialization if env vars are missing
const validUrl = isSupabaseConfigured ? normalizedUrl : 'https://placeholder-project.supabase.co';
const validKey = isSupabaseConfigured ? rawKey : 'placeholder-anon-key';

export const supabase = createClient(validUrl, validKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});
