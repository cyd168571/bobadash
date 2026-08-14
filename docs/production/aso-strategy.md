# Boba Dash — ASO 策略

> **文档状态**：Draft v1.0 · **日期**：2026-08-10
> **关联文档**：`app-store-checklist.md`、`google-play-checklist.md`、`localization.md`

---

## 一、ASO 策略总览

### 1.1 核心目标

| 目标 | 指标 | 目标值 |
|------|------|--------|
| 搜索可见性 | 核心关键词排名 Top 10 | "bubble tea game" / "boba game" |
| 转化率 | 商店页面访问 → 下载 | > 35% |
| 自然流量 | 无广告投放的有机下载 | 70%+ 下载来自自然搜索 |
| 评分 | 商店评分 | > 4.5 星 |
| 零预算推广 | 无付费广告 | CAC = $0 |

### 1.2 ASO 双平台策略

| 平台 | 搜索算法特点 | ASO 侧重 |
|------|------------|---------|
| Apple App Store | 关键词字段 100 字符权重高 + 标题/副标题匹配 | 关键词字段优化 + 标题含核心词 |
| Google Play | 完整描述 + 短描述 + 标题匹配 | 描述中关键词密度 + 短描述含核心词 |

---

## 二、关键词策略

### 2.1 关键词分层

| 层级 | 定义 | 关键词 | 搜索量 | 竞争度 | 优先级 |
|------|------|--------|--------|--------|--------|
| 主词 | 核心品类词，搜索量最高 | bubble tea game, boba game, cooking game, time management game, tea shop game | 高 | 高-中 | P0 |
| 次词 | 场景/动作词，搜索量中等 | milk tea maker, drink making game, restaurant game, cafe game, drink game | 中 | 中 | P1 |
| 长尾词 | 低竞争精准词 | boba shop simulator, bubble tea simulator, tea making game, boba cooking game, cafe simulator | 低 | 低 | P2 |
| 竞品词 | 竞品品牌词 | (监控竞品关键词，不直接投放) | 中 | 高 | P3 |

### 2.2 主词分析

| 关键词 | 月搜索量(估) | 竞争度 | 当前排名(预估) | 目标排名 | 优化手段 |
|--------|------------|--------|-------------|---------|---------|
| bubble tea game | 15,000-25,000 | 中 | 无排名 | Top 10 | 标题含 "Boba" + 关键词字段含 "bubble tea" |
| boba game | 10,000-18,000 | 中 | 无排名 | Top 5 | 标题 "Boba Dash" 直接含 "Boba" |
| cooking game | 50,000-80,000 | 高 | 无排名 | Top 30 | 关键词字段 + 描述密度 |
| time management game | 20,000-35,000 | 中高 | 无排名 | Top 20 | 关键词字段 + 描述密度 |
| tea shop game | 8,000-12,000 | 低-中 | 无排名 | Top 5 | 关键词字段 + 短描述 |

### 2.3 次词分析

| 关键词 | 月搜索量(估) | 竞争度 | 目标排名 |
|--------|------------|--------|---------|
| milk tea maker | 5,000-8,000 | 低 | Top 10 |
| drink making game | 3,000-5,000 | 低 | Top 10 |
| restaurant game | 20,000-30,000 | 高 | Top 30 |
| cafe game | 8,000-12,000 | 中 | Top 15 |
| drink game | 3,000-5,000 | 低 | Top 10 |

### 2.4 长尾词策略

长尾词搜索量低但竞争度极低，是冷启动期获取精准用户的核心渠道：

| 长尾词 | 月搜索量(估) | 竞争度 | 预期排名 |
|--------|------------|--------|---------|
| boba shop simulator | 1,000-2,000 | 极低 | Top 3 |
| bubble tea simulator | 1,500-3,000 | 低 | Top 5 |
| tea making game | 2,000-4,000 | 低 | Top 5 |
| boba cooking game | 800-1,500 | 极低 | Top 3 |
| cafe simulator | 2,000-3,500 | 低 | Top 10 |

### 2.5 竞品词监控

以下竞品需定期监控其关键词排名和商店页面变化：

| 竞品 | 平台 | 监控内容 |
|------|------|---------|
| Boba Story | iOS + Android | 关键词排名 / 截图策略 / 定价 |
| Bubble Tea! | iOS + Android | 关键词排名 / 评分策略 |
| I Love Bubble Tea | iOS + Android | 关键词排名 / 更新频率 |
| Milk Tea Boba | iOS + Android | 关键词排名 / 描述策略 |

**监控工具**：
- [Sensor Tower](https://sensortower.com)（免费版可查看有限数据）
- [AppBrain](https://appbrain.com)（Android 免费）
- [MobileAction](https://mobileaction.co)（免费试用）

### 2.6 Apple 关键词字段优化（100 字符）

```
bubble tea,boba,cooking,time management,tea shop,drink maker,restaurant,decoration,social,cafe
```

字符数：100（刚好满）

优化逻辑：
- 前 5 个词为主词（权重最高）
- 后 5 个词为次词/场景词
- 不重复标题中已有的词（Apple 不计入重复词）
- 不使用空格后的逗号（浪费字符）

### 2.7 Google Play 关键词策略

Google Play 没有关键词字段，关键词权重来自：

| 位置 | 权重 | 优化建议 |
|------|------|---------|
| App Title (30 字符) | 最高 | "Boba Dash" 含核心词 "Boba" |
| Short Description (80 字符) | 高 | "Brew boba, serve fast, decorate your dream tea shop!" 含 boba / tea shop |
| Full Description (4000 字符) | 中 | 自然提及关键词 5-8 次，不堆砌 |
| App Category | 中 | Game → Simulation |
| Tags | 中 | Simulation, Casual, Stylized |

#### Full Description 关键词密度优化

在 4000 字符描述中自然分布关键词：

| 关键词 | 目标出现次数 | 自然融入位置 |
|--------|------------|------------|
| boba | 8-12 次 | 标题/段落首句/功能描述 |
| bubble tea | 3-5 次 | 开头/功能描述/结尾 |
| cooking | 2-3 次 | 功能段落 |
| time management | 2-3 次 | 功能段落 |
| tea shop / cafe | 3-5 次 | 功能描述 |
| decoration | 2-3 次 | 装饰功能段落 |
| recipe | 3-5 次 | 配方功能段落 |
| friends / social | 3-5 次 | 社交功能段落 |

---

## 三、截图策略

### 3.1 截图设计原则

| 原则 | 说明 |
|------|------|
| 前 3 张最重要 | 80% 用户只看前 3 张就决定是否下载 |
| 讲故事 | 截图序列应讲述"这是什么游戏 → 有什么好玩的 → 为什么我要下载" |
| 一图一信息 | 每张截图只传达一个核心卖点 |
| 真实游戏画面 | 不用概念图/渲染图，用真实截图 |
| 文案简短 | 每张截图顶部一行文案，5-8 个词 |

### 3.2 截图序列设计（5 张）

#### 第 1 张：核心玩法（最重要）

| 元素 | 内容 |
|------|------|
| 画面 | 制作 boba 的动作瞬间：倒茶 → 加珍珠 → 加奶 → 封口，4 格分镜或动态模糊效果 |
| 顶部文案 | "Brew. Serve. Repeat." |
| 视觉重点 | boba 杯子 + Combo 数字飞出 + 金币动画 |
| 底部 | 品牌色渐变底栏 + "FREE TO PLAY" 标签 |

#### 第 2 张：装饰展示

| 元素 | 内容 |
|------|------|
| 画面 | 装饰后的店铺全景（使用 Sakura Dreams Pack 装饰风格） |
| 顶部文案 | "Decorate Your Dream Cafe" |
| 视觉重点 | 樱花树 + 灯笼 + 木质吧台 + 装饰分数 "Decoration Score: 2,450" |
| 底部 | "100+ Decorations" 标签 |

#### 第 3 张：社交功能

| 元素 | 内容 |
|------|------|
| 画面 | 好友列表 + Taste Test 动画（好友头像走进店铺） |
| 顶部文案 | "Taste Test with Friends!" |
| 视觉重点 | 3 个好友头像 + Taste Test 按钮 + 收益飞出 "+18 coins" |
| 底部 | "Both Players Earn Coins!" 标签 |

#### 第 4 张：时间管理张力

| 元素 | 内容 |
|------|------|
| 画面 | 外卖电话响铃 + 顾客排队 + 倒计时圈 |
| 顶部文案 | "Keep Up with the Rush!" |
| 视觉重点 | 3 个外卖订单倒计时 + 2 个顾客等待条 + Combo x5 |
| 底部 | "Fast Service = Big Tips" 标签 |

#### 第 5 张：头像定制

| 元素 | 内容 |
|------|------|
| 画面 | 头像定制界面（发型选择 + 服装选择 + 配饰选择） |
| 顶部文案 | "Express Your Style" |
| 视觉重点 | 6 种发型缩略图 + 6 种服装缩略图 + 角色预览 |
| 底部 | "50+ Hairstyles, Outfits & Accessories" 标签 |

### 3.3 截图设计规范

| 规范 | 说明 |
|------|------|
| 分辨率 | 1290 × 2796 (iPhone 6.7") / 1080 × 1920 (Android) |
| 字体 | SF Pro Display Bold (iOS) / Roboto Bold (Android) |
| 文案颜色 | 白色 #FFFFFF |
| 底栏 | 半透明黑色渐变 (from rgba(0,0,0,0.7) to transparent) |
| 品牌色 | #FF6B9D (粉色) / #4ECDC4 (薄荷绿) |
| 安全区 | 顶部 200px 文案区 / 中间截图区 / 底部 150px 标签区 |

---

## 四、A/B 测试计划

### 4.1 App 图标 A/B 测试（3 版）

| 版本 | 设计 | 测试假设 | 指标 |
|------|------|---------|------|
| A 版 | boba 杯子居中 + 粉色背景 | 品牌识别度高 | 点击率 |
| B 版 | boba 杯子 + 薄荷绿背景 + "BOBA" 文字 | 关键词强化 | 点击率 |
| C 版 | boba 杯子倾斜 + 动感线条 + 粉绿渐变 | 动感吸引力 | 点击率 |

测试周期：每版 7 天，共 3 周
测试平台：Google Play Store Listing Experiment（原生 A/B 测试）
样本量：每组至少 1,000 次展示

### 4.2 Feature Graphic A/B 测试（2 版）

| 版本 | 设计 | 测试假设 |
|------|------|---------|
| A 版 | boba 杯子特写 + "Boba Dash" logo + "FREE TO PLAY" | 品牌识别 |
| B 版 | 店铺全景 + 角色 + "Brew. Serve. Share." | 场景展示 |

测试周期：每版 7 天

### 4.3 短描述 A/B 测试（Google Play）

| 版本 | 文案 | 测试假设 |
|------|------|---------|
| A 版 | "Brew boba, serve fast, decorate your dream tea shop!" | 动作词驱动 |
| B 版 | "Run a bubble tea cafe! Cook, decorate & play with friends." | 社交词驱动 |
| C 版 | "The #1 bubble tea game! Brew, decorate & share with friends." | 排名背书驱动 |

测试周期：每版 7 天
测试指标：搜索展示 → 下载转化率

### 4.4 A/B 测试执行工具

| 平台 | 工具 | 说明 |
|------|------|------|
| Google Play | Play Console → Store Listing Experiments | 原生 A/B 测试，自动分流 |
| Apple App Store | App Store Connect → Product Page Optimization | 原生 A/B 测试（iOS 15+） |
| 第三方 | StoreMaven / SplitMetrics | 付费工具，更精确控制 |

---

## 五、转化率优化

### 5.1 转化率基准

| 指标 | 行业基准 | Boba Dash 目标 |
|------|---------|---------------|
| 搜索展示 → 下载 | 25-40% | > 35% |
| 浏览 → 下载 | 15-30% | > 25% |
| 第一印象（前 3 秒）| 决定 60% 的下载行为 | 优化前 3 张截图 |

### 5.2 转化率优化清单

| # | 优化项 | 影响程度 | 优化方法 |
|---|--------|---------|---------|
| 1 | App 名称含核心关键词 | ★★★★★ | "Boba Dash" 含 "Boba" |
| 2 | 副标题传达核心价值 | ★★★★☆ | "Brew, Serve & Share Boba!" |
| 3 | 前 3 张截图讲清游戏 | ★★★★★ | 核心玩法 / 装饰 / 社交 |
| 4 | 预览视频展示动态 | ★★★★☆ | 30 秒展示核心循环 |
| 5 | 评分 > 4.5 星 | ★★★★★ | 评分弹窗策略 |
| 6 | 评论文案正面 | ★★★☆☆ | 评论回复策略 |
| 7 | App 图标吸引力 | ★★★★☆ | A/B 测试 |
| 8 | 描述首段抓人 | ★★★☆☆ | "Welcome to Boba Dash — the ultimate bubble tea game!" |
| 9 | 无广告标识 | ★★★☆☆ | 描述中突出 "100% ad-free" |
| 10 | 免费 + IAP 透明 | ★★★☆☆ | "Free to play, optional cosmetic purchases" |

### 5.3 名称 + 副标题关键词密度优化

#### Apple App Store

| 字段 | 值 | 关键词覆盖 |
|------|---|-----------|
| App Name (30 字符) | Boba Dash | boba |
| Subtitle (30 字符) | Brew, Serve & Share Boba! | boba, serve, share |
| Keywords (100 字符) | bubble tea,boba,cooking,time management,tea shop,drink maker,restaurant,decoration,social,cafe | bubble tea, cooking, time management, tea shop, drink maker, restaurant, decoration, social, cafe |

#### Google Play

| 字段 | 值 | 关键词覆盖 |
|------|---|-----------|
| App Name (30 字符) | Boba Dash | boba |
| Short Description (80 字符) | Brew boba, serve fast, decorate your dream tea shop! | boba, serve, decorate, tea shop |
| Full Description | 自然分布 15+ 个关键词 | 所有目标关键词 |

---

## 六、评分与评论策略

### 6.1 评分弹窗策略

#### 触发时机

| 时机 | 是否弹评分 | 原因 |
|------|----------|------|
| 第 5 关完成后 | ✅ **弹** | 玩家已投入 5-10 分钟，体验了核心循环，心情最好 |
| 高 Combo 后（Combo ≥ 10） | ✅ **弹** | 成就感最高时刻 |
| 完成 Taste Test 后 | ❌ 不弹 | 社交动作后应保持流畅，不打断 |
| 关卡失败后 | ❌ **绝不弹** | 玩家心情最差，弹评分会招致差评 |
| 首次购买后 | ❌ 不弹 | 购买后不应立即要求评分，避免被误解为付费评分 |
| 首次被好友 Taste Test 后 | ❌ 不弹 | 不打断社交反馈 |

#### 评分弹窗实现

```typescript
// 使用 SKStoreReviewController (iOS) / Google In-App Review (Android)
// React Native 使用 react-native-rate 或 expo-review

import * as StoreReview from 'expo-store-review'

async function maybeShowRatingPrompt() {
  // 条件检查
  const completedLevels = await getCompletedLevels()
  const hasRated = await hasUserRatedBefore()

  if (completedLevels >= 5 && !hasRated) {
    // 检查系统是否允许弹窗（Apple 限制每年最多 3 次）
    if (await StoreReview.isAvailableAsync()) {
      await StoreReview.requestReview()
      await markUserRated()
    }
  }
}

// 调用时机：第 5 关完成后的结算页面
// 或 Combo >= 10 时
```

#### Apple 评分弹窗限制

- 系统每年最多显示 3 次评分弹窗
- 系统自动节流，开发者无法控制频率
- 用户在系统设置中可完全关闭评分弹窗

#### Google Play 评分弹窗限制

- 每个用户每个 App 生命周期内最多显示 1 次
- 需要用户已登录 Google 账号
- 需要设备有 Google Play Store

### 6.2 评分目标

| 指标 | 目标 | 策略 |
|------|------|------|
| 评分 | > 4.5 星 | 评分弹窗只在正面时刻触发 |
| 评分数 | 首月 50+ / 三月 200+ | 弹窗策略 + 社交分享引导 |
| 差评回复率 | 100% | 每条差评都回复 |
| 差评转化 | 30% 差评改为好评 | 回复后邀请用户重新评价 |

### 6.3 评论回复模板

#### 正面评论回复模板

```
Thank you so much for the kind words! 🧋 We're thrilled you're enjoying Boba Dash.
Stay tuned for more decorations and music packs coming soon!
```

#### 中性评论回复模板

```
Thanks for playing Boba Dash! We appreciate your feedback. What features would you
like to see in future updates? Let us know at support@bobadash.com 🧋
```

#### 差评评论回复模板

```
We're sorry to hear about your experience. We take your feedback seriously and
want to make it right. Please contact us at support@bobadash.com with details,
and we'll do our best to address your concerns. Thank you for giving Boba Dash
a try. 🧋
```

#### 差评回复策略

1. 24 小时内回复所有差评（1-2 星）
2. 道歉 + 理解 + 行动方案
3. 引导到邮件沟通（不在评论区争论）
4. 修复问题后邀请用户更新评价
5. 不要模板化回复——针对每条差评的具体问题回应

### 6.4 差评预防

| 常见差评原因 | 预防措施 |
|------------|---------|
| 崩溃 / Bug | 充分测试 + 快速修复 + 回复中告知已修复 |
| 付费太贵 | $0.99 入门档 + 描述中突出 "optional" |
| 广告太多 | 零广告（描述中突出 "100% ad-free"） |
| 太难 / 太简单 | 难度曲线调优 + 中期关卡调整 |
| 没有中文 | 描述中注明语言为 English，后续 P3 扩展中文 |
| 社交功能不够好 | 持续迭代社交功能 + 回复中告知更新计划 |

---

## 七、TikTok / Instagram Reels 零预算推广策略

### 7.1 为什么选择 TikTok / Instagram Reels

| 平台 | 用户画像 | 与 Boba Dash 契合度 | 成本 |
|------|---------|-------------------|------|
| TikTok | 16-34 岁，女性偏多，喜欢 food / cooking / aesthetic 内容 | ★★★★★ | $0 |
| Instagram Reels | 18-35 岁，视觉导向，喜欢 aesthetic / cozy 内容 | ★★★★☆ | $0 |
| YouTube Shorts | 18-40 岁，游戏内容接受度高 | ★★★☆☆ | $0 |

### 7.2 内容策略

#### 7.2.1 内容类型（5 类）

| 类型 | 内容 | 示例标题 | 预期效果 |
|------|------|---------|---------|
| 游戏实况 | 录制游戏中制作 boba 的过程 | "POV: You're running a boba shop 🧋" | 展示核心玩法 |
| 装饰展示 | 展示不同装饰风格的店铺 | "Decorating my dream boba cafe ✨" | 展示装饰系统 |
| 社交互动 | 展示 Taste Test / Cover Shift | "When your friend does a Taste Test at your shop 👀" | 展示社交功能 |
| 头像定制 | 展示 Avatar Customization | "Styling my boba shop character 💁‍♀️" | 展示头像系统 |
| ASMR / 满足感 | boba 制作音效 + 视觉 | "ASMR: Making the perfect boba 🎧" | 病毒传播潜力 |

#### 7.2.2 发布频率

| 平台 | 频率 | 最佳发布时间 (UTC) |
|------|------|------------------|
| TikTok | 每天 1 条 | 12:00 / 18:00 / 22:00 |
| Instagram Reels | 每周 3-5 条 | 11:00 / 17:00 / 21:00 |
| YouTube Shorts | 每周 2-3 条 | 14:00 / 20:00 |

#### 7.2.3 视频规格

| 平台 | 时长 | 分辨率 | 格式 | 音乐 |
|------|------|--------|------|------|
| TikTok | 15-60 秒 | 1080 × 1920 (9:16) | MP4 | TikTok 热门音乐 |
| Instagram Reels | 15-30 秒 | 1080 × 1920 (9:16) | MP4 | Instagram 音乐库 |
| YouTube Shorts | 15-60 秒 | 1080 × 1920 (9:16) | MP4 | YouTube 音频库 |

### 7.3 TikTok 运营策略

#### 7.3.1 账号设置

| 项目 | 内容 |
|------|------|
| 用户名 | @bobadashgame |
| 头像 | Boba Dash App 图标 |
| 简介 | "🧋 The ultimate bubble tea game! Brew, decorate & play with friends. 100% ad-free. Download free ↓ iOS + Android" |
| 链接 | Linktree（含 App Store + Google Play 下载链接） |

#### 7.3.2 话题标签策略

每条视频使用 5-8 个话题标签：

| 标签类型 | 标签 | 搜索量 |
|---------|------|--------|
| 核心 | #boba | 5B+ |
| 核心 | #bubbletea | 3B+ |
| 游戏 | #mobilegame | 2B+ |
| 游戏 | #cookinggame | 500M+ |
| 游戏 | #indiedev | 300M+ |
| 细分 | #bobatea | 1B+ |
| 细分 | #bobaaddict | 200M+ |
| 细分 | #cafegame | 100M+ |
| 互动 | #fyp | 10T+ |
| 互动 | #foryou | 10T+ |

#### 7.3.3 病毒视频脚本模板

**15 秒病毒视频脚本（ASMR 类型）**：

```
0-2s:   画面：空杯子 → 倒入茶底（ASMR 音效）
2-4s:   画面：加入珍珠（啵啵声）
4-6s:   画面：加入奶（白色漩涡）
6-8s:   画面：封口摇匀（摇晃声）
8-10s:  画面：完美 boba 杯特写
10-12s: 画面：拉远 → 这是 Boba Dash 游戏！
12-15s: 画面：游戏 logo + "Download Free" + App Store / Google Play 按钮
```

**30 秒病毒视频脚本（故事类型）**：

```
0-3s:   "POV: Your friend opened a boba shop"
3-8s:   展示好友店铺 → 点击 Taste Test → 动画
8-13s:  "Both of you earn coins!" → 金币飞出
13-18s: 展示自己的店铺 → 装饰 → 换主题
18-23s: 展示排行榜 → "I'm #1 this week!"
23-28s: 展示头像定制 → "But look at my outfit"
28-30s: "Boba Dash — Download Free" + logo
```

### 7.4 Instagram Reels 运营策略

#### 7.4.1 账号设置

| 项目 | 内容 |
|------|------|
| 用户名 | @bobadashgame |
| 账号类型 | Business Account |
| 简介 | "🧋 Boba Dash — Brew, decorate & play with friends. 100% ad-free. Link in bio ↓" |
| Link in Bio | Linktree（含下载链接） |
| Story Highlights | "Gameplay" / "Decorations" / "Social" / "FAQ" |

#### 7.4.2 Instagram Story 策略

| Story 类型 | 频率 | 互动元素 |
|-----------|------|---------|
| 每日 boba 制作 | 每天 1 条 | Poll: "What topping?" |
| 新装饰预告 | 每周 2 条 | Quiz: "Which theme?" |
| 用户作品转发 | 按需 | Repost 玩家分享的店铺截图 |
| 下载引导 | 每周 1 条 | "Link in bio" + 截图教程 |

#### 7.4.3 Instagram 帖子策略

| 频率 | 内容 |
|------|------|
| 每周 3 帖 | 装饰展示 / 游戏截图 / 节日主题 |
| 帖子格式 | 1080 × 1080 (正方形) 或 1080 × 1350 (竖版 4:5) |
| 帖子文案 | 简短 + emoji + 话题标签 |
| 话题标签 | #boba #bubbletea #mobilegame #cookinggame #cafegame |

### 7.5 KOL / 微型网红合作（零预算）

#### 7.5.1 微型网红策略

| 网红类型 | 粉丝量 | 合作方式 | 成本 |
|---------|--------|---------|------|
| Nano-influencer | 1K-10K | 免费提供 App 内装饰包 + Credits 署名 | $0 |
| Micro-influencer | 10K-50K | 免费提供 App 内装饰包 + 独家预告 | $0 |
| Food / boba 博主 | 任意 | 免费提供 App 内专属 "Food Blogger" 头像 | $0 |

#### 7.5.2 合作邀约模板

```
Hi [Name]! 🧋

I'm a solo developer building "Boba Dash" — a bubble tea time management game
for iOS and Android. I love your boba/cooking content and think your audience
would enjoy the game!

Would you be interested in trying it out? I'd love to offer you:
✅ Early access to the game
✅ Exclusive in-game items (custom avatar + decoration pack)
✅ Your name/nickname in the game credits
✅ A custom signature recipe named after you

No strings attached — if you enjoy the game and want to share it, amazing!
If not, the items are yours to keep either way. 💛

Let me know if you're interested!
Best,
[Your Name]
Boba Dash
```

### 7.6 社区运营

#### 7.6.1 Discord 服务器

| 频道 | 用途 |
|------|------|
| #welcome | 新用户引导 + 游戏介绍 |
| #general | 一般讨论 |
| #share-your-shop | 玩家分享店铺截图 |
| #custom-recipes | 分享招牌配方 |
| #friend-codes | 添加好友 |
| #suggestions | 功能建议 |
| #bug-reports | Bug 反馈 |
| #updates | 更新公告 |

#### 7.6.2 Reddit

| 子版块 | 发帖策略 |
|--------|---------|
| r/AndroidGaming | 每月 1-2 帖（开发日志 / 更新公告） |
| r/iosgaming | 每月 1-2 帖（上线公告 / 更新） |
| r/cookinggames | 每周 1 帖（内容分享） |
| r/indiedev | 开发过程分享（不推广） |
| r/BobaTea | 非推广内容，分享游戏中的 boba 配方 |

---

## 八、ASO 监控与迭代

### 8.1 监控指标

| 指标 | 工具 | 频率 | 目标 |
|------|------|------|------|
| 关键词排名 | Sensor Tower / AppBrain | 每周 | 主词 Top 10 |
| 搜索展示量 | Play Console / App Store Connect | 每周 | 持续增长 |
| 下载转化率 | Play Console / App Store Connect | 每周 | > 35% |
| 商店评分 | Play Console / App Store Connect | 每日 | > 4.5 |
| 评论文本 | 手动 | 每周 | 正面情感趋势 |
| 竞品动态 | Sensor Tower | 每月 | 关注关键词变化 |

### 8.2 迭代节奏

| 迭代项 | 频率 | 方法 |
|--------|------|------|
| 关键词字段 | 每月 | 根据排名变化调整低效词 |
| 截图 | 每季度 | A/B 测试结果 + 新功能上线 |
| 短描述 | 每月 | A/B 测试 |
| App 图标 | 每半年 | A/B 测试（如有需要） |
| Feature Graphic | 每季度 | A/B 测试 |
| 视频 | 每季度 | 新内容 / 新功能展示 |

### 8.3 ASO 优化日历

| 月份 | 重点任务 |
|------|---------|
| M1（上线月） | 基础 ASO 配置 + 截图/视频上线 + 开始 TikTok/Instagram 运营 |
| M2 | 关键词排名监控 + 第一轮 A/B 测试（图标/短描述） |
| M3 | 根据数据优化关键词字段 + 第二轮 A/B 测试（截图/Feature Graphic） |
| M4-M6 | 持续迭代 + KOL 合作 + 社区运营 |
| M7+ | 季度大版本更新 → 新截图/视频/描述 |

---

*文档结束 · Boba Dash ASO 策略 · 2026-08-10*
