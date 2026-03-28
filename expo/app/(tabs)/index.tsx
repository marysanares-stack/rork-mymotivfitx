import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Flame,
  Footprints,
  Droplets,
  Clock,
  TrendingUp,
  Award,
  Heart,
  Plus,
  Moon,
  Apple,
  Map,
  Music,
  ShieldCheck,
  Dumbbell,
  BarChart3,
  Camera,
  UtensilsCrossed,
  Bot,
} from 'lucide-react-native';
import { useFitness } from '@/contexts/FitnessContext';
import Colors from '@/constants/colors';
import { ACTIVITY_TYPES } from '@/mocks/data';
import { router } from 'expo-router';
import MusicQuickLaunch from '@/components/MusicQuickLaunch';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const {
    user,
    getTodayStats,
    getTodayWaterIntake,
    getTodayMood,
    getActivityStreak,
    getMotivationalQuote,
    earnedBadges,
    getLastSleepEntry,
  } = useFitness();

  const todayStats = getTodayStats();
  const waterIntake = getTodayWaterIntake();
  const todayMood = getTodayMood();
  const streak = getActivityStreak();
  const quote = getMotivationalQuote();
  const lastSleep = getLastSleepEntry();

  const stepsProgress = Math.min((todayStats.steps / 10000) * 100, 100);
  const caloriesProgress = Math.min((todayStats.calories / 500) * 100, 100);
  const waterProgress = Math.min((waterIntake.amount / waterIntake.goal) * 100, 100);
  const activeMinutesProgress = Math.min((todayStats.activeMinutes / 60) * 100, 100);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <LinearGradient
        colors={[Colors.background, Colors.surface]}
        style={StyleSheet.absoluteFillObject}
      />
      
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting} testID="greetingText">Hello, {user?.name ?? 'Friend'}!</Text>
            <Text style={styles.date}>{new Date().toLocaleDateString('en-US', { 
              weekday: 'long', 
              month: 'long', 
              day: 'numeric' 
            })}</Text>
          </View>
          <TouchableOpacity style={styles.streakBadge}>
            <Flame size={20} color={Colors.orange} />
            <Text style={styles.streakText}>{streak} day{streak !== 1 ? 's' : ''}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.quoteCard}>
          <LinearGradient
            colors={[Colors.primary, Colors.purple]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.quoteGradient}
          >
            <Text style={styles.quoteText}>&ldquo;{quote}&rdquo;</Text>
          </LinearGradient>
        </View>

        {todayMood && (
          <View style={styles.moodCard}>
            <Text style={styles.moodEmoji}>{todayMood.emoji}</Text>
            <Text style={styles.moodText}>Feeling {todayMood.label} today</Text>
          </View>
        )}

        <MusicQuickLaunch />

        <View style={styles.statsGrid}>
          <View style={styles.statCardLarge}>
            <View style={styles.statHeader}>
              <View style={styles.iconWrapper}>
                <Footprints size={24} color={Colors.blue} />
              </View>
              <Text style={styles.statLabel}>Steps</Text>
            </View>
            <Text style={styles.statValue}>{todayStats.steps.toLocaleString()}</Text>
            <Text style={styles.statGoal}>Goal: 10,000</Text>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { 
                width: `${stepsProgress}%`,
                backgroundColor: Colors.blue,
              }]} />
            </View>
          </View>

          <View style={styles.statCardLarge}>
            <View style={styles.statHeader}>
              <View style={styles.iconWrapper}>
                <Flame size={24} color={Colors.orange} />
              </View>
              <Text style={styles.statLabel}>Calories</Text>
            </View>
            <Text style={styles.statValue}>{todayStats.calories}</Text>
            <Text style={styles.statGoal}>Goal: 500</Text>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { 
                width: `${caloriesProgress}%`,
                backgroundColor: Colors.orange,
              }]} />
            </View>
          </View>
        </View>

        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <View style={[styles.iconWrapper, { backgroundColor: Colors.cyan + '20' }]}>
              <Droplets size={20} color={Colors.cyan} />
            </View>
            <Text style={styles.statValue}>{waterIntake.amount}/{waterIntake.goal}</Text>
            <Text style={styles.statLabel}>Water (cups)</Text>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { 
                width: `${waterProgress}%`,
                backgroundColor: Colors.cyan,
              }]} />
            </View>
          </View>

          <View style={styles.statCard}>
            <View style={[styles.iconWrapper, { backgroundColor: Colors.green + '20' }]}>
              <Clock size={20} color={Colors.green} />
            </View>
            <Text style={styles.statValue}>{todayStats.activeMinutes}</Text>
            <Text style={styles.statLabel}>Active Minutes</Text>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { 
                width: `${activeMinutesProgress}%`,
                backgroundColor: Colors.green,
              }]} />
            </View>
          </View>
        </View>

        <View style={styles.trackerCards}>
          <TouchableOpacity 
            style={styles.trackerCard}
            onPress={() => router.push('/sync')}
            activeOpacity={0.7}
            testID="healthSyncCard"
          >
            <LinearGradient
              colors={[Colors.primary, Colors.indigo]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.trackerGradient}
            >
              <ShieldCheck size={28} color={Colors.white} />
              <View style={styles.trackerContent}>
                <Text style={styles.trackerTitle}>Health Sync</Text>
                <Text style={styles.trackerSubtitle}>Permissions, steps, active minutes, sleep</Text>
              </View>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.trackerCard}
            onPress={() => router.push('/heart-rate')}
            activeOpacity={0.7}
          >
            <LinearGradient
              colors={[Colors.red, Colors.pink]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.trackerGradient}
            >
              <Heart size={28} color={Colors.white} />
              <View style={styles.trackerContent}>
                <Text style={styles.trackerTitle}>Heart Rate</Text>
                <Text style={styles.trackerSubtitle}>Measure with camera</Text>
              </View>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.trackerCard}
            onPress={() => router.push('/sleep-tracker')}
            activeOpacity={0.7}
          >
            <LinearGradient
              colors={[Colors.indigo, Colors.purple]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.trackerGradient}
            >
              <Moon size={28} color={Colors.white} />
              <View style={styles.trackerContent}>
                <Text style={styles.trackerTitle}>Sleep Tracker</Text>
                <Text style={styles.trackerSubtitle}>
                  {lastSleep 
                    ? `Last: ${Math.floor(lastSleep.duration)}h ${Math.round((lastSleep.duration % 1) * 60)}m`
                    : 'Track your sleep'
                  }
                </Text>
              </View>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.trackerCard}
            onPress={() => router.push('/nutrition')}
            activeOpacity={0.7}
          >
            <LinearGradient
              colors={[Colors.green, Colors.cyan]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.trackerGradient}
            >
              <Apple size={28} color={Colors.white} />
              <View style={styles.trackerContent}>
                <Text style={styles.trackerTitle}>Nutrition</Text>
                <Text style={styles.trackerSubtitle}>Track food & macros</Text>
              </View>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.trackerCard}
            onPress={() => router.push('/activity-map')}
            activeOpacity={0.7}
          >
            <LinearGradient
              colors={[Colors.blue, Colors.indigo]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.trackerGradient}
            >
              <Map size={28} color={Colors.white} />
              <View style={styles.trackerContent}>
                <Text style={styles.trackerTitle}>Activity Map</Text>
                <Text style={styles.trackerSubtitle}>Track routes & elevation</Text>
              </View>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.trackerCard}
            onPress={() => router.push('/music')}
            activeOpacity={0.7}
          >
            <LinearGradient
              colors={[Colors.purple, Colors.pink]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.trackerGradient}
            >
              <Music size={28} color={Colors.white} />
              <View style={styles.trackerContent}>
                <Text style={styles.trackerTitle}>Workout Music</Text>
                <Text style={styles.trackerSubtitle}>MyMotivFitX playlists</Text>
              </View>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.trackerCard}
            onPress={() => router.push('/calorie-tracker')}
            activeOpacity={0.7}
          >
            <LinearGradient
              colors={[Colors.orange, Colors.red]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.trackerGradient}
            >
              <Flame size={28} color={Colors.white} />
              <View style={styles.trackerContent}>
                <Text style={styles.trackerTitle}>Calorie Tracker</Text>
                <Text style={styles.trackerSubtitle}>24-hour breakdown & insights</Text>
              </View>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.trackerCard}
            onPress={() => router.push('/goals')}
            activeOpacity={0.7}
          >
            <LinearGradient
              colors={[Colors.accent, Colors.orange]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.trackerGradient}
            >
              <TrendingUp size={28} color={Colors.white} />
              <View style={styles.trackerContent}>
                <Text style={styles.trackerTitle}>Goals</Text>
                <Text style={styles.trackerSubtitle}>Set targets & track progress</Text>
              </View>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.trackerCard}
            onPress={() => router.push('/workout-plans')}
            activeOpacity={0.7}
          >
            <LinearGradient
              colors={[Colors.blue, Colors.cyan]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.trackerGradient}
            >
              <Dumbbell size={28} color={Colors.white} />
              <View style={styles.trackerContent}>
                <Text style={styles.trackerTitle}>Workout Plans</Text>
                <Text style={styles.trackerSubtitle}>Create custom routines</Text>
              </View>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.trackerCard}
            onPress={() => router.push('/workout-history')}
            activeOpacity={0.7}
          >
            <LinearGradient
              colors={[Colors.purple, Colors.indigo]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.trackerGradient}
            >
              <BarChart3 size={28} color={Colors.white} />
              <View style={styles.trackerContent}>
                <Text style={styles.trackerTitle}>Workout History</Text>
                <Text style={styles.trackerSubtitle}>View analytics & progress</Text>
              </View>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.trackerCard}
            onPress={() => router.push('/progress-photos')}
            activeOpacity={0.7}
          >
            <LinearGradient
              colors={[Colors.pink, Colors.purple]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.trackerGradient}
            >
              <Camera size={28} color={Colors.white} />
              <View style={styles.trackerContent}>
                <Text style={styles.trackerTitle}>Progress Photos</Text>
                <Text style={styles.trackerSubtitle}>Before & after comparisons</Text>
              </View>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.trackerCard}
            onPress={() => router.push('/meal-planning')}
            activeOpacity={0.7}
          >
            <LinearGradient
              colors={[Colors.accent, Colors.green]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.trackerGradient}
            >
              <UtensilsCrossed size={28} color={Colors.white} />
              <View style={styles.trackerContent}>
                <Text style={styles.trackerTitle}>Meal Planning</Text>
                <Text style={styles.trackerSubtitle}>Recipes & shopping lists</Text>
              </View>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.trackerCard}
            onPress={() => router.push('/hydration')}
            activeOpacity={0.7}
          >
            <LinearGradient
              colors={[Colors.cyan, Colors.blue]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.trackerGradient}
            >
              <Droplets size={28} color={Colors.white} />
              <View style={styles.trackerContent}>
                <Text style={styles.trackerTitle}>Hydration Reminders</Text>
                <Text style={styles.trackerSubtitle}>Smart water intake tracking</Text>
              </View>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.trackerCard}
            onPress={() => router.push('/ai-coach')}
            activeOpacity={0.7}
          >
            <LinearGradient
              colors={[Colors.purple, Colors.pink]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.trackerGradient}
            >
              <Bot size={28} color={Colors.white} />
              <View style={styles.trackerContent}>
                <Text style={styles.trackerTitle}>AI Workout Coach</Text>
                <Text style={styles.trackerSubtitle}>Personalized training advice</Text>
              </View>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {earnedBadges.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Award size={20} color={Colors.accent} />
              <Text style={styles.sectionTitle}>Recent Badges</Text>
            </View>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              style={styles.badgesScroll}
            >
              {earnedBadges.slice(0, 5).map((badge) => (
                <View key={badge.id} style={styles.badgeCard}>
                  {typeof badge.icon === 'string' && badge.icon.startsWith('http') ? (
                    <Image
                      source={{ uri: badge.icon }}
                      style={styles.badgeIconImage}
                      resizeMode="cover"
                    />
                  ) : (
                    <Text style={styles.badgeIcon}>{badge.icon}</Text>
                  )}
                  <Text style={styles.badgeName}>{badge.name}</Text>
                  <Text style={styles.badgeDate}>
                    {badge.earnedDate 
                      ? new Date(badge.earnedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                      : 'Recently'
                    }
                  </Text>
                </View>
              ))}
            </ScrollView>
          </View>
        )}

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <TrendingUp size={20} color={Colors.primary} />
            <Text style={styles.sectionTitle}>Quick Actions</Text>
          </View>
          <View style={styles.quickActions}>
            {ACTIVITY_TYPES.slice(0, 6).map((activity) => (
              <TouchableOpacity 
                key={activity.value} 
                style={styles.quickActionBtn}
                activeOpacity={0.7}
                onPress={() => router.push(`/live-workout/${activity.value}`)}
              >
                <View style={[styles.quickActionIcon, { backgroundColor: activity.color + '20' }]}>
                  {typeof activity.icon === 'string' && activity.icon.startsWith('http') ? (
                    <Image
                      source={{ uri: activity.icon }}
                      style={styles.activityImage}
                      resizeMode="cover"
                    />
                  ) : (
                    <Text style={styles.activityEmoji}>{activity.icon}</Text>
                  )}
                </View>
                <Text style={styles.quickActionLabel}>{activity.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <TouchableOpacity
            style={styles.viewAllButton}
            activeOpacity={0.7}
            onPress={() => router.push('/all-activities')}
          >
            <Text style={styles.viewAllText}>View All Activities</Text>
            <TrendingUp size={16} color={Colors.primary} />
          </TouchableOpacity>
        </View>
      </ScrollView>

      <TouchableOpacity 
        style={styles.fab} 
        activeOpacity={0.9}
        onPress={() => router.push('/activity')}
        testID="addActivityFab"
      >
        <LinearGradient
          colors={[Colors.primary, Colors.purple]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.fabGradient}
        >
          <Plus size={28} color={Colors.white} />
        </LinearGradient>
      </TouchableOpacity>
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
    paddingBottom: 100,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingRight: 4,
  },
  greeting: {
    fontSize: 22,
    fontWeight: '700' as const,
    color: Colors.text,
    marginBottom: 4,
  },
  date: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.orange + '20',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  streakText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.orange,
  },
  quoteCard: {
    marginBottom: 20,
    borderRadius: 20,
    overflow: 'hidden',
  },
  quoteGradient: {
    padding: 20,
  },
  quoteText: {
    fontSize: 16,
    fontWeight: '500' as const,
    color: Colors.white,
    textAlign: 'center',
    lineHeight: 24,
    fontStyle: 'italic',
  },
  moodCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.cardBg,
    padding: 16,
    borderRadius: 16,
    marginBottom: 20,
    gap: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  moodEmoji: {
    fontSize: 32,
  },
  moodText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  statCardLarge: {
    flex: 1,
    backgroundColor: Colors.cardBg,
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.cardBg,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  iconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: Colors.blue + '20',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '600' as const,
  },
  statValue: {
    fontSize: 28,
    fontWeight: '700' as const,
    color: Colors.text,
    marginBottom: 4,
  },
  statGoal: {
    fontSize: 12,
    color: Colors.textMuted,
    marginBottom: 8,
  },
  progressBar: {
    height: 6,
    backgroundColor: Colors.surfaceLight,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  section: {
    marginTop: 20,
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
  badgesScroll: {
    marginLeft: -20,
    paddingLeft: 20,
  },
  badgeCard: {
    width: 120,
    backgroundColor: Colors.cardBg,
    padding: 16,
    borderRadius: 16,
    marginRight: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  badgeIcon: {
    fontSize: 40,
    marginBottom: 8,
  },
  badgeIconImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginBottom: 8,
  },
  badgeName: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: Colors.text,
    textAlign: 'center',
    marginBottom: 4,
  },
  badgeDate: {
    fontSize: 10,
    color: Colors.textMuted,
  },
  quickActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  quickActionBtn: {
    width: (width - 64) / 3,
    alignItems: 'center',
    gap: 8,
  },
  quickActionIcon: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  activityImage: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  activityOverlay: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  quickActionLabel: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: Colors.text,
    textAlign: 'center',
  },
  activityEmoji: {
    fontSize: 40,
  },
  trackerCards: {
    marginTop: 12,
    marginBottom: 20,
    gap: 12,
  },
  trackerCard: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  trackerGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    gap: 16,
  },
  trackerContent: {
    flex: 1,
  },
  trackerTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.white,
    marginBottom: 4,
  },
  trackerSubtitle: {
    fontSize: 14,
    color: Colors.white,
    opacity: 0.9,
  },
  fab: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    borderRadius: 28,
    elevation: 8,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  fabGradient: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewAllButton: {
    marginTop: 16,
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: Colors.primary + '15',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.primary + '30',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  viewAllText: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: Colors.primary,
  },
});
