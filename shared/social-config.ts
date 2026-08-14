/**
 * Boba Dash — Social System Configuration
 * 4 mechanisms: Taste Test / Cover Shift / Leaderboard / Custom Recipes
 *
 * Friend slots: fixed 5 free (no paid expansion)
 */

// ============================================================
// Taste Test — visit a friend's shop and taste a free boba
// Positive framing: "taste test" implies free sample, mutually beneficial
// ============================================================

export const TASTE_TEST_CONFIG = {
  // Earnings split (based on taster's tier, prevents cross-tier arbitrage)
  //   Taster gets 35% of drink price
  //   Shop owner gets 20% (positive framing: "brand exposure reward")
  //   System subsidizes 45% (total = 100% of price)
  tasterGainRate: 0.35,       // Taster gets 35% of drink price
  tastedGainRate: 0.20,       // Shop owner gets 20%
  systemSubsidyRate: 0.45,    // System subsidizes 45%

  // Daily limits
  dailyMax: 5,                  // Max 5 taste tests per day
  dailyMaxPerFriend: 1,         // Max 1 taste test per friend per day

  // Custom recipe chance (30% chance the drink is a friend's custom recipe)
  customRecipeChance: 0.30,

  // Display strings (used by RN UI)
  displayName: 'Taste Test',
  displayVerb: 'taste',
  ctaText: 'Taste Test',
  resultText: 'You tasted a cup of {drink} from {shop}!',
  signatureText: "It's {shop}'s signature recipe: {recipe}!",
} as const;

// ============================================================
// Cover Shift (Help Watch) — 帮忙看店
// (unchanged — "help" concept is positive in both cultures)
// ============================================================

export const HELP_CONFIG = {
  // Earnings split
  helperGainRate: 0.15,        // Helper gets 15% of drink price
  ownerGainRate: 0.70,         // Shop owner gets 70%
  systemSubsidyRate: 0.85,     // System subsidizes 85% (total = 100% of price + bonus)

  // Daily limits
  dailyMax: 4,                  // Max 4 helps per day
  dailyMaxPerFriend: 1,         // Max 1 help per friend per day
} as const;

// ============================================================
// Friend Slots (fixed 5 free, no paid expansion)
// ============================================================

export const FRIEND_SLOTS_CONFIG = {
  freeMax: 5,           // 5 free friend slots
  paidMax: 5,           // Same as free (no expansion in overseas version)
  expansionEnabled: false,
} as const;

// ============================================================
// Leaderboard Configuration
// v2.0: Dual-mode — native (Game Center / Play Games) as primary,
//        Supabase as fallback for cross-platform friend circles
// ============================================================

export const LEADERBOARD_CONFIG = {
  categories: ['income', 'combo', 'decoration'] as const,

  // Native leaderboard IDs (Apple Game Center / Google Play Games)
  nativeLeaderboardIds: {
    income:      'boba_weekly_income',
    combo:       'boba_max_combo',
    decoration:  'boba_decoration_score',
  },

  // Supabase fallback (for friends on different platforms)
  supabaseFallback: true,
  resetDay: 1,           // Monday
  resetHour: 4,          // 4:00 AM UTC
  topN: 20,              // Show top 20
  rewards: {
    1: { badge: 'Star Shop',     coins: 500 },
    2: { badge: 'Runner-up',     coins: 300 },
    3: { badge: 'Third Place',   coins: 200 },
  } as const,
} as const;

// ============================================================
// Native Social Platform Configuration (NEW v2.0)
// Apple Game Center + Google Play Games Services
// ============================================================

export const NATIVE_SOCIAL_CONFIG = {
  // Apple Game Center
  gameCenter: {
    enabled: true,
    // Leaderboard IDs must match App Store Connect configuration
    leaderboardIds: {
      income:      'boba_weekly_income',
      combo:       'boba_max_combo',
      decoration:  'boba_decoration_score',
    },
    // Achievement IDs (for future expansion)
    achievementIds: {
      firstServe:    'boba_first_serve',
      level10:       'boba_level_10',
      level50:       'boba_level_50',
      level100:      'boba_level_100',
      firstTaste:    'boba_first_taste_test',
      firstCover:    'boba_first_cover_shift',
      hundredServed: 'boba_100_served',
    },
  },

  // Google Play Games Services
  playGames: {
    enabled: true,
    // Leaderboard IDs must match Google Play Console configuration
    leaderboardIds: {
      income:      'CgkI_boba_weekly_income',
      combo:       'CgkI_boba_max_combo',
      decoration:  'CgkI_boba_decoration_score',
    },
    // Achievement IDs
    achievementIds: {
      firstServe:    'CgkI_boba_first_serve',
      level10:       'CgkI_boba_level_10',
      level50:       'CgkI_boba_level_50',
      level100:      'CgkI_boba_level_100',
      firstTaste:    'CgkI_boba_first_taste_test',
      firstCover:    'CgkI_boba_first_cover_shift',
      hundredServed: 'CgkI_boba_100_served',
    },
  },

  // Social Sharing (Instagram Stories + TikTok)
  sharing: {
    instagramStories: true,
    tiktok: true,
    systemShareSheet: true,  // Fallback: iMessage, WhatsApp, etc.
    generateShareCard: true, // Generate Canvas-based share image
  },
} as const;

// ============================================================
// Offline Delivery (generated while away)
// ============================================================

export const OFFLINE_DELIVERY_CONFIG = {
  maxPerOffline: 2,           // Max 2 deliveries generated while offline
  hoursPerDelivery: 2,         // 1 delivery per 2 hours offline
} as const;

// ============================================================
// Tier Average Prices (for social earning calculations)
// ============================================================

export const TIER_AVG_PRICES: Record<number, number> = {
  1: 18,
  2: 25,
  3: 37,
  4: 55,
  5: 80,
};

// ============================================================
// Tier Multipliers (used by Taste Test earnings calculation)
// ============================================================

export const TIER_MULTIPLIERS: Record<number, number> = {
  1: 1.0,   // Level 1-10
  2: 1.5,   // Level 11-25
  3: 2.0,   // Level 26-50
  4: 3.0,   // Level 51-80
  5: 4.0,   // Level 81+
};

// ============================================================
// Helper: Calculate Taste Test earnings (v2.0 — renamed from calculateFreeloadEarnings)
// ============================================================

export function calculateTasteTestEarnings(drinkPrice: number, tasterTier: number): {
  tasterGain: number;
  tastedGain: number;
  systemSubsidy: number;
} {
  const base = drinkPrice;
  return {
    tasterGain: Math.round(base * TASTE_TEST_CONFIG.tasterGainRate),
    tastedGain: Math.round(base * TASTE_TEST_CONFIG.tastedGainRate),
    systemSubsidy: Math.round(base * TASTE_TEST_CONFIG.systemSubsidyRate),
  };
}

// Backward compatibility alias
export const calculateFreeloadEarnings = calculateTasteTestEarnings;

// ============================================================
// Helper: Calculate help earnings (unchanged)
// ============================================================

export function calculateHelpEarnings(drinkPrice: number): {
  helperGain: number;
  ownerGain: number;
  systemSubsidy: number;
} {
  const base = drinkPrice;
  return {
    helperGain: Math.round(base * HELP_CONFIG.helperGainRate),
    ownerGain: Math.round(base * HELP_CONFIG.ownerGainRate),
    systemSubsidy: Math.round(base * HELP_CONFIG.systemSubsidyRate),
  };
}

// ============================================================
// Helper: Get tier from level
// ============================================================

export function getTierFromLevel(level: number): number {
  if (level <= 10) return 1;
  if (level <= 25) return 2;
  if (level <= 50) return 3;
  if (level <= 80) return 4;
  return 5;
}
