/**
 * Boba Dash — Supabase Client Singleton
 * Reads env vars from Expo's env system
 */

import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { hybridStorage } from '@shared/storage';

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.warn(
    '[Supabase] Missing env vars. Copy .env.example to .env and fill in your Supabase credentials.'
  );
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

/**
 * Initialize cloud sync after authentication
 */
export async function initCloudSync(): Promise<void> {
  const { data: { session } } = await supabase.auth.getSession();
  if (session) {
    hybridStorage.enableCloudSync(supabase);
    // Trigger initial sync
    await hybridStorage.forcePullFromCloud();
    console.log('[Supabase] Cloud sync enabled');
  } else {
    console.log('[Supabase] No active session, running in offline mode');
  }
}

/**
 * Disable cloud sync (on logout)
 */
export function disableCloudSync(): void {
  hybridStorage.disableCloudSync();
}
