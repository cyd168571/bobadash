# Lessons Learned — Boba Dash

## 2026-08-12

### 问题：Supabase SQL 迁移时 `generate_weekly_leaderboard` 报错 `null value in column "entries"`

- **原因**：`jsonb_agg` 在没有数据时返回 `NULL`，而 `leaderboard_cache.entries` 列定义为 `NOT NULL`
- **解决**：使用 `COALESCE(jsonb_agg(...), '[]'::jsonb)` 确保返回空数组

### 问题：`cron.unschedule` 在首次运行时找不到任务报错

- **原因**：任务尚未创建，`unschedule` 在部分 Supabase 版本中抛出异常
- **解决**：注释掉 `cron.unschedule` 行，`cron.schedule` 会自动覆盖已有任务

### 问题：Expo 环境变量未加载

- **原因**：`.env` 文件变量名必须以 `EXPO_PUBLIC_` 开头
- **解决**：将 `SUPABASE_URL` 改为 `EXPO_PUBLIC_SUPABASE_URL`

## 规则固化

- **规则 1**：Supabase 迁移脚本中使用 `COALESCE` 处理空结果
- **规则 2**：首次创建定时任务时不要调用 `cron.unschedule`
- **规则 3**：Expo 环境变量必须以 `EXPO_PUBLIC_` 为前缀
