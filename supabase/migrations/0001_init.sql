-- ============================================================
-- Boba Dash — Supabase Initial Migration
-- Version: 1.0  |  Date: 2026-08-10
-- Run: Supabase Dashboard → SQL Editor → paste → Run
-- ============================================================

-- ============================================================
-- 1. Extensions
-- ============================================================
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS pg_cron;
-- Note: pg_cron requires: Supabase Dashboard → Database → Extensions → enable pg_cron

-- ============================================================
-- 2. Tables (dependency order: users → everything else)
-- ============================================================

-- 2.1 users — user profile + game progress (merged from CN version social_profiles + player_saves)
CREATE TABLE IF NOT EXISTS users (
  id            UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email         TEXT,
  shop_name     TEXT NOT NULL DEFAULT 'New Boba Shop',
  nickname      TEXT,
  avatar_url    TEXT,
  shop_thumbnail_url TEXT,

  -- Game progress
  coins         INTEGER NOT NULL DEFAULT 0,
  level          INTEGER NOT NULL DEFAULT 1,
  current_tier  INTEGER NOT NULL DEFAULT 1 CHECK (current_tier BETWEEN 1 AND 5),

  -- Social slots
  friend_slots_max     INTEGER NOT NULL DEFAULT 5 CHECK (friend_slots_max BETWEEN 1 AND 20),
  custom_recipe_slots   INTEGER NOT NULL DEFAULT 1 CHECK (custom_recipe_slots BETWEEN 1 AND 10),

  -- Offline delivery
  offline_delivery_pool INTEGER NOT NULL DEFAULT 0 CHECK (offline_delivery_pool >= 0),

  -- Weekly stats (leaderboard)
  weekly_income          INTEGER NOT NULL DEFAULT 0,
  weekly_max_combo       INTEGER NOT NULL DEFAULT 0,
  weekly_decoration_value INTEGER NOT NULL DEFAULT 0,

  -- Decoration
  decoration_value INTEGER NOT NULL DEFAULT 0,

  -- Invite code (6-char)
  invite_code TEXT UNIQUE,

  -- Status
  status        TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'deleted')),
  last_online_at TIMESTAMPTZ,
  deleted_at    TIMESTAMPTZ,

  -- Timestamps
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2.2 friend_edges — friend relationships (bidirectional, stored once)
CREATE TABLE IF NOT EXISTS friend_edges (
  id          BIGSERIAL PRIMARY KEY,
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  friend_id   UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  added_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, friend_id),
  CHECK(user_id <> friend_id)
);

-- 2.3 social_actions — social action logs (taste_test, help_watch)
CREATE TABLE IF NOT EXISTS social_actions (
  id            BIGSERIAL PRIMARY KEY,
  action_id     UUID NOT NULL UNIQUE DEFAULT gen_random_uuid(),

  from_user_id  UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  to_user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  action_type   TEXT NOT NULL CHECK (action_type IN ('taste_test', 'help_watch')),

  -- Drink info
  drink_id      INTEGER,
  drink_name    TEXT,
  drink_price   INTEGER,

  -- Earnings breakdown
  taster_gain       INTEGER DEFAULT 0,
  owner_gain        INTEGER DEFAULT 0,
  helper_gain       INTEGER DEFAULT 0,
  system_subsidy    INTEGER DEFAULT 0,

  -- Custom recipe
  is_custom_recipe     BOOLEAN DEFAULT FALSE,
  custom_recipe_name   TEXT,

  -- Time & status
  date_key    TEXT NOT NULL,
  timestamp   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  status      TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'settled')),
  settled_at  TIMESTAMPTZ,

  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2.4 daily_limits — daily social action limits
CREATE TABLE IF NOT EXISTS daily_limits (
  id              BIGSERIAL PRIMARY KEY,
  user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  date_key        TEXT NOT NULL,

  -- Taste Test limits
  taste_tests_used  INTEGER NOT NULL DEFAULT 0,
  taste_tests_max   INTEGER NOT NULL DEFAULT 5,
  taste_test_targets UUID[] NOT NULL DEFAULT '{}',

  -- Help limits
  helps_used      INTEGER NOT NULL DEFAULT 0,
  helps_max       INTEGER NOT NULL DEFAULT 4,
  help_targets    UUID[] NOT NULL DEFAULT '{}',

  -- Incoming social records
  tasted_by          UUID[] NOT NULL DEFAULT '{}',
  helped_by          UUID[] NOT NULL DEFAULT '{}',
  tasted_by_count    INTEGER NOT NULL DEFAULT 0,
  helped_by_count    INTEGER NOT NULL DEFAULT 0,

  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE(user_id, date_key)
);

-- 2.5 leaderboard_cache — weekly leaderboard
CREATE TABLE IF NOT EXISTS leaderboard_cache (
  id          BIGSERIAL PRIMARY KEY,
  week_start  TEXT NOT NULL,
  category    TEXT NOT NULL CHECK (category IN ('income', 'combo', 'decoration')),
  entries     JSONB NOT NULL DEFAULT '[]',
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(week_start, category)
);

-- 2.6 custom_recipes — user-created drink recipes
CREATE TABLE IF NOT EXISTS custom_recipes (
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

-- 2.7 iap_records — in-app purchase records
CREATE TABLE IF NOT EXISTS iap_records (
  id              BIGSERIAL PRIMARY KEY,
  user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  product_id      TEXT NOT NULL,
  product_name    TEXT,
  price           DECIMAL(10,2),
  currency        TEXT DEFAULT 'USD',

  transaction_id  TEXT UNIQUE,
  order_id        TEXT,
  store           TEXT CHECK (store IN ('app_store', 'play_store', 'paypal')),

  purchase_time   TIMESTAMPTZ NOT NULL,
  status          TEXT NOT NULL DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'refunded')),
  effect_applied  BOOLEAN NOT NULL DEFAULT FALSE,

  raw_receipt     JSONB,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2.8 friend_removals — friend removal cooldown (24h)
CREATE TABLE IF NOT EXISTS friend_removals (
  id              BIGSERIAL PRIMARY KEY,
  user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  removed_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  removed_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, removed_user_id)
);

-- 2.9 notifications — user notifications
CREATE TABLE IF NOT EXISTS notifications (
  id          BIGSERIAL PRIMARY KEY,
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  type        TEXT NOT NULL CHECK (type IN ('social_event', 'weekly_reward', 'iap_success', 'system')),
  title       TEXT NOT NULL,
  body        TEXT,
  data        JSONB,

  is_read     BOOLEAN NOT NULL DEFAULT FALSE,
  read_at     TIMESTAMPTZ,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 3. Indexes
-- ============================================================

-- users
CREATE INDEX IF NOT EXISTS idx_users_invite_code ON users(invite_code) WHERE invite_code IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);
CREATE INDEX IF NOT EXISTS idx_users_last_online ON users(last_online_at);
CREATE INDEX IF NOT EXISTS idx_users_weekly_income ON users(weekly_income DESC);

-- friend_edges
CREATE INDEX IF NOT EXISTS idx_friend_edges_user ON friend_edges(user_id);
CREATE INDEX IF NOT EXISTS idx_friend_edges_friend ON friend_edges(friend_id);
CREATE INDEX IF NOT EXISTS idx_friend_edges_both ON friend_edges(user_id, friend_id);

-- social_actions
CREATE UNIQUE INDEX IF NOT EXISTS idx_social_actions_action_id ON social_actions(action_id);
CREATE INDEX IF NOT EXISTS idx_social_actions_to_status_date ON social_actions(to_user_id, status, date_key);
CREATE INDEX IF NOT EXISTS idx_social_actions_from_date ON social_actions(from_user_id, date_key);
CREATE INDEX IF NOT EXISTS idx_social_actions_date_status ON social_actions(date_key, status) WHERE status = 'settled';

-- daily_limits
CREATE UNIQUE INDEX IF NOT EXISTS idx_daily_limits_user_date ON daily_limits(user_id, date_key);

-- leaderboard_cache
CREATE INDEX IF NOT EXISTS idx_leaderboard_week_category ON leaderboard_cache(week_start, category);

-- custom_recipes
CREATE INDEX IF NOT EXISTS idx_custom_recipes_user ON custom_recipes(user_id);

-- iap_records
CREATE INDEX IF NOT EXISTS idx_iap_records_user ON iap_records(user_id);
CREATE INDEX IF NOT EXISTS idx_iap_records_transaction ON iap_records(transaction_id) WHERE transaction_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_iap_records_status ON iap_records(status);

-- friend_removals
CREATE INDEX IF NOT EXISTS idx_friend_removals_user ON friend_removals(user_id);

-- notifications
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON notifications(user_id, created_at DESC) WHERE is_read = FALSE;

-- ============================================================
-- 4. Row Level Security (RLS)
-- ============================================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE friend_edges ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_limits ENABLE ROW LEVEL SECURITY;
ALTER TABLE leaderboard_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE custom_recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE iap_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE friend_removals ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- users: own profile
DROP POLICY IF EXISTS "users_select_own" ON users;
CREATE POLICY "users_select_own" ON users FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "users_update_own" ON users;
CREATE POLICY "users_update_own" ON users FOR UPDATE USING (auth.uid() = id);

-- users: friends can see limited public fields
DROP POLICY IF EXISTS "friends_select_limited" ON users;
CREATE POLICY "friends_select_limited" ON users FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM friend_edges
    WHERE user_id = auth.uid() AND friend_id = users.id
  )
);

-- friend_edges: own friends
DROP POLICY IF EXISTS "users_read_own_friends" ON friend_edges;
CREATE POLICY "users_read_own_friends" ON friend_edges FOR SELECT USING (auth.uid() = user_id);

-- social_actions: participants only
DROP POLICY IF EXISTS "participants_read_actions" ON social_actions;
CREATE POLICY "participants_read_actions" ON social_actions FOR SELECT USING (
  from_user_id = auth.uid() OR to_user_id = auth.uid()
);

-- daily_limits: own only
DROP POLICY IF EXISTS "users_read_own_limits" ON daily_limits;
CREATE POLICY "users_read_own_limits" ON daily_limits FOR SELECT USING (auth.uid() = user_id);

-- leaderboard_cache: public read
DROP POLICY IF EXISTS "anyone_read_leaderboard" ON leaderboard_cache;
CREATE POLICY "anyone_read_leaderboard" ON leaderboard_cache FOR SELECT USING (true);

-- custom_recipes: own + friends
DROP POLICY IF EXISTS "users_manage_own_recipes" ON custom_recipes;
CREATE POLICY "users_manage_own_recipes" ON custom_recipes FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "friends_read_recipes" ON custom_recipes;
CREATE POLICY "friends_read_recipes" ON custom_recipes FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM friend_edges
    WHERE user_id = auth.uid() AND friend_id = custom_recipes.user_id
  )
);

-- iap_records: own only
DROP POLICY IF EXISTS "users_read_own_iap" ON iap_records;
CREATE POLICY "users_read_own_iap" ON iap_records FOR SELECT USING (auth.uid() = user_id);

-- friend_removals: own only
DROP POLICY IF EXISTS "users_read_own_removals" ON friend_removals;
CREATE POLICY "users_read_own_removals" ON friend_removals FOR SELECT USING (auth.uid() = user_id);

-- notifications: own only
DROP POLICY IF EXISTS "users_manage_own_notifications" ON notifications;
CREATE POLICY "users_manage_own_notifications" ON notifications FOR ALL USING (auth.uid() = user_id);

-- ============================================================
-- 5. PostgreSQL Functions (RPC)
-- ============================================================

-- 5.1 Invite code auto-generation
CREATE OR REPLACE FUNCTION generate_invite_code()
RETURNS TRIGGER AS $$
BEGIN
  NEW.invite_code := UPPER(SUBSTRING(MD5(NEW.id::TEXT) FROM 1 FOR 6));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_users_invite_code ON users;
CREATE TRIGGER trg_users_invite_code
  BEFORE INSERT ON users
  FOR EACH ROW
  WHEN (NEW.invite_code IS NULL)
  EXECUTE FUNCTION generate_invite_code();

-- 5.2 Auto-sync auth.users → public.users on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  v_shop_name TEXT;
BEGIN
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
    100, 1, 1,
    5, 1,
    NOW(), NOW()
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- 5.3 updated_at auto-maintenance
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_users_updated_at ON users;
CREATE TRIGGER trg_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trg_daily_limits_updated_at ON daily_limits;
CREATE TRIGGER trg_daily_limits_updated_at BEFORE UPDATE ON daily_limits FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trg_custom_recipes_updated_at ON custom_recipes;
CREATE TRIGGER trg_custom_recipes_updated_at BEFORE UPDATE ON custom_recipes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trg_leaderboard_cache_updated_at ON leaderboard_cache;
CREATE TRIGGER trg_leaderboard_cache_updated_at BEFORE UPDATE ON leaderboard_cache FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 5.4 Atomic operations (prevent concurrent abuse)

-- Atomic taste test increment
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

-- Atomic help increment
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

-- Update tasted_by (target's record)
CREATE OR REPLACE FUNCTION update_taste_tested_by(
  p_user_id UUID,
  p_date_key TEXT,
  p_taster_id UUID
) RETURNS VOID AS $$
BEGIN
  UPDATE daily_limits
  SET tasted_by = array_append(tasted_by, p_taster_id),
      tasted_by_count = tasted_by_count + 1,
      updated_at = NOW()
  WHERE user_id = p_user_id
    AND date_key = p_date_key;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update helped_by (target's record)
CREATE OR REPLACE FUNCTION update_helped_by(
  p_user_id UUID,
  p_date_key TEXT,
  p_helper_id UUID
) RETURNS VOID AS $$
BEGIN
  UPDATE daily_limits
  SET helped_by = array_append(helped_by, p_helper_id),
      helped_by_count = helped_by_count + 1,
      updated_at = NOW()
  WHERE user_id = p_user_id
    AND date_key = p_date_key;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update weekly income
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

-- Atomic reduce offline delivery pool
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

-- 5.5 Weekly leaderboard generation
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

-- 5.6 User deletion cascade
CREATE OR REPLACE FUNCTION handle_user_deletion()
RETURNS TRIGGER AS $$
BEGIN
  DELETE FROM friend_edges WHERE user_id = OLD.id OR friend_id = OLD.id;
  DELETE FROM friend_removals WHERE user_id = OLD.id OR removed_user_id = OLD.id;
  DELETE FROM daily_limits WHERE user_id = OLD.id;
  DELETE FROM notifications WHERE user_id = OLD.id;
  UPDATE custom_recipes SET slot = -1 WHERE user_id = OLD.id;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS before_user_delete ON users;
CREATE TRIGGER before_user_delete
  BEFORE DELETE ON users
  FOR EACH ROW
  EXECUTE FUNCTION handle_user_deletion();

-- ============================================================
-- 6. pg_cron Scheduled Tasks
-- ============================================================

-- 6.1 Daily reset (UTC 00:00)
SELECT cron.unschedule('daily-reset');
SELECT cron.schedule(
  'daily-reset',
  '0 0 * * *',
  $$
  BEGIN;
  DELETE FROM daily_limits
  WHERE date_key < TO_CHAR(CURRENT_DATE - INTERVAL '1 day', 'YYYY-MM-DD');

  UPDATE users
  SET status = 'inactive', updated_at = NOW()
  WHERE last_online_at < NOW() - INTERVAL '30 days'
    AND status = 'active';

  DELETE FROM social_actions
  WHERE status = 'settled'
    AND date_key < TO_CHAR(CURRENT_DATE - INTERVAL '30 days', 'YYYY-MM-DD');

  DELETE FROM friend_removals
  WHERE removed_at < NOW() - INTERVAL '24 hours';

  DELETE FROM notifications
  WHERE is_read = TRUE
    AND created_at < NOW() - INTERVAL '30 days';
  COMMIT;
  $$
);

-- 6.2 Weekly reset (Monday UTC 00:00)
SELECT cron.unschedule('weekly-reset');
SELECT cron.schedule(
  'weekly-reset',
  '0 0 * * 1',
  $$
  BEGIN;
  -- Notify top 3
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

  -- Award coins
  UPDATE users u
  SET coins = u.coins + CASE WHEN t.rn = 1 THEN 500 WHEN t.rn = 2 THEN 300 ELSE 200 END
  FROM (
    SELECT id, ROW_NUMBER() OVER (ORDER BY weekly_income DESC) AS rn
    FROM users WHERE weekly_income > 0 AND status = 'active'
  ) t
  WHERE u.id = t.id AND t.rn <= 3;

  -- Reset weekly stats
  UPDATE users
  SET weekly_income = 0,
      weekly_max_combo = 0,
      weekly_decoration_value = 0,
      updated_at = NOW();

  -- Archive leaderboard
  PERFORM generate_weekly_leaderboard('income');
  PERFORM generate_weekly_leaderboard('combo');
  PERFORM generate_weekly_leaderboard('decoration');
  COMMIT;
  $$
);

-- ============================================================
-- 7. Initial leaderboard generation (run once after first users)
-- ============================================================
SELECT generate_weekly_leaderboard('income');
SELECT generate_weekly_leaderboard('combo');
SELECT generate_weekly_leaderboard('decoration');

-- ============================================================
-- DONE!
-- Verify: SELECT count(*) FROM users; -- should be 0
-- Test: Insert a test user via Supabase Auth signup
-- ============================================================
