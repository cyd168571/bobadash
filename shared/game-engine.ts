/**
 * Boba Dash — Game Engine (Core Logic)
 * 95% reused from CN version H5 prototype
 * Production step: Glass → Base → Flavor → Topping → Blend → Serve
 */

import type { GameState, Customer, DeliveryOrder, Workbench, Level, Drink } from './types';
import { getRandomDrinkByTier, AVATARS } from './drink-data';
import { getLevel, getLevelReward } from './level-data';

// ============================================================
// Game State Factory
// ============================================================

export function createGameState(level: number): GameState {
  const lv = getLevel(level);
  return {
    level,
    levelData: lv,
    coins: 0,
    combo: 0,
    maxCombo: 0,
    served: 0,
    failed: 0,
    timeLeft: lv.time * 1000,
    customers: [],
    deliveryOrders: [],
    currentOrder: null,
    workbench: { glass: null, base: null, flavor: null, topping: null, isBlending: false },
    step: 0,
    isGameOver: false,
    isPaused: false,
  };
}

// ============================================================
// Customer System
// ============================================================

export function spawnCustomer(tier: number): Customer {
  const drink = getRandomDrinkByTier(tier);
  const avatar = AVATARS[Math.floor(Math.random() * AVATARS.length)];
  return {
    id: `c_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    avatar,
    drink,
    patience: 100,
    patienceMax: 100,
    isVIP: Math.random() < 0.1,
    arrivedAt: Date.now(),
  };
}

export function tickCustomers(state: GameState, deltaTime: number): void {
  const patienceDecay = (100 / (state.levelData.time * 1000)) * deltaTime;
  state.customers = state.customers.filter((c) => {
    c.patience -= patienceDecay;
    if (c.patience <= 0) {
      c.patience = 0;
      state.failed++;
      state.combo = 0;
      return false;
    }
    return true;
  });
}

// ============================================================
// Delivery System
// ============================================================

export function spawnDeliveryOrder(tier: number): DeliveryOrder {
  const drink = getRandomDrinkByTier(tier);
  return {
    id: `d_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    drink,
    timeLeft: 30 * 1000,
    timeMax: 30 * 1000,
  };
}

export function tickDeliveries(state: GameState, deltaTime: number): void {
  const before = state.deliveryOrders.length;
  state.deliveryOrders = state.deliveryOrders.filter((d) => {
    d.timeLeft -= deltaTime;
    if (d.timeLeft <= 0) {
      state.failed++;
      state.combo = 0;
      return false;
    }
    return true;
  });
}

// ============================================================
// Crafting System (step-based)
// ============================================================

export function selectGlass(state: GameState, glassId: string): boolean {
  if (state.step !== 0) return false;
  state.workbench.glass = glassId;
  state.step = 1;
  return true;
}

export function selectBase(state: GameState, baseId: string): boolean {
  if (state.step !== 1) return false;
  state.workbench.base = baseId;
  state.step = 2;
  return true;
}

export function selectFlavor(state: GameState, flavorId: string): boolean {
  if (state.step !== 2) return false;
  state.workbench.flavor = flavorId;
  state.step = 3;
  return true;
}

export function selectTopping(state: GameState, toppingId: string): boolean {
  if (state.step !== 3) return false;
  state.workbench.topping = toppingId;
  state.step = 4;
  return true;
}

export function startBlend(state: GameState): boolean {
  if (state.step !== 4) return false;
  state.workbench.isBlending = true;
  return true;
}

export function finishBlend(state: GameState): void {
  state.workbench.isBlending = false;
  state.step = 5;
}

// ============================================================
// Serve System
// ============================================================

function checkMatch(wb: Workbench, drink: Drink | undefined): boolean {
  if (!drink) return false;
  return (
    wb.glass === drink.glass &&
    wb.base === drink.base &&
    wb.flavor === drink.flavor &&
    wb.topping === drink.topping
  );
}

export function serveCustomer(
  state: GameState,
  customerId: string,
): { success: boolean; reward?: number; combo?: number; reason?: string } {
  if (state.step !== 5) return { success: false, reason: 'not_ready' };
  const customer = state.customers.find((c) => c.id === customerId);
  if (!customer) return { success: false, reason: 'no_customer' };

  if (checkMatch(state.workbench, customer.drink)) {
    const patienceBonus = Math.round(customer.drink.price * (customer.patience / 100));
    const comboBonus = state.combo * 2;
    const tip = customer.isVIP ? 5 : 0;
    const reward = customer.drink.price + comboBonus + tip;
    state.coins += reward;
    state.combo++;
    if (state.combo > state.maxCombo) state.maxCombo = state.combo;
    state.served++;
    state.customers = state.customers.filter((c) => c.id !== customerId);
    resetWorkbench(state);
    return { success: true, reward, combo: state.combo };
  } else {
    state.combo = 0;
    resetWorkbench(state);
    return { success: false, reason: 'wrong_recipe' };
  }
}

export function serveDelivery(
  state: GameState,
  deliveryId: string,
): { success: boolean; reward?: number; combo?: number; reason?: string } {
  if (state.step !== 5) return { success: false, reason: 'not_ready' };
  const order = state.deliveryOrders.find((d) => d.id === deliveryId);
  if (!order) return { success: false, reason: 'no_order' };

  if (checkMatch(state.workbench, order.drink)) {
    const reward = Math.round(order.drink.price * 1.8);
    state.coins += reward;
    state.combo++;
    if (state.combo > state.maxCombo) state.maxCombo = state.combo;
    state.served++;
    state.deliveryOrders = state.deliveryOrders.filter((d) => d.id !== deliveryId);
    resetWorkbench(state);
    return { success: true, reward, combo: state.combo };
  } else {
    state.combo = 0;
    resetWorkbench(state);
    return { success: false, reason: 'wrong_recipe' };
  }
}

export function resetWorkbench(state: GameState): void {
  state.workbench = { glass: null, base: null, flavor: null, topping: null, isBlending: false };
  state.step = 0;
}

export function trashWorkbench(state: GameState): void {
  resetWorkbench(state);
  state.combo = 0;
}

// ============================================================
// Game Tick (main loop)
// ============================================================

export function tick(state: GameState, deltaTime: number): void {
  if (state.isGameOver || state.isPaused) return;

  state.timeLeft -= deltaTime;
  if (state.timeLeft <= 0) {
    state.timeLeft = 0;
    state.isGameOver = true;
    return;
  }

  tickCustomers(state, deltaTime);
  tickDeliveries(state, deltaTime);

  // Spawn new customers
  const lv = state.levelData;
  if (state.customers.length < lv.custMax) {
    const spawnRate = 0.3 + (lv.tier - 1) * 0.1;
    if (Math.random() < spawnRate * (deltaTime / 1000)) {
      state.customers.push(spawnCustomer(lv.tier));
    }
  }

  // Spawn delivery orders
  if (lv.delivery && state.deliveryOrders.length < 2) {
    if (Math.random() < 0.15 * (deltaTime / 1000)) {
      state.deliveryOrders.push(spawnDeliveryOrder(lv.tier));
    }
  }
}

// ============================================================
// Game Finish (settlement)
// ============================================================

export function finishGame(state: GameState): {
  passed: boolean;
  served: number;
  failed: number;
  coins: number;
  maxCombo: number;
  reward: ReturnType<typeof getLevelReward>;
} {
  const reward = getLevelReward(state.level);
  const passed = state.served >= 3;
  return {
    passed,
    served: state.served,
    failed: state.failed,
    coins: state.coins,
    maxCombo: state.maxCombo,
    reward,
  };
}
