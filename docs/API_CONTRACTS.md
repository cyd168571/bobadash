# Boba Dash — Edge Functions API 契约

## 1. `taste-test` — 执行 Taste Test

### Request

```json
{
  "target_user_id": "uuid"
}
```

### Response (Success)

```json
{
  "success": true,
  "taster_gain": 7,
  "owner_gain": 4,
  "drink_name": "Strawberry Milk Tea",
  "is_signature": false,
  "remaining_taste_tests": 4
}
```

### Response (Error)

```json
{
  "success": false,
  "error": "DAILY_LIMIT_REACHED"
}
```

## 2. `cover-shift` — 执行 Cover Shift

### Request

```json
{
  "target_user_id": "uuid"
}
```

### Response (Success)

```json
{
  "success": true,
  "helper_gain": 15,
  "owner_gain": 70,
  "orders_processed": 2
}
```

## 3. `get-friend-list` — 获取好友列表

### Request

```json
{}
```

### Response

```json
{
  "success": true,
  "friends": [
    {
      "user_id": "uuid",
      "shop_name": "Lily's Boba Shop",
      "nickname": "Lily",
      "avatar_url": "https://...",
      "current_tier": 3,
      "is_online": true,
      "offline_delivery_pool": 0
    }
  ]
}
```

## 4. `get-leaderboard` — 获取排行榜

### Request

```json
{
  "category": "income"
}
```

> `category` 可选值：`"income"` | `"combo"` | `"decoration"`

### Response

```json
{
  "success": true,
  "category": "income",
  "entries": [
    {
      "rank": 1,
      "user_id": "uuid",
      "shop_name": "Lily's Boba Shop",
      "value": 3520
    }
  ]
}
```

## 5. `sync-native-friends` (v2.0) — 同步原生好友

### Request

```json
{
  "platform": "game_center",
  "native_player_id": "string",
  "native_friends": ["player_id1", "player_id2"]
}
```

> `platform` 可选值：`"game_center"` | `"play_games"`

### Response

```json
{
  "success": true,
  "matched_friends": 3
}
```
