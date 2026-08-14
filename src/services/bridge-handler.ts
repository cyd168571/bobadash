/**
 * Boba Dash — WebView Bridge Handler
 *
 * Receives messages from the H5 game (inside WebView) and dispatches
 * to native services: storage, auth, social, IAP, haptics.
 *
 * Communication protocol:
 * - WebView → RN: window.ReactNativeWebView.postMessage(JSON.stringify(BridgeMessage))
 * - RN → WebView: webViewRef.current.injectJavaScript(`window.bridge.onMessage(${JSON.stringify(msg)})`)
 */

import { hybridStorage } from '@shared/storage';
import type { BridgeMessage, SaveData } from '@shared/types';
import * as Haptics from 'expo-haptics';

// ============================================================
// Types
// ============================================================

export type BridgeResponseCallback = (message: BridgeMessage) => void;

// ============================================================
// Bridge Handler
// ============================================================

export class BridgeHandler {
  private sendToWebView: ((message: BridgeMessage) => void) | null = null;

  /**
   * Set the callback to send messages to the WebView
   */
  setSender(sender: (message: BridgeMessage) => void): void {
    this.sendToWebView = sender;
  }

  /**
   * Handle incoming message from WebView
   */
  async handleMessage(message: BridgeMessage): Promise<void> {
    console.log(`[Bridge] ← ${message.type}`, message.payload);

    try {
      switch (message.type) {
        case 'GAME_READY':
          await this.handleGameReady(message);
          break;

        case 'GAME_SAVE':
          await this.handleSave(message);
          break;

        case 'GAME_LOAD':
          await this.handleLoad(message);
          break;

        case 'GAME_HAPTIC':
          await this.handleHaptic(message);
          break;

        case 'GAME_SOCIAL_ACTION':
          await this.handleSocialAction(message);
          break;

        case 'GAME_IAP':
          await this.handleIAP(message);
          break;

        case 'GAME_AUTH':
          await this.handleAuth(message);
          break;

        case 'GAME_LOG':
          console.log('[Bridge] Game log:', message.payload);
          break;

        default:
          console.warn(`[Bridge] Unknown message type: ${message.type}`);
      }
    } catch (e) {
      console.error(`[Bridge] Error handling ${message.type}:`, e);
      this.sendToWebView?.({
        id: message.id,
        type: 'NATIVE_ERROR',
        payload: { error: String(e), originalType: message.type },
        timestamp: Date.now(),
      });
    }
  }

  // ============================================================
  // Handlers
  // ============================================================

  private async handleGameReady(message: BridgeMessage): Promise<void> {
    // Send current config + save data to the game
    const saveData = await hybridStorage.load();
    const isOnline = hybridStorage.isOnline();

    this.sendToWebView?.({
      id: message.id,
      type: 'NATIVE_CONFIG',
      payload: {
        saveData,
        isOnline,
        version: process.env.EXPO_PUBLIC_GAME_VERSION || '0.1.0',
      },
      timestamp: Date.now(),
    });
  }

  private async handleSave(message: BridgeMessage): Promise<void> {
    const { data, syncToCloud } = message.payload as { data: Partial<SaveData>; syncToCloud?: boolean };

    await hybridStorage.save({ ...(await hybridStorage.load()), ...data } as SaveData);

    this.sendToWebView?.({
      id: message.id,
      type: 'NATIVE_SAVE_RESULT',
      payload: { success: true, synced: hybridStorage.isOnline() },
      timestamp: Date.now(),
    });
  }

  private async handleLoad(message: BridgeMessage): Promise<void> {
    const data = await hybridStorage.load();

    this.sendToWebView?.({
      id: message.id,
      type: 'NATIVE_LOAD_DATA',
      payload: { saveData: data, isOnline: hybridStorage.isOnline() },
      timestamp: Date.now(),
    });
  }

  private async handleHaptic(message: BridgeMessage): Promise<void> {
    const { style } = message.payload as { style: 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error' };

    const hapticMap = {
      light: Haptics.ImpactFeedbackStyle.Light,
      medium: Haptics.ImpactFeedbackStyle.Medium,
      heavy: Haptics.ImpactFeedbackStyle.Heavy,
    };

    if (style in hapticMap) {
      await Haptics.impactAsync(hapticMap[style as keyof typeof hapticMap]);
    } else if (style === 'success' || style === 'warning' || style === 'error') {
      await Haptics.notificationAsync(
        style === 'success'
          ? Haptics.NotificationFeedbackType.Success
          : style === 'warning'
            ? Haptics.NotificationFeedbackType.Warning
            : Haptics.NotificationFeedbackType.Error,
      );
    }
  }

  private async handleSocialAction(message: BridgeMessage): Promise<void> {
    // Social actions require online mode
    if (!hybridStorage.isOnline()) {
      this.sendToWebView?.({
        id: message.id,
        type: 'NATIVE_SOCIAL_RESULT',
        payload: { success: false, error: 'OFFLINE_MODE' },
        timestamp: Date.now(),
      });
      return;
    }

    // TODO: Call Supabase Edge Functions for social actions
    // For now, return not implemented
    this.sendToWebView?.({
      id: message.id,
      type: 'NATIVE_SOCIAL_RESULT',
      payload: { success: false, error: 'NOT_IMPLEMENTED' },
      timestamp: Date.now(),
    });
  }

  private async handleIAP(message: BridgeMessage): Promise<void> {
    // TODO: Integrate RevenueCat
    const { productId } = message.payload as { productId: string };
    console.log(`[Bridge] IAP request for ${productId} (not yet integrated)`);

    this.sendToWebView?.({
      id: message.id,
      type: 'NATIVE_IAP_RESULT',
      payload: { success: false, error: 'IAP_NOT_CONFIGURED' },
      timestamp: Date.now(),
    });
  }

  private async handleAuth(message: BridgeMessage): Promise<void> {
    // Auth is handled at the RN screen level, not in the bridge
    // The game can request auth status though
    const isOnline = hybridStorage.isOnline();

    this.sendToWebView?.({
      id: message.id,
      type: 'NATIVE_AUTH_RESULT',
      payload: { authenticated: isOnline, isOnline },
      timestamp: Date.now(),
    });
  }

  // ============================================================
  // Push messages to WebView (RN → WebView)
  // ============================================================

  /**
   * Notify the game that auth state changed
   */
  notifyAuthChange(isOnline: boolean): void {
    this.sendToWebView?.({
      id: `auth_${Date.now()}`,
      type: 'NATIVE_AUTH_RESULT',
      payload: { authenticated: isOnline, isOnline },
      timestamp: Date.now(),
    });
  }
}

// ============================================================
// Singleton
// ============================================================

export const bridgeHandler = new BridgeHandler();
