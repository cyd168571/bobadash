# CLAUDE.md — Boba Dash 知识库

## 项目当前阶段

Phase 2 (Social) — 已完成：项目迁移、Supabase 数据库初始化、H5 游戏引擎移植。正在进行：社交系统实现（Taste Test / Cover Shift / Leaderboard / Custom Recipes）。

## 已知的技术决策

- 后端从微信云开发迁移到 Supabase（原因：全球部署、更强大、更灵活）
- 使用 WebView Bridge 而非原生重写 Canvas（原因：95% 代码复用）
- 社交平台从微信关系链改为 Game Center + Play Games（原因：海外市场）
- 变现从 6 轨调整为 5 轨（保留：装饰包、配方、皮肤、头像、音乐；暂缓：通行证、机器人、好友位扩展）
- 好友位固定 5 个，不付费扩展

## 常见错误排查

- `WebView 白屏` → 检查 `webview-game/index.html` 是否有语法错误，查看 Metro 日志
- `Supabase 查询返回 401` → 检查 JWT token 是否过期，确认 RLS 策略正确
- `Edge Function 无日志` → 确认函数部署成功，检查 JWT 传递
- `AsyncStorage 数据丢失` → 确认 HybridStorage 的 `enableCloudSync()` 是否已调用

## 敏感信息占位符

- 替换 `EXPO_PUBLIC_SUPABASE_URL` 为实际项目 URL
- 替换 `EXPO_PUBLIC_SUPABASE_ANON_KEY` 为实际 anon key
- 替换 `REVENUECAT_IOS_KEY` 和 `REVENUECAT_ANDROID_KEY` 为 RevenueCat 实际密钥

## Social System 关键数值（不要改错）

- Taste Test: Taster 35% / Owner 20% / System 45%
- Cover Shift: Helper 15% / Owner 70% / System 85%
- 每日上限: Taste Test 5次/天, Cover Shift 4次/天
- 好友位: 固定 5 个（不可扩展）
