/**
 * Boba Dash — Google Play Games Services
 *
 * Provides: Authentication, Leaderboard submission, Friend list, Achievements
 * Platform: Android only
 *
 * Dependencies (install in Cursor terminal):
 *   npx expo install expo-auth-session expo-crypto
 *   # For Play Games SDK native bridge (requires bare workflow or config plugin):
 *   # npm install react-native-google-play-services
 *
 * Google Play Console setup:
 *   1. Google Play Console → Your App → Play Games Services → Setup
 *   2. Add Leaderboards: boba_weekly_income, boba_max_combo, boba_decoration_score
 *   3. Add Achievements (see NATIVE_SOCIAL_CONFIG.playGames.achievementIds)
 *   4. Link your app (package name must match app.json → android.package)
 *   5. Add OAuth client ID for Play Games auth
 *
 * Usage in React Native:
 *   import { PlayGamesService } from '@/services/play-games';
 *   await PlayGamesService.authenticate();
 *   await PlayGamesService.submitScore('income', 5000);
 *   const friends = await PlayGamesService.getFriends();
 */

import { Platform } from 'react-native';
import { NATIVE_SOCIAL_CONFIG, LEADERBOARD_CONFIG } from '@shared/social-config';
import type { LeaderboardCategory } from '@shared/types';

// ============================================================
// Types
// ============================================================

export interface PlayGamesPlayer {
  id: string;
  displayName: string;
  avatarUrl?: string;
  title?: string;
}

export interface PlayGamesFriend {
  id: string;
  displayName: string;
  avatarUrl?: string;
}

export interface PlayGamesLeaderboardScore {
  rank: number;
  score: number;
  player: PlayGamesPlayer;
}

// ============================================================
// Play Games Service
// ============================================================

/**
 * NOTE: This is a service stub that documents the full API surface.
 * The actual native calls require a native module bridge.
 *
 * For Expo managed workflow:
 *   - Auth: Use Google Sign-In (expo-auth-session) → link to Play Games
 *   - Leaderboards/Achievements: Requires config plugin or bare workflow
 *   - Friend list: Requires Play Games SDK native bridge
 *
 * The functions below are designed to work with either approach.
 * Replace the TODO sections with actual native module calls.
 */

export const PlayGamesService = {
  /**
   * Check if Google Play Games is available on this device
   */
  isAvailable(): boolean {
    return Platform.OS === 'android';
  },

  /**
   * Authenticate with Google Play Games Services
   * Uses Google Sign-In flow, then links to Play Games
   *
   * @returns Play Games player info if authenticated, null if declined
   */
  async authenticate(): Promise<PlayGamesPlayer | null> {
    if (!this.isAvailable()) return null;

    try {
      // TODO: Replace with actual native module call
      // Option 1: Use GoogleSignIn → getPlayGamesToken → link to Supabase
      // import { makeRedirectUri } from 'expo-auth-session';
      // import * as Google from 'expo-auth-session/providers/google';
      //
      // const [request, response, promptAsync] = Google.useAuthRequest({
      //   clientId: process.env.GOOGLE_CLIENT_ID,
      //   scopes: ['openid', 'email', 'profile'],
      // });
      // await promptAsync();
      // // Then: get Play Games auth code from native module
      //
      // Option 2: react-native-google-play-services native module
      // const player = await PlayGamesModule.signIn();
      // return player;

      console.log('[PlayGames] authenticate() — TODO: implement native call');
      return null;
    } catch (e: any) {
      console.error('[PlayGames] Authentication failed:', e);
      return null;
    }
  },

  /**
   * Submit a score to a Play Games leaderboard
   *
   * @param category - Which leaderboard (income/combo/decoration)
   * @param score - The score to submit
   */
  async submitScore(category: LeaderboardCategory, score: number): Promise<boolean> {
    if (!this.isAvailable()) return false;

    const leaderboardId = LEADERBOARD_CONFIG.nativeLeaderboardIds[category];
    if (!leaderboardId) {
      console.error('[PlayGames] Unknown leaderboard category:', category);
      return false;
    }

    try {
      // TODO: Replace with actual native module call
      // const result = await PlayGamesModule.submitScore(leaderboardId, score);
      // return result.success;
      console.log(`[PlayGames] submitScore(${leaderboardId}, ${score}) — TODO: implement native call`);
      return true; // optimistic return during dev
    } catch (e: any) {
      console.error('[PlayGames] submitScore failed:', e);
      return false;
    }
  },

  /**
   * Get the friends list from Play Games
   * Requires the player to grant "Play Games friends" permission
   *
   * @returns Array of Play Games friends
   */
  async getFriends(): Promise<PlayGamesFriend[]> {
    if (!this.isAvailable()) return [];

    try {
      // TODO: Replace with actual native module call
      // Note: Play Games SDK requires explicit permission to access friends list
      // const hasPermission = await PlayGamesModule.requestFriendsPermission();
      // if (!hasPermission) return [];
      // const friends = await PlayGamesModule.loadFriends();
      // return friends;
      console.log('[PlayGames] getFriends() — TODO: implement native call');
      return [];
    } catch (e: any) {
      console.error('[PlayGames] getFriends failed:', e);
      return [];
    }
  },

  /**
   * Show the native Play Games leaderboard UI
   * Opens Google's built-in leaderboard view
   *
   * @param category - Which leaderboard to show (null = show all)
   */
  async showLeaderboard(category: LeaderboardCategory | null): Promise<void> {
    if (!this.isAvailable()) return;

    const leaderboardId = category ? LEADERBOARD_CONFIG.nativeLeaderboardIds[category] : null;

    try {
      // TODO: Replace with actual native module call
      // PlayGamesModule.showLeaderboard(leaderboardId);
      console.log(`[PlayGames] showLeaderboard(${leaderboardId}) — TODO: implement native call`);
    } catch (e: any) {
      console.error('[PlayGames] showLeaderboard failed:', e);
    }
  },

  /**
   * Unlock an achievement
   *
   * @param achievementId - Key from NATIVE_SOCIAL_CONFIG.playGames.achievementIds
   */
  async unlockAchievement(achievementId: string): Promise<boolean> {
    if (!this.isAvailable()) return false;

    const ids = NATIVE_SOCIAL_CONFIG.playGames.achievementIds;
    const actualId = (ids as Record<string, string>)[achievementId];
    if (!actualId) {
      console.error('[PlayGames] Unknown achievement key:', achievementId);
      return false;
    }

    try {
      // TODO: Replace with actual native module call
      // PlayGamesModule.unlockAchievement(actualId);
      console.log(`[PlayGames] unlockAchievement(${actualId}) — TODO: implement native call`);
      return true;
    } catch (e: any) {
      console.error('[PlayGames] unlockAchievement failed:', e);
      return false;
    }
  },

  /**
   * Show the native Play Games friends invite UI
   */
  async showInviteUI(): Promise<void> {
    if (!this.isAvailable()) return;

    try {
      // TODO: Replace with actual native module call
      // PlayGamesModule.showInviteUI();
      console.log('[PlayGames] showInviteUI() — TODO: implement native call');
    } catch (e: any) {
      console.error('[PlayGames] showInviteUI failed:', e);
    }
  },

  /**
   * Sync Play Games friends to Supabase
   * Same pattern as Game Center sync — enables cross-platform friend matching
   */
  async syncFriendsToSupabase(supabaseClient: any): Promise<void> {
    const friends = await this.getFriends();
    if (friends.length === 0) return;

    try {
      const friendIds = friends.map(f => f.id);
      // TODO: upsert to Supabase
      // await supabaseClient.from('play_games_links').upsert({
      //   user_id: currentUserId,
      //   pg_friend_ids: friendIds,
      // });
      console.log(`[PlayGames] Synced ${friendIds.length} friends to Supabase — TODO`);
    } catch (e: any) {
      console.error('[PlayGames] syncFriendsToSupabase failed:', e);
    }
  },
};
