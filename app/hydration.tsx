import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Platform,
} from 'react-native';
import { router, Stack } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  ArrowLeft,
  Droplets,
  Bell,
  Sun,
  CloudRain,
  Activity,
  Plus,
  Minus,
} from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import Colors from '@/constants/colors';

interface HydrationSettings {
  enabled: boolean;
  dailyGoal: number;
  interval: number;
  activityMultiplier: number;
  weatherAdjustment: boolean;
}

interface HydrationLog {
  id: string;
  amount: number;
  date: string;
}

if (Platform.OS !== 'web') {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
}

const WEATHER_CONDITIONS = ['Sunny', 'Cloudy', 'Rainy', 'Hot (>85°F)', 'Cold (<50°F)'];
const ACTIVITY_LEVELS = ['Sedentary', 'Light', 'Moderate', 'Very Active'];

export default function HydrationScreen() {
  const insets = useSafeAreaInsets();
  const [settings, setSettings] = useState<HydrationSettings>({
    enabled: false,
    dailyGoal: 8,
    interval: 120,
    activityMultiplier: 1,
    weatherAdjustment: true,
  });
  const [logs, setLogs] = useState<HydrationLog[]>([]);
  const [todayIntake, setTodayIntake] = useState(0);
  const [selectedWeather, setSelectedWeather] = useState('Cloudy');
  const [selectedActivity, setSelectedActivity] = useState('Light');

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    const todayLogs = logs.filter(log => log.date === today);
    const total = todayLogs.reduce((sum, log) => sum + log.amount, 0);
    setTodayIntake(total);
  }, [logs]);

  const loadData = async () => {
    try {
      const [settingsData, logsData] = await Promise.all([
        AsyncStorage.getItem('@hydration_settings'),
        AsyncStorage.getItem('@hydration_logs'),
      ]);
      if (settingsData) setSettings(JSON.parse(settingsData));
      if (logsData) setLogs(JSON.parse(logsData));
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const saveSettings = async (newSettings: HydrationSettings) => {
    try {
      await AsyncStorage.setItem('@hydration_settings', JSON.stringify(newSettings));
      setSettings(newSettings);
      if (newSettings.enabled && Platform.OS !== 'web') {
        await scheduleNotifications(newSettings);
      } else if (!newSettings.enabled && Platform.OS !== 'web') {
        await cancelNotifications();
      }
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  };

  const saveLogs = async (newLogs: HydrationLog[]) => {
    try {
      await AsyncStorage.setItem('@hydration_logs', JSON.stringify(newLogs));
      setLogs(newLogs);
    } catch (error) {
      console.error('Error saving logs:', error);
    }
  };



  const addWater = (amount: number) => {
    const newLog: HydrationLog = {
      id: `log-${Date.now()}`,
      amount,
      date: new Date().toISOString(),
    };
    saveLogs([...logs, newLog]);
  };

  const scheduleNotifications = async (settings: HydrationSettings) => {
    if (Platform.OS === 'web') {
      console.log('Notifications not supported on web');
      return;
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.log('Permission not granted for notifications');
      return;
    }

    await cancelNotifications();

    const messages = [
      'Time to hydrate! 💧 Drink some water',
      'Stay hydrated! Your body needs water 💦',
      'Hydration reminder: Drink a glass of water 🥤',
      "Don't forget to drink water! 💙",
      'Keep your body hydrated! Time for water 💧',
    ];

    const now = new Date();
    const startTime = new Date(now);
    startTime.setHours(8, 0, 0, 0);
    const endTime = new Date(now);
    endTime.setHours(22, 0, 0, 0);

    let currentTime = new Date(Math.max(startTime.getTime(), now.getTime()));

    while (currentTime < endTime) {
      currentTime = new Date(currentTime.getTime() + settings.interval * 60 * 1000);
      
      if (currentTime < endTime) {
        const secondsUntil = Math.floor((currentTime.getTime() - now.getTime()) / 1000);
        
        if (secondsUntil > 0) {
          await Notifications.scheduleNotificationAsync({
            content: {
              title: 'Hydration Reminder',
              body: messages[Math.floor(Math.random() * messages.length)],
              sound: true,
              priority: Notifications.AndroidNotificationPriority.DEFAULT,
            },
            trigger: secondsUntil as unknown as Notifications.NotificationTriggerInput,
          });
        }
      }
    }
  };

  const cancelNotifications = async () => {
    if (Platform.OS === 'web') return;
    await Notifications.cancelAllScheduledNotificationsAsync();
  };

  const getRecommendedIntake = (): number => {
    let recommended = settings.dailyGoal;

    if (selectedActivity === 'Moderate') {
      recommended += 2;
    } else if (selectedActivity === 'Very Active') {
      recommended += 4;
    }

    if (settings.weatherAdjustment) {
      if (selectedWeather === 'Hot (>85°F)') {
        recommended += 2;
      } else if (selectedWeather === 'Sunny') {
        recommended += 1;
      }
    }

    return recommended;
  };

  const recommendedIntake = getRecommendedIntake();
  const progress = Math.min((todayIntake / recommendedIntake) * 100, 100);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Stack.Screen options={{ headerShown: false }} />
      <LinearGradient
        colors={[Colors.background, Colors.surface]}
        style={StyleSheet.absoluteFillObject}
      />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <ArrowLeft size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Hydration</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.progressCard}>
          <View style={styles.progressHeader}>
            <Droplets size={32} color={Colors.cyan} />
            <Text style={styles.progressTitle}>Today&apos;s Hydration</Text>
          </View>

          <View style={styles.progressCircle}>
            <View style={styles.progressValue}>
              <Text style={styles.progressAmount}>{todayIntake}</Text>
              <Text style={styles.progressGoal}>/ {recommendedIntake} cups</Text>
            </View>
          </View>

          <View style={styles.progressBar}>
            <View style={styles.progressBarBg}>
              <LinearGradient
                colors={[Colors.cyan, Colors.blue]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[styles.progressBarFill, { width: `${progress}%` }]}
              />
            </View>
            <Text style={styles.progressPercent}>{Math.round(progress)}%</Text>
          </View>

          <View style={styles.quickActions}>
            <TouchableOpacity style={styles.quickActionBtn} onPress={() => addWater(0.5)}>
              <Droplets size={20} color={Colors.white} />
              <Text style={styles.quickActionText}>½ Cup</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.quickActionBtn} onPress={() => addWater(1)}>
              <Droplets size={24} color={Colors.white} />
              <Text style={styles.quickActionText}>1 Cup</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.quickActionBtn} onPress={() => addWater(2)}>
              <Droplets size={28} color={Colors.white} />
              <Text style={styles.quickActionText}>2 Cups</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Activity size={20} color={Colors.primary} />
            <Text style={styles.sectionTitle}>Activity Level</Text>
          </View>
          <View style={styles.optionsGrid}>
            {ACTIVITY_LEVELS.map(level => (
              <TouchableOpacity
                key={level}
                style={[
                  styles.optionCard,
                  selectedActivity === level && styles.optionCardActive,
                ]}
                onPress={() => setSelectedActivity(level)}
              >
                <Text
                  style={[
                    styles.optionText,
                    selectedActivity === level && styles.optionTextActive,
                  ]}
                >
                  {level}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Sun size={20} color={Colors.accent} />
            <Text style={styles.sectionTitle}>Weather Condition</Text>
          </View>
          <View style={styles.optionsGrid}>
            {WEATHER_CONDITIONS.map(weather => (
              <TouchableOpacity
                key={weather}
                style={[
                  styles.optionCard,
                  selectedWeather === weather && styles.optionCardActive,
                ]}
                onPress={() => setSelectedWeather(weather)}
              >
                {weather.includes('Rainy') && <CloudRain size={16} color={selectedWeather === weather ? Colors.white : Colors.textMuted} />}
                {weather.includes('Sunny') && <Sun size={16} color={selectedWeather === weather ? Colors.white : Colors.textMuted} />}
                <Text
                  style={[
                    styles.optionText,
                    selectedWeather === weather && styles.optionTextActive,
                  ]}
                >
                  {weather}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Bell size={20} color={Colors.primary} />
            <Text style={styles.sectionTitle}>Reminders</Text>
          </View>
          <View style={styles.settingCard}>
            <View style={styles.settingRow}>
              <Text style={styles.settingLabel}>Enable Reminders</Text>
              <Switch
                value={settings.enabled}
                onValueChange={enabled => saveSettings({ ...settings, enabled })}
                trackColor={{ false: Colors.border, true: Colors.primary + '60' }}
                thumbColor={settings.enabled ? Colors.primary : Colors.textMuted}
              />
            </View>

            {settings.enabled && (
              <>
                <View style={styles.settingRow}>
                  <Text style={styles.settingLabel}>Reminder Interval</Text>
                  <View style={styles.intervalControls}>
                    <TouchableOpacity
                      style={styles.intervalBtn}
                      onPress={() =>
                        saveSettings({
                          ...settings,
                          interval: Math.max(30, settings.interval - 30),
                        })
                      }
                    >
                      <Minus size={16} color={Colors.primary} />
                    </TouchableOpacity>
                    <Text style={styles.intervalText}>{settings.interval} min</Text>
                    <TouchableOpacity
                      style={styles.intervalBtn}
                      onPress={() =>
                        saveSettings({
                          ...settings,
                          interval: Math.min(240, settings.interval + 30),
                        })
                      }
                    >
                      <Plus size={16} color={Colors.primary} />
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={styles.settingRow}>
                  <Text style={styles.settingLabel}>Daily Goal</Text>
                  <View style={styles.intervalControls}>
                    <TouchableOpacity
                      style={styles.intervalBtn}
                      onPress={() =>
                        saveSettings({
                          ...settings,
                          dailyGoal: Math.max(4, settings.dailyGoal - 1),
                        })
                      }
                    >
                      <Minus size={16} color={Colors.primary} />
                    </TouchableOpacity>
                    <Text style={styles.intervalText}>{settings.dailyGoal} cups</Text>
                    <TouchableOpacity
                      style={styles.intervalBtn}
                      onPress={() =>
                        saveSettings({
                          ...settings,
                          dailyGoal: Math.min(16, settings.dailyGoal + 1),
                        })
                      }
                    >
                      <Plus size={16} color={Colors.primary} />
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={styles.settingRow}>
                  <Text style={styles.settingLabel}>Weather Adjustment</Text>
                  <Switch
                    value={settings.weatherAdjustment}
                    onValueChange={weatherAdjustment =>
                      saveSettings({ ...settings, weatherAdjustment })
                    }
                    trackColor={{ false: Colors.border, true: Colors.primary + '60' }}
                    thumbColor={settings.weatherAdjustment ? Colors.primary : Colors.textMuted}
                  />
                </View>
              </>
            )}
          </View>
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>💡 Smart Hydration Tips</Text>
          <Text style={styles.infoText}>
            • Increase water intake during physical activity{'\n'}
            • Hot weather requires more hydration{'\n'}
            • Listen to your body&apos;s thirst signals{'\n'}
            • Morning hydration helps kickstart your metabolism
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  progressCard: {
    backgroundColor: Colors.cardBg,
    borderRadius: 24,
    padding: 24,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  progressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 24,
  },
  progressTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  progressCircle: {
    alignItems: 'center',
    marginBottom: 24,
  },
  progressValue: {
    alignItems: 'center',
  },
  progressAmount: {
    fontSize: 64,
    fontWeight: '700' as const,
    color: Colors.cyan,
  },
  progressGoal: {
    fontSize: 18,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  progressBar: {
    marginBottom: 24,
  },
  progressBarBg: {
    height: 12,
    backgroundColor: Colors.surfaceLight,
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 6,
  },
  progressPercent: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  quickActions: {
    flexDirection: 'row',
    gap: 12,
  },
  quickActionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: Colors.cyan,
    paddingVertical: 14,
    borderRadius: 12,
  },
  quickActionText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.white,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.surfaceLight,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.border,
  },
  optionCardActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  optionText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  optionTextActive: {
    color: Colors.white,
  },
  settingCard: {
    backgroundColor: Colors.cardBg,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '500' as const,
    color: Colors.text,
  },
  intervalControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  intervalBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.primary + '20',
    alignItems: 'center',
    justifyContent: 'center',
  },
  intervalText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.text,
    minWidth: 80,
    textAlign: 'center',
  },
  infoCard: {
    backgroundColor: Colors.cyan + '15',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.cyan + '30',
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.text,
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    color: Colors.text,
    lineHeight: 22,
  },
});
