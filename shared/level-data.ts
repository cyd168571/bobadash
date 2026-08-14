/**
 * Boba Dash — Level Data Module
 * 108 levels: 4 tutorial (hand-crafted) + 104 procedural (5 tier ranges)
 */

import type { Level, LevelReward } from './types';

// ============================================================
// Tutorial Levels (Lv 1-4, hand-crafted)
// ============================================================

export const TUTORIAL_LEVELS: Level[] = [
  { lv: 1, name: 'First Cup',         tier: 1, steps: 3, time: 90, custMax: 1, delivery: false, teach: 'Select Base',        drinkIds: [1] },
  { lv: 2, name: 'Add Flavor',        tier: 1, steps: 3, time: 85, custMax: 1, delivery: false, teach: 'Select Flavor',       drinkIds: [1, 2] },
  { lv: 3, name: 'Top It Off',        tier: 1, steps: 4, time: 80, custMax: 2, delivery: false, teach: 'Select Topping',      drinkIds: [1, 2, 3] },
  { lv: 4, name: 'Delivery Time',    tier: 1, steps: 4, time: 75, custMax: 2, delivery: true,  teach: 'Delivery Dual-Thread', drinkIds: [1, 2, 3, 4] },
];

// ============================================================
// Procedural Level Ranges (5 tiers, ~21 levels each)
// ============================================================

export const TIER_RANGES = [
  { start: 5,   end: 25,  tier: 1, time: 70, custMax: 2, delivery: true,  steps: 4 },
  { start: 26,  end: 47,  tier: 2, time: 65, custMax: 2, delivery: true,  steps: 4 },
  { start: 48,  end: 69,  tier: 3, time: 60, custMax: 3, delivery: true,  steps: 5 },
  { start: 70,  end: 90,  tier: 4, time: 55, custMax: 3, delivery: true,  steps: 6 },
  { start: 91,  end: 108, tier: 5, time: 50, custMax: 4, delivery: true,  steps: 7 },
] as const;

// ============================================================
// Generate All 108 Levels
// ============================================================

export function generateLevels(): Level[] {
  const levels = [...TUTORIAL_LEVELS];
  for (const r of TIER_RANGES) {
    for (let lv = r.start; lv <= r.end; lv++) {
      levels.push({
        lv,
        name: `Level ${lv}`,
        tier: r.tier,
        steps: r.steps,
        time: r.time,
        custMax: r.custMax,
        delivery: r.delivery,
        teach: null,
      });
    }
  }
  return levels;
}

export const LEVELS: Level[] = generateLevels();

// ============================================================
// Helper Functions
// ============================================================

export function getLevel(lv: number): Level {
  return LEVELS.find((l) => l.lv === lv) || LEVELS[0];
}

export function getTierByLevel(lv: number): number {
  if (lv <= 4) return 1;
  for (const r of TIER_RANGES) {
    if (lv >= r.start && lv <= r.end) return r.tier;
  }
  return 5;
}

export function getLevelReward(lv: number): LevelReward {
  const tier = getTierByLevel(lv);
  const baseReward = [0, 20, 30, 45, 65, 90];
  return {
    coins: baseReward[tier] + Math.floor(Math.random() * 10),
    exp: tier * 10,
  };
}

export function getTotalLevels(): number {
  return LEVELS.length; // 108
}
