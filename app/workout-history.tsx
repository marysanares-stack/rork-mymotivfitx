import { useMemo, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { Stack } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Activity, Calendar, TrendingUp, Dumbbell, Timer, Zap } from 'lucide-react-native';
import { useFitness } from '@/contexts/FitnessContext';
import Colors from '@/constants/colors';

const { width } = Dimensions.get('window');

type TimeFilter = '7d' | '30d' | '90d' | 'all';

export default function WorkoutHistoryScreen() {
  const insets = useSafeAreaInsets();
  const { recentWorkoutSessions, activities } = useFitness();
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('30d');

  const getFilteredData = () => {
    const now = new Date();
    const cutoff = new Date();
    
    switch (timeFilter) {
      case '7d':
        cutoff.setDate(now.getDate() - 7);
        break;
      case '30d':
        cutoff.setDate(now.getDate() - 30);
        break;
      case '90d':
        cutoff.setDate(now.getDate() - 90);
        break;
      case 'all':
        cutoff.setFullYear(2000);
        break;
    }

    return {
      sessions: recentWorkoutSessions.filter(s => 
        new Date(s.startTime).getTime() >= cutoff.getTime()
      ),
      activities: activities.filter(a => 
        new Date(a.date).getTime() >= cutoff.getTime()
      ),
    };
  };

  const { sessions, activities: filteredActivities } = getFilteredData();

  const stats = useMemo(() => {
    const totalSessions = sessions.length;
    const totalDuration = sessions.reduce((sum, s) => sum + s.duration, 0);
    const totalCalories = sessions.reduce((sum, s) => sum + s.calories, 0);
    
    const avgDuration = totalSessions > 0 ? Math.round(totalDuration / totalSessions) : 0;
    const avgCalories = totalSessions > 0 ? Math.round(totalCalories / totalSessions) : 0;

    const workoutsByPlan: Record<string, number> = {};
    sessions.forEach(s => {
      workoutsByPlan[s.workoutPlanName] = (workoutsByPlan[s.workoutPlanName] || 0) + 1;
    });

    const totalActivities = filteredActivities.length;
    const totalActivityMinutes = filteredActivities.reduce((sum, a) => sum + a.duration, 0);

    const uniqueDays = new Set([
      ...sessions.map(s => s.startTime.split('T')[0]),
      ...filteredActivities.map(a => a.date.split('T')[0]),
    ]).size;

    return {
      totalSessions,
      totalDuration,
      totalCalories,
      avgDuration,
      avgCalories,
      workoutsByPlan,
      totalActivities,
      totalActivityMinutes,
      uniqueDays,
    };
  }, [sessions, filteredActivities]);

  const weeklyData = useMemo(() => {
    const weeks: { week: string; sessions: number; duration: number; calories: number }[] = [];
    const now = new Date();
    
    for (let i = 0; i < 12; i++) {
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - (i * 7));
      weekStart.setHours(0, 0, 0, 0);
      
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);
      weekEnd.setHours(23, 59, 59, 999);

      const weekSessions = sessions.filter(s => {
        const t = new Date(s.startTime).getTime();
        return t >= weekStart.getTime() && t <= weekEnd.getTime();
      });

      weeks.unshift({
        week: `${weekStart.getMonth() + 1}/${weekStart.getDate()}`,
        sessions: weekSessions.length,
        duration: weekSessions.reduce((sum, s) => sum + s.duration, 0),
        calories: weekSessions.reduce((sum, s) => sum + s.calories, 0),
      });
    }

    return weeks;
  }, [sessions]);

  const maxSessions = Math.max(...weeklyData.map(w => w.sessions), 1);

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: 'Workout History',
          headerStyle: {
            backgroundColor: Colors.background,
          },
          headerTintColor: Colors.text,
        }}
      />
      
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 20 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.filterContainer}>
          {(['7d', '30d', '90d', 'all'] as TimeFilter[]).map((filter) => (
            <TouchableOpacity
              key={filter}
              style={[
                styles.filterButton,
                timeFilter === filter && styles.filterButtonActive,
              ]}
              onPress={() => setTimeFilter(filter)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.filterButtonText,
                  timeFilter === filter && styles.filterButtonTextActive,
                ]}
              >
                {filter === 'all' ? 'All Time' : filter.toUpperCase()}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.summaryGrid}>
          <View style={styles.summaryCard}>
            <View style={[styles.summaryIcon, { backgroundColor: Colors.primary + '20' }]}>
              <Dumbbell size={24} color={Colors.primary} />
            </View>
            <Text style={styles.summaryValue}>{stats.totalSessions}</Text>
            <Text style={styles.summaryLabel}>Workouts</Text>
          </View>

          <View style={styles.summaryCard}>
            <View style={[styles.summaryIcon, { backgroundColor: Colors.orange + '20' }]}>
              <Zap size={24} color={Colors.orange} />
            </View>
            <Text style={styles.summaryValue}>{stats.totalCalories}</Text>
            <Text style={styles.summaryLabel}>Calories</Text>
          </View>

          <View style={styles.summaryCard}>
            <View style={[styles.summaryIcon, { backgroundColor: Colors.blue + '20' }]}>
              <Timer size={24} color={Colors.blue} />
            </View>
            <Text style={styles.summaryValue}>{Math.round(stats.totalDuration / 60)}</Text>
            <Text style={styles.summaryLabel}>Hours</Text>
          </View>

          <View style={styles.summaryCard}>
            <View style={[styles.summaryIcon, { backgroundColor: Colors.green + '20' }]}>
              <Calendar size={24} color={Colors.green} />
            </View>
            <Text style={styles.summaryValue}>{stats.uniqueDays}</Text>
            <Text style={styles.summaryLabel}>Active Days</Text>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <TrendingUp size={20} color={Colors.primary} />
            <Text style={styles.sectionTitle}>Weekly Progress</Text>
          </View>
          
          <View style={styles.chartContainer}>
            <View style={styles.chart}>
              {weeklyData.slice(-6).map((week, index) => {
                const height = (week.sessions / maxSessions) * 120;
                return (
                  <View key={index} style={styles.chartBar}>
                    <View style={styles.chartBarContainer}>
                      <LinearGradient
                        colors={[Colors.primary, Colors.purple]}
                        style={[styles.chartBarFill, { height: Math.max(height, 4) }]}
                      />
                    </View>
                    <Text style={styles.chartLabel}>{week.week}</Text>
                    <Text style={styles.chartValue}>{week.sessions}</Text>
                  </View>
                );
              })}
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Activity size={20} color={Colors.accent} />
            <Text style={styles.sectionTitle}>Averages</Text>
          </View>
          
          <View style={styles.avgCard}>
            <View style={styles.avgRow}>
              <Text style={styles.avgLabel}>Duration per Workout</Text>
              <Text style={styles.avgValue}>{stats.avgDuration} min</Text>
            </View>
            <View style={styles.avgRow}>
              <Text style={styles.avgLabel}>Calories per Workout</Text>
              <Text style={styles.avgValue}>{stats.avgCalories} cal</Text>
            </View>
            <View style={styles.avgRow}>
              <Text style={styles.avgLabel}>Workouts per Week</Text>
              <Text style={styles.avgValue}>
                {timeFilter === '7d' 
                  ? stats.totalSessions
                  : timeFilter === '30d'
                  ? Math.round((stats.totalSessions / 30) * 7)
                  : Math.round((stats.totalSessions / 90) * 7)
                }
              </Text>
            </View>
          </View>
        </View>

        {Object.keys(stats.workoutsByPlan).length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Dumbbell size={20} color={Colors.purple} />
              <Text style={styles.sectionTitle}>Most Popular Workouts</Text>
            </View>
            
            {Object.entries(stats.workoutsByPlan)
              .sort(([, a], [, b]) => b - a)
              .slice(0, 5)
              .map(([planName, count], index) => {
                const percentage = (count / stats.totalSessions) * 100;
                return (
                  <View key={index} style={styles.popularCard}>
                    <View style={styles.popularInfo}>
                      <Text style={styles.popularName}>{planName}</Text>
                      <Text style={styles.popularCount}>{count} session{count !== 1 ? 's' : ''}</Text>
                    </View>
                    <View style={styles.popularBar}>
                      <View
                        style={[
                          styles.popularBarFill,
                          { width: `${percentage}%`, backgroundColor: Colors.primary },
                        ]}
                      />
                    </View>
                  </View>
                );
              })}
          </View>
        )}

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Activity size={20} color={Colors.cyan} />
            <Text style={styles.sectionTitle}>Recent Sessions</Text>
          </View>
          
          {sessions.slice(0, 10).map((session, index) => (
            <View key={index} style={styles.sessionCard}>
              <View style={styles.sessionHeader}>
                <Text style={styles.sessionName}>{session.workoutPlanName}</Text>
                <Text style={styles.sessionDate}>
                  {new Date(session.startTime).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                  })}
                </Text>
              </View>
              <View style={styles.sessionStats}>
                <View style={styles.sessionStat}>
                  <Timer size={14} color={Colors.textMuted} />
                  <Text style={styles.sessionStatText}>{session.duration} min</Text>
                </View>
                <View style={styles.sessionStat}>
                  <Zap size={14} color={Colors.textMuted} />
                  <Text style={styles.sessionStatText}>{session.calories} cal</Text>
                </View>
                <View style={styles.sessionStat}>
                  <Dumbbell size={14} color={Colors.textMuted} />
                  <Text style={styles.sessionStatText}>{session.exercises.length} exercises</Text>
                </View>
              </View>
            </View>
          ))}

          {sessions.length === 0 && (
            <View style={styles.emptyState}>
              <Dumbbell size={48} color={Colors.textMuted} />
              <Text style={styles.emptyText}>No workout sessions yet</Text>
              <Text style={styles.emptySubtext}>Start tracking your workouts to see analytics</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  filterContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20,
  },
  filterButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: Colors.cardBg,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
  },
  filterButtonActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  filterButtonText: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: Colors.textSecondary,
  },
  filterButtonTextActive: {
    color: Colors.white,
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  summaryCard: {
    width: (width - 52) / 2,
    backgroundColor: Colors.cardBg,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
  },
  summaryIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  summaryValue: {
    fontSize: 28,
    fontWeight: '700' as const,
    color: Colors.text,
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: 12,
    color: Colors.textMuted,
    fontWeight: '500' as const,
  },
  section: {
    marginBottom: 24,
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
  chartContainer: {
    backgroundColor: Colors.cardBg,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  chart: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 160,
  },
  chartBar: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginHorizontal: 2,
  },
  chartBarContainer: {
    width: '100%',
    height: 120,
    justifyContent: 'flex-end',
    marginBottom: 8,
  },
  chartBarFill: {
    width: '100%',
    borderRadius: 4,
  },
  chartLabel: {
    fontSize: 10,
    color: Colors.textMuted,
    marginTop: 4,
  },
  chartValue: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: Colors.text,
    marginTop: 2,
  },
  avgCard: {
    backgroundColor: Colors.cardBg,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 12,
  },
  avgRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  avgLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '500' as const,
  },
  avgValue: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  popularCard: {
    backgroundColor: Colors.cardBg,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  popularInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  popularName: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.text,
    flex: 1,
  },
  popularCount: {
    fontSize: 12,
    color: Colors.textMuted,
  },
  popularBar: {
    height: 6,
    backgroundColor: Colors.surfaceLight,
    borderRadius: 3,
    overflow: 'hidden',
  },
  popularBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  sessionCard: {
    backgroundColor: Colors.cardBg,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  sessionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sessionName: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: Colors.text,
    flex: 1,
  },
  sessionDate: {
    fontSize: 12,
    color: Colors.textMuted,
  },
  sessionStats: {
    flexDirection: 'row',
    gap: 16,
  },
  sessionStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  sessionStatText: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '500' as const,
  },
  emptyState: {
    backgroundColor: Colors.cardBg,
    borderRadius: 16,
    padding: 40,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.text,
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: Colors.textMuted,
    marginTop: 8,
    textAlign: 'center',
  },
});
