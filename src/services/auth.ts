/**
 * Boba Dash — Authentication Service
 *
 * v2.0 Changes (2026-08-11):
 *   - Added Game Center authentication (iOS) and Play Games authentication (Android)
 *   - After Supabase auth, automatically links native social identity
 *   - Syncs native friends list to Supabase for cross-platform matching
 *
 * Supports:
 *   - Sign-in-with-Apple (iOS) → Supabase Auth → Game Center link
 *   - Google Sign-In (Android) → Supabase Auth → Play Games link
 *   - Anonymous (dev/testing)
 *
 * Offline-first: App is fully playable without authentication.
 * Auth is only needed for social features (Taste Test, Cover Shift, Leaderboard).
 */

import { Platform } from 'react-native';
import { supabase } from './supabase-client';
import { authStore, hybridStorage } from '@shared/storage';
import { GameCenterService } from './game-center';
import { PlayGamesService } from './play-games';
import { NativeLeaderboardService } from './native-leaderboard';
import type { AuthState, AuthProvider } from '@shared/types';

// ============================================================
// Auth State Management
// ============================================================

export async function getAuthState(): Promise<AuthState> {
  return authStore.load();
}

export function isOnlineMode(): boolean {
  return hybridStorage.isOnline();
}

// ============================================================
// Sign In
// ============================================================

/**
 * Sign in with Apple (iOS only)
 * Requires expo-apple-authentication
 */
export async function signInWithApple(shopName?: string): Promise<{ success: boolean; error?: string }> {
  try {
    // Note: expo-apple-authentication needs to be installed
    // npx expo install expo-apple-authentication
    // For now, using Supabase OAuth flow
    const { data, error } = await supabase.auth.signInWithIdToken({
      provider: 'apple',
      token: '', // Will be filled by native Apple Sign-In flow
      options: {
        data: { shop_name: shopName || 'New Boba Shop' },
      },
    });

    if (error) throw error;

    await onAuthSuccess(data.user?.id || '', data.user?.email || '', shopName, 'apple');
    return { success: true };
  } catch (e: any) {
    console.error('[Auth] Apple sign-in failed:', e);
    return { success: false, error: e.message };
  }
}

/**
 * Sign in with Google (Android/iOS)
 * Uses Supabase OAuth flow
 */
export async function signInWithGoogle(shopName?: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: 'bobadash://auth/callback',
        data: { shop_name: shopName || 'New Boba Shop' },
      },
    });

    if (error) throw error;

    // For OAuth flow, the redirect will handle the rest
    // The session will be picked up by the auth state listener
    return { success: true };
  } catch (e: any) {
    console.error('[Auth] Google sign-in failed:', e);
    return { success: false, error: e.message };
  }
}

/**
 * Sign in anonymously (for testing/dev)
 */
export async function signInAnonymously(shopName?: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { data, error } = await supabase.auth.signInAnonymously({
      options: {
        data: { shop_name: shopName || 'New Boba Shop' },
      },
    });

    if (error) throw error;

    await onAuthSuccess(data.user?.id || '', data.user?.email || '', shopName, 'google');
    return { success: true };
  } catch (e: any) {
    console.error('[Auth] Anonymous sign-in failed:', e);
    return { success: false, error: e.message };
  }
}

// ============================================================
// Sign Out
// ============================================================

export async function signOut(): Promise<void> {
  await supabase.auth.signOut();
  hybridStorage.disableCloudSync();
  await authStore.clear();

  // Reset to offline mode — keep local save data
  console.log('[Auth] Signed out, continuing in offline mode');
}

// ============================================================
// Auth State Listener
// ============================================================

export function onAuthStateChange(callback: (state: AuthState) => void): () => void {
  const { data } = supabase.auth.onAuthStateChange(async (event, session) => {
    if (event === 'SIGNED_IN' && session) {
      const shopName = session.user?.user_metadata?.shop_name || 'New Boba Shop';
      await onAuthSuccess(
        session.user.id,
        session.user.email || '',
        shopName,
        'google', // Provider detection from session
      );
      callback({
        isAuthenticated: true,
        userId: session.user.id,
        email: session.user.email,
        shopName,
        provider: 'google',
      });
    } else if (event === 'SIGNED_OUT') {
      hybridStorage.disableCloudSync();
      await authStore.clear();
      callback({
        isAuthenticated: false,
        userId: null,
        email: null,
        shopName: null,
        provider: null,
      });
    }
  });

  return () => data.subscription.unsubscribe();
}

// ============================================================
// Internal
// ============================================================

async function onAuthSuccess(
  userId: string,
  email: string,
  shopName: string | undefined,
  provider: AuthProvider,
): Promise<void> {
  const authState: AuthState = {
    isAuthenticated: true,
    userId,
    email,
    shopName: shopName || 'New Boba Shop',
    provider,
  };
  await authStore.save(authState);
  hybridStorage.enableCloudSync(supabase);
  await hybridStorage.forcePullFromCloud();

  // v2.0: Link native social identity (Game Center / Play Games)
  // This enables: native friend lists, native leaderboards, native achievements
  await linkNativeSocialIdentity();

  console.log('[Auth] Success, cloud sync + native social linked');
}

// ============================================================
// v2.0: Native Social Identity Linking
// ============================================================

/**
 * After Supabase auth, link the native social identity:
 *   - iOS: Authenticate with Game Center, sync friends to Supabase
 *   - Android: Authenticate with Play Games, sync friends to Supabase
 *
 * This is called automatically after successful auth.
 * If the user declines native auth, the app still works with invite-code-based friends.
 */
async function linkNativeSocialIdentity(): Promise<void> {
  try {
    if (Platform.OS === 'ios') {
      const player = await GameCenterService.authenticate();
      if (player) {
        console.log('[Auth] Game Center linked:', player.alias);
        await GameCenterService.syncFriendsToSupabase(supabase);
      } else {
        console.log('[Auth] Game Center auth declined or unavailable');
      }
    } else if (Platform.OS === 'android') {
      const player = await PlayGamesService.authenticate();
      if (player) {
        console.log('[Auth] Play Games linked:', player.displayName);
        await PlayGamesService.syncFriendsToSupabase(supabase);
      } else {
        console.log('[Auth] Play Games auth declined or unavailable');
      }
    }
  } catch (e: any) {
    // Native social linking is optional — don't fail auth if it fails
    console.warn('[Auth] Native social linking failed (non-blocking):', e?.message);
  }
}
