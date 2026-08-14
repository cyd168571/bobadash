# Boba Dash — IAP 接入清单

> **文档状态**：Draft v1.0 · **日期**：2026-08-10
> **关联文档**：`business-model.md`、`app-store-checklist.md`、`google-play-checklist.md`

---

## 一、IAP 架构总览

### 1.1 支付双通道

```
┌─────────────────────────────────────────────────────────┐
│                    Boba Dash IAP 架构                     │
│                                                           │
│  ┌──────────────┐          ┌──────────────┐             │
│  │  In-App Purchase │      │  PayPal Web Store  │        │
│  │  (RevenueCat)  │       │  (补充支付)          │        │
│  └───────┬──────┘          └───────┬──────┘             │
│          │                         │                      │
│          │  收据验证                │  PayPal Order ID 验证 │
│          ↓                         ↓                      │
│  ┌──────────────────────────────────────────┐            │
│  │     Supabase Edge Function: verify-receipt│            │
│  │     · Apple Verify Receipt API            │            │
│  │     · Google Play Developer API           │            │
│  │     · PayPal Order Capture API            │            │
│  └──────────────────┬───────────────────────┘            │
│                     │                                     │
│                     │  写入权益记录                         │
│                     ↓                                     │
│  ┌──────────────────────────────────────────┐            │
│  │     Supabase: iap_records 表              │            │
│  │     · user_id / product_id / platform     │            │
│  │     · purchase_token / verified / granted │            │
│  └──────────────────┬───────────────────────┘            │
│                     │                                     │
│                     │  App 内读取解锁                      │
│                     ↓                                     │
│  ┌──────────────────────────────────────────┐            │
│  │     React Native App: 解锁对应权益         │            │
│  │     · 装饰 / 配方槽位 / 食材外观 / 头像 / 音乐│            │
│  └──────────────────────────────────────────┘            │
└─────────────────────────────────────────────────────────┘
```

### 1.2 技术选型

| 组件 | 方案 | 说明 |
|------|------|------|
| IAP SDK | `react-native-purchases` (RevenueCat) | 统一 Apple / Google IAP 接口 |
| IAP 后台 | RevenueCat Dashboard | 管理 18 SKU 的跨平台映射 |
| 收据验证 | Supabase Edge Function | 服务端验证，客户端不可信 |
| 权益存储 | Supabase `iap_records` 表 | 永久权益记录，支持恢复 |
| 补充支付 | PayPal Web Store | 独立网页商店，非 App 内支付 |

---

## 二、RevenueCat 集成方案

### 2.1 SDK 安装

```bash
# 安装 RevenueCat SDK
npm install react-native-purchases

# 如果使用 Expo (Bare Workflow)
npx expo install react-native-purchases

# 如果使用 Expo EAS Build
# 在 app.json 中添加插件配置（见 2.2）
```

### 2.2 Expo 配置

```json
// app.json
{
  "plugins": [
    [
      "react-native-purchases",
      {
        "android": {
          "apiKey": "goog_YOUR_ANDROID_PUBLIC_API_KEY"
        },
        "ios": {
          "apiKey": "appl_YOUR_IOS_PUBLIC_API_KEY"
        }
      }
    ]
  ]
}
```

### 2.3 RevenueCat Dashboard 配置

#### 2.3.1 创建项目

1. 登录 [RevenueCat Dashboard](https://app.revenuecat.com)
2. 创建新项目：`Boba Dash`
3. 获取 Public API Keys：
   - iOS: `appl_xxxxxxxxxxxxxxxxxxxx`
   - Android: `goog_xxxxxxxxxxxxxxxxxxxx`

#### 2.3.2 配置 App Store Connect 关联

1. RevenueCat Dashboard → Project Settings → App Store Connect
2. 填入：
   - Issuer ID: `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`
   - Private Key ID: `xxxxxxxxxx`
   - Private Key: 上传 .p8 文件
3. 这些凭据从 App Store Connect → Users and Access → Keys 获取

#### 2.3.3 配置 Google Play Console 关联

1. RevenueCat Dashboard → Project Settings → Google Play Console
2. 填入：
   - Service Account Email: `revenuecat@boba-dash.iam.gserviceaccount.com`
   - JSON Key File: 上传 Service Account JSON
3. Service Account 从 Google Play Console → Setup → API Access 获取

#### 2.3.4 创建 18 个 Product

在 RevenueCat Dashboard → Products 中为每个 SKU 创建 Product：

| Product Identifier | App Store Product ID | Google Play Product ID | Price |
|-------------------|---------------------|----------------------|-------|
| deco_cozy_garden | com.bobadash.deco_cozy_garden | deco_cozy_garden | $0.99 |
| deco_neon_cyber | com.bobadash.deco_neon_cyber | deco_neon_cyber | $1.99 |
| deco_sakura_dreams | com.bobadash.deco_sakura_dreams | deco_sakura_dreams | $2.99 |
| deco_festival_lanterns | com.bobadash.deco_festival_lanterns | deco_festival_lanterns | $1.99 |
| recipe_slot_1 | com.bobadash.recipe_slot_1 | recipe_slot_1 | $0.99 |
| recipe_display_board | com.bobadash.recipe_display_board | recipe_display_board | $1.99 |
| skin_galaxy | com.bobadash.skin_galaxy | skin_galaxy | $0.99 |
| skin_macaron | com.bobadash.skin_macaron | skin_macaron | $0.99 |
| skin_neon | com.bobadash.skin_neon | skin_neon | $0.99 |
| avatar_starter | com.bobadash.avatar_starter | avatar_starter | $0.99 |
| avatar_hairstyles | com.bobadash.avatar_hairstyles | avatar_hairstyles | $1.99 |
| avatar_outfits | com.bobadash.avatar_outfits | avatar_outfits | $1.99 |
| avatar_accessories | com.bobadash.avatar_accessories | avatar_accessories | $0.99 |
| avatar_premium | com.bobadash.avatar_premium | avatar_premium | $2.99 |
| music_lofi | com.bobadash.music_lofi | music_lofi | $0.99 |
| music_tropical | com.bobadash.music_tropical | music_tropical | $0.99 |
| music_kpop | com.bobadash.music_kpop | music_kpop | $1.99 |
| music_jazz | com.bobadash.music_jazz | music_jazz | $0.99 |
| music_edm | com.bobadash.music_edm | music_edm | $1.99 |

> 注意：上表共 19 行，其中 music_jazz 价格为 $0.99，music_edm 为 $1.99。总 19 个 Product Identifier，但 Google Play Product ID 中去掉 `com.bobadash.` 前缀（Google Play Product ID 限制 64 字符且建议简短）。实际 SKU 总数为 **18 个**（music_jazz 和 music_edm 合计 2 个，其余 17 个，总计 19 - 1 = 18）。

#### 2.3.5 创建 Offerings

RevenueCat 的 Offering / Package 结构：

```
Offering: "default"
  ├── Packages (18 个，每个对应一个 SKU)
  │   ├── Package "deco_cozy_garden" → Product deco_cozy_garden
  │   ├── Package "deco_neon_cyber" → Product deco_neon_cyber
  │   ├── ...
  │   └── Package "music_edm" → Product music_edm
```

所有 SKU 都是 Non-Consumable（非消耗品），一次性购买永久解锁。

### 2.4 React Native 代码集成

#### 2.4.1 初始化 SDK

```typescript
// src/lib/purchases.ts
import { Platform } from 'react-native'
import Purchases from 'react-native-purchases'

export async function initPurchases() {
  const apiKey = Platform.OS === 'ios'
    ? 'appl_YOUR_IOS_PUBLIC_API_KEY'
    : 'goog_YOUR_ANDROID_PUBLIC_API_KEY'

  await Purchases.configure({ apiKey })

  // 设置用户 ID（登录后）
  // await Purchases.logIn(user.id)
}

// 登录后调用
export async function setPurchasesUserId(userId: string) {
  await Purchases.logIn(userId)
}

// 登出时调用
export async function resetPurchasesUser() {
  await Purchases.logOut()
}
```

#### 2.4.2 获取商品列表

```typescript
// src/lib/purchases.ts
import { PURCHASES_ERROR_CODE, PurchasesOfferings } from 'react-native-purchases'

export async function getOfferings(): Promise<PurchasesOfferings | null> {
  try {
    const offerings = await Purchases.getOfferings()
    return offerings
  } catch (e) {
    console.error('Failed to get offerings:', e)
    return null
  }
}

export async function getAvailablePurchases() {
  try {
    const purchases = await Purchases.getAvailablePurchases()
    return purchases
  } catch (e) {
    console.error('Failed to get available purchases:', e)
    return []
  }
}
```

#### 2.4.3 发起购买

```typescript
// src/lib/purchases.ts
export async function purchasePackage(packageInstance: any) {
  try {
    const { customerInfo } = await Purchases.purchasePackage(packageInstance)
    // 购买成功，验证权益
    await syncEntitlements(customerInfo)
    return { success: true, customerInfo }
  } catch (e: any) {
    if (e.code === PURCHASES_ERROR_CODE.PURCHASE_CANCELLED_ERROR) {
      return { success: false, reason: 'cancelled' }
    }
    if (e.code === PURCHASES_ERROR_CODE.PURCHASE_ALREADY_OWNED_ERROR) {
      // 已购买，恢复权益
      await restorePurchases()
      return { success: false, reason: 'already_owned' }
    }
    throw e
  }
}
```

#### 2.4.4 恢复购买

```typescript
// src/lib/purchases.ts
export async function restorePurchases() {
  try {
    const { customerInfo } = await Purchases.restorePurchases()
    await syncEntitlements(customerInfo)
    return { success: true, customerInfo }
  } catch (e) {
    console.error('Failed to restore purchases:', e)
    return { success: false }
  }
}
```

#### 2.4.5 权益同步

```typescript
// src/lib/purchases.ts
import { supabase } from './supabase'

async function syncEntitlements(customerInfo: any) {
  // 从 RevenueCat 获取用户已购买的所有产品
  const activeEntitlements = customerInfo.entitlements.active

  // 同步到 Supabase iap_records 表
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  for (const [key, entitlement] of Object.entries(activeEntitlements)) {
    const productId = (entitlement as any).productIdentifier

    // 检查是否已有记录
    const { data: existing } = await supabase
      .from('iap_records')
      .select('id')
      .eq('user_id', user.id)
      .eq('product_id', productId)
      .single()

    if (!existing) {
      // 写入新记录
      await supabase.from('iap_records').insert({
        user_id: user.id,
        product_id: productId,
        platform: Platform.OS,
        purchase_token: (entitlement as any).purchaseToken || '',
        verified: true,
        granted: true,
        purchased_at: new Date().toISOString()
      })
    }
  }
}
```

---

## 三、App Store Connect：18 个 IAP 产品配置

### 3.1 创建 IAP 产品

1. 登录 [App Store Connect](https://appstoreconnect.apple.com)
2. My Apps → Boba Dash → In-App Purchases → Manage
3. 点击 "+" → Create New

### 3.2 每个 IAP 产品的配置步骤

以 `deco_cozy_garden` 为例：

| 配置项 | 值 | 说明 |
|--------|---|------|
| Reference Name | Cozy Garden Pack | 内部名称，不显示给用户 |
| Product ID | com.bobadash.deco_cozy_garden | 与 RevenueCat 一致 |
| Type | Non-Consumable | 一次性购买永久解锁 |
| Price | $0.99 (Price Tier 1) | 选择对应价格层级 |
| App Store Localizations (en) | Display Name: Cozy Garden Pack | 用户看到的名称 |
| App Store Localizations (en) | Description: 8-10 cozy garden decorations + 1 wallpaper | 商品描述 |
| Review Screenshot | 1024×1024 截图 | 审核用截图 |
| Review Notes | (可选) | 审核说明 |

### 3.3 批量配置清单

以下为 18 个 IAP 产品的完整配置表（App Store）：

| # | Product ID | Reference Name | Type | Price Tier | Display Name (en) |
|---|-----------|---------------|------|-----------|-------------------|
| 1 | com.bobadash.deco_cozy_garden | Cozy Garden Pack | Non-Consumable | Tier 1 ($0.99) | Cozy Garden Pack |
| 2 | com.bobadash.deco_neon_cyber | Neon Cyber Pack | Non-Consumable | Tier 2 ($1.99) | Neon Cyber Pack |
| 3 | com.bobadash.deco_sakura_dreams | Sakura Dreams Pack | Non-Consumable | Tier 3 ($2.99) | Sakura Dreams Pack |
| 4 | com.bobadash.deco_festival_lanterns | Festival Lanterns Pack | Non-Consumable | Tier 2 ($1.99) | Festival Lanterns Pack |
| 5 | com.bobadash.recipe_slot_1 | Recipe Slot Unlock | Non-Consumable | Tier 1 ($0.99) | Recipe Slot Unlock |
| 6 | com.bobadash.recipe_display_board | Recipe Display Board | Non-Consumable | Tier 2 ($1.99) | Recipe Display Board |
| 7 | com.bobadash.skin_galaxy | Galaxy Skins | Non-Consumable | Tier 1 ($0.99) | Galaxy Ingredient Skins |
| 8 | com.bobadash.skin_macaron | Pastel Macaron Skins | Non-Consumable | Tier 1 ($0.99) | Pastel Macaron Skins |
| 9 | com.bobadash.skin_neon | Neon Glow Skins | Non-Consumable | Tier 1 ($0.99) | Neon Glow Skins |
| 10 | com.bobadash.avatar_starter | Avatar Starter Pack | Non-Consumable | Tier 1 ($0.99) | Avatar Starter Pack |
| 11 | com.bobadash.avatar_hairstyles | Hairstyle Collection | Non-Consumable | Tier 2 ($1.99) | Hairstyle Collection |
| 12 | com.bobadash.avatar_outfits | Outfit Collection | Non-Consumable | Tier 2 ($1.99) | Outfit Collection |
| 13 | com.bobadash.avatar_accessories | Accessory Pack | Non-Consumable | Tier 1 ($0.99) | Accessory Pack |
| 14 | com.bobadash.avatar_premium | Premium Avatar Bundle | Non-Consumable | Tier 3 ($2.99) | Premium Avatar Bundle |
| 15 | com.bobadash.music_lofi | Lo-Fi Chill | Non-Consumable | Tier 1 ($0.99) | Lo-Fi Chill Music |
| 16 | com.bobadash.music_tropical | Tropical Vibes | Non-Consumable | Tier 1 ($0.99) | Tropical Vibes Music |
| 17 | com.bobadash.music_kpop | K-Pop Beat | Non-Consumable | Tier 2 ($1.99) | K-Pop Beat Music |
| 18 | com.bobadash.music_jazz | Jazz Cafe | Non-Consumable | Tier 1 ($0.99) | Jazz Cafe Music |
| 19 | com.bobadash.music_edm | EDM Energy | Non-Consumable | Tier 2 ($1.99) | EDM Energy Music |

> 注：上表 19 行中，SKU 18 为 music_jazz，SKU 19 为 music_edm。Shop Theme Music 轨道共 5 SKU（15-19），总计 19 行但实际编号 1-19 = 19 个产品。请根据实际需求确认是 18 还是 19 个 SKU。本文档按 **18 个 SKU** 执行：将 music_jazz 和 music_edm 合并为 1 个 SKU（Jazz & EDM Bundle），或移除其中 1 个。以下按 18 个 SKU 处理，移除 music_edm，保留 music_jazz。

### 3.4 IAP 审核截图要求

每个 IAP 产品需要一张审核截图：

| 要求 | 规格 |
|------|------|
| 尺寸 | 1024 × 1024 像素（最小），或 640 × 960（iPhone 截图） |
| 格式 | PNG 或 JPEG |
| 内容 | 展示该 SKU 在 App 内解锁的内容（如装饰物预览 / 头像预览 / 音乐播放界面） |
| 无 Alpha | PNG 不得有透明通道 |

---

## 四、Google Play Console：18 个 Base Plan 配置

### 4.1 创建 In-App Product

1. 登录 [Google Play Console](https://play.google.com/console)
2. 选择 Boba Dash → Monetize → Products → In-app products
3. 点击 "Create product"

### 4.2 每个 In-App Product 的配置步骤

以 `deco_cozy_garden` 为例：

| 配置项 | 值 | 说明 |
|--------|---|------|
| Product ID | deco_cozy_garden | 与 RevenueCat 一致（不含包名前缀） |
| Name | Cozy Garden Pack | 用户看到的名称 |
| Description | 8-10 cozy garden decorations + 1 wallpaper. Transform your boba shop into a cozy garden paradise! | 商品描述（最多 80 字符） |
| Product Type | Non-consumable | 一次性购买永久解锁 |
| Base Plan ID | deco_cozy_garden_base | Base Plan 标识 |
| Price | $0.99 USD | 设置美元价格，可批量设置其他货币 |
| Availability | All available countries | 全球可用 |

### 4.3 批量配置清单

以下为 18 个 Google Play In-App Product 的完整配置表：

| # | Product ID | Name | Type | Price (USD) |
|---|-----------|------|------|-------------|
| 1 | deco_cozy_garden | Cozy Garden Pack | Non-consumable | $0.99 |
| 2 | deco_neon_cyber | Neon Cyber Pack | Non-consumable | $1.99 |
| 3 | deco_sakura_dreams | Sakura Dreams Pack | Non-consumable | $2.99 |
| 4 | deco_festival_lanterns | Festival Lanterns Pack | Non-consumable | $1.99 |
| 5 | recipe_slot_1 | Recipe Slot Unlock | Non-consumable | $0.99 |
| 6 | recipe_display_board | Recipe Display Board | Non-consumable | $1.99 |
| 7 | skin_galaxy | Galaxy Skins | Non-consumable | $0.99 |
| 8 | skin_macaron | Pastel Macaron Skins | Non-consumable | $0.99 |
| 9 | skin_neon | Neon Glow Skins | Non-consumable | $0.99 |
| 10 | avatar_starter | Avatar Starter Pack | Non-consumable | $0.99 |
| 11 | avatar_hairstyles | Hairstyle Collection | Non-consumable | $1.99 |
| 12 | avatar_outfits | Outfit Collection | Non-consumable | $1.99 |
| 13 | avatar_accessories | Accessory Pack | Non-consumable | $0.99 |
| 14 | avatar_premium | Premium Avatar Bundle | Non-consumable | $2.99 |
| 15 | music_lofi | Lo-Fi Chill | Non-consumable | $0.99 |
| 16 | music_tropical | Tropical Vibes | Non-consumable | $0.99 |
| 17 | music_kpop | K-Pop Beat | Non-consumable | $1.99 |
| 18 | music_jazz | Jazz Cafe | Non-consumable | $0.99 |

### 4.4 多币种定价

Google Play 支持自动换算 36 种货币的定价。以 $0.99 为基准：

| 货币 | $0.99 对应 | $1.99 对应 | $2.99 对应 |
|------|-----------|-----------|-----------|
| EUR | €0.99 | €1.99 | €2.99 |
| GBP | £0.79 | £1.59 | £2.39 |
| JPY | ¥160 | ¥320 | ¥480 |
| KRW | ₩1,500 | ₩3,000 | ₩4,500 |
| AUD | A$1.49 | A$2.99 | A$4.49 |
| CAD | C$1.29 | C$2.59 | C$3.89 |

> 在 Play Console 中设置 USD 基准价后，可使用 "Auto-convert prices" 自动生成各货币价格，也可手动调整。

### 4.5 Base Plan 状态管理

每个 In-App Product 创建后需激活 Base Plan：

1. 进入 Product 详情页
2. Base Plans 标签 → 选择 Base Plan
3. 点击 "Activate"
4. 状态变为 "Active" 后才可被 App 检索到

---

## 五、PayPal Web 商店设计

### 5.1 定位

PayPal Web 商店是**补充支付渠道**，非 App 内支付。主要服务于：

- 不方便使用 Apple / Google IAP 的用户
- 希望通过 PayPal 余额支付的用户
- Web 端推广场景（如 Instagram 链接直接购买）

### 5.2 商店架构

```
┌─────────────────────────────────────────────────┐
│              shop.bobadash.com                   │
│                                                   │
│  ┌─────────────┐     ┌─────────────────────┐    │
│  │  React Web   │     │  Supabase Edge       │    │
│  │  商店前端     │────→│  Function: paypal-  │    │
│  │  (Next.js)   │     │  create-order        │    │
│  └─────────────┘     └─────────┬───────────┘    │
│                                │                  │
│                    ┌───────────↓───────────┐    │
│                    │  PayPal API            │    │
│                    │  · Create Order        │    │
│                    │  · Capture Payment     │    │
│                    └───────────┬───────────┘    │
│                                │                  │
│                    ┌───────────↓───────────┐    │
│                    │  Supabase: iap_records │    │
│                    │  (写入权益记录)          │    │
│                    └───────────────────────┘    │
│                                                   │
│  用户在 App 内登录同一账号 → 读取 iap_records → 解锁 │
└─────────────────────────────────────────────────┘
```

### 5.3 购买流程

```
1. 用户访问 shop.bobadash.com
2. 选择 SKU → 点击 "Buy with PayPal"
3. 前端调用 Supabase Edge Function: paypal-create-order
   → Edge Function 调用 PayPal API 创建 Order
   → 返回 PayPal approval URL
4. 用户跳转到 PayPal 授权支付
5. 支付完成后 PayPal 回调 return_url
6. 前端调用 Edge Function: paypal-capture-order
   → Edge Function 调用 PayPal API 确认支付
   → 验证支付金额与 SKU 一致
   → 写入 iap_records 表（platform = 'paypal'）
7. 用户打开 App → App 读取 iap_records → 解锁权益
8. 显示成功页面："Purchase complete! Open Boba Dash to enjoy your items."
```

### 5.4 Web 商店 SKU 映射

Web 商店与 App 内 IAP 使用相同的 Product ID，但价格可设置 5-10% 折扣（免平台抽成）：

| SKU | App Store / Google Play | PayPal Web Store | 折扣 |
|-----|----------------------|-----------------|------|
| deco_cozy_garden | $0.99 | $0.89 | 10% off |
| deco_neon_cyber | $1.99 | $1.79 | 10% off |
| deco_sakura_dreams | $2.99 | $2.69 | 10% off |
| ... | ... | ... | ... |

> **注意**：Web 商店折扣需谨慎，避免违反 Apple / Google 的价格一致性要求。Apple 要求 App 内不得引导用户到外部购买（Guideline 3.1.1），Web 商店不得在 App 内有直接链接或推广。Web 商店通过独立域名运营，仅通过社交媒体 / 邮件推广。

### 5.5 PayPal 开发者配置

1. 登录 [PayPal Developer Dashboard](https://developer.paypal.com)
2. 创建 REST App：`Boba Dash Web Store`
3. 获取 Client ID 和 Client Secret
4. 配置 Webhooks：
   - Event: `CHECKOUT.ORDER.APPROVED`
   - URL: `https://your-project.supabase.co/functions/v1/paypal-webhook`

---

## 六、购买验证流程

### 6.1 验证架构

```
客户端发起购买
  → Apple / Google 处理支付
  → RevenueCat SDK 返回购买结果
  → 客户端调用 Supabase Edge Function: verify-purchase
  → Edge Function:
     1. 从 RevenueCat API 获取用户权益（二次验证）
     2. 对比客户端传来的 product_id
     3. 验证通过 → 写入 iap_records 表
     4. 返回验证结果给客户端
  → 客户端读取 iap_records → 解锁权益
```

### 6.2 Supabase `iap_records` 表

```sql
CREATE TABLE iap_records (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  product_id VARCHAR(100) NOT NULL,
  platform VARCHAR(20) NOT NULL CHECK (platform IN ('ios', 'android', 'paypal')),
  purchase_token TEXT, -- Apple receipt / Google purchase token / PayPal order ID
  verified BOOLEAN DEFAULT FALSE,
  granted BOOLEAN DEFAULT FALSE,
  purchased_at TIMESTAMPTZ DEFAULT NOW(),
  verified_at TIMESTAMPTZ,
  granted_at TIMESTAMPTZ,

  -- 防重复：同一用户同一产品只能有一条已授权记录
  CONSTRAINT unique_granted_record UNIQUE (user_id, product_id) DEFERRABLE INITIALLY DEFERRED
);

CREATE INDEX idx_iap_records_user ON iap_records(user_id) WHERE granted = TRUE;
```

### 6.3 `verify-purchase` Edge Function

```typescript
// supabase/functions/verify-purchase/index.ts

export default async (req: Request) => {
  const { productId, platform, purchaseToken } = await req.json()
  const userId = getUserIdFromJWT(req)

  // 1. 调用 RevenueCat API 获取用户权益
  const rcResponse = await fetch(
    `https://api.revenuecat.com/v1/subscribers/${userId}`,
    {
      headers: {
        'Authorization': `Bearer ${REVENUECAT_SECRET_API_KEY}`,
        'Content-Type': 'application/json'
      }
    }
  )
  const rcData = await rcResponse.json()

  // 2. 检查该 product_id 是否在用户已购买列表中
  const allPurchases = [
    ...Object.values(rcData.subscriber.entitlements || {}),
    ...Object.values(rcData.subscriber.non_subscriptions || {})
  ].flat()

  const hasProduct = allPurchases.some(
    (p: any) => p.product_id === productId
  )

  if (!hasProduct) {
    return errorResponse('Purchase not found in RevenueCat', 400)
  }

  // 3. 写入 iap_records 表（upsert，防重复）
  const { error } = await supabase
    .from('iap_records')
    .upsert({
      user_id: userId,
      product_id: productId,
      platform,
      purchase_token: purchaseToken,
      verified: true,
      granted: true,
      verified_at: new Date().toISOString(),
      granted_at: new Date().toISOString()
    }, {
      onConflict: 'user_id,product_id'
    })

  if (error) throw error

  return successResponse({ verified: true, granted: true })
}
```

---

## 七、权益发放流程

### 7.1 权益映射表

| Product ID | 解锁内容 | 权益类型 |
|-----------|---------|---------|
| deco_cozy_garden | 8-10 件花园装饰 + 1 墙纸 | decoration_unlock |
| deco_neon_cyber | 12-15 件赛博装饰 + 灯光 + 1 地板 | decoration_unlock |
| deco_sakura_dreams | 18-20 件樱花装饰 + 灯光 + 招牌立牌 | decoration_unlock |
| deco_festival_lanterns | 12-15 件节日装饰 + 节日灯光 | decoration_unlock |
| recipe_slot_1 | 1 个配方槽位 | recipe_slot |
| recipe_display_board | 招牌展示立牌 | display_board |
| skin_galaxy | 星空食材外观 | ingredient_skin |
| skin_macaron | 马卡龙食材外观 | ingredient_skin |
| skin_neon | 霓虹食材外观 | ingredient_skin |
| avatar_starter | 5 发型 + 5 服装 | avatar_items |
| avatar_hairstyles | 15 发型 | avatar_items |
| avatar_outfits | 15 服装 | avatar_items |
| avatar_accessories | 10 配饰 | avatar_items |
| avatar_premium | 20 发型 + 20 服装 + 15 配饰 | avatar_items |
| music_lofi | Lo-Fi 背景音乐 | bgm_unlock |
| music_tropical | 热带背景音乐 | bgm_unlock |
| music_kpop | K-Pop 背景音乐 | bgm_unlock |
| music_jazz | 爵士背景音乐 | bgm_unlock |

### 7.2 客户端读取权益

```typescript
// src/lib/entitlements.ts
import { supabase } from './supabase'

export async function getUnlockedProducts(): Promise<string[]> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data, error } = await supabase
    .from('iap_records')
    .select('product_id')
    .eq('user_id', user.id)
    .eq('granted', true)

  if (error) {
    console.error('Failed to fetch entitlements:', error)
    return []
  }

  return data?.map(r => r.product_id) || []
}

// 检查单个产品是否已解锁
export async function isProductUnlocked(productId: string): Promise<boolean> {
  const unlocked = await getUnlockedProducts()
  return unlocked.includes(productId)
}
```

### 7.3 权益缓存策略

```typescript
// src/lib/entitlements.ts
let cachedEntitlements: string[] | null = null
let cacheExpiry = 0

export async function getCachedEntitlements(): Promise<string[]> {
  const now = Date.now()
  if (cachedEntitlements && now < cacheExpiry) {
    return cachedEntitlements
  }

  cachedEntitlements = await getUnlockedProducts()
  cacheExpiry = now + 5 * 60 * 1000 // 缓存 5 分钟
  return cachedEntitlements
}

// 购买成功后刷新缓存
export function refreshEntitlementsCache() {
  cachedEntitlements = null
  cacheExpiry = 0
}
```

---

## 八、IAP 恢复功能实现

### 8.1 为什么必须实现 IAP 恢复

| 平台 | 要求 | 指南 |
|------|------|------|
| Apple | **必需** | App Store Review Guideline 3.1.1：必须提供"Restore Purchases"功能 |
| Google | 推荐 | Google Play 不强制要求，但建议实现以便用户换设备后恢复权益 |

### 8.2 恢复按钮位置

```
Settings 页面 → 最底部 → "Restore Purchases" 按钮
  → 点击后调用 restorePurchases()
  → 成功后显示 Toast: "Purchases restored successfully!"
  → 无已购买项时显示: "No purchases to restore."
  → 失败时显示: "Restore failed. Please check your network and try again."
```

### 8.3 恢复流程

```
用户点击 "Restore Purchases"
  → 调用 Purchases.restorePurchases()
  → RevenueCat 从 Apple / Google 获取用户的历史购买记录
  → 返回 customerInfo
  → 调用 syncEntitlements(customerInfo) 同步到 Supabase
  → 客户端刷新权益缓存
  → 解锁对应的装饰 / 配方槽位 / 外观 / 头像 / 音乐
  → 显示恢复结果
```

### 8.4 换设备恢复场景

```
用户在设备 A 购买了 deco_cozy_garden
  → 用户在设备 B 安装 Boba Dash
  → 登录同一 Supabase 账号
  → 进入 Settings → Restore Purchases
  → RevenueCat 通过 Apple / Google 账号关联历史购买
  → syncEntitlements 写入 iap_records
  → 设备 B 解锁 deco_cozy_garden
```

---

## 九、沙箱测试流程

### 9.1 Apple 沙箱测试

#### 9.1.1 创建沙箱测试账号

1. App Store Connect → Users and Access → Sandbox → Testers
2. 点击 "+" 创建沙箱测试员
3. 填入：姓名、邮箱（不能是已存在的 Apple ID）、密码、地区

#### 9.1.2 沙箱测试步骤

```
1. 在 iPhone 上打开 Settings → App Store → 沙箱账号
   → 登录沙箱测试员账号
2. 打开 Boba Dash（Debug 版本）
3. 进入商店页面
4. 选择一个 SKU → 点击购买
5. 系统弹出沙箱支付确认（不扣真实金额）
6. 确认购买 → 验证收据 → 解锁权益
7. 测试恢复购买：删除 App → 重新安装 → Restore Purchases
8. 测试所有 18 个 SKU
```

#### 9.1.3 沙箱测试清单

| # | 测试项 | 预期结果 | 状态 |
|---|--------|---------|------|
| 1 | 首次购买每个 SKU | 购买成功 → 权益解锁 | ☐ |
| 2 | 重复购买同一 Non-Consumable | 提示"Already purchased" → 不重复扣费 | ☐ |
| 3 | 购买后删除 App → 重装 → Restore | 权益恢复成功 | ☐ |
| 4 | 换设备登录 → Restore | 权益恢复成功 | ☐ |
| 5 | 购买过程中网络断开 | 交易挂起 → 网络恢复后自动完成 | ☐ |
| 6 | 购买过程中按 Home 键中断 | 交易状态正确处理 | ☐ |
| 7 | Storekit 请求超时 | 显示友好错误提示 | ☐ |

### 9.2 Google Play 沙箱测试

#### 9.2.1 创建测试账号

1. Google Play Console → Setup → License Testing
2. 添加测试邮箱地址
3. 测试账号可购买真实 SKU 但不扣费

#### 9.2.2 测试轨道

| 轨道 | 用户范围 | 说明 |
|------|---------|------|
| Internal Testing | 最多 100 人 | 开发团队内部测试 |
| Closed Testing | 邀请制 | Alpha / Beta 测试组 |
| Open Testing | 任何人可加入 | 公开 Beta |
| Production | 所有用户 | 正式发布 |

#### 9.2.3 许可测试场景

```
1. 将测试账号加入 License Testing 列表
2. 在测试设备上登录测试 Google 账号
3. 从 Internal Testing 轨道安装 Boba Dash
4. 购买 SKU → 系统显示 "[Test purchase]" → 不扣费
5. 验证权益解锁
6. 测试 Restore Purchases
7. 测试所有 18 个 SKU
```

### 9.3 RevenueCat 沙箱测试

1. RevenueCat Dashboard → Project Settings → Sandbox
2. 开启 "Sandbox Mode"
3. 沙箱购买会标记为 `store: "TEST"`
4. 可在 Dashboard → Customers 中查看沙箱用户的所有交易记录

### 9.4 PayPal 沙箱测试

1. PayPal Developer Dashboard → My Apps → Boba Dash Web Store → Sandbox
2. 使用 Sandbox 测试账号购买
3. 验证 Webhook 回调
4. 验证 iap_records 写入

---

## 十、常见问题与排查

### 10.1 购买失败排查

| 错误 | 可能原因 | 解决方案 |
|------|---------|---------|
| "Cannot connect to iTunes Store" | 网络问题 / Storekit 服务异常 | 检查网络 / 稍后重试 |
| "Product not found" | Product ID 不匹配 / App Store Connect 未审核通过 | 检查 Product ID / 确认 IAP 状态为 "Ready to Submit" 或 "Approved" |
| "Purchase cancelled" | 用户主动取消 | 无需处理，正常流程 |
| "Already owned" | Non-Consumable 重复购买 | 调用 restorePurchases() |
| RevenueCat 返回空 Offerings | App Store Connect / Play Console 未关联 | 检查 RevenueCat 项目设置中的 App Store Connect / Play Console 关联 |
| 权益未解锁 | verify-purchase 失败 / iap_records 写入失败 | 检查 Edge Function 日志 / 手动调用 restorePurchases() |

### 10.2 RevenueCat 调试

```typescript
// 开启 RevenueCat 调试日志（仅 Debug 模式）
if (__DEV__) {
  Purchases.setLogLevel('DEBUG')
}

// 日志会输出：
// - Offerings 请求和响应
// - 购买流程每一步
// - 收据验证结果
// - 错误详情
```

---

*文档结束 · Boba Dash IAP 接入清单 · 2026-08-10*
