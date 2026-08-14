/**
 * Boba Dash — Profile Screen
 *
 * Shows player stats + auth status.
 * In offline mode: shows "Sign In" button.
 * In online mode: shows shop name, friend count, sign out.
 */

import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { hybridStorage, authStore } from '../../shared/storage';
import { signInWithGoogle, signOut } from '../services/auth';
import type { AuthState, SaveData } from '../../shared/types';

export function ProfileScreen() {
  const [authState, setAuthState] = useState<AuthState | null>(null);
  const [saveData, setSaveData] = useState<SaveData | null>(null);

  useEffect(() => {
    (async () => {
      const auth = await authStore.load();
      setAuthState(auth);
      const data = await hybridStorage.load();
      setSaveData(data);
    })();
  }, []);

  const handleSignIn = async () => {
    const result = await signInWithGoogle(saveData?.shopName || 'New Boba Shop');
    if (!result.success) {
      Alert.alert('Sign In Failed', result.error || 'Unknown error');
    } else {
      // Refresh state
      const auth = await authStore.load();
      setAuthState(auth);
    }
  };

  const handleSignOut = async () => {
    Alert.alert('Sign Out?', 'Your local progress will be kept. You can sign back in anytime.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          await signOut();
          const auth = await authStore.load();
          setAuthState(auth);
        },
      },
    ]);
  };

  const isOnline = authState?.isAuthenticated;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.avatar}>🧑</Text>
        <Text style={styles.shopName}>{saveData?.shopName || 'New Boba Shop'}</Text>
        <Text style={styles.status}>
          {isOnline ? `✅ Online · ${authState?.email}` : '🎮 Offline Mode'}
        </Text>
      </View>

      {/* Stats Grid */}
      <View style={styles.statsGrid}>
        <StatCard label="Level" value={saveData?.level?.toString() || '1'} icon="📈" />
        <StatCard label="Tier" value={`T${saveData?.currentTier || 1}`} icon="⭐" />
        <StatCard label="Coins" value={`${saveData?.coins || 0}`} icon="🪙" />
        <StatCard label="Max Combo" value={`${saveData?.maxCombo || 0}`} icon="🔥" />
        <StatCard label="Total Served" value={`${saveData?.totalServed || 0}`} icon="🥤" />
        <StatCard label="Decor Value" value={`${saveData?.decorationValue || 0}`} icon="✨" />
      </View>

      {/* Ingredients */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📦 Ingredients</Text>
        <View style={styles.ingredientRow}>
          {Object.entries(saveData?.ingredients || {}).map(([key, val]) => (
            <View key={key} style={styles.ingredientChip}>
              <Text style={styles.ingredientName}>{key.replace('_', ' ')}</Text>
              <Text style={styles.ingredientCount}>{val}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Auth Section */}
      <View style={styles.section}>
        {isOnline ? (
          <>
            <Text style={styles.sectionTitle}>Account</Text>
            <Text style={styles.emailText}>{authState?.email}</Text>
            <Text style={styles.providerText}>
              Signed in with {authState?.provider === 'apple' ? 'Apple' : 'Google'}
            </Text>
            <TouchableOpacity style={styles.signOutBtn} onPress={handleSignOut}>
              <Text style={styles.signOutBtnText}>Sign Out</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <Text style={styles.sectionTitle}>Connect</Text>
            <Text style={styles.connectDescription}>
              Sign in to unlock social features:
            </Text>
            <Text style={styles.featureList}>
              🥤 Taste Test at friends' shops{'\n'}
              🤝 Help run friends' shops{'\n'}
              🏆 Compete on weekly leaderboard{'\n'}
              📝 Share custom recipes
            </Text>
            <Text style={styles.offlineNote}>
              You can play the full game offline. Social features are optional.
            </Text>
            <TouchableOpacity style={styles.signInBtn} onPress={handleSignIn}>
              <Text style={styles.signInBtnText}>Sign In with Google</Text>
            </TouchableOpacity>
          </>
        )}
      </View>

      {/* Version */}
      <Text style={styles.version}>Boba Dash v{process.env.EXPO_PUBLIC_GAME_VERSION || '0.1.0'}</Text>
    </ScrollView>
  );
}

function StatCard({ label, value, icon }: { label: string; value: string; icon: string }) {
  return (
    <View style={styles.statCard}>
      <Text style={styles.statIcon}>{icon}</Text>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF8F0' },
  content: { padding: 16, paddingBottom: 40 },
  header: { alignItems: 'center', paddingVertical: 24 },
  avatar: { fontSize: 64 },
  shopName: { fontSize: 24, fontWeight: '700', color: '#333', marginTop: 8 },
  status: { fontSize: 13, color: '#999', marginTop: 4 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  statCard: { width: '31%', backgroundColor: '#FFF', borderRadius: 12, padding: 12, alignItems: 'center', borderWidth: 1, borderColor: '#F0E0E0' },
  statIcon: { fontSize: 24 },
  statValue: { fontSize: 22, fontWeight: '700', color: '#FF6B9D', marginTop: 4 },
  statLabel: { fontSize: 11, color: '#999', marginTop: 2 },
  section: { marginTop: 24 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#333', marginBottom: 12 },
  ingredientRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  ingredientChip: { backgroundColor: '#FFF', borderRadius: 8, padding: 8, paddingHorizontal: 12, borderWidth: 1, borderColor: '#F0E0E0' },
  ingredientName: { fontSize: 12, color: '#666', textTransform: 'capitalize' },
  ingredientCount: { fontSize: 16, fontWeight: '700', color: '#333' },
  emailText: { fontSize: 14, color: '#666', marginBottom: 4 },
  providerText: { fontSize: 12, color: '#999', marginBottom: 16 },
  connectDescription: { fontSize: 14, color: '#666', marginBottom: 12 },
  featureList: { fontSize: 14, color: '#333', lineHeight: 24, marginBottom: 16 },
  offlineNote: { fontSize: 12, color: '#999', fontStyle: 'italic', marginBottom: 16 },
  signInBtn: { backgroundColor: '#FF6B9D', borderRadius: 12, paddingVertical: 14, alignItems: 'center' },
  signInBtnText: { color: '#FFF', fontSize: 16, fontWeight: '600' },
  signOutBtn: { backgroundColor: '#FFF', borderRadius: 12, paddingVertical: 14, alignItems: 'center', borderWidth: 1, borderColor: '#FF6B9D' },
  signOutBtnText: { color: '#FF6B9D', fontSize: 16, fontWeight: '600' },
  version: { textAlign: 'center', fontSize: 11, color: '#CCC', marginTop: 32 },
});
