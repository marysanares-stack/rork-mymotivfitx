import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Stack } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Trophy, Medal } from 'lucide-react-native';
import { Image } from 'expo-image';
import Colors from '@/constants/colors';
import { LeaderboardPeriod, LeaderboardMetric, LeaderboardEntry } from '@/types';
import { useSocial } from '@/contexts/SocialContext';

const METRICS = [
  { value: 'steps' as LeaderboardMetric, label: 'Steps', icon: '👣', color: Colors.blue },
  { value: 'calories' as LeaderboardMetric, label: 'Calories', icon: '🔥', color: Colors.orange },
  { value: 'distance' as LeaderboardMetric, label: 'Distance', icon: '📍', color: Colors.green },
  { value: 'active_minutes' as LeaderboardMetric, label: 'Active Minutes', icon: '⏱️', color: Colors.purple },
  { value: 'workouts' as LeaderboardMetric, label: 'Workouts', icon: '💪', color: Colors.primary },
];

const PERIODS = [
  { value: 'weekly' as LeaderboardPeriod, label: 'Weekly' },
  { value: 'monthly' as LeaderboardPeriod, label: 'Monthly' },
  { value: 'all-time' as LeaderboardPeriod, label: 'All Time' },
];

export default function LeaderboardsScreen() {
  const { getLeaderboard, user } = useSocial();
  const [selectedPeriod, setSelectedPeriod] = useState<LeaderboardPeriod>('weekly');
  const [selectedMetric, setSelectedMetric] = useState<LeaderboardMetric>('steps');

  const leaderboard = getLeaderboard(selectedMetric, selectedPeriod);
  const currentMetric = METRICS.find(m => m.value === selectedMetric);
  const userRank = leaderboard.find(e => e.userId === user.id);

  const getUnitLabel = (metric: LeaderboardMetric): string => {
    switch (metric) {
      case 'steps':
        return 'steps';
      case 'calories':
        return 'cal';
      case 'distance':
        return 'km';
      case 'active_minutes':
        return 'min';
      case 'workouts':
        return 'workouts';
      default:
        return '';
    }
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return '🥇';
      case 2:
        return '🥈';
      case 3:
        return '🥉';
      default:
        return null;
    }
  };

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1:
        return '#FFD700';
      case 2:
        return '#C0C0C0';
      case 3:
        return '#CD7F32';
      default:
        return Colors.textSecondary;
    }
  };

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          headerShown: true,
          title: 'Leaderboards',
          headerStyle: { backgroundColor: Colors.surface },
          headerTintColor: Colors.text,
          headerShadowVisible: false,
        }}
      />
      
      <LinearGradient
        colors={[Colors.background, Colors.surface]}
        style={StyleSheet.absoluteFillObject}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerSection}>
          <Text style={styles.headerTitle}>Compete with friends</Text>
          <Text style={styles.headerSubtitle}>
            See who&apos;s leading the pack this {selectedPeriod === 'all-time' ? 'year' : selectedPeriod.slice(0, -2)}
          </Text>
        </View>

        <View style={styles.periodSelector}>
          {PERIODS.map((period) => (
            <TouchableOpacity
              key={period.value}
              style={[
                styles.periodButton,
                selectedPeriod === period.value && styles.periodButtonActive,
              ]}
              onPress={() => setSelectedPeriod(period.value)}
            >
              <Text
                style={[
                  styles.periodButtonText,
                  selectedPeriod === period.value && styles.periodButtonTextActive,
                ]}
              >
                {period.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.metricsList}
          style={styles.metricsScroll}
        >
          {METRICS.map((metric) => (
            <TouchableOpacity
              key={metric.value}
              style={[
                styles.metricCard,
                selectedMetric === metric.value && styles.metricCardActive,
                { borderColor: metric.color },
              ]}
              onPress={() => setSelectedMetric(metric.value)}
            >
              <Text style={styles.metricIcon}>{metric.icon}</Text>
              <Text
                style={[
                  styles.metricLabel,
                  selectedMetric === metric.value && { color: metric.color },
                ]}
              >
                {metric.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {userRank && (
          <View style={styles.userRankCard}>
            <LinearGradient
              colors={[currentMetric?.color || Colors.primary, Colors.accent]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.userRankGradient}
            >
              <View style={styles.userRankContent}>
                <View style={styles.userRankLeft}>
                  <Text style={styles.userRankLabel}>Your Rank</Text>
                  <View style={styles.userRankInfo}>
                    <Text style={styles.userRankNumber}>#{userRank.rank}</Text>
                    <Text style={styles.userRankValue}>
                      {userRank.value.toLocaleString()} {getUnitLabel(selectedMetric)}
                    </Text>
                  </View>
                </View>
                {getRankIcon(userRank.rank) && (
                  <Text style={styles.userRankMedal}>{getRankIcon(userRank.rank)}</Text>
                )}
              </View>
            </LinearGradient>
          </View>
        )}

        <View style={styles.leaderboardSection}>
          <View style={styles.sectionHeader}>
            <Trophy size={20} color={Colors.primary} />
            <Text style={styles.sectionTitle}>Rankings</Text>
          </View>

          {leaderboard.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyEmoji}>📊</Text>
              <Text style={styles.emptyTitle}>No data yet</Text>
              <Text style={styles.emptyText}>
                Complete some activities to see the leaderboard!
              </Text>
            </View>
          ) : (
            leaderboard.map((entry: LeaderboardEntry, index: number) => {
              const isUser = entry.userId === user.id;
              const rankIcon = getRankIcon(entry.rank);
              const rankColor = getRankColor(entry.rank);

              return (
                <View
                  key={entry.userId}
                  style={[
                    styles.leaderboardItem,
                    isUser && styles.leaderboardItemUser,
                    entry.rank <= 3 && styles.leaderboardItemTop,
                  ]}
                >
                  <View style={styles.leaderboardRank}>
                    {rankIcon ? (
                      <Text style={styles.leaderboardRankMedal}>{rankIcon}</Text>
                    ) : (
                      <Text style={[styles.leaderboardRankNumber, { color: rankColor }]}>
                        {entry.rank}
                      </Text>
                    )}
                  </View>

                  <View style={styles.leaderboardAvatar}>
                    {entry.userAvatar && (entry.userAvatar.startsWith('http') || entry.userAvatar.startsWith('data:')) ? (
                      <Image
                        source={{ uri: entry.userAvatar }}
                        style={styles.leaderboardAvatarImage}
                        contentFit="cover"
                      />
                    ) : (
                      <Text style={styles.leaderboardAvatarText}>{entry.userAvatar}</Text>
                    )}
                  </View>

                  <View style={styles.leaderboardInfo}>
                    <Text style={styles.leaderboardName}>
                      {entry.userName}
                      {isUser && ' (You)'}
                    </Text>
                    <Text style={styles.leaderboardValue}>
                      {entry.value.toLocaleString()} {getUnitLabel(selectedMetric)}
                    </Text>
                  </View>

                  {entry.rank <= 3 && (
                    <Medal size={20} color={rankColor} />
                  )}
                </View>
              );
            })
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  headerSection: {
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700' as const,
    color: Colors.text,
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    lineHeight: 22,
  },
  periodSelector: {
    flexDirection: 'row',
    backgroundColor: Colors.cardBg,
    borderRadius: 12,
    padding: 4,
    marginBottom: 20,
  },
  periodButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  periodButtonActive: {
    backgroundColor: Colors.primary,
  },
  periodButtonText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.textSecondary,
  },
  periodButtonTextActive: {
    color: '#fff',
  },
  metricsScroll: {
    marginBottom: 20,
  },
  metricsList: {
    gap: 12,
  },
  metricCard: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: Colors.cardBg,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.border,
    alignItems: 'center',
    gap: 6,
    minWidth: 120,
  },
  metricCardActive: {
    backgroundColor: Colors.surfaceLight,
    borderWidth: 2,
  },
  metricIcon: {
    fontSize: 24,
  },
  metricLabel: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: Colors.textSecondary,
  },
  userRankCard: {
    marginBottom: 24,
    borderRadius: 16,
    overflow: 'hidden',
  },
  userRankGradient: {
    padding: 20,
  },
  userRankContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  userRankLeft: {
    flex: 1,
  },
  userRankLabel: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 8,
  },
  userRankInfo: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 12,
  },
  userRankNumber: {
    fontSize: 32,
    fontWeight: '700' as const,
    color: '#fff',
  },
  userRankValue: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#fff',
  },
  userRankMedal: {
    fontSize: 48,
  },
  leaderboardSection: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  leaderboardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: Colors.cardBg,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  leaderboardItemUser: {
    backgroundColor: Colors.primary + '10',
    borderColor: Colors.primary,
  },
  leaderboardItemTop: {
    borderWidth: 2,
  },
  leaderboardRank: {
    width: 40,
    alignItems: 'center',
    marginRight: 12,
  },
  leaderboardRankMedal: {
    fontSize: 28,
  },
  leaderboardRankNumber: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.textSecondary,
  },
  leaderboardAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.surfaceLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  leaderboardAvatarText: {
    fontSize: 24,
  },
  leaderboardAvatarImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  leaderboardInfo: {
    flex: 1,
  },
  leaderboardName: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.text,
    marginBottom: 4,
  },
  leaderboardValue: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: Colors.text,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: 40,
    lineHeight: 20,
  },
});
