/**
 * Boba Dash — Game Screen (WebView Container)
 *
 * This is the core screen: renders the H5 game inside a WebView,
 * and bridges all native functionality (storage, auth, social, IAP, haptics).
 *
 * The game runs entirely in the WebView — even offline.
 * The RN shell only handles native APIs that WebView can't access.
 */

import React, { useRef, useEffect, useState } from 'react';
import { View, StyleSheet, ActivityIndicator, Text } from 'react-native';
import { WebView, type WebViewMessageEvent } from 'react-native-webview';
import { Asset } from 'expo-asset';

import { bridgeHandler } from '../services/bridge-handler';
import type { BridgeMessage } from '../../shared/types';

const GAME_HTML = require('../../webview-game/index.html');

export function GameScreen() {
  const webViewRef = useRef<WebView>(null);
  const [gameUri, setGameUri] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load the H5 game asset
  useEffect(() => {
    (async () => {
      try {
        const asset = Asset.fromModule(GAME_HTML);
        await asset.downloadAsync();
        setGameUri(asset.localUri || asset.uri);
      } catch (e) {
        console.error('[GameScreen] Failed to load game asset:', e);
        // Fallback: load from dev server
        setGameUri('http://localhost:8081/webview-game/index.html');
      }
    })();
  }, []);

  // Set up the bridge sender (RN → WebView)
  useEffect(() => {
    bridgeHandler.setSender((message: BridgeMessage) => {
      const js = `window.bridge && window.bridge.onMessage(${JSON.stringify(message)});`;
      webViewRef.current?.injectJavaScript(js);
    });
  }, []);

  // Handle messages from WebView
  const onMessage = (event: WebViewMessageEvent) => {
    try {
      const message: BridgeMessage = JSON.parse(event.nativeEvent.data);
      bridgeHandler.handleMessage(message);
    } catch (e) {
      console.error('[GameScreen] Failed to parse bridge message:', e);
    }
  };

  if (!gameUri) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF6B9D" />
        <Text style={styles.loadingText}>Loading game...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <WebView
        ref={webViewRef}
        source={{ uri: gameUri }}
        onMessage={onMessage}
        onLoadEnd={() => setIsLoading(false)}
        style={styles.webview}
        // Performance: enable JS, allow local storage
        javaScriptEnabled={true}
        domStorageEnabled={true}
        allowFileAccess={true}
        allowFileAccessFromFileURLs={true}
        allowUniversalAccessFromFileURLs={true}
        // Disable zoom (game handles its own layout)
        scalesPageToFit={false}
        bounces={false}
        scrollEnabled={false}
        // Background color matches game
        backgroundColor="transparent"
        // Hide loading indicator
        renderLoading={() => null}
      />
      {isLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#FF6B9D" />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF8F0',
  },
  webview: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFF8F0',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#FF6B9D',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFF8F0',
  },
});
