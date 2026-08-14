/**
 * Boba Dash — Social Screen
 *
 * Shows friend list + social actions (Taste Test, Cover Shift)
 * Requires authentication. Shows "sign in" prompt in offline mode.
 */

import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  Alert, RefreshControl, Platform,
} from 'react-native';
import { hybridStorage } from '../../shared/storage';
import { TASTE_TEST_CONFIG, HELP_CONFIG } from '../../shared/social-config';
import { NativeLeaderboardService } from '../services/native-leaderboard';
import { SocialShareService } from '../services/social-share';
import type { FriendInfo, SaveData } from '../../shared/types';

export function SocialScreen() {
  const [isOnline, setIsOnline] = useState(false);
  const [friends, setFriends] = useState<FriendInfo[]>([]);
  const [saveData, setSaveData] = useState<SaveData | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [nativeAvailable, setNativeAvailable] = useState(false);
  const [tasteTestsUsed, setTasteTestsUsed] = useState(0);
  const [helpsUsed, setHelpsUsed] = useState(0);

  const loadData = useCallback(async () => {
    const online = hybridStorage.isOnline();
    setIsOnline(online);
    setNativeAvailable(NativeLeaderboardService.isNativeAvailable());
    const data = await hybridStorage.load();
    setSaveData(data);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, [loadData]);

  const handleTasteTest = (friend: FriendInfo) => {
    Alert.alert(
      'Taste Test',
      `Taste a boba from ${friend.shopName}?\n\nYou'll earn coins, and so will they!`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Taste Test',
          onPress: async () => {
            // TODO: Call Supabase Edge Function 'taste-test'
            // const result = await supabase.functions.invoke('taste-test', {
            //   body: { target_user_id: friend.id }
            // });
            Alert.alert(
              'Taste Test Successful!',
              `You tasted a cup from ${friend.shopName}'s shop!\nBoth of you earned coins!`,
            );
            setTasteTestsUsed(prev => prev + 1);
          },
        },
      ],
    );
  };

  const handleCoverShift = (friend: FriendInfo) => {
    Alert.alert(
      'Cover Shift',
      `Help ${friend.shopName} while they're away?\n\nYou'll earn coins for helping!`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Cover Shift',
          onPress: async () => {
            // TODO: Call Supabase Edge Function 'cover-shift'
            Alert.alert(
              'Cover Shift Complete!',
              `You covered ${friend.shopName}'s shift!\nBoth of you earned coins!`,
            );
            setHelpsUsed(prev => prev + 1);
          },
        },
      ],
    );
  };

  const handleInviteFriends = async () => {
    if (nativeAvailable) {
      await NativeLeaderboardService.showInviteUI();
    } else {
      const inviteCode = saveData?.userId?.slice(0, 6).toUpperCase() || 'XXXXXX';
      const link = SocialShareService.generateInviteLink(inviteCode);
      await SocialShareService.shareText(
        `Join me in Boba Dash! Use my invite code: ${inviteCode}\n${link}`,
      );
    }
  };

  const handleShare = async () => {
    await SocialShareService.showShareDialog(
      undefined,
      `Check out my Boba Dash shop — ${saveData?.shopName || 'My Shop'}! Level ${saveData?.level || 1}, ${saveData?.totalServed || 0} cups served. 🧋`,
    );
  };

  if (!isOnline) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.titleIcon}>👥</Text>
        <Text style={styles.subtitle}>Connect to social features</Text>
        <Text style={styles.description}>
          Sign in to taste test friends' boba, help run their shops, and compete on the leaderboard.
        </Text>
        <Text style={styles.hint}>
          You can still play the game offline! Go to the Profile tab to sign in.
        </Text>
        <TouchableOpacity style={styles.shareBtn} onPress={handleShare}>
          <Text style={styles.shareBtnText}>Share My Shop</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Daily Stats Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Daily Social</Text>
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{tasteTestsUsed}/{TASTE_TEST_CONFIG.dailyMax}</Text>
            <Text style={styles.statLabel}>Taste Test</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{helpsUsed}/{HELP_CONFIG.dailyMax}</Text>
            <Text style={styles.statLabel}>Help</Text>
          </View>
        </View>
        {/* Native platform indicator */}
        {nativeAvailable && (
          <Text style={styles.nativeBadge}>
            {Platform.OS === 'ios' ? 'Game Center' : 'Play Games'} connected
          </Text>
        )}
      </View>

      {/* Friend List */}
      <FlatList
        data={friends}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.friendCard}>
            <Text style={styles.friendAvatar}>🧋</Text>
            <View style={styles.friendInfo}>
              <Text style={styles.friendName}>{item.shopName}</Text>
              <Text style={styles.friendDetail}>
                Lv.{item.level} · Tier {item.tier} {item.isOnline ? '· Online' : ''}
              </Text>
            </View>
            <View style={styles.friendActions}>
              <TouchableOpacity
                style={styles.tasteBtn}
                onPress={() => handleTasteTest(item)}
                disabled={tasteTestsUsed >= TASTE_TEST_CONFIG.dailyMax}
              >
                <Text style={styles.tasteBtnIcon}>🥤</Text>
                <Text style={styles.tasteBtnLabel}>Taste</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.coverBtn}
                onPress={() => handleCoverShift(item)}
                disabled={helpsUsed >= HELP_CONFIG.dailyMax}
              >
                <Text style={styles.coverBtnIcon}>🤝</Text>
                <Text style={styles.coverBtnLabel}>Cover</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>🧋</Text>
            <Text style={styles.emptyText}>No friends yet!</Text>
            <Text style={styles.emptyHint}>
              {nativeAvailable
                ? `Tap "Invite" to add ${Platform.OS === 'ios' ? 'Game Center' : 'Play Games'} friends`
                : 'Share your invite code to add friends'}
            </Text>
          </View>
        }
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />

      {/* Bottom Actions */}
      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.inviteBtn} onPress={handleInviteFriends}>
          <Text style={styles.inviteBtnText}>+ Invite</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.shareBtn} onPress={handleShare}>
          <Text style={styles.shareBtnText}>Share</Text>
        </TouchableOpacity>
      </View>

      {/* Invite Code */}
      <View style={styles.inviteContainer}>
        <Text style={styles.inviteLabel}>Your Invite Code:</Text>
        <Text style={styles.inviteCode}>
          {saveData?.userId?.slice(0, 6).toUpperCase() || 'XXXXXX'}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF8F0' },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 30, backgroundColor: '#FFF8F0' },
  titleIcon: { fontSize: 48, marginBottom: 16 },
  subtitle: { fontSize: 20, fontWeight: '600', color: '#FF6B9D', marginBottom: 12 },
  description: { fontSize: 15, color: '#666', textAlign: 'center', lineHeight: 22, marginBottom: 16 },
  hint: { fontSize: 13, color: '#999', textAlign: 'center' },
  header: { padding: 16, borderBottomWidth: 1, borderBottomColor: '#F0E0E0' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#333', marginBottom: 12 },
  statsRow: { flexDirection: 'row', gap: 12 },
  statBox: { flex: 1, backgroundColor: '#FFF', borderRadius: 12, padding: 12, alignItems: 'center', borderWidth: 1, borderColor: '#F0E0E0' },
  statValue: { fontSize: 20, fontWeight: '700', color: '#FF6B9D' },
  statLabel: { fontSize: 12, color: '#999', marginTop: 4 },
  nativeBadge: { fontSize: 11, color: '#1D9E75', marginTop: 8, textAlign: 'center', fontWeight: '500' },
  listContainer: { padding: 16 },
  friendCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', borderRadius: 12, padding: 12, marginBottom: 8, borderWidth: 1, borderColor: '#F0E0E0' },
  friendAvatar: { fontSize: 36 },
  friendInfo: { flex: 1, marginLeft: 12 },
  friendName: { fontSize: 16, fontWeight: '600', color: '#333' },
  friendDetail: { fontSize: 12, color: '#999', marginTop: 2 },
  friendActions: { flexDirection: 'row', gap: 8 },
  tasteBtn: { width: 56, height: 48, borderRadius: 12, backgroundColor: '#FFF0F5', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#FF6B9D' },
  tasteBtnIcon: { fontSize: 18 },
  tasteBtnLabel: { fontSize: 10, color: '#FF6B9D', fontWeight: '600', marginTop: 2 },
  coverBtn: { width: 56, height: 48, borderRadius: 12, backgroundColor: '#F0FFF8', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#1D9E75' },
  coverBtnIcon: { fontSize: 18 },
  coverBtnLabel: { fontSize: 10, color: '#1D9E75', fontWeight: '600', marginTop: 2 },
  emptyContainer: { alignItems: 'center', paddingVertical: 60 },
  emptyIcon: { fontSize: 48, marginBottom: 16 },
  emptyText: { fontSize: 16, color: '#999', marginBottom: 8 },
  emptyHint: { fontSize: 13, color: '#CCC', textAlign: 'center', paddingHorizontal: 40 },
  bottomBar: { flexDirection: 'row', padding: 12, gap: 12, borderTopWidth: 1, borderTopColor: '#F0E0E0' },
  inviteBtn: { flex: 1, height: 44, borderRadius: 22, backgroundColor: '#FF6B9D', justifyContent: 'center', alignItems: 'center' },
  inviteBtnText: { color: '#FFF', fontSize: 15, fontWeight: '600' },
  shareBtn: { flex: 1, height: 44, borderRadius: 22, backgroundColor: '#FFF', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#FF6B9D' },
  shareBtnText: { color: '#FF6B9D', fontSize: 15, fontWeight: '600' },
  inviteContainer: { padding: 16, borderTopWidth: 1, borderTopColor: '#F0E0E0', alignItems: 'center' },
  inviteLabel: { fontSize: 12, color: '#999' },
  inviteCode: { fontSize: 24, fontWeight: '700', color: '#FF6B9D', letterSpacing: 4, marginTop: 4 },
});
