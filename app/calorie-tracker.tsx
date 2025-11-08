import React, { useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack, router } from 'expo-router';
import {
  Flame,
  Activity,
  Moon,
  TrendingUp,
  Zap,
} from 'lucide-react-native';
import { useFitness } from '@/contexts/FitnessContext';
import Colors from '@/constants/colors';

type HourlyData = {
  hour: number;
  active: number;
  resting: number;
  total: number;
};

export default function CalorieTrackerScreen() {
  const { getTodayStats, activities, user } = useFitness();

  const todayStats = getTodayStats();

  const BMR = useMemo(() => {
    if (!user.weight || !user.height || !user.age) return 1500;
    const weightKg = user.weight * 0.453592;
    const heightCm = user.height * 2.54;
    const age = user.age;
    const isMale = user.gender === 'male';

    if (isMale) {
      return Math.round(10 * weightKg + 6.25 * heightCm - 5 * age + 5);
    } else {
      return Math.round(10 * weightKg + 6.25 * heightCm - 5 * age - 161);
    }
  }, [user]);

  const restingCaloriesPerHour = BMR / 24;

  const hourlyData: HourlyData[] = useMemo(() => {
    const now = new Date();
    const currentHour = now.getHours();
    const data: HourlyData[] = [];

    for (let hour = 0; hour < 24; hour++) {
      const hourActivities = activities.filter(activity => {
        const activityDate = new Date(activity.date);
        const activityHour = activityDate.getHours();
        const isToday = activityDate.toDateString() === now.toDateString();
        return isToday && activityHour === hour;
      });

      const activeCalories = hourActivities.reduce((sum, a) => sum + a.calories, 0);
      const restingCalories = Math.round(restingCaloriesPerHour);

      data.push({
        hour,
        active: activeCalories,
        resting: hour <= currentHour ? restingCalories : 0,
        total: activeCalories + (hour <= currentHour ? restingCalories : 0),
      });
    }

    return data;
  }, [activities, restingCaloriesPerHour]);

  const totalActive = useMemo(() => {
    return hourlyData.reduce((sum, h) => sum + h.active, 0);
  }, [hourlyData]);

  const totalResting = useMemo(() => {
    return hourlyData.reduce((sum, h) => sum + h.resting, 0);
  }, [hourlyData]);

  const totalCalories = totalActive + totalResting;

  const maxCalories = Math.max(...hourlyData.map(h => h.total), 100);

  const weeklyCalories = useMemo(() => {
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - 6);
    start.setHours(0, 0, 0, 0);

    const weekActivities = activities.filter(a => {
      const t = new Date(a.date).getTime();
      return t >= start.getTime() && t <= end.getTime();
    });

    return weekActivities.reduce((sum, a) => sum + a.calories, 0);
  }, [activities]);

  const averageDailyActive = Math.round(weeklyCalories / 7);

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: '24-Hour Calorie Tracking',
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
        <View style={styles.summaryCards}>
          <View style={[styles.summaryCard, styles.summaryCardPrimary]}>
            <LinearGradient
              colors={[Colors.orange, Colors.red]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.summaryGradient}
            >
              <Flame size={32} color={Colors.white} />
              <View style={styles.summaryContent}>
                <Text style={styles.summaryValue}>{totalCalories.toLocaleString()}</Text>
                <Text style={styles.summaryLabel}>Total Burned Today</Text>
              </View>
            </LinearGradient>
          </View>

          <View style={styles.summaryRow}>
            <View style={styles.summaryCardSmall}>
              <View style={[styles.iconBadge, { backgroundColor: Colors.green + '20' }]}>
                <Activity size={20} color={Colors.green} />
              </View>
              <Text style={styles.summaryValueSmall}>{totalActive}</Text>
              <Text style={styles.summaryLabelSmall}>Active</Text>
            </View>

            <View style={styles.summaryCardSmall}>
              <View style={[styles.iconBadge, { backgroundColor: Colors.blue + '20' }]}>
                <Moon size={20} color={Colors.blue} />
              </View>
              <Text style={styles.summaryValueSmall}>{totalResting}</Text>
              <Text style={styles.summaryLabelSmall}>Resting</Text>
            </View>
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.cardHeaderLeft}>
              <TrendingUp size={20} color={Colors.primary} />
              <Text style={styles.cardTitle}>Hourly Breakdown</Text>
            </View>
          </View>

          <View style={styles.chartContainer}>
            <View style={styles.yAxis}>
              <Text style={styles.yAxisLabel}>{Math.round(maxCalories)}</Text>
              <Text style={styles.yAxisLabel}>{Math.round(maxCalories / 2)}</Text>
              <Text style={styles.yAxisLabel}>0</Text>
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.chartScroll}
              contentContainerStyle={styles.chartContent}
            >
              {hourlyData.map((data, index) => {
                const totalHeight = (data.total / maxCalories) * 200;
                const activeHeight = (data.active / maxCalories) * 200;
                const restingHeight = (data.resting / maxCalories) * 200;

                return (
                  <View key={index} style={styles.barContainer}>
                    <View style={styles.barWrapper}>
                      <View style={[styles.bar, { height: Math.max(totalHeight, 2) }]}>
                        {data.resting > 0 && (
                          <View
                            style={[
                              styles.barSegment,
                              {
                                height: restingHeight,
                                backgroundColor: Colors.blue,
                              },
                            ]}
                          />
                        )}
                        {data.active > 0 && (
                          <View
                            style={[
                              styles.barSegment,
                              {
                                height: activeHeight,
                                backgroundColor: Colors.orange,
                              },
                            ]}
                          />
                        )}
                      </View>
                    </View>
                    <Text style={styles.barLabel}>
                      {data.hour === 0 ? '12a' : data.hour < 12 ? `${data.hour}a` : data.hour === 12 ? '12p' : `${data.hour - 12}p`}
                    </Text>
                  </View>
                );
              })}
            </ScrollView>
          </View>

          <View style={styles.legend}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: Colors.orange }]} />
              <Text style={styles.legendText}>Active Calories</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: Colors.blue }]} />
              <Text style={styles.legendText}>Resting Calories</Text>
            </View>
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.cardHeaderLeft}>
              <Zap size={20} color={Colors.accent} />
              <Text style={styles.cardTitle}>Calorie Insights</Text>
            </View>
          </View>

          <View style={styles.insightRow}>
            <Text style={styles.insightLabel}>Basal Metabolic Rate (BMR)</Text>
            <Text style={styles.insightValue}>{BMR} cal/day</Text>
          </View>

          <View style={styles.insightRow}>
            <Text style={styles.insightLabel}>Resting Burn Rate</Text>
            <Text style={styles.insightValue}>{Math.round(restingCaloriesPerHour)} cal/hour</Text>
          </View>

          <View style={styles.insightRow}>
            <Text style={styles.insightLabel}>7-Day Avg Active</Text>
            <Text style={styles.insightValue}>{averageDailyActive} cal/day</Text>
          </View>

          <View style={styles.insightRow}>
            <Text style={styles.insightLabel}>Today&apos;s Active Minutes</Text>
            <Text style={styles.insightValue}>{todayStats.activeMinutes} min</Text>
          </View>

          <View style={styles.insightRow}>
            <Text style={styles.insightLabel}>Calories per Minute</Text>
            <Text style={styles.insightValue}>
              {todayStats.activeMinutes > 0
                ? Math.round(totalActive / todayStats.activeMinutes)
                : 0}{' '}
              cal/min
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.syncCard}
          onPress={() => router.push('/sync')}
          activeOpacity={0.7}
        >
          <LinearGradient
            colors={[Colors.primary, Colors.indigo]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.syncGradient}
          >
            <Activity size={24} color={Colors.white} />
            <View style={styles.syncContent}>
              <Text style={styles.syncTitle}>Sync with Health Apps</Text>
              <Text style={styles.syncSubtitle}>
                Connect Apple Health or Google Health Connect for automatic calorie tracking
              </Text>
            </View>
          </LinearGradient>
        </TouchableOpacity>

        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>About Calorie Calculations</Text>
          <Text style={styles.infoText}>
            <Text style={styles.infoBold}>Resting Calories</Text> are calculated using your BMR (Basal Metabolic Rate) based on age, weight, height, and gender. These are calories your body burns at rest.
          </Text>
          <Text style={styles.infoText}>
            <Text style={styles.infoBold}>Active Calories</Text> are burned during physical activities and workouts. The more intense the activity, the more calories burned.
          </Text>
          <Text style={styles.infoText}>
            Connect health apps for more accurate calorie tracking across all your activities.
          </Text>
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
    paddingBottom: 40,
  },
  summaryCards: {
    gap: 12,
    marginBottom: 20,
  },
  summaryCard: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  summaryCardPrimary: {
    height: 140,
  },
  summaryGradient: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 24,
    gap: 20,
  },
  summaryContent: {
    flex: 1,
  },
  summaryValue: {
    fontSize: 40,
    fontWeight: '700' as const,
    color: Colors.white,
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: 16,
    color: Colors.white,
    opacity: 0.9,
  },
  summaryRow: {
    flexDirection: 'row',
    gap: 12,
  },
  summaryCardSmall: {
    flex: 1,
    backgroundColor: Colors.cardBg,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
  },
  iconBadge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  summaryValueSmall: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: Colors.text,
    marginBottom: 4,
  },
  summaryLabelSmall: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  card: {
    backgroundColor: Colors.cardBg,
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  cardHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  chartContainer: {
    flexDirection: 'row',
    height: 240,
  },
  yAxis: {
    width: 40,
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingRight: 8,
  },
  yAxisLabel: {
    fontSize: 11,
    color: Colors.textMuted,
    textAlign: 'right',
  },
  chartScroll: {
    flex: 1,
  },
  chartContent: {
    paddingRight: 20,
    alignItems: 'flex-end',
  },
  barContainer: {
    alignItems: 'center',
    marginRight: 8,
  },
  barWrapper: {
    height: 200,
    justifyContent: 'flex-end',
    marginBottom: 8,
  },
  bar: {
    width: 24,
    backgroundColor: Colors.surfaceLight,
    borderRadius: 4,
    overflow: 'hidden',
    justifyContent: 'flex-end',
  },
  barSegment: {
    width: '100%',
    borderRadius: 2,
  },
  barLabel: {
    fontSize: 10,
    color: Colors.textMuted,
    textAlign: 'center',
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 24,
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  legendText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  insightRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  insightLabel: {
    fontSize: 15,
    color: Colors.textSecondary,
  },
  insightValue: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  syncCard: {
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 16,
  },
  syncGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    gap: 16,
  },
  syncContent: {
    flex: 1,
  },
  syncTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.white,
    marginBottom: 4,
  },
  syncSubtitle: {
    fontSize: 14,
    color: Colors.white,
    opacity: 0.9,
  },
  infoCard: {
    backgroundColor: Colors.primary + '10',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.primary + '20',
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.text,
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
    marginBottom: 12,
  },
  infoBold: {
    fontWeight: '600' as const,
    color: Colors.text,
  },
});
