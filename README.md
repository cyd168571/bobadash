# Boba Dash 🧋

> Brew, Serve & Share Boba! — 海外 Bubble Tea 时间管理烹饪游戏

## 项目简介

Boba Dash 是一款面向全球市场的 Bubble Tea / Boba 时间管理烹饪游戏。玩家经营自己的 boba 店，制作饮品、装饰店铺、与好友社交互动。游戏采用**纯 IAP 零广告**变现模式，通过社交裂变实现零成本获客。

- **平台**：iOS + Android (React Native / Expo)
- **后端**：Supabase (PostgreSQL + Auth + Edge Functions)
- **支付**：RevenueCat (Apple IAP + Google Play IAP) + PayPal Web 商店
- **语言**：English (首发)
- **开发者**：独立开发者（零推广预算）

## 技术栈速查

| 层级 | 技术 | 用途 |
|------|------|------|
| 前端框架 | React Native + Expo | 跨平台移动应用 |
| 状态管理 | Zustand / React Context | 轻量状态管理 |
| 后端 | Supabase | PostgreSQL + Auth + Realtime + Edge Functions |
| IAP | RevenueCat (`react-native-purchases`) | 统一 Apple/Google IAP |
| 支付补充 | PayPal REST API | Web 商店支付 |
| i18n | 自建 JSON i18n 引擎 | 多语言支持 |
| 开发工具 | Cursor + VS Code | AI 辅助开发 |
| CI/CD | Expo EAS Build + Submit | 自动构建和提交 |

## 目录结构

```
bobadash/
├── docs/                           # 项目文档
│   ├── cursor-developer-guide.md   # Cursor 开发者操作指南
│   ├── gdd/                        # 游戏设计文档
│   │   ├── boba-dash-gdd-en.md     # 英文版 GDD
│   │   ├── boba-dash-gdd-zh.md     # 中文版 GDD
│   │   └── social-system-gdd.md    # 社交系统 GDD
│   ├── architecture/               # 技术架构文档
│   │   ├── main-architecture.md    # 主体架构
│   │   ├── backend-design.md       # 后端设计
│   │   ├── supabase-schema.md      # 数据库 Schema
│   │   ├── webview-bridge.md       # WebView 桥接
│   │   └── cost-estimate.md        # 成本估算
│   └── production/                 # 制作与发行文档
│       ├── business-model.md       # 商业模式
│       ├── monetization-setup.md   # IAP 接入清单
│       ├── app-store-checklist.md  # App Store 审核清单
│       ├── google-play-checklist.md# Google Play 审核清单
│       ├── aso-strategy.md         # ASO 策略
│       ├── localization.md         # 本地化方案
│       └── development-roadmap.md  # 开发路线图
├── shared/                         # 共享 TypeScript 模块
│   ├── types.ts                    # 类型定义
│   ├── drink-data.ts               # 饮品数据（1000种）
│   ├── level-data.ts               # 关卡数据（108关）
│   ├── social-config.ts            # 社交系统配置
│   ├── game-engine.ts              # 游戏引擎
│   └── storage.ts                  # 存储抽象层
├── src/                            # React Native 应用层
│   ├── navigation/
│   │   └── TabNavigator.tsx        # 底部导航
│   ├── screens/                    # 页面
│   │   ├── GameScreen.tsx          # 游戏页面（WebView）
│   │   ├── SocialScreen.tsx        # 社交页面
│   │   ├── LeaderboardScreen.tsx   # 排行榜页面
│   │   └── ProfileScreen.tsx        # 个人资料页面
│   └── services/                   # 服务层
│       ├── auth.ts                 # 认证服务
│       ├── supabase-client.ts       # Supabase 客户端
│       ├── bridge-handler.ts       # WebView Bridge 处理器
│       ├── game-center.ts          # Apple Game Center 服务
│       ├── play-games.ts           # Google Play Games 服务
│       ├── native-leaderboard.ts   # 原生排行榜服务
│       └── social-share.ts         # 社交分享服务
├── supabase/                       # Supabase 后端
│   └── migrations/
│       └── 0001_init.sql           # 数据库初始化（9表+RLS+RPC）
├── webview-game/                   # H5 游戏（WebView 内运行）
│   ├── index.html                  # 单文件 H5 游戏
│   └── *.png                       # 封面图/截图
├── .cursorrules                    # Cursor AI 规则
├── .env.example                    # 环境变量模板
├── app.json                        # Expo 配置
├── App.tsx                         # 应用入口
├── babel.config.js                 # Babel 配置
├── metro.config.js                 # Metro 配置
├── package.json                    # 依赖配置
├── tsconfig.json                   # TypeScript 配置
└── README.md                       # 本文件
```

## 核心文件索引

| 文档 | 路径 | 说明 |
|------|------|------|
| Cursor 开发指南 | `docs/cursor-developer-guide.md` | 10步 Cursor 操作指南 |
| 英文版 GDD | `docs/gdd/boba-dash-gdd-en.md` | 完整游戏设计文档（英文） |
| 中文版 GDD | `docs/gdd/boba-dash-gdd-zh.md` | 完整游戏设计文档（中文） |
| 社交系统 GDD | `docs/gdd/social-system-gdd.md` | 4 大社交机制详细设计（Taste Test / Cover Shift / Leaderboard / Custom Recipes） |
| 主体架构 | `docs/architecture/main-architecture.md` | 技术架构、数据流、Edge Functions |
| 后端设计 | `docs/architecture/backend-design.md` | 15 个 Edge Functions 详细设计 |
| 数据库 Schema | `docs/architecture/supabase-schema.md` | 9 表 + RLS + RPC + pg_cron |
| WebView 桥接 | `docs/architecture/webview-bridge.md` | RN ↔ H5 双向通信协议 |
| 成本估算 | `docs/architecture/cost-estimate.md` | Supabase 月成本估算 |
| 商业模式 | `docs/production/business-model.md` | 5 轨 18 SKU 定价策略、ARPU/LTV 模型 |
| IAP 接入 | `docs/production/monetization-setup.md` | RevenueCat 集成、18 SKU 配置、PayPal Web 商店 |
| App Store 清单 | `docs/production/app-store-checklist.md` | Apple 提交审核完整清单 |
| Google Play 清单 | `docs/production/google-play-checklist.md` | Google Play 提交审核 + 20 人封闭测试 |
| ASO 策略 | `docs/production/aso-strategy.md` | 关键词 / 截图 / A/B 测试 / TikTok 推广 |
| 本地化方案 | `docs/production/localization.md` | 英文术语表、i18n 架构、App 文案 |
| 开发路线图 | `docs/production/development-roadmap.md` | 6 阶段 18 周独立开发者路线图 |

## 开发快速开始

### 环境要求

- Node.js 18+
- npm 或 yarn
- Expo CLI (`npm install -g expo-cli`)
- Expo EAS CLI (`npm install -g eas-cli`)
- iOS 开发：macOS + Xcode 15+
- Android 开发：Android Studio + JDK 17+

### 安装与运行

```bash
# 克隆项目
git clone <repo-url> bobadash
cd bobadash

# 安装依赖
npm install

# 启动开发服务器
npx expo start

# iOS 模拟器
npx expo run:ios

# Android 模拟器
npx expo run:android
```

### Supabase 配置

1. 创建 Supabase 项目：[supabase.com](https://supabase.com)
2. 获取项目 URL 和 Anon Key
3. 创建 `.env` 文件：

```bash
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
EXPO_PUBLIC_REVENUECAT_IOS_KEY=appl_xxxxxxxxxxxx
EXPO_PUBLIC_REVENUECAT_ANDROID_KEY=goog_xxxxxxxxxxxx
```

4. 运行数据库迁移：

```bash
# 使用 Supabase CLI
supabase db push
```

5. 部署 Edge Functions：

```bash
supabase functions deploy taste-test
supabase functions deploy cover-shift
supabase functions deploy leaderboard-reset
# ... 其他 functions
```

### 构建与提交

```bash
# 构建 iOS
eas build --platform ios --profile production

# 构建 Android (AAB)
eas build --platform android --profile production

# 提交到 App Store
eas submit --platform ios --latest

# 提交到 Google Play
eas submit --platform android --latest
```

## 重要决策记录

| # | 决策 | 文档位置 | 日期 |
|---|------|---------|------|
| 1 | 移除 Season Pass / Robot Employee / 好友位扩展 | `docs/gdd/social-system-gdd.md` 1.2 | 2026-08-10 |
| 2 | 好友位固定 5 个，永不付费扩展 | `docs/gdd/social-system-gdd.md` 1.2 / 4.5 | 2026-08-10 |
| 3 | 新增 Avatar Customization + Shop Theme Music 两轨 | `docs/production/business-model.md` 2.5 / 2.6 | 2026-08-10 |
| 4 | 社交收益基于 Taster Tier 计算，防跨 Tier 套利 | `docs/gdd/social-system-gdd.md` 2.1.5 | 2026-08-10 |
| 5 | 首发仅 English，架构预留多语言 | `docs/production/localization.md` 1.1 | 2026-08-10 |
| 6 | 零广告品牌策略，不接入任何广告 SDK | `docs/production/business-model.md` 1.1 | 2026-08-10 |

## 变现 5 轨 18 SKU 速查

| 轨道 | SKU 数 | 价格区间 | 类型 |
|------|--------|---------|------|
| Decoration Packs | 4 | $0.99-$2.99 | 一次性 |
| Custom Recipes | 2 | $0.99-$1.99 | 一次性 |
| Ingredient Skins | 3 | $0.99 | 一次性 |
| Avatar Customization | 5 | $0.99-$2.99 | 一次性 |
| Shop Theme Music | 4 | $0.99-$1.99 | 一次性 |
| **合计** | **18** | $0.99-$2.99 | 零广告 |

> 完整 SKU 清单见 `docs/production/business-model.md` 附录

## 社交 4 机制速查

| 机制 | 发起方收益 | 接收方收益 | 每日上限 |
|------|-----------|-----------|---------|
| Taste Test | 35% coins | 20% coins | 5 次/天 |
| Cover Shift | 15% coins | 70% coins | 5 次/天 |
| Leaderboard | 排名竞争 | 排名竞争 | 每周重置 |
| Custom Recipes | 招牌被点 30% | 喝到好友招牌 | $0.99 解锁 |

---

© 2026 Boba Dash · All Rights Reserved
