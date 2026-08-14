# Boba Dash — Cursor 开发者操作指南

> **版本**：v2.0 · **日期**：2026-08-11
> **适用**：独立开发者 Paul（Cursor + DeepSeek + Supabase）
> **前置条件**：Phase 0 脚手架已完成，H5 游戏已完成，Supabase 项目已创建

---

## 一、本次 v2.0 更新总览

### 1.1 变更了什么

| 变更项 | 旧值 | 新值 | 影响文件 |
|--------|------|------|---------|
| 排行榜 | 仅 Supabase 自建 | **原生 Game Center/Play Games + Supabase fallback** | native-leaderboard.ts, LeaderboardScreen.tsx |
| 好友系统 | 仅邀请码 | **原生平台好友自动导入 + 邀请码 fallback** | game-center.ts, play-games.ts, auth.ts |
| 社交分享 | 无 | **Instagram Stories + TikTok + 系统分享** | social-share.ts, SocialScreen.tsx |
| Edge Functions | 9 个 | **15 个**（新增 syncNativeFriends, submitNativeScore 等） | main-architecture.md, social-system-gdd.md |

### 1.2 新增的代码文件

```
BobaDash/
├── shared/
│   ├── social-config.ts          [已更新] 经济模型 + 原生平台配置
│   └── types.ts                  [已更新] 社交类型重命名
├── src/
│   ├── services/
│   │   ├── game-center.ts        [新增] Apple Game Center 服务
│   │   ├── play-games.ts         [新增] Google Play Games 服务
│   │   ├── native-leaderboard.ts [新增] 统一排行榜接口
│   │   ├── social-share.ts       [新增] Instagram/TikTok 分享服务
│   │   └── auth.ts               [已更新] 添加原生社交身份链接
│   └── screens/
│       ├── SocialScreen.tsx      [已更新] Taste Test + 分享按钮
│       └── LeaderboardScreen.tsx  [已更新] 原生排行榜入口
├── docs/
│   ├── gdd/social-system-gdd.md         [已更新] v2.0
│   ├── architecture/main-architecture.md [已更新] v2.0
│   └── production/development-roadmap.md [已更新] v2.0
└── docs/
    └── cursor-developer-guide.md       [本文件] 新增
```

---

## 二、Cursor 中的操作步骤

### 第 1 步：安装新增依赖

在 Cursor 终端（`Ctrl + ~`）中执行：

```bash
# 进入项目目录
cd BobaDash

# 安装原生社交和分享依赖
npx expo install expo-apple-authentication
npx expo install expo-sharing
npx expo install expo-media-library
npx expo install expo-file-system
npx expo install expo-auth-session
npx expo install expo-crypto

# 如果之前没装过这些基础依赖，也需要安装
npx expo install @react-native-async-storage/async-storage
npx expo install expo-haptics
npx expo install expo-linking
npx expo install expo-secure-store
```

> **注意**：`expo-apple-authentication` 只在 iOS 上有效。Android 会自动跳过，不影响编译。

### 第 2 步：配置 app.json（Expo 配置）

打开 `BobaDash/app.json`，确保以下配置存在（如果不存在则添加）：

```json
{
  "expo": {
    "name": "Boba Dash",
    "scheme": "bobadash",
    "ios": {
      "bundleIdentifier": "com.bobadash.app",
      "supportsTablet": false,
      "infoPlist": {
        "NSPhotoLibraryUsageDescription": "Save your Boba Dash shop card to your photo library.",
        "NSPhotoLibraryAddUsageDescription": "Add your Boba Dash share card to your photo library."
      },
      "associatedDomains": ["applinks:bobadash.app"],
      "entitlements": {
        "com.apple.developer.game-center": true
      }
    },
    "android": {
      "package": "com.bobadash.app",
      "permissions": [
        "android.permission.READ_EXTERNAL_STORAGE",
        "android.permission.WRITE_EXTERNAL_STORAGE"
      ],
      "intentFilters": [
        {
          "action": "VIEW",
          "data": { "scheme": "bobadash" },
          "category": ["BROWSABLE", "DEFAULT"]
        }
      ]
    },
    "plugins": [
      [
        "expo-media-library",
        {
          "photosPermission": "Allow Boba Dash to save your shop card to your photo library.",
          "savePhotosPermission": "Allow Boba Dash to save your shop card to your photo library."
        }
      ]
    ]
  }
}
```

### 第 3 步：配置 Supabase Auth Providers

在浏览器中打开你的 Supabase Dashboard：

1. **Authentication → Providers → Apple**
   - 开启 Enable Apple provider
   - 填入 Service ID（在 Apple Developer Console 创建）
   - 填入 Team ID 和 Key ID
   - Redirect URL：`https://你的项目.supabase.co/auth/v1/callback`

2. **Authentication → Providers → Google**
   - 开启 Enable Google provider
   - 填入 Client ID 和 Client Secret（Google Cloud Console 创建）
   - Redirect URL：`https://你的项目.supabase.co/auth/v1/callback`

3. **Authentication → URL Configuration**
   - Add Redirect URL：`bobadash://auth/callback`

### 第 4 步：在 App Store Connect 配置 Game Center

> 仅在你有 Apple Developer 账号（$99/年）后执行

1. 打开 [App Store Connect](https://appstoreconnect.apple.com) → 你的 App → **Game Center**
2. **Leaderboards** 标签 → 点击 `+` 添加 3 个排行榜：

| Leaderboard Reference | Display Name | Sort Order | Score Format |
|----------------------|-------------|------------|--------------|
| `boba_weekly_income` | Weekly Income | Descending | Integer |
| `boba_max_combo` | Max Combo | Descending | Integer |
| `boba_decoration_score` | Decoration Score | Descending | Integer |

3. **Achievements** 标签 → 点击 `+` 添加 7 个成就：

| Achievement Reference | Display Name | Points | Hidden |
|----------------------|-------------|--------|--------|
| `boba_first_serve` | First Cup Served | 5 | No |
| `boba_level_10` | Level 10 | 10 | No |
| `boba_level_50` | Level 50 | 25 | Yes |
| `boba_level_100` | Level 100 | 50 | Yes |
| `boba_first_taste_test` | First Taste Test | 5 | No |
| `boba_first_cover_shift` | First Cover Shift | 5 | No |
| `boba_100_served` | 100 Cups Served | 20 | No |

4. 记录这些 ID，它们已经在 `social-config.ts` 的 `NATIVE_SOCIAL_CONFIG.gameCenter` 中配置好了

### 第 5 步：在 Google Play Console 配置 Play Games

> 仅在你有 Google Play Developer 账号（$25 一次性）后执行

1. 打开 [Google Play Console](https://play.google.com/console) → 你的 App → **Grow → Play Games Services**
2. 添加 3 个 Leaderboards（ID 与 social-config.ts 一致）
3. 添加 7 个 Achievements（ID 与 social-config.ts 一致）
4. Link your app（package name 必须与 app.json 中一致）
5. 创建 OAuth 2.0 Client ID（在 Google Cloud Console 中）

### 第 6 步：在 Cursor 中理解代码结构

在 Cursor 中打开项目后，使用 `Ctrl + P` 快速跳转到以下文件，按顺序阅读：

```
1. shared/social-config.ts          → 核心配置（经济模型、原生平台ID）
2. src/services/game-center.ts     → Game Center 服务（iOS）
3. src/services/play-games.ts      → Play Games 服务（Android）
4. src/services/native-leaderboard.ts → 统一排行榜接口
5. src/services/social-share.ts    → 社交分享服务
6. src/services/auth.ts            → 认证服务（含原生社交链接）
7. src/screens/SocialScreen.tsx    → 社交主页面
8. src/screens/LeaderboardScreen.tsx → 排行榜页面
```

### 第 7 步：实现 TODO 标记的功能

所有新增服务文件中的 `TODO` 注释标记了需要实现的原生模块调用。以下是实现策略：

#### 策略 A：使用社区 Expo Config Plugin（推荐）

在 Cursor 中搜索安装 GameKit / Play Games 的 Expo config plugin：

```
# Cursor 终端执行
npm search expo-game-center   # 搜索社区包
npm search react-native-game-center
```

如果找到合适的社区包，直接安装并在服务文件中替换 TODO 部分。

#### 策略 B：创建自定义 Native Module

如果社区包不满足需求，需要创建原生模块。在 Cursor 中：

1. **iOS 端**（Swift）：
   - 创建 `BobaDash/ios/GameKitModule.swift`
   - 使用 `GKLocalPlayer` API
   - 通过 `EXModuleAdapter` 暴露给 Expo

2. **Android 端**（Kotlin）：
   - 创建 `BobaDash/android/PlayGamesModule.kt`
   - 使用 `GoogleSignInClient` + `Games.getLeaderboardsClient()`
   - 通过 Expo Modules API 暴露

3. 在 Cursor 中告诉 DeepSeek：
   > "帮我创建一个 Expo native module，用于调用 iOS GameKit 的 authenticateLocalPlayer, submitScore, loadFriends 方法。参考 src/services/game-center.ts 中的接口定义。"

#### 策略 C：Eject 到 Bare Workflow（最后手段）

如果 Expo managed workflow 无法满足原生模块需求：

```bash
npx expo eject
```

然后可以直接用 `react-native-game-center` 等 npm 包。

### 第 8 步：实现 Edge Functions

在 Supabase 项目中创建以下 Edge Functions（在 Cursor 中编写，通过 `supabase functions deploy` 部署）：

```bash
# 创建函数目录
mkdir -p supabase/functions/taste-test
mkdir -p supabase/functions/sync-native-friends
mkdir -p supabase/functions/submit-native-score

# 在 Cursor 中创建以下文件：
# supabase/functions/taste-test/index.ts
# supabase/functions/sync-native-friends/index.ts
# supabase/functions/submit-native-score/index.ts

# 部署
supabase functions deploy taste-test
supabase functions deploy sync-native-friends
supabase functions deploy submit-native-score
```

**taste-test Edge Function 核心逻辑**（参考 `social-system-gdd.md` 第 3.3.2 节的伪代码）：

```typescript
// supabase/functions/taste-test/index.ts
// 关键变更点：
//   1. 函数名从 grab-a-drink → taste-test
//   2. 收益分配从 45%/8%/47% → 35%/20%/45%
//   3. interaction_type 从 'grab' → 'taste_test'
//   4. 双方都获得正收益（不再有"loss"概念）
```

### 第 9 步：更新数据库 Schema

在 Supabase SQL Editor 中执行以下变更：

```sql
-- v2.0 Schema 变更

-- 1. 更新 social_interactions 表的 interaction_type 约束
ALTER TABLE social_interactions
  DROP CONSTRAINT IF EXISTS social_interactions_interaction_type_check;
ALTER TABLE social_interactions
  ADD CONSTRAINT social_interactions_interaction_type_check
  CHECK (interaction_type IN ('taste_test', 'cover', 'leaderboard_reset'));

-- 2. 更新 daily_social_limits 表字段名
ALTER TABLE daily_social_limits
  RENAME COLUMN grab_count TO taste_count;
ALTER TABLE daily_social_limits
  RENAME COLUMN grabbed_friends TO tasted_friends;

-- 3. 新增原生平台好友链接表 (v2.0)
CREATE TABLE IF NOT EXISTS native_social_links (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  platform VARCHAR(20) NOT NULL CHECK (platform IN ('game_center', 'play_games')),
  native_player_id VARCHAR(255) NOT NULL,
  native_friends JSONB DEFAULT '[]'::jsonb,
  linked_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_native_link UNIQUE (user_id, platform)
);

CREATE INDEX idx_native_links_user ON native_social_links(user_id);
CREATE INDEX idx_native_links_player ON native_social_links(platform, native_player_id);

-- 4. 启用 RLS
ALTER TABLE native_social_links ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own native links" ON native_social_links
  FOR SELECT USING (auth.uid() = user_id);

-- Edge Functions 使用 service_role 绕过 RLS
```

### 第 10 步：测试验证

在 Cursor 中运行 Expo：

```bash
cd BobaDash
npx expo start
```

测试清单：

- [ ] App 启动无报错
- [ ] 离线模式可玩（H5 游戏在 WebView 中运行）
- [ ] 登录后 SocialScreen 显示 "Taste Test" 按钮
- [ ] LeaderboardScreen 显示 "View on Game Center / Play Games" 按钮
- [ ] 点击 "Share" 按钮弹出分享选项对话框
- [ ] 点击 "Invite" 按钮调用原生邀请 UI 或分享链接

---

## 三、代码文件说明

### 3.1 `shared/social-config.ts`（核心配置）

**变更点**：
- `TASTE_TEST_CONFIG` 配置块包含 Taste Test 经济模型参数
- 收益率：`tasterGainRate: 0.35`、`tastedGainRate: 0.20`、`systemSubsidyRate: 0.45`
- 新增 `NATIVE_SOCIAL_CONFIG` 配置块（Game Center / Play Games 排行榜 ID + 成就 ID）
- 新增 `TIER_MULTIPLIERS` 和 `getTierFromLevel` 辅助函数
- `calculateTasteTestEarnings` 计算试喝收益

**在 Cursor 中如何使用**：
```typescript
// 在任何文件中引用
import { TASTE_TEST_CONFIG, calculateTasteTestEarnings, getTierFromLevel } from '@shared/social-config';

// 计算试喝收益
const tier = getTierFromLevel(playerLevel);
const earnings = calculateTasteTestEarnings(20, tier);
// earnings.tasterGain = 7 coins (Tier 1)
// earnings.tastedGain = 4 coins (Tier 1)
```

### 3.2 `src/services/game-center.ts`（Game Center 服务）

**功能**：Apple Game Center 的认证、排行榜提交、好友获取、成就解锁

**TODO 标记说明**：
- `authenticate()`：需要调用 `expo-apple-authentication` 或自定义 GameKit native module
- `submitScore()`：需要调用 GameKit 的 `GKScore` API
- `getFriends()`：需要调用 `GKLocalPlayer.loadFriends()`
- `showLeaderboard()`：需要调用 `GKGameCenterViewController`
- `unlockAchievement()`：需要调用 `GKAchievement`

**实现优先级**：Phase 2 中后期（先跑通 Supabase 社交，再接入原生平台）

### 3.3 `src/services/play-games.ts`（Play Games 服务）

**功能**：Google Play Games Services 的认证、排行榜提交、好友获取、成就解锁

**TODO 标记说明**：
- `authenticate()`：使用 `expo-auth-session` 的 Google provider
- `submitScore()`：需要 GPGS native module
- `getFriends()`：需要 GPGS native module + 用户授权
- `showLeaderboard()`：需要 GPGS native module

**实现优先级**：Phase 2 中后期

### 3.4 `src/services/native-leaderboard.ts`（统一排行榜）

**功能**：抽象 Game Center / Play Games 排行榜调用，统一接口

**核心方法**：
- `submitScore(category, score)`：同时提交到原生平台和 Supabase
- `showLeaderboard(category)`：打开原生排行榜 UI
- `getFriendRankings(category)`：从 Supabase 获取跨平台好友排名
- `syncFriends(supabaseClient)`：同步原生好友到 Supabase

### 3.5 `src/services/social-share.ts`（社交分享）

**功能**：生成和分享 Share Card 到 Instagram Stories / TikTok / 系统分享

**核心方法**：
- `shareText(message)`：纯文本分享
- `shareImage(fileUri, message)`：图片分享（系统分享单）
- `shareToInstagramStories(imageBase64)`：Instagram Stories 深链接
- `shareToTikTok(fileUri, message)`：TikTok 分享
- `showShareDialog(imageDataUrl, message)`：弹出选择对话框
- `captureWebViewScreenshot(webViewRef)`：从 WebView Canvas 截图

### 3.6 `src/services/auth.ts`（认证服务更新）

**变更点**：
- 新增 `linkNativeSocialIdentity()` 函数
- 在 `onAuthSuccess()` 中自动调用原生社交链接
- iOS 自动调用 `GameCenterService.authenticate()` + `syncFriendsToSupabase()`
- Android 自动调用 `PlayGamesService.authenticate()` + `syncFriendsToSupabase()`
- 原生链接失败不会阻断登录（非阻塞式）

### 3.7 `src/screens/SocialScreen.tsx`（社交页面更新）

**变更点**：
- "Taste Test" 按钮
- 新增 Game Center / Play Games 连接状态显示
- 新增 "Share" 按钮和 "Invite" 按钮
- Taste Test 按钮包含图标 + 文字标签
- 好友列表支持下拉刷新

### 3.8 `src/screens/LeaderboardScreen.tsx`（排行榜页面更新）

**变更点**：
- 新增 "View on Game Center / Play Games →" 按钮
- 排行榜数据支持刷新（下拉刷新）
- 新增排名变化指示（▲/▼）
- 空状态引导更清晰

---

## 四、Cursor 高效编码建议

### 4.1 使用 .cursorrules 加速开发

项目根目录已有 `.cursorrules` 文件。在 Cursor 中，DeepSeek 会自动读取并遵循这些规则。如果需要修改，直接编辑该文件。

### 4.2 常用 Cursor 快捷键

| 快捷键 | 功能 | 使用场景 |
|--------|------|---------|
| `Ctrl + P` | 快速打开文件 | 跳转到任意文件 |
| `Ctrl + Shift + F` | 全局搜索 | 搜索 "Taste Test" 查找相关代码 |
| `Ctrl + D` | 选中相同词 | 批量修改变量名 |
| `Ctrl + Shift + L` | 选中所有相同词 | 全局替换 |
| `Ctrl + /` | 注释/取消注释 | 调试时注释 TODO |
| `Ctrl + ~` | 打开终端 | 安装依赖、运行 Expo |
| `Ctrl + Shift + P` | 命令面板 | 运行 Cursor 命令 |

### 4.3 在 Cursor 中向 DeepSeek 提问的模板

**实现 Edge Function**：
> "帮我创建 supabase/functions/taste-test/index.ts。这是一个 Supabase Edge Function（Deno/TypeScript），需要：1) 校验 JWT 2) 校验好友关系 3) 原子更新 daily_social_limits 4) 计算 35%/20%/45% 收益分配 5) 发放金币到双方。参考 shared/social-config.ts 中的 TASTE_TEST_CONFIG 和 social-system-gdd.md 第 3.3.2 节。"

**创建 Native Module**：
> "帮我创建一个 Expo native module，用于 iOS GameKit 集成。需要实现以下方法：authenticateLocalPlayer(), submitScore(leaderboardId, score), loadFriends(), showLeaderboard(leaderboardId)。参考 src/services/game-center.ts 中的接口定义。使用 Swift + Expo Modules API。"

**修改 UI**：
> "帮我修改 src/screens/SocialScreen.tsx，在好友卡片中添加 Taste Test 按钮的禁用状态样式（当 tasteTestsUsed >= dailyMax 时按钮变灰）。参考 shared/social-config.ts 中的 TASTE_TEST_CONFIG.dailyMax。"

---

## 五、下一步执行清单

按以下顺序在 Cursor 中推进：

### 立即可做（今天）
- [ ] 安装新增依赖（第 1 步）
- [ ] 更新 app.json（第 2 步）
- [ ] 在 Cursor 中通读 4 个新服务文件，理解接口设计
- [ ] 全局搜索 "Grab" 确认所有引用已更新为 "Taste Test"

### 需要 Supabase（1-2 天内）
- [ ] 配置 Supabase Auth Providers（第 3 步）
- [ ] 执行数据库 Schema 变更（第 9 步）
- [ ] 编写并部署 taste-test Edge Function（第 8 步）

### 需要开发者账号（Phase 2 中期）
- [ ] 配置 App Store Connect Game Center（第 4 步）
- [ ] 配置 Google Play Console Play Games（第 5 步）
- [ ] 实现 Game Center native module TODO（第 7 步策略 A/B）
- [ ] 实现 Play Games native module TODO

### Phase 2 后期
- [ ] 实现社交分享的 WebView Canvas 截图
- [ ] 编写 sync-native-friends Edge Function
- [ ] 编写 submit-native-score Edge Function
- [ ] 测试全链路：登录 → 原生好友 → Taste Test → 排行榜 → 分享

---

## 六、常见问题

### Q: 为什么不直接用 Facebook SDK？
A: Facebook Gaming SDK 正在废弃，年轻用户流失，且好友列表不精准。Game Center / Play Games 是系统级社交，零摩擦、零维护。

### Q: 如果用户没有 Game Center / Play Games 账号怎么办？
A: 系统自动 fallback 到邀请码模式。SocialScreen 中 "Invite" 按钮会检测原生平台是否可用，不可用则分享邀请码链接。

### Q: 跨平台好友怎么匹配？
A: iOS 玩家的 Game Center 好友和 Android 玩家的 Play Games 好友都同步到 Supabase 的 `native_social_links` 表。如果两个玩家用同一个邮箱注册 Supabase，系统自动匹配为好友。

### Q: Instagram Stories 分享在 Android 上怎么实现？
A: Android 没有原生的 "instagram-stories://" URL scheme。在 Android 上，我们使用系统分享面板，Instagram 会作为选项出现在列表中。用户选择后可以在 Instagram 中编辑并发布为 Story。

### Q: Taste Test 经济模型变更会影响现有玩家吗？
A: 这是新项目，没有现有玩家。如果是迁移已有项目，需要执行一次 `UPDATE users SET coins = coins + adjustment` 来补偿 Owner 侧的历史差异。

---

*文档结束 · Boba Dash Cursor 开发者操作指南 v2.0 · 2026-08-11*
