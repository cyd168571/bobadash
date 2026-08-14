/**
 * Boba Dash — App Entry Point
 *
 * Architecture: React Native Shell (Expo) + WebView Canvas Game
 * Mode: Offline-first (playable without auth)
 *       → Optional online auth enables social features
 */

import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as SplashScreen from 'expo-splash-screen';

import { TabNavigator } from './src/navigation/TabNavigator';
import { getAuthState, onAuthStateChange } from './src/services/auth';
import { initCloudSync } from './src/services/supabase-client';
import type { AuthState } from './shared/types';

SplashScreen.preventAutoHideAsync();

export default function App() {
  const [isReady, setIsReady] = useState(false);
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    userId: null,
    email: null,
    shopName: null,
    provider: null,
  });

  useEffect(() => {
    async function bootstrap() {
      try {
        // 1. Check for existing auth session
        const state = await getAuthState();
        setAuthState(state);

        // 2. If authenticated, enable cloud sync
        if (state.isAuthenticated) {
          await initCloudSync();
        }

        // 3. Listen for auth state changes
        const unsubscribe = onAuthStateChange((newState) => {
          setAuthState(newState);
        });

        setIsReady(true);
        SplashScreen.hideAsync();

        return unsubscribe;
      } catch (e) {
        console.error('[App] Bootstrap failed:', e);
        setIsReady(true);
        SplashScreen.hideAsync();
      }
    }
    bootstrap();
  }, []);

  if (!isReady) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <TabNavigator authState={authState} />
    </SafeAreaProvider>
  );
}
