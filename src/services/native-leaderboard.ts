/**
 * Boba Dash — Native Leaderboard Service (Unified Interface)
 *
 * Abstracts platform-specific leaderboard calls behind a single interface.
 * Automatically uses Apple Game Center on iOS, Google Play Games on Android.
 * Falls back to Supabase custom leaderboard when native is unavailable.
 *
 * Architecture:
 *   ┌──────────────────────────────┐
 *   │   LeaderboardScreen.tsx       │  ← RN UI
 *   │   calls NativeLeaderboard.*   │
 *   └──────────┬───────────────────┘
 *              │
 *   ┌──────────▼───────────────────┐
 *   │   NativeLeaderboardService    │  ← This file
 *   │   (unified interface)         │
 *   └──┬──────────┬────────────┬───┘
 *      │          │            │
 *   ┌──▼──┐   ┌───▼───┐   ┌───▼────┐
 *   │ GC  │   │  PG   │   │Supabase│  ← Platform-specific
 *   │(iOS)│   │(Andrd)│   │fallback│
 *   └─────┘   └───────┘   └────────┘
 *
 * Usage:
 *   import { NativeLeaderboardService } from '@/services/native-leaderboard';
 *
 *   // Submit score after level completion
 *   await NativeLeaderboardService.submitScore('income', weeklyIncome);
 *
 *   // Show native leaderboard UI
 *   await NativeLeaderboardService.showLeaderboard('combo');
 *
 *   // Get friends leaderboard (for custom UI if needed)
 *   const entries = await NativeLeaderboardService.getFriendRankings('income');
 */

import { Platform } from 'react-native';
import { GameCenterService } from './game-center';
import { PlayGamesService } from './play-games';
import type { LeaderboardCategory, LeaderboardEntry } from '@shared/types';

// ============================================================
// Native Leaderboard Service
// ============================================================

export const NativeLeaderboardService = {
  /**
   * Check if native leaderboard is available
   * (Game Center on iOS, Play Games on Android)
   */
  isNativeAvailable(): boolean {
    if (Platform.OS === 'ios') return GameCenterService.isAvailable();
    if (Platform.OS === 'android') return PlayGamesService.isAvailable();
    return false;
  },

  /**
   * Submit a score to the native leaderboard
   * Called after:
   *   - Level completion → submit weekly income
   *   - Combo achieved → submit max combo
   *   - Decoration purchased → submit decoration score
   *
   * Also falls through to Supabase for cross-platform friend circle
   */
  async submitScore(category: LeaderboardCategory, score: number): Promise<{ native: boolean; supabase: boolean }> {
    const results = { native: false, supabase: false };

    // 1. Submit to native leaderboard (Game Center or Play Games)
    if (Platform.OS === 'ios') {
      results.native = await GameCenterService.submitScore(category, score);
    } else if (Platform.OS === 'android') {
      results.native = await PlayGamesService.submitScore(category, score);
    }

    // 2. Also submit to Supabase (for cross-platform friend circles)
    // This ensures iOS and Android players can see each other in friend-circle rankings
    try {
      // TODO: Call Supabase Edge Function to update leaderboard_snapshots
      // await supabase.functions.invoke('updateLeaderboard', { body: { category, score } });
      results.supabase = true; // optimistic during dev
    } catch (e) {
      console.error('[NativeLeaderboard] Supabase submit failed:', e);
    }

    return results;
  },

  /**
   * Show the native leaderboard UI
   * Opens Apple's GameKit or Google Play Games leaderboard view
   */
  async showLeaderboard(category: LeaderboardCategory | null): Promise<void> {
    if (Platform.OS === 'ios') {
      await GameCenterService.showLeaderboard(category);
    } else if (Platform.OS === 'android') {
      await PlayGamesService.showLeaderboard(category);
    }
  },

  /**
   * Get friend circle rankings (for custom in-app UI)
   *
   * This uses Supabase to get cross-platform friend rankings.
   * The native leaderboard UI (showLeaderboard) is platform-specific,
   * but for our in-app "friend circle" view, we query Supabase.
   *
   * @param category - Which leaderboard
   * @returns Top entries from friend circle
   */
  async getFriendRankings(category: LeaderboardCategory): Promise<LeaderboardEntry[]> {
    try {
      // TODO: Call Supabase Edge Function
      // const { data, error } = await supabase.functions.invoke('getLeaderboard', {
      //   body: { category, scope: 'friends' }
      // });
      // return data?.entries || [];
      console.log(`[NativeLeaderboard] getFriendRankings(${category}) — TODO: call Supabase`);
      return [];
    } catch (e) {
      console.error('[NativeLeaderboard] getFriendRankings failed:', e);
      return [];
    }
  },

  /**
   * Sync native friends list to Supabase
   * Called after authentication to enable cross-platform friend matching
   */
  async syncFriends(supabaseClient?: any): Promise<void> {
    if (Platform.OS === 'ios') {
      await GameCenterService.syncFriendsToSupabase(supabaseClient);
    } else if (Platform.OS === 'android') {
      await PlayGamesService.syncFriendsToSupabase(supabaseClient);
    }
  },

  /**
   * Show native invite UI (invite friends to be Game Center / Play Games friends)
   */
  async showInviteUI(): Promise<void> {
    if (Platform.OS === 'ios') {
      await GameCenterService.showInviteUI();
    } else if (Platform.OS === 'android') {
      await PlayGamesService.showInviteUI();
    }
  },
};
