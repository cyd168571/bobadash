# Boba Dash — Supabase 数据库Schema

> **版本**：v1.0 · **作者**：程基岩（Cheng Jiyan）· **日期**：2026-08-10
> **数据库**：PostgreSQL 15 (Supabase Managed)
> **关联文档**：`backend-design.md`、`main-architecture.md`

---

## 1. 表结构总览

| # | 表名 | 用途 | 行数预估 (10K DAU) | 索引数 | RLS |
|---|------|------|---------------------|--------|-----|
| 1 | `users` | 用户档案 | ~50K | 4 | 是 |
| 2 | `friend_edges` | 好友关系（双向） | ~500K | 3 | 是 |
| 3 | `social_actions` | 社交动作日志 | ~5M/月 | 4 | 是 |
| 4 | `daily_limits` | 每日社交限制 | ~10K×30 = 300K | 2 | 是 |
| 5 | `leaderboard_cache` | 排行榜缓存 | ~3×N 好友圈 | 2 | 是 |
| 6 | `custom_recipes` | 自定义配方 | ~50K×1 = 50K | 2 | 是 |
| 7 | `iap_records` | 内购记录 | ~5K/月 | 3 | 是 |
| 8 | `friend_removals` | 好友删除冷却 | ~50K | 2 | 是 |
| 9 | `notifications` | 通知 | ~50K×10 = 500K | 2 | 是 |

---

## 2. 完整 DDL

### 2.1 `users` — 用户档案

```sql
CREATE TABLE users (
  id            UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email         TEXT,
  shop_name     TEXT NOT NULL DEFAULT 'New Boba Shop',
  nickname      TEXT,
  avatar_url    TEXT,
  shop_thumbnail_url TEXT,

  -- 游戏进度（来自 player_saves）
  coins         INTEGER NOT NULL DEFAULT 0,
  level         INTEGER NOT NULL DEFAULT 1,
  current_tier  INTEGER NOT NULL DEFAULT 1 CHECK (current_tier BETWEEN 1 AND 5),

  -- 社交槽位
  friend_slots_max   INTEGER NOT NULL DEFAULT 5 CHECK (friend_slots_max BETWEEN 1 AND 20),
  custom_recipe_slots INTEGER NOT NULL DEFAULT 1 CHECK (custom_recipe_slots BETWEEN 1 AND 10),

  -- 离线外卖
  offline_delivery_pool INTEGER NOT NULL DEFAULT 0 CHECK (offline_delivery_pool >= 0),

  -- 机器人
  robot_type       TEXT CHECK (robot_type IN ('basic', 'standard', 'premium')),
  robot_efficiency DECIMAL(3,2),
  robot_expires_at TIMESTAMPTZ,

  -- 周统计（排行榜用）
  weekly_income          INTEGER NOT NULL DEFAULT 0,
  weekly_max_combo       INTEGER NOT NULL DEFAULT 0,
  weekly_decoration_value INTEGER NOT NULL DEFAULT 0,

  -- 装饰值
  decoration_value INTEGER NOT NULL DEFAULT 0,

  -- 赛季通行证
  pass_expires_at TIMESTAMPTZ,

  -- 邀请码（6位）
  invite_code TEXT UNIQUE,

  -- 状态
  status        TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'deleted')),
  last_online_at TIMESTAMPTZ,
  deleted_at    TIMESTAMPTZ,

  -- 时间戳
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 索引
CREATE INDEX idx_users_invite_code ON users(invite_code) WHERE invite_code IS NOT NULL;
CREATE INDEX idx_users_status ON users(status);
CREATE INDEX idx_users_last_online ON users(last_online_at);
CREATE INDEX idx_users_weekly_income ON users(weekly_income DESC);

-- 邀请码自动生成触发器
CREATE OR REPLACE FUNCTION generate_invite_code()
RETURNS TRIGGER AS $$
BEGIN
  NEW.invite_code := UPPER(SUBSTRING(MD5(NEW.id::TEXT) FROM 1 FOR 6));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_users_invite_code
  BEFORE INSERT ON users
  FOR EACH ROW
  WHEN (NEW.invite_code IS NULL)
  EXECUTE FUNCTION generate_invite_code();

-- 自动将 auth.users 同步到 public.users
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();
```

### 2.2 `friend_edges` — 好友关系表

```sql
CREATE TABLE friend_edges (
  id          BIGSERIAL PRIMARY KEY,
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  friend_id   UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  added_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- 保证每个关系只存一次
  UNIQUE(user_id, friend_id),
  -- 防止自引用
  CHECK(user_id <> friend_id)
);

-- 索引
CREATE INDEX idx_friend_edges_user ON friend_edges(user_id);
CREATE INDEX idx_friend_edges_friend ON friend_edges(friend_id);
-- 双向查询覆盖索引
CREATE INDEX idx_friend_edges_both ON friend_edges(user_id, friend_id);

-- RLS
ALTER TABLE friend_edges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_read_own_friends" ON friend_edges
  FOR SELECT USING (auth.uid() = user_id);

-- Edge Functions 使用 service_role key，绕过 RLS
```

### 2.3 `social_actions` — 社交动作日志

```sql
CREATE TABLE social_actions (
  id            BIGSERIAL PRIMARY KEY,
  action_id     UUID NOT NULL UNIQUE,  -- 幂等去重

  from_user_id  UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  to_user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  action_type   TEXT NOT NULL CHECK (action_type IN ('taste_test', 'help_watch', 'robot_delivery')),

  -- 奶茶信息
  drink_id      INTEGER,
  drink_name    TEXT,
  drink_price   INTEGER,

  -- 收益明细
  taster_gain          INTEGER DEFAULT 0,  -- 试喝方收入
  taste_test_owner_gain INTEGER DEFAULT 0,  -- 试喝店主收入
  owner_gain        INTEGER DEFAULT 0,  -- 店主收入 (help_watch/robot)
  helper_gain       INTEGER DEFAULT 0,  -- 帮忙方收入
  system_subsidy    INTEGER DEFAULT 0,  -- 系统补贴

  -- 自定义配方
  is_custom_recipe     BOOLEAN DEFAULT FALSE,
  custom_recipe_name   TEXT,

  -- 时间与状态
  date_key    TEXT NOT NULL,  -- YYYY-MM-DD 格式
  timestamp   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  status      TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'settled')),
  settled_at  TIMESTAMPTZ,

  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 索引
CREATE UNIQUE INDEX idx_social_actions_action_id ON social_actions(action_id);
-- 社交日报聚合查询（最重要索引）
CREATE INDEX idx_social_actions_to_status_date
  ON social_actions(to_user_id, status, date_key);
-- 查询"我今天试喝了谁"
CREATE INDEX idx_social_actions_from_date
  ON social_actions(from_user_id, date_key);
-- 清理过期记录
CREATE INDEX idx_social_actions_date_status
  ON social_actions(date_key, status)
  WHERE status = 'settled';

-- RLS
ALTER TABLE social_actions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "participants_read_actions" ON social_actions
  FOR SELECT USING (
    from_user_id = auth.uid() OR to_user_id = auth.uid()
  );
```

### 2.4 `daily_limits` — 每日社交限制

```sql
CREATE TABLE daily_limits (
  id              BIGSERIAL PRIMARY KEY,
  user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  date_key        TEXT NOT NULL,  -- YYYY-MM-DD

  -- 试喝限制
  taste_tests_used  INTEGER NOT NULL DEFAULT 0,
  taste_tests_max   INTEGER NOT NULL DEFAULT 5,
  taste_test_targets UUID[] NOT NULL DEFAULT '{}',  -- 已试喝目标列表

  -- 帮忙限制
  helps_used      INTEGER NOT NULL DEFAULT 0,
  helps_max       INTEGER NOT NULL DEFAULT 4,
  help_targets    UUID[] NOT NULL DEFAULT '{}',

  -- 被社交记录
  taste_tested_by      UUID[] NOT NULL DEFAULT '{}',
  helped_by          UUID[] NOT NULL DEFAULT '{}',
  taste_tested_by_count INTEGER NOT NULL DEFAULT 0,
  helped_by_count    INTEGER NOT NULL DEFAULT 0,

  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- 每人每天一条
  UNIQUE(user_id, date_key)
);

-- 索引
CREATE UNIQUE INDEX idx_daily_limits_user_date ON daily_limits(user_id, date_key);

-- RLS
ALTER TABLE daily_limits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_read_own_limits" ON daily_limits
  FOR SELECT USING (auth.uid() = user_id);
```

### 2.5 `leaderboard_cache` — 排行榜缓存

```sql
CREATE TABLE leaderboard_cache (
  id          BIGSERIAL PRIMARY KEY,
  week_start  TEXT NOT NULL,  -- YYYY-MM-DD (周一)
  category    TEXT NOT NULL CHECK (category IN ('income', 'combo', 'decoration')),
  entries     JSONB NOT NULL DEFAULT '[]',  -- [{rank, user_id, shop_name, value, prev_rank}]
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE(week_start, category)
);

-- 索引
CREATE INDEX idx_leaderboard_week_category ON leaderboard_cache(week_start, category);

-- RLS
ALTER TABLE leaderboard_cache ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anyone_read_leaderboard" ON leaderboard_cache
  FOR SELECT USING (true);
```

### 2.6 `custom_recipes` — 自定义配方

```sql
CREATE TABLE custom_recipes (
  id              BIGSERIAL PRIMARY KEY,
  user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  slot            INTEGER NOT NULL DEFAULT 1 CHECK (slot BETWEEN 1 AND 10),

  name            TEXT NOT NULL,
  base            TEXT NOT NULL,
  flavor          TEXT NOT NULL,
  topping         TEXT NOT NULL,
  glass           TEXT NOT NULL,

  sell_price      INTEGER NOT NULL DEFAULT 0,
  ingredient_cost INTEGER NOT NULL DEFAULT 0,

  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE(user_id, slot)
);

-- 索引
CREATE INDEX idx_custom_recipes_user ON custom_recipes(user_id);

-- RLS
ALTER TABLE custom_recipes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_manage_own_recipes" ON custom_recipes
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "friends_read_recipes" ON custom_recipes
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM friend_edges
      WHERE user_id = auth.uid() AND friend_id = custom_recipes.user_id
    )
  );
```

### 2.7 `iap_records` — 内购记录

```sql
CREATE TABLE iap_records (
  id              BIGSERIAL PRIMARY KEY,
  user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  product_id      TEXT NOT NULL,
  product_name    TEXT,
  price           DECIMAL(10,2),
  currency        TEXT DEFAULT 'USD',

  transaction_id  TEXT UNIQUE,       -- RevenueCat transaction ID
  order_id        TEXT,              -- Apple/Google order ID
  store           TEXT CHECK (store IN ('app_store', 'play_store', 'paypal')),

  purchase_time   TIMESTAMPTZ NOT NULL,
  status          TEXT NOT NULL DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'refunded')),
  effect_applied  BOOLEAN NOT NULL DEFAULT FALSE,

  raw_receipt     JSONB,             -- 完整收据数据

  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 索引
CREATE INDEX idx_iap_records_user ON iap_records(user_id);
CREATE INDEX idx_iap_records_transaction ON iap_records(transaction_id) WHERE transaction_id IS NOT NULL;
CREATE INDEX idx_iap_records_status ON iap_records(status);

-- RLS
ALTER TABLE iap_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_read_own_iap" ON iap_records
  FOR SELECT USING (auth.uid() = user_id);
```

### 2.8 `friend_removals` — 好友删除冷却

```sql
CREATE TABLE friend_removals (
  id              BIGSERIAL PRIMARY KEY,
  user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  removed_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  removed_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE(user_id, removed_user_id)
);

-- 索引
CREATE INDEX idx_friend_removals_user ON friend_removals(user_id);

-- RLS
ALTER TABLE friend_removals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_read_own_removals" ON friend_removals
  FOR SELECT USING (auth.uid() = user_id);
```

### 2.9 `notifications` — 通知

```sql
CREATE TABLE notifications (
  id          BIGSERIAL PRIMARY KEY,
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  type        TEXT NOT NULL CHECK (type IN ('social_event', 'weekly_reward', 'iap_success', 'system')),
  title       TEXT NOT NULL,
  body        TEXT,
  data        JSONB,         -- 附加数据（如 coins award）

  is_read     BOOLEAN NOT NULL DEFAULT FALSE,
  read_at     TIMESTAMPTZ,

  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 索引
CREATE INDEX idx_notifications_user_unread ON notifications(user_id, created_at DESC)
  WHERE is_read = FALSE;

-- RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_manage_own_notifications" ON notifications
  FOR ALL USING (auth.uid() = user_id);
```

---

## 3. RLS 策略完整汇总

```sql
-- ============================================
-- 启用所有表的 RLS
-- ============================================
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE friend_edges ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_limits ENABLE ROW LEVEL SECURITY;
ALTER TABLE leaderboard_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE custom_recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE iap_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE friend_removals ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- ============================================
-- users 表策略
-- ============================================
CREATE POLICY "users_select_own" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "users_update_own" ON users
  FOR UPDATE USING (auth.uid() = id);

-- 好友可查询有限的公开字段
CREATE POLICY "friends_select_limited" ON users
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM friend_edges
      WHERE user_id = auth.uid() AND friend_id = users.id
    )
  );

-- ============================================
-- Edge Functions 使用 service_role 绕过 RLS
-- (在 Edge Function 中创建客户端时使用 SUPABASE_SERVICE_ROLE_KEY)
-- ============================================
```

---

## 4. PostgreSQL 函数（RPC）

### 4.1 原子操作函数

```sql
-- 原子试喝递增（防并发）
CREATE OR REPLACE FUNCTION atomic_taste_test_increment(
  p_user_id UUID,
  p_date_key TEXT,
  p_target_id UUID
) RETURNS VOID AS $$
BEGIN
  UPDATE daily_limits
  SET taste_tests_used = taste_tests_used + 1,
      taste_test_targets = array_append(taste_test_targets, p_target_id),
      updated_at = NOW()
  WHERE user_id = p_user_id
    AND date_key = p_date_key
    AND taste_tests_used < taste_tests_max;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'DAILY_LIMIT_REACHED';
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 原子帮看店递增
CREATE OR REPLACE FUNCTION atomic_help_increment(
  p_user_id UUID,
  p_date_key TEXT,
  p_target_id UUID
) RETURNS VOID AS $$
BEGIN
  UPDATE daily_limits
  SET helps_used = helps_used + 1,
      help_targets = array_append(help_targets, p_target_id),
      updated_at = NOW()
  WHERE user_id = p_user_id
    AND date_key = p_date_key
    AND helps_used < helps_max;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'HELP_LIMIT_REACHED';
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 更新被试喝记录
CREATE OR REPLACE FUNCTION update_taste_tested_by(
  p_user_id UUID,
  p_date_key TEXT,
  p_taster_id UUID
) RETURNS VOID AS $$
BEGIN
  UPDATE daily_limits
  SET taste_tested_by = array_append(taste_tested_by, p_taster_id),
      taste_tested_by_count = taste_tested_by_count + 1,
      updated_at = NOW()
  WHERE user_id = p_user_id
    AND date_key = p_date_key;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 更新周收入
CREATE OR REPLACE FUNCTION update_weekly_income(
  p_user_id UUID,
  p_amount INTEGER
) RETURNS VOID AS $$
BEGIN
  UPDATE users
  SET weekly_income = weekly_income + p_amount,
      updated_at = NOW()
  WHERE id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 原子减少外卖池
CREATE OR REPLACE FUNCTION atomic_reduce_delivery_pool(
  p_user_id UUID
) RETURNS BOOLEAN AS $$
DECLARE
  v_pool INTEGER;
BEGIN
  SELECT offline_delivery_pool INTO v_pool
  FROM users WHERE id = p_user_id FOR UPDATE;

  IF v_pool <= 0 THEN
    RETURN FALSE;
  END IF;

  UPDATE users
  SET offline_delivery_pool = offline_delivery_pool - 1,
      updated_at = NOW()
  WHERE id = p_user_id;

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### 4.2 每周排行榜生成函数

```sql
CREATE OR REPLACE FUNCTION generate_weekly_leaderboard(
  p_category TEXT
) RETURNS VOID AS $$
DECLARE
  v_week_start TEXT;
BEGIN
  v_week_start := TO_CHAR(DATE_TRUNC('week', CURRENT_DATE), 'YYYY-MM-DD');

  INSERT INTO leaderboard_cache (week_start, category, entries)
  SELECT
    v_week_start,
    p_category,
    jsonb_agg(
      jsonb_build_object(
        'rank', rn,
        'user_id', id,
        'shop_name', shop_name,
        'nickname', nickname,
        'avatar_url', avatar_url,
        'value', CASE p_category
          WHEN 'income' THEN weekly_income
          WHEN 'combo' THEN weekly_max_combo
          ELSE weekly_decoration_value
        END
      ) ORDER BY rn
    )
  FROM (
    SELECT
      id, shop_name, nickname, avatar_url,
      weekly_income, weekly_max_combo, weekly_decoration_value,
      ROW_NUMBER() OVER (
        ORDER BY CASE p_category
          WHEN 'income' THEN weekly_income
          WHEN 'combo' THEN weekly_max_combo
          ELSE weekly_decoration_value
        END DESC
      ) AS rn
    FROM users
    WHERE status = 'active'
    LIMIT 100
  ) ranked
  WHERE rn <= 20
  ON CONFLICT (week_start, category)
  DO UPDATE SET entries = EXCLUDED.entries, updated_at = NOW();
END;
$$ LANGUAGE plpgsql;
```

---

## 5. pg_cron 定时任务

### 5.1 启用 pg_cron

```sql
-- Supabase Dashboard → Database → Extensions → 启用 pg_cron
CREATE EXTENSION IF NOT EXISTS pg_cron;
```

### 5.2 每日重置任务

```sql
SELECT cron.schedule(
  'daily-reset',
  '0 0 * * *',   -- 每天 UTC 00:00
  $$
  BEGIN;
  -- 1. 清理前天及之前的限制记录
  DELETE FROM daily_limits
  WHERE date_key < TO_CHAR(CURRENT_DATE - INTERVAL '1 day', 'YYYY-MM-DD');

  -- 2. 标记30天未上线的用户为 inactive
  UPDATE users
  SET status = 'inactive', updated_at = NOW()
  WHERE last_online_at < NOW() - INTERVAL '30 days'
    AND status = 'active';

  -- 3. 清理30天前已结算的社交动作日志
  DELETE FROM social_actions
  WHERE status = 'settled'
    AND date_key < TO_CHAR(CURRENT_DATE - INTERVAL '30 days', 'YYYY-MM-DD');

  -- 4. 清理过期的好友删除冷却（超过24小时）
  DELETE FROM friend_removals
  WHERE removed_at < NOW() - INTERVAL '24 hours';

  -- 5. 清理30天前已读通知
  DELETE FROM notifications
  WHERE is_read = TRUE
    AND created_at < NOW() - INTERVAL '30 days';
  COMMIT;
  $$
);
```

### 5.3 每周重置任务

```sql
SELECT cron.schedule(
  'weekly-reset',
  '0 0 * * 1',   -- 每周一 UTC 00:00
  $$
  BEGIN;
  -- 1. 生成排行榜并发放奖励
  WITH top3 AS (
    SELECT id, shop_name,
           ROW_NUMBER() OVER (ORDER BY weekly_income DESC) AS rn
    FROM users WHERE weekly_income > 0 AND status = 'active'
  )
  INSERT INTO notifications (user_id, type, title, body, data)
  SELECT
    id,
    'weekly_reward',
    'Weekly Leaderboard Reward',
    CASE
      WHEN rn = 1 THEN 'Congrats! You ranked #1 this week! +500 coins'
      WHEN rn = 2 THEN 'Great job! You ranked #2 this week! +300 coins'
      WHEN rn = 3 THEN 'Nice! You ranked #3 this week! +200 coins'
    END,
    jsonb_build_object('coins', CASE WHEN rn = 1 THEN 500 WHEN rn = 2 THEN 300 ELSE 200 END)
  FROM top3 WHERE rn <= 3;

  -- 2. 发放金币奖励
  UPDATE users u
  SET coins = u.coins + CASE WHEN t.rn = 1 THEN 500 WHEN t.rn = 2 THEN 300 ELSE 200 END
  FROM (
    SELECT id, ROW_NUMBER() OVER (ORDER BY weekly_income DESC) AS rn
    FROM users WHERE weekly_income > 0 AND status = 'active'
  ) t
  WHERE u.id = t.id AND t.rn <= 3;

  -- 3. 重置所有用户的周统计
  UPDATE users
  SET weekly_income = 0,
      weekly_max_combo = 0,
      weekly_decoration_value = 0,
      updated_at = NOW();

  -- 4. 归档排行榜（保留历史）
  PERFORM generate_weekly_leaderboard('income');
  PERFORM generate_weekly_leaderboard('combo');
  PERFORM generate_weekly_leaderboard('decoration');
  COMMIT;
  $$
);
```

---

## 6. 触发器

### 6.1 `updated_at` 自动更新

```sql
-- 为所有需要自动更新 updated_at 的表创建通用触发器函数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- users 表
CREATE TRIGGER trg_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- daily_limits 表
CREATE TRIGGER trg_daily_limits_updated_at
  BEFORE UPDATE ON daily_limits
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- custom_recipes 表
CREATE TRIGGER trg_custom_recipes_updated_at
  BEFORE UPDATE ON custom_recipes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- leaderboard_cache 表
CREATE TRIGGER trg_leaderboard_cache_updated_at
  BEFORE UPDATE ON leaderboard_cache
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

### 6.2 新用户初始化触发器

```sql
-- 当 auth.users 创建时，自动在 public.users 创建记录
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  v_shop_name TEXT;
BEGIN
  -- 生成默认店名
  v_shop_name := NEW.raw_user_meta_data->>'shop_name';
  IF v_shop_name IS NULL THEN
    v_shop_name := 'New Boba Shop';
  END IF;

  INSERT INTO public.users (
    id, email, shop_name, nickname, avatar_url,
    coins, level, current_tier,
    friend_slots_max, custom_recipe_slots,
    created_at, updated_at
  ) VALUES (
    NEW.id, NEW.email, v_shop_name,
    COALESCE(NEW.raw_user_meta_data->>'nickname', ''),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', ''),
    0, 1, 1,
    5, 1,
    NOW(), NOW()
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();
```

### 6.3 用户删除触发器（软删除）

```sql
CREATE OR REPLACE FUNCTION handle_user_deletion()
RETURNS TRIGGER AS $$
BEGIN
  -- 物理删除 cascade 到其他表
  DELETE FROM friend_edges WHERE user_id = OLD.id OR friend_id = OLD.id;
  DELETE FROM friend_removals WHERE user_id = OLD.id OR removed_user_id = OLD.id;
  DELETE FROM daily_limits WHERE user_id = OLD.id;
  DELETE FROM notifications WHERE user_id = OLD.id;
  -- social_actions 和 iap_records 保留（审计需要）
  -- custom_recipes 保留但标记
  UPDATE custom_recipes SET slot = -1 WHERE user_id = OLD.id;

  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER before_user_delete
  BEFORE DELETE ON users
  FOR EACH ROW
  EXECUTE FUNCTION handle_user_deletion();
```

---

*文档结束 · Boba Dash Supabase Schema v1.0 · 程基岩 · 2026-08-10*
