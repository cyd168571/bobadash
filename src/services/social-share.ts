/**
 * Boba Dash — Social Share Service
 *
 * Generates and shares "Share Cards" to Instagram Stories, TikTok,
 * and the system share sheet (iMessage, WhatsApp, etc.)
 *
 * Share Card content:
 *   - Shop screenshot (Canvas → toDataURL)
 *   - Player avatar
 *   - Shop name + level + stats
 *   - Custom recipe (if owned)
 *   - "Download Boba Dash" link
 *
 * Dependencies (install in Cursor terminal):
 *   npx expo install expo-sharing expo-media-library expo-file-system
 *
 * Instagram Stories sharing requires:
 *   - iOS: URL Scheme "instagram-stories://share" (no SDK needed)
 *   - Android: Intent-based sharing to Instagram app
 *
 * TikTok sharing requires:
 *   - TikTok SDK for native sharing (optional)
 *   - Or system share sheet → user selects TikTok from list
 *
 * Usage:
 *   import { SocialShareService } from '@/services/social-share';
 *
 *   // Generate share card image from WebView Canvas
 *   const imageData = await SocialShareService.captureWebViewScreenshot(webViewRef);
 *
 *   // Share to Instagram Stories
 *   await SocialShareService.shareToInstagramStories(imageData, 'Check out my boba shop!');
 *
 *   // Share via system share sheet (fallback)
 *   await SocialShareService.shareViaSystemSheet(imageData, 'My Boba Dash Shop');
 */

import { Platform, Share, Alert, Linking } from 'react-native';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as MediaLibrary from 'expo-media-library';

// ============================================================
// Types
// ============================================================

export interface ShareCardData {
  shopName: string;
  level: number;
  totalServed: number;
  totalIncome: number;
  recipeName?: string;
  backgroundImageDataUrl: string; // Canvas → toDataURL
}

export interface ShareOptions {
  message: string;
  imageDataUrl?: string; // Base64 image data URL
}

// ============================================================
// Social Share Service
// ============================================================

export const SocialShareService = {
  /**
   * Share a message (text only) via the system share sheet
   * This opens the native iOS/Android share dialog
   */
  async shareText(message: string): Promise<boolean> {
    try {
      const result = await Share.share({
        message,
        url: undefined,
      });

      if (result.action === Share.sharedAction) {
        console.log('[SocialShare] Shared successfully');
        return true;
      }
      return false;
    } catch (e: any) {
      console.error('[SocialShare] shareText failed:', e);
      return false;
    }
  },

  /**
   * Share an image file via the system share sheet
   * The image can then be shared to any app the user selects
   * (Instagram, TikTok, WhatsApp, iMessage, etc.)
   *
   * @param fileUri - Local file URI of the image (from FileSystem or CameraRoll)
   * @param message - Optional text to accompany the image
   */
  async shareImage(fileUri: string, message?: string): Promise<boolean> {
    try {
      // Check if sharing is available on this device
      const isAvailable = await Sharing.isAvailableAsync();
      if (!isAvailable) {
        Alert.alert('Sharing not available on this device');
        return false;
      }

      await Sharing.shareAsync(fileUri, {
        mimeType: 'image/png',
        dialogTitle: 'Share your Boba Dash shop',
        UTI: 'public.png',
      });

      console.log('[SocialShare] Image shared successfully');
      return true;
    } catch (e: any) {
      console.error('[SocialShare] shareImage failed:', e);
      return false;
    }
  },

  /**
   * Share to Instagram Stories (native deep link)
   * Opens Instagram directly with the image pre-loaded as a Story background
   *
   * iOS: Uses "instagram-stories://share" URL scheme
   * Android: Uses Intent with type "image/*" and package "com.instagram.android"
   *
   * @param imageBase64 - Base64-encoded PNG image data (without "data:image/png;base64," prefix)
   * @param backgroundTopColor - Optional gradient color (hex string like "#FF6B9D")
   * @param backgroundBottomColor - Optional gradient color
   */
  async shareToInstagramStories(
    imageBase64: string,
    attributionLink?: string,
  ): Promise<boolean> {
    try {
      // Save image to a temporary file first
      const fileUri = `${FileSystem.cacheDirectory}boba_share_${Date.now()}.png`;
      await FileSystem.writeAsStringAsync(fileUri, imageBase64, {
        encoding: FileSystem.EncodingType.Base64,
      });

      if (Platform.OS === 'ios') {
        // iOS: Use Instagram Stories URL scheme
        // First copy to clipboard or use file URL
        const instagramUrl = `instagram-stories://share?source_image=${encodeURIComponent(fileUri)}`;
        const canOpen = await Linking.canOpenURL(instagramUrl);

        if (canOpen) {
          await Linking.openURL(instagramUrl);
          console.log('[SocialShare] Opened Instagram Stories on iOS');
          return true;
        } else {
          // Instagram not installed — fall back to system share
          Alert.alert(
            'Instagram not found',
            'Please install Instagram to share to Stories.',
            [{ text: 'OK' }],
          );
          return false;
        }
      } else {
        // Android: Use system share sheet with Instagram package
        // The system share sheet will show Instagram as an option
        return await this.shareImage(fileUri, 'My Boba Dash shop! #bobadash');
      }
    } catch (e: any) {
      console.error('[SocialShare] shareToInstagramStories failed:', e);
      return false;
    }
  },

  /**
   * Share to TikTok
   * TikTok doesn't have a simple URL scheme for stories,
   * so we use the system share sheet. If TikTok is installed,
   * it will appear as a share option.
   *
   * For native TikTok SDK integration (optional, more advanced):
   *   npm install react-native-tiktok-sdk
   *   Configure TikTok App Key at developers.tiktok.com
   *
   * @param fileUri - Local file URI of the image/video
   * @param message - Caption text
   */
  async shareToTikTok(fileUri: string, message?: string): Promise<boolean> {
    // TikTok sharing uses the standard system share sheet
    // If TikTok is installed, it will appear as a destination
    return await this.shareImage(fileUri, message || 'My Boba Dash shop! #bobadash #boba');
  },

  /**
   * Save an image to the device's photo library
   * Used as a fallback when direct sharing fails
   *
   * @param fileUri - Local file URI of the image
   */
  async saveToPhotoLibrary(fileUri: string): Promise<boolean> {
    try {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Please allow photo library access to save your share card.');
        return false;
      }

      const asset = await MediaLibrary.createAssetAsync(fileUri);
      await MediaLibrary.createAlbumAsync('Boba Dash', asset, false);
      console.log('[SocialShare] Saved to photo library');
      return true;
    } catch (e: any) {
      console.error('[SocialShare] saveToPhotoLibrary failed:', e);
      return false;
    }
  },

  /**
   * Generate a share card image from WebView screenshot
   *
   * This sends a "SCREENSHOT" command to the WebView via postMessage,
   * the WebView's game engine captures the Canvas as a data URL,
   * and sends it back via the bridge.
   *
   * @param webViewRef - Reference to the WebView component
   * @returns Base64 image data (without prefix)
   */
  async captureWebViewScreenshot(webViewRef: React.RefObject<any>): Promise<string | null> {
    try {
      // Send message to WebView to capture canvas
      const message = JSON.stringify({
        id: `screenshot_${Date.now()}`,
        type: 'GAME_SHARE',
        payload: { action: 'capture_canvas' },
        timestamp: Date.now(),
      });

      // webViewRef.current?.postMessage(message);
      // TODO: Wait for NATIVE response with canvas data URL

      // Placeholder: return a dummy base64 string
      console.log('[SocialShare] captureWebViewScreenshot — TODO: implement WebView bridge');
      return null;
    } catch (e: any) {
      console.error('[SocialShare] captureWebViewScreenshot failed:', e);
      return null;
    }
  },

  /**
   * Show a share dialog with all available options
   * Lets the user choose: Instagram Stories, TikTok, Save to Photos, More...
   */
  async showShareDialog(
    imageDataUrl?: string,
    message?: string,
  ): Promise<void> {
    if (!imageDataUrl) {
      // Text-only share
      await this.shareText(message || 'Check out Boba Dash! 🧋');
      return;
    }

    // Convert data URL to file
    const base64Data = imageDataUrl.replace(/^data:image\/png;base64,/, '');
    const fileUri = `${FileSystem.cacheDirectory}boba_share_${Date.now()}.png`;
    await FileSystem.writeAsStringAsync(fileUri, base64Data, {
      encoding: FileSystem.EncodingType.Base64,
    });

    Alert.alert(
      'Share your shop',
      'Choose where to share',
      [
        {
          text: 'Instagram Story',
          onPress: () => this.shareToInstagramStories(base64Data),
        },
        {
          text: 'TikTok',
          onPress: () => this.shareToTikTok(fileUri, message),
        },
        {
          text: 'Save to Photos',
          onPress: () => this.saveToPhotoLibrary(fileUri),
        },
        {
          text: 'More...',
          onPress: () => this.shareImage(fileUri, message),
        },
        { text: 'Cancel', style: 'cancel' },
      ],
    );
  },

  /**
   * Generate a deep link for inviting friends
   * Format: https://bobadash.app/invite?code=XXXXXX
   * Or: bobadash://invite?code=XXXXXX (custom URL scheme)
   */
  generateInviteLink(inviteCode: string): string {
    // Use universal links for iOS + App Links for Android
    return `https://bobadash.app/invite?code=${inviteCode}`;
  },
};
