/**
 * Boba Dash — Leaderboard Screen
 *
 * v2.0 Changes (2026-08-11):
 *   - Added native leaderboard integration (Game Center / Play Games)
 *   - "View on Game Center / Play Games" button to open native leaderboard UI
 *   - Fallback: in-app Supabase friend circle rankings
 *
 * 3 categories: Weekly Income / Max Combo / Decoration Value
 * Shows friend circle rankings (top 20)
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  Platform, RefreshControl,
} from 'react-native';
import { hybridStorage } from '../../shared/storage';
import { LEADERBOARD_CONFIG } from '../../shared/social-config';
import { NativeLeaderboardService } from '../services/native-leaderboard';
import type { LeaderboardEntry, LeaderboardCategory } from '../../shared/types';

const CATEGORIES: { key: LeaderboardCategory; label: string; icon: string }[] = [
  { key: 'income', label: 'Income', icon: '💰' },
  { key: 'combo', label: 'Combo', icon: '🔥' },
  { key: 'decoration', label: 'Decor', icon: '✨' },
];

export function LeaderboardScreen() {
  const [activeCategory, setActiveCategory] = useState<LeaderboardCategory>('income');
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [isOnline, setIsOnline] = useState(false);
  const [nativeAvailable, setNativeAvailable] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    setIsOnline(hybridStorage.isOnline());
    setNativeAvailable(NativeLeaderboardService.isNativeAvailable());
  }, []);

  const loadRankings = useCallback(async () => {
    if (!isOnline) return;
    setRefreshing(true);
    try {
      // Get friend circle rankings from Supabase (cross-platform)
      const data = await NativeLeaderboardService.getFriendRankings(activeCategory);
      setEntries(data);
    } catch (e) {
      console.error('[Leaderboard] loadRankings failed:', e);
    }
    setRefreshing(false);
  }, [isOnline, activeCategory]);

  useEffect(() => {
    loadRankings();
  }, [loadRankings]);

  const getMedal = (rank: number) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `${rank}`;
  };

  const handleShowNativeLeaderboard = async () => {
    await NativeLeaderboardService.showLeaderboard(activeCategory);
  };

  return (
    <View style={styles.container}>
      {/* Category Tabs */}
      <View style={styles.tabBar}>
        {CATEGORIES.map((cat) => (
          <TouchableOpacity
            key={cat.key}
            style={[styles.tab, activeCategory === cat.key && styles.tabActive]}
            onPress={() => setActiveCategory(cat.key)}
          >
            <Text style={[styles.tabIcon, activeCategory === cat.key && styles.tabIconActive]}>
              {cat.icon}
            </Text>
            <Text style={[styles.tabLabel, activeCategory === cat.key && styles.tabLabelActive]}>
              {cat.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Reset Info */}
      <Text style={styles.resetInfo}>
        Resets every Monday · Next reset in {getDaysUntilMonday()} days
      </Text>

      {/* Native Leaderboard Button */}
      {nativeAvailable && isOnline && (
        <TouchableOpacity
          style={styles.nativeBtn}
          onPress={handleShowNativeLeaderboard}
        >
          <Text style={styles.nativeBtnText}>
            View on {Platform.OS === 'ios' ? 'Game Center' : 'Play Games'} →
          </Text>
        </TouchableOpacity>
      )}

      {/* Leaderboard List */}
      <FlatList
        data={entries}
        keyExtractor={(item) => item.userId}
        renderItem={({ item }) => (
          <View style={[styles.rankCard, item.rank <= 3 && styles.rankCardTop]}>
            <Text style={styles.rankNumber}>{getMedal(item.rank)}</Text>
            <Text style={styles.rankAvatar}>🧋</Text>
            <View style={styles.rankInfo}>
              <Text style={styles.rankName}>{item.shopName}</Text>
              <Text style={styles.rankValue}>
                {activeCategory === 'income' ? `$${item.value}` : item.value}
              </Text>
            </View>
            {item.prevRank && item.prevRank > item.rank && (
              <Text style={styles.rankUp}>▲{item.prevRank - item.rank}</Text>
            )}
            {item.prevRank && item.prevRank < item.rank && (
              <Text style={styles.rankDown}>▼{item.rank - item.prevRank}</Text>
            )}
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>🏆</Text>
            <Text style={styles.emptyText}>
              {isOnline ? 'No rankings yet this week' : 'Sign in to see rankings'}
            </Text>
            <Text style={styles.emptyHint}>
              Play more to climb the leaderboard!
            </Text>
          </View>
        }
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={loadRankings} />
        }
      />
    </View>
  );
}

function getDaysUntilMonday(): number {
  const now = new Date();
  const day = now.getDay() || 7;
  const daysUntil = (8 - day) % 7 || 7;
  return daysUntil;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF8F0' },
  tabBar: { flexDirection: 'row', padding: 8, gap: 8 },
  tab: { flex: 1, paddingVertical: 10, borderRadius: 12, backgroundColor: '#FFF', alignItems: 'center', borderWidth: 1, borderColor: '#F0E0E0' },
  tabActive: { backgroundColor: '#FF6B9D', borderColor: '#FF6B9D' },
  tabIcon: { fontSize: 20 },
  tabIconActive: { opacity: 1 },
  tabLabel: { fontSize: 12, color: '#999', marginTop: 2 },
  tabLabelActive: { color: '#FFF', fontWeight: '600' },
  resetInfo: { textAlign: 'center', fontSize: 11, color: '#CCC', paddingVertical: 8 },
  nativeBtn: { marginHorizontal: 16, marginBottom: 8, paddingVertical: 10, borderRadius: 10, backgroundColor: '#F0FFF8', alignItems: 'center', borderWidth: 1, borderColor: '#1D9E75' },
  nativeBtnText: { fontSize: 14, color: '#1D9E75', fontWeight: '600' },
  listContainer: { padding: 16 },
  rankCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', borderRadius: 12, padding: 14, marginBottom: 8, borderWidth: 1, borderColor: '#F0E0E0' },
  rankCardTop: { borderColor: '#FFD700', backgroundColor: '#FFFAF0' },
  rankNumber: { fontSize: 24, width: 40, textAlign: 'center', fontWeight: '700', color: '#FF6B9D' },
  rankAvatar: { fontSize: 32, marginLeft: 8 },
  rankInfo: { flex: 1, marginLeft: 12 },
  rankName: { fontSize: 16, fontWeight: '600', color: '#333' },
  rankValue: { fontSize: 14, color: '#FF6B9D', fontWeight: '600', marginTop: 2 },
  rankUp: { fontSize: 12, color: '#1D9E75', fontWeight: '600' },
  rankDown: { fontSize: 12, color: '#FF6B9D', fontWeight: '600' },
  emptyContainer: { alignItems: 'center', paddingVertical: 80 },
  emptyIcon: { fontSize: 48, marginBottom: 16 },
  emptyText: { fontSize: 16, color: '#999', marginBottom: 8 },
  emptyHint: { fontSize: 13, color: '#CCC' },
});
