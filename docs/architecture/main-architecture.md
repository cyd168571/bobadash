# Boba Dash — 主体架构设计

> **版本**：v2.0 · **作者**：Paul · **日期**：2026-08-11（v2.0 更新）
> **平台**：React Native (Expo) iOS + Android
> **后端**：Supabase (PostgreSQL + Auth + Edge Functions)
> **关联文档**：`backend-design.md`、`supabase-schema.md`、`webview-bridge.md`、`cost-estimate.md`
>
> **v2.0 变更**：
> - 新增原生社交平台层：Apple Game Center + Google Play Games Services
> - Edge Functions 从 9 个扩展到 15 个（新增 sync-native-friends、submit-native-score 等）
> - 排行榜改为双模式：原生 Game Center / Play Games 排行榜 + Supabase 跨平台 fallback
> - 社交分享：Instagram Stories + TikTok + 系统分享

---

## 1. 架构总览

### 1.1 三层架构

Boba Dash 采用三层架构，将表现层、游戏引擎层和数据服务层清晰分离：

```
┌─────────────────────────────────────────────────────────┐
│                  React Native (Expo) Shell               │
│                                                         │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌────────┐ │
│  │ Home     │  │ Social   │  │ Shop     │  │Settings│ │
│  │ Screen   │  │ Screen   │  │ Screen   │  │ Screen  │ │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └───┬────┘ │
│       │              │              │            │       │
│  ┌────┴──────────────┴──────────────┴────────────┴───┐ │
│  │              Navigation (React Navigation)         │ │
│  └────────────────────────┬──────────────────────────┘ │
│                           │                             │
│  ┌────────────────────────┴──────────────────────────┐ │
│  │           Native Module Bridge                     │ │
│  │  ┌──────────┐ ┌───────────┐ ┌──────────────────┐ │ │
│  │  │ Revenue- │ │ Async-    │ │ react-native-    │ │ │
│  │  │ Cat SDK  │ │ Storage   │ │ webview          │ │ │
│  │  └──────────┘ └───────────┘ └────────┬─────────┘ │ │
│  └─────────────────────────────────────┼────────────┘ │
└────────────────────────────────────────┼──────────────┘
                                         │
                          JSON Message Bridge
                                         │
┌────────────────────────────────────────┼──────────────┐
│           WebView Canvas Game Layer     │              │
│                                        ▼              │
│  ┌──────────────────────────────────────────────────┐ │
│  │            Canvas 2D Game Engine                  │ │
│  │  ┌────────────┐ ┌───────────┐ ┌──────────────┐  │ │
│  │  │ game-      │ │ level-    │ │ drink-       │  │ │
│  │  │ engine.js  │ │ data.js   │ │ data.js      │  │ │
│  │  │ (95%复用)  │ │ (100%复用)│ │ (100%复用)   │  │ │
│  │  └────────────┘ └───────────┘ └──────────────┘  │ │
│  │  ┌────────────────────────────────────────────┐  │ │
│  │  │  H5 Prototype index.html (Canvas 2D + SVG) │  │ │
│  │  │  (100%复用)                                 │  │ │
│  │  └────────────────────────────────────────────┘  │ │
│  └──────────────────────────────────────────────────┘ │
└───────────────────────────────────────────────────────┘
                                         │
                              Supabase Client (postMessage)
                                         │
┌────────────────────────────────────────┼──────────────┐
│              Supabase Backend          ▼              │
│                                                       │
│  ┌───────────────┐  ┌───────────────┐  ┌───────────┐ │
│  │  Auth Service  │  │  PostgreSQL   │  │  Storage  │ │
│  │  (Email/OAuth) │  │  (6 Tables)   │  │  (Assets) │ │
│  └───────┬───────┘  └───────┬───────┘  └───────────┘ │
│          │                  │                          │
│  ┌───────┴──────────────────┴───────────────────────┐ │
│  │          Edge Functions (15 Functions)            │ │
│  │  login | syncSave | getFriendList | addFriend    │ │
│  │  removeFriend | tasteTest | helpWatch              │ │
│  │  getSocialReport | getLeaderboard                  │ │
│  │  syncNativeFriends | submitNativeScore (v2.0)     │ │
│  └──────────────────────────────────────────────────┘ │
│                                                       │
│  ┌──────────────────────────────────────────────────┐ │
│  │  Native Social Layer (v2.0 NEW)                   │ │
│  │  ┌─────────────────┐  ┌──────────────────────┐   │ │
│  │  │ Apple Game      │  │ Google Play Games    │   │ │
│  │  │ Center (iOS)    │  │ Services (Android)  │   │ │
│  │  │ - Auth          │  │ - Auth               │   │ │
│  │  │ - Leaderboards  │  │ - Leaderboards       │   │ │
│  │  │ - Friends       │  │ - Friends            │   │ │
│  │  │ - Achievements │  │ - Achievements       │   │ │
│  │  └─────────────────┘  └──────────────────────┘   │ │
│  │  ┌────────────────────────────────────────────┐   │ │
│  │  │ Social Sharing                            │   │ │
│  │  │ Instagram Stories | TikTok | Share Sheet │   │ │
│  │  └────────────────────────────────────────────┘   │ │
│  └──────────────────────────────────────────────────┘ │
│                                                       │
│  ┌──────────────────────────────────────────────────┐ │
│  │  pg_cron: dailyReset (00:00 UTC)                 │ │
│  │           weeklyReset (Mon 00:00 UTC)            │ │
│  └──────────────────────────────────────────────────┘ │
└───────────────────────────────────────────────────────┘
```

### 1.2 层级职责

| 层 | 技术栈 | 职责 | 代码复用率 |
|---|--------|------|-----------|
| **RN Shell** | React Native (Expo SDK) | 导航、原生模块调用（RevenueCat/AsyncStorage）、WebView容器托管、Auth UI | 0%（全新编写） |
| **WebView Game** | Canvas 2D + JavaScript | 游戏渲染、交互逻辑、关卡管理、本地存档 | 95%（核心引擎复用） |
| **Supabase Backend** | PostgreSQL + Edge Functions | 用户认证、社交逻辑、数据持久化、排行榜 | 60%（逻辑复用，平台适配） |

---

## 2. React Native (Expo) Shell 设计

### 2.1 技术选型

| 组件 | 选型 | 理由 |
|------|------|------|
| **框架** | Expo SDK (Managed Workflow) | 无需原生构建配置，独立开发者友好 |
| **导航** | React Navigation v7 (Native Stack) | Expo 官方推荐，性能优秀 |
| **WebView** | react-native-webview | 加载H5游戏引擎，Bridge通信 |
| **存储** | @react-native-async-storage/async-storage | 本地存档持久化 |
| **支付** | react-native-purchases (RevenueCat) | 统一IAP管理 |
| **Auth** | @supabase/supabase-js | Supabase客户端SDK |
| **Game Center** (v2.0) | expo-apple-authentication + GameKit native module | iOS 原生社交平台 |
| **Play Games** (v2.0) | Google Play Games Services SDK | Android 原生社交平台 |
| **Social Share** (v2.0) | expo-sharing + expo-media-library + URL Schemes | Instagram/TikTok 分享 |
| **动画** | react-native-reanimated | 60fps过渡动画 |
| **触觉** | expo-haptics | 游戏触觉反馈 |

### 2.2 导航结构

```
RootNavigator (NativeStackNavigator)
├── AuthStack (未登录)
│   ├── LoginScreen        — Email/Password登录 + OAuth按钮
│   ├── SignUpScreen       — 注册 + 店名设置引导
│   └── ForgotPasswordScreen
│
└── MainStack (已登录)
    ├── HomeScreen          — 游戏主界面（WebView容器 + 底部导航）
    ├── SocialScreen        — 好友列表 + 社交动作入口
    ├── ShopScreen          — IAP商店（RevenueCat Offering）
    ├── LeaderboardScreen   — 好友圈排行榜
    ├── SettingsScreen      — 账号设置 + 店名修改
    └── CustomRecipeScreen  — 自定义配方编辑
```

### 2.3 Screen 详细职责

#### HomeScreen

核心容器Screen，承载WebView游戏引擎。

```
┌─────────────────────────────────────┐
│           Status Bar                 │
├─────────────────────────────────────┤
│                                     │
│         WebView Container            │
│    (Canvas 2D Game Engine)          │
│                                     │
│    ┌───────────────────────────┐    │
│    │  游戏画面区域               │    │
│    │  • 奶茶制作界面             │    │
│    │  • 关卡进度               │    │
│    │  • 金币/等级显示           │    │
│    └───────────────────────────┘    │
│                                     │
├─────────────────────────────────────┤
│  [🏠 Home] [👥 Social] [🛒 Shop] [🏆 LB] │
└─────────────────────────────────────┘
```

**职责**：
- 创建并管理 WebView 实例
- 注册 Bridge 消息处理函数
- WebView 预加载（App启动时后台创建）
- 生命周期管理（onAppStateChange → WebView 暂停/恢复）
- 转发 WebView 消息到其他Screen（如Social动作触发导航）

#### SocialScreen

```
┌─────────────────────────────────────┐
│  ← Back          Social        +    │
├─────────────────────────────────────┤
│  Search/Invite Code: [____] [Add]   │
│─────────────────────────────────────│
│  ┌─────────────────────────────┐    │
│  │ 👤 Lily's Boba Shop         │    │
│  │    Tier 3 · Online          │    │
│  │    🎮 Game Center connected  │    │
│  │    [🥤 Taste Test]          │    │
│  │    [🤝 Cover Shift]         │    │
│  ├─────────────────────────────┤    │
│  │ 👤 Mike's Boba Shop (offline)│   │
│  │    2 pending deliveries     │    │
│  │    [🤝 Cover Shift]         │    │
│  └─────────────────────────────┘    │
│─────────────────────────────────────│
│  Daily Report: 3 new events         │
│  [View Social Report →]            │
└─────────────────────────────────────┘
```

**职责**：
- 调用 `getFriendList` Edge Function 获取好友列表（含原生平台好友）
- 显示每个好友的在线状态、Tier、待外卖数、原生平台连接状态
- 触发 `tasteTest`（Taste Test）和 `helpWatch`（Cover Shift）
- 原生平台好友邀请（Game Center / Play Games 邀请 UI）
- 邀请码输入和分享（作为原生平台的 fallback）
- 社交分享：Instagram Stories / TikTok / 系统分享
- 查看社交日报入口

#### ShopScreen

**职责**：
- 通过 RevenueCat SDK 获取 Offering（商品列表）
- 展示18个SKU（按5轨分类：Season Pass / Friend Slots / Robot / Recipe Slots / Cosmetics）
- 调用 RevenueCat `purchaseProduct()` 触发购买
- 购买成功后写 `iap_records` 表 + 应用道具效果

#### LeaderboardScreen

**职责**：
- 调用 `getLeaderboard` Edge Function
- 展示三个榜单：周收入榜、最高连击榜、装饰值榜
- 支持好友圈动态过滤
- 显示排名变化（▲▼ prev_rank）

#### SettingsScreen

**职责**：
- 店名修改（调用 `syncSave` 更新 profile）
- 头像更换（上传到 Supabase Storage）
- 删除账号（软删除，标记 `deleted_at`）
- 数据导出请求

### 2.4 原生模块职责

| 模块 | 职责 | 调用方式 |
|------|------|----------|
| **RevenueCat SDK** | IAP购买、订阅管理、收据验证 | RN → Native SDK → Apple/Google |
| **AsyncStorage** | 本地存档持久化 | RN JS API |
| **Game Center** (v2.0) | iOS 原生好友/排行榜/成就 | RN → GameKit native module |
| **Play Games** (v2.0) | Android 原生好友/排行榜/成就 | RN → GPGS native module |
| **Social Share** (v2.0) | Instagram Stories / TikTok / 系统分享 | RN → expo-sharing + URL Schemes |
| **expo-haptics** | 触觉反馈（Haptic Feedback） | WebView → postMessage → RN |
| **expo-sharing** | 分享功能（系统分享单） | RN JS API |
| **expo-linking** | Deep Link处理（邀请码） | URL scheme → RN |

---

## 3. WebView Bridge 层设计

### 3.1 架构概述

WebView Bridge 是 RN Shell 和 Canvas Game Engine 之间的通信管道。游戏引擎在 WebView 内运行，通过 `postMessage` 与 RN 层交互。

```
┌──────────────────┐                    ┌──────────────────┐
│  RN Shell        │                    │  WebView Game    │
│                  │   postMessage      │                  │
│  onMessage ◄─────┼────────────────────┼──── GAME_SAVE    │
│                  │                    │     GAME_LOAD    │
│  postMessage ────┼────────────────────┼────► onMessage   │
│                  │  NATIVE_SAVE_RESULT│                  │
│  NATIVE → GAME   │  NATIVE_LOAD_DATA  │  GAME → NATIVE   │
└──────────────────┘                    └──────────────────┘
```

详细设计见 [`webview-bridge.md`](./webview-bridge.md)。

### 3.2 存储抽象

游戏引擎原本使用 `localStorage`，需适配为 RN 层的 AsyncStorage：

| 游戏引擎调用 | RN 层实现 | 备注 |
|-------------|----------|------|
| `game.storage.save(key, data)` | Bridge → AsyncStorage.setItem() | 异步，冲突策略：服务端优先 |
| `game.storage.load(key)` | Bridge → AsyncStorage.getItem() | 启动时批量加载 |
| `game.storage.cloudSync()` | Bridge → syncSave Edge Function | 关键数据同步 |
| `game.storage.cloudLoad()` | Bridge → Supabase SELECT | 跨设备恢复 |

**冲突解决策略**（离线优先）：

```
本地存档 (local_ts)   vs   云端存档 (cloud_ts)
         │                        │
         ▼                        ▼
    比较时间戳 (last_synced_at)
         │
    ┌────┴────┬────────────┐
    │         │            │
 本地新     云端新       同时更新
    │         │            │
    └────►  以最新为准    选择金币更高的
           (几乎总是云端)  + 合并关卡进度
```

---

## 4. Supabase 后端概述

### 4.1 服务组成

| 服务 | 用途 | 备注 |
|------|------|------|
| **Auth** | Email/Password + OAuth (Apple/Google) | Sign-in-with-Apple 强制要求 |
| **PostgreSQL** | 6张核心表 + RLS策略 + pg_cron | Free Tier: 500MB |
| **Edge Functions** | 9个Deno/TypeScript函数 | 处理社交逻辑 |
| **Storage** | 头像/缩略图/分享卡片 | S3兼容 |
| **Realtime** | 社交事件实时通知（可选） | 默认不启用，异步优先 |

### 4.2 数据库表设计

| 表名 | 用途 |
|------|------|
| `users` | 用户档案 |
| `social_actions` | 社交动作日志（兼消息队列） |
| `daily_limits` | 每日社交限制 |
| `leaderboard_cache` | 排行榜缓存 |
| `custom_recipes` | 自定义配方（独立表） |
| `iap_records` | 内购记录 |

> **设计决策**：PostgreSQL 使用关系表设计：
> - `friends` 关系通过 `friend_edges` 表（`user_id` + `friend_id`）实现
> - `custom_recipes` 独立成表，通过 `user_id` 外键关联
> - 好友列表查询通过 JOIN 获取头像信息

### 4.3 Edge Functions 清单

15个Edge Functions + 2个pg_cron任务（v2.0 新增2个原生社交函数）：

| # | Edge Function | 说明 |
|---|--------------|------|
| 1 | `login` | 合并登录/初始化/离线外卖 |
| 2 | `syncSave` | 统一存档同步，含配方和档案更新 |
| 3 | `getFriendList` | SQL JOIN 查询好友列表 |
| 4 | `addFriend` | 邀请码匹配 + 原生平台好友自动匹配 |
| 5 | `removeFriend` | 删除好友关系 |
| 6 | `tasteTest` | Taste Test，经济模型 35%/20%/45% |
| 7 | `helpWatch` | Cover Shift，帮看店 |
| 8 | `getSocialReport` | 合并日报查询和结算为一步 |
| 9 | `getLeaderboard` | SQL窗口函数实现排名 + 同步到原生平台 |
| 10 | `syncNativeFriends` (v2.0) | 同步 Game Center / Play Games 好友列表到 Supabase |
| 11 | `submitNativeScore` (v2.0) | 向 Game Center / Play Games 提交排行榜分数 |
| 12 | `sendFriendRequest` | 好友请求（独立于原生平台好友） |
| 13 | `acceptFriendRequest` | 接受好友请求 |
| 14 | `getDeliveryOverflow` | 获取好友溢出订单信息 |
| 15 | `heartbeat` | 心跳检测在线状态 |

**pg_cron 定时任务**：

| 任务 | 执行时间 | 内容 |
|------|----------|------|
| `dailyReset` | 每日 00:00 UTC | 清理旧限制记录，标记inactive用户 |
| `weeklyReset` | 每周一 00:00 UTC | 重置周统计，发放排行榜奖励 |

### 4.4 RLS (Row Level Security) 策略

```sql
-- 核心原则：用户只能读写自己的数据，好友可读有限数据

-- users 表：仅自己可读写
CREATE POLICY "Users can read own data" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own data" ON users
  FOR UPDATE USING (auth.uid() = id);

-- social_actions 表：参与者可读
CREATE POLICY "Participants can read actions" ON social_actions
  FOR SELECT USING (
    from_user_id = auth.uid() OR to_user_id = auth.uid()
  );

-- Edge Functions 使用 service_role key 绕过 RLS
```

---

## 5. 数据流

### 5.1 游戏状态流

```
玩家完成关卡
    │
    ▼
game-engine.js: 更新本地状态 (coins, level, tier)
    │
    ▼
game.storage.save('gameState', localState)
    │
    ▼
WebView: postMessage({ type: 'GAME_SAVE', payload: localState })
    │
    ▼
RN Shell: 接收 GAME_SAVE
    ├── AsyncStorage.setItem('gameState', localState)  // 本地持久化
    └── supabase.functions.invoke('syncSave', { body: localState })  // 云端同步
              │
              ▼
         syncSave Edge Function
              │
              ├── UPDATE users SET coins=..., level=..., ...
              ├── 更新 weekly_stats
              └── 返回 { success: true, cloud_version: new_version }
```

### 5.2 社交动作流 (Taste Test)

```
玩家A 在 SocialScreen 点击 "Taste Test" (目标: 玩家B)
    │
    ▼
RN Shell: 校验本地缓存（是否已试喝过B）
    │
    ▼
supabase.functions.invoke('tasteTest', { body: { target_user_id: B } })
    │
    ▼
tasteTest Edge Function
    │
    ├── 1. 校验好友关系 (friendships表)
    ├── 2. 原子更新 daily_social_limits (WHERE taste_count < 5)
    ├── 3. 计算收益（服务端权威：35%给A，20%给B，45%系统注入）v2.0
    ├── 4. INSERT social_interactions (action_type = 'taste_test', status = 'completed')
    ├── 5. UPDATE users SET coins = coins + gain (玩家A立即入账)
    ├── 6. UPDATE users SET coins = coins + gain (玩家B也立即入账) v2.0
    ├── 7. UPDATE weekly_stats.total_income += gain (排行榜)
    │
    └── 返回 { success: true, tasterGain: 7, ownerGain: 4, drink_name: "Strawberry Boba" }
              │
              ▼
         RN Shell → postMessage → WebView
              │
              ▼
         game-engine.js: 更新本地金币显示 + 播放试喝动画
```

### 5.3 IAP 验证流

```
玩家在 ShopScreen 点击购买 "Friend Slots +5"
    │
    ▼
RevenueCat SDK: purchaseProduct('friend_slots_expand_1')
    │
    ▼
Apple/Google: 处理支付
    │
    ├── 成功 → RevenueCat 回调
    │        │
    │        ▼
    │   RevenueCat Webhook → Supabase Edge Function (iap_webhook)
    │        │
    │        ├── 1. 验证 webhook 签名
    │        ├── 2. INSERT iap_records
    │        ├── 3. UPDATE users SET friend_slots_max += 5
    │        └── 返回 200 OK
    │
    ├── 失败/取消 → RevenueCat SDK 返回错误
    │
    └── 恢复购买 → RevenueCat.restorePurchases()
```

---

## 6. 架构原则

### 6.1 本地优先 (Local First)

- 游戏核心逻辑完全在 WebView 内运行，无网络也能玩
- 本地状态通过 AsyncStorage 持久化
- 网络恢复后自动同步到 Supabase

### 6.2 服务端权威 (Server Authoritative)

- 所有涉及金币变动和社交动作的逻辑在 Edge Functions 中执行
- 客户端只传意图和用户ID，不传金币数值
- 收益计算算法仅存在于服务端

### 6.3 数据驱动 (Data Driven)

- 游戏配置（奶茶数据、关卡数据、社交参数）100%从 `drink-data.js` / `level-data.js` / `social.json` 复用
- 前端不硬编码数值，所有参数从配置文件读取
- 服务端常量（`constants.ts`）与前端 JSON 保持同步

### 6.4 离线友好 (Offline Friendly)

- 社交动作必须在线上执行（需要服务端验证）
- 单机关卡可离线玩，上线后批量同步
- 社交日报异步处理，登录时一次性拉取

### 6.5 代码复用最大化

```
复用矩阵：
┌─────────────────────┬──────────┬──────────────────┐
│ 源文件               │ 复用率    │ 适配工作           │
├─────────────────────┼──────────┼──────────────────┤
│ drink-data.js       │ 100%     │ 无                 │
│ level-data.js       │ 100%     │ 无                 │
│ game-engine.js      │ 95%      │ storage层适配       │
│ H5 index.html       │ 100%     │ WebView加载         │
│ social.json         │ 100%     │ 常量同步到TS        │
│ _shared/constants   │ 80%      │ JS → TypeScript    │
└─────────────────────┴──────────┴──────────────────┘
```

---

## 7. 安全设计

### 7.1 认证安全

- 密码使用 bcrypt 哈希（Supabase Auth 默认）
- OAuth 支持 Apple Sign-in（App Store 强制要求）
- JWT token 过期时间：1小时，refresh token：30天
- WebView 不持有 Supabase key（所有API调用通过RN层中转）

### 7.2 API 安全

- 所有 Edge Functions 使用 `service_role` key 调用（服务端-服务端）
- RLS 策略阻止用户直接修改他人数据
- SQL 注入防护：使用参数化查询（Supabase 默认）

### 7.3 防刷规则

| 攻击场景 | 防护措施 |
|----------|----------|
| 重复发送Taste Test请求 | `action_id` UUID 唯一约束，幂等去重 |
| 并发绕过每日限制 | `daily_limits` 原子条件更新（`WHERE used < max`） |
| 伪造金币数值 | Edge Function 服务端计算收益，客户端不传值 |
| 重复IAP凭证 | `iap_records.transaction_id` UNIQUE 约束 |
| 暴力破解密码 | Supabase Auth 内置速率限制 |
| 恶意敏感词 | 服务端内容过滤（接入第三方API） |

---

## 8. 部署架构

```
┌─────────────────────────────────────────────────────────┐
│                      CDN / Edge                          │
│  ┌─────────────────────────────────────────────────────┐│
│  │         Supabase Edge Functions (Global)            ││
│  │         • Deno Deploy (自动全球分发)                 ││
│  └─────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────┘
                            │
┌───────────────────────────┼─────────────────────────────┐
│                   Supabase Cloud                         │
│  ┌────────────┐  ┌────────────┐  ┌────────────────────┐ │
│  │ Auth       │  │ PostgreSQL │  │ Storage (S3)       │ │
│  │ (GoTrue)  │  │ (AWS RDS) │  │ + CDN              │ │
│  └────────────┘  └────────────┘  └────────────────────┘ │
└─────────────────────────────────────────────────────────┘
                            │
┌───────────────────────────┼─────────────────────────────┐
│                    3rd Party Services                    │
│  ┌────────────┐  ┌────────────┐  ┌────────────────────┐ │
│  │ RevenueCat │  │ Sentry     │  │ PostHog            │ │
│  │ (IAP)      │  │ (Error)    │  │ (Analytics)        │ │
│  └────────────┘  └────────────┘  └────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

---

*文档结束 · Boba Dash 主体架构设计 v2.0 · Paul · 2026-08-11*
