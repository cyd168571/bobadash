# Boba Dash — App Store 审核清单

> **文档状态**：Draft v1.0 · **日期**：2026-08-10
> **关联文档**：`monetization-setup.md`、`aso-strategy.md`、`localization.md`

---

## 一、提交前准备

### 1.1 Apple Developer 账号

| 项目 | 详情 | 状态 |
|------|------|------|
| 账号类型 | Apple Developer Program (个人) | ☐ |
| 费用 | $99/年 | ☐ |
| 注册地址 | [developer.apple.com](https://developer.apple.com) | ☐ |
| 两步验证 | 必须开启 Apple ID 两步验证 | ☐ |
| 法律实体名称 | 个人开发者使用真实姓名 | ☐ |
| D-U-N-S 编号 | 个人开发者不需要，企业账号需要 | ☐ |

### 1.2 Bundle ID 与证书

| 项目 | 详情 | 状态 |
|------|------|------|
| Bundle ID | `com.bobadash.app` | ☐ |
| App ID | 在 Apple Developer Portal 创建 App ID | ☐ |
| Distribution Certificate | 生产证书（用于提交 App Store） | ☐ |
| Push Notification Certificate | 推送证书（社交通知用） | ☐ |
| Provisioning Profile | App Store Distribution Profile | ☐ |

#### 使用 Expo EAS 简化证书管理

```bash
# 使用 EAS 自动管理证书
eas credentials

# 选择 iOS → Production → Let EAS manage credentials
# EAS 会自动创建证书和 Provisioning Profile
```

### 1.3 App Store Connect 设置

| 项目 | 详情 | 状态 |
|------|------|------|
| 创建 App | App Store Connect → My Apps → "+" → New App | ☐ |
| App 名称 | Boba Dash | ☐ |
| Primary Language | English (U.S.) | ☐ |
| Bundle ID | com.bobadash.app | ☐ |
| SKU | bobadash001 | ☐ |
| User Access | Full Access | ☐ |

---

## 二、18 个 IAP 产品 ID 配置

### 2.1 IAP 创建状态追踪

| # | Product ID | 名称 | 价格 | 类型 | App Store Connect 状态 |
|---|-----------|------|------|------|----------------------|
| 1 | com.bobadash.deco_cozy_garden | Cozy Garden Pack | $0.99 | Non-Consumable | ☐ Missing |
| 2 | com.bobadash.deco_neon_cyber | Neon Cyber Pack | $1.99 | Non-Consumable | ☐ Missing |
| 3 | com.bobadash.deco_sakura_dreams | Sakura Dreams Pack | $2.99 | Non-Consumable | ☐ Missing |
| 4 | com.bobadash.deco_festival_lanterns | Festival Lanterns Pack | $1.99 | Non-Consumable | ☐ Missing |
| 5 | com.bobadash.recipe_slot_1 | Recipe Slot Unlock | $0.99 | Non-Consumable | ☐ Missing |
| 6 | com.bobadash.recipe_display_board | Recipe Display Board | $1.99 | Non-Consumable | ☐ Missing |
| 7 | com.bobadash.skin_galaxy | Galaxy Skins | $0.99 | Non-Consumable | ☐ Missing |
| 8 | com.bobadash.skin_macaron | Pastel Macaron Skins | $0.99 | Non-Consumable | ☐ Missing |
| 9 | com.bobadash.skin_neon | Neon Glow Skins | $0.99 | Non-Consumable | ☐ Missing |
| 10 | com.bobadash.avatar_starter | Avatar Starter Pack | $0.99 | Non-Consumable | ☐ Missing |
| 11 | com.bobadash.avatar_hairstyles | Hairstyle Collection | $1.99 | Non-Consumable | ☐ Missing |
| 12 | com.bobadash.avatar_outfits | Outfit Collection | $1.99 | Non-Consumable | ☐ Missing |
| 13 | com.bobadash.avatar_accessories | Accessory Pack | $0.99 | Non-Consumable | ☐ Missing |
| 14 | com.bobadash.avatar_premium | Premium Avatar Bundle | $2.99 | Non-Consumable | ☐ Missing |
| 15 | com.bobadash.music_lofi | Lo-Fi Chill | $0.99 | Non-Consumable | ☐ Missing |
| 16 | com.bobadash.music_tropical | Tropical Vibes | $0.99 | Non-Consumable | ☐ Missing |
| 17 | com.bobadash.music_kpop | K-Pop Beat | $1.99 | Non-Consumable | ☐ Missing |
| 18 | com.bobadash.music_jazz | Jazz Cafe | $0.99 | Non-Consumable | ☐ Missing |

### 2.2 IAP 审核截图

每个 IAP 产品需要一张审核截图（1024×1024 PNG，无 Alpha 通道）：

| 轨道 | 截图内容建议 |
|------|------------|
| Decoration Packs | 装饰物在店铺中的预览截图 |
| Custom Recipes | 配方创建器界面 + 招牌配方展示 |
| Ingredient Skins | 食材外观变体对比图 |
| Avatar Customization | 头像定制界面 + 预览 |
| Shop Theme Music | 音乐播放界面 + 曲目列表 |

### 2.3 IAP 审核注意事项

- IAP 产品需要与 App 一起提交审核（首次提交时）
- IAP 状态必须为 "Ready to Submit" 才能与 App 一起提交
- 审核通过后 IAP 状态变为 "Approved"
- App 发布后 IAP 自动变为 "Clean for Sale"

---

## 三、App 元数据

### 3.1 基本信息清单

| 字段 | 值 | 字符限制 | 状态 |
|------|---|---------|------|
| App Name | Boba Dash | 30 字符 | ☐ |
| Subtitle | Brew, Serve & Share Boba! | 30 字符 | ☐ |
| Description | 见 3.2 | 4000 字符 | ☐ |
| Keywords | bubble tea,boba,cooking,time management,tea shop,drink maker,restaurant,decoration,social,cafe | 100 字符 | ☐ |
| Primary Category | Games | — | ☐ |
| Secondary Category | Games → Simulation | — | ☐ |
| Primary Language | English (U.S.) | — | ☐ |
| Content Rights | Does not contain third-party content | — | ☐ |
| Age Rating | 4+ (见 3.3) | — | ☐ |
| URL | https://bobadash.com | — | ☐ |
| Support URL | https://bobadash.com/support | — | ☐ |
| Marketing URL | (可选) https://bobadash.com | — | ☐ |
| Privacy Policy URL | https://bobadash.com/privacy | — | ☐ |
| Copyright | © 2026 Boba Dash | — | ☐ |

### 3.2 App 描述（4000 字符以内）

```
Welcome to Boba Dash — the ultimate bubble tea time management game! 🧋

Run your own boba shop, serve delicious drinks, and build a thriving tea empire. From classic milk tea to creative custom recipes, every cup tells a story.

🧋 CRAFT & SERVE
Master the art of boba making! Brew tea, add flavors, pile on toppings, and serve customers before they lose patience. The faster you serve, the more you earn. Chain perfect orders for massive combos!

🏪 DECORATE YOUR SHOP
Transform your humble tea stand into a dream cafe. Choose from hundreds of decorations — cozy gardens, neon cyber aesthetics, sakura dreams, festive lanterns, and more. Your shop, your style!

👨‍🍳 CUSTOM RECIPES
Create your own signature boba recipe! Pick a base tea, choose your flavor, add unique toppings, and select the perfect glass. Name it, share it, and watch friends grab a drink from your shop!

🎮 SOCIAL FUN
• Taste Test — Visit friends' shops and grab a free boba. Both of you earn coins!
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

> 字符数约 2,200，在 4,000 字符限制内。

### 3.3 年龄分级问卷

| 问题 | 回答 |
|------|------|
| Cartoon Violence | None |
| Realistic Violence | None |
| Prolonged Graphic or Sadistic Realistic Violence | None |
| Profanity or Crude Humor | None |
| Fear/Threatening Themes | None |
| Medical/Treatment Information | None |
| Alcohol, Tobacco, or Drug Use | None |
| Simulated Gambling | None |
| Sexual Content or Nudity | None |
| Graphic Sexual Content | None |
| Unrestricted Web Access | No |
| Gambling with Real Currency | No |

**结果分级：4+**（适合所有年龄）

### 3.4 关键词策略（100 字符限制）

```
bubble tea,boba,cooking,time management,tea shop,drink maker,restaurant,decoration,social,cafe
```

字符数：100（刚好满）

关键词选择逻辑：
- `bubble tea` / `boba` — 核心品类词
- `cooking` / `time management` / `restaurant` — 游戏品类词
- `tea shop` / `drink maker` / `cafe` — 场景词
- `decoration` / `social` — 功能特色词

---

## 四、视觉素材

### 4.1 App 图标

| 要求 | 规格 | 状态 |
|------|------|------|
| 尺寸 | 1024 × 1024 像素 | ☐ |
| 格式 | PNG | ☐ |
| Alpha 通道 | **无**（不允许透明背景） | ☐ |
| 圆角 | 不需要（Apple 自动处理圆角） | ☐ |
| 内容 | boba 杯子 + 品牌色背景 + "Boba Dash" 文字（可选） | ☐ |
| 颜色 | 品牌主色 #FF6B9D（粉色）/ 辅助色 #4ECDC4（薄荷绿） | ☐ |

### 4.2 截图要求

| 设备 | 尺寸 | 数量 | 状态 |
|------|------|------|------|
| iPhone 6.7" (iPhone 15 Pro Max) | 1290 × 2796 | 至少 1 张，最多 10 张 | ☐ |
| iPhone 6.5" (iPhone 11 Pro Max) | 1242 × 2688 | 至少 1 张 | ☐ |
| iPad 12.9" (iPad Pro 12.9") | 2048 × 2732 | 至少 1 张 | ☐ |

#### 截图内容规划（5 张核心截图）

| # | 截图内容 | 目的 |
|---|---------|------|
| 1 | 制作 boba 的动作画面 + Combo 数字飞出 | 展示核心玩法 |
| 2 | 装饰后的店铺全景 + Decoration Score | 展示装饰系统 |
| 3 | 好友列表 + Taste Test / Cover Shift 按钮 | 展示社交功能 |
| 4 | 外卖溢出 + 紧张的倒计时 | 展示时间管理张力 |
| 5 | 头像定制界面 + 多种发型/服装/配饰 | 展示 Avatar Customization |

#### 截图设计规范

- 使用真实游戏画面截图（非概念图）
- 顶部添加营销文案（如 "Brew. Serve. Repeat." / "Decorate Your Dream Cafe" / "Taste Test with Friends!"）
- 文案字体：SF Pro Display Bold（Apple 系统字体）
- 文案颜色：白色 + 半透明黑色底栏
- 底部留出 Home Indicator 区域

### 4.3 App 预览视频（可选但强烈推荐）

| 要求 | 规格 | 状态 |
|------|------|------|
| 数量 | 最多 3 个（每个设备尺寸 1 个） | ☐ |
| 时长 | 15-30 秒 | ☐ |
| 分辨率 | 1080p（1920 × 1080 或对应竖屏） | ☐ |
| 格式 | H.264 / MPEG-4 | ☐ |
| 音频 | AAC | ☐ |

#### 视频内容脚本（30 秒）

```
0-3s:   boba 杯子特写 → 拉远展示完整店铺
3-8s:   快速制作 boba 动作（倒茶 → 加珍珠 → 加奶 → 封口）
8-13s:  顾客满意离开 → Combo 数字飞出 → 金币增加
13-18s: 装饰店铺 → 切换不同主题（花园 → 赛博 → 樱花）
18-23s: 好友列表 → Taste Test 动画
23-28s: 排行榜 → 头像展示
28-30s: Boba Dash logo + "Download Now Free"
```

---

## 五、必需文档

### 5.1 Privacy Policy URL

**要求**：App Store Review Guideline 5.1.1 强制要求

**内容必须包含**：

1. 收集的数据类型
   - 邮箱地址（Supabase Auth）
   - 游戏进度数据（关卡 / 金币 / 装饰）
   - 社交数据（好友列表 / 互动记录）
   - 设备标识符（用于 RevenueCat 用户关联）
   - 购买记录（IAP 收据）

2. 数据用途
   - 账号认证
   - 游戏进度同步
   - 社交功能（好友互动）
   - 内购权益验证
   - 客户支持

3. 数据存储位置
   - Supabase（数据库托管，区域：US-East）
   - RevenueCat（购买记录，区域：US）
   - Apple / Google（收据数据）

4. 第三方 SDK 清单
   - Supabase JS SDK（数据存储 / 认证）
   - RevenueCat SDK（IAP 管理）
   - PayPal（Web 商店支付，非 App 内）

5. 用户权利
   - 数据访问权
   - 数据删除权（账号删除功能）
   - 数据导出权

6. 儿童隐私
   - App 分级 4+，不收集 13 岁以下儿童个人信息
   - 遵守 COPPA

**URL**：`https://bobadash.com/privacy`

**模板**：可使用 [Termly](https://termly.io) 或 [iubenda](https://iubenda.com) 生成

### 5.2 Terms of Service

**内容必须包含**：

1. 服务描述
2. 用户行为规范
3. 知识产权声明
4. 免责声明
5. 争议解决条款
6. 联系方式

**URL**：`https://bobadash.com/terms`

### 5.3 Privacy Nutrition Labels (App Privacy)

在 App Store Connect → App Privacy 中填写：

| 数据类型 | 是否收集 | 用途 | 是否关联用户 | 是否用于追踪 |
|---------|---------|------|------------|------------|
| Email Address | 是 | Account, Functionality | 是 | 否 |
| Product Interaction (游戏进度) | 是 | Analytics, Functionality | 是 | 否 |
| Purchase History (IAP 记录) | 是 | Functionality | 是 | 否 |
| Other User Content (自定义配方名/店名) | 是 | App Functionality | 是 | 否 |
| Device ID | 是 | Third-Party Advertising (RevenueCat 用户关联) | 是 | 否 |
| Crash Data | 是 | App Functionality | 否 | 否 |

**不用于追踪（Not Used for Tracking）**：Boba Dash 不使用追踪 SDK（无 IDFA / GAID），不跨 App 追踪用户。

### 5.4 出口合规声明

App Store Connect → App Information → Export Compliance：

| 问题 | 回答 |
|------|------|
| Does your app use encryption? | Yes (standard HTTPS) |
| Does your app qualify for an exemption? | Yes |
| Exemption type | Standard encryption exemption (HTTPS only) |

> Boba Dash 仅使用 HTTPS 标准加密，符合豁免条件，无需提交 ERN (Encryption Registration Number)。

---

## 六、审核指南检查

### 6.1 Apple 审核指南对照

| 指南 | 要求 | Boba Dash 合规状态 | 检查项 |
|------|------|-------------------|--------|
| 1.1 Objectionable Content | 无色情/暴力/歧视内容 | ✅ 4+ 分级 | ☐ |
| 1.2 User Generated Content | UGC（配方名/店名）需有过滤和举报机制 | ✅ 敏感词过滤 + 举报功能 | ☐ |
| 2.1 App Completeness | 无占位内容/无 "demo"/"test" | ✅ 所有功能完整 | ☐ |
| 2.3 Accurate Metadata | 元数据与 App 内容一致 | ✅ 描述/截图/关键词匹配 | ☐ |
| 2.5.6 Sign-in-with-Apple | 如果提供第三方登录，必须提供 Sign-in-with-Apple | ✅ 提供 Sign-in-with-Apple | ☐ |
| 3.1.1 In-App Purchase | IAP 必须使用 Apple IAP；不得引导外部购买 | ✅ 所有数字商品使用 Apple IAP | ☐ |
| 3.1.2 Auto-Renewable Subscriptions | 不适用（无订阅） | ✅ N/A | ☐ |
| 3.2 Other Business Models | Web 商店不在 App 内推广 | ✅ Web 商店独立运营 | ☐ |
| 4.0 Design | 无崩溃/性能问题/加载时间合理 | ✅ 通过测试 | ☐ |
| 4.2 Minimum Functionality | App 有足够功能价值 | ✅ 完整游戏体验 | ☐ |
| 5.1.1 Privacy Policy | 提供 Privacy Policy URL | ✅ | ☐ |
| 5.1.2 Data Use and Sharing | App Privacy 标签准确 | ✅ | ☐ |
| 5.1.5 Location Services | 不使用定位 | ✅ N/A | ☐ |
| 5.2 Intellectual Property | 无侵权内容 | ✅ 原创素材 | ☐ |
| 5.3 Gaming/Lottery | 不包含赌博 | ✅ N/A | ☐ |

### 6.2 Sign-in-with-Apple 必需

Apple 要求：如果 App 提供任何第三方登录（Google / Facebook 等），则**必须**同时提供 Sign-in-with-Apple。

Boba Dash 登录方案：

| 登录方式 | 是否提供 | 说明 |
|---------|---------|------|
| Sign-in-with-Apple | ✅ **必需** | Apple Guideline 2.5.6 |
| Email/Password | ✅ | Supabase Auth |
| Google Sign-In | ✅ | 方便 Android 用户跨平台 |

#### Sign-in-with-Apple 实现

```typescript
// 使用 expo-apple-authentication
import * as AppleAuthentication from 'expo-apple-authentication'

async function signInWithApple() {
  try {
    const credential = await AppleAuthentication.signInAsync({
      requestedScopes: [
        AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
        AppleAuthentication.AppleAuthenticationScope.EMAIL
      ]
    })

    // 用 credential.identityToken 登录 Supabase
    const { data, error } = await supabase.auth.signInWithIdToken({
      provider: 'apple',
      token: credential.identityToken!
    })

    if (error) throw error
    return data
  } catch (e) {
    if (e.code === 'ERR_REQUEST_CANCELED') {
      // 用户取消
    }
    throw e
  }
}
```

### 6.3 账号删除功能（Guideline 5.1.1v2）

Apple 要求：如果 App 允许用户创建账号，则**必须**提供账号删除功能。

```
Settings → Account → Delete Account
  → 弹窗确认："Are you sure? This will permanently delete your account and all data."
  → 输入 "DELETE" 确认
  → 调用 Supabase Edge Function: delete-account
  → 删除所有用户数据（auth.users / iap_records / social_interactions / custom_recipes 等）
  → Sign out → 返回登录页面
```

### 6.4 IAP 恢复功能

Settings 页面必须有 "Restore Purchases" 按钮（详见 `monetization-setup.md` 第 8 节）。

---

## 七、常见拒绝原因与预防

### 7.1 拒绝原因统计

| # | 拒绝原因 | 占比 | Boba Dash 风险 | 预防措施 |
|---|---------|------|---------------|---------|
| 1 | Guideline 2.1 — App Completeness（崩溃/Bug/占位内容） | 40% | 中 | 充分测试 / 无占位 |
| 2 | Guideline 2.5.6 — Sign-in-with-Apple 缺失 | 15% | 高 | 必须实现 |
| 3 | Guideline 3.1.1 — IAP 问题 | 10% | 中 | IAP 恢复功能 / 沙箱测试 |
| 4 | Guideline 5.1.1 — Privacy Policy 缺失或不完整 | 8% | 低 | 准备完整 Privacy Policy |
| 5 | Guideline 2.3 — 元数据不匹配 | 7% | 低 | 描述/截图与 App 一致 |
| 6 | Guideline 4.0 — Design / 性能问题 | 6% | 中 | 性能优化 / 加载时间 |
| 7 | Guideline 5.2 — IP 侵权 | 5% | 低 | 原创素材 |
| 8 | 其他 | 9% | — | — |

### 7.2 详细预防方案

#### 7.2.1 Guideline 2.1 — App Completeness

| 预防项 | 检查方法 | 状态 |
|--------|---------|------|
| 无崩溃 | 在 iPhone SE / iPhone 15 / iPad 上各测试 30 分钟 | ☐ |
| 无占位文本 | 搜索 "lorem"/"test"/"demo"/"TODO"/"placeholder" | ☐ |
| 所有按钮可点击 | 遍历所有页面，点击所有按钮 | ☐ |
| 所有功能可用 | 完成完整游戏循环（教学 → 关卡 → 社交 → 购买） | ☐ |
| 无 "Coming Soon" | 无任何 "Coming Soon"/"敬请期待" 文本 | ☐ |
| 网络异常处理 | 飞行模式下测试所有页面 | ☐ |

#### 7.2.2 Guideline 2.5.6 — Sign-in-with-Apple

| 预防项 | 检查方法 | 状态 |
|--------|---------|------|
| Sign-in-with-Apple 按钮存在 | 登录页面有 Apple 登录按钮 | ☐ |
| Apple 登录功能正常 | 用 Apple 账号登录成功 | ☐ |
| Apple 登录后可正常游戏 | 登录后进入游戏，功能正常 | ☐ |
| Apple 登录按钮样式合规 | 使用 Apple 官方按钮样式 | ☐ |

#### 7.2.3 Guideline 3.1.1 — IAP 问题

| 预防项 | 检查方法 | 状态 |
|--------|---------|------|
| Restore Purchases 按钮存在 | Settings 页面有恢复按钮 | ☐ |
| 恢复功能正常 | 沙箱测试恢复购买 | ☐ |
| 无外部支付引导 | App 内无 "PayPal"/"Web Store" 链接 | ☐ |
| IAP 产品已提交审核 | 18 个 IAP 状态为 "Ready to Submit" | ☐ |
| IAP 审核截图已上传 | 每个 IAP 有截图 | ☐ |

#### 7.2.4 Guideline 5.1.1 — Privacy Policy

| 预防项 | 检查方法 | 状态 |
|--------|---------|------|
| Privacy Policy URL 可访问 | 浏览器打开 URL 确认 | ☐ |
| 内容完整 | 包含数据类型/用途/存储/权利 | ☐ |
| App Privacy 标签已填写 | App Store Connect 中已配置 | ☐ |
| 账号删除功能可用 | 测试账号删除流程 | ☐ |

#### 7.2.5 Guideline 2.3 — 元数据不匹配

| 预防项 | 检查方法 | 状态 |
|--------|---------|------|
| App Name 与 App 内一致 | App 内显示 "Boba Dash" | ☐ |
| 截图与 App 实际一致 | 截图来自真实游戏画面 | ☐ |
| 描述中的功能都存在 | 描述中提到的功能都已实现 | ☐ |
| 关键词与 App 相关 | 关键词都是 App 相关的 | ☐ |
| IAP 名称与 App 内一致 | IAP Display Name 与商店内显示一致 | ☐ |

---

## 八、提交流程

### 8.1 使用 EAS Submit

```bash
# 构建 iOS 版本
eas build --platform ios --profile production

# 提交到 App Store Connect
eas submit --platform ios --latest

# 或手动提交：从 EAS 下载 .ipa → 上传到 App Store Connect
```

### 8.2 TestFlight 内部测试

1. App Store Connect → TestFlight → 内部测试
2. 添加内部测试员（最多 100 人，需为 App Store Connect 团队成员）
3. 构建 → 添加构建版本 → 选择测试员
4. 测试员收到 TestFlight 邀请 → 安装 → 测试

### 8.3 提交审核

1. App Store Connect → App Store → 提交审核
2. 选择构建版本
3. 确认所有元数据完整
4. 确认所有 IAP 产品状态为 "Ready to Submit"
5. 提交审核

### 8.4 审核时间预期

| 审核类型 | 预期时间 |
|---------|---------|
| 首次审核 | 24-48 小时（新 App） |
| 更新审核 | 12-24 小时 |
| Expedited Review（紧急审核） | 12 小时内（每年 2 次额度） |
| 拒绝后重新提交 | 24-48 小时 |

### 8.5 审核被拒后处理

1. 查看 Resolution Center 中的拒绝原因
2. 根据 Guideline 编号对照本清单第 7 节
3. 修复问题后重新提交
4. 在 Resolution Center 中回复审核团队说明修复内容
5. 重新提交审核（无需消耗 Expedited Review 额度）

---

## 九、发布后维护

### 9.1 状态监控

| 监控项 | 工具 | 频率 |
|--------|------|------|
| 崩溃率 | App Store Connect → Crashes | 每日 |
| IAP 收入 | App Store Connect → Sales and Trends | 每日 |
| RevenueCat Dashboard | RevenueCat → Charts | 每日 |
| 用户评分 | App Store Connect → Ratings and Reviews | 每日 |
| 审核状态 | App Store Connect → App Store → Status | 每次提交后 |

### 9.2 版本更新审核

每次更新需重新提交审核，更新内容：

1. 新增 18 个 SKU 之外的装饰包 / 配方 / 头像 / 音乐
2. Bug 修复
3. 性能优化
4. 新社交功能

---

*文档结束 · Boba Dash App Store 审核清单 · 2026-08-10*
