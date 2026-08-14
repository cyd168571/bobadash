# Boba Dash — WebView Bridge 桥接设计

> **版本**：v1.0 · **作者**：程基岩（Cheng Jiyan）· **日期**：2026-08-10
> **关联文档**：`main-architecture.md`、`backend-design.md`

---

## 1. Bridge 架构概述

### 1.1 双层通信模型

Boba Dash 的游戏引擎在 WebView 内运行（Canvas 2D），React Native Shell 作为宿主容器。两者通过 JSON 消息协议通信。

```
┌─────────────────────────────────────────────────────────────┐
│                   React Native (Expo) Shell                  │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐  │
│  │                  Native Bridge Handlers               │  │
│  │                                                       │  │
│  │  syncSaveHandler()     loadDataHandler()              │  │
│  │  iapHandler()          socialActionHandler()          │  │
│  │  hapticHandler()       authHandler()                  │  │
│  └──────────────────┬────────────────────────────────────┘  │
│                     │                                        │
│              ┌──────┴──────┐                                 │
│              │ onMessage() │  ← WebView → RN 消息接收        │
│              │ postMessage()│ ← RN → WebView 消息发送        │
│              └──────┬──────┘                                 │
└─────────────────────┼────────────────────────────────────────┘
                      │
        JSON String Message (serialized)
                      │
┌─────────────────────┼────────────────────────────────────────┐
│              WebView (Canvas 2D Game)                        │
│              ┌──────┴──────┐                                 │
│              │ onMessage() │  ← RN → WebView 消息接收        │
│              │ postMessage()│ ← WebView → RN 消息发送        │
│              └──────┬──────┘                                 │
│                     │                                        │
│  ┌──────────────────┴────────────────────────────────────┐  │
│  │              Bridge Adapter (bridge.js)               │  │
│  │                                                       │  │
│  │  storage.save()  → GAME_SAVE  → RN → AsyncStorage     │  │
│  │  storage.load()  → GAME_LOAD → RN → AsyncStorage      │  │
│  │  social.tasteTest() → GAME_SOCIAL_ACTION → RN → API   │  │
│  │  iap.purchase()  → GAME_IAP → RN → RevenueCat         │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐  │
│  │              Game Engine (game-engine.js)             │  │
│  │  95% 代码复用，仅 storage 层适配 Bridge API            │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### 1.2 为什么使用 WebView Bridge

| 方案对比 | WebView Bridge（选中） | React Native 原生重写 | Web 打包 (PWA) |
|----------|----------------------|----------------------|----------------|
| 开发速度 | 极快（100%H5复用） | 极慢（完全重写Canvas代码） | 快 |
| 性能 | Canvas 2D 60fps OK | 最优 | Canvas 2D 60fps OK |
| IAP集成 | 通过Bridge调用RevenueCat | 原生调用 | 必须用Web商店 |
| 离线能力 | AsyncStorage | AsyncStorage/SQLite | Service Worker |
| 复杂动画 | 60fps | 120fps | 60fps |
| **代码复用** | **95%** | **0%** | **80%** |

最终选择 WebView Bridge 方案：将 H5 原型的游戏引擎原封不动加载到 WebView，仅适配存储层和原生功能调用。

---

## 2. 消息协议设计

### 2.1 消息格式规范

所有消息使用统一 JSON 结构：

```typescript
interface BridgeMessage {
  id: string;                    // 消息唯一ID (UUID v4)
  type: GameToNativeType | NativeToGameType;
  payload: Record<string, unknown>;
  timestamp: number;             // Unix ms
}

type GameToNativeType =
  | "GAME_SAVE"
  | "GAME_LOAD"
  | "GAME_IAP"
  | "GAME_SOCIAL_ACTION"
  | "GAME_HAPTIC"
  | "GAME_SHARE"
  | "GAME_AUTH";

type NativeToGameType =
  | "NATIVE_SAVE_RESULT"
  | "NATIVE_LOAD_DATA"
  | "NATIVE_IAP_RESULT"
  | "NATIVE_SOCIAL_RESULT"
  | "NATIVE_AUTH"
  | "NATIVE_ERROR";
```

### 2.2 完整消息类型定义

```typescript
// ===== GAME → NATIVE 消息 =====

// 1. GAME_SAVE — 保存游戏数据
interface GameSaveMessage extends BridgeMessage {
  type: "GAME_SAVE";
  payload: {
    key: string;                  // 存档键名 (e.g., "gameState_v1")
    data: {
      coins: number;
      level: number;
      currentTier: number;
      shopName?: string;
      weeklyStats?: {
        totalIncome: number;
        maxCombo: number;
        decorationValue: number;
      };
      // ... 其他本地存档字段
    };
    syncToCloud: boolean;         // 是否同步到 Supabase
  };
}

// 2. GAME_LOAD — 加载游戏数据
interface GameLoadMessage extends BridgeMessage {
  type: "GAME_LOAD";
  payload: {
    key: string;                  // 存档键名
    fromCloud: boolean;           // 是否从云端加载
  };
}

// 3. GAME_IAP — 触发内购
interface GameIapMessage extends BridgeMessage {
  type: "GAME_IAP";
  payload: {
    productId: string;            // RevenueCat product ID
    offeringId?: string;          // RevenueCat offering ID
  };
}

// 4. GAME_SOCIAL_ACTION — 执行社交动作
interface GameSocialActionMessage extends BridgeMessage {
  type: "GAME_SOCIAL_ACTION";
  payload: {
    action: "taste_test" | "help_watch";
    targetUserId: string;
  };
}

// 5. GAME_HAPTIC — 触发触觉反馈
interface GameHapticMessage extends BridgeMessage {
  type: "GAME_HAPTIC";
  payload: {
    style: "light" | "medium" | "heavy" | "success" | "warning" | "error";
  };
}

// 6. GAME_SHARE — 分享邀请
interface GameShareMessage extends BridgeMessage {
  type: "GAME_SHARE";
  payload: {
    inviteCode: string;
    shopName: string;
    message: string;
  };
}

// 7. GAME_AUTH — 认证状态变更
interface GameAuthMessage extends BridgeMessage {
  type: "GAME_AUTH";
  payload: {
    action: "login" | "logout" | "refresh";
  };
}

// ===== NATIVE → GAME 消息 =====

// 1. NATIVE_SAVE_RESULT — 保存结果
interface NativeSaveResultMessage extends BridgeMessage {
  type: "NATIVE_SAVE_RESULT";
  payload: {
    success: boolean;
    key: string;
    error?: string;
    cloudVersion?: number;        // 云端同步版本号
  };
}

// 2. NATIVE_LOAD_DATA — 加载数据返回
interface NativeLoadDataMessage extends BridgeMessage {
  type: "NATIVE_LOAD_DATA";
  payload: {
    success: boolean;
    key: string;
    data?: Record<string, unknown>;
    error?: string;
    source: "local" | "cloud" | "merged";
  };
}

// 3. NATIVE_IAP_RESULT — 内购结果
interface NativeIapResultMessage extends BridgeMessage {
  type: "NATIVE_IAP_RESULT";
  payload: {
    success: boolean;
    productId: string;
    transactionId?: string;
    error?: string;
    // 已购买的产品列表
    activeProducts?: string[];
  };
}

// 4. NATIVE_SOCIAL_RESULT — 社交动作结果
interface NativeSocialResultMessage extends BridgeMessage {
  type: "NATIVE_SOCIAL_RESULT";
  payload: {
    success: boolean;
    action: "taste_test" | "help_watch";
    gain?: number;
    drinkName?: string;
    isCustom?: boolean;
    friendShopName?: string;
    error?: string;
  };
}

// 5. NATIVE_AUTH — 认证状态推送
interface NativeAuthMessage extends BridgeMessage {
  type: "NATIVE_AUTH";
  payload: {
    isLoggedIn: boolean;
    userId?: string;
    sessionToken?: string;
    error?: string;
  };
}

// 6. NATIVE_ERROR — 通用错误
interface NativeErrorMessage extends BridgeMessage {
  type: "NATIVE_ERROR";
  payload: {
    code: string;
    message: string;
    originalType: string;         // 原始请求的消息类型
  };
}
```

### 2.3 消息交互示例

#### 示例1：游戏存档同步

```
┌────── WebView ──────┐          ┌─────── RN Shell ───────┐
│                     │          │                         │
│ 玩家通关 → 更新状态 │          │                         │
│                     │          │                         │
│ game.storage.save   │          │                         │
│  ("gameState", {    │          │                         │
│   coins: 1520,      │ GAME_SAVE│                         │
│   level: 13,        │─────────►│ onMessage(GAME_SAVE)    │
│   ...               │          │                         │
│  })                 │          │ → AsyncStorage.setItem  │
│                     │          │ → supabase.invoke       │
│                     │          │   ('syncSave', data)    │
│                     │          │                         │
│                     │NATIVE_SA │                         │
│                     │VE_RESULT │                         │
│ game.onSaveResult   │◄─────────│ postMessage(result)     │
│  ({ success:true,   │          │                         │
│     cloudVersion:.. │          │                         │
│  })                 │          │                         │
└─────────────────────┘          └─────────────────────────┘
```

#### 示例2：Taste Test 动作

```
┌────── WebView ──────┐          ┌─────── RN Shell ───────┐
│                     │          │                         │
│ 玩家点击"Taste Test" │          │                         │
│                     │          │                         │
│ game.social         │GAME_SOCI │                         │
│  .tasteTest(        │AL_ACTION │                         │
│   targetUserId)     │─────────►│ onMessage →             │
│                     │          │ invoke('taste-test', {  │
│                     │          │   target_user_id })     │
│                     │          │                         │
│                     │          │ ← Supabase Edge Func    │
│                     │          │   {success, gain:8,     │
│                     │          │    drinkName:"草莓奶昔"} │
│                     │          │                         │
│                     │NATIVE_SO │                         │
│ game.onSocialResult │CIAL_RES. │                         │
│  ({ gain:8,         │◄─────────│ postMessage(result)     │
│     drinkName })    │          │                         │
│                     │          │                         │
│ game.playAnimation  │          │                         │
│  ("taste_test",drink│          │                         │
│  )                  │          │                         │
└─────────────────────┘          └─────────────────────────┘
```

---

## 3. 存储层适配

### 3.1 从 localStorage 到 AsyncStorage

游戏引擎原本使用 `localStorage` 进行本地持久化。在 WebView 环境中，需适配为 React Native 的 AsyncStorage。

```typescript
// ============================================
// WebView 端：storage-adapter.js
// 替换 game-engine.js 中的 localStorage 调用
// ============================================

// 原始代码 (H5)
// localStorage.setItem('gameState', JSON.stringify(state));

// 适配后：通过 Bridge 发送到 RN 层
const StorageAdapter = {
  async save(key: string, data: unknown, syncToCloud: boolean = true): Promise<void> {
    return new Promise((resolve, reject) => {
      const handler = (event: MessageEvent) => {
        const msg: BridgeMessage = JSON.parse(event.data);
        if (msg.type === "NATIVE_SAVE_RESULT" && msg.payload.key === key) {
          window.removeEventListener("message", handler);
          if (msg.payload.success) {
            resolve();
          } else {
            reject(new Error(msg.payload.error || "SAVE_FAILED"));
          }
        }
      };
      window.addEventListener("message", handler);

      const message: GameSaveMessage = {
        id: generateUUID(),
        type: "GAME_SAVE",
        payload: { key, data: data as Record<string, unknown>, syncToCloud },
        timestamp: Date.now(),
      };

      // @ts-ignore React Native WebView injected API
      window.ReactNativeWebView.postMessage(JSON.stringify(message));
    });
  },

  async load(key: string, fromCloud: boolean = false): Promise<unknown> {
    return new Promise((resolve, reject) => {
      const handler = (event: MessageEvent) => {
        const msg: BridgeMessage = JSON.parse(event.data);
        if (msg.type === "NATIVE_LOAD_DATA" && msg.payload.key === key) {
          window.removeEventListener("message", handler);
          if (msg.payload.success && msg.payload.data) {
            resolve(msg.payload.data);
          } else {
            reject(new Error(msg.payload.error || "LOAD_FAILED"));
          }
        }
      };
      window.addEventListener("message", handler);

      const message: GameLoadMessage = {
        id: generateUUID(),
        type: "GAME_LOAD",
        payload: { key, fromCloud },
        timestamp: Date.now(),
      };

      // @ts-ignore
      window.ReactNativeWebView.postMessage(JSON.stringify(message));
    });
  },
};

// 注入到 game-engine.js 的 storage 模块
window.BridgeStorage = StorageAdapter;
```

### 3.2 React Native 端处理

```typescript
// ============================================
// RN 端：useGameBridge.ts (Custom Hook)
// ============================================

import { useRef, useCallback } from "react";
import { WebView, WebViewMessageEvent } from "react-native-webview";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { supabase } from "./supabase";

type BridgeMessage = {
  id: string;
  type: string;
  payload: Record<string, any>;
  timestamp: number;
};

export function useGameBridge(webViewRef: React.RefObject<WebView>) {
  const pendingRequests = useRef<Map<string, {
    resolve: (value: unknown) => void;
    reject: (error: Error) => void;
  }>>(new Map());

  const sendToGame = useCallback((message: BridgeMessage) => {
    webViewRef.current?.postMessage(JSON.stringify(message));
  }, [webViewRef]);

  const handleMessage = useCallback(async (event: WebViewMessageEvent) => {
    const message: BridgeMessage = JSON.parse(event.nativeEvent.data);

    switch (message.type) {
      case "GAME_SAVE":
        await handleGameSave(message);
        break;
      case "GAME_LOAD":
        await handleGameLoad(message);
        break;
      case "GAME_IAP":
        await handleIapPurchase(message);
        break;
      case "GAME_SOCIAL_ACTION":
        await handleSocialAction(message);
        break;
      case "GAME_HAPTIC":
        await handleHaptic(message);
        break;
      case "GAME_SHARE":
        await handleShare(message);
        break;
      default:
        console.warn("Unknown message type:", message.type);
    }
  }, []);

  // --- 处理函数 ---

  const handleGameSave = async (message: BridgeMessage) => {
    try {
      const { key, data, syncToCloud } = message.payload;

      // 1. 本地存储
      await AsyncStorage.setItem(key, JSON.stringify(data));

      // 2. 云端同步
      if (syncToCloud) {
        const { error } = await supabase.functions.invoke("sync-save", {
          body: data,
        });

        if (error) throw new Error(error.message);
      }

      sendToGame({
        id: generateUUID(),
        type: "NATIVE_SAVE_RESULT",
        payload: {
          success: true,
          key,
          cloudVersion: Date.now(),
        },
        timestamp: Date.now(),
      });
    } catch (error: any) {
      sendToGame({
        id: generateUUID(),
        type: "NATIVE_SAVE_RESULT",
        payload: {
          success: false,
          key: message.payload.key,
          error: error.message,
        },
        timestamp: Date.now(),
      });
    }
  };

  const handleGameLoad = async (message: BridgeMessage) => {
    try {
      const { key, fromCloud } = message.payload;

      if (fromCloud) {
        // 从云端加载
        const { data: userData, error } = await supabase
          .from("users")
          .select("coins, level, current_tier, shop_name, ...")
          .single();

        if (error) throw new Error(error.message);

        sendToGame({
          id: generateUUID(),
          type: "NATIVE_LOAD_DATA",
          payload: {
            success: true,
            key,
            data: userData,
            source: "cloud",
          },
          timestamp: Date.now(),
        });
      } else {
        // 从本地加载
        const raw = await AsyncStorage.getItem(key);
        sendToGame({
          id: generateUUID(),
          type: "NATIVE_LOAD_DATA",
          payload: {
            success: true,
            key,
            data: raw ? JSON.parse(raw) : null,
            source: "local",
          },
          timestamp: Date.now(),
        });
      }
    } catch (error: any) {
      sendToGame({
        id: generateUUID(),
        type: "NATIVE_LOAD_DATA",
        payload: {
          success: false,
          key: message.payload.key,
          error: error.message,
        },
        timestamp: Date.now(),
      });
    }
  };

  const handleIapPurchase = async (message: BridgeMessage) => {
    try {
      const { productId } = message.payload;
      // RevenueCat 购买逻辑（简化示例）
      // const { purchaserInfo } = await Purchases.purchaseProduct(productId);

      sendToGame({
        id: generateUUID(),
        type: "NATIVE_IAP_RESULT",
        payload: {
          success: true,
          productId,
          transactionId: "txn_xxx",
          activeProducts: [],
        },
        timestamp: Date.now(),
      });
    } catch (error: any) {
      sendToGame({
        id: generateUUID(),
        type: "NATIVE_IAP_RESULT",
        payload: {
          success: false,
          productId: message.payload.productId,
          error: error.message,
        },
        timestamp: Date.now(),
      });
    }
  };

  const handleSocialAction = async (message: BridgeMessage) => {
    try {
      const { action, targetUserId } = message.payload;
      const functionName = action === "taste_test" ? "taste-test" : "help-watch";

      const { data, error } = await supabase.functions.invoke(functionName, {
        body: { target_user_id: targetUserId },
      });

      if (error) throw new Error(error.message);

      sendToGame({
        id: generateUUID(),
        type: "NATIVE_SOCIAL_RESULT",
        payload: {
          success: true,
          action,
          ...data,
        },
        timestamp: Date.now(),
      });
    } catch (error: any) {
      sendToGame({
        id: generateUUID(),
        type: "NATIVE_SOCIAL_RESULT",
        payload: {
          success: false,
          action: message.payload.action,
          error: error.message,
        },
        timestamp: Date.now(),
      });
    }
  };

  const handleHaptic = async (message: BridgeMessage) => {
    try {
      // 使用 expo-haptics
      // await Haptics.impactAsync(Haptics.ImpactFeedbackStyle[message.payload.style]);
    } catch (error) {
      // 触觉失败不报错，静默忽略
    }
  };

  const handleShare = async (message: BridgeMessage) => {
    try {
      const { inviteCode, shopName, message: shareMsg } = message.payload;
      // 使用 expo-sharing 或 React Native Share API
      // await Share.share({
      //   message: `${shareMsg}\n\nJoin me in Boba Dash! Use invite code: ${inviteCode}`,
      // });
    } catch (error) {
      // 分享取消不报错
    }
  };

  return { handleMessage, sendToGame };
}
```

### 3.3 冲突解决策略

```typescript
// 启动时合并本地和云端存档
async function resolveSaveConflict(
  localData: GameState | null,
  cloudData: GameState | null
): Promise<{ data: GameState; source: "local" | "cloud" | "merged" }> {
  // Case 1: 本地为空 → 使用云端
  if (!localData && cloudData) {
    return { data: cloudData, source: "cloud" };
  }

  // Case 2: 云端为空 → 使用本地
  if (localData && !cloudData) {
    return { data: localData, source: "local" };
  }

  // Case 3: 两者都有 → 智能合并
  if (localData && cloudData) {
    return {
      data: {
        // 金币：取较大值（防止回退）
        coins: Math.max(localData.coins, cloudData.coins),
        // 关卡：取较大值
        level: Math.max(localData.level, cloudData.level),
        // Tier：取较大值
        currentTier: Math.max(localData.currentTier, cloudData.currentTier),
        // 店名：优先云端
        shopName: cloudData.shopName || localData.shopName,
        // 其余字段：合并
        ...localData,
        ...cloudData,
      },
      source: "merged",
    };
  }

  // Case 4: 两者都为空 → 新玩家
  return {
    data: {
      coins: 0,
      level: 1,
      currentTier: 1,
      shopName: "New Boba Shop",
    },
    source: "local",
  };
}
```

---

## 4. 性能优化

### 4.1 WebView 预加载

```typescript
// App.tsx — 在 Splash Screen 期间提前创建 WebView
import { useRef, useEffect } from "react";
import { AppState } from "react-native";

function useWebViewPreload() {
  const webViewReady = useRef(false);

  useEffect(() => {
    // WebView 在组件挂载时创建，但不显示
    // 使用 opacity: 0 / pointerEvents: "none" 隐藏
    // 当 onLoadEnd 触发时标记 ready
  }, []);

  useEffect(() => {
    const sub = AppState.addEventListener("change", (state) => {
      if (state === "active" && webViewReady.current) {
        // App 回到前台，恢复 WebView
      }
    });
    return () => sub.remove();
  }, []);

  return webViewReady;
}
```

### 4.2 渲染优化

```html
<!-- WebView 内的 HTML 配置 -->
<meta name="viewport" content="width=device-width, initial-scale=1.0,
  maximum-scale=1.0, user-scalable=no, viewport-fit=cover">

<script>
// 适配设备像素比 (DPR)
const dpr = window.devicePixelRatio || 1;
const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');

// 物理像素 = CSS像素 × DPR
canvas.width = canvas.offsetWidth * dpr;
canvas.height = canvas.offsetHeight * dpr;
ctx.scale(dpr, dpr);

// requestAnimationFrame 循环
function gameLoop(timestamp: number) {
  // ... 游戏逻辑
  requestAnimationFrame(gameLoop);
}
requestAnimationFrame(gameLoop);

// WebView 不可见时暂停渲染
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    cancelAnimationFrame(animationFrameId);
  } else {
    requestAnimationFrame(gameLoop);
  }
});
</script>
```

### 4.3 消息批处理

为减少 `postMessage` 调用频率，非紧急的消息进行批处理：

```typescript
// 游戏端：批量保存，避免每帧都调用
class BatchSaveManager {
  private pendingSaves: Map<string, unknown> = new Map();
  private flushTimer: number | null = null;
  private FLUSH_INTERVAL = 2000; // 2秒批量写入

  save(key: string, data: unknown, syncToCloud: boolean) {
    this.pendingSaves.set(key, { data, syncToCloud });

    if (!this.flushTimer) {
      this.flushTimer = window.setTimeout(() => this.flush(), this.FLUSH_INTERVAL);
    }
  }

  private flush() {
    this.pendingSaves.forEach((value, key) => {
      const msg: GameSaveMessage = {
        id: generateUUID(),
        type: "GAME_SAVE",
        payload: {
          key,
          data: (value as any).data,
          syncToCloud: (value as any).syncToCloud,
        },
        timestamp: Date.now(),
      };
      // @ts-ignore
      window.ReactNativeWebView.postMessage(JSON.stringify(msg));
    });

    this.pendingSaves.clear();
    this.flushTimer = null;
  }
}
```

### 4.4 内存管理

```typescript
// RN 端：WebView 生命周期管理
useEffect(() => {
  const subscription = AppState.addEventListener("change", (nextState) => {
    if (nextState === "background") {
      // 暂停 WebView 渲染
      webViewRef.current?.postMessage(JSON.stringify({
        type: "NATIVE_LIFECYCLE",
        payload: { state: "paused" },
        id: generateUUID(),
        timestamp: Date.now(),
      }));

      // 强制保存当前状态
      webViewRef.current?.postMessage(JSON.stringify({
        type: "NATIVE_LIFECYCLE",
        payload: { state: "saveBeforeBackground" },
        id: generateUUID(),
        timestamp: Date.now(),
      }));
    } else if (nextState === "active") {
      // 恢复渲染
      webViewRef.current?.postMessage(JSON.stringify({
        type: "NATIVE_LIFECYCLE",
        payload: { state: "resumed" },
        id: generateUUID(),
        timestamp: Date.now(),
      }));
    }
  });

  return () => subscription.remove();
}, []);
```

---

## 5. 错误处理

### 5.1 超时机制

```typescript
// WebView 端：请求超时处理
function sendWithTimeout(
  message: BridgeMessage,
  timeoutMs: number = 10000
): Promise<BridgeMessage> {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      window.removeEventListener("message", handler);
      reject(new Error(`Request timed out: ${message.type}`));
    }, timeoutMs);

    const handler = (event: MessageEvent) => {
      const response: BridgeMessage = JSON.parse(event.data);
      if (response.payload._requestId === message.id) {
        clearTimeout(timeout);
        window.removeEventListener("message", handler);
        resolve(response);
      }
    };

    window.addEventListener("message", handler);
    // @ts-ignore
    window.ReactNativeWebView.postMessage(JSON.stringify(message));
  });
}
```

### 5.2 重连机制

```typescript
// WebView 重新注入 Game Bridge（WebView 重载时）
function injectBridge() {
  // 检查 Bridge API 是否可用
  if (typeof window.ReactNativeWebView === "undefined") {
    console.warn("Bridge not available. Running in standalone mode.");
    // 回退到纯 localStorage 模式（纯 Web 模式用）
    return false;
  }
  return true;
}

// 在 game-engine.js 初始化时调用
if (!injectBridge()) {
  // 降级为本地模式（仅 localStorage）
  console.log("Running in offline/standalone mode");
}
```

---

## 6. 安全注意事项

| 安全点 | 措施 |
|--------|------|
| **消息来源验证** | WebView 内仅接受来自同一 origin 的 postMessage |
| **Supabase Key 隔离** | WebView 不持有 Supabase `anon key` 或 `service_role key`，所有 API 调用通过 RN 层中转 |
| **存储加密** | AsyncStorage 在 iOS 上使用 Keychain，Android 上使用 EncryptedSharedPreferences |
| **XSS 防护** | WebView 内 HTML 不允许用户输入直接渲染，所有文本经过转义 |
| **代码注入防护** | `injectedJavaScript` 仅注入可信代码，不接受用户输入 |

```typescript
// RN 端：仅处理来自可信 WebView 的消息
// react-native-webview 自动过滤同源消息，无需额外处理
const handleMessage = useCallback((event: WebViewMessageEvent) => {
  // event.nativeEvent.data 来自加载的 HTML 页面
  // react-native-webview 已确保消息来自正确的 origin
  const message = JSON.parse(event.nativeEvent.data);
  // ... 处理
}, []);
```

---

## 7. 开发调试

### 7.1 WebView 调试

```typescript
// 开发环境启用 WebView 调试
<WebView
  ref={webViewRef}
  source={{ uri: "http://localhost:8081/game/index.html" }}
  // 仅在开发模式启用
  javaScriptEnabled={true}
  domStorageEnabled={true}
  // iOS: Safari Web Inspector
  // Android: Chrome DevTools (chrome://inspect)
  webviewDebuggingEnabled={__DEV__}
  onMessage={handleMessage}
/>
```

### 7.2 消息日志

```typescript
// 开发模式下打印所有 Bridge 消息
if (__DEV__) {
  const originalPostMessage = window.ReactNativeWebView?.postMessage;
  if (originalPostMessage) {
    // @ts-ignore
    window.ReactNativeWebView.postMessage = (msg: string) => {
      console.log("[Bridge] GAME → NATIVE:", JSON.parse(msg).type);
      originalPostMessage.call(window.ReactNativeWebView, msg);
    };
  }
}
```

---

*文档结束 · Boba Dash WebView Bridge 设计 v1.0 · 程基岩 · 2026-08-10*
