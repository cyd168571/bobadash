# Boba Dash — 技术决策记录

## 决策 1：WebView Bridge vs 原生重写

- 选择：WebView Bridge（H5 Canvas 游戏加载到 WebView）
- 原因：95% 代码复用，个人开发者速度优先
- 代价：某些原生功能需要 Bridge 适配

## 决策 2：Supabase vs 自建服务器

- 选择：Supabase
- 原因：免费层足够启动，零运维，PostgreSQL + RLS
- 代价：Vendor Lock-in（但可自托管）

## 决策 3：Game Center + Play Games vs 纯 Supabase 好友

- 选择：双模式（原生 + Supabase fallback）
- 原因：海外用户习惯原生社交平台，降低加好友门槛
- 代价：需要实现两套 API（原生 + Supabase）

## 决策 4：RevenueCat vs 原生 IAP

- 选择：RevenueCat
- 原因：统一 Apple/Google IAP，免费层到 $10K MTR
- 代价：多一层依赖

## 决策 5：好友位固定 5 个不扩展

- 选择：固定 5 个好友位
- 原因：社交带宽应足够，不将社交关系变现
- 后果：无对应 SKU
