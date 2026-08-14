# Boba Dash — 后端设计

> **版本**：v1.0 · **作者**：程基岩（Cheng Jiyan）· **日期**：2026-08-10
> **后端平台**：Supabase (PostgreSQL + Auth + Edge Functions)
> **关联文档**：`main-architecture.md`、`supabase-schema.md`

---

## 1. Supabase 服务架构

### 1.1 为什么选择 Supabase

作为独立开发者，选择 Supabase 的核心原因：

| 考量 | Supabase | 替代方案对比 |
|------|----------|-------------|
| **成本** | Free Tier 含 500MB DB + 50K MAU | Firebase: Free Spark 更慷慨但Vendor Lock-in |
| **数据库** | 标准 PostgreSQL | 无需学习文档数据库，SQL 上手零成本 |
| **Edge Functions** | Deno/TypeScript | 比 Firebase Functions (Node.js) 更现代 |
| **RLS** | 原生行级安全 | 免写API层权限校验 |
| **开源** | 可自托管 | 不被锁定，未来可迁移 |
| **社区** | 快速增长 | 文档完善，Discord活跃 |
| **实时** | 内置 Realtime (WebSocket) | 可选扩展（异步优先，暂不启用） |

### 1.2 Free Tier 限制与扩展路径

| 项目 | Free Tier | Pro Tier ($25/月) | Team Tier ($599/月) |
|------|-----------|-------------------|---------------------|
| 数据库容量 | 500 MB | 8 GB | 100 GB |
| 带宽 | 5 GB/月 | 50 GB/月 | 250 GB/月 |
| MAU | 50,000 | 100,000 | 1,000,000 |
| Edge Function 调用 | 500K/月 | 2M/月 | 5M/月 |
| 数据库连接 | 15 (direct) | 30 (direct) + PgBouncer | 50 + PgBouncer |
| 每日备份 | 无 | 7天 | 14天 |
| PITR | 无 | 无 | 有 |

**扩展路径**：
- 0 - 10K DAU：Free Tier 足够（50K MAU = ~1.7K DAU 留有余量）
- 10K - 30K DAU：Pro Tier ($25/月)
- 30K+ DAU：考虑自托管或 Team Tier

### 1.3 服务拓扑

```
                    ┌─────────────────┐
                    │  React Native   │
                    │  (Expo) Client  │
                    └───┬─────────┬───┘
                        │         │
              REST API  │         │  WebSocket (可选)
         (Edge Functions)│         │
                        │         │
               ┌────────▼─────────▼───┐
               │    Supabase Cloud    │
               │                     │
               │  ┌───────────────┐  │
               │  │  Kong API     │  │
               │  │  Gateway      │  │
               │  └───┬───────┬───┘  │
               │      │       │       │
               │  ┌───▼──┐ ┌──▼────┐ │
               │  │GoTrue│ │Realtime│ │
               │  │(Auth)│ │(WS)   │ │
               │  └──┬───┘ └───────┘ │
               │     │               │
               │  ┌──▼─────────────┐ │
               │  │  PostgreSQL    │ │
               │  │  (Supavisor)   │ │
               │  └──┬────────────┘ │
               │     │               │
               │  ┌──▼─────────────┐ │
               │  │  pg_cron       │ │
               │  │  (定时任务)     │ │
               │  └────────────────┘ │
               │                     │
               │  ┌────────────────┐ │
               │  │  Edge Functions│ │
               │  │  (Deno Deploy) │ │
               │  └────────────────┘ │
               │                     │
               │  ┌────────────────┐ │
               │  │  Storage       │ │
               │  │  (S3 + CDN)   │ │
               │  └────────────────┘ │
               └─────────────────────┘
```

---

## 2. Auth 系统

### 2.1 认证方式

| 方式 | 优先级 | 说明 |
|------|--------|------|
| Email + Password | P0 | 基础认证，所有平台通用 |
| Apple Sign-in | P0 | **App Store 强制要求**（任何使用第三方登录的App必须提供） |
| Google Sign-in | P1 | Android 首选，提升转化率 |
| Magic Link | P2 | 免密码登录，可选扩展 |

### 2.2 Apple Sign-in 合规要点

```
App Store Review Guideline 4.8:
- 必须提供 Sign-in with Apple 选项
- 按钮样式必须使用 Apple 官方设计
- 不能强制用户创建额外账号
- 隐私保护：可选择隐藏真实邮箱（Apple Relay Email）
```

> 实现：Supabase Auth 原生支持 Apple OAuth。配置步骤：App Store Connect → Certificates → Sign in with Apple → 获取 Client ID 和 Key → 填入 Supabase Dashboard → Auth Providers。

### 2.3 Auth 流程

```
                    Sign Up Flow
                    ────────────
用户输入 email + password + shop_name
    │
    ▼
supabase.auth.signUp({ email, password })
    │
    ▼
Email 验证（可选关闭，MVP阶段跳过以降低流失）
    │
    ▼
login Edge Function 被调用
    │
    ├── 1. 创建 users 表记录
    │    INSERT INTO users (id, email, shop_name, ...)
    │
    ├── 2. 检查离线时长 → 生成虚拟外卖
    │
    ├── 3. 初始化 daily_limits (当日记录)
    │
    └── 返回 { user, is_new: true, offline_deliveries: { ... } }


                    Sign In Flow
                    ────────────
用户输入 email + password (或 OAuth)
    │
    ▼
supabase.auth.signInWithPassword({ email, password })
    │
    ▼
login Edge Function 被调用
    │
    ├── 1. 验证 JWT token
    ├── 2. 检查离线时长 → 生成虚拟外卖
    ├── 3. 更新 last_online_at
    └── 返回 { user, offline_deliveries, unread_social_events }
```

### 2.4 JWT Token 管理

```typescript
// supabase.auth.getSession() 返回的 session 结构
interface Session {
  access_token: string;    // 1小时过期
  refresh_token: string;   // 30天过期
  expires_at: number;      // Unix timestamp
  user: {
    id: string;            // UUID (对应 users 表主键)
    email: string;
    // OAuth 用户的 provider 信息
    identities?: {
      provider: 'apple' | 'google';
      identity_id: string;
    }[];
  };
}
```

**Token 刷新**：Supabase SDK 自动处理 refresh token 轮换，开发者无需手动管理。

---

## 3. Edge Functions 详细设计

### 3.1 共享模块 (`_shared/`)

```
supabase/functions/
├── _shared/
│   ├── cors.ts           # CORS 头统一处理
│   ├── auth.ts           # JWT 验证 + 用户信息获取
│   ├── constants.ts      # 社交数值常量（与 social.json 同步）
│   ├── db.ts             # Supabase 客户端创建（service_role）
│   └── utils.ts          # UUID、日期格式化、Tier 价格表
├── login/
│   └── index.ts
├── sync-save/
│   └── index.ts
├── get-friend-list/
│   └── index.ts
├── add-friend/
│   └── index.ts
├── remove-friend/
│   └── index.ts
├── taste-test/
│   └── index.ts
├── help-watch/
│   └── index.ts
├── get-social-report/
│   └── index.ts
└── get-leaderboard/
    └── index.ts
```

### 3.2 `_shared/constants.ts`

```typescript
// 与 config/social.json 保持同步

export const TASTE_TEST = {
  TASTER_GAIN_RATE: 0.35,
  OWNER_GAIN_RATE: 0.20,
  SYSTEM_SUBSIDY_RATE: 0.45,
  CUSTOM_RECIPE_CHANCE: 0.30,
  DAILY_MAX_BASE: 5,
  DAILY_MAX_PAID: 8,
  DAILY_MAX_PER_FRIEND: 1,
} as const;

export const HELP = {
  HELPER_GAIN_RATE: 0.15,
  OWNER_GAIN_RATE: 0.70,
  SYSTEM_SUBSIDY_RATE: 0.85,
  DAILY_MAX: 4,
  DAILY_MAX_PER_FRIEND: 1,
} as const;

export const FRIEND_SLOTS = {
  FREE_MAX: 5,
  PAID_MAX: 20,
} as const;

export const OFFLINE_DELIVERY = {
  MAX_PER_OFFLINE: 2,
  HOURS_PER_DELIVERY: 2,
} as const;

export const TIER_AVG_PRICES: Record<number, number> = {
  1: 18, 2: 25, 3: 37, 4: 55, 5: 80,
};

export const ROBOT = {
  BASIC:    { efficiency: 0.60, duration_days: 7 },
  STANDARD: { efficiency: 0.75, duration_days: 30 },
  PREMIUM:  { efficiency: 0.90, duration_days: 30, auto_restock: true },
} as const;
```

### 3.3 `_shared/auth.ts`

```typescript
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

export function createServiceClient() {
  return createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
}

export async function getUserId(req: Request): Promise<string> {
  // 从 Authorization header 提取 JWT，解析 user_id
  const authHeader = req.headers.get("Authorization");
  if (!authHeader) throw new Error("UNAUTHORIZED");

  const token = authHeader.replace("Bearer ", "");
  const supabase = createServiceClient();

  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user) throw new Error("UNAUTHORIZED");

  return user.id;
}
```

### 3.4 Edge Function #1: `login`

```
POST /functions/v1/login
Authorization: Bearer <JWT>
Body: {}
```

**业务逻辑**（合并登录 + 初始化 + 离线外卖）：

```typescript
// supabase/functions/login/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { createServiceClient, getUserId } from "../_shared/auth.ts";
import { OFFLINE_DELIVERY, TIER_AVG_PRICES, ROBOT } from "../_shared/constants.ts";
import { generateUUID, getTierAvgPrice, formatDate } from "../_shared/utils.ts";

serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const userId = await getUserId(req);
    const supabase = createServiceClient();
    const now = new Date();

    // 1. 查询用户档案
    const { data: user } = await supabase
      .from("users")
      .select("*")
      .eq("id", userId)
      .single();

    const isNew = !user;

    if (isNew) {
      // 新用户：创建档案
      await supabase.from("users").insert({
        id: userId,
        email: "", // 由 Auth trigger 填充
        coins: 0,
        level: 1,
        current_tier: 1,
        friend_slots_max: 5,
        custom_recipe_slots: 1,
        created_at: now.toISOString(),
        updated_at: now.toISOString(),
      });
    }

    // 2. 计算离线时长，生成虚拟外卖
    let offlineDeliveries = { delivery_count: 0, robot_income: 0, remaining_for_help: 0 };

    if (!isNew && user.last_online_at) {
      const lastOnline = new Date(user.last_online_at);
      const offlineHours = (now.getTime() - lastOnline.getTime()) / (1000 * 60 * 60);

      if (offlineHours >= OFFLINE_DELIVERY.HOURS_PER_DELIVERY) {
        const deliveryCount = Math.min(
          Math.floor(offlineHours / OFFLINE_DELIVERY.HOURS_PER_DELIVERY),
          OFFLINE_DELIVERY.MAX_PER_OFFLINE
        );

        let robotIncome = 0;
        let remainingDeliveries = deliveryCount;

        // 检查机器人是否可用
        if (user.robot_type && user.robot_expires_at && new Date(user.robot_expires_at) > now) {
          const efficiency = ROBOT[user.robot_type as keyof typeof ROBOT]?.efficiency ?? 0.6;
          const avgPrice = getTierAvgPrice(user.current_tier);
          const deliveryValue = avgPrice * 1.8;

          robotIncome = Math.floor(deliveryCount * deliveryValue * efficiency);
          remainingDeliveries = 0;

          // 机器人收入直接入账
          await supabase.from("users").update({
            coins: user.coins + robotIncome,
          }).eq("id", userId);

          // 写入机器人接待日志
          await supabase.from("social_actions").insert({
            action_id: generateUUID(),
            from_user_id: "00000000-0000-0000-0000-000000000000", // system
            to_user_id: userId,
            action_type: "robot_delivery",
            drink_name: "外卖订单",
            owner_gain: robotIncome,
            date_key: formatDate(now),
            status: "pending",
          });
        }

        offlineDeliveries = {
          delivery_count: deliveryCount,
          robot_income: robotIncome,
          remaining_for_help: remainingDeliveries,
        };

        // 更新外卖池
        await supabase.from("users").update({
          offline_delivery_pool: remainingDeliveries,
        }).eq("id", userId);
      }
    }

    // 3. 更新上线时间
    await supabase.from("users").update({
      last_online_at: now.toISOString(),
      updated_at: now.toISOString(),
    }).eq("id", userId);

    // 4. 检查未读社交事件数
    const { count: unreadEvents } = await supabase
      .from("social_actions")
      .select("*", { count: "exact", head: true })
      .eq("to_user_id", userId)
      .eq("status", "pending");

    return new Response(JSON.stringify({
      success: true,
      user_id: userId,
      is_new: isNew,
      offline_deliveries: offlineDeliveries,
      unread_social_events: unreadEvents || 0,
    }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });

  } catch (error) {
    return new Response(JSON.stringify({
      success: false,
      error: error.message,
    }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
```

**输入/输出**：

| 输入 | 类型 | 说明 |
|------|------|------|
| `Authorization header` | Bearer JWT | 自动由 Supabase SDK 附加 |

| 输出字段 | 类型 | 说明 |
|----------|------|------|
| `success` | boolean | 是否成功 |
| `user_id` | string | UUID |
| `is_new` | boolean | 是否新用户 |
| `offline_deliveries.delivery_count` | number | 离线期间生成的外卖数 |
| `offline_deliveries.robot_income` | number | 机器人自动处理收入 |
| `offline_deliveries.remaining_for_help` | number | 剩余可被好友帮忙的外卖数 |
| `unread_social_events` | number | 未读社交事件数 |

---

### 3.5 Edge Function #2: `syncSave`

```
POST /functions/v1/sync-save
Authorization: Bearer <JWT>
Body: { coins, level, current_tier, shop_name?, nickname?, avatar_url?,
        custom_recipe?: { name, base, flavor, topping, glass, sell_price? },
        weekly_stats?: { total_income, max_combo, decoration_value } }
```

**业务逻辑**（合并存档同步 + 档案更新 + 自定义配方）：

```typescript
serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const userId = await getUserId(req);
    const body = await req.json();
    const supabase = createServiceClient();
    const now = new Date().toISOString();

    // 1. 更新基础游戏数据
    const updateData: Record<string, unknown> = {
      updated_at: now,
    };

    if (body.coins !== undefined) updateData.coins = body.coins;
    if (body.level !== undefined) updateData.level = body.level;
    if (body.current_tier !== undefined) updateData.current_tier = body.current_tier;

    // 2. 更新店铺信息（如果有）
    if (body.shop_name) {
      // 店名校验：2-30字符
      if (body.shop_name.length < 2 || body.shop_name.length > 30) {
        throw new Error("NAME_LENGTH_INVALID");
      }
      updateData.shop_name = body.shop_name;
    }
    if (body.nickname !== undefined) updateData.nickname = body.nickname;
    if (body.avatar_url !== undefined) updateData.avatar_url = body.avatar_url;

    // 3. 更新周统计
    if (body.weekly_stats) {
      const { data: currentUser } = await supabase
        .from("users")
        .select("weekly_income, weekly_max_combo, weekly_decoration_value")
        .eq("id", userId)
        .single();

      updateData.weekly_income = Math.max(
        currentUser?.weekly_income || 0,
        body.weekly_stats.total_income || 0
      );
      updateData.weekly_max_combo = Math.max(
        currentUser?.weekly_max_combo || 0,
        body.weekly_stats.max_combo || 0
      );
      updateData.weekly_decoration_value = Math.max(
        currentUser?.weekly_decoration_value || 0,
        body.weekly_stats.decoration_value || 0
      );
    }

    await supabase.from("users").update(updateData).eq("id", userId);

    // 4. 处理自定义配方（如有）
    if (body.custom_recipe) {
      const { data: existingRecipes } = await supabase
        .from("custom_recipes")
        .select("id")
        .eq("user_id", userId);

      const maxSlots = (await supabase
        .from("users")
        .select("custom_recipe_slots")
        .eq("id", userId)
        .single()
      ).data?.custom_recipe_slots || 1;

      if ((existingRecipes?.length || 0) < maxSlots) {
        await supabase.from("custom_recipes").upsert({
          user_id: userId,
          name: body.custom_recipe.name,
          base: body.custom_recipe.base,
          flavor: body.custom_recipe.flavor,
          topping: body.custom_recipe.topping,
          glass: body.custom_recipe.glass,
          sell_price: body.custom_recipe.sell_price || 0,
          ingredient_cost: body.custom_recipe.ingredient_cost || 0,
        }, { onConflict: "user_id, name" });
      }
    }

    return new Response(JSON.stringify({
      success: true,
      sync_version: Date.now(),
    }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });

  } catch (error) {
    return new Response(JSON.stringify({
      success: false,
      error: error.message,
    }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
```

**输入/输出**：

| 输入 | 类型 | 必需 | 说明 |
|------|------|------|------|
| `coins` | number | 否 | 当前金币数 |
| `level` | number | 否 | 当前关卡 |
| `current_tier` | number | 否 | 当前Tier (1-5) |
| `shop_name` | string | 否 | 店名 (2-30字符) |
| `nickname` | string | 否 | 昵称 |
| `avatar_url` | string | 否 | 头像URL |
| `custom_recipe` | object | 否 | 自定义配方 |
| `weekly_stats` | object | 否 | 周统计数据 |

| 输出 | 类型 | 说明 |
|------|------|------|
| `success` | boolean | 是否成功 |
| `sync_version` | number | 同步版本时间戳 |

---

### 3.6 Edge Function #3: `getFriendList`

```
POST /functions/v1/get-friend-list
Authorization: Bearer <JWT>
Body: {}
```

**业务逻辑**：

```typescript
serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const userId = await getUserId(req);
    const supabase = createServiceClient();

    // 查询好友列表（通过 friend_edges JOIN users）
    const { data: friends } = await supabase
      .from("friend_edges")
      .select(`
        friend_id,
        users!friend_edges_friend_id_fkey (
          id, shop_name, nickname, avatar_url, current_tier,
          offline_delivery_pool, last_online_at, status, decoration_value
        )
      `)
      .eq("user_id", userId)
      .eq("users.status", "active");

    // 计算在线状态（30分钟内活跃视为在线）
    const now = new Date();
    const friendList = friends?.map((f: any) => {
      const lastOnline = f.users?.last_online_at ? new Date(f.users.last_online_at) : null;
      const isOnline = lastOnline
        ? (now.getTime() - lastOnline.getTime()) < 30 * 60 * 1000
        : false;

      return {
        user_id: f.users?.id,
        shop_name: f.users?.shop_name,
        nickname: f.users?.nickname,
        avatar_url: f.users?.avatar_url,
        current_tier: f.users?.current_tier,
        offline_delivery_pool: f.users?.offline_delivery_pool || 0,
        is_online: isOnline,
        status: f.users?.status,
        decoration_value: f.users?.decoration_value,
      };
    }) || [];

    return new Response(JSON.stringify({
      success: true,
      friends: friendList,
      count: friendList.length,
    }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });

  } catch (error) {
    return new Response(JSON.stringify({
      success: false,
      error: error.message,
    }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
```

**输出**：

| 字段 | 类型 | 说明 |
|------|------|------|
| `friends[].user_id` | string | 好友UUID |
| `friends[].shop_name` | string | 店名 |
| `friends[].nickname` | string | 昵称 |
| `friends[].current_tier` | number | Tier等级 |
| `friends[].offline_delivery_pool` | number | 待帮忙外卖数 |
| `friends[].is_online` | boolean | 是否在线 |
| `friends[].status` | string | active/inactive |
| `count` | number | 好友总数 |

---

### 3.7 Edge Function #4: `addFriend`

```
POST /functions/v1/add-friend
Authorization: Bearer <JWT>
Body: { invite_code: string }
```

**业务逻辑**（邀请码模式添加好友）：

```typescript
serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const userId = await getUserId(req);
    const { invite_code } = await req.json();
    const supabase = createServiceClient();

    // 1. 通过邀请码反查目标用户
    const { data: targetUser } = await supabase
      .from("users")
      .select("*")
      .eq("invite_code", invite_code)
      .single();

    if (!targetUser) throw new Error("INVITE_CODE_INVALID");
    if (targetUser.id === userId) throw new Error("CANNOT_ADD_SELF");

    // 2. 检查自己的好友位
    const { data: myProfile } = await supabase
      .from("users")
      .select("friend_slots_max")
      .eq("id", userId)
      .single();

    const { count: myFriendCount } = await supabase
      .from("friend_edges")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId);

    if ((myFriendCount || 0) >= (myProfile?.friend_slots_max || 5)) {
      throw new Error("FRIEND_SLOTS_FULL");
    }

    // 3. 检查是否已是好友
    const { data: existing } = await supabase
      .from("friend_edges")
      .select("*")
      .eq("user_id", userId)
      .eq("friend_id", targetUser.id)
      .single();

    if (existing) throw new Error("ALREADY_FRIENDS");

    // 4. 检查目标用户好友位
    const { data: targetProfile } = await supabase
      .from("users")
      .select("friend_slots_max, status")
      .eq("id", targetUser.id)
      .single();

    if (targetProfile?.status === "inactive") throw new Error("TARGET_INACTIVE");

    const { count: targetFriendCount } = await supabase
      .from("friend_edges")
      .select("*", { count: "exact", head: true })
      .eq("user_id", targetUser.id);

    if ((targetFriendCount || 0) >= (targetProfile?.friend_slots_max || 5)) {
      throw new Error("TARGET_FRIEND_SLOTS_FULL");
    }

    // 5. 检查删除冷却（24小时内不可重新添加）
    const { data: recentRemoval } = await supabase
      .from("friend_removals")
      .select("removed_at")
      .eq("user_id", userId)
      .eq("removed_user_id", targetUser.id)
      .single();

    if (recentRemoval) {
      const cooldownEnd = new Date(recentRemoval.removed_at).getTime() + 24 * 60 * 60 * 1000;
      if (Date.now() < cooldownEnd) throw new Error("REMOVAL_COOLDOWN");
    }

    // 6. 双向添加好友
    await supabase.from("friend_edges").insert([
      { user_id: userId, friend_id: targetUser.id },
      { user_id: targetUser.id, friend_id: userId },
    ]);

    // 7. 清理可能存在的移除记录
    await supabase.from("friend_removals").delete()
      .eq("user_id", userId)
      .eq("removed_user_id", targetUser.id);

    return new Response(JSON.stringify({
      success: true,
      friend: {
        user_id: targetUser.id,
        shop_name: targetUser.shop_name,
        nickname: targetUser.nickname,
        avatar_url: targetUser.avatar_url,
      },
    }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });

  } catch (error) {
    return new Response(JSON.stringify({
      success: false,
      error: error.message,
    }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
```

**邀请码生成**（用户注册时自动生成，存储在 `users.invite_code` 字段）：

```sql
-- 使用 PostgreSQL 内置函数生成
UPDATE users SET invite_code = UPPER(SUBSTRING(MD5(id::text) FROM 1 FOR 6))
WHERE invite_code IS NULL;
```

---

### 3.8 Edge Function #5: `removeFriend`

```
POST /functions/v1/remove-friend
Authorization: Bearer <JWT>
Body: { target_user_id: string }
```

对 `friend_edges` 表的 DELETE 操作，同时记录到 `friend_removals` 表。

**防刷规则**：
- 记录删除时间到 `friend_removals` 表
- 非 inactive 好友删除后 24 小时内不可重新添加

---

### 3.9 Edge Function #6: `tasteTest` (Taste Test)

```
POST /functions/v1/taste-test
Authorization: Bearer <JWT>
Body: { target_user_id: string }
```

**完整实现**：

```typescript
serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const userId = await getUserId(req);
    const { target_user_id } = await req.json();
    const supabase = createServiceClient();
    const today = formatDate(new Date());

    // 1. 基础校验
    if (!target_user_id || target_user_id === userId) {
      throw new Error("INVALID_TARGET");
    }

    // 2. 验证好友关系
    const { data: isFriend } = await supabase
      .from("friend_edges")
      .select("id")
      .eq("user_id", userId)
      .eq("friend_id", target_user_id)
      .single();

    if (!isFriend) throw new Error("NOT_FRIEND");

    // 3. 获取试喝方档案
    const { data: myProfile } = await supabase
      .from("users")
      .select("*")
      .eq("id", userId)
      .single();

    if (!myProfile) throw new Error("PROFILE_NOT_FOUND");

    // 4. 获取/创建今日限制记录
    let { data: limit } = await supabase
      .from("daily_limits")
      .select("*")
      .eq("user_id", userId)
      .eq("date_key", today)
      .single();

    if (!limit) {
      const friendCount = (await supabase
        .from("friend_edges")
        .select("*", { count: "exact", head: true })
        .eq("user_id", userId)).count || 0;

      const maxTasteTests = (myProfile.friend_slots_max || 5) > 5
        ? TASTE_TEST.DAILY_MAX_PAID
        : Math.min(friendCount, TASTE_TEST.DAILY_MAX_BASE);

      await supabase.from("daily_limits").insert({
        user_id: userId,
        date_key: today,
        taste_tests_used: 0,
        taste_tests_max: maxTasteTests,
        taste_test_targets: [],
        helps_used: 0,
        helps_max: HELP.DAILY_MAX,
        help_targets: [],
      });

      limit = (await supabase
        .from("daily_limits")
        .select("*")
        .eq("user_id", userId)
        .eq("date_key", today)
        .single()).data;
    }

    if (!limit) throw new Error("INTERNAL_ERROR");

    // 5. 校验每日上限
    if (limit.taste_tests_used >= limit.taste_tests_max) {
      throw new Error("DAILY_LIMIT_REACHED");
    }

    // 6. 校验未试喝过该好友（通过数组包含判断）
    if (limit.taste_test_targets?.includes(target_user_id)) {
      throw new Error("ALREADY_TASTE_TESTED_TODAY");
    }

    // 7. 原子更新限制（使用 PostgreSQL 事务）
    const { error: updateError } = await supabase.rpc("atomic_taste_test_increment", {
      p_user_id: userId,
      p_date_key: today,
      p_target_id: target_user_id,
    });

    if (updateError) {
      if (updateError.message.includes("DAILY_LIMIT_REACHED")) {
        throw new Error("DAILY_LIMIT_REACHED");
      }
      throw updateError;
    }

    // 8. 计算收益
    const tier = myProfile.current_tier || 1;
    const avgPrice = TIER_AVG_PRICES[tier] || 18;
    const price = avgPrice + Math.floor(Math.random() * 10 - 5);

    const tasterGain = Math.floor(price * TASTE_TEST.TASTER_GAIN_RATE);
    const ownerGain = Math.floor(price * TASTE_TEST.OWNER_GAIN_RATE);

    // 9. 随机奶茶（30%概率出自定义配方）
    const { data: targetProfile } = await supabase
      .from("users")
      .select("shop_name");
    let isCustom = false;
    let drinkName = "Strawberry Milk Tea"; // 默认，实际应从配方池选取

    if (Math.random() < TASTE_TEST.CUSTOM_RECIPE_CHANCE) {
      const { data: recipes } = await supabase
        .from("custom_recipes")
        .select("name")
        .eq("user_id", target_user_id)
        .limit(1);

      if (recipes && recipes.length > 0) {
        isCustom = true;
        drinkName = recipes[0].name;
      }
    }

    // 10. 写入社交动作日志
    const actionId = generateUUID();
    await supabase.from("social_actions").insert({
      action_id: actionId,
      from_user_id: userId,
      to_user_id: target_user_id,
      action_type: "taste_test",
      drink_name: drinkName,
      drink_price: Math.max(10, price),
      taster_gain: tasterGain,
      taste_test_owner_gain: ownerGain,
      system_subsidy: price - tasterGain - ownerGain,
      is_custom_recipe: isCustom,
      custom_recipe_name: isCustom ? drinkName : null,
      date_key: today,
      status: "pending",
    });

    // 11. 被试喝方记录
    await supabase.rpc("update_taste_tested_by", {
      p_user_id: target_user_id,
      p_date_key: today,
      p_taster_id: userId,
    });

    // 12. 试喝方金币入账
    await supabase.from("users").update({
      coins: (myProfile.coins || 0) + tasterGain,
      updated_at: new Date().toISOString(),
    }).eq("id", userId);

    // 13. 更新周收入
    await supabase.rpc("update_weekly_income", {
      p_user_id: userId,
      p_amount: tasterGain,
    });

    return new Response(JSON.stringify({
      success: true,
      gain: tasterGain,
      drink_name: drinkName,
      is_custom: isCustom,
      friend_shop_name: targetProfile?.shop_name || "Unknown",
    }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });

  } catch (error) {
    return new Response(JSON.stringify({
      success: false,
      error: error.message,
    }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
```

**需要的 PostgreSQL 函数**（用于原子操作）：

```sql
-- 原子试喝次数递增
CREATE OR REPLACE FUNCTION atomic_taste_test_increment(
  p_user_id UUID, p_date_key TEXT, p_target_id UUID
) RETURNS VOID AS $$
BEGIN
  UPDATE daily_limits
  SET taste_tests_used = taste_tests_used + 1,
      taste_test_targets = array_append(taste_test_targets, p_target_id)
  WHERE user_id = p_user_id
    AND date_key = p_date_key
    AND taste_tests_used < taste_tests_max;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'DAILY_LIMIT_REACHED';
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

---

### 3.10 Edge Function #7: `helpWatch` (Cover Shift)

```
POST /functions/v1/help-watch
Authorization: Bearer <JWT>
Body: { target_user_id: string }
```

逻辑与 `tasteTest` 类似，差异在于收益计算和外卖池消费：

```
帮看店收益公式：
- 帮助方收入 = price × 15% （立即入账）
- 店主收入 = price × 70% （pending，社交日报结算）
- 系统补贴 = price × 85% （正和博弈，总收益180%）

外卖池消费：原子减少 target 的 offline_delivery_pool
```

---

### 3.11 Edge Function #8: `getSocialReport`

```
POST /functions/v1/get-social-report
Authorization: Bearer <JWT>
Body: {}
```

**业务逻辑**（合并日报查询和结算，自动结算）：

```typescript
serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const userId = await getUserId(req);
    const supabase = createServiceClient();

    // 1. 查询所有 pending 事件
    const { data: pendingActions } = await supabase
      .from("social_actions")
      .select("*")
      .eq("to_user_id", userId)
      .eq("status", "pending")
      .order("date_key", { ascending: false });

    if (!pendingActions || pendingActions.length === 0) {
      return new Response(JSON.stringify({
        success: true,
        events: [],
        net_coins: 0,
        new_friends: 0,
      }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // 2. 分类聚合
    const tasteTestEvents = pendingActions.filter(a => a.action_type === "taste_test");
    const helpEvents = pendingActions.filter(a => a.action_type === "help_watch");
    const robotEvents = pendingActions.filter(a => a.action_type === "robot_delivery");

    // 3. 计算净收益
    const totalTasteTestOwnerGain = tasteTestEvents.reduce(
      (sum: number, a: any) => sum + (a.taste_test_owner_gain || 0), 0
    );
    const totalOwnerGain = helpEvents.reduce(
      (sum: number, a: any) => sum + (a.owner_gain || 0), 0
    );
    const totalRobotGain = robotEvents.reduce(
      (sum: number, a: any) => sum + (a.owner_gain || 0), 0
    );
    const netCoins = totalTasteTestOwnerGain + totalOwnerGain + totalRobotGain;

    // 4. 自动结算：批量更新 status = 'settled'
    const actionIds = pendingActions.map((a: any) => a.action_id);
    await supabase.from("social_actions").update({
      status: "settled",
      settled_at: new Date().toISOString(),
    }).in("action_id", actionIds);

    // 5. 更新用户金币
    if (netCoins !== 0) {
      const { data: user } = await supabase
        .from("users")
        .select("coins")
        .eq("id", userId)
        .single();

      await supabase.from("users").update({
        coins: (user?.coins || 0) + netCoins,
        updated_at: new Date().toISOString(),
      }).eq("id", userId);
    }

    return new Response(JSON.stringify({
      success: true,
      net_coins: netCoins,
      summary: {
        taste_tested_count: tasteTestEvents.length,
        helped_count: helpEvents.length,
        robot_delivery_count: robotEvents.length,
      },
      events: pendingActions.map((a: any) => ({
        action_id: a.action_id,
        type: a.action_type,
        from_nickname: a.from_nickname,
        drink_name: a.drink_name,
        gain: a.action_type === "taste_test" ? a.taste_test_owner_gain
              : a.owner_gain || 0,
        timestamp: a.timestamp || a.date_key,
      })),
    }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });

  } catch (error) {
    return new Response(JSON.stringify({
      success: false,
      error: error.message,
    }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
```

---

### 3.12 Edge Function #9: `getLeaderboard`

```
POST /functions/v1/get-leaderboard
Authorization: Bearer <JWT>
Body: { category: "income" | "combo" | "decoration" }
```

```typescript
serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const userId = await getUserId(req);
    const { category = "income" } = await req.json();
    const supabase = createServiceClient();

    // 获取好友ID列表
    const { data: friendEdges } = await supabase
      .from("friend_edges")
      .select("friend_id")
      .eq("user_id", userId);

    const friendIds = friendEdges?.map(f => f.friend_id) || [];
    const allIds = [userId, ...friendIds];

    // 查询并排序（SQL窗口函数实现排名）
    const orderColumn = category === "income" ? "weekly_income"
      : category === "combo" ? "weekly_max_combo"
      : "weekly_decoration_value";

    const { data: rankings } = await supabase
      .from("users")
      .select(`id, shop_name, nickname, avatar_url, ${orderColumn}, current_tier`)
      .in("id", allIds)
      .order(orderColumn, { ascending: false })
      .limit(20);

    const entries = (rankings || []).map((user: any, index: number) => ({
      rank: index + 1,
      user_id: user.id,
      shop_name: user.shop_name,
      nickname: user.nickname,
      avatar_url: user.avatar_url,
      value: user[orderColumn] || 0,
      tier: user.current_tier,
      is_me: user.id === userId,
    }));

    return new Response(JSON.stringify({
      success: true,
      category,
      entries,
    }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });

  } catch (error) {
    return new Response(JSON.stringify({
      success: false,
      error: error.message,
    }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
```

---

## 4. RLS 策略设计

### 4.1 核心原则

| 表 | 读权限 | 写权限 | 特殊规则 |
|----|--------|--------|----------|
| `users` | 自己可读全部；好友可读部分字段 | 仅自己 | 好友可读 `shop_name`, `avatar_url`, `current_tier`, `offline_delivery_pool` |
| `social_actions` | 参与者（发件人/收件人） | 系统（Edge Function） | 用户不可直接写入 |
| `daily_limits` | 仅自己 | 系统 | 每日限制数据对他人不可见 |
| `leaderboard_cache` | 所有人可读 | 系统 | 排行榜公开数据 |
| `custom_recipes` | 自己 + 好友 | 仅自己 | 好友试喝时可读配方名 |
| `iap_records` | 仅自己 | 系统 | 购买记录隐私 |
| `friend_edges` | 自己 | 系统 | 好友关系由 Edge Function 管理 |
| `friend_removals` | 仅自己 | 系统 | 删除冷却记录 |

### 4.2 示例 RLS 策略

```sql
-- users 表：自己完全控制
CREATE POLICY "users_read_own" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "users_update_own" ON users
  FOR UPDATE USING (auth.uid() = id);

-- users 表：好友可读有限字段（通过 VIEW 实现）
CREATE VIEW public_user_profiles AS
SELECT id, shop_name, nickname, avatar_url, current_tier,
       offline_delivery_pool, last_online_at, status
FROM users;

CREATE POLICY "friends_read_public" ON users
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM friend_edges
      WHERE user_id = auth.uid() AND friend_id = users.id
    )
  );
```

---

## 5. pg_cron 定时任务

```sql
-- 每日重置（UTC 00:00 = 北京时间 08:00）
SELECT cron.schedule(
  'daily-reset',
  '0 0 * * *',
  $$
  -- 删除昨天之前的限制记录
  DELETE FROM daily_limits WHERE date_key < CURRENT_DATE - INTERVAL '1 day';

  -- 标记30天未上线用户为 inactive
  UPDATE users SET status = 'inactive'
  WHERE last_online_at < NOW() - INTERVAL '30 days'
    AND status = 'active';

  -- 删除30天前已结算的社交动作
  DELETE FROM social_actions
  WHERE status = 'settled'
    AND date_key < CURRENT_DATE - INTERVAL '30 days';
  $$
);

-- 每周重置（周一 UTC 00:00）
SELECT cron.schedule(
  'weekly-reset',
  '0 0 * * 1',
  $$
  -- 发放前三名奖励（通过 notification 表）
  INSERT INTO notifications (user_id, type, title, body, data)
  SELECT id, 'weekly_reward', 'Weekly Leaderboard Reward',
         CASE
           WHEN rn = 1 THEN 'You ranked #1! +500 coins'
           WHEN rn = 2 THEN 'You ranked #2! +300 coins'
           WHEN rn = 3 THEN 'You ranked #3! +200 coins'
         END,
         jsonb_build_object('coins', CASE WHEN rn = 1 THEN 500 WHEN rn = 2 THEN 300 ELSE 200 END)
  FROM (
    SELECT id,
           ROW_NUMBER() OVER (ORDER BY weekly_income DESC) AS rn
    FROM users WHERE weekly_income > 0
  ) ranked
  WHERE rn <= 3;

  -- 发放奖励金币
  UPDATE users SET coins = coins + CASE WHEN rn = 1 THEN 500 WHEN rn = 2 THEN 300 ELSE 200 END
  FROM (
    SELECT id, ROW_NUMBER() OVER (ORDER BY weekly_income DESC) AS rn
    FROM users WHERE weekly_income > 0
  ) ranked
  WHERE users.id = ranked.id AND ranked.rn <= 3;

  -- 重置周统计
  UPDATE users SET weekly_income = 0, weekly_max_combo = 0, weekly_decoration_value = 0;
  $$
);
```

---

*文档结束 · Boba Dash 后端设计 v1.0 · 程基岩 · 2026-08-10*
