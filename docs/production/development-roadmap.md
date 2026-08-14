# Boba Dash — 独立开发者开发路线图

> **文档版本**：v1.0  
> **最后更新**：2026-08-10  
> **开发者**：Paul（独立开发者，使用 Cursor + Supabase）  
> **预估总周期**：12-16周（乐观）/ 18-24周（含 buffer）  

---

## 一、开发阶段总览

### 1.1 六阶段路线图

| 阶段 | 名称 | 周期 | 核心交付物 | 代码复用率 |
|------|------|------|-----------|-----------|
| Phase 0 | Foundation | W1-2 | Expo+Supabase+WebView Bridge+Auth | 全新 |
| Phase 1 | Core Game | W3-5 | 108关可玩+本地存档 | 95%复用 |
| Phase 2 | Social | W6-8 | 4社交机制+15 Edge Functions+原生社交平台 | 70%参考 |
| Phase 3 | Monetization | W8-10 | 5轨18 SKU+RevenueCat | 80%全新 |
| Phase 4 | Polish | W10-12 | ASO素材+性能优化+英文化 | 全新 |
| Phase 5 | Testing | W12-14 | TestFlight+封闭测试+Playtest | — |
| Phase 6 | Launch | W14-16 | App Store+Google Play 上架 | — |

### 1.2 依赖关系图

```
Phase 0 (Foundation)
  ├─→ Phase 1 (Core Game) ──┐
  │                          ├─→ Phase 3 (Monetization) ──┐
  └─→ Phase 2 (Social) ─────┘                            │
                                                           ├─→ Phase 5 (Testing) → Phase 6 (Launch)
                                    Phase 4 (Polish) ─────┘
```

### 1.3 时间估算

| 阶段 | 预估周数 | 风险缓冲 | 独立开发者注意事项 |
|------|---------|---------|-------------------|
| Phase 0 | 2周 | +1周 | Expo/Supabase 学习曲线、WebView 桥调试 |
| Phase 1 | 3周 | +1周 | 核心代码 95% 复用，主要改存储层 |
| Phase 2 | 3周 | +1周 | Edge Functions 重写量最大 |
| Phase 3 | 3周 | +1周 | IAP 接入+RevenueCat+新功能 |
| Phase 4 | 3周 | +1周 | 素材制作耗时长，可考虑外包 |
| Phase 5 | 2周 | +1周 | TestFlight 审核+反馈修复 |
| Phase 6 | 2周 | +1周 | App 审核可能拒绝，预留修改时间 |
| **总计** | **18周** | **+6周** | **悲观预计 24周（5-6个月）** |

---

## 二、Phase 0: Foundation（第1-2周）

### 2.1 目标
搭建项目骨架，跑通 Expo → WebView → Supabase 基础链路。

### 2.2 任务清单

#### 项目初始化
- [ ] 创建 Expo 项目（`npx create-expo-app boba-dash`）
- [ ] 配置 TypeScript
- [ ] 安装核心依赖：
  - `@supabase/supabase-js`（后端 SDK）
  - `zustand`（状态管理）
  - `react-native-webview`（WebView 组件）
  - `expo-secure-store`（安全存储）
  - `@react-navigation/native`（导航）
- [ ] 配置 ESLint + Prettier

#### Supabase 后端初始化
- [ ] 创建 Supabase 项目（supabase.com）
- [ ] 执行数据库迁移（`supabase-schema.md` 中的 DDL）
- [ ] 配置 Auth Provider：
  - Email/Password（基础）
  - Apple OAuth（iOS 必需，Sign-in-with-Apple 合规）
  - Google OAuth（Android）
- [ ] 配置 RLS 策略
- [ ] 配置 pg_cron 定时任务（dailyReset / weeklyReset）
- [ ] 部署 9 个 Edge Functions（Deno/TypeScript）

#### WebView Bridge 协议
- [ ] 创建 `BobaBridge.ts`（postMessage 双向通信封装）
- [ ] 定义消息类型接口（TypeScript interfaces）
- [ ] 实现 GAME → NATIVE 消息处理：
  - `GAME_SAVE` / `GAME_LOAD`（存档同步）
  - `GAME_IAP`（触发购买）
  - `GAME_SOCIAL_ACTION`（触发社交）
  - `GAME_HAPTIC`（震动反馈）
- [ ] 实现 NATIVE → GAME 消息处理：
  - `NATIVE_SAVE_RESULT` / `NATIVE_LOAD_DATA`
  - `NATIVE_IAP_RESULT` / `NATIVE_SOCIAL_RESULT`
  - `NATIVE_AUTH`（认证状态变更）
- [ ] 实现 Storage 适配层：
  - `localStorage` → `AsyncStorage` + `expo-secure-store`
  - 冲突解决策略（cloud wins if divergence > 20%）

#### 移植 H5 游戏到 WebView
- [ ] 复制 `webview-game/index.html` → `src/webview-game/index.html`
- [ ] 替换存储接口（`localStorage` → `BobaBridge.send('GAME_SAVE', ...)`）
- [ ] 适配触摸输入（click → touch + mobile 适配）
- [ ] 测试 WebView 加载和渲染

### 2.3 交付物
- iOS/Android 模拟器上可运行的 App
- WebView 内 H5 游戏可渲染
- Supabase Auth 可登录
- 本地存档可同步到云端

### 2.4 验收标准
- [ ] Expo App 在 iOS 模拟器启动
- [ ] WebView 内 Canvas 2D 游戏画面正确渲染
- [ ] Email 登录成功，用户数据写入 Supabase
- [ ] 本地存档 → 云端同步 → 另一台设备恢复

---

## 三、Phase 1: Core Game Loop（第3-5周）

### 3.1 目标
完整可玩的 108 关战役，离线可玩，本地存档完整。

### 3.2 任务清单

#### 游戏核心引擎
- [ ] 复用 `drink-data.js`（1000种 boba 配方，Fisher-Yates 洗牌）
- [ ] 复用 `level-data.js`（108关程序化生成）
- [ ] 复用 `game-engine.js`（95%复用，仅改 storage 接口）
- [ ] 验证 Fisher-Yates 种子洗牌在不同设备上结果一致

#### Canvas 2D 渲染优化
- [ ] 移动端 DPR 处理（`window.devicePixelRatio`）
- [ ] 触摸事件适配（`touchstart`/`touchmove`/`touchend`）
- [ ] 按钮尺寸适配（移动端触控目标 ≥ 44pt）
- [ ] 60fps 性能基准测试

#### 原生 UI 壳
- [ ] Title Screen（店名输入 + 开始游戏）
- [ ] Game Screen（WebView 全屏 + 原生状态栏）
- [ ] Shop Screen（食材/配方/设备/装饰购买）
- [ ] Profile Screen（玩家信息 + 设置）
- [ ] Navigation Tab Bar（底部导航）

#### 存档系统
- [ ] AsyncStorage 本地存档（离线优先）
- [ ] Supabase 云端同步（登录时拉取 + 退出时推送）
- [ ] 冲突解决（cloud wins if divergence > 20%）
- [ ] 离线模式（无网络时仅本地存档）

### 3.3 交付物
- 108 关完整可玩
- 1000 种 boba 配方可生成
- 本地 + 云端存档
- 离线可玩

### 3.4 验收标准
- [ ] 从第1关玩到第4关教学完成
- [ ] 第5关起程序化生成正常
- [ ] 连击系统正常工作
- [ ] 外卖系统双线程张力可感知
- [ ] 离线存档 → 联网后同步成功

---

## 四、Phase 2: Social System（第6-8周）

### 4.1 目标
4 大社交机制全部上线，好友间可异步互动。

### 4.2 任务清单

#### Edge Functions 部署
- [ ] `login`：用户注册/登录/资料创建
- [ ] `syncSave`：游戏进度云端同步
- [ ] `getFriendList`：好友列表 + 在线状态
- [ ] `addFriend`：通过邀请码或原生平台好友添加
- [ ] `removeFriend`：移除好友
- [ ] `tasteTest`：Taste Test 逻辑（35%/20%/45% 分配）v2.0
- [ ] `helpWatch`：Cover Shift 逻辑（15%/70% 分配）
- [ ] `getSocialReport`：每日社交摘要
- [ ] `getLeaderboard`：周排行榜查询 + 原生平台同步
- [ ] `syncNativeFriends` (v2.0)：同步 Game Center / Play Games 好友列表
- [ ] `submitNativeScore` (v2.0)：向原生平台提交排行榜分数

#### 原生社交平台集成 (v2.0 新增)
- [ ] Apple Game Center 集成：
  - 安装 expo-apple-authentication
  - 在 App Store Connect 配置 3 个 Leaderboard + 7 个 Achievement
  - 实现 GameCenterService（game-center.ts）
  - 认证后自动同步好友到 Supabase
- [ ] Google Play Games Services 集成：
  - 在 Google Play Console 配置 Play Games Services
  - 实现 PlayGamesService（play-games.ts）
  - 认证后自动同步好友到 Supabase
- [ ] 社交分享集成：
  - 安装 expo-sharing / expo-media-library / expo-file-system
  - 实现 SocialShareService（social-share.ts）
  - Instagram Stories 深链接分享
  - TikTok 系统分享
  - Canvas 截图 → Share Card 生成

#### 社交 UI
- [ ] Social Hub 页面（4个功能入口）
- [ ] Taste Test 界面（v2.0 更名）：
  - 好友列表 → 选择好友 → 试喝动画 → 收益显示
- [ ] Cover Shift 界面：
  - 离线好友列表 → 选择帮忙 → 处理外卖 → 收益显示
- [ ] Leaderboard 界面（v2.0 双模式）：
  - 3 Tab（Weekly Income / Max Combo / Decoration Score）
  - "View on Game Center / Play Games" 按钮打开原生 UI
  - 每周一 00:00 UTC 倒计时
- [ ] Custom Recipes 界面：
  - 创建流程：Base → Flavor → Topping → Glass → Name
  - 我的招牌列表
  - 好友招牌预览
- [ ] 社交分享按钮（v2.0 新增）：
  - Instagram Stories 分享
  - TikTok 分享
  - 系统分享 fallback

#### 邀请系统
- [ ] 6位邀请码生成
- [ ] 分享链接（Deep Link：`boba-dash://invite?code=ABC123`）
- [ ] 输入邀请码添加好友

#### 防刷机制
- [ ] 每日上限（Taste Test 5次/天，Cover Shift 5次/天）
- [ ] 每好友限1次/天
- [ ] 跨 Tier 防套利（基于 Taster 的 Tier 计算收益）
- [ ] 服务端原子操作（PostgreSQL `FOR UPDATE` + 事务）

### 4.3 交付物
- 4 大社交机制可交互
- 好友可通过邀请码互加
- 社交收益正确计算和发放

### 4.4 验收标准
- [ ] 两个测试账号互加好友成功
- [ ] A 试喝 B 的 boba，双方都获得收益（35%/20%）v2.0
- [ ] A 帮 B 看店，处理外卖溢出，双方获益
- [ ] 排行榜正确显示 3 个维度
- [ ] 自定义配方创建并可被好友看到
- [ ] 每日上限和防刷规则生效

---

## 五、Phase 3: Monetization（第8-10周）

### 5.1 目标
5 轨 18 SKU 全部可购买，权益正确发放。

### 5.2 任务清单

#### RevenueCat 集成
- [ ] 注册 RevenueCat 账号
- [ ] 安装 `react-native-purchases` SDK
- [ ] 配置 Apple App Store Connect：18 个 IAP 产品
- [ ] 配置 Google Play Console：18 个 Base Plan
- [ ] RevenueCat Dashboard：创建 18 个 Product
- [ ] 配置 Entitlements（装饰包/配方/皮肤/头像/音乐）

#### App 内购买流程
- [ ] Shop 页面（5个 Tab 对应5轨）
- [ ] 购买流程：用户点击 → RevenueCat 弹窗 → 支付 → 验证
- [ ] 购买验证：RevenueCat webhook → Supabase Edge Function
- [ ] 权益发放：写入 `iap_records` 表 → App 内读取解锁
- [ ] IAP 恢复功能（Apple 必需）：`Purchases.restorePurchases()`
- [ ] 沙箱测试（全部 18 SKU）

#### 新增功能开发
- [ ] Avatar Customization 系统：
  - 分层精灵图渲染（身体→服装→发型→配饰→表情）
  - 5 个 SKU 的内容配置（JSON）
  - Profile 页面头像编辑器
  - 排行榜/好友列表头像显示
- [ ] Shop Theme Music 系统：
  - 音频播放器（循环播放 + 淡入淡出）
  - 5 个 SKU 的音频文件配置
  - Taste Test 访问时播放好友音乐
  - 音乐包预览试听

#### PayPal Web 商店（补充）
- [ ] Web 商店页面（Supabase Hosting 或 Vercel）
- [ ] PayPal Braintree SDK 集成
- [ ] 购买后通过 Supabase 同步权益到 App
- [ ] Web 购买流程独立于 App Store IAP

### 5.3 交付物
- 18 SKU 全部可购买
- 购买后权益正确发放
- 头像定制系统可用
- 店铺音乐系统可用

### 5.4 验收标准
- [ ] 沙箱环境购买每个 SKU 成功
- [ ] 购买后装饰/配方/皮肤/头像/音乐正确解锁
- [ ] IAP 恢复功能正常
- [ ] 头像定制：选择服装/配饰/表情后预览正确
- [ ] 店铺音乐：购买后播放，Taste Test 访问时好友可听到

---

## 六、Phase 4: Polish & Platform（第10-12周）

### 6.1 目标
完成所有上架素材，性能优化，准备提交审核。

### 6.2 任务清单

#### 视觉素材
- [ ] App 图标（1024×1024px PNG，无 alpha）
- [ ] Splash Screen（启动画面）
- [ ] ASO 截图（iPhone 6.7" ×5 + iPhone 6.5" ×5 + iPad 12.9" ×5）
- [ ] App Preview Video（30秒 1080p）
- [ ] Google Play Feature Graphic（1024×500px）
- [ ] Android 截图（手机 ×8 + 7寸 ×2 + 10寸 ×2）

#### 英文化
- [ ] 游戏内全量字符串英文化（~1310条）
- [ ] App Store 描述文案（4000字符）
- [ ] Google Play 描述文案（4000字符）
- [ ] 关键词优化（100字符 Apple / 80字符 Google 短描述）
- [ ] 隐私政策页面（English）
- [ ] 服务条款页面（English）

#### 性能优化
- [ ] 60fps 目标验证（使用 Expo DevTools profiler）
- [ ] Bundle 体积 < 50MB
- [ ] WebView 冷启动时间 < 2s
- [ ] 内存占用监控
- [ ] Crash reporting 集成（Sentry）

#### 平台合规
- [ ] Privacy Nutrition Labels（Apple 隐私标签）
- [ ] Data Safety Section（Google Play 数据安全）
- [ ] Export Compliance（加密使用声明）
- [ ] Sign-in-with-Apple 合规（如有任何社交登录）
- [ ] 年龄分级问卷（Apple 4+ / Google Everyone）
- [ ] 无障碍：VoiceOver 标签 + Dynamic Type 支持

### 6.3 交付物
- 完整的上架素材包
- 英文化完成
- 性能达标
- 合规文档就绪

---

## 七、Phase 5: Testing（第12-14周）

### 7.1 目标
通过内部测试 + 外部 Playtest，修复所有 A/B 类 bug。

### 7.2 任务清单

#### iOS 测试
- [ ] TestFlight 内测（10人，邀请链接）
- [ ] IAP 沙箱测试（全部 18 SKU）
- [ ] 多设备测试（iPhone SE / iPhone 15 / iPad）
- [ ] 离线模式测试
- [ ] 社交功能多账号测试

#### Android 测试
- [ ] Internal Testing Track（100人上限）
- [ ] IAP 许可测试（全部 18 SKU）
- [ ] 多设备测试（Pixel / Samsung / 小米）
- [ ] 不同屏幕尺寸适配

#### Playtest
- [ ] 招募 5 名英文测试者（3女2男，18-35）
- [ ] 观察 → 访谈 → 数据提取
- [ ] 失败信号判定（A/B/C 分级）
- [ ] Bug 修复 Sprint

#### Google Play 封闭测试（最大阻塞项）
- [ ] **新账号需 20 人封闭测试 ≥ 14 天**
- [ ] 提前招募测试者（亲友 + Reddit/Discord 社区）
- [ ] 封闭测试期间收集反馈并修复
- [ ] 封闭测试通过后才能提交正式发布

### 7.3 交付物
- TestFlight + Google Play 内测可运行
- Playtest 报告（无 A 类失败信号）
- Google Play 封闭测试通过

---

## 八、Phase 6: Launch（第14-16周）

### 8.1 目标
App Store + Google Play 双平台正式上架。

### 8.2 任务清单

#### App Store 提交
- [ ] App Store Connect 最终检查
- [ ] 提交审核（预计 1-7 天）
- [ ] 审核反馈处理（首次大概率被拒，预留 2 周修改）
- [ ] 审核通过 → 选择发布日期

#### Google Play 提交
- [ ] Google Play Console 最终检查
- [ ] 封闭测试通过 → 提交正式发布
- [ ] 审核反馈处理（预计 1-3 天）
- [ ] 审核通过 → 上架

#### 发布日
- [ ] 监控崩溃率（Sentry）
- [ ] 监控 Supabase 用量
- [ ] 监控 RevenueCat 购买数据
- [ ] 社交媒体预告（TikTok / Instagram Reels）

### 8.3 交付物
- App Store 上架
- Google Play 上架
- 监控仪表盘运行

---

## 九、优先级管理

### 9.1 MVP 范围（P0，不可删减）

```
P0（MVP 必须包含）:
  ✅ 核心游戏循环（108关，1000配方）
  ✅ 本地存档（AsyncStorage + Supabase sync）
  ✅ Auth（Email + Sign-in-with-Apple + Google）
  ✅ 4社交机制全部上线
  ✅ 5轨 IAP 全部可用（18 SKU）
  ✅ 原生 App Shell（RN + WebView）
  ✅ App Store + Google Play 上架
```

### 9.2 首发后计划

| 优先级 | 时间 | 内容 |
|--------|------|------|
| P1 | 首发后4周 | PayPal Web 商店 / 限量装饰包 / 季节活动（万圣节/圣诞节） |
| P2 | 首发后8周 | 无尽模式 / 每日挑战 / Game Center / Google Play Games 排行榜 |
| P3 | 按需 | 多语言（西班牙语/日语/韩语）/ iPad 优化 / Android 平板优化 / 无障碍改进 |

---

## 十、风险矩阵

| 风险 | 概率 | 影响 | 缓解措施 |
|------|------|------|---------|
| App Store 审核拒绝 | 中 | 高 | 提前阅读审核指南，准备至少2周 buffer |
| Google Play 新账号20人封闭测试 | 高 | 中 | 提前招募测试者，首批用亲友，Discord/Reddit 扩展 |
| WebView Bridge 性能不达标 | 中 | 高 | Phase 0 早期性能基准测试，备选方案 react-native-canvas |
| Supabase 免费额度超限 | 低 | 低 | 设置 usage alerts，预算 $25-50/月 |
| IAP 沙箱测试复杂 | 中 | 中 | 使用 RevenueCat 简化，提前2周沙箱测试 |
| 独立开发者时间超期 | 高 | 高 | 每个 Phase 加30% buffer，严格 MVP 范围控制 |
| 多平台测试覆盖不足 | 中 | 中 | 聚焦 iOS 主力测试，Android 次要 |

---

## 十一、工具与成本

### 11.1 工具清单

| 用途 | 工具 | 月费 |
|------|------|------|
| IDE | Cursor | $20/月 |
| 后端 | Supabase | Free - $25/月 |
| IAP 管理 | RevenueCat | Free（<$10K MTR） |
| 崩溃报告 | Sentry | Free |
| 分析 | PostHog（自托管） | Free |
| 设计 | Figma | Free |
| App 图标 | AI 生成 + 手动修图 | $0 |
| 音乐/音效 | Epidemic Sound | $15/月 |
| 翻译 | DeepL API | Free 层 |
| 测试设备 | 个人设备 / BrowserStack | $0-29/月 |

### 11.2 月度成本

| DAU 规模 | Supabase | 其他 | 月总成本 |
|---------|---------|------|---------|
| < 100 | Free | $55 | ~$55 |
| 1K | $25 | $55 | ~$80 |
| 10K | $25 | $55 | ~$80 |
| 100K | $100+ | $55 | ~$155+ |

### 11.3 一次性费用

| 项目 | 费用 |
|------|------|
| Apple Developer Program | $99/年 |
| Google Play Console | $25 一次性 |

### 11.4 盈亏平衡

- ARPU：$0.50-1.50
- 扣除 30% 平台费后净 ARPU：$0.35-1.05
- 月固定成本：~$55-80
- 盈亏平衡 DAU：**< 100**（仅需不到100日活即可覆盖成本）

---

## 十二、独立开发者时间管理建议

1. **每日 2-3 小时开发**（保持可持续节奏，避免 burnout）
2. **周末集中攻克复杂功能**（周中做稳定开发）
3. **Phase 0 + Phase 1 先跑通完整可玩版本**，然后才开始社交和变现
4. **Phase 3 IAP 接入预留充足 buffer** —— 这是独立开发者最不熟悉的领域
5. **App 审核提交最少预留 2 周** —— 初次提交大概率被拒绝
6. **启动前先在 TestFlight 积累 50+ 安装** —— App Store 算法会优先推荐有用户的产品
7. **第一个月数据不要过度解读** —— 给 ASO 和算法足够时间
8. **Google Play 20 人封闭测试提前启动** —— 这是最大的时间阻塞项

---

> **Boba Dash 开发路线图 v1.0** · 独立开发者视角  
> 文档维护：Paul · 最后更新：2026-08-10
