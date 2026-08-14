/**
 * Boba Dash — Drink Data Module
 * 5 bases × 10 flavors × 8 toppings × 4 glasses = 1600 possible combinations
 * Fisher-Yates seeded shuffle generates 1000 deterministic drink recipes
 *
 * Ported from CN version, adapted for Bubble Tea (EN names)
 */

import type { Base, Flavor, Topping, Glass, Drink } from './types';

// ============================================================
// Data Definitions (Bubble Tea themed for overseas market)
// ============================================================

export const BASES: Base[] = [
  { id: 'black_tea',   name: 'Black Tea',   color: '#C8A87C', icon: '🫖' },
  { id: 'green_tea',  name: 'Green Tea',   color: '#A8C8A0', icon: '🍵' },
  { id: 'oolong',     name: 'Oolong',      color: '#D4A868', icon: '🫗' },
  { id: 'jasmine',    name: 'Jasmine',     color: '#E8D8B0', icon: '🌼' },
  { id: 'thai_tea',    name: 'Thai Tea',    color: '#E8941A', icon: '🧡' },
];

export const FLAVORS: Flavor[] = [
  { id: 'strawberry',   name: 'Strawberry',   color: '#FF6B9D', icon: '🍓' },
  { id: 'chocolate',   name: 'Chocolate',    color: '#8B5E3C', icon: '🍫' },
  { id: 'mango',        name: 'Mango',         color: '#FFB627', icon: '🥭' },
  { id: 'matcha',       name: 'Matcha',       color: '#7FB069', icon: '🍵' },
  { id: 'blueberry',    name: 'Blueberry',    color: '#7B68EE', icon: '🫐' },
  { id: 'taro',         name: 'Taro',          color: '#D4A8C8', icon: '🪔' },
  { id: 'coffee',       name: 'Coffee',        color: '#6F4E37', icon: '☕' },
  { id: 'mint',         name: 'Mint',          color: '#98FF98', icon: '🌿' },
  { id: 'lychee',       name: 'Lychee',        color: '#FFB6C1', icon: '🍇' },
  { id: 'passionfruit', name: 'Passion Fruit', color: '#FFB300', icon: '🥝' },
];

export const TOPPINGS: Topping[] = [
  { id: 'tapioca',     name: 'Tapioca Pearls',  icon: '🟤' },
  { id: 'grass_jelly', name: 'Grass Jelly',      icon: '🟦' },
  { id: 'pudding',     name: 'Pudding',           icon: '🍮' },
  { id: 'coconut',     name: 'Coconut Jelly',     icon: '🥥' },
  { id: 'cream',       name: 'Whipped Cream',     icon: '🍦' },
  { id: 'fruit',       name: 'Fresh Fruit',       icon: '🍓' },
  { id: 'choc_chip',   name: 'Choco Chips',       icon: '🍪' },
  { id: 'marshmallow', name: 'Marshmallow',       icon: '☁️' },
];

export const GLASSES: Glass[] = [
  { id: 'tall',   name: 'Tall Cup',    icon: '🥃', shape: 'tall' },
  { id: 'wide',   name: 'Wide Cup',    icon: '🥂', shape: 'wide' },
  { id: 'goblet', name: 'Goblet',      icon: '🍸', shape: 'goblet' },
  { id: 'mason',  name: 'Mason Jar',   icon: '🥛', shape: 'mason' },
];

export const AVATARS: string[] = [
  '👧', '👦', '👩', '👨', '🧑', '👴', '👵',
  '🐱', '🐶', '🐰', '🐼', '🦊',
];

// ============================================================
// Fisher-Yates Seeded Shuffle
// ============================================================

/**
 * Deterministic shuffle based on seed.
 * Same seed → same result, used for consistent drink pool generation.
 */
export function seededShuffle<T>(arr: T[], seed: number): T[] {
  const a = arr.slice();
  let s = seed;
  for (let i = a.length - 1; i > 0; i--) {
    s = (s * 9301 + 49297) % 233280;
    const j = Math.floor((s / 233280) * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ============================================================
// Tutorial Drinks (first 4 levels, hand-crafted)
// ============================================================

export const TUTORIAL_DRINKS: Drink[] = [
  { id: 1, base: 'black_tea', flavor: 'strawberry', topping: 'tapioca', glass: 'tall',  name: 'Strawberry Boba',     price: 12, cost: 5, tier: 1 },
  { id: 2, base: 'green_tea', flavor: 'matcha',     topping: 'tapioca', glass: 'wide',  name: 'Matcha Boba',         price: 15, cost: 6, tier: 1 },
  { id: 3, base: 'black_tea', flavor: 'chocolate',  topping: 'cream',   glass: 'tall',  name: 'Choco Milk Tea',     price: 14, cost: 5, tier: 1 },
  { id: 4, base: 'thai_tea',  flavor: 'blueberry',  topping: 'pudding', glass: 'tall',  name: 'Blueberry Thai',     price: 16, cost: 6, tier: 1 },
];

// ============================================================
// Generate 1000 Drink Pool (seeded)
// ============================================================

export function generateDrinkPool(seed: number = 42): Drink[] {
  const pool: Drink[] = [];
  let id = 5; // Start after tutorial drinks

  for (const b of BASES) {
    for (const f of FLAVORS) {
      for (const t of TOPPINGS) {
        for (const g of GLASSES) {
          if (id % 2 === 0) {
            const tier = Math.min(5, Math.floor((id - 5) / 200) + 1);
            const price = Math.round(15 + tier * 10 + Math.random() * 5);
            pool.push({
              id,
              base: b.id,
              flavor: f.id,
              topping: t.id,
              glass: g.id,
              name: `${f.name} ${b.name}`,
              price,
              cost: Math.round(price * 0.35),
              tier,
            });
          }
          id++;
          if (pool.length >= 1000) break;
        }
        if (pool.length >= 1000) break;
      }
      if (pool.length >= 1000) break;
    }
    if (pool.length >= 1000) break;
  }

  return [...TUTORIAL_DRINKS, ...pool];
}

// ============================================================
// All Drinks (generated once, exported)
// ============================================================

export const DRINKS: Drink[] = generateDrinkPool(42);

// ============================================================
// Helper Functions
// ============================================================

export function getDrinkById(id: number): Drink | undefined {
  return DRINKS.find((d) => d.id === id);
}

export function getRandomDrinkByTier(tier: number): Drink {
  const pool = DRINKS.filter((d) => d.tier === tier);
  const finalPool = pool.length > 0 ? pool : DRINKS;
  return finalPool[Math.floor(Math.random() * finalPool.length)];
}

export function getDrinkName(drink: Drink | undefined): string {
  if (!drink) return 'Unknown';
  const b = BASES.find((x) => x.id === drink.base);
  const f = FLAVORS.find((x) => x.id === drink.flavor);
  const t = TOPPINGS.find((x) => x.id === drink.topping);
  const parts = [f?.name, b?.name, t?.name].filter(Boolean);
  return parts.join(' ') || 'Unknown Drink';
}

export function getOrderIcons(drink: Drink | undefined): string[] {
  if (!drink) return [];
  const f = FLAVORS.find((x) => x.id === drink.flavor);
  const t = TOPPINGS.find((x) => x.id === drink.topping);
  const icons: string[] = [];
  if (f) icons.push(f.icon);
  if (t) icons.push(t.icon);
  return icons;
}

/** Get the display base color for Canvas rendering */
export function getBaseColor(baseId: string): string {
  return BASES.find((b) => b.id === baseId)?.color || '#C8A87C';
}

/** Get the display flavor color for Canvas rendering */
export function getFlavorColor(flavorId: string): string {
  return FLAVORS.find((f) => f.id === flavorId)?.color || '#FF6B9D';
}
