/**
 * Boba Dash — Offline-First Storage Abstraction
 *
 * Design: Game always saves locally first (AsyncStorage).
 * When user is authenticated (online mode), data syncs to Supabase.
 * The game never blocks on network — it's always playable offline.
 *
 * Flow:
 * 1. App starts → load from AsyncStorage (instant, offline)
 * 2. If authenticated → merge cloud save (newer wins by lastSyncedAt)
 * 3. On save → write to AsyncStorage immediately, queue cloud sync
 * 4. If online → sync to Supabase in background
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import type { SaveData, AuthState } from '@shared/types';

// ============================================================
// Constants
// ============================================================

const STORAGE_KEY = 'boba_dash_save';
const AUTH_KEY = 'boba_dash_auth';

// ============================================================
// Default Save Data
// ============================================================

export function getDefaultSave(): SaveData {
  return {
    coins: 100,
    level: 1,
    currentTier: 1,
    maxCombo: 0,
    totalIncome: 0,
    totalServed: 0,
    unlockedDrinks: [1, 2, 3, 4],
    decorations: [],
    decorationValue: 0,
    ingredients: {
      black_tea: 10,
      green_tea: 10,
      oolong: 10,
      jasmine: 10,
      thai_tea: 10,
    },
    lastSyncedAt: null,
    weeklyStats: {
      weekStart: getWeekStart(),
      totalIncome: 0,
      maxCombo: 0,
      decorationValue: 0,
    },
    createdAt: Date.now(),
  };
}

export function getWeekStart(): string {
  const now = new Date();
  const day = now.getDay() || 7;
  const monday = new Date(now);
  monday.setDate(now.getDate() - day + 1);
  monday.setHours(0, 0, 0, 0);
  return monday.toISOString().slice(0, 10);
}

// ============================================================
// Local Storage (AsyncStorage wrapper)
// ============================================================

export const localStore = {
  async load(): Promise<SaveData> {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      if (!raw) return getDefaultSave();
      const data = JSON.parse(raw) as SaveData;
      // Merge with defaults to handle missing fields from older versions
      return { ...getDefaultSave(), ...data };
    } catch (e) {
      console.error('[Storage] load failed:', e);
      return getDefaultSave();
    }
  },

  async save(data: SaveData): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.error('[Storage] save failed:', e);
    }
  },

  async update(patch: Partial<SaveData>): Promise<SaveData> {
    const current = await this.load();
    const merged = { ...current, ...patch };
    await this.save(merged);
    return merged;
  },

  async reset(): Promise<void> {
    await AsyncStorage.removeItem(STORAGE_KEY);
  },
};

// ============================================================
// Auth State (persisted locally)
// ============================================================

export const authStore = {
  async load(): Promise<AuthState> {
    try {
      const raw = await AsyncStorage.getItem(AUTH_KEY);
      if (!raw) {
        return {
          isAuthenticated: false,
          userId: null,
          email: null,
          shopName: null,
          provider: null,
        };
      }
      return JSON.parse(raw) as AuthState;
    } catch {
      return {
        isAuthenticated: false,
        userId: null,
        email: null,
        shopName: null,
        provider: null,
      };
    }
  },

  async save(state: AuthState): Promise<void> {
    await AsyncStorage.setItem(AUTH_KEY, JSON.stringify(state));
  },

  async clear(): Promise<void> {
    await AsyncStorage.removeItem(AUTH_KEY);
  },
};

// ============================================================
// Hybrid Storage (Local + Cloud Sync)
// ============================================================

/**
 * The main storage interface used by the app.
 * - Offline mode: only reads/writes to AsyncStorage
 * - Online mode: reads from AsyncStorage + syncs to Supabase
 *
 * The game WebView always interacts through this layer via Bridge messages.
 */
export class HybridStorage {
  private cloudSyncEnabled = false;
  private supabaseClient: any = null; // Set when authenticated
  private pendingSync = false;

  /**
   * Enable cloud sync (called after successful authentication)
   */
  enableCloudSync(supabaseClient: any): void {
    this.cloudSyncEnabled = true;
    this.supabaseClient = supabaseClient;
  }

  /**
   * Disable cloud sync (called on logout)
   */
  disableCloudSync(): void {
    this.cloudSyncEnabled = false;
    this.supabaseClient = null;
  }

  isOnline(): boolean {
    return this.cloudSyncEnabled && this.supabaseClient !== null;
  }

  /**
   * Load save data — always from local first, merge cloud if available
   */
  async load(): Promise<SaveData> {
    const localData = await localStore.load();

    if (!this.isOnline()) {
      return localData;
    }

    // Try to merge with cloud data
    try {
      const cloudData = await this.fetchCloudSave();
      if (cloudData) {
        return this.mergeSaves(localData, cloudData);
      }
    } catch (e) {
      console.warn('[HybridStorage] cloud fetch failed, using local:', e);
    }

    return localData;
  }

  /**
   * Save data — always write local first, sync cloud in background
   */
  async save(data: SaveData): Promise<void> {
    // 1. Save locally (instant, non-blocking)
    await localStore.save(data);

    // 2. Sync to cloud if online (non-blocking)
    if (this.isOnline() && !this.pendingSync) {
      this.pendingSync = true;
      this.syncToCloud(data).finally(() => {
        this.pendingSync = false;
      });
    }
  }

  /**
   * Update partial save data
   */
  async update(patch: Partial<SaveData>): Promise<SaveData> {
    const current = await localStore.load();
    const merged = { ...current, ...patch };
    await this.save(merged);
    return merged;
  }

  // ============================================================
  // Cloud Sync (Supabase)
  // ============================================================

  private async fetchCloudSave(): Promise<SaveData | null> {
    if (!this.supabaseClient) return null;

    const { data, error } = await this.supabaseClient
      .from('users')
      .select('coins, level, current_tier, weekly_income, weekly_max_combo, weekly_decoration_value, decoration_value, shop_name, updated_at')
      .single();

    if (error || !data) return null;

    // Convert cloud row to SaveData format
    const localData = await localStore.load();
    return {
      ...localData,
      coins: data.coins ?? localData.coins,
      level: data.level ?? localData.level,
      currentTier: data.current_tier ?? localData.currentTier,
      decorationValue: data.decoration_value ?? localData.decorationValue,
      shopName: data.shop_name ?? localData.shopName,
      weeklyStats: {
        ...localData.weeklyStats,
        totalIncome: data.weekly_income ?? 0,
        maxCombo: data.weekly_max_combo ?? 0,
        decorationValue: data.weekly_decoration_value ?? 0,
      },
      lastSyncedAt: data.updated_at ?? null,
    };
  }

  private async syncToCloud(data: SaveData): Promise<void> {
    if (!this.supabaseClient) return;

    const { error } = await this.supabaseClient
      .from('users')
      .update({
        coins: data.coins,
        level: data.level,
        current_tier: data.currentTier,
        weekly_income: data.weeklyStats.totalIncome,
        weekly_max_combo: data.weeklyStats.maxCombo,
        weekly_decoration_value: data.weeklyStats.decorationValue,
        decoration_value: data.decorationValue,
        last_online_at: new Date().toISOString(),
        status: 'active',
      })
      .eq('id', this.supabaseClient.auth.getUser()?.id);

    if (error) {
      console.warn('[HybridStorage] cloud sync failed:', error.message);
    } else {
      await localStore.update({ lastSyncedAt: new Date().toISOString() });
    }
  }

  /**
   * Merge local and cloud saves — newer wins by timestamp
   */
  private mergeSaves(local: SaveData, cloud: SaveData): SaveData {
    // Simple strategy: take the higher values (coins, level, etc.)
    // This prevents regression when switching devices
    return {
      ...local,
      coins: Math.max(local.coins, cloud.coins),
      level: Math.max(local.level, cloud.level),
      currentTier: Math.max(local.currentTier, cloud.currentTier),
      maxCombo: Math.max(local.maxCombo, cloud.maxCombo),
      totalIncome: Math.max(local.totalIncome, cloud.totalIncome),
      totalServed: Math.max(local.totalServed, cloud.totalServed),
      decorationValue: Math.max(local.decorationValue, cloud.decorationValue),
      weeklyStats: {
        weekStart: local.weeklyStats.weekStart,
        totalIncome: Math.max(local.weeklyStats.totalIncome, cloud.weeklyStats?.totalIncome ?? 0),
        maxCombo: Math.max(local.weeklyStats.maxCombo, cloud.weeklyStats?.maxCombo ?? 0),
        decorationValue: Math.max(local.weeklyStats.decorationValue, cloud.weeklyStats?.decorationValue ?? 0),
      },
      // Merge unlocked drinks (union)
      unlockedDrinks: [...new Set([...local.unlockedDrinks, ...(cloud.unlockedDrinks || [])])],
      // Merge decorations (union)
      decorations: [...new Set([...local.decorations, ...(cloud.decorations || [])])],
      lastSyncedAt: new Date().toISOString(),
      shopName: cloud.shopName || local.shopName,
    };
  }

  /**
   * Force sync (pull from cloud)
   */
  async forcePullFromCloud(): Promise<SaveData | null> {
    if (!this.isOnline()) return null;
    const cloudData = await this.fetchCloudSave();
    if (cloudData) {
      await localStore.save(cloudData);
      return cloudData;
    }
    return null;
  }

  /**
   * Force sync (push to cloud)
   */
  async forcePushToCloud(): Promise<boolean> {
    if (!this.isOnline()) return false;
    const data = await localStore.load();
    await this.syncToCloud(data);
    return true;
  }
}

// ============================================================
// Singleton
// ============================================================

export const hybridStorage = new HybridStorage();

// ============================================================
// Save Data Helpers (ported from CN version storage.js)
// ============================================================

export async function recordLevelComplete(reward: { coins: number; exp: number }): Promise<SaveData> {
  const data = await hybridStorage.load();
  data.coins += reward.coins || 0;
  data.totalIncome += reward.coins || 0;
  data.totalServed += 1;
  data.weeklyStats.totalIncome += reward.coins || 0;

  // Check if new week started
  if (data.weeklyStats.weekStart !== getWeekStart()) {
    data.weeklyStats = {
      weekStart: getWeekStart(),
      totalIncome: reward.coins || 0,
      maxCombo: 0,
      decorationValue: data.decorationValue,
    };
  }

  await hybridStorage.save(data);
  return data;
}

export async function updateMaxCombo(combo: number): Promise<void> {
  const data = await hybridStorage.load();
  if (combo > data.maxCombo) data.maxCombo = combo;
  if (combo > data.weeklyStats.maxCombo) data.weeklyStats.maxCombo = combo;
  await hybridStorage.save(data);
}

export async function unlockDrink(drinkId: number): Promise<void> {
  const data = await hybridStorage.load();
  if (!data.unlockedDrinks.includes(drinkId)) {
    data.unlockedDrinks.push(drinkId);
    await hybridStorage.save(data);
  }
}

export async function consumeIngredient(baseId: string, count: number): Promise<boolean> {
  const data = await hybridStorage.load();
  if (!data.ingredients[baseId] || data.ingredients[baseId] < count) return false;
  data.ingredients[baseId] -= count;
  await hybridStorage.save(data);
  return true;
}

export async function buyIngredient(baseId: string, count: number, cost: number): Promise<boolean> {
  const data = await hybridStorage.load();
  if (data.coins < cost) return false;
  data.coins -= cost;
  data.ingredients[baseId] = (data.ingredients[baseId] || 0) + count;
  await hybridStorage.save(data);
  return true;
}
