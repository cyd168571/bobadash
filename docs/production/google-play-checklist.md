# Boba Dash — Google Play 审核清单

> **文档状态**：Draft v1.0 · **日期**：2026-08-10
> **关联文档**：`monetization-setup.md`、`aso-strategy.md`、`localization.md`

---

## 一、提交前准备

### 1.1 Google Play Console 账号

| 项目 | 详情 | 状态 |
|------|------|------|
| 账号类型 | 个人开发者账号 | ☐ |
| 费用 | $25（一次性注册费） | ☐ |
| 注册地址 | [play.google.com/console](https://play.google.com/console) | ☐ |
| Google 账号 | 使用专用 Google 账号（非个人日常账号） | ☐ |
| 开发者名称 | Boba Dash Studio（显示在商店中） | ☐ |
| 联系邮箱 | support@bobadash.com | ☐ |
| 联系电话 | 填写有效电话 | ☐ |
| 身份验证 | 需验证身份（个人：身份证/护照；组织：D-U-N-S 编号） | ☐ |

### 1.2 App 签名密钥

#### 方案：使用 Google Play App Signing（推荐）

```
Google Play App Signing 流程：
1. 上传首次 APK/AAB 时，Google 会要求你选择 App Signing 密钥
2. 选择 "Use Google-generated key"（推荐）
3. Google 生成并保管 App Signing 密钥
4. 你保管 Upload 密钥（用于签名上传的 AAB）
5. 用户下载的 APK 由 Google 用 App Signing 密钥签名

优势：
  · 密钥丢失风险低（Google 保管）
  · 可请求重置 Upload 密钥（如果丢失）
  · 支持 App Bundle 动态分发
```

#### 使用 Expo EAS 自动管理

```bash
# EAS 自动管理 Google Play 签名
eas credentials --platform android

# 选择 Production → Let EAS manage credentials
# EAS 会生成 Upload 密钥并保管
```

### 1.3 创建 App

| 项目 | 详情 | 状态 |
|------|------|------|
| App name | Boba Dash | ☐ |
| Package name | com.bobadash.app | ☐ |
| Default language | English (United States) | ☐ |
| App type | Application | ☐ |
| Free/Paid | Free | ☐ |

### 1.4 18 个 In-App Product 配置

详见 `monetization-setup.md` 第四节。确保 18 个 Base Plan 全部创建并激活。

| 状态检查 | 说明 | 状态 |
|---------|------|------|
| 18 个 In-App Product 已创建 | Product ID 与 RevenueCat 一致 | ☐ |
| 18 个 Base Plan 已激活 | 状态为 "Active" | ☐ |
| 价格已设置 | USD 基准 + 自动换算其他货币 | ☐ |
| 多币种价格已确认 | 检查 EUR/GBP/JPY/KRW 等主要货币 | ☐ |
| 可用国家已设置 | All available countries | ☐ |

---

## 二、商店列表

### 2.1 商店信息清单

| 字段 | 值 | 限制 | 状态 |
|------|---|------|------|
| App name | Boba Dash | 30 字符 | ☐ |
| Short description | Brew boba, serve fast, decorate your dream tea shop! | 80 字符 | ☐ |
| Full description | 见 2.2 | 4000 字符 | ☐ |
| App icon | 512 × 512 PNG | — | ☐ |
| Feature graphic | 1024 × 500 PNG/JPG | — | ☐ |
| Phone screenshots | 最少 2 张，最多 8 张 | — | ☐ |
| 7-inch tablet screenshots | 可选，最多 8 张 | — | ☐ |
| 10-inch tablet screenshots | 可选，最多 8 张 | — | ☐ |
| App type | Application | — | ☐ |
| Category | Game → Simulation | — | ☐ |
| Tags | Simulation, Casual, Single Player, Offline, Stylized | 最多 5 个 | ☐ |
| Content rating | 见 2.5 | — | ☐ |
| Target audience | Teen and older (13+) | — | ☐ |
| Privacy Policy URL | https://bobadash.com/privacy | — | ☐ |

### 2.2 短描述（80 字符以内）

```
Brew boba, serve fast, decorate your dream tea shop!
```

字符数：52（在 80 字符限制内）

备用短描述（A/B 测试）：
- A: `Brew boba, serve fast, decorate your dream tea shop!` (52 字符)
- B: `Run a bubble tea cafe! Cook, decorate & play with friends.` (57 字符)

### 2.3 完整描述（4000 字符以内）

```
Welcome to Boba Dash — the ultimate bubble tea time management game! 🧋

Run your own boba shop, serve delicious drinks, and build a thriving tea empire. From classic milk tea to creative custom recipes, every cup tells a story.

🧋 CRAFT & SERVE
Master the art of boba making! Brew tea, add flavors, pile on toppings, and serve customers before they lose patience. The faster you serve, the more you earn. Chain perfect orders for massive combos!

🏪 DECORATE YOUR SHOP
Transform your humble tea stand into a dream cafe. Choose from hundreds of decorations — cozy gardens, neon cyber aesthetics, sakura dreams, festive lanterns, and more. Your shop, your style!

👨‍🍳 CUSTOM RECIPES
Create your own signature boba recipe! Pick a base tea, choose your flavor, add unique toppings, and select the perfect glass. Name it, share it, and watch friends taste test from your shop!

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

### 2.4 分类与标签

| 字段 | 值 | 说明 |
|------|---|------|
| Category | Game | 主分类 |
| Sub-category | Simulation | 子分类 |
| Content rating | Everyone (E) | 见 2.5 |
| Tags | Simulation, Casual, Single Player, Offline, Stylized | 最多 5 个标签 |

标签选择逻辑：
- `Simulation` — 模拟经营类
- `Casual` — 休闲游戏
- `Single Player` — 核心玩法单人（社交功能不改变核心玩法属性）
- `Offline` — 支持离线游玩（社交功能需在线，但核心玩法可离线）
- `Stylized` — 风格化视觉

### 2.5 内容分级问卷 (Content Rating)

在 Play Console → App Content → Content Rating 中填写 IARC 分级问卷：

| 问题 | 回答 |
|------|------|
| Does the app contain violence? | No |
| Does the app contain sexual content? | No |
| Does the app contain profanity? | No |
| Does the app contain controlled substances? | No |
| Does the app contain gambling? | No |
| Does the app contain horror/fear themes? | No |
| Does the app contain money gambling? | No |
| Is the app interactive? | Yes (多人社交功能) |
| Does the app share user location? | No |
| Does the app share user personal info? | No |
| Does the app contain unshared user info? | No |
| Does the app contain digital purchases? | Yes (IAP) |

**结果分级：Everyone (E)**

### 2.6 目标受众 (Target Audience)

| 字段 | 值 |
|------|---|
| Target audience | Teen and older (13+) |
| Contains ads? | No |
| Is the app directed to children under 13? | No |

> 选择 13+ 是因为社交功能涉及与陌生人的好友互动。虽然内容本身适合全年龄，但社交功能存在不确定性。

---

## 三、视觉素材

### 3.1 App 图标

| 要求 | 规格 | 状态 |
|------|------|------|
| 尺寸 | 512 × 512 像素 | ☐ |
| 格式 | PNG 或 JPG | ☐ |
| Alpha 通道 | 允许（与 Apple 不同） | ☐ |
| 内容 | boba 杯子 + 品牌色背景 | ☐ |
| 文件大小 | < 1MB | ☐ |

### 3.2 Feature Graphic

| 要求 | 规格 | 状态 |
|------|------|------|
| 尺寸 | 1024 × 500 像素 | ☐ |
| 格式 | PNG 或 JPG | ☐ |
| 文件大小 | < 1MB | ☐ |
| 内容 | Boba Dash logo + boba 杯子 + 店铺场景 + 品牌色 | ☐ |
| 安全区域 | 避免边缘 100px 范围内放置重要内容（不同设备裁剪不同） | ☐ |

#### Feature Graphic 设计方案（2 版用于 A/B 测试）

| 版本 | 内容 | 测试目的 |
|------|------|---------|
| A 版 | boba 杯子特写 + "Boba Dash" logo + "FREE TO PLAY" 标签 | 品牌识别 |
| B 版 | 店铺全景 + 角色头像 + "Brew. Serve. Share." 文案 | 场景展示 |

### 3.3 截图要求

| 设备类型 | 尺寸 | 数量 | 状态 |
|---------|------|------|------|
| Phone screenshot | 1080 × 1920 (16:9) 或 1080 × 2400 (20:9) | 最少 2 张，最多 8 张 | ☐ |
| 7-inch tablet | 1200 × 1920 | 可选 | ☐ |
| 10-inch tablet | 1920 × 1200 | 可选 | ☐ |

#### 截图内容规划（5 张核心截图）

| # | 截图内容 | 目的 | 与 App Store 截图共用 |
|---|---------|------|---------------------|
| 1 | 制作 boba 的动作画面 + Combo 数字 | 展示核心玩法 | ✅ |
| 2 | 装饰后的店铺全景 + Decoration Score | 展示装饰系统 | ✅ |
| 3 | 好友列表 + Taste Test / Cover Shift | 展示社交功能 | ✅ |
| 4 | 外卖溢出 + 倒计时 | 展示时间管理张力 | ✅ |
| 5 | 头像定制界面 | 展示 Avatar Customization | ✅ |

#### 截图设计规范

- 使用 1080 × 1920 竖屏截图
- 顶部添加营销文案
- 文案字体：Roboto Bold 或 SF Pro Display Bold
- 文案颜色：白色 + 半透明渐变底栏
- 底部留出安全区域

### 3.4 宣传视频 (YouTube)

| 要求 | 规格 | 状态 |
|------|------|------|
| 时长 | 30 秒 - 2 分钟 | ☐ |
| 分辨率 | 1080p 以上 | ☐ |
| 格式 | MP4 | ☐ |
| 托管平台 | YouTube（设置为公开或未列出） | ☐ |
| YouTube URL | 填入 Play Console | ☐ |

视频内容脚本与 App Store 预览视频一致（详见 `app-store-checklist.md` 4.3 节），但可延长至 60 秒以展示更多内容。

---

## 四、必需文档

### 4.1 Privacy Policy URL

**要求**：Google Play Developer Policy 强制要求

**内容**：与 App Store Privacy Policy 相同，可使用同一 URL：`https://bobadash.com/privacy`

**Google Play 额外要求**：
- 如果 App 请求 "All file access" / "Location in background" / "Accessibility services" 等敏感权限，需在 Privacy Policy 中说明
- Boba Dash 不请求敏感权限，无需额外说明

### 4.2 Data Safety Section

Google Play 的 Data Safety Section 是独立于 Privacy Policy 的结构化表单，在 Play Console → App Content → Data Safety 中填写。

#### 数据收集声明

| 数据类型 | 是否收集 | 用途 | 是否加密传输 | 是否可删除 |
|---------|---------|------|------------|----------|
| Email address | 是 | Account management | 是 | 是 |
| Game progress (关卡/金币/装饰) | 是 | App functionality | 是 | 是 |
| Friends list (社交数据) | 是 | App functionality | 是 | 是 |
| Purchase history | 是 | App functionality | 是 | 是 |
| Other user-generated content (配方名/店名) | 是 | App functionality | 是 | 是 |
| Device ID | 是 | Fraud prevention (RevenueCat) | 是 | 是 |
| Crash logs | 是 | App functionality | 是 | 是 |

#### 数据安全声明

| 声明项 | 回答 |
|--------|------|
| Does your app collect or share any of the required user data types? | Yes |
| Is all of the user data collected by your app encrypted in transit? | Yes |
| Can users request that their data be deleted? | Yes |
| Do you believe this app is eligible for the Families policy? | No |
| Does your app use any sensitive permissions? | No |
| Does your app use advertising ID? | No |
| Does your app use the Health Connect API? | No |

#### 数据处理详情

对每种收集的数据类型，需填写：

| 字段 | 填写示例（Email address） |
|------|------------------------|
| Data type | Email address |
| Purpose | Account management |
| Is data shared with third parties? | Yes (Supabase, RevenueCat) |
| Is data encrypted in transit? | Yes |
| Can users request data deletion? | Yes |

### 4.3 其他必需声明

| 声明 | 是否需要 | 详情 |
|------|---------|------|
| Government apps | 否 | 不适用 |
| Financial features | 否 | 不含金融功能 |
| Health-related apps | 否 | 不适用 |
| COVID-19 contact tracing | 否 | 不适用 |
| Target audience | 是 | Teen and older (13+) |
| News apps | 否 | 不适用 |
| Content rating | 是 | Everyone (E)（见 2.5） |
| Data safety | 是 | 见 4.2 |
| Privacy Policy | 是 | 见 4.1 |
| App access | 是 | 见下文 |

### 4.4 App Access (App 权限)

如果 App 请求敏感权限（如 SMS / Call Log / Location），需说明用途。

Boba Dash 请求的权限：

| 权限 | 用途 | 是否需要声明 |
|------|------|------------|
| Internet | 网络通信 (Supabase) | 否（普通权限） |
| In-app billing | IAP 支付 | 否（自动声明） |
| Notifications | 社交通知推送 | 否（普通权限） |

> Boba Dash 不请求敏感权限，App Access 声明选 "No special access required"。

---

## 五、测试轨道策略

### 5.1 测试轨道总览

```
Internal Testing (100 人)
    ↓
Closed Testing (邀请制，20 人封闭测试)
    ↓
Open Testing (公开 Beta)
    ↓
Production (正式发布)
```

### 5.2 Internal Testing（内部测试）

| 项目 | 详情 |
|------|------|
| 用户上限 | 100 人 |
| 用户类型 | App Store Connect 团队成员的 Google 账号 |
| 审核要求 | 无需 Google 审核 |
| 上线时间 | 即时（上传 AAB 后即可安装） |
| 用途 | 开发团队内部测试 / 功能验证 / IAP 测试 |

#### Internal Testing 配置

1. Play Console → Testing → Internal Testing
2. 创建测试版本：上传 AAB
3. 添加测试员：输入 Google 邮箱
4. 复制测试链接：`https://play.google.com/apps/internaltest/xxxxxxxxxx`
5. 测试员打开链接 → 加入测试 → 从 Play Store 安装

### 5.3 Closed Testing（封闭测试）—— **新账号最大阻塞项**

#### 新账号 20 人封闭测试要求

**Google Play 新政策**：2023 年 11 月起，新创建的个人开发者账号在发布到 Production 之前，**必须完成 20 人封闭测试**，且测试需持续 **14 天以上**。

| 要求 | 详情 |
|------|------|
| 测试人数 | 至少 20 人（非团队成员） |
| 测试时长 | 至少 14 天连续测试 |
| 测试轨道 | Closed Testing |
| 测试员要求 | 必须是真实用户，不能是团队成员 |
| 测试版本 | 需要满足最低功能要求 |
| 申请审查 | 14 天后提交审查，Google 审核通过后才能发布到 Production |

#### 20 人封闭测试招募计划

**这是 Boba Dash 上线 Google Play 的最大阻塞项，必须在开发早期就开始招募测试员。**

##### 招募渠道

| 渠道 | 预期转化率 | 目标人数 | 说明 |
|------|----------|---------|------|
| Reddit (r/AndroidGaming) | 5-10% | 5-8 人 | 发帖介绍游戏 + 测试邀请链接 |
| Discord (boba / cooking game 社区) | 10-15% | 3-5 人 | 加入相关 Discord 服务器 |
| Twitter/X | 3-5% | 2-3 人 | #indiedev #androidgaming 标签 |
| Instagram | 5-8% | 2-3 人 | @bobadashgame 发布招募 |
| 朋友/家人 | 80-100% | 3-5 人 | 直接邀请 |
| **合计** | — | **15-24 人** | 目标 20+ 人（留 buffer） |

##### 招募文案模板

```
🧋 Hey Android gamers! I'm a solo dev building "Boba Dash" — a bubble tea time management game with zero ads and social features like "Taste Test" at friends' shops.

I need 20+ testers for Google Play's closed testing requirement. You'll get:
✅ Early access to the game
✅ Direct input on features
✅ Your name in the credits (optional)
✅ A free decoration pack at launch

Test runs for 14 days. Just play and share feedback!

Join here: [Google Play Testing Link]
Or DM me for the invite link!

#indiedev #androidgaming #boba
```

##### 测试员管理

| 管理项 | 方法 |
|--------|------|
| 测试员名单 | Google Sheet 记录姓名/邮箱/加入日期 |
| 测试进度追踪 | 每天检查 Play Console → Closed Testing → 安装数/活跃数 |
| 反馈收集 | Google Form / Discord 频道 |
| 不活跃测试员处理 | 7 天未活跃 → 联系提醒 → 10 天未活跃 → 替换 |
| 测试员激励 | 完成测试 → 正式版免费装饰包 + Credits 署名 |

#### Closed Testing 配置

1. Play Console → Testing → Closed Testing
2. 创建测试轨道：`Alpha`
3. 上传 AAB
4. 创建邮件列表：添加 20+ 测试员邮箱
5. 发布测试版本
6. 测试员收到 Play Store 邀请 → 加入测试 → 安装
7. 监控测试 14 天
8. 14 天后 → Play Console → 提交审查 → 等待 Google 审核

### 5.4 Open Testing（开放测试）

Closed Testing 通过后，可选进入 Open Testing：

| 项目 | 详情 |
|------|------|
| 用户上限 | 无限制 |
| 用户类型 | 任何 Google Play 用户 |
| 审核要求 | 需 Google 审核（较宽松） |
| 上线时间 | 审核通过后即时 |
| 商店可见性 | 测试版在 Play Store 显示 "Install (Beta)" |
| 用途 | 大规模公测 / 性能验证 / 兼容性测试 |

> Boba Dash 可跳过 Open Testing，直接从 Closed Testing 进入 Production。如果对 App 质量有信心，无需大规模公测。

### 5.5 Production（正式发布）

| 项目 | 详情 |
|------|------|
| 前提条件 | Closed Testing 20 人 / 14 天 已通过审查 |
| 审核要求 | Google 审核（完整审核） |
| 审核时间 | 1-3 天 |
| 分阶段发布 | 支持（1% → 10% → 50% → 100%） |

#### 分阶段发布策略

| 阶段 | 用户比例 | 持续时间 | 监控重点 |
|------|---------|---------|---------|
| Phase 1 | 10% | 24 小时 | 崩溃率 / ANR 率 / 差评 |
| Phase 2 | 50% | 48 小时 | 崩溃率 / IAP 转化 / 评分 |
| Phase 3 | 100% | — | 持续监控 |

> 如果 Phase 1 崩溃率 > 1% 或出现严重 Bug → 暂停发布 → 修复后重新开始。

---

## 六、常见拒绝原因与预防

### 6.1 拒绝原因统计

| # | 拒绝原因 | 占比 | Boba Dash 风险 | 预防措施 |
|---|---------|------|---------------|---------|
| 1 | 模仿/IP 侵权 | 20% | 低 | 原创素材 / 不使用知名品牌 |
| 2 | 欺骗行为 (Deceptive Behavior) | 15% | 低 | 描述准确 / 无误导功能 |
| 3 | 内容分级不当 | 12% | 低 | 准确填写 IARC 问卷 |
| 4 | 功能损坏 (Functionality) | 10% | 中 | 充分测试 |
| 5 | 元数据问题 | 10% | 低 | 描述/截图与 App 一致 |
| 6 | 隐私政策问题 | 8% | 低 | 准确填写 Data Safety |
| 7 | 目标受众问题 | 8% | 低 | 准确选择 13+ |
| 8 | IAP 问题 | 5% | 中 | 18 个 Base Plan 配置正确 |
| 9 | 权限滥用 | 5% | 低 | 不请求敏感权限 |
| 10 | 其他 | 7% | — | — |

### 6.2 详细预防方案

#### 6.2.1 模仿/IP 侵权

| 预防项 | 检查方法 | 状态 |
|--------|---------|------|
| App 名称不侵权 | Google 搜索 "Boba Dash" 确认无已注册商标 | ☐ |
| 图标不侵权 | 确认不与知名 boba 品牌（如 Kung Fu Tea / Gong Cha）相似 | ☐ |
| 游戏内容原创 | 所有素材为原创或合法授权 | ☐ |
| 不使用真实品牌名 | 配方名/装饰名不含真实品牌（如 "Starbucks" / "Kung Fu Tea"） | ☐ |
| 音乐素材合法 | 5 首背景音乐为原创或合法授权（保留授权文件） | ☐ |

#### 6.2.2 欺骗行为

| 预防项 | 检查方法 | 状态 |
|--------|---------|------|
| 描述与功能一致 | 描述中每个功能都在 App 中实现 | ☐ |
| 截图与实际一致 | 截图来自真实游戏画面 | ☐ |
| 无虚假功能 | 不宣传未实现的功能 | ☐ |
| IAP 描述准确 | 每个 SKU 的描述与实际内容一致 | ☐ |
| 无诱导评分 | 不在弹窗中强制要求好评 | ☐ |

#### 6.2.3 内容分级不当

| 预防项 | 检查方法 | 状态 |
|--------|---------|------|
| IARC 问卷准确 | 所有问题如实回答 | ☐ |
| 分级结果合理 | Everyone (E) 与实际内容匹配 | ☐ |
| UGC 有过滤机制 | 自定义配方名/店名有敏感词过滤 | ☐ |
| UGC 有举报机制 | 提供举报按钮 | ☐ |

#### 6.2.4 功能损坏

| 预防项 | 检查方法 | 状态 |
|--------|---------|------|
| 无崩溃 | Android Studio → Logcat 监控崩溃 | ☐ |
| 无 ANR | Application Not Responding 率 < 0.5% | ☐ |
| 所有功能可用 | 完成完整游戏循环 | ☐ |
| IAP 功能正常 | 沙箱测试所有 18 个 SKU | ☐ |
| 社交功能正常 | 测试 Grab / Cover / Leaderboard | ☐ |
| 离线模式可用 | 飞行模式下测试核心玩法 | ☐ |
| 兼容性 | 测试 Android 8.0+ / 多种屏幕尺寸 | ☐ |

#### 6.2.5 元数据问题

| 预防项 | 检查方法 | 状态 |
|--------|---------|------|
| App 名称与 App 内一致 | App 内显示 "Boba Dash" | ☐ |
| 短描述准确 | 短描述与 App 功能匹配 | ☐ |
| 完整描述准确 | 描述中功能都存在 | ☐ |
| 截图真实 | 截图来自真实游戏 | ☐ |
| 分类正确 | Game → Simulation | ☐ |

### 6.3 Google Play 政策重点检查

| 政策 | 要求 | Boba Dash 合规 |
|------|------|---------------|
| Device and Network Abuse | 不干扰设备/网络正常运行 | ✅ |
| Spam and Minimum Functionality | App 有实际功能价值 | ✅ 完整游戏 |
| Permissions | 不请求不必要的权限 | ✅ 仅 Internet + IAP + Notifications |
| User Data | 有 Privacy Policy + Data Safety | ✅ |
| Impersonation | 不模仿其他 App/品牌 | ✅ 原创 |
| Intellectual Property | 不侵犯他人 IP | ✅ 原创素材 |
| Monetization and Ads | IAP 合规 / 无欺骗性广告 | ✅ 无广告 |
| Personal and Sensitive Information | 妥善处理用户数据 | ✅ |
| Malware | 不含恶意代码 | ✅ |

---

## 七、提交流程

### 7.1 使用 EAS Submit

```bash
# 构建 Android 版本 (AAB)
eas build --platform android --profile production

# 提交到 Google Play Console
eas submit --platform android --latest

# 或手动提交：从 EAS 下载 .aab → 上传到 Play Console
```

### 7.2 EAS Build Profile 配置

```json
// eas.json
{
  "build": {
    "production": {
      "android": {
        "buildType": "apk"
      },
      "ios": {
        "buildType": "archive"
      }
    },
    "production-aab": {
      "android": {
        "buildType": "app-bundle"
      }
    }
  },
  "submit": {
    "production": {
      "android": {
        "serviceAccountKeyPath": "./google-service-account.json",
        "track": "internal"
      }
    }
  }
}
```

### 7.3 Service Account 配置

1. Google Cloud Console → IAM & Admin → Service Accounts
2. 创建 Service Account：`eas-submit@boba-dash.iam.gserviceaccount.com`
3. 授予角色：Service Account User
4. 创建 JSON Key → 下载 → 保存为 `google-service-account.json`
5. Google Play Console → Setup → API Access → 关联 Service Account
6. 授予 Service Account "Admin" 权限

### 7.4 审核时间预期

| 审核类型 | 预期时间 |
|---------|---------|
| Internal Testing | 无需审核 |
| Closed Testing | 1-2 天（首次）/ 数小时（更新） |
| Open Testing | 1-3 天 |
| Production（首次） | 1-3 天 |
| Production（更新） | 1-2 天 |
| 新账号审查（20人测试后） | 3-7 天 |

---

## 八、发布后维护

### 8.1 状态监控

| 监控项 | 工具 | 频率 |
|--------|------|------|
| 崩溃率 / ANR 率 | Play Console → Android Vitals | 每日 |
| IAP 收入 | Play Console → Earnings reports | 每日 |
| RevenueCat Dashboard | RevenueCat → Charts | 每日 |
| 用户评分 | Play Console → Ratings and reviews | 每日 |
| 安装量 / 卸载量 | Play Console → Statistics | 每日 |
| 搜索表现 | Play Console → Performance → Search | 每周 |

### 8.2 Policy 更新关注

Google Play 政策定期更新，需关注：

| 关注渠道 | 地址 |
|---------|------|
| Policy Center | [play.google.com/console/about/policies](https://play.google.com/console/about/policies) |
| Developer Update | Play Console → Messages |
| Email 通知 | 注册邮箱 |

### 8.3 版本更新流程

```
1. 开发新版本 → 测试
2. Internal Testing → 验证
3. Closed Testing → 小范围测试（已通过 20 人审查后无需再做）
4. 提交 Production → 分阶段发布
5. 监控 → 全量发布
```

---

## 九、关键时间线规划

### 9.1 Google Play 上线关键时间线

| 阶段 | 时间 | 任务 | 阻塞项 |
|------|------|------|--------|
| 账号注册 | M-8 | 注册 Google Play 账号 + 身份验证 | 身份验证 1-3 天 |
| App 创建 | M-6 | 创建 App + 配置商店列表 | — |
| IAP 配置 | M-5 | 创建 18 个 In-App Product | — |
| **招募测试员** | **M-3** | **招募 20+ 封闭测试员** | **最大阻塞项，需提前 3 个月开始** |
| 内部测试 | M-2 | Internal Testing → 功能验证 | — |
| 封闭测试启动 | M-2 | Closed Testing 上线 | 需 20 人到位 |
| **封闭测试完成** | **M-1** | **14 天测试完成 → 提交审查** | **审查需 3-7 天** |
| 审查通过 | M-1 | Google 审查通过 | — |
| 正式发布 | M-0 | Production 分阶段发布 | — |

> **关键路径**：招募 20 人 → 14 天测试 → 审查 → 发布。从招募到发布最少需要 6-8 周。务必提前规划。

---

*文档结束 · Boba Dash Google Play 审核清单 · 2026-08-10*
