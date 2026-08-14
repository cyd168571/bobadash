/**
 * Boba Dash — Shared TypeScript Types
 * Used by both React Native app and WebView game
 */

// ============================================================
// Game Data Types
// ============================================================

export interface Base {
  id: string;
  name: string;
  color: string;
  icon: string;
}

export interface Flavor {
  id: string;
  name: string;
  color: string;
  icon: string;
}

export interface Topping {
  id: string;
  name: string;
  icon: string;
}

export interface Glass {
  id: string;
  name: string;
  icon: string;
  shape: 'tall' | 'wide' | 'goblet' | 'mason';
}

export interface Drink {
  id: number;
  base: string;
  flavor: string;
  topping: string;
  glass: string;
  name: string;
  price: number;
  cost: number;
  tier: number;
}

// ============================================================
// Level Types
// ============================================================

export interface Level {
  lv: number;
  name: string;
  tier: number;
  steps: number;
  time: number;
  custMax: number;
  delivery: boolean;
  teach: string | null;
  drinkIds?: number[];
}

export interface LevelReward {
  coins: number;
  exp: number;
}

// ============================================================
// Game State Types (runtime, in-game)
// ============================================================

export interface Customer {
  id: string;
  avatar: string;
  drink: Drink;
  patience: number;
  patienceMax: number;
  isVIP: boolean;
  arrivedAt: number;
}

export interface DeliveryOrder {
  id: string;
  drink: Drink;
  timeLeft: number;
  timeMax: number;
}

export interface Workbench {
  glass: string | null;
  base: string | null;
  flavor: string | null;
  topping: string | null;
  isBlending: boolean;
}

export interface GameState {
  level: number;
  levelData: Level;
  coins: number;
  combo: number;
  maxCombo: number;
  served: number;
  failed: number;
  timeLeft: number;
  customers: Customer[];
  deliveryOrders: DeliveryOrder[];
  currentOrder: string | null;
  workbench: Workbench;
  step: number;
  isGameOver: boolean;
  isPaused: boolean;
}

// ============================================================
// Save Data Types (persistent, local + cloud)
// ============================================================

export interface WeeklyStats {
  weekStart: string;
  totalIncome: number;
  maxCombo: number;
  decorationValue: number;
}

export interface SaveData {
  coins: number;
  level: number;
  currentTier: number;
  maxCombo: number;
  totalIncome: number;
  totalServed: number;
  unlockedDrinks: number[];
  decorations: string[];
  decorationValue: number;
  ingredients: Record<string, number>;
  lastSyncedAt: string | null;
  weeklyStats: WeeklyStats;
  createdAt: number;
  // Online-only fields
  shopName?: string;
  userId?: string;
}

// ============================================================
// WebView Bridge Protocol Types
// ============================================================

export type GameToNativeType =
  | 'GAME_SAVE'
  | 'GAME_LOAD'
  | 'GAME_IAP'
  | 'GAME_SOCIAL_ACTION'
  | 'GAME_HAPTIC'
  | 'GAME_SHARE'
  | 'GAME_AUTH'
  | 'GAME_READY'
  | 'GAME_LOG';

export type NativeToGameType =
  | 'NATIVE_SAVE_RESULT'
  | 'NATIVE_LOAD_DATA'
  | 'NATIVE_IAP_RESULT'
  | 'NATIVE_SOCIAL_RESULT'
  | 'NATIVE_AUTH_RESULT'
  | 'NATIVE_ERROR'
  | 'NATIVE_CONFIG';

export interface BridgeMessage {
  id: string;
  type: GameToNativeType | NativeToGameType;
  payload: Record<string, unknown>;
  timestamp: number;
}

// ============================================================
// Social Types
// ============================================================

export type SocialActionType = 'taste_test' | 'help_watch';

export interface SocialActionRequest {
  targetUserId: string;
  actionType: SocialActionType;
  drinkId?: number;
}

export interface SocialActionResponse {
  success: boolean;
  tasterGain?: number;   // Renamed from gainAmount (taster = initiator)
  tastedGain?: number;   // Renamed from lossAmount (tasted = shop owner, now positive)
  drinkName?: string;
  isSignature?: boolean;
  error?: string;
}

export interface FriendInfo {
  id: string;
  shopName: string;
  nickname: string;
  avatarUrl: string;
  level: number;
  tier: number;
  weeklyIncome: number;
  isOnline: boolean;
}

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  shopName: string;
  nickname: string;
  avatarUrl: string;
  value: number;
  prevRank?: number;
}

export type LeaderboardCategory = 'income' | 'combo' | 'decoration';

export interface DailySocialReport {
  date: string;
  tasteTestsUsed: number;
  tasteTestsMax: number;
  helpsUsed: number;
  helpsMax: number;
  tastedByCount: number;
  helpedByCount: number;
  totalGained: number;
  totalEarned: number;          // Renamed from totalLost (now positive)
}

// ============================================================
// Auth Types
// ============================================================

export type AuthProvider = 'apple' | 'google' | 'game_center' | 'play_games';

export interface AuthState {
  isAuthenticated: boolean;
  userId: string | null;
  email: string | null;
  shopName: string | null;
  provider: AuthProvider | null;
}

// ============================================================
// IAP Types
// ============================================================

export type IAPCategory =
  | 'decoration_pack'
  | 'custom_recipe'
  | 'ingredient_skin'
  | 'avatar_customization'
  | 'shop_theme_music';

export interface IAPProduct {
  productId: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  category: IAPCategory;
}

export interface IAPPurchaseResult {
  success: boolean;
  productId: string;
  transactionId?: string;
  error?: string;
}
