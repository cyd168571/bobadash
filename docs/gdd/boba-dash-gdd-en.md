# Boba Dash — Game Design Document v1.0

> **Document Status**: Pre-production  
> **Last Updated**: 2026-08-10  
> **Platform**: React Native (Expo) — iOS & Android  
> **Designer**: Paul (Spider-Man)  
> **Category**: Time Management / Cooking Simulation  
> **Positioning**: Bubble Tea / Boba shop game  

---

## Table of Contents

1. [Game Overview](#1-game-overview)
2. [Core Gameplay Loop](#2-core-gameplay-loop)
3. [Bubble Tea Crafting System](#3-bubble-tea-crafting-system)
4. [Customer System](#4-customer-system)
5. [Delivery System](#5-delivery-system)
6. [Economy System](#6-economy-system)
7. [Progression System](#7-progression-system)
8. [Social System](#8-social-system)
9. [Monetization Design](#9-monetization-design)
10. [Art Direction](#10-art-direction)
11. [Technical Architecture](#11-technical-architecture)
12. [Playtest Plan](#12-playtest-plan)
13. [Appendix](#13-appendix)

---

## 1. Game Overview

### 1.1 Fun Hypothesis

> "The core fun of Boba Dash is the **adrenaline rush of multitasking under time pressure** — dine-in customers are queuing, a delivery timer is ticking down, the blender is spinning, and you're trying to remember what topping goes on the next order — all at once. And then you serve a beautiful cup of boba, the customer smiles, and coins go cha-ching into your register."

### 1.2 Design Pillars

| # | Pillar | Acceptance Criteria |
|---|--------|-------------------|
| P1 | **Every cup looks gorgeous** | Players feel the urge to screenshot and share their boba creations. Visual satisfaction is the primary driver, not an afterthought. |
| P2 | **Time pressure creates flow** | Players lose track of real time during a rush hour. Dual-thread operations (dine-in + delivery) are the core tension source. |
| P3 | **1000 recipes drive collection** | Players are curious "what does the next one look like?" when unlocking new recipes. Unlock cadence drives long-term retention. |
| P4 | **Shop decoration creates ownership** | The "my shop" endowment effect drives monetization. Decoration is self-expression, not stat boosting. |
| P5 | **3-minute sessions** | Each level ends with a "one more level" urge. Playable during commute, queue, or lunch break. |

### 1.3 Target Audience

- **Primary**: Casual gamers, female 18-35, who enjoy cooking/restaurant games
- **Secondary**: Boba/bubble tea enthusiasts of all ages
- **Tertiary**: Time management game veterans looking for a fresh twist

### 1.4 Platform & Technical Overview

| Parameter | Value |
|-----------|-------|
| Platform | React Native (Expo) — iOS & Android native app |
| Backend | Supabase (PostgreSQL + Auth + Edge Functions) |
| Rendering | WebView Bridge (Canvas 2D game engine, zero-rewrite from H5 prototype) |
| Payment | Native IAP (Apple StoreKit + Google Play Billing) via RevenueCat |
| Distribution | App Store + Google Play |
| Language | English |
| Session Length | 3-5 minutes per level (one business day) |
| Monetization | 5 tracks, 18 SKUs, zero ads |
| Core Verb | Make — Glass → Base → Flavor → Blend → Topping → Serve |

### 1.5 Competitor Comparison

| Feature | Cooking Fever | Good Pizza Great Pizza | Papa's Freezeria | **Boba Dash** |
|---------|--------------|------------------------|-------------------|---------------|
| Cuisine type | Various | Pizza | Ice cream | **Bubble tea** |
| Recipe count | ~400 | ~50 | ~80 | **1000** |
| Delivery system | No | No | No | **Yes (dual-thread)** |
| Social features | Limited | None | None | **4 async mechanisms** |
| Monetization | Ads + IAP | Ads + IAP | Ads + IAP | **IAP only (zero ads)** |
| Custom recipes | No | No | No | **Yes (modular creation)** |
| Avatar customization | No | No | No | **Yes** |
| Shop music | No | No | No | **Yes** |

**Key differentiators**: Dual-thread delivery tension, 1000 procedurally generated recipes, async social mechanics (Taste Test / Cover Shift), zero ads, avatar & music customization.

---

## 2. Core Gameplay Loop

### 2.1 Layer 1 — Moment-to-Moment (0-30 seconds)

| Step | Player Action | Feedback | Reward |
|------|--------------|----------|--------|
| Customer orders | See speech bubble with desired boba | Bubble pop + ding sound | — |
| Select glass | Tap the corresponding glass type | Glass slides to workstation | — |
| Add base | Tap/drag base ingredient | Liquid pours into glass + pour sound | — |
| Add flavor | Tap/drag flavor ingredient | Color change + blend animation | — |
| Blend | Long-press blend button (~1.5s) | Blender spins + humming sound | — |
| Add topping | Tap/drag topping ingredient | Topping stacks + visual satisfaction | — |
| Serve | Drag finished drink to customer | Customer happy face + coins fly in | Coins + tips |

**Cycle time**: Simple boba ~5-8s, complex boba ~10-15s (PLACEHOLDER — needs playtest).  
**Combo**: Consecutive perfect serves (fast + correct) trigger combo, tip multiplier x1.5 → x2 → x3. Breaking the combo resets to x1.0.

### 2.2 Layer 2 — Session Loop (3-5 minutes / one business day)

| Phase | Content | Duration |
|-------|---------|----------|
| Prep | Check ingredient inventory, optional restocking | ~10s |
| Rush Hour | Customers arrive progressively + delivery calls come in. Arrival frequency increases over time. | ~2.5-4min |
| Settlement | Show: total income, tips, max combo, customers served, star rating (1-3) | ~15s |
| Shop | Buy ingredients / unlock recipes / upgrade equipment / purchase decorations | Free time |

**Session output**: Early game ~100-200 coins, mid game ~200-400, late game ~400-700 (all PLACEHOLDER).  
**End-of-level hook**: Settlement page shows "Tomorrow unlocks: [Recipe Name]" — creates "one more level" urge.

### 2.3 Layer 3 — Long-term Loop (days to weeks)

| Progression | Content | Motivation |
|-------------|---------|------------|
| Unlock recipes | 108 levels (4 tutorial + 104 procedural), 1000 total recipes | Collection drive + curiosity |
| Upgrade equipment | Blender speed, fridge capacity, workstation count | Efficiency satisfaction |
| Decorate shop | Wallpaper, flooring, furniture, lighting, outdoor signage | Ownership + self-expression |
| Challenge mode | Endless mode + daily challenges after campaign completion | Self-challenge + ranking |

### 2.4 Combo System & Risk/Reward

| Combo Count | Tip Multiplier | Visual Feedback |
|-------------|---------------|-----------------|
| 1-2 | x1.0 (base) | Normal coins |
| 3-5 | x1.5 | Coins + combo number popup |
| 6-9 | x2.0 | Gold coins + screen flash |
| 10+ | x3.0 | Rainbow coins + haptic + "COMBO!" text |

**Break conditions**: Customer patience runs out / wrong drink served / delivery timeout.  
**Design intent**: Combo is the core income source for skilled players. Free players can earn enough through combos to unlock all content without paying.

---

## 3. Bubble Tea Crafting System

### 3.1 Modular Design

> **Key design decision**: 1000 boba recipes are NOT handcrafted. We use a modular component system — 5 Bases × 10 Flavors × 8 Toppings × 4 Glasses = 1600 possible combinations. A **Fisher-Yates seeded shuffle algorithm** selects 1000 as the in-game recipe pool. Art only needs ~35 layered sprite assets to render all 1000 unique-looking drinks.

> **Customer orders are fully random**: The game does not maintain a fixed recipe list. Customer orders are randomly drawn from the current Tier's available recipe pool. Each game session uses a fixed seed (based on player ID + level number), ensuring the same player sees the same recipe pool when replaying the same level, but different players see different pools.

### 3.2 Fisher-Yates Seeded Shuffle Algorithm

**Algorithm flow**:
1. Generate all 1600 modular combinations (5×10×8×4)
2. Initialize PRNG with player seed (playerId + levelSeed)
3. Execute Fisher-Yates shuffle on the 1600 combinations
4. Take the first 1000 as the player's available recipe pool
5. Distribute by Tier: Tier 1 (1-200), Tier 2 (201-400), Tier 3 (401-600), Tier 4 (601-800), Tier 5 (801-1000)

*Fixed seed ensures: same player sees same recipe pool when replaying a level; different players see different pools (increases social conversation value).*

### 3.3 Modular Component Table

| Component | Count | Options | Art Assets |
|-----------|-------|---------|------------|
| **Base** | 5 | Black Tea, Green Tea, Oolong, Jasmine, Thai Tea | 5 liquid color sprites |
| **Flavor** | 10 | Taro, Matcha, Strawberry, Chocolate, Mango, Blueberry, Honeydew, Brown Sugar, Lychee, Lavender | 10 color modifier layers |
| **Topping** | 8 | Tapioca Pearls (Boba), Grass Jelly, Pudding, Aloe Vera, Coconut Jelly, Cheese Foam, Red Bean, Oreo Crumbs | 8 topping sprites |
| **Glass** | 4 | Classic Cup, Mason Jar, Bottle, Giant Cup | 4 glass outlines |

**Total art assets**: 5 + 10 + 8 + 4 = **27 core sprites** (plus foam layer, straw, decorations ≈ 35 total). NOT 1000 individual illustrations.

### 3.4 Recipe Data Structure (JSON)

```json
{
  "id": "drink_001",
  "name": "Strawberry Milk Tea",
  "base": "black_tea",
  "flavor": "strawberry",
  "topping": "tapioca_pearls",
  "glass": "classic_cup",
  "tier": 1,
  "steps": ["glass", "base", "flavor", "blend", "topping"],
  "ingredient_cost": 7,
  "sell_price": 18,
  "unlock_level": 1,
  "description": "Classic strawberry boba, sweet & creamy"
}
```

### 3.5 Difficulty Tiers (5 levels)

| Tier | Recipe # | Steps | Customer Patience | Customers/Level | Delivery |
|------|----------|-------|-------------------|-----------------|----------|
| Tier 1 | 1-200 | 3-4 steps | 60s | 8-12 | None |
| Tier 2 | 201-400 | 4-5 steps | 55s | 12-16 | Optional |
| Tier 3 | 401-600 | 5-6 steps | 50s | 16-20 | 1 concurrent |
| Tier 4 | 601-800 | 6-7 steps | 45s | 20-24 | 2 concurrent |
| Tier 5 | 801-1000 | 7-8 steps | 40s | 24-30 | 2+ concurrent |

*All timing values are PLACEHOLDER — need playtest validation. Verification path: run 5-person paper test, observe when players start making errors, adjust patience and arrival frequency accordingly.*

### 3.6 Visual Layering (6-layer Canvas 2D rendering)

```
Layer 1: Glass outline (4 types)
Layer 2: Liquid color (base color + flavor color blend)
Layer 3: Liquid surface ripple/foam
Layer 4: Topping sprite (8 types)
Layer 5: Decorations (straw, mint leaf, umbrella pick, etc.)
Layer 6: Glass highlight/reflection
```

Each boba = 6 sprite layers composited. Canvas 2D is sufficient — no WebGL needed.

---

## 4. Customer System

### 4.1 Customer Types

| Type | Appears At | Characteristics | Design Intent |
|------|-----------|-----------------|----------------|
| Regular | All levels | Orders 1 drink, normal patience | Base economy source |
| Impatient | Tier 2+ | Patience -30%, tips +50% | High-risk high-reward decisions |
| Big Order | Tier 3+ | Orders 2 drinks simultaneously, normal patience | Workstation occupancy pressure |
| VIP | Random | Orders limited-edition recipe, tips x3, patience -20% | Rare reward event, screenshot/share hook |
| Delivery | Tier 2+ | Phone call, time-limited delivery | Core tension mechanism (see Chapter 5) |

### 4.2 Patience System

Each customer has a patience bar (heart icons ×3 or progress bar). Patience decreases over time, affected by customer type and difficulty tier.

| Patience Stage | Visual | Serve Reward |
|---------------|--------|-------------|
| Full (green) | Happy face + full hearts | Base price + 100% tip |
| Medium (yellow) | Neutral face + 2 hearts | Base price + 50% tip |
| Low (red) | Anxious face + 1 heart | Base price, no tip |
| Depleted | Angry exit | **-20% price penalty**, combo breaks |

### 4.3 Combo System

See [Section 2.4](#24-combo-system--riskreward).

**Design intent**: Combo is the core income source for skilled free players. A player with perfect execution can earn 2-3x more than a casual player, making all content unlockable without payment.

---

## 5. Delivery System

### 5.1 Core Tension Mechanism

> Delivery is the **core differentiator** that sets Boba Dash apart from standard cooking games. It creates "dual-thread operation" tension — while you're making drinks for dine-in customers, a delivery timer is counting down. This is the adrenaline source of the entire session loop.

### 5.2 Delivery Flow

| Stage | Player Action | System Behavior | Time |
|-------|--------------|-----------------|------|
| Ring | — | Phone rings in corner + vibration, shows delivery order + countdown | — |
| Accept | Tap to accept (or ignore, no penalty but lose opportunity) | Countdown starts at 45s (PLACEHOLDER) | 0s |
| Make | Craft the delivery drink (shares workstation with dine-in) | Countdown continues; dine-in customers keep arriving | During crafting |
| Deliver | Drag finished drink to delivery window | Check correctness + time | — |
| Settle | — | Correct + on time: base × 1.8; Correct + late: base × 0.9; Wrong: no income + combo break | — |

### 5.3 Risk/Reward Decision Points

| Decision Point | Player's Dilemma | Design Intent |
|---------------|------------------|---------------|
| Accept delivery? | Delivery pays 1.8x, but must finish in 45s. If 2 dine-in customers are waiting, accepting may cause them to lose patience. | Risk/reward — this is the core "fun" |
| Which first? | Delivery timer at 30s, dine-in patience at 20s. Which to prioritize? | Priority judgment — creates flow state |
| Risk the combo? | Combo x3 is active. Accepting delivery might break it, but delivery pays more. | Loss aversion — combo is sunk cost |

> **Failure signal**: If players in Tier 3+ completely ignore deliveries (accept rate < 20%), the delivery reward doesn't cover the risk. Tuning direction: increase delivery multiplier 1.8 → 2.0, or reduce timeout penalty.

---

## 6. Economy System

### 6.1 Initial Resources

- Starting coins: 500 (PLACEHOLDER)
- Starting base ingredients: 5 types
- Starting recipe unlocks: 5 recipes

### 6.2 Sources (coin inflow)

| Source | Base Value | Multiplier Condition | Notes |
|--------|-----------|---------------------|-------|
| Dine-in orders | 15-90 | Scales by Tier 1-5 | Core stable income |
| Delivery orders | base × 1.8 | Late × 0.9, wrong × 0 | High risk high reward |
| Combo tips | x1.5 - x3.0 | Consecutive perfect serves | Skilled player core income |
| Daily login | 50-200 | Consecutive login bonus | Retention hook |
| Level star bonus | 3 stars = +50% | Per-level service rating | Perfectionist drive |
| Social income | Variable | Taste Test + Cover Shift | 25-35% of total income |

### 6.3 Sinks (coin outflow)

| Sink | Cost Range | Frequency | Notes |
|------|-----------|-----------|-------|
| Ingredient purchase | 2-5 / unit | Every 2-3 levels | Consumable sink, continuous recycling |
| Recipe unlock | 100-300 / recipe | Every 1-2 levels | Progression sink, drives collection |
| Equipment upgrade | 500-2000 / item | Every 5-10 levels | Efficiency boost, large sink |
| Shop decoration | 100-1500 / item | Free | Coin-purchasable decorations |
| Premium decoration | IAP only | Free | Paid sink, no balance impact |

### 6.4 Per-Drink Economics

| Tier | Ingredient Cost | Sell Price | Profit | Margin |
|------|----------------|-----------|--------|--------|
| Tier 1 | 5-8 | 15-20 | 7-15 | ~60% |
| Tier 2 | 8-12 | 20-30 | 8-22 | ~55% |
| Tier 3 | 12-18 | 30-45 | 12-33 | ~55% |
| Tier 4 | 18-25 | 45-65 | 20-47 | ~55% |
| Tier 5 | 25-35 | 65-90 | 30-65 | ~55% |

*Margin deliberately maintained at ~55% to make ingredient purchasing a continuous sink. If margin > 70%, coin inflation risk rises sharply.*

### 6.5 Inflation Risk Analysis

**Risk scenario**: Combo x3 + Delivery x1.8 + VIP x3 stacking → single drink income can reach 16x base. A Tier 5 player triggering this stack earns ~1440 coins per drink, while per-level sinks (ingredients + recipes) are only ~300 coins, net inflow ~1140 coins/level.

**Monitoring metric**: Coins / active player / day. If this value increases >15% for 3 consecutive days, trigger balance correction.

**Tuning levers**: 1) Increase high-tier ingredient costs, 2) Lower combo cap, 3) Add equipment maintenance fee (new sink), 4) Increase VIP frequency but lower tip multiplier.

### 6.6 Free-to-Play Path

Free players can earn everything through **skill**:
- Combo system doubles per-level income for skilled players
- Delivery system provides 1.8x additional income for risk-takers
- Daily login + daily challenges provide stable coin sources
- All 1000 recipes and equipment upgrades are purchasable with coins

**Expected free player completion time**: 15-25 hours (PLACEHOLDER), approximately 2-3 weeks of casual play.

---

## 7. Progression System

### 7.1 108-Level Campaign Structure

#### Tutorial Levels (1-4, handcrafted)

| Level | Teaching Objective | Unlocks | Concurrent Customers | Delivery | Patience |
|-------|-------------------|---------|----------------------|---------|----------|
| 1 | Base selection + serving | 5 bases | 1 | None | 70s |
| 2 | Flavor selection + blending | 5 flavors | 1 | None | 65s |
| 3 | Topping selection + full crafting chain | 4 toppings | 2 | None | 60s |
| 4 | Delivery system introduction | Delivery mechanic | 2 | 1 concurrent | 55s |

#### Procedural Levels (5-108)

| Level Range | Recipes | New Mechanics | Concurrent Customers | Delivery | Patience |
|-------------|---------|---------------|---------------------|---------|----------|
| 5-15 | Tier 1 (1-200) | Combo system + Impatient customers | 2 | Optional | 55s |
| 16-30 | Tier 2 (201-400) | Big Order customers + Equipment upgrade | 2-3 | 1 concurrent | 50s |
| 31-50 | Tier 3 (401-600) | VIP customers + Dual delivery | 3 | 1-2 concurrent | 45s |
| 51-80 | Tier 4 (601-800) | Complex recipes + High-frequency delivery | 3-4 | 2 concurrent | 40s |
| 81-108 | Tier 5 (801-1000) | Extreme challenge | 4 | 2+ concurrent | 35s |

*Procedural generation parameters: customer arrival frequency, patience, delivery frequency, and concurrent customer count all interpolate linearly/exponentially by level number. Levels 1-4 are handcrafted; level 5+ is driven by parameter curves in `levels.json`.*

### 7.2 Unlock Cadence

| Content Type | Unlock Frequency | Total | Design Intent |
|-------------|-----------------|-------|---------------|
| New boba recipes | 8-10 per level | 1000 / 108 levels | Something new every level |
| Equipment upgrades | Every 5 levels | 6 upgrades | Phase-based efficiency leaps |
| Decoration unlocks | 2-3 per 3 levels | ~80 items | Shop continuously evolves |
| New customer types | Every 5 levels | 5 types | Tactical variety |

### 7.3 Equipment Upgrades

| Equipment | Upgrade Effect | Cost Range | Levels |
|-----------|---------------|-----------|--------|
| Blender | Blend time -0.2s per level | 500-2000 | 6 tiers |
| Fridge | Ingredient capacity +5 per level | 500-2000 | 6 tiers |
| Workstation | +1 concurrent craft slot | 1000-2000 | 3 tiers |
| Delivery Window | Delivery timer +5s | 800-1500 | 3 tiers |

### 7.4 Post-Campaign Content

| Mode | Content | Retention Purpose |
|------|---------|-------------------|
| Endless Mode | Infinite customers, see how long you last | Hardcore player challenge |
| Daily Challenge | One special condition level per day (e.g., deliveries only) | Daily active retention |
| Seasonal Events | Limited recipes + limited decorations (e.g., Summer Special) | Monthly active + monetization |
| Friend Leaderboard | Weekly rankings among friends | Social engagement |

---

## 8. Social System

### 8.1 Core Philosophy

> The social system's spirit is **"both sides win"** — inspired by farm games where friends "steal" crops, but here both parties gain. A friend grabs a drink from your shop, and you both earn income. There's no feeling of being taken advantage of. Social virality is the primary growth engine for a zero-budget indie developer.

**Design principles**:
- **Async**: No real-time multiplayer — players interact on their own schedule
- **Positive-sum**: Both parties always gain from social interactions
- **Non-intrusive**: Social features never interrupt gameplay
- **Friends-only**: Fixed 5 friend slots (free, no paid expansion)

### 8.2 Four Social Mechanisms

| # | Mechanism | Description | Virality Hook |
|---|-----------|-------------|---------------|
| 1 | **Taste Test** | Friends "taste" a boba from your shop. Both earn income. Revenue split: Taster 35% / Shop Owner 20% / System Subsidy 45% (based on taster's Tier to prevent cross-Tier arbitrage) | Both sides earn, drives daily visits |
| 2 | **Cover Shift** | Friends help process your offline delivery overflow while you're away. Revenue split: Helper 15% / Shop Owner 70% / System injection 100% | Mutual aid, boosts retention |
| 3 | **Leaderboard** | 3 categories: Weekly Income / Max Combo / Decoration Score. Weekly reset (Monday 00:00 UTC). Friends-only scope. | Comparison drives activity |
| 4 | **Custom Recipes** | Create your own signature boba using modular components. Friends can order your signature drink (30% chance). Recipe slots: Free 0 / Unlock $0.99 (1 slot) | Creation + sharing drives spread |

> **Detailed design**: See `docs/gdd/social-system-gdd.md` for full mechanism specifications, anti-abuse rules, and technical requirements.

### 8.3 Social Income Share

Social income is expected to account for **25-35%** of total player income. This is deliberate — high enough to make social features worthwhile, low enough that solo play remains viable.

### 8.4 Shop Name Mechanism

- Default: Player's chosen username + "'s Boba Shop" (e.g., "Lily's Boba Shop")
- Custom name available for a small coin fee
- Random name assigned if player skips naming

---

## 9. Monetization Design

### 9.1 Core Principle: Sell Experience, Not Power

> All gameplay-affecting items (ingredients, recipes, equipment) are purchasable with coins. Paid items **only sell decoration and convenience**, never stat advantages. This ensures free players never feel blocked by a "paywall," while giving paying players ample room for self-expression.

**Zero ads policy**: Boba Dash contains **no advertisements of any kind**. All monetization is through IAP.

### 9.2 Five Monetization Tracks (18 SKUs)

#### Track 1: Decoration Packs

| SKU ID | Name | Price | Content |
|--------|------|-------|---------|
| `boba_deco_basic` | Starter Decor Pack | $0.99 | 5 wallpaper + 3 floor patterns |
| `boba_deco_standard` | Cozy Shop Collection | $1.99 | 10 furniture + 2 lighting + 3 wallpaper |
| `boba_deco_premium` | Master Designer Set | $2.99 | 15 items + exclusive golden counter + 5 wallpaper |
| `boba_deco_seasonal_{N}` | Season Exclusive | $1.99 | Seasonal theme (Halloween, Christmas, Summer) |

#### Track 2: Custom Recipes

| SKU ID | Name | Price | Content |
|--------|------|-------|---------|
| `boba_recipe_slot_1` | Recipe Slot Unlock | $0.99 | 1 custom recipe slot |
| `boba_recipe_slot_3` | Recipe Bundle (3 slots) | $1.99 | 3 custom recipe slots (save 33%) |

#### Track 3: Ingredient Skins

| SKU ID | Name | Price | Content |
|--------|------|-------|---------|
| `boba_skin_fruit` | Galaxy Fruit Skin | $0.99 | Starry texture for fruit toppings |
| `boba_skin_pearls` | Rainbow Pearls Skin | $0.99 | Rainbow tapioca pearls |
| `boba_skin_cream` | Cloud Cream Skin | $0.99 | Fluffy cloud-patterned cream |

#### Track 4: Avatar Customization (NEW)

Avatar appears in leaderboards, friend lists, Taste Test visits, and profile page.

| SKU ID | Name | Price | Content |
|--------|------|-------|---------|
| `boba_avatar_basic` | Starter Outfit Pack | $0.99 | 5 outfits + 3 hair colors |
| `boba_avatar_standard` | Barista Collection | $1.99 | 10 outfits + 2 expressions + 3 accessories |
| `boba_avatar_premium` | Master Brewer Set | $2.99 | 15 items + exclusive golden apron + 5 expressions |
| `boba_avatar_accessory` | Accessory Pack | $0.99 | 8 accessories (hats, glasses, aprons) |
| `boba_avatar_seasonal_{N}` | Season Exclusive | $1.99 | Seasonal limited outfit set |

**Customization categories**: Outfits / Accessories / Expressions / Hair / Skin Tone  
**Design rationale**: Low development cost (2D sprites), pure visual, no balance impact. Periodic new packs replace the content cadence previously driven by Season Pass.

#### Track 5: Shop Theme Music (NEW)

Background music plays during gameplay. When friends visit your shop via Taste Test, they hear your shop's theme music (social visibility).

| SKU ID | Name | Price | Content |
|--------|------|-------|---------|
| `boba_music_lofi` | Lo-fi Beats | $0.99 | 3 tracks (15min loop) |
| `boba_music_kpop` | K-pop Style | $0.99 | 3 upbeat tracks |
| `boba_music_jazz` | Jazz Lounge | $0.99 | 3 smooth jazz tracks |
| `boba_music_electronic` | Electronic Mix | $0.99 | 3 EDM tracks |
| `boba_music_holiday_{N}` | Holiday Special | $1.99 | 5 festive tracks + SFX |

**Design rationale**: Music is a social signal — friends hear your shop's vibe during Taste Test visits. Creates a "I want that track too" desire loop. Low production cost via licensed royalty-free music.

### 9.3 Pricing Strategy

- **Price anchors**: US market, Starbucks drink price ($4-7) as mental anchor
- **Entry price**: $0.99 (impulse buy threshold)
- **Premium ceiling**: $2.99 (below $5 resistance point)
- **No subscription**: All purchases are one-time à la carte (simpler for indie developer, no recurring billing infrastructure needed)
- **Platform fees**: Apple/Google 30% (or 15% under Small Business Program / first $1M)

### 9.4 Free vs. Paid Player Paths

**Free player path** (everything earnable through gameplay):
- Combo system + delivery risk-taking = 2-3x income multiplier
- All 1000 recipes, all equipment upgrades purchasable with coins
- Social income (Taste Test + Cover Shift) adds 25-35% to total income
- Expected completion: 15-25 hours

**Paid player path** (buys personalization, not progress):
- Decoration packs make shops unique (social sharing driver)
- Avatar customization for self-expression
- Shop theme music for social signaling
- Custom recipe slots for creative expression
- Ingredient skins for collector drive
- Expected ARPU: $0.50-1.50 · Expected LTV: $2-5

---

## 10. Art Direction

### 10.1 Visual Style

| Dimension | Direction | Rationale |
|-----------|-----------|-----------|
| Overall style | Flat + soft 3D (like Cooking Fever but softer) | All-age friendly, high recognition |
| Color palette | Pastel macaron colors (pink, mint, cream yellow, lavender) | Boba = refreshing = soft colors |
| Drink rendering | Layered compositing: glass → liquid → foam → topping → decoration | Modular, 35 sprites render 1000 looks |
| Customers | Chibi-style characters, color-coded by type | Lowers art cost, improves recognition |
| UI | Rounded corners + large buttons + clear icons | Mobile touch-friendly |

### 10.2 Bubble Tea Rendering Layer Pipeline

```
Layer 1: Glass outline (4 types)
Layer 2: Liquid color (base + flavor blend via alpha compositing)
Layer 3: Liquid surface ripple/foam
Layer 4: Topping sprite (8 types)
Layer 5: Decorations (straw, mint leaf, umbrella pick)
Layer 6: Glass highlight/reflection
```

Implemented in Canvas 2D — no WebGL needed. Code is 100% reusable from H5 prototype.

### 10.3 Asset Inventory (MVP)

| Asset Type | Count | Notes |
|-----------|-------|-------|
| Glass sprites | 4 | Classic, Mason Jar, Bottle, Giant |
| Liquid colors | 5 base + 10 flavor | Alpha blend for color variation |
| Topping sprites | 8 | Tapioca pearls, grass jelly, etc. |
| Decoration sprites | 6 | Straw, mint leaf, umbrella, etc. |
| Customer sprites | 5 | 5 types of chibi characters |
| UI icons | ~20 | Buttons, icons, progress bars |
| Shop backgrounds | 3 | Initial + 2 upgrade backgrounds |
| **MVP total** | **~60** | AI generation + manual polish |

### 10.4 Avatar Customization Art Specs (NEW)

| Category | Items per Pack | Art Style | Resolution |
|----------|---------------|-----------|------------|
| Outfits | 5-15 per pack | Chibi character clothing, flat color | 128×128px sprite |
| Accessories | 3-8 per pack | Hats, glasses, aprons (layered on top) | 64×64px sprite |
| Expressions | 2-5 per pack | Face expression overlays | 64×64px sprite |
| Hair colors | 3-5 per pack | Color swap variants (same sprite) | Code-driven |
| Skin tones | 3-5 per pack | Color swap variants (same sprite) | Code-driven |

**Technical approach**: Avatar is composited from layered sprites (base body → outfit → hair → accessory → expression). Same compositing system as drink rendering.

### 10.5 Shop Theme Music Specs (NEW)

| Music Pack | Style | Tracks | Loop Duration | Source |
|-----------|-------|--------|--------------|--------|
| Lo-fi Beats | Chill, ambient | 3 | 15min total | Licensed royalty-free |
| K-pop Style | Upbeat, energetic | 3 | 12min total | Licensed royalty-free |
| Jazz Lounge | Smooth, relaxed | 3 | 15min total | Licensed royalty-free |
| Electronic Mix | EDM, high-energy | 3 | 12min total | Licensed royalty-free |
| Holiday Special | Festive, seasonal | 5 | 20min total | Licensed royalty-free + SFX |

**Audio format**: AAC 128kbps, normalized to -16 LUFS  
**Licensing**: Epidemic Sound or Artlist ($15/month subscription covers all tracks)

---

## 11. Technical Architecture

### 11.1 Tech Stack Overview

| Layer | Technology | Rationale |
|-------|-----------|-----------|
| Native shell | React Native (Expo) | Cross-platform iOS+Android, Expo simplifies build pipeline |
| Game rendering | WebView + Canvas 2D | 100% reuse of H5 prototype, zero rewrite |
| Bridge | postMessage protocol | RN ↔ WebView bidirectional communication |
| State management | Zustand | Lightweight, no boilerplate |
| Backend | Supabase (PostgreSQL) | Managed DB + Auth + Edge Functions, free tier covers MVP |
| IAP | RevenueCat + react-native-purchases | Unified Apple/Google IAP, free under $10K MTR |
| Crash reporting | Sentry | Free tier |
| Analytics | PostHog (self-hosted) | Free, privacy-friendly |

### 11.2 Code Reuse Strategy

| Module | Source | Reuse Rate | Adaptation |
|--------|--------|-----------|------------|
| drink-data.js | H5 prototype | 100% | Zero changes (Fisher-Yates algorithm is platform-agnostic) |
| level-data.js | H5 prototype | 100% | Zero changes (108-level procedural generation) |
| game-engine.js | H5 prototype | 95% | Storage interface adapted to AsyncStorage + Supabase |
| H5 Canvas rendering | H5 webview game | 100% | Loaded in WebView, zero rewrite |
| social.json | H5 prototype | 100% | Values unchanged (social parameters) |
| Backend logic | H5 prototype backend | 70% | API layer rewritten as Supabase Edge Functions |
| **Overall** | | **~55%** | |

### 11.3 Data-Driven Architecture

```
/config
  drinks.json        // 1000 boba recipes
  levels.json        // 108 level configs (customer frequency, patience, delivery)
  economy.json       // Prices, costs, unlock fees
  decorations.json   // Decoration catalog
  iap.json           // 18 IAP product configs
  avatars.json       // Avatar customization catalog
  music.json         // Music pack catalog
/src
  /rn-app            // React Native shell
  /webview-game      // H5 game (Canvas 2D, loaded in WebView)
  /supabase
    /migrations      // SQL schema + RLS
    /edge-functions  // Deno/TypeScript serverless functions
  /shared            // Shared constants, types, utilities
```

*All game values live in JSON config files. Tuning = edit JSON, not code. Post-playtest adjustments are config-only hot-fixes.*

### 11.4 Detailed Architecture

See `docs/architecture/main-architecture.md` for full architecture, `docs/architecture/webview-bridge.md` for bridge protocol, and `docs/architecture/backend-design.md` for Supabase design.

---

## 12. Playtest Plan

### 12.1 Failure Signal Definitions

> **Principle**: Define "what broken looks like" before running playtests. A playtest without failure definitions is a waste of time.

| Tier | Signal | Judgment Criteria | Fix Direction |
|------|--------|------------------|---------------|
| **A** | Player can't finish a simple boba in 30s | Too many steps / unintuitive UI | Simplify steps, enlarge buttons, add tutorial animation |
| **A** | Player goes bankrupt (coins < 0) before level 5 | Economy too tight, ingredient costs too high | Lower ingredient costs, increase starting coins |
| **B** | Player has > 2000 coins at level 10 | Economy too loose, sinks insufficient | Raise recipe unlock costs, increase ingredient consumption |
| **B** | Player completely ignores deliveries (accept rate < 20%) | Delivery reward doesn't cover risk | Increase delivery multiplier or reduce timeout penalty |
| **B** | Player unlocks all 1000 recipes within 2 hours | Progress too fast, retention hooks insufficient | Widen late-game unlock gaps, add endless mode |
| **C** | Day-1 retention < 20% | Core loop not hooky enough | Strengthen end-of-level hook, add daily challenges |
| **C** | Player doesn't tap decoration shop | Decorations not attractive enough | Improve decoration visual quality, add social sharing |

### 12.2 Playtest Process

1. **Recruit**: 5 testers, 3F/2M, 18-35, casual mobile gamers
2. **Observe**: Don't teach — let players figure it out. Record: first successful craft time, first failure time, spontaneous emotion words
3. **Interview**: Stop after 15 minutes. Ask: most fun moment? most frustrating moment? want to keep playing? willing to pay?
4. **Data**: Extract save data — levels completed, coin balance, max combo, delivery accept rate, shop tap rate
5. **Verdict**: Any A-tier signal → must fix before launch. B-tier → evaluate and decide. C-tier → monitor post-launch

---

## 13. Appendix

### 13.1 First 20 Boba Recipes (English Names)

| # | Name | Base | Flavor | Topping | Glass | Tier | Price | Cost | Unlock |
|---|------|------|--------|---------|-------|------|-------|------|--------|
| 1 | Classic Strawberry Milk Tea | Black Tea | Strawberry | Tapioca Pearls | Classic | 1 | 18 | 7 | 1 |
| 2 | Chocolate Boba | Black Tea | Chocolate | Tapioca Pearls | Classic | 1 | 18 | 7 | 1 |
| 3 | Mango Milk Tea | Black Tea | Mango | Tapioca Pearls | Classic | 1 | 20 | 8 | 1 |
| 4 | Matcha Latte Boba | Black Tea | Matcha | Tapioca Pearls | Classic | 1 | 20 | 8 | 2 |
| 5 | Blueberry Milk Tea | Black Tea | Blueberry | Tapioca Pearls | Classic | 1 | 20 | 8 | 2 |
| 6 | Honeydew Boba | Black Tea | Honeydew | Tapioca Pearls | Classic | 1 | 18 | 7 | 2 |
| 7 | Strawberry Green Tea | Green Tea | Strawberry | Pudding | Mason Jar | 1 | 20 | 8 | 3 |
| 8 | Mango Green Tea | Green Tea | Mango | Pudding | Mason Jar | 1 | 20 | 8 | 3 |
| 9 | Blueberry Sparkling Tea | Green Tea | Blueberry | Aloe Vera | Bottle | 1 | 15 | 5 | 3 |
| 10 | Honeydew Sparkling Tea | Green Tea | Honeydew | Aloe Vera | Bottle | 1 | 15 | 5 | 4 |
| 11 | Strawberry Sparkling Tea | Green Tea | Strawberry | Coconut Jelly | Bottle | 1 | 15 | 5 | 4 |
| 12 | Lychee Sparkling Tea | Green Tea | Lychee | Coconut Jelly | Bottle | 1 | 17 | 6 | 4 |
| 13 | Matcha Oolong Latte | Oolong | Matcha | Cheese Foam | Classic | 2 | 25 | 10 | 5 |
| 14 | Brown Sugar Milk Tea | Black Tea | Brown Sugar | Tapioca Pearls | Mason Jar | 2 | 25 | 10 | 5 |
| 15 | Lavender Milk Tea | Black Tea | Lavender | Cheese Foam | Classic | 2 | 28 | 11 | 5 |
| 16 | Taro Boba | Black Tea | Taro | Tapioca Pearls | Mason Jar | 2 | 25 | 10 | 6 |
| 17 | Chocolate Pudding Tea | Black Tea | Chocolate | Pudding | Mason Jar | 2 | 25 | 10 | 6 |
| 18 | Mango Coconut Jelly | Oolong | Mango | Coconut Jelly | Mason Jar | 2 | 28 | 11 | 6 |
| 19 | Matcha Oreo Tea | Black Tea | Matcha | Oreo Crumbs | Classic | 2 | 28 | 11 | 7 |
| 20 | Brown Sugar Grass Jelly | Black Tea | Brown Sugar | Grass Jelly | Mason Jar | 2 | 30 | 12 | 7 |

*Recipes 21-1000 are procedurally generated from the 1600 module combinations via Fisher-Yates seeded shuffle. All prices and costs are PLACEHOLDER — fill in actual values after playtest.*

### 13.2 System Interaction Matrix

| System A | System B | Interaction Type | Notes |
|---------|---------|-----------------|-------|
| Combo | Delivery | acceptable | Delivery timeout breaks combo — by design, creates risk feeling |
| Combo | Impatient customer | intended | Impatient customer high tips accelerate combo |
| Delivery | Big Order customer | risk | Simultaneous trigger causes workstation shortage — monitor point |
| Equipment upgrade | Difficulty curve | intended | Upgrades offset difficulty increase, maintain flow zone |
| Decoration | Economy | intended | Decoration is coin sink + IAP point, no balance impact |
| VIP customer | Combo | acceptable | VIP x3 tips may stack with combo causing inflation — monitor |
| Avatar customization | Social | intended | Avatar visible in leaderboards and friend visits |
| Shop music | Social | intended | Music heard during Taste Test visits — social signal |
| Taste Test | Economy | intended | 25-35% of total income, positive-sum design |
| Cover Shift | Delivery | intended | Friends handle delivery overflow when offline |

### 13.3 Glossary (CN ↔ EN Term Mapping)

| Chinese | English | Notes |
|---------|---------|-------|
| 奶茶 | Bubble Tea / Boba | Category positioning |
| 试喝 | Taste Test | Social mechanism 1 |
| 帮忙看店 | Cover Shift | Social mechanism 2 |
| 排行榜 | Leaderboard | Social mechanism 3 |
| 自定义配方 | Custom Recipes | Social mechanism 4 |
| 好友位 | Friend Slots | Fixed at 5 (free) |
| 角色/头像定制 | Avatar Customization | IAP track |
| 店铺主题音乐 | Shop Theme Music | IAP track |
| 基底 | Base | Drink component |
| 风味 | Flavor | Drink component |
| 顶料 | Topping | Drink component |
| 杯型 | Glass | Drink component |
| 珍珠 | Tapioca Pearls / Boba | Topping |
| 椰果 | Coconut Jelly | Topping |
| 奶油 | Cream / Cheese Foam | Topping |
| 外卖 | Delivery | Core tension mechanism |
| 连击 | Combo | Scoring system |
| 耐心 | Patience | Customer mechanic |
| 小费 | Tip | Economy |
| 金币 | Coins | Currency |
| 装饰 | Decoration | IAP track |
| 食材皮肤 | Ingredient Skins | IAP track |
| 装饰包 | Decoration Packs | IAP track |
| 内购 | IAP (In-App Purchase) | Monetization |
| 零广告 | Zero Ads | Design principle |
| Fisher-Yates 洗牌 | Fisher-Yates Shuffle | Algorithm |
| 种子 | Seed | PRNG initialization |

---

> **Boba Dash GDD v1.0** · All values marked PLACEHOLDER require playtest validation.  
> Document maintained by Paul (Spider-Man) · Last updated: 2026-08-10
