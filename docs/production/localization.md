# Boba Dash — 本地化方案

> **文档状态**：Draft v1.0 · **日期**：2026-08-10
> **关联文档**：`aso-strategy.md`、`app-store-checklist.md`、`google-play-checklist.md`

---

## 一、本地化策略总览

### 1.1 定位

Boba Dash 首发以 **English** 为唯一语言，面向全球 iOS + Android 用户。本地化策略采用"**首发精简、架构先行、按需扩展**"原则：

| 原则 | 说明 |
|------|------|
| 首发精简 | 只做 English，确保核心体验打磨到位，不分散开发资源 |
| 架构先行 | 代码层面预留多语言架构（i18n JSON + 语言切换），未来扩展不改代码 |
| 按需扩展 | 根据用户地域分布和增长数据决定扩展语言，不盲目铺语言 |

### 1.2 为什么首发只做 English

| 因素 | 分析 |
|------|------|
| 平台 | iOS App Store + Google Play 面向全球，English 是通用语言 |
| 目标用户 | 18-35 岁全球休闲玩家，English 是游戏行业通用语言 |
| 社交裂变 | 跨地区社交分享需要统一语言，English 保证 Share Card 全球通用 |
| 开发资源 | 独立开发者，多语言翻译和质量管控成本高 |
| Boba 文化 | Boba / Bubble Tea 文化源于台湾，在英语世界（尤其美国）有强共鸣 |
| ASO | English 关键词覆盖面最广，是海外 ASO 的基础 |

---

## 二、英文术语表

### 2.1 中文 → 英文完整映射（约 60 个术语）

#### 核心游戏术语

| # | 中文 | 英文 | 说明 |
|---|------|------|------|
| 1 | 奶茶店 | Boba Shop | 游戏内店铺名称 |
| 2 | 奶茶 | Boba / Bubble Tea | 美国用 "Boba" 更多，两个词互换使用 |
| 3 | 珍珠 | Boba Pearls / Tapioca Pearls | 美国用 "Boba Pearls" 更多 |
| 4 | 椰果 | Coconut Jelly | 标准 |
| 5 | 布丁 | Pudding | 标准 |
| 6 | 仙草 | Grass Jelly | 标准 |
| 7 | 奶昔 | Milkshake | 标准 |
| 8 | 抹茶拿铁 | Matcha Latte | 标准 |
| 9 | 百香果气泡 | Passion Fruit Sparkling | 标准 |
| 10 | 金币 | Coins | 游戏内货币 |
| 11 | 关卡 | Level | 标准 |
| 12 | 连击 | Combo | 标准游戏术语 |
| 13 | 完美 | Perfect! | Combo 评价 |
| 14 | 顾客 | Customer | 标准 |
| 15 | 外卖 | Delivery / Delivery Order | 海外用 "Delivery" |
| 16 | 外卖溢出 | Delivery Overflow | 离线累积的未处理外卖 |
| 17 | 店铺 | Shop / Cafe | 互换使用 |
| 18 | 营业 | Open / Business | "开始营业" = "Open Shop" |
| 19 | 交付 | Serve | 交付饮品给顾客 |
| 20 | 装饰 | Decoration | 标准 |
| 21 | 装饰值 | Decoration Score | 排行榜维度 |
| 22 | 招牌配方 | Signature Recipe / Custom Recipe | 玩家自创配方 |
| 23 | 配方 | Recipe | 标准 |
| 24 | 槽位 | Slot | 配方槽位 |
| 25 | 基底 | Base | 配方组成元素 |
| 26 | 风味 | Flavor | 配方组成元素 |
| 27 | 顶料 | Topping | 配方组成元素 |
| 28 | 杯型 | Glass / Cup | 配方组成元素 |
| 29 | 食材外观 | Ingredient Skin | 视觉变体 |
| 30 | 头像 | Avatar | 玩家形象 |
| 31 | 发型 | Hairstyle | Avatar 组成 |
| 32 | 服装 | Outfit | Avatar 组成 |
| 33 | 配饰 | Accessory | Avatar 组成 |
| 34 | 背景音乐 | Theme Music / BGM | 店铺音乐 |

#### 社交术语

| # | 中文 | 英文 | 说明 |
|---|------|------|------|
| 35 | 试喝 | Taste Test | "Taste Test" implies free sample — positive, mutually beneficial framing |
| 36 | 帮忙看店 | Cover Shift | "Cover Shift" 有美式打工文化感 |
| 37 | 试喝者 | Taster | 发起 Taste Test 的人 |
| 38 | 店主 | Owner | 被 Taste Test / 被 Cover 的人 |
| 39 | 帮忙者 | Helper | 发起 Cover 的人 |
| 40 | 好友 | Friend | 标准 |
| 41 | 好友位 | Friend Slot | 好友列表容量 |
| 42 | 好友圈 | Friend Circle | 排行榜范围 |
| 43 | 排行榜 | Leaderboard | 标准游戏术语 |
| 44 | 周收入 | Weekly Income | 排行榜维度 |
| 45 | 最高连击 | Max Combo | 排行榜维度 |
| 46 | 社交日报 | Social Report | 每日社交互动汇总 |
| 47 | 分享卡片 | Share Card | 分享到社交媒体的卡片 |
| 48 | 好友请求 | Friend Request | 标准 |
| 49 | 添加好友 | Add Friend | 标准 |

#### UI / 商店术语

| # | 中文 | 英文 | 说明 |
|---|------|------|------|
| 50 | 商店 | Shop / Store | App 内商店 |
| 51 | 装饰包 | Decoration Pack | SKU 类型 |
| 52 | 食材外观包 | Ingredient Skin Pack | SKU 类型 |
| 53 | 头像定制包 | Avatar Customization Pack | SKU 类型 |
| 54 | 店铺主题音乐 | Shop Theme Music | SKU 类型 |
| 55 | 恢复购买 | Restore Purchases | Apple 必需 |
| 56 | 设置 | Settings | 标准 |
| 57 | 账号 | Account | 标准 |
| 58 | 删除账号 | Delete Account | Apple 必需 |
| 59 | 隐私政策 | Privacy Policy | 标准 |
| 60 | 服务条款 | Terms of Service | 标准 |

### 2.2 饮品名称映射

| 中文 | 英文 | 备注 |
|------|------|------|
| 经典奶茶 | Classic Milk Tea | 基底之一 |
| 绿茶 | Green Tea | 基底之一 |
| 乌龙茶 | Oolong Tea | 基底之一 |
| 水果茶 | Fruit Tea | 基底之一 |
| 草莓 | Strawberry | 风味 |
| 芒果 | Mango | 风味 |
| 抹茶 | Matcha | 风味 |
| 芋头 | Taro | 风味 |
| 黑糖 | Brown Sugar | 风味 |
| 蜂蜜 | Honey | 风味 |
| 薰衣草 | Lavender | 风味 |
| 蜜桃 | Peach | 风味 |
| 百香果 | Passion Fruit | 风味 |
| 巧克力 | Chocolate | 风味 |
| 水晶珍珠 | Crystal Boba | 顶料 |
| 芦荟 | Aloe Vera | 顶料 |
| 奶盖 | Cheese Foam | 顶料 |
| 鲜奶油 | Whipped Cream | 顶料 |
| 荔枝冻 | Lychee Jelly | 顶料 |
| 经典杯 | Classic Cup | 杯型 |
| 梅森罐 | Mason Jar | 杯型 |
| 随行杯 | Tumbler | 杯型 |
| 气泡杯 | Bubble Cup | 杯型 |

---

## 三、i18n 架构设计

### 3.1 JSON Key-Value 结构

```
/src/i18n/
  en.json          // English（首发）
  es.json          // Spanish（预留，P3）
  ja.json          // Japanese（预留，P3）
  ko.json          // Korean（预留，P3）
  zh-CN.json       // 简体中文（预留，P3）
```

### 3.2 en.json 完整结构

```json
{
  "common": {
    "confirm": "Confirm",
    "cancel": "Cancel",
    "close": "Close",
    "loading": "Loading...",
    "retry": "Retry",
    "save": "Save",
    "delete": "Delete",
    "edit": "Edit",
    "back": "Back",
    "next": "Next",
    "done": "Done",
    "free": "Free",
    "new": "NEW",
    "locked": "Locked",
    "unlocked": "Unlocked",
    "network_error": "Network error. Please check your connection.",
    "coming_soon": "Coming Soon",
    "success": "Success!",
    "failed": "Failed"
  },
  "nav": {
    "play": "Open Shop",
    "shop": "Shop",
    "decorate": "Decorate",
    "friends": "Friends",
    "leaderboard": "Leaderboard",
    "settings": "Settings",
    "profile": "Profile"
  },
  "gameplay": {
    "serve": "Serve",
    "combo": "Combo x{count}",
    "delivery_incoming": "Delivery incoming!",
    "delivery_timeout": "Delivery timed out",
    "customer_angry": "Customer left angrily",
    "perfect": "Perfect!",
    "great": "Great!",
    "good": "Good",
    "okay": "Okay",
    "tips": "Tips",
    "total_income": "Total Income",
    "max_combo": "Max Combo",
    "customers_served": "Customers Served",
    "rating": "Rating",
    "day_complete": "Day Complete!",
    "level_up": "Level Up!"
  },
  "social": {
    "taste_test": {
      "title": "Taste Test",
      "button": "Taste Test",
      "already_tasted": "Tasted",
      "success": "+{coins} coins! Tasted a cup of {drink} from {friend}'s shop!",
      "signature": "✨ It's {friend}'s signature: {recipe}!",
      "limit_reached": "Daily taste test limit reached (5/5)",
      "friend_limit": "Already tasted from {friend} today"
    },
    "cover": {
      "title": "Cover Shift",
      "button": "Cover Shift",
      "prompt": "{friend} is away. {count} delivery orders are waiting!",
      "confirm": "Cover this shift and split the earnings?",
      "success": "Covered {friend}'s shift! You earned {coins_h} coins, {friend} earned {coins_o} coins.",
      "no_overflow": "No pending deliveries for {friend}",
      "limit_reached": "Daily cover limit reached (5/5)"
    },
    "report": {
      "title": "Social Report · {date}",
      "taste_test_section": "{count} friends did a Taste Test today",
      "cover_section": "{count} friends covered your shift today",
      "signature_section": "Your signature '{recipe}' was tasted {count} times!",
      "leaderboard_section": "Leaderboard Updates",
      "net_income": "Social income today: +{coins} coins"
    },
    "leaderboard": {
      "weekly_income": "Weekly Income",
      "max_combo": "Max Combo",
      "decoration_score": "Decoration Score",
      "reset_in": "Resets in {days}d {hours}h",
      "rank_up": "🏆 You surpassed {friend} in {category}! Now ranked #{rank}.",
      "rank_down": "{friend} surpassed you in {category}. Now ranked #{rank}.",
      "top1_reward": "Last week's #1 in {category}! +{coins} coins"
    },
    "friend_request": {
      "title": "Friend Request",
      "send": "Send Request",
      "accept": "Accept",
      "decline": "Decline",
      "pending": "Pending",
      "slots_full": "Friend slots full (5/5). Remove a friend to add new ones.",
      "add_friend_bonus": "Add a friend for 500 coins!"
    }
  },
  "recipe": {
    "creator_title": "Recipe Creator",
    "step_base": "Choose Base",
    "step_flavor": "Choose Flavor",
    "step_topping": "Choose Topping",
    "step_glass": "Choose Glass",
    "step_name": "Name Your Recipe",
    "name_placeholder": "e.g. Angel's Special",
    "name_too_long": "Name must be 20 characters or fewer",
    "inappropriate_name": "Please choose a different name.",
    "preview": "Preview",
    "save": "Save Recipe",
    "slot_locked": "Recipe slot locked. Unlock for $0.99",
    "unlock_button": "Unlock Recipe Slot",
    "sweetness": "Sweetness",
    "popularity": "Popularity",
    "creativity": "Creativity",
    "overwrite_warning": "This will replace your current signature recipe. Continue?"
  },
  "shop": {
    "title": "Shop",
    "decoration_packs": "Decoration Packs",
    "custom_recipes": "Custom Recipes",
    "ingredient_skins": "Ingredient Skins",
    "avatar_customization": "Avatar Customization",
    "theme_music": "Shop Theme Music",
    "buy": "Buy",
    "owned": "Owned",
    "restore": "Restore Purchases",
    "restore_success": "Purchases restored successfully!",
    "restore_none": "No purchases to restore.",
    "restore_failed": "Restore failed. Please check your network.",
    "purchase_success": "Purchase successful!",
    "purchase_failed": "Purchase failed. Please try again.",
    "purchase_cancelled": "Purchase cancelled.",
    "already_owned": "You already own this item."
  },
  "settings": {
    "title": "Settings",
    "account": "Account",
    "language": "Language",
    "notifications": "Notifications",
    "sound": "Sound",
    "music": "Music",
    "delete_account": "Delete Account",
    "delete_confirm": "Are you sure? This will permanently delete your account and all data.",
    "delete_type_confirm": "Type DELETE to confirm",
    "privacy_policy": "Privacy Policy",
    "terms_of_service": "Terms of Service",
    "contact_support": "Contact Support",
    "version": "Version {version}",
    "rate_app": "Rate Boba Dash"
  },
  "avatar": {
    "title": "Avatar",
    "hairstyle": "Hairstyle",
    "outfit": "Outfit",
    "accessory": "Accessory",
    "preview": "Preview",
    "locked": "Unlock in Shop"
  },
  "errors": {
    "auth_failed": "Authentication failed. Please try again.",
    "network_timeout": "Network timeout. Please try again.",
    "server_error": "Server error. Please try again later.",
    "friend_not_found": "Friend not found.",
    "recipe_save_failed": "Failed to save recipe. Please try again.",
    "purchase_verify_failed": "Purchase verification failed. Please contact support."
  }
}
```

### 3.3 i18n 引擎实现

```typescript
// src/i18n/index.ts
import en from './en.json'

const translations: Record<string, any> = {
  en
}

let currentLang = 'en'

export function setLanguage(lang: string) {
  if (translations[lang]) {
    currentLang = lang
  } else {
    console.warn(`Language ${lang} not found, falling back to English`)
    currentLang = 'en'
  }
}

export function t(key: string, params: Record<string, string | number> = {}): string {
  const keys = key.split('.')
  let text: any = translations[currentLang]

  for (const k of keys) {
    if (text && typeof text === 'object' && k in text) {
      text = text[k]
    } else {
      // Fallback to English
      text = en
      for (const ek of keys) {
        if (text && typeof text === 'object' && ek in text) {
          text = text[ek]
        } else {
          return key // Return key if not found
        }
      }
      break
    }
  }

  if (typeof text !== 'string') return key

  // Parameter interpolation
  // t('social.taste_test.success', {coins: 18, drink: 'Classic Milk Tea', friend: 'Alice'})
  // → "+18 coins! Tasted a cup of Classic Milk Tea from Alice's shop!"
  Object.keys(params).forEach(p => {
    text = text.replace(new RegExp(`\\{${p}\\}`, 'g'), String(params[p]))
  })

  return text
}

export function getCurrentLanguage(): string {
  return currentLang
}
```

### 3.4 使用示例

```typescript
// 在组件中使用
import { t } from '../i18n'

// 简单文本
<Text>{t('nav.play')}</Text>
// → "Open Shop"

// 带参数
<Text>{t('social.taste_test.success', { coins: 18, drink: 'Classic Milk Tea', friend: 'Alice' })}</Text>
// → "+18 coins! Tasted a cup of Classic Milk Tea from Alice's shop!"

// 错误处理
if (error) {
  Alert.alert(t('common.network_error'))
}
```

### 3.5 字符串硬编码扫描

| 扫描范围 | 扫描内容 | 工具 |
|---------|---------|------|
| `src/` 目录 | JSX/TSX 中所有硬编码英文字符串 | ESLint rule `react/jsx-no-literals` |
| 配置文件 | JSON 配置中的显示文本 | 人工审查 |
| UI 组件 | 模板中的硬编码文本 | 人工审查 |

```yaml
# .eslintrc.yml
rules:
  react/jsx-no-literals:
    - error
    - noStrings: true
      ignoreProps: true
      noAttributeStrings: false
```

---

## 四、字符串总量估算

### 4.1 按模块分类

| 模块 | 字符串总数 | 说明 |
|------|----------|------|
| 通用 UI (common) | ~20 | 按钮 / 提示 / 通用文案 |
| 导航 (nav) | ~7 | 主菜单 / Tab 栏 |
| 游戏内 UI (gameplay) | ~50 | 制作 / 交付 / 结算 / Combo |
| 社交系统 (social) | ~80 | Taste Test / Cover / Report / Leaderboard / Friend Request |
| 配方系统 (recipe) | ~25 | 创建器 / 槽位 / 预览 |
| 商店 (shop) | ~30 | SKU 名称 / 购买流程 / 恢复 |
| 设置 (settings) | ~25 | 账号 / 通知 / 删除 / 隐私 |
| 头像 (avatar) | ~10 | 定制界面 |
| 错误信息 (errors) | ~15 | 网络 / 认证 / 购买错误 |
| 饮品名称 | ~22 | 基底 / 风味 / 顶料 / 杯型 |
| 装饰物名称 | ~100 | 4 个装饰包 × 20-25 件 |
| 头像物品名称 | ~80 | 发型 / 服装 / 配饰 |
| 音乐曲目名称 | ~5 | 5 首主题音乐 |
| 食材外观名称 | ~15 | 3 个外观包 × 5 种食材 |
| 教学引导文案 | ~40 | 前 4 关教学步骤 |
| 推送通知文案 | ~15 | 社交通知 / 好友请求 |
| App Store / Google Play 文案 | ~30 | 描述 / 短描述 / 关键词 |
| **合计** | **~1310** | — |

---

## 五、文化适配要点

### 5.1 Boba / Bubble Tea 术语选择

| 术语 | 使用场景 | 原因 |
|------|---------|------|
| Boba | 游戏名 / 品牌标识 / 非正式场景 | "Boba" 在美国更流行，简短有力，适合品牌 |
| Bubble Tea | 正式描述 / ASO 关键词 / 商店描述 | "Bubble Tea" 搜索量更高，覆盖更广 |
| 两者互换 | 描述中交替使用 | 覆盖两种搜索习惯 |

**决策**：游戏名使用 "Boba"（简短、品牌感强），商店描述和关键词中 "Bubble Tea" 和 "Boba" 交替使用。

### 5.2 西方用户习惯适配

| 元素 | 适配策略 | 原因 |
|------|---------|------|
| 店铺称呼 | "{Player Name}'s Boba Shop" | 使用玩家昵称，不使用"奶茶店"中式表达 |
| 社交动作名称 | "Taste Test" / "Cover Shift" | 美式口语，亲切自然 |
| 货币名称 | Coins | 简单通用 |
| 货币符号 | 不使用 $ 符号 | 避免与真实货币混淆 |
| 顾客形象 | 多元化角色（不同肤色 / 发型） | 适应西方多元化审美 |
| 节日活动 | 万圣节 / 感恩节 / 圣诞节 | 西方主流节日 |
| 食材偏好 | 增加 Taro / Brown Sugar / Matcha | 西方 boba 店热门口味 |
| 杯型 | Mason Jar（梅森罐） | 美式咖啡馆文化元素 |
| 度量单位 | 不涉及（游戏内无度量单位） | — |

### 5.3 颜色文化差异

| 颜色 | 中国含义 | 西方含义 | Boba Dash 使用 |
|------|---------|---------|---------------|
| 粉色 (#FF6B9D) | 女性 / 可爱 | Boba / 奶茶文化色 | ✅ 品牌主色 |
| 薄荷绿 (#4ECDC4) | 清新 / 健康 | 清新 / 自然 | ✅ 辅助色 |
| 紫色 (#9B59B6) | 高贵 / 神秘 | 创意 / 个性 | Taro 风味标识 |
| 棕色 (#8B5A3C) | 朴实 / 传统 | Boba Pearls / 咖啡 | 珍珠 / 咖啡标识 |
| 红色 (#E74C3C) | 喜庆 / 幸运 | 警告 / 紧急 | 倒计时 / 紧急状态 |
| 黄色 (#F1C40F) | 皇家 / 贵重 | 温暖 / 注意 | Honey 风味 / 提示 |

### 5.4 敏感词与文化审查

#### 自定义配方名称和店名过滤

| 过滤类别 | 示例 | 处理 |
|---------|------|------|
| 仇恨言论 | Racial slurs / hate speech | 拒绝 + 提示 "Please choose a different name." |
| 色情低俗 | Sexual content / profanity | 拒绝 + 提示修改 |
| 广告引流 | URLs / social media handles | 拒绝 + 提示修改 |
| 仿冒官方 |含 "Admin" / "Official" / "Moderator" | 拒绝 + 提示修改 |
| 品牌侵权 |含知名品牌名（Starbucks / Kung Fu Tea / Gong Cha） | 拒绝 + 提示修改 |
| 暴力威胁 |Violent threats / self-harm | 拒绝 + 提示修改 |

#### 敏感词库

```
/src/config/sensitive_words.json
  · 英文基础词库：通用英文敏感词（开源词库导入，如 badwords-list npm 包）
  · 游戏专用词：品牌名 / 竞品名 / 官方词汇
  · 多语言词库：预留 Spanish / Japanese / Korean 敏感词
  · 动态更新：热更新配置文件，不需发版
```

### 5.5 文案风格指南

| 维度 | 规范 | 示例 |
|------|------|------|
| 语气 | 亲切、轻松、友好 | "Your friend did a Taste Test!" (不使用 "A friend has accessed your shop") |
| 人称 | 直接称呼 "You" / "Your" | "Your shop" (不使用 "The user's shop") |
| 数字 | 阿拉伯数字 | "+18 coins" (不使用 "eighteen coins") |
| Emoji | 适当使用增加亲和力 | "🧋 Tasted a cup of Classic Milk Tea" |
| 长度 | 社交日报单行 ≤ 60 字符 | 避免信息过载 |
| 按钮 | 动词开头，1-3 词 | "Taste Test" / "Cover Shift" / "Open Shop" |
| 大小写 | Title Case 用于标题/按钮 | "Taste Test" (非 "taste test") |
| 标点 | 感叹号适度使用 | 成功消息用 "!"，错误消息用 "." |

---

## 六、英文 App 文案

### 6.1 App 描述（4000 字符以内）

```
Welcome to Boba Dash — the ultimate bubble tea time management game! 🧋

Run your own boba shop, serve delicious drinks, and build a thriving tea empire. From classic milk tea to creative custom recipes, every cup tells a story.

🧋 CRAFT & SERVE
Master the art of boba making! Brew tea, add flavors, pile on toppings, and serve customers before they lose patience. The faster you serve, the more you earn. Chain perfect orders for massive combos!

🏪 DECORATE YOUR SHOP
Transform your humble tea stand into a dream cafe. Choose from hundreds of decorations — cozy gardens, neon cyber aesthetics, sakura dreams, festive lanterns, and more. Your shop, your style!

👨‍🍳 CUSTOM RECIPES
Create your own signature boba recipe! Pick a base tea, choose your flavor, add unique toppings, and select the perfect glass. Name it, share it, and watch friends do a Taste Test at your shop!

🎮 SOCIAL FUN
• Taste Test — Visit friends' shops and taste a free boba. Both of you earn coins!
• Cover Shift — Help friends handle delivery overflow when they're away. Split the earnings!
• Leaderboard — Compete with friends in Weekly Income, Max Combo, and Decoration Score!
• Share Cards — Show off your shop on Instagram, iMessage, and WhatsApp!

🎨 EXPRESS YOURSELF
• Avatar Customization — Choose hairstyles, outfits, and accessories
• Ingredient Skins — Galaxy, pastel macaron, and neon glow variants
• Shop Theme Music — Lo-Fi, tropical, K-Pop, jazz, and EDM soundtracks

✨ WHY BOBA DASH?
• 100% ad-free — no interruptions, ever
• No pay-to-win — all purchases are cosmetic only
• Play at your own pace — 5 minutes or 50 minutes
• Social but not intrusive — connect with friends on your terms

Download Boba Dash now and start brewing your dream boba shop today! 🧋✨

---
Boba Dash is free to play with optional in-app purchases for decorations, custom recipes, ingredient skins, avatar customization, and theme music. No ads, no pay-to-win, no data selling.

Questions? Contact us at support@bobadash.com
Follow us @bobadashgame on Instagram and TikTok!
```

字符数：约 2,200（在 4,000 字符限制内）

### 6.2 短描述（Google Play，80 字符以内）

```
Brew boba, serve fast, decorate your dream tea shop!
```

字符数：52

### 6.3 副标题（App Store，30 字符以内）

```
Brew, Serve & Share Boba!
```

字符数：25

### 6.4 关键词（App Store，100 字符以内）

```
bubble tea,boba,cooking,time management,tea shop,drink maker,restaurant,decoration,social,cafe
```

字符数：100

### 6.5 What's New（更新说明）模板

```
🧋 What's New in Boba Dash v{version}:

✨ New Features:
• {Feature 1}
• {Feature 2}

🎮 Improvements:
• {Improvement 1}
• {Improvement 2}

🐛 Bug Fixes:
• {Fix 1}
• {Fix 2}

Thank you for playing Boba Dash! 🧋 Follow us @bobadashgame for updates.
```

---

## 七、翻译工具推荐

### 7.1 DeepL API 免费层

| 项目 | 详情 |
|------|------|
| 工具 | DeepL API Free |
| 费用 | 免费（500,000 字符/月） |
| 支持语言 | English → Spanish / Japanese / Korean / Chinese 等 |
| 质量 | 优于 Google Translate，语境理解更准确 |
| 集成方式 | REST API，可在翻译流水线中自动调用 |
| 注册地址 | [deepl.com/pro-api](https://www.deepl.com/pro-api) |

#### DeepL API 使用示例

```typescript
// src/scripts/translate.ts
const DEEPL_API_KEY = process.env.DEEPL_API_KEY
const DEEPL_API_URL = 'https://api-free.deepl.com/v2/translate'

async function translateText(text: string, targetLang: string): Promise<string> {
  const params = new URLSearchParams({
    auth_key: DEEPL_API_KEY!,
    text: text,
    target_lang: targetLang // ES / JA / KO / ZH
  })

  const response = await fetch(DEEPL_API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params
  })

  const data = await response.json()
  return data.translations[0].text
}

// 批量翻译 en.json → 目标语言
async function translateI18nFile(targetLang: string) {
  const enJson = require('../src/i18n/en.json')
  const translated: any = {}

  for (const section of Object.keys(enJson)) {
    translated[section] = {}
    for (const key of Object.keys(enJson[section])) {
      const text = enJson[section][key]
      translated[section][key] = await translateText(text, targetLang)
    }
  }

  fs.writeFileSync(
    `src/i18n/${targetLang.toLowerCase()}.json`,
    JSON.stringify(translated, null, 2)
  )
}
```

### 7.2 其他翻译工具

| 工具 | 费用 | 质量 | 适用场景 |
|------|------|------|---------|
| DeepL API Free | 免费（500K 字符/月） | ★★★★★ | 首选，质量最高 |
| Google Translate API | $20/100万字符 | ★★★★☆ | 备选 |
| Crowdin | 免费层 5000 词 | ★★★★☆ | 社区翻译管理 |
| Manual (人工翻译) | $0.05-0.15/词 | ★★★★★ | 最终审校 |

### 7.3 翻译流水线

```
1. 字符串抽取 → 导出 en.json
2. DeepL API 自动翻译 → 生成目标语言 JSON
3. 人工审校 → 修正游戏术语 / 语境问题
4. 文化适配审查 → 检查文化敏感内容
5. 集成 → 导入翻译后的 JSON
6. QA 验证 → 检查 UI 适配 / 参数插值
7. 上线 → 灰度发布验证
```

---

## 八、后续多语言扩展计划

### 8.1 扩展优先级

| 优先级 | 语言 | 扩展场景 | 预估工作量 | 文化适配难度 |
|--------|------|---------|-----------|------------|
| P3 | Spanish | 美国西语用户 + 拉美市场 | 中（DeepL 翻译 + 审校） | 低 |
| P3 | Japanese | 日本市场（boba 文化有共鸣） | 中 | 中高（茶饮文化差异） |
| P3 | Korean | 韩国市场（boba 文化流行） | 中 | 中高 |
| P4 | Simplified Chinese | 中国大陆市场（如未来上架） | 中（DeepL 翻译 + 审校） | 低 |
| P4 | Traditional Chinese | 台湾 / 港澳市场 | 低（简繁转换） | 低 |
| P5 | French | 法国 / 加拿大市场 | 中 | 中 |
| P5 | German | 德国市场 | 中 | 中 |
| P5 | Portuguese | 巴西 / 葡萄牙市场 | 中 | 中 |

### 8.2 扩展触发条件

当满足以下任一条件时，启动对应语言的本地化：

| 条件 | 阈值 | 说明 |
|------|------|------|
| 用户地域数据 | 非英语用户占比 > 5% | 通过 Supabase 用户地域统计 |
| 下载地域分布 | 特定语言区域下载量 > 20% 总下载 | App Store / Google Play 地域报告 |
| 用户反馈 | 收到多语言需求 > 10 条 | 社区反馈驱动 |
| 商业决策 | 瞄准特定海外市场 | 主动拓展 |
| ASO 数据 | 特定语言关键词搜索量增长 | Sensor Tower 数据 |

### 8.3 P3 语言扩展计划

如果首年英语版达到 10K DAU，启动 P3 语言扩展：

| 语言 | 预估时间 | 预估成本 | 预期 DAU 增量 |
|------|---------|---------|-------------|
| Spanish | 4 周 | $200（DeepL + 审校） | +1,000-2,000 |
| Japanese | 6 周 | $500（DeepL + 专业审校） | +500-1,500 |
| Korean | 6 周 | $500（DeepL + 专业审校） | +500-1,500 |

### 8.4 多语言 UI 适配

| 适配项 | 说明 | 检查方法 |
|--------|------|---------|
| 文本长度 | 德语比英语长 30-40% | 测试最长文本不溢出 |
| 字体支持 | 日文 / 韩文需支持 CJK 字体 | 确认字体覆盖 |
| 布局弹性 | 按钮和卡片需自适应文本长度 | 使用 flex 布局 |
| 日期格式 | 不同地区日期格式不同 | 使用 Intl.DateTimeFormat |
| 数字格式 | 千分位分隔符不同 | 使用 Intl.NumberFormat |
| 货币格式 | 货币符号和位置不同 | IAP 使用平台本地货币 |

---

## 九、本地化质量检查清单

| # | 检查项 | 说明 | 状态 |
|---|--------|------|------|
| 1 | 无硬编码英文字符串 | 所有用户可见文本在 en.json 中 | ☐ |
| 2 | 字符串参数插值正确 | {coins}/{friend}/{drink} 等参数正确替换 | ☐ |
| 3 | 长文本不溢出 UI | 最长英文字符串下按钮/卡片不溢出 | ☐ |
| 4 | 敏感词过滤已部署 | 自定义配方名 + 店名经过过滤 | ☐ |
| 5 | 术语一致性 | Boba / Bubble Tea / Taste Test / Cover Shift 全局一致 | ☐ |
| 6 | 多语言架构预留 | i18n 引擎 + 语言切换代码就绪 | ☐ |
| 7 | App Store / Google Play 文案就绪 | 描述 / 短描述 / 关键词 / 副标题 | ☐ |
| 8 | 英文文案无语法错误 | 母语者审校或 Grammarly 检查 | ☐ |
| 9 | 字符串冻结已执行 | 发布前 7 天冻结 | ☐ |
| 10 | DeepL API Key 已配置 | 用于后续多语言扩展 | ☐ |

---

*文档结束 · Boba Dash 本地化方案 · 2026-08-10*
