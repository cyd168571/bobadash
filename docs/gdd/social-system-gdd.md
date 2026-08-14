# Boba Dash — Social System GDD

> **文档状态**：v2.0 · **负责人**：独立开发者 · **日期**：2026-08-11（v2.0 更新）
> **适用版本**：海外社交版（React Native / Expo · iOS + Android · Supabase 后端）
> **关联文档**：`business-model.md`、`monetization-setup.md`、`localization.md`
>
> **v2.0 变更摘要**：
> - 社交机制 Taste Test 经济模型：Taster 35% / Tasted 20% / System 45%
> - 新增原生社交平台集成：Apple Game Center + Google Play Games Services
> - 排行榜新增原生模式（Game Center / Play Games 原生 UI），Supabase 作为跨平台 fallback
> - 好友系统新增原生好友列表导入（Game Center / Play Games 好友自动匹配）
> - 新增社交分享：Instagram Stories + TikTok 分享

---

## Part 1：概念设计

### 1.1 MDA 分析

| 维度 | 内容 |
|------|------|
| **Mechanics（机制）** | 好友位固定 5 个（免费，不可付费扩展）；Taste Test 每日 5 次、每好友限 1 次；Cover Shift 每日 5 次、每好友限 1 次；Leaderboard 3 维度每周一 00:00 UTC 重置（原生 Game Center / Play Games 排行榜 + Supabase 跨平台 fallback）；Custom Recipes 模块化创建，免费 0 槽 / $0.99 解锁 1 槽；原生社交平台好友自动导入（Game Center / Play Games 好友列表同步到 Supabase）；Instagram Stories + TikTok 社交分享 |
| **Dynamics（动态）** | 玩家每天打开游戏先扫一遍好友列表：谁还没 Taste Test？谁离线了可以 Cover？我的招牌配方今天被点了几次？排行榜还剩 3 天，我能不能再冲一把 Combo？这些日常微决策构成社交留存核心循环。原生平台好友自动匹配降低了加好友门槛。 |
| **Aesthetics（体验）** | "我的朋友在等我" — 不是被推送通知打扰，而是主动想知道好友店铺发生了什么；"我创造了独特的东西" — 招牌配方被好友点到时的惊喜感；"我们一起经营" — Cover Shift 传递的互助温度；"有人来试喝我的招牌" — 品牌被认可的正向满足感 |

### 1.2 五条设计支柱

| # | 支柱 | 含义 | 违反即作废 |
|---|------|------|-----------|
| 1 | **双方都赚（Win-Win）** | 任何社交互动中，发起方和接收方都获得正收益。不存在"被偷"的负面体验 | 如果一个机制让接收方感到损失，则该机制不成立 |
| 2 | **免费玩家是获客渠道，不是白嫖者** | 免费玩家的社交行为（分享、Grab、Cover）为付费玩家创造展示场景和裂变价值 | 不设"付费才能社交"的门槛 |
| 3 | **好友位固定 5 个，永不付费扩展** | 好友位是社交带宽，不是变现工具。5 个好友足以形成完整社交循环 | 任何"扩好友位"付费 SKU 都被禁止 |
| 4 | **不卖数值，卖表达** | 付费 SKU 仅涉及装饰 / 配方 / 外观 / 头像 / 音乐，不影响时间管理核心玩法的数值平衡 | 任何影响 Core Loop 数值的付费项作废 |
| 5 | **服务端权威，客户端只展示** | 所有收益计算、防刷校验、每日上限判定均在 Supabase Edge Function 中完成 | 客户端不得自行计算最终金币收益 |

### 1.3 "偷菜"式双方都赚的设计哲学

2009 年 QQ 农场的"偷菜"机制之所以成为现象级社交裂变，核心不在于"偷"的掠夺感，而在于：

1. **低门槛互动**：每天花 2 分钟扫一遍好友列表即可完成全部社交动作
2. **双向触发**：你偷我菜 → 我收到通知 → 我打开游戏 → 我去偷你的菜 → 循环成立
3. **双方都赚的错觉**：表面上是"偷"，实际上被偷方并没有真正损失（作物会重新生长），偷的一方获得了收益，被偷的一方获得了"被关注"的社交信号和回访动机

Boba Dash 将这一哲学升级为**字面意义上的双方都赚**：

| 机制 | 发起方收益 | 接收方收益 | 与"偷菜"的对应 |
|------|-----------|-----------|--------------|
| Taste Test | 获得 35% 金币 + 体验好友招牌配方 | 获得 20% 金币 + "品牌被试喝"的曝光满足 | 你"尝"了我一杯 boba，你赚了钱、我也赚了钱（"free sample"双赢模型） |
| Cover Shift | 获得 15% 金币 + 互助成就感 | 获得 70% 金币 + 离线收入被挽回 | 你"帮"我看了店，我本来要损失的外卖被救回来了 |
| Leaderboard | 排名上升的成就感 | 被超越后"我要追回来"的动机 | 排行榜是"偷菜"的竞争变体——你超过我 → 我收到通知 → 我回来玩 |
| Custom Recipes | 招牌被点到时的创作自豪感 | 喝到好友独家配方的惊喜 | 你"种"了一棵新菜（创了配方），我来"品尝"（Taste Test）时能喝到 |

**核心洞察**：社交裂变的燃料不是"利益输送"，而是"双向正反馈循环"。每个社交动作都让对方有理由回来玩，这才是 K-factor > 0 的根本。

---

## Part 2：4 个机制详细规格

### 2.1 Taste Test（试喝）

#### 2.1.1 概念

好友来你的店里"试喝"一杯 boba——就像餐饮行业的"free sample"概念。这杯 boba 的成本由系统承担，你和好友都获得金币收益。如果好友有 Custom Recipe（招牌配方），你有 30% 概率喝到招牌，并在社交日报中看到招牌名称。

> **改名理由**："Taste Test"（试喝）在欧美餐饮文化中是完全正面的概念——"free sample"让双方都受益，且被试喝方获得"品牌曝光"的正向体验。

#### 2.1.2 交互流程

```
玩家A 打开 Friends 面板
  → 看到好友列表，每个好友头像旁有 "Taste Test" 按钮（如果今日还未试喝过该好友）
  → 点击按钮
  → 弹出好友店铺缩略图（展示装饰风格）
  → 动画：A 的头像走进 B 的店，品尝了一杯 boba
  → 结算弹窗：
     "You tasted a cup of {drink_name} from {friend_name}'s shop!"
     "You earned {coins_A} coins (35%)"
     "{friend_name} earned {coins_B} coins (20%) — brand exposure reward!"
  → 如果喝到招牌配方：
     "✨ It's {friend_name}'s signature recipe: {recipe_name}!"
     "Tap to view recipe →"
  → 社交日报记录这次互动
```

#### 2.1.3 收益公式

```
基础收益 = Base Value × Tier Multiplier

其中：
  Base Value = 20 coins（固定基础值）
  Tier Multiplier = Taster 当前所在 Tier 的收益系数
    Tier 1 (Level 1-10):  ×1.0
    Tier 2 (Level 11-25): ×1.5
    Tier 3 (Level 26-50): ×2.0
    Tier 4 (Level 51-80): ×3.0
    Tier 5 (Level 81+):   ×4.0

收益分配（基于 Taster Tier 计算）：
  Taster 获得：Base Value × Tier Multiplier × 35%
  Owner 获得：  Base Value × Tier Multiplier × 20%
  System 承担：Base Value × Tier Multiplier × 45%（系统注入，不从 Owner 扣除）

具体数值表（v2.0）：
  Taster Tier 1: Taster +7 coins,  Owner +4 coins
  Taster Tier 2: Taster +10.5 coins, Owner +6 coins
  Taster Tier 3: Taster +14 coins,  Owner +8 coins
  Taster Tier 4: Taster +21 coins,  Owner +12 coins
  Taster Tier 5: Taster +28 coins,  Owner +16 coins

实际发放时取整数（向下取整），小数部分累积到系统账本。

经济模型设计理由：
  · Owner 收益 20%：让被试喝方获得足够的正向反馈（"有人来试喝 = 品牌曝光 = 我也赚了"）
  · Taster 收益 35%：降低套利动机（被试喝方收益比例提高，套利空间缩小）
  · 系统补贴 45%：补足差额（总收益为 100%）
  · 每天 5 个好友 × 20% = 相当于 1 杯完整售出的收益，心理完全可接受
```

#### 2.1.4 每日上限

| 限制项 | 数值 | 说明 |
|--------|------|------|
| 每日 Taste Test 总次数 | 5 次/天 | 每日 00:00 UTC 重置 |
| 每好友 Taste Test 次数 | 1 次/天/好友 | 同一好友每天只能被试喝 1 次 |
| 被 Taste Test 次数 | 无上限 | 被更多好友试喝 = 更多收益，无需限制 |

#### 2.1.5 防跨 Tier 套利规则

**问题场景**：Tier 5 玩家试喝 Tier 1 玩家的店，如果按 Owner Tier 计算收益，Owner 会获得远超自身 Tier 的金币，形成"高 Tier 帮低 Tier 刷钱"的套利路径。

**解决方案**：所有收益计算**基于 Taster Tier**，与 Owner Tier 无关。

```
✅ 正确：Taster Tier 5 Taste Test 任意 Owner
  → Taster +28 coins (Tier 5 × 35%)
  → Owner +16 coins (Tier 5 × 20%)
  → Owner 获得的 16 coins 是 Tier 5 级别的 20%，但这对 Owner 来说是"意外之财"，不影响 Owner 自身 Tier 的经济平衡

❌ 错误：按 Owner Tier 计算
  → 如果 Owner 是 Tier 1，Taster 是 Tier 5
  → Owner 获得 Tier 1 × 20% = 4 coins（太少了，没有"品牌被试喝"的满足感）
  → 或者反过来按 Owner Tier 计算会让高 Taster 低 Owner 的组合产生异常收益
```

**结论**：Taster Tier 决定一切。Owner 获得的收益是"品牌曝光奖励"，不是"经营收入"，因此不需要与 Owner 自身 Tier 挂钩。

#### 2.1.6 招牌配方触发

```
if (Owner 有 Custom Recipe):
  30% 概率喝到招牌
  → drink_name 显示为 recipe_name
  → Taster 可点击查看配方组成（Base → Flavor → Topping → Glass）
  → Taster 不能复制配方（只能查看，不能添加到自己的配方列表）
  → 社交日报记录："You tasted {friend_name}'s signature '{recipe_name}'!"
else:
  70% 概率随机喝到 Owner 店内已有饮品
  30% 概率喝到 Owner 店内随机饮品
  → drink_name 显示为该饮品的标准名称
```

---

### 2.2 Cover Shift（帮忙看店）

#### 2.2.1 概念

好友离线时，其店铺会累积"外卖溢出"（Delivery Overflow）——即好友不在线时涌入但无法处理的外卖订单。你可以帮忙处理这些溢出订单，你获得 15% 金币，好友获得 70% 金币，系统注入 100% 总额（你和好友的收益都由系统出资，不从对方扣除）。

#### 2.2.2 交互流程

```
玩家A 打开 Friends 面板
  → 好友列表中，离线且有待处理外卖的好友头像旁显示 "Cover Shift" 按钮 + 红色角标（待处理订单数）
  → 点击按钮
  → 弹出 Cover Shift 面板：
     "{friend_name} is away. {N} delivery orders are waiting!"
     "Cover this shift and split the earnings?"
  → 点击 "Cover Shift"
  → 动画：A 的头像进入 B 的店，快速处理 N 个外卖订单（压缩动画 3 秒）
  → 结算弹窗：
     "You covered {friend_name}'s shift!"
     "Orders completed: {N}"
     "You earned {coins_A} coins (15%)"
     "{friend_name} earned {coins_B} coins (70%)"
  → 社交日报记录这次互动
  → 好友 B 上线时收到通知："{friend_name} covered your shift! You earned {coins_B} coins while away."
```

#### 2.2.3 外卖溢出机制

```
外卖溢出生成规则：
  · 玩家离线时，每 2 小时生成 1 个外卖溢出订单
  · 单次离线累积上限：6 个订单（即离线 12 小时后不再累积）
  · 订单金额 = Owner Tier 对应的平均外卖金额
    Tier 1: 15 coins/order
    Tier 2: 22 coins/order
    Tier 3: 30 coins/order
    Tier 4: 45 coins/order
    Tier 5: 60 coins/order

Cover Shift 收益计算：
  单订单总额 = Order Value（基于 Owner Tier）
  Helper 获得：单订单总额 × 15%
  Owner 获得：单订单总额 × 70%
  System 注入：单订单总额 × 100%（Helper + Owner 的收益全部由系统注入，不从任何一方扣除）

示例（Owner Tier 3，累积 4 个订单）：
  单订单 = 30 coins
  Helper 获得：30 × 15% × 4 = 18 coins
  Owner 获得：30 × 70% × 4 = 84 coins
  System 注入总计：30 × 100% × 4 = 120 coins（即 Helper 18 + Owner 84 + 系统吸收 18）
  原外卖如果超时流失：Owner 损失 30 × 4 = 120 coins → 现在被 Cover 挽回 84 coins（70%）
```

#### 2.2.4 每日上限

| 限制项 | 数值 | 说明 |
|--------|------|------|
| 每日 Cover 总次数 | 5 次/天 | 每日 00:00 UTC 重置 |
| 每好友 Cover 次数 | 1 次/天/好友 | 同一好友每天只能被 Cover 1 次 |
| 单次 Cover 订单上限 | 6 个订单 | 与离线累积上限一致 |
| 被 Cover 次数 | 无上限 | 被更多好友 Cover = 更多离线收入挽回 |

#### 2.2.5 防刷规则

| 规则 | 说明 |
|------|------|
| 离线判定 | 最后一次心跳超过 30 分钟即为"离线"。心跳由客户端每 5 分钟发送一次 `heartbeat` Edge Function |
| 溢出生成 | 由 Supabase cron job 每 2 小时扫描离线玩家，生成溢出订单记录。客户端不能自行生成溢出 |
| Cover 前校验 | Edge Function 校验：①好友关系有效 ②好友确实离线 ③溢出订单存在且未被处理 ④Helper 今日 Cover 次数 < 5 ⑤Helper 今日对该好友 Cover 次数 < 1 |
| 收益发放 | 原子事务：Helper 金币 += 15%、Owner 金币 += 70%、溢出订单标记为已处理，三步同时成功或同时回滚 |

---

### 2.3 Leaderboard（排行榜）

#### 2.3.1 概念

好友圈范围内的 3 维度排行榜，每周一 00:00 UTC 重置。不设全服排行榜——避免新玩家面对无法超越的老玩家而产生挫败感。

#### 2.3.2 三个维度

| 维度 | 名称 | 统计口径 | 重置周期 |
|------|------|---------|---------|
| Tab 1 | Weekly Income | 本周所有经营收入 + 社交收入的总和 | 每周一 00:00 UTC |
| Tab 2 | Max Combo | 本周达成过的最高连击数（单局最高） | 每周一 00:00 UTC |
| Tab 3 | Decoration Score | 店铺当前装饰值（快照，非累计） | 每周一 00:00 UTC 快照刷新 |

#### 2.3.3 排名范围

```
排名范围 = 好友圈（你 + 你的 5 个好友 = 最多 6 人）

如果好友数 < 5：
  排名范围 = 你 + 现有好友（最少 2 人，即只有 1 个好友时也显示排行榜）

不设全服排行榜的原因：
  1. 新玩家进入全服排行榜会看到遥不可及的 Top 1，产生挫败感
  2. 好友圈排行榜的 Top 1 是可超越的——你认识的人，你有动力超过他
  3. 好友圈排行榜的排名变化会触发社交通知（"你超过了 XX"），强化社交循环
```

#### 2.3.4 重置与结算

```
每周一 00:00 UTC：
  1. Supabase cron job 触发 leaderboard_reset Edge Function
  2. 记录上周最终排名到 leaderboard_history 表
  3. Weekly Income 归零，重新开始累计
  4. Max Combo 归零，重新开始记录
  5. Decoration Score 重新快照（取当前装饰值）
  6. 向上周各维度 Top 1 发放奖励：
     · Weekly Income Top 1: +500 coins
     · Max Combo Top 1: +300 coins
     · Decoration Score Top 1: +400 coins
  7. 推送通知："New week! Leaderboard has been reset. Last week's results are in your Social Report."
```

#### 2.3.5 排名变化通知

```
触发条件：
  · 你的排名从 N 上升到 N-1（超过了一位好友）
  · 你的排名从 N 下降到 N+1（被一位好友超过）

通知格式：
  · 上升时："🏆 You surpassed {friend_name} in {category}! You're now ranked #{rank}."
  · 下降时："{friend_name} surpassed you in {category}. You're now ranked #{rank}."
  · 下降通知不推送（仅社交日报中显示），避免负面体验

通知去重：
  · 同一维度同一好友的排名变化，24 小时内只通知一次
```

---

### 2.4 Custom Recipes（自定义配方）

#### 2.4.1 概念

玩家通过模块化组合创建自己的"招牌配方"（Signature Recipe）。招牌配方会被好友在 Taste Test 时以 30% 概率点到，成为社交展示的核心载体。

#### 2.4.2 创建流程

```
Custom Recipe 创建器界面：

Step 1: Choose Base（选择基底）
  → 5 个选项：Classic Black Tea / Green Tea / Oolong Tea / Milk Tea / Fruit Tea
  → 每个基底有视觉预览

Step 2: Choose Flavor（选择风味）
  → 10 个选项：Strawberry / Mango / Matcha / Taro / Brown Sugar / Honey / Lavender / Peach / Passion Fruit / Chocolate
  → 每个风味有视觉预览

Step 3: Choose Topping（选择顶料）
  → 8 个选项：Boba Pearls / Crystal Boba / Grass Jelly / Pudding / Aloe Vera / Cheese Foam / Whipped Cream / Lychee Jelly
  → 每个顶料有视觉预览

Step 4: Choose Glass（选择杯型）
  → 4 个选项：Classic Cup / Mason Jar / Tumbler / Bubble Cup
  → 每个杯型有视觉预览

Step 5: Name Your Recipe（命名）
  → 输入框，最多 20 字符
  → 经过敏感词过滤
  → 如果名称包含敏感词，提示"Please choose a different name."
  → 名称不强制唯一（允许重名，因为配方组成可能不同）

Step 6: Preview & Save
  → 显示完整配方预览图（Base + Flavor + Topping + Glass 的合成视觉）
  → 显示配方属性（仅展示用，不影响数值）：
     · Sweetness: 基于 Base + Flavor 组合的甜度评级（1-5 星）
     · Popularity: 基于 Flavor + Topping 组合的流行度评级（1-5 星）
     · Creativity: 基于 Base + Flavor + Topping + Glass 的独特性评分（1-5 星）
  → 点击 "Save Recipe" → 保存到配方槽位

组合空间：5 × 10 × 8 × 4 = 1,600 种独特组合
```

#### 2.4.3 配方槽位

| 获取方式 | 价格 | 槽位数 | 有效期 |
|---------|------|--------|--------|
| 免费玩家 | $0 | 0 个 | — |
| 单次购买 | $0.99 | 1 个 | 永久 |

```
槽位规则：
  · 免费玩家有 0 个配方槽位 → 不能创建 Custom Recipe
  · 花费 $0.99 解锁 1 个配方槽位 → 可创建 1 个 Custom Recipe
  · 槽位永久有效，创建的配方永久保留
  · 如果想替换已有配方，可以覆盖（旧配方消失，新配方写入）
  · 不提供多槽位购买（1 个槽位足以满足表达需求，避免过度付费设计）

为什么只有 1 个槽位：
  · 1 个招牌 = 1 个清晰的社交身份（"我的店就是做这杯的"）
  · 多个招牌会稀释社交识别度（好友记不住你到底是做哪杯的）
  · 降低付费决策复杂度：$0.99 解锁，简单直接
```

#### 2.4.4 社交展示规则

```
1. Taste Test 触发：
   · 好友 Taste Test 你的店时，30% 概率喝到你的 Custom Recipe
   · 70% 概率喝到你店内的标准饮品（系统随机选取）

2. 社交日报展示：
   · 如果好友喝到你的招牌，日报显示：
     "✨ {friend_name} tasted your signature '{recipe_name}'!"
   · 如果好友喝到标准饮品，日报显示：
     "{friend_name} tasted a cup of {drink_name} from your shop."

3. 店铺缩略图展示：
   · 有 Custom Recipe 的玩家，店铺缩略图显示一个 "Signature" 徽章
   · 好友在 Friends 面板能看到哪些好友有招牌

4. 配方查看（不可复制）：
   · Taste Test 到招牌后，可点击查看配方组成（Base → Flavor → Topping → Glass）
   · 但不能"收藏"或"复制"到自己的配方列表
   · 看到配方组成后，玩家可以手动去创建器里自己选一样的组合
   · 但配方名称不可复制（名称是独特身份标识）
```

---

## Part 3：技术要求

### 3.1 Supabase 数据表

#### 3.1.1 `friendships` 表

```sql
CREATE TABLE friendships (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_a UUID REFERENCES auth.users(id) NOT NULL,
  user_b UUID REFERENCES auth.users(id) NOT NULL,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'blocked')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  accepted_at TIMESTAMPTZ,

  -- 约束：每对好友关系只能存在一条记录（user_a < user_b 保证唯一性）
  CONSTRAINT unique_friendship UNIQUE (user_a, user_b),
  -- 约束：不能和自己成为好友
  CONSTRAINT no_self_friendship CHECK (user_a != user_b)
);

-- 查询某用户的好友列表时，需要同时查 user_a 和 user_b 两个方向
CREATE INDEX idx_friendships_user_a ON friendships(user_a) WHERE status = 'accepted';
CREATE INDEX idx_friendships_user_b ON friendships(user_b) WHERE status = 'accepted';
```

#### 3.1.2 `daily_social_limits` 表

```sql
CREATE TABLE daily_social_limits (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  taste_count INT DEFAULT 0 CHECK (taste_count <= 5),
  cover_count INT DEFAULT 0 CHECK (cover_count <= 5),
  -- 每日已 Taste Test 的好友列表（JSON 数组，用于每好友限 1 次校验）
  tasted_friends JSONB DEFAULT '[]'::jsonb,
  -- 每日已 Cover 的好友列表
  covered_friends JSONB DEFAULT '[]'::jsonb,

  CONSTRAINT unique_daily_limit UNIQUE (user_id, date)
);

CREATE INDEX idx_daily_limits_user_date ON daily_social_limits(user_id, date);
```

#### 3.1.3 `social_interactions` 表

```sql
CREATE TABLE social_interactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  interaction_type VARCHAR(20) NOT NULL CHECK (interaction_type IN ('taste_test', 'cover', 'leaderboard_reset')),
  initiator_id UUID REFERENCES auth.users(id) NOT NULL,
  target_id UUID REFERENCES auth.users(id),
  -- 收益记录
  initiator_coins INT DEFAULT 0,
  target_coins INT DEFAULT 0,
  -- 附加数据（如 tasted 的饮品名、Cover 的订单数等）
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_interactions_initiator ON social_interactions(initiator_id, created_at DESC);
CREATE INDEX idx_interactions_target ON social_interactions(target_id, created_at DESC);
```

#### 3.1.4 `delivery_overflow` 表

```sql
CREATE TABLE delivery_overflow (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_id UUID REFERENCES auth.users(id) NOT NULL,
  order_value INT NOT NULL, -- 单订单金额（基于 Owner Tier）
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'covered', 'expired')),
  covered_by UUID REFERENCES auth.users(id),
  covered_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  -- 过期时间：生成后 24 小时未被 Cover 则过期
  expires_at TIMESTAMPTZ DEFAULT NOW() + INTERVAL '24 hours'
);

CREATE INDEX idx_overflow_owner_status ON delivery_overflow(owner_id, status) WHERE status = 'pending';
```

#### 3.1.5 `leaderboard_snapshots` 表

```sql
CREATE TABLE leaderboard_snapshots (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  week_start DATE NOT NULL, -- 周一日期
  weekly_income INT DEFAULT 0,
  max_combo INT DEFAULT 0,
  decoration_score INT DEFAULT 0,
  -- 最终排名（NULL 表示当周未结算）
  income_rank INT,
  combo_rank INT,
  decoration_rank INT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT unique_weekly_snapshot UNIQUE (user_id, week_start)
);

CREATE INDEX idx_leaderboard_week_income ON leaderboard_snapshots(week_start, weekly_income DESC);
CREATE INDEX idx_leaderboard_week_combo ON leaderboard_snapshots(week_start, max_combo DESC);
CREATE INDEX idx_leaderboard_week_deco ON leaderboard_snapshots(week_start, decoration_score DESC);
```

#### 3.1.6 `custom_recipes` 表

```sql
CREATE TABLE custom_recipes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_id UUID REFERENCES auth.users(id) NOT NULL,
  slot_index INT DEFAULT 0 CHECK (slot_index >= 0),
  base VARCHAR(50) NOT NULL,
  flavor VARCHAR(50) NOT NULL,
  topping VARCHAR(50) NOT NULL,
  glass VARCHAR(50) NOT NULL,
  recipe_name VARCHAR(20) NOT NULL,
  -- 属性评分（创建时计算并存储）
  sweetness_score INT CHECK (sweetness_score BETWEEN 1 AND 5),
  popularity_score INT CHECK (popularity_score BETWEEN 1 AND 5),
  creativity_score INT CHECK (creativity_score BETWEEN 1 AND 5),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT unique_owner_slot UNIQUE (owner_id, slot_index)
);
```

#### 3.1.7 `recipe_taste_logs` 表

```sql
CREATE TABLE recipe_taste_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  recipe_id UUID REFERENCES custom_recipes(id) NOT NULL,
  taster_id UUID REFERENCES auth.users(id) NOT NULL,
  owner_id UUID REFERENCES auth.users(id) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_taste_logs_recipe ON recipe_taste_logs(recipe_id, created_at DESC);
```

### 3.2 Edge Functions 列表

| # | Edge Function 名称 | 触发方式 | 功能 |
|---|-------------------|---------|------|
| 1 | `send-friend-request` | 客户端调用 | 发送好友请求，写入 friendships 表（status=pending） |
| 2 | `accept-friend-request` | 客户端调用 | 接受好友请求，更新 friendships 表（status=accepted） |
| 3 | `get-friends-list` | 客户端调用 | 获取好友列表 + 在线状态 + 今日剩余社交次数 |
| 4 | `taste-test` | 客户端调用 | 执行 Taste Test，原子事务：校验 → 计算收益(35%/20%/45%) → 发放金币 → 记录交互 → 更新每日上限 |
| 5 | `cover-shift` | 客户端调用 | 执行 Cover Shift，原子事务：校验 → 处理溢出订单 → 发放收益 → 记录交互 → 更新每日上限 |
| 6 | `get-delivery-overflow` | 客户端调用 | 获取好友的待 Cover 溢出订单信息（订单数、预估收益） |
| 7 | `heartbeat` | 客户端定时调用 | 更新玩家最后在线时间，用于离线判定 |
| 8 | `generate-delivery-overflow` | Supabase cron（每 2 小时） | 扫描离线玩家，生成溢出订单 |
| 9 | `leaderboard-reset` | Supabase cron（每周一 00:00 UTC） | 重置排行榜、记录历史、发放 Top 1 奖励 |
| 10 | `get-leaderboard` | 客户端调用 | 获取好友圈排行榜（3 维度），同时同步分数到 Game Center / Play Games |
| 11 | `create-custom-recipe` | 客户端调用 | 创建/覆盖 Custom Recipe，校验槽位所有权 + 敏感词过滤 |
| 12 | `get-social-report` | 客户端调用 | 获取今日社交日报数据 |
| 13 | `check-recipe-slot-owned` | 客户端调用 | 校验用户是否拥有配方槽位（与 iap_records 联查） |
| 14 | `sync-native-friends` | 客户端调用（v2.0 新增） | 将 Game Center / Play Games 好友 ID 同步到 Supabase，实现跨平台好友匹配 |
| 15 | `submit-native-score` | 客户端调用（v2.0 新增） | 向 Game Center / Play Games 提交排行榜分数（同时写入 Supabase 跨平台榜） |

### 3.3 服务端防刷架构

#### 3.3.1 防刷原则

```
1. 客户端永远不可信
   · 客户端只负责发送请求和展示结果
   · 所有收益计算、次数校验、上限判定都在 Edge Function 中完成
   · 客户端不存储金币余额（每次从服务端读取）

2. 原子事务
   · 所有社交互动的收益发放必须是原子事务
   · 校验 → 计算 → 发放 → 记录，四步同时成功或同时回滚
   · 使用 Supabase 的 pg_advisory_lock 防止并发请求

3. 时间窗口校验
   · "每日"的定义基于 UTC 00:00，由服务端判定
   · 客户端不能传入时间参数，时间由服务端 NOW() 决定

4. 频率限制
   · 每个 Edge Function 设置 rate limit：同一用户每分钟最多 10 次调用
   · Taste Test / Cover Shift 额外限制：同一用户每秒最多 1 次调用
```

#### 3.3.2 `taste-test` Edge Function 伪代码

```typescript
// supabase/functions/taste-test/index.ts

export default async (req: Request) => {
  const { friendId } = await req.json()
  const userId = getUserIdFromJWT(req)

  // 1. Advisory Lock 防并发
  const { data: lockAcquired } = await supabase.rpc('acquire_lock', {
    key: `taste_${userId}`
  })
  if (!lockAcquired) return errorResponse('Too many requests', 429)

  try {
    // 2. 校验好友关系
    const friendship = await checkFriendship(userId, friendId)
    if (!friendship) return errorResponse('Not friends', 403)

    // 3. 获取/创建今日限额记录
    const today = new Date().toISOString().split('T')[0] // UTC date
    const limits = await getOrCreateDailyLimits(userId, today)

    // 4. 校验每日总次数
    if (limits.taste_count >= 5) return errorResponse('Daily taste test limit reached', 429)

    // 5. 校验每好友限 1 次
    if (limits.tasted_friends.includes(friendId)) {
      return errorResponse('Already tasted this friend today', 429)
    }

    // 6. 计算 Taster Tier
    const tasterTier = await getUserTier(userId)

    // 7. 计算收益（基于 Taster Tier, 35%/20%/45%）
    const baseValue = 20
    const tierMultiplier = TIER_MULTIPLIERS[tasterTier] // [1.0, 1.5, 2.0, 3.0, 4.0]
    const totalValue = baseValue * tierMultiplier
    const tasterCoins = Math.floor(totalValue * 0.35)
    const ownerCoins = Math.floor(totalValue * 0.20)

    // 8. 判断是否喝到招牌配方
    const customRecipe = await getCustomRecipe(friendId)
    let tastedDrinkName: string
    let isSignature = false
    if (customRecipe && Math.random() < 0.30) {
      tastedDrinkName = customRecipe.recipe_name
      isSignature = true
      await logRecipeTaste(customRecipe.id, userId, friendId)
    } else {
      tastedDrinkName = await getRandomStandardDrink(friendId)
    }

    // 9. 原子事务：发放金币 + 记录交互 + 更新限额
    await supabase.rpc('execute_taste_test', {
      p_taster_id: userId,
      p_owner_id: friendId,
      p_taster_coins: tasterCoins,
      p_owner_coins: ownerCoins,
      p_drink_name: tastedDrinkName,
      p_is_signature: isSignature,
      p_today: today
    })

    // 10. 返回结果
    return successResponse({
      drinkName: tastedDrinkName,
      isSignature,
      tasterCoins,
      ownerCoins,
      recipeDetails: isSignature ? customRecipe : null,
      remainingTasteTests: 5 - (limits.taste_count + 1)
    })
  } finally {
    await supabase.rpc('release_lock', { key: `taste_${userId}` })
  }
}
```

#### 3.3.3 异常检测规则

| 异常模式 | 检测方法 | 处理 |
|---------|---------|------|
| 同一用户对同一好友反复尝试 Taste Test | 监控 `taste-test` 的 429 响应频率 | 同一用户对同一好友 1 小时内 429 超过 5 次 → 临时封禁社交功能 1 小时 |
| 脚本化请求（固定间隔） | 分析请求时间戳分布 | 请求间隔标准差 < 0.5 秒 → 标记为可疑 → 人工审核 |
| 多账号互刷（同一 IP 多账号互相 Taste Test） | IP + 设备指纹关联 | 同一 IP 下超过 3 个账号互相社交互动 → 限制该 IP 社交功能 |
| 金币异常增长 | 每日金币变动审计 | 单日社交金币收入超过 Tier 5 理论上限的 200% → 自动回滚并通知 |

---

## 附录 A：社交系统数值总表

| 参数 | 数值 | 说明 |
|------|------|------|
| 好友位上限 | 5 | 免费，不可扩展 |
| Taste Test 每日次数 | 5 | 00:00 UTC 重置 |
| Taste Test 每好友限制 | 1 次/天 | — |
| Taste Test 基础值 | 20 coins | 固定 |
| Taste Test Tier 倍率 | 1.0 / 1.5 / 2.0 / 3.0 / 4.0 | Tier 1-5 |
| Taste Test 收益分配 (v2.0) | Taster 35% / Owner 20% / System 45% | 基于 Taster Tier |
| Cover 每日次数 | 5 | 00:00 UTC 重置 |
| Cover 每好友限制 | 1 次/天 | — |
| Cover 收益分配 | Helper 15% / Owner 70% / System 100% 注入 | 基于 Owner Tier |
| 外卖溢出生成速率 | 1 单/2 小时 | 离线时 |
| 溢出累积上限 | 6 单 | 离线 12 小时后封顶 |
| 溢出过期时间 | 24 小时 | 未被 Cover 则过期 |
| 招牌配方触发概率 | 30% | Taste Test 时 |
| 配方槽位（免费） | 0 | — |
| 配方槽位（付费） | 1 个 / $0.99 | 永久 |
| 排行榜维度 | 3 | Income / Combo / Decoration |
| 排行榜范围 | 好友圈（≤6 人）+ 原生平台 | Game Center / Play Games 原生 + Supabase 跨平台 |
| 排行榜重置 | 每周一 00:00 UTC | — |
| Top 1 奖励 | Income +500 / Combo +300 / Decoration +400 | coins |
| 原生社交平台 (v2.0) | Apple Game Center + Google Play Games | 好友导入 + 排行榜 + 成就 |
| 社交分享 (v2.0) | Instagram Stories + TikTok + 系统分享 | Canvas 截图分享 |

## 附录 B：Tier 定义

| Tier | Level 范围 | 对应平均外卖单价 | Taste Test 倍率 |
|------|-----------|----------------|----------|
| Tier 1 | Level 1-10 | 15 coins | ×1.0 |
| Tier 2 | Level 11-25 | 22 coins | ×1.5 |
| Tier 3 | Level 26-50 | 30 coins | ×2.0 |
| Tier 4 | Level 51-80 | 45 coins | ×3.0 |
| Tier 5 | Level 81+ | 60 coins | ×4.0 |

---

*文档结束 · Boba Dash Social System GDD v2.0 · 2026-08-11*
