import React, { useCallback, useMemo, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Share,
  Alert,
  Linking,
  Platform,
  TextInput,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import {
  Share2,
  Award,
  Activity as ActivityIcon,
  TrendingDown,
  Flame,
  Target,
  Calendar,
  Users,
  Trophy,
  Droplets,
  Facebook,
  Instagram,
  Atom,
  Bean,
  ExternalLink,
  Image as ImageIcon,
  Type as TypeIcon,
} from 'lucide-react-native';
import { useFitness } from '@/contexts/FitnessContext';
import Colors from '@/constants/colors';

type ShareableContent = {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  getValue: () => string | number;
  getMessage: () => string;
};

type PlatformChoice = 'generic' | 'facebook' | 'instagram' | 'tiktok' | 'lemon8';

type TemplateChoice = 'darkGlow' | 'sunset' | 'aqua' | 'mono';

export default function SocialExportScreen() {
  const insets = useSafeAreaInsets();
  const {
    user,
    recentActivities,
    earnedBadges,
    getTodayStats,
    getActivityStreak,
    getWeightLoss,
    getTotalCalories,
    getTodayWaterIntake,
  } = useFitness();

  const [isSharing, setIsSharing] = useState(false);
  const [caption, setCaption] = useState<string>('Feeling strong today! #MyMotivFitX');
  const [platformChoice, setPlatformChoice] = useState<PlatformChoice>('generic');
  const [template, setTemplate] = useState<TemplateChoice>('darkGlow');
  const [includeStats, setIncludeStats] = useState<boolean>(true);

  const todayStats = getTodayStats();
  const streak = getActivityStreak();
  const weightLoss = getWeightLoss();
  const totalCalories = getTotalCalories();
  const waterIntake = getTodayWaterIntake();

  const shareableContent: ShareableContent[] = [
    {
      id: 'today-stats',
      title: "Today's Progress",
      description: 'Share your daily achievements',
      icon: <Calendar size={24} color={Colors.blue} />,
      color: Colors.blue,
      getValue: () => `${todayStats.steps} steps`,
      getMessage: () =>
        `💪 Today's Fitness Update!\n\n` +
        `🚶 Steps: ${todayStats.steps.toLocaleString()}\n` +
        `🔥 Calories: ${todayStats.calories}\n` +
        `⏱️ Active Minutes: ${todayStats.activeMinutes}\n` +
        (todayStats.distance > 0 ? `📍 Distance: ${todayStats.distance.toFixed(1)} km\n` : '') +
        `\n#FitnessJourney #HealthyLiving`,
    },
    {
      id: 'activity-streak',
      title: 'Activity Streak',
      description: 'Share your consistency',
      icon: <Flame size={24} color={Colors.orange} />,
      color: Colors.orange,
      getValue: () => `${streak} days`,
      getMessage: () =>
        `🔥 Consistency is Key!\n\n` +
        `I've been active for ${streak} consecutive days! 🎯\n` +
        `Building healthy habits one day at a time.\n\n` +
        `#FitnessStreak #ConsistencyIsKey #HealthyHabits`,
    },
    {
      id: 'weight-loss',
      title: 'Weight Loss Progress',
      description: 'Share your transformation',
      icon: <TrendingDown size={24} color={Colors.green} />,
      color: Colors.green,
      getValue: () => (weightLoss > 0 ? `-${weightLoss} lbs` : 'No data'),
      getMessage: () =>
        weightLoss > 0
          ? `🎉 Weight Loss Milestone!\n\n` +
            `I've lost ${weightLoss} pounds! 💪\n` +
            `Hard work and dedication paying off!\n\n` +
            `#WeightLossJourney #Transformation #FitnessGoals`
          : 'Start tracking your weight to share your progress!',
    },
    {
      id: 'total-calories',
      title: 'Total Calories Burned',
      description: 'Share your total effort',
      icon: <Flame size={24} color={Colors.error} />,
      color: Colors.error,
      getValue: () => `${totalCalories} cal`,
      getMessage: () =>
        `🔥 Calorie Crusher!\n\n` +
        `Total calories burned: ${totalCalories.toLocaleString()}! 💯\n` +
        `Every workout counts!\n\n` +
        `#CalorieBurn #FitnessMotivation #WorkoutGoals`,
    },
    {
      id: 'badges',
      title: 'Earned Badges',
      description: 'Share your achievements',
      icon: <Award size={24} color={Colors.accent} />,
      color: Colors.accent,
      getValue: () => `${earnedBadges.length} badges`,
      getMessage: () => {
        if (earnedBadges.length === 0) {
          return 'Keep working towards your first badge!';
        }
        const badgeList = earnedBadges.map(b => `${b.icon} ${b.name}`).join('\n');
        return (
          `🏆 Achievement Unlocked!\n\n` +
          `I've earned ${earnedBadges.length} badges:\n` +
          `${badgeList}\n\n` +
          `#FitnessAchievements #Goals #Motivated`
        );
      },
    },
    {
      id: 'recent-activity',
      title: 'Latest Workout',
      description: 'Share your last activity',
      icon: <ActivityIcon size={24} color={Colors.primary} />,
      color: Colors.primary,
      getValue: () =>
        recentActivities.length > 0
          ? recentActivities[0].name
          : 'No activities',
      getMessage: () => {
        if (recentActivities.length === 0) {
          return 'Start logging your workouts to share!';
        }
        const activity = recentActivities[0];
        return (
          `💪 Workout Complete!\n\n` +
          `🏃 ${activity.name}\n` +
          `⏱️ Duration: ${activity.duration} minutes\n` +
          `🔥 Calories: ${activity.calories}\n` +
          (activity.distance ? `📍 Distance: ${activity.distance} km\n` : '') +
          (activity.steps ? `👣 Steps: ${activity.steps.toLocaleString()}\n` : '') +
          `\n#WorkoutDone #FitnessMotivation #TrainHard`
        );
      },
    },
    {
      id: 'water-intake',
      title: 'Hydration Goal',
      description: 'Share your water intake',
      icon: <Droplets size={24} color={Colors.cyan} />,
      color: Colors.cyan,
      getValue: () => `${waterIntake.amount}/${waterIntake.goal} cups`,
      getMessage: () =>
        `💧 Staying Hydrated!\n\n` +
        `Water intake today: ${waterIntake.amount}/${waterIntake.goal} cups\n` +
        (waterIntake.amount >= waterIntake.goal
          ? '✅ Goal achieved! 🎉\n'
          : 'Keep hydrating! 💪\n') +
        `\n#Hydration #HealthyLiving #WaterGoals`,
    },
    {
      id: 'weekly-summary',
      title: 'Weekly Summary',
      description: 'Share your week overview',
      icon: <Target size={24} color={Colors.purple} />,
      color: Colors.purple,
      getValue: () => `${recentActivities.length} activities`,
      getMessage: () => {
        const weekActivities = recentActivities.filter(a => {
          const activityDate = new Date(a.date);
          const weekAgo = new Date();
          weekAgo.setDate(weekAgo.getDate() - 7);
          return activityDate >= weekAgo;
        });
        
        const weekCalories = weekActivities.reduce((sum, a) => sum + a.calories, 0);
        const weekSteps = weekActivities.reduce((sum, a) => sum + (a.steps || 0), 0);
        const weekDistance = weekActivities.reduce((sum, a) => sum + (a.distance || 0), 0);

        return (
          `📊 Weekly Fitness Report!\n\n` +
          `🏃 Workouts: ${weekActivities.length}\n` +
          `🔥 Calories Burned: ${weekCalories.toLocaleString()}\n` +
          `👣 Steps: ${weekSteps.toLocaleString()}\n` +
          (weekDistance > 0 ? `📍 Distance: ${weekDistance.toFixed(1)} km\n` : '') +
          `\n#WeeklySummary #FitnessProgress #KeepGoing`
        );
      },
    },
  ];

  const handleShare = async (content: ShareableContent) => {
    try {
      setIsSharing(true);
      const message = content.getMessage();

      if (message.includes('No data') || message.includes('Start tracking')) {
        Alert.alert('No Data', message);
        setIsSharing(false);
        return;
      }

      if (Platform.OS === 'web') {
        try {
          if (navigator.clipboard) {
            await navigator.clipboard.writeText(message);
            Alert.alert('Copied!', 'Content copied to clipboard. You can now paste it anywhere.');
          } else {
            Alert.alert('Content Ready', 'Please copy this content:\n\n' + message);
          }
        } catch {
          console.log('Clipboard copy failed, showing content');
          Alert.alert('Content Ready', 'Please copy this content:\n\n' + message);
        }
      } else {
        const result = await Share.share({
          message: message,
          title: content.title,
        });

        if (result.action === Share.sharedAction) {
          if (result.activityType) {
            console.log('Shared with activity type:', result.activityType);
          } else {
            console.log('Shared successfully');
          }
        } else if (result.action === Share.dismissedAction) {
          console.log('Share dismissed');
        }
      }
    } catch (error) {
      console.error('Error sharing:', error);
      Alert.alert('Error', 'Failed to share content. Please try again.');
    } finally {
      setIsSharing(false);
    }
  };

  const handleShareAll = async () => {
    try {
      setIsSharing(true);
      const message =
        `🎯 My Fitness Journey Update!\n\n` +
        `👤 ${user.name}\n\n` +
        `📈 Progress Overview:\n` +
        `🚶 Today's Steps: ${todayStats.steps.toLocaleString()}\n` +
        `🔥 Total Calories: ${totalCalories.toLocaleString()}\n` +
        `📅 Active Streak: ${streak} days\n` +
        `🏆 Badges Earned: ${earnedBadges.length}\n` +
        (weightLoss > 0 ? `⚖️ Weight Lost: ${weightLoss} lbs\n` : '') +
        `\n#FitnessJourney #HealthyLiving #Progress`;

      if (Platform.OS === 'web') {
        try {
          if (navigator.clipboard) {
            await navigator.clipboard.writeText(message);
            Alert.alert('Copied!', 'Content copied to clipboard. You can now paste it anywhere.');
          } else {
            Alert.alert('Content Ready', message);
          }
        } catch {
          console.log('Clipboard copy failed, showing content');
          Alert.alert('Content Ready', message);
        }
      } else {
        await Share.share({
          message: message,
          title: 'My Fitness Journey',
        });
      }
    } catch (error) {
      console.error('Error sharing:', error);
      Alert.alert('Error', 'Failed to share content. Please try again.');
    } finally {
      setIsSharing(false);
    }
  };

  const shareText = useMemo(() => {
    return (
      `📣 MyMotivFitX Progress Update` +
      `\n` +
      `Steps: ${todayStats.steps.toLocaleString()} | Calories: ${totalCalories.toLocaleString()} | Streak: ${streak} days` +
      `\n#MyMotivFitX #FitnessJourney`
    );
  }, [streak, todayStats.steps, totalCalories]);

  const templateGradients: Record<TemplateChoice, readonly [string, string]> = {
    darkGlow: [Colors.surface, Colors.surfaceLight],
    sunset: ['#1F2937', '#F59E0B'],
    aqua: ['#0F172A', '#06B6D4'],
    mono: ['#0B1220', '#1E293B'],
  } as const;



  const openUrl = useCallback(async (url: string) => {
    try {
      const supported = await Linking.canOpenURL(url);
      console.log('[share] openUrl canOpenURL', url, supported);
      if (supported) {
        await Linking.openURL(url);
        return true;
      }
      Alert.alert('Unavailable', 'App not installed or unsupported on this device.');
      return false;
    } catch (e) {
      console.error('[share] openUrl error', e);
      Alert.alert('Error', 'Could not open the app.');
      return false;
    }
  }, []);

  const shareToFacebook = useCallback(async () => {
    console.log('[share] facebook start');
    if (Platform.OS === 'web') {
      const shareUrl = encodeURIComponent('https://mymotivfitx.app/progress');
      const quote = encodeURIComponent(shareText);
      const url = `https://www.facebook.com/sharer/sharer.php?u=${shareUrl}&quote=${quote}`;
      window.open(url, '_blank');
      return;
    }
    try {
      await Share.share({ message: shareText, title: 'MyMotivFitX Progress' });
    } catch (err) {
      console.error('[share] facebook error', err);
    }
  }, [shareText]);

  const shareToInstagram = useCallback(async () => {
    console.log('[share] instagram start');
    if (Platform.OS === 'web') {
      window.open('https://instagram.com/', '_blank');
      return;
    }
    const opened = await openUrl('instagram://app');
    if (!opened) {
      try {
        await Share.share({ message: shareText });
      } catch (err) {
        console.error('[share] instagram error', err);
      }
    }
  }, [openUrl, shareText]);

  const shareToTiktok = useCallback(async () => {
    console.log('[share] tiktok start');
    if (Platform.OS === 'web') {
      window.open('https://www.tiktok.com/', '_blank');
      return;
    }
    const opened = await openUrl('tiktok://open');
    if (!opened) {
      try {
        await Share.share({ message: shareText });
      } catch (err) {
        console.error('[share] tiktok error', err);
      }
    }
  }, [openUrl, shareText]);

  const shareToLemon8 = useCallback(async () => {
    console.log('[share] lemon8 start');
    if (Platform.OS === 'web') {
      window.open('https://www.lemon8-app.com/', '_blank');
      return;
    }
    const opened = await openUrl('lemon8://');
    if (!opened) {
      try {
        await Share.share({ message: shareText });
      } catch (err) {
        console.error('[share] lemon8 error', err);
      }
    }
  }, [openUrl, shareText]);

  const onShareCompose = useCallback(async () => {
    const base = caption.trim();
    const stats = includeStats
      ? `\nSteps: ${todayStats.steps.toLocaleString()} | Calories: ${totalCalories.toLocaleString()} | Streak: ${streak} days`
      : '';
    const composed = `${base}${stats}`;

    switch (platformChoice) {
      case 'facebook':
        await shareToFacebook();
        return;
      case 'instagram':
        await shareToInstagram();
        return;
      case 'tiktok':
        await shareToTiktok();
        return;
      case 'lemon8':
        await shareToLemon8();
        return;
      case 'generic':
      default:
        try {
          if (Platform.OS === 'web') {
            try {
              if (navigator.clipboard) {
                await navigator.clipboard.writeText(composed);
                Alert.alert('Copied!', 'Content copied to clipboard. You can now paste it anywhere.');
              } else {
                Alert.alert('Content Ready', composed);
              }
            } catch {
              console.log('Clipboard copy failed, showing content');
              Alert.alert('Content Ready', composed);
            }
          } else {
            await Share.share({ message: composed, title: 'MyMotivFitX' });
          }
        } catch (e) {
          console.error('[share] generic error', e);
          Alert.alert('Error', 'Failed to open share sheet');
        }
    }
  }, [caption, includeStats, platformChoice, shareToFacebook, shareToInstagram, shareToLemon8, shareToTiktok, todayStats.steps, totalCalories, streak]);

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: 'Share Progress',
          headerStyle: {
            backgroundColor: Colors.surface,
          },
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
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 20 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Share2 size={48} color={Colors.primary} />
          <Text style={styles.headerTitle}>Share Your Progress</Text>
          <Text style={styles.headerSubtitle}>
            Inspire others with your fitness achievements
          </Text>
        </View>

        <View style={styles.composerCard}>
          <Text style={styles.sectionTitle}>Compose</Text>

          <View style={styles.previewCard} testID="share-preview">
            <LinearGradient
              colors={templateGradients[template]}
              style={styles.previewGradient}
            >
              <View style={styles.previewHeader}>
                <ImageIcon size={18} color={Colors.white} />
                <Text style={styles.previewBrand}>MyMotivFitX</Text>
              </View>
              <View style={styles.previewBody}>
                <Text style={styles.previewCaption} numberOfLines={3}>{caption}</Text>
                {includeStats && (
                  <View style={styles.previewStats}>
                    <Text style={styles.previewStatText}>Steps {todayStats.steps.toLocaleString()}</Text>
                    <Text style={styles.previewStatText}>Calories {totalCalories.toLocaleString()}</Text>
                    <Text style={styles.previewStatText}>Streak {streak}d</Text>
                  </View>
                )}
              </View>
            </LinearGradient>
          </View>

          <View style={styles.inputWrap}>
            <TypeIcon size={16} color={Colors.textSecondary} />
            <TextInput
              testID="caption-input"
              style={styles.input}
              placeholder="Write a caption..."
              placeholderTextColor={Colors.textMuted}
              value={caption}
              onChangeText={setCaption}
              multiline
            />
          </View>

          <View style={styles.templateRow}>
            {(['darkGlow','sunset','aqua','mono'] as TemplateChoice[]).map((t) => (
              <TouchableOpacity
                key={t}
                testID={`template-${t}`}
                style={[styles.templateBtn, template === t && styles.templateBtnActive]}
                onPress={() => setTemplate(t)}
                activeOpacity={0.7}
              >
                <LinearGradient colors={templateGradients[t]} style={styles.templateSwatch} />
                <Text style={styles.templateText}>{t}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.platformRow}>
            {(['generic','facebook','instagram','tiktok','lemon8'] as PlatformChoice[]).map((p) => (
              <TouchableOpacity
                key={p}
                testID={`platform-${p}`}
                style={[styles.platformBtn, platformChoice === p && styles.platformBtnActive]}
                onPress={() => setPlatformChoice(p)}
                activeOpacity={0.7}
              >
                <Text style={[styles.platformText, platformChoice === p && styles.platformTextActive]}>{p}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity
            testID="toggle-stats"
            style={[styles.platformBtn, includeStats ? styles.platformBtnActive : undefined]}
            onPress={() => setIncludeStats((s) => !s)}
            activeOpacity={0.7}
          >
            <Text style={[styles.platformText, includeStats && styles.platformTextActive]}>
              {includeStats ? 'Included: Stats' : 'Include Stats'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            testID="btn-share-compose"
            style={styles.primaryBtn}
            onPress={onShareCompose}
            activeOpacity={0.85}
          >
            <Share2 size={18} color={Colors.white} />
            <Text style={styles.primaryBtnText}>Share</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.shareAllButton}
          onPress={handleShareAll}
          disabled={isSharing}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={[Colors.primary, Colors.purple]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.shareAllGradient}
          >
            <Trophy size={24} color={Colors.white} />
            <Text style={styles.shareAllText}>Share Complete Progress</Text>
          </LinearGradient>
        </TouchableOpacity>

        <View style={styles.quickRow}>
          <TouchableOpacity style={[styles.quickBtn, { backgroundColor: '#1877F2' }]} onPress={shareToFacebook} activeOpacity={0.8} testID="share-facebook">
            <Facebook size={20} color={Colors.white} />
            <Text style={styles.quickText}>Facebook</Text>
            <ExternalLink size={16} color={Colors.white} />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.quickBtn, { backgroundColor: '#E1306C' }]} onPress={shareToInstagram} activeOpacity={0.8} testID="share-instagram">
            <Instagram size={20} color={Colors.white} />
            <Text style={styles.quickText}>Instagram</Text>
            <ExternalLink size={16} color={Colors.white} />
          </TouchableOpacity>
        </View>
        <View style={styles.quickRow}>
          <TouchableOpacity style={[styles.quickBtn, { backgroundColor: '#000000' }]} onPress={shareToTiktok} activeOpacity={0.8} testID="share-tiktok">
            <Atom size={20} color={Colors.white} />
            <Text style={styles.quickText}>TikTok</Text>
            <ExternalLink size={16} color={Colors.white} />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.quickBtn, { backgroundColor: '#F4B400' }]} onPress={shareToLemon8} activeOpacity={0.8} testID="share-lemon8">
            <Bean size={20} color={Colors.white} />
            <Text style={styles.quickText}>Lemon8</Text>
            <ExternalLink size={16} color={Colors.white} />
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Choose What to Share</Text>
          <View style={styles.cardsContainer}>
            {shareableContent.map((content) => (
              <View key={content.id} style={styles.card}>
                <View style={styles.cardHeader}>
                  <View
                    style={[
                      styles.cardIcon,
                      { backgroundColor: content.color + '20' },
                    ]}
                  >
                    {content.icon}
                  </View>
                  <View style={styles.cardInfo}>
                    <Text style={styles.cardTitle}>{content.title}</Text>
                    <Text style={styles.cardDescription}>
                      {content.description}
                    </Text>
                  </View>
                </View>

                <View style={styles.cardValue}>
                  <Text style={[styles.valueText, { color: content.color }]}>
                    {content.getValue()}
                  </Text>
                </View>

                <TouchableOpacity
                  style={[
                    styles.shareButton,
                    { borderColor: content.color },
                  ]}
                  onPress={() => handleShare(content)}
                  disabled={isSharing}
                  activeOpacity={0.7}
                >
                  <Share2 size={18} color={content.color} />
                  <Text style={[styles.shareButtonText, { color: content.color }]}>
                    Share
                  </Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.infoCard}>
          <View style={styles.infoIcon}>
            <Users size={24} color={Colors.primary} />
          </View>
          <View style={styles.infoContent}>
            <Text style={styles.infoTitle}>Share Across Platforms</Text>
            <Text style={styles.infoText}>
              Your progress can be shared to any app installed on your device:
              Facebook, Instagram, Twitter, WhatsApp, Messages, and more!
            </Text>
          </View>
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
  header: {
    alignItems: 'center',
    paddingVertical: 24,
    gap: 12,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700' as const,
    color: Colors.text,
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  composerCard: {
    backgroundColor: Colors.cardBg,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 24,
    gap: 12,
  },
  previewCard: {
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  previewGradient: {
    padding: 16,
  },
  previewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  previewBrand: {
    color: Colors.white,
    fontWeight: '700' as const,
  },
  previewBody: {
    gap: 10,
  },
  previewCaption: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '700' as const,
  },
  previewStats: {
    flexDirection: 'row',
    gap: 12,
  },
  previewStatText: {
    color: Colors.white,
    fontSize: 12,
    opacity: 0.9,
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.surfaceLight,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  input: {
    flex: 1,
    minHeight: 44,
    color: Colors.text,
  },
  templateRow: {
    flexDirection: 'row',
    gap: 8,
  },
  templateBtn: {
    flex: 1,
    backgroundColor: Colors.surfaceLight,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    padding: 8,
    alignItems: 'center',
    gap: 6,
  },
  templateBtnActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary + '20',
  },
  templateSwatch: {
    width: '100%',
    height: 28,
    borderRadius: 8,
  },
  templateText: {
    color: Colors.textSecondary,
    fontSize: 12,
    textTransform: 'capitalize',
    fontWeight: '600' as const,
  },
  platformRow: {
    flexDirection: 'row',
    gap: 8,
  },
  platformBtn: {
    flex: 1,
    paddingVertical: 10,
    backgroundColor: Colors.surfaceLight,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 10,
    alignItems: 'center',
  },
  platformBtnActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  platformText: {
    color: Colors.textSecondary,
    fontSize: 12,
    fontWeight: '700' as const,
    textTransform: 'capitalize',
  },
  platformTextActive: {
    color: Colors.white,
  },
  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: Colors.green,
  },
  primaryBtnText: {
    color: Colors.white,
    fontWeight: '700' as const,
    fontSize: 16,
  },

  shareAllButton: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 32,
    elevation: 4,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  shareAllGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    padding: 18,
  },
  shareAllText: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.white,
  },
  quickRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  quickBtn: {
    flex: 1,
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  quickText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '700' as const,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: Colors.text,
    marginBottom: 16,
  },
  cardsContainer: {
    gap: 16,
  },
  card: {
    backgroundColor: Colors.cardBg,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  cardIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardInfo: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.text,
    marginBottom: 2,
  },
  cardDescription: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  cardValue: {
    paddingVertical: 8,
  },
  valueText: {
    fontSize: 24,
    fontWeight: '700' as const,
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 2,
  },
  shareButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
  },
  infoCard: {
    backgroundColor: Colors.primary + '10',
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    gap: 16,
    borderWidth: 1,
    borderColor: Colors.primary + '30',
  },
  infoIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.primary + '20',
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.text,
    marginBottom: 6,
  },
  infoText: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
});
