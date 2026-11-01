import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

const DEFAULT_SUPABASE_URL = 'https://kzqfseztqqmuohtvrqdb.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt6cWZzZXp0cXFtdW9odHZycWRiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTM0OTAzNTcsImV4cCI6MjEwOTA2NjM1N30.ZT3uI61WqvX_R5yuLfMs0qWylhFhiWWWU60yyGxtCbI';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const supabaseUrl =
    process.env.VITE_SUPABASE_URL ||
    env.VITE_SUPABASE_URL ||
    process.env.SUPABASE_URL ||
    env.SUPABASE_URL ||
    DEFAULT_SUPABASE_URL;

  const supabaseAnonKey =
    process.env.VITE_SUPABASE_ANON_KEY ||
    env.VITE_SUPABASE_ANON_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    env.SUPABASE_ANON_KEY ||
    DEFAULT_SUPABASE_ANON_KEY;

  return {
    plugins: [react()],
    envPrefix: ['VITE_', 'SUPABASE_'],
    define: {
      'import.meta.env.VITE_SUPABASE_URL': JSON.stringify(supabaseUrl),
      'import.meta.env.VITE_SUPABASE_ANON_KEY': JSON.stringify(supabaseAnonKey),
    },
    server: {
      port: 3000,
      open: true,
    },
    build: {
      chunkSizeWarningLimit: 3500,
    },
  };
});

