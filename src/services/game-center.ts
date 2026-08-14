/**
 * Boba Dash — Apple Game Center Service
 *
 * Provides: Authentication, Leaderboard submission, Friend list, Achievements
 * Platform: iOS only (iPhone/iPad)
 *
 * Dependencies (install in Cursor terminal):
 *   npx expo install expo-apple-authentication
 *   npx expo install expo-game-center  (community package or native module)
 *
 * App Store Connect setup:
 *   1. App Store Connect → Your App → Game Center
 *   2. Add Leaderboards: boba_weekly_income, boba_max_combo, boba_decoration_score
 *   3. Add Achievements (see NATIVE_SOCIAL_CONFIG.gameCenter.achievementIds)
 *   4. Enable Game Center capability in Xcode (Expo: app.json → ios.associateDomains)
 *
 * Usage in React Native:
 *   import { GameCenterService } from '@/services/game-center';
 *   await GameCenterService.authenticate();
 *   await GameCenterService.submitScore('income', 5000);
 *   const friends = await GameCenterService.getFriends();
 */

import { Platform } from 'react-native';
import { NATIVE_SOCIAL_CONFIG, LEADERBOARD_CONFIG } from '@shared/social-config';
import type { LeaderboardCategory } from '@shared/types';

// ============================================================
// Types
// ============================================================

export interface GameCenterPlayer {
  id: string;
  displayName: string;
  alias: string;
  avatarUrl?: string;
}

export interface GameCenterFriend {
  id: string;
  displayName: string;
  alias: string;
  avatarUrl?: string;
}

export interface GameCenterLeaderboardScore {
  rank: number;
  score: number;
  player: GameCenterPlayer;
}

// ============================================================
// Game Center Service
// ============================================================

/**
 * NOTE: This is a service stub that documents the full API surface.
 * The actual native calls require a native module bridge.
 *
 * For Expo managed workflow, you have two options:
 *   Option A: Use `expo-apple-authentication` for auth + custom native module for GameKit
 *   Option B: Eject to bare workflow and use react-native-game-center package
 *
 * The functions below are designed to work with either approach.
 * Replace the TODO sections with actual native module calls.
 */

export const GameCenterService = {
  /**
   * Check if Game Center is available on this device
   */
  isAvailable(): boolean {
    return Platform.OS === 'ios';
  },

  /**
   * Authenticate the local player with Game Center
   * Called on app launch (after Supabase auth) to link Game Center identity
   *
   * @returns Game Center player info if authenticated, null if declined
   */
  async authenticate(): Promise<GameCenterPlayer | null> {
    if (!this.isAvailable()) return null;

    try {
      // TODO: Replace with actual native module call
      // Option A (expo-apple-authentication):
      //   import * as AppleAuthentication from 'expo-apple-authentication';
      //   const credential = await AppleAuthentication.signInAsync({
      //     requestedScopes: [
      //       AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
      //       AppleAuthentication.AppleAuthenticationScope.EMAIL,
      //     ],
      //   });
      //   // Then link to Supabase via signInWithIdToken
      //
      // Option B (react-native-game-center / custom native module):
      //   const player = await GameKitModule.authenticateLocalPlayer();
      //   return player;

      console.log('[GameCenter] authenticate() — TODO: implement native call');
      return null;
    } catch (e: any) {
      console.error('[GameCenter] Authentication failed:', e);
      return null;
    }
  },

  /**
   * Submit a score to a Game Center leaderboard
   *
   * @param category - Which leaderboard (income/combo/decoration)
   * @param score - The score to submit
   */
  async submitScore(category: LeaderboardCategory, score: number): Promise<boolean> {
    if (!this.isAvailable()) return false;

    const leaderboardId = LEADERBOARD_CONFIG.nativeLeaderboardIds[category];
    if (!leaderboardId) {
      console.error('[GameCenter] Unknown leaderboard category:', category);
      return false;
    }

    try {
      // TODO: Replace with actual native module call
      // const result = await GameKitModule.submitScore(leaderboardId, score);
      // return result.success;
      console.log(`[GameCenter] submitScore(${leaderboardId}, ${score}) — TODO: implement native call`);
      return true; // optimistic return during dev
    } catch (e: any) {
      console.error('[GameCenter] submitScore failed:', e);
      return false;
    }
  },

  /**
   * Get the friends list from Game Center
   * These are players who have added each other as Game Center friends
   *
   * @returns Array of Game Center friends (max 100)
   */
  async getFriends(): Promise<GameCenterFriend[]> {
    if (!this.isAvailable()) return [];

    try {
      // TODO: Replace with actual native module call
      // Note: GameKit's loadFriendsWithHandler is deprecated in iOS 14+
      // Use GKLocalPlayer.loadFriends(Handler:) instead
      // const friends = await GameKitModule.loadFriends();
      // return friends;
      console.log('[GameCenter] getFriends() — TODO: implement native call');
      return [];
    } catch (e: any) {
      console.error('[GameCenter] getFriends failed:', e);
      return [];
    }
  },

  /**
   * Show the native Game Center leaderboard UI
   * Opens Apple's built-in leaderboard view controller
   *
   * @param category - Which leaderboard to show (null = show all)
   */
  async showLeaderboard(category: LeaderboardCategory | null): Promise<void> {
    if (!this.isAvailable()) return;

    const leaderboardId = category ? LEADERBOARD_CONFIG.nativeLeaderboardIds[category] : null;

    try {
      // TODO: Replace with actual native module call
      // GameKitModule.presentLeaderboard(leaderboardId);
      console.log(`[GameCenter] showLeaderboard(${leaderboardId}) — TODO: implement native call`);
    } catch (e: any) {
      console.error('[GameCenter] showLeaderboard failed:', e);
    }
  },

  /**
   * Unlock an achievement
   *
   * @param achievementId - Key from NATIVE_SOCIAL_CONFIG.gameCenter.achievementIds
   */
  async unlockAchievement(achievementId: string): Promise<boolean> {
    if (!this.isAvailable()) return false;

    const ids = NATIVE_SOCIAL_CONFIG.gameCenter.achievementIds;
    const actualId = (ids as Record<string, string>)[achievementId];
    if (!actualId) {
      console.error('[GameCenter] Unknown achievement key:', achievementId);
      return false;
    }

    try {
      // TODO: Replace with actual native module call
      // GameKitModule.reportAchievement(actualId, 100); // 100% complete
      console.log(`[GameCenter] unlockAchievement(${actualId}) — TODO: implement native call`);
      return true;
    } catch (e: any) {
      console.error('[GameCenter] unlockAchievement failed:', e);
      return false;
    }
  },

  /**
   * Show the native Game Center friends invite UI
   * Lets the player invite their contacts to be Game Center friends
   */
  async showInviteUI(): Promise<void> {
    if (!this.isAvailable()) return;

    try {
      // TODO: Replace with actual native module call
      // GameKitModule.presentFriendsInvite();
      console.log('[GameCenter] showInviteUI() — TODO: implement native call');
    } catch (e: any) {
      console.error('[GameCenter] showInviteUI failed:', e);
    }
  },

  /**
   * Sync Game Center friends to Supabase
   * This allows cross-platform friend matching (iOS Game Center friend on Android = match by Supabase user)
   *
   * Called after authentication, syncs Game Center friend IDs to social_profiles table
   */
  async syncFriendsToSupabase(supabaseClient: any): Promise<void> {
    const friends = await this.getFriends();
    if (friends.length === 0) return;

    // Map Game Center friend IDs to Supabase user IDs
    // Store the mapping in a separate column or table
    // This allows:
    //   - iOS player's Game Center friends → auto-match to Supabase accounts
    //   - Cross-platform: Android player with same email → auto-friend

    try {
      const friendIds = friends.map(f => f.id);
      // TODO: upsert to Supabase
      // await supabaseClient.from('game_center_links').upsert({
      //   user_id: currentUserId,
      //   gc_friend_ids: friendIds,
      // });
      console.log(`[GameCenter] Synced ${friendIds.length} friends to Supabase — TODO`);
    } catch (e: any) {
      console.error('[GameCenter] syncFriendsToSupabase failed:', e);
    }
  },
};
