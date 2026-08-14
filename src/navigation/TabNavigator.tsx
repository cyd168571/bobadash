/**
 * Boba Dash — Bottom Tab Navigator
 *
 * 5 tabs: Game | Social | Leaderboard | Profile
 * (Title screen is shown as a modal overlay on first launch)
 */

import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text, StyleSheet } from 'react-native';

import { GameScreen } from '../screens/GameScreen';
import { SocialScreen } from '../screens/SocialScreen';
import { LeaderboardScreen } from '../screens/LeaderboardScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import type { AuthState } from '../../shared/types';

export type TabParamList = {
  Game: undefined;
  Social: undefined;
  Leaderboard: undefined;
  Profile: undefined;
};

const Tab = createBottomTabNavigator<TabParamList>();

function TabIcon({ name, color }: { name: string; color: string }) {
  return <Text style={[styles.icon, { color }]}>{name}</Text>;
}

export function TabNavigator({ authState }: { authState: AuthState }) {
  const isOnline = authState.isAuthenticated;

  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#FF6B9D',
        tabBarInactiveTintColor: '#999',
        tabBarStyle: {
          paddingBottom: 5,
          paddingTop: 5,
          height: 60,
        },
        headerShown: false,
      }}
    >
      <Tab.Screen
        name="Game"
        component={GameScreen}
        options={{
          tabBarIcon: ({ color }) => <TabIcon name="🎮" color={color} />,
          tabBarLabel: 'Play',
        }}
      />
      <Tab.Screen
        name="Social"
        component={SocialScreen}
        options={{
          tabBarIcon: ({ color }) => <TabIcon name="👥" color={color} />,
          tabBarLabel: isOnline ? 'Friends' : 'Offline',
        }}
      />
      <Tab.Screen
        name="Leaderboard"
        component={LeaderboardScreen}
        options={{
          tabBarIcon: ({ color }) => <TabIcon name="🏆" color={color} />,
          tabBarLabel: 'Ranks',
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ color }) => <TabIcon name="👤" color={color} />,
          tabBarLabel: isOnline ? 'Profile' : 'Sign In',
        }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  icon: {
    fontSize: 24,
  },
});
