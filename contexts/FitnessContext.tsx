import createContextHook from '@nkzw/create-context-hook';
import { useState, useEffect, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { Activity, DailyStats, WeightEntry, WaterIntake, Mood, Badge, User, SleepEntry, MovementReminderSettings, Goal, GoalProgress, GoalType, ActivityType, WorkoutPlan, WorkoutSession, Exercise } from '@/types';
import { currentUser, MOTIVATIONAL_QUOTES } from '@/mocks/data';
import { trpc } from '@/lib/trpc';

const STORAGE_KEYS = {
  USER: '@fitness_user',
  ACTIVITIES: '@fitness_activities',
  WEIGHT: '@fitness_weight',
  WATER: '@fitness_water',
  MOODS: '@fitness_moods',
  BADGES: '@fitness_badges',
  STATS: '@fitness_stats',
  SLEEP: '@fitness_sleep',
  MOVEMENT_REMINDERS: '@fitness_movement_reminders',
  GOALS: '@fitness_goals',
  WORKOUT_PLANS: '@fitness_workout_plans',
  WORKOUT_SESSIONS: '@fitness_workout_sessions',
};

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

function generateId() {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export const [FitnessProvider, useFitness] = createContextHook(() => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [weightEntries, setWeightEntries] = useState<WeightEntry[]>([]);
  const [waterIntakes, setWaterIntakes] = useState<WaterIntake[]>([]);
  const [moods, setMoods] = useState<Mood[]>([]);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [dailyStats, setDailyStats] = useState<DailyStats[]>([]);
  const [sleepEntries, setSleepEntries] = useState<SleepEntry[]>([]);
  const [user, setUser] = useState<User>(currentUser);
  const [isLoading, setIsLoading] = useState(true);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [workoutPlans, setWorkoutPlans] = useState<WorkoutPlan[]>([]);
  const [workoutSessions, setWorkoutSessions] = useState<WorkoutSession[]>([]);
  const [movementReminderSettings, setMovementReminderSettings] = useState<MovementReminderSettings>({
    enabled: false,
    interval: 60,
    startTime: '08:00',
    endTime: '20:00',
    notificationIds: [],
  });

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (!isLoading && badges.length > 0) {
      checkBadges();
    }
  }, [user.friends, isLoading]);

  const loadData = async () => {
    try {
      const [userData, activitiesData, weightData, waterData, moodsData, badgesData, statsData, sleepData, reminderData, goalsData, plansData, sessionsData] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.USER),
        AsyncStorage.getItem(STORAGE_KEYS.ACTIVITIES),
        AsyncStorage.getItem(STORAGE_KEYS.WEIGHT),
        AsyncStorage.getItem(STORAGE_KEYS.WATER),
        AsyncStorage.getItem(STORAGE_KEYS.MOODS),
        AsyncStorage.getItem(STORAGE_KEYS.BADGES),
        AsyncStorage.getItem(STORAGE_KEYS.STATS),
        AsyncStorage.getItem(STORAGE_KEYS.SLEEP),
        AsyncStorage.getItem(STORAGE_KEYS.MOVEMENT_REMINDERS),
        AsyncStorage.getItem(STORAGE_KEYS.GOALS),
        AsyncStorage.getItem(STORAGE_KEYS.WORKOUT_PLANS),
        AsyncStorage.getItem(STORAGE_KEYS.WORKOUT_SESSIONS),
      ]);

      if (userData) {
        try {
          const parsed = JSON.parse(userData) as User;
          // Ensure friends array is defined
          setUser({ ...currentUser, ...parsed, friends: parsed.friends ?? currentUser.friends ?? [] });
        } catch {}
      }

      if (activitiesData) setActivities(JSON.parse(activitiesData));
      if (weightData) setWeightEntries(JSON.parse(weightData));
      if (waterData) setWaterIntakes(JSON.parse(waterData));
      if (moodsData) setMoods(JSON.parse(moodsData));
      if (badgesData) {
        const loadedBadges = JSON.parse(badgesData);
        const iconMap: Record<string, string> = {
          'badge-steps-10k': 'https://r2-pub.rork.com/generated-images/90590078-d07d-47ef-b5a0-f0c48dc31aaa.png',
          'badge-steps-streak-7': 'https://r2-pub.rork.com/generated-images/5c02807b-e46c-49b3-ad85-11a812f7b9a7.png',
          'badge-weight-loss-10': 'https://r2-pub.rork.com/generated-images/3ba5f10e-b480-4086-8aff-d5e7499ab192.png',
          'badge-calories-5000': 'https://r2-pub.rork.com/generated-images/3fefad56-ea29-45a2-b68a-bc4b3354e991.png',
          'badge-water-30': 'https://r2-pub.rork.com/generated-images/866c4c46-6e75-44f3-9002-ad0f0b6b3209.png',
          'badge-social-butterfly': 'https://r2-pub.rork.com/generated-images/90a0a0a6-66df-4a6a-8e23-8d7b13b9e265.png',
          'badge-top-poster': 'https://r2-pub.rork.com/generated-images/6ad1b4d9-7bd3-44fd-a932-fc68e8c8e7ec.png',
          'badge-motivator': 'https://r2-pub.rork.com/generated-images/171a9c0a-0f56-4bf8-b114-d72655392d0a.png',
        };
        const cleanedBadges = loadedBadges.map((badge: Badge) => {
          return { ...badge, icon: iconMap[badge.id] || badge.icon };
        });
        setBadges(cleanedBadges);
        await AsyncStorage.setItem(STORAGE_KEYS.BADGES, JSON.stringify(cleanedBadges));
      } else {
        initializeBadges();
      }
      if (statsData) setDailyStats(JSON.parse(statsData));
      if (sleepData) setSleepEntries(JSON.parse(sleepData));
      if (goalsData) setGoals(JSON.parse(goalsData));
      if (plansData) setWorkoutPlans(JSON.parse(plansData));
      if (sessionsData) setWorkoutSessions(JSON.parse(sessionsData));
      if (reminderData) {
        const settings = JSON.parse(reminderData);
        setMovementReminderSettings(settings);
        if (settings.enabled && Platform.OS !== 'web') {
          await scheduleMovementReminders(settings);
        }
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // tRPC user mutations
  const createUserMutation = trpc.user.profile.create.useMutation();
  const updateUserMutation = trpc.user.profile.update.useMutation();

  // Bootstrap/sync user with backend
  useEffect(() => {
    const sync = async () => {
      if (isLoading) return;
      try {
        if (!user.backendId) {
          // Create backend user using available local profile fields
          const payload = {
            name: user.name || 'New User',
            email: user.email || `user-${user.id}@example.com`,
            avatar: user.avatar,
            weight: user.weight,
            height: user.height,
            age: user.age,
            gender: (user as any).gender,
          } as any;
          const created = await createUserMutation.mutateAsync(payload);
          await persistUser({ ...user, backendId: (created as any).id });
        }
      } catch (e) {
        console.log('[FitnessContext] Failed to sync user with backend', e);
      }
    };
    void sync();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading]);

  const initializeBadges = () => {
    const initialBadges: Badge[] = [
      {
        id: 'badge-steps-10k',
        name: 'First 10K',
        description: 'Complete 10,000 steps in a day',
        icon: 'https://r2-pub.rork.com/generated-images/90590078-d07d-47ef-b5a0-f0c48dc31aaa.png',
        type: 'steps',
        requirement: 10000,
        earned: false,
      },
      {
        id: 'badge-steps-streak-7',
        name: '7 Day Streak',
        description: 'Log activity for 7 consecutive days',
        icon: 'https://r2-pub.rork.com/generated-images/5c02807b-e46c-49b3-ad85-11a812f7b9a7.png',
        type: 'consecutive_days',
        requirement: 7,
        earned: false,
      },
      {
        id: 'badge-weight-loss-10',
        name: '10 Pounds Down',
        description: 'Lose 10 pounds',
        icon: 'https://r2-pub.rork.com/generated-images/3ba5f10e-b480-4086-8aff-d5e7499ab192.png',
        type: 'weight_loss',
        requirement: 10,
        earned: false,
      },
      {
        id: 'badge-calories-5000',
        name: 'Calorie Crusher',
        description: 'Burn 5,000 calories total',
        icon: 'https://r2-pub.rork.com/generated-images/3fefad56-ea29-45a2-b68a-bc4b3354e991.png',
        type: 'calories',
        requirement: 5000,
        earned: false,
      },
      {
        id: 'badge-water-30',
        name: 'Hydration Hero',
        description: 'Meet water goal for 30 days',
        icon: 'https://r2-pub.rork.com/generated-images/866c4c46-6e75-44f3-9002-ad0f0b6b3209.png',
        type: 'water',
        requirement: 30,
        earned: false,
      },
      {
        id: 'badge-social-butterfly',
        name: 'Social Butterfly',
        description: 'Connect with 5 or more friends',
        icon: 'https://r2-pub.rork.com/generated-images/90a0a0a6-66df-4a6a-8e23-8d7b13b9e265.png',
        type: 'friends',
        requirement: 5,
        earned: false,
      },
      {
        id: 'badge-top-poster',
        name: 'Top Poster',
        description: 'Most posts this week',
        icon: 'https://r2-pub.rork.com/generated-images/6ad1b4d9-7bd3-44fd-a932-fc68e8c8e7ec.png',
        type: 'social',
        requirement: 1,
        earned: false,
      },
      {
        id: 'badge-motivator',
        name: 'The Motivator',
        description: 'Consistently sends motivation to others',
        icon: 'https://r2-pub.rork.com/generated-images/171a9c0a-0f56-4bf8-b114-d72655392d0a.png',
        type: 'social',
        requirement: 1,
        earned: false,
      },
    ];
    setBadges(initialBadges);
    AsyncStorage.setItem(STORAGE_KEYS.BADGES, JSON.stringify(initialBadges));
  };

  const resetBadgeIcons = async () => {
    const iconMap: Record<string, string> = {
      'badge-steps-10k': 'https://r2-pub.rork.com/generated-images/90590078-d07d-47ef-b5a0-f0c48dc31aaa.png',
      'badge-steps-streak-7': 'https://r2-pub.rork.com/generated-images/5c02807b-e46c-49b3-ad85-11a812f7b9a7.png',
      'badge-weight-loss-10': 'https://r2-pub.rork.com/generated-images/3ba5f10e-b480-4086-8aff-d5e7499ab192.png',
      'badge-calories-5000': 'https://r2-pub.rork.com/generated-images/3fefad56-ea29-45a2-b68a-bc4b3354e991.png',
      'badge-water-30': 'https://r2-pub.rork.com/generated-images/866c4c46-6e75-44f3-9002-ad0f0b6b3209.png',
      'badge-social-butterfly': 'https://r2-pub.rork.com/generated-images/90a0a0a6-66df-4a6a-8e23-8d7b13b9e265.png',
      'badge-top-poster': 'https://r2-pub.rork.com/generated-images/6ad1b4d9-7bd3-44fd-a932-fc68e8c8e7ec.png',
      'badge-motivator': 'https://r2-pub.rork.com/generated-images/171a9c0a-0f56-4bf8-b114-d72655392d0a.png',
    };
  const resetBadges = badges.map((badge: Badge) => {
      return { ...badge, icon: iconMap[badge.id] || badge.icon };
    });
    setBadges(resetBadges);
    await AsyncStorage.setItem(STORAGE_KEYS.BADGES, JSON.stringify(resetBadges));
  };

  const saveActivities = async (newActivities: Activity[]) => {
    setActivities(newActivities);
    await AsyncStorage.setItem(STORAGE_KEYS.ACTIVITIES, JSON.stringify(newActivities));
  };

  const addActivity = (activity: Omit<Activity, 'id' | 'userId' | 'date'>) => {
    const newActivity: Activity = {
      ...activity,
      id: generateId(),
      userId: user.id,
      date: new Date().toISOString(),
    };
    const updated = [...activities, newActivity];
    saveActivities(updated);
    updateDailyStats(newActivity);
    checkBadges();
  };

  const updateDailyStats = (activity: Activity) => {
    const today = new Date().toISOString().split('T')[0];
  const existingStats = dailyStats.find((s: DailyStats) => s.date === today);
    
    const updatedStats: DailyStats = {
      date: today,
      steps: (existingStats?.steps || 0) + (activity.steps || 0),
      calories: (existingStats?.calories || 0) + activity.calories,
      activeMinutes: (existingStats?.activeMinutes || 0) + activity.duration,
      distance: (existingStats?.distance || 0) + (activity.distance || 0),
      waterIntake: existingStats?.waterIntake || 0,
    };

  const newStats = dailyStats.filter((s: DailyStats) => s.date !== today);
    newStats.push(updatedStats);
    setDailyStats(newStats);
    AsyncStorage.setItem(STORAGE_KEYS.STATS, JSON.stringify(newStats));
  };

  const addWeightEntry = (weight: number, notes?: string) => {
    const entry: WeightEntry = {
      id: generateId(),
      weight,
      date: new Date().toISOString(),
      notes,
    };
    const updated = [...weightEntries, entry];
    setWeightEntries(updated);
    AsyncStorage.setItem(STORAGE_KEYS.WEIGHT, JSON.stringify(updated));
    checkBadges();
  };

  const addWaterIntake = (amount: number) => {
    const today = new Date().toISOString().split('T')[0];
  const existing = waterIntakes.find((w: WaterIntake) => w.date === today);
    
    let updated: WaterIntake[];
    if (existing) {
  updated = waterIntakes.map((w: WaterIntake) => 
        w.date === today 
          ? { ...w, amount: w.amount + amount }
          : w
      );
    } else {
      const newIntake: WaterIntake = {
        id: generateId(),
        amount,
        date: today,
        goal: 8,
      };
      updated = [...waterIntakes, newIntake];
    }
    
    setWaterIntakes(updated);
    AsyncStorage.setItem(STORAGE_KEYS.WATER, JSON.stringify(updated));
    checkBadges();
  };

  const addMood = (emoji: string, label: string, notes?: string) => {
    const mood: Mood = {
      id: generateId(),
      emoji,
      label,
      date: new Date().toISOString(),
      notes,
    };
    const updated = [...moods, mood];
    setMoods(updated);
    AsyncStorage.setItem(STORAGE_KEYS.MOODS, JSON.stringify(updated));
  };

  const addSleepEntry = (entry: Omit<SleepEntry, 'id'>) => {
    const newEntry: SleepEntry = {
      ...entry,
      id: generateId(),
    };
    const updated = [...sleepEntries, newEntry];
    setSleepEntries(updated);
    AsyncStorage.setItem(STORAGE_KEYS.SLEEP, JSON.stringify(updated));
  };

  const checkBadges = () => {
  const updated = badges.map((badge: Badge) => {
      if (badge.earned) return badge;

      let shouldEarn = false;

      switch (badge.type) {
        case 'steps': {
          const todayStats = getTodayStats();
          shouldEarn = todayStats.steps >= badge.requirement;
          break;
        }
        case 'consecutive_days': {
          const streak = getActivityStreak();
          shouldEarn = streak >= badge.requirement;
          break;
        }
        case 'weight_loss': {
          const loss = getWeightLoss();
          shouldEarn = loss >= badge.requirement;
          break;
        }
        case 'calories': {
          const total = getTotalCalories();
          shouldEarn = total >= badge.requirement;
          break;
        }
        case 'water': {
          const days = getWaterGoalDays();
          shouldEarn = days >= badge.requirement;
          break;
        }
        case 'friends': {
          const friendCount = user.friends?.length || 0;
          shouldEarn = friendCount >= badge.requirement;
          break;
        }
      }

      if (shouldEarn) {
        return { ...badge, earned: true, earnedDate: new Date().toISOString() };
      }
      return badge;
    });

    setBadges(updated);
    AsyncStorage.setItem(STORAGE_KEYS.BADGES, JSON.stringify(updated));
  };

  const getTodayStats = (): DailyStats => {
    const today = new Date().toISOString().split('T')[0];
  return dailyStats.find((s: DailyStats) => s.date === today) || {
      date: today,
      steps: 0,
      calories: 0,
      activeMinutes: 0,
      distance: 0,
      waterIntake: 0,
    };
  };

  const getActivityStreak = (): number => {
  const sortedDates = Array.from(new Set(activities.map((a: Activity) => a.date.split('T')[0]))).sort().reverse();
    let streak = 0;
    const today = new Date();
    
    for (let i = 0; i < sortedDates.length; i++) {
      const expectedDate = new Date(today);
      expectedDate.setDate(today.getDate() - i);
      const expectedDateStr = expectedDate.toISOString().split('T')[0];
      
      if (sortedDates[i] === expectedDateStr) {
        streak++;
      } else {
        break;
      }
    }
    return streak;
  };

  const getWeightLoss = (): number => {
    if (weightEntries.length < 2) return 0;
    const sorted = [...weightEntries].sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    return sorted[0].weight - sorted[sorted.length - 1].weight;
  };

  const getTotalCalories = (): number => {
  return activities.reduce((sum: number, a: Activity) => sum + a.calories, 0);
  };

  const getWaterGoalDays = (): number => {
  return waterIntakes.filter((w: WaterIntake) => w.amount >= w.goal).length;
  };

  const getTodayWaterIntake = (): WaterIntake => {
    const today = new Date().toISOString().split('T')[0];
  return waterIntakes.find((w: WaterIntake) => w.date === today) || {
      id: generateId(),
      amount: 0,
      date: today,
      goal: 8,
    };
  };

  const getTodayMood = (): Mood | null => {
    const today = new Date().toISOString().split('T')[0];
  return moods.find((m: Mood) => m.date.split('T')[0] === today) || null;
  };

  const getLastSleepEntry = (): SleepEntry | null => {
    if (sleepEntries.length === 0) return null;
    const sorted = [...sleepEntries].sort((a, b) => 
      new Date(b.wakeTime).getTime() - new Date(a.wakeTime).getTime()
    );
    return sorted[0];
  };

  const getAverageSleepDuration = (days: number = 7): number => {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
  const recentEntries = sleepEntries.filter((entry: SleepEntry) => 
      new Date(entry.wakeTime).getTime() >= cutoffDate.getTime()
    );
    
    if (recentEntries.length === 0) return 0;
  const total = recentEntries.reduce((sum: number, entry: SleepEntry) => sum + entry.duration, 0);
    return total / recentEntries.length;
  };

  const getMotivationalQuote = (): string => {
    const index = Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length);
    return MOTIVATIONAL_QUOTES[index];
  };

  const cardioTypes: ActivityType[] = ['walking','running','swimming','cycling','dance','zumba','hiking','yoga','tai_chi','pilates'];
  const strengthTypes: ActivityType[] = ['strength_training','martial_arts','pilates','yoga'];

  const getWeekRange = () => {
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - 6);
    start.setHours(0,0,0,0);
    return { start, end };
  };

  const getGoalProgress = (goal: Goal): GoalProgress => {
    const today = new Date().toISOString().split('T')[0];
    switch (goal.type) {
      case 'steps_daily': {
        const s = getTodayStats();
        const current = s.steps;
        return { goalId: goal.id, currentValue: current, percentage: Math.min(100, (current / goal.targetValue) * 100), periodLabel: 'Today' };
      }
      case 'active_minutes_daily': {
        const s = getTodayStats();
        const current = s.activeMinutes;
        return { goalId: goal.id, currentValue: current, percentage: Math.min(100, (current / goal.targetValue) * 100), periodLabel: 'Today' };
      }
      case 'cardio_minutes_weekly': {
        const { start, end } = getWeekRange();
  const total = activities.filter((a: Activity) => {
          const t = new Date(a.date).getTime();
          return t >= start.getTime() && t <= end.getTime() && cardioTypes.includes(a.type);
  }).reduce((sum: number, a: Activity) => sum + a.duration, 0);
        return { goalId: goal.id, currentValue: total, percentage: Math.min(100, (total / goal.targetValue) * 100), periodLabel: 'This Week' };
      }
      case 'strength_sessions_weekly': {
        const { start, end } = getWeekRange();
  const sessions = activities.filter((a: Activity) => {
          const t = new Date(a.date).getTime();
          return t >= start.getTime() && t <= end.getTime() && strengthTypes.includes(a.type);
        }).length;
        return { goalId: goal.id, currentValue: sessions, percentage: Math.min(100, (sessions / goal.targetValue) * 100), periodLabel: 'This Week' };
      }
      case 'active_minutes_weekly': {
        const { start, end } = getWeekRange();
  const total = activities.filter((a: Activity) => {
          const t = new Date(a.date).getTime();
          return t >= start.getTime() && t <= end.getTime();
  }).reduce((sum: number, a: Activity) => sum + a.duration, 0);
        return { goalId: goal.id, currentValue: total, percentage: Math.min(100, (total / goal.targetValue) * 100), periodLabel: 'This Week' };
      }
      case 'distance_weekly': {
        const { start, end } = getWeekRange();
  const total = activities.filter((a: Activity) => {
          const t = new Date(a.date).getTime();
          return t >= start.getTime() && t <= end.getTime();
  }).reduce((sum: number, a: Activity) => sum + (a.distance ?? 0), 0);
        return { goalId: goal.id, currentValue: total, percentage: Math.min(100, (total / goal.targetValue) * 100), periodLabel: 'This Week' };
      }
      case 'workout_days_weekly': {
        const { start, end } = getWeekRange();
        const days = new Set<string>();
  activities.forEach((a: Activity) => {
          const t = new Date(a.date).getTime();
          if (t >= start.getTime() && t <= end.getTime()) {
            days.add(a.date.split('T')[0]);
          }
        });
        const count = days.size;
        return { goalId: goal.id, currentValue: count, percentage: Math.min(100, (count / goal.targetValue) * 100), periodLabel: 'This Week' };
      }
      case 'weight_target': {
        const sorted = [...weightEntries].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        const currentWeight = sorted[0]?.weight ?? user.weight ?? 0;
        const start = goal.startValue ?? currentWeight;
        let progress = 0;
        if (start && goal.targetValue) {
          const totalDelta = Math.abs(start - goal.targetValue);
          const currentDelta = Math.abs(currentWeight - goal.targetValue);
          progress = totalDelta === 0 ? 100 : Math.min(100, ((totalDelta - currentDelta) / totalDelta) * 100);
        }
        return { goalId: goal.id, currentValue: currentWeight, percentage: progress, periodLabel: today };
      }
      case 'stand_hours_daily': {
        // placeholder until watch sync provides actual stand hours
        const current = 0;
        return { goalId: goal.id, currentValue: current, percentage: Math.min(100, (current / goal.targetValue) * 100), periodLabel: 'Today' };
      }
      case 'mindfulness_minutes_daily': {
        const current = 0;
        return { goalId: goal.id, currentValue: current, percentage: Math.min(100, (current / goal.targetValue) * 100), periodLabel: 'Today' };
      }
      case 'floors_climbed_weekly': {
        const current = 0;
        return { goalId: goal.id, currentValue: current, percentage: Math.min(100, (current / goal.targetValue) * 100), periodLabel: 'This Week' };
      }
      default: {
        return { goalId: goal.id, currentValue: 0, percentage: 0, periodLabel: 'Unknown' };
      }
    }
  };

  const upsertGoal = async (partial: Omit<Goal, 'id' | 'createdAt' | 'updatedAt' | 'isActive'> & { id?: string; isActive?: boolean }) => {
    const now = new Date().toISOString();
    let updated: Goal[] = [];
    if (partial.id) {
  updated = goals.map((g: Goal) => g.id === partial.id ? { ...g, ...partial, updatedAt: now, isActive: partial.isActive ?? g.isActive } as Goal : g);
    } else {
      const newGoal: Goal = {
        id: generateId(),
        type: partial.type,
        title: partial.title,
        targetValue: partial.targetValue,
        unit: partial.unit,
        createdAt: now,
        updatedAt: now,
        startValue: partial.startValue ?? (partial.type === 'weight_target' ? (weightEntries[weightEntries.length - 1]?.weight ?? user.weight ?? 0) : undefined),
        notes: partial.notes,
        isActive: partial.isActive ?? true,
      };
      updated = [...goals, newGoal];
    }
    setGoals(updated);
    await AsyncStorage.setItem(STORAGE_KEYS.GOALS, JSON.stringify(updated));
    return updated;
  };

  const removeGoal = async (id: string) => {
  const updated = goals.filter((g: Goal) => g.id !== id);
    setGoals(updated);
    await AsyncStorage.setItem(STORAGE_KEYS.GOALS, JSON.stringify(updated));
  };

  const scheduleMovementReminders = async (settings: MovementReminderSettings) => {
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

    await cancelAllMovementReminders(settings.notificationIds);

    if (!settings.enabled) {
      return;
    }

    const [startHour, startMinute] = settings.startTime.split(':').map(Number);
    const [endHour, endMinute] = settings.endTime.split(':').map(Number);
    
    const now = new Date();
    const startDate = new Date();
    startDate.setHours(startHour, startMinute, 0, 0);
    
    const endDate = new Date();
    endDate.setHours(endHour, endMinute, 0, 0);

    const intervalMinutes = settings.interval;
    const newNotificationIds: string[] = [];

    const messages = [
      'Time to move! Take a quick walk 🚶',
      'Stretch break! Your body will thank you 🧘',
      'Movement reminder: Get up and move around 💪',
      'Quick reminder: Stand up and stretch! 🌟',
      'Take a break and get moving! 🏃',
      "Don't forget to move! Your health matters 💚",
    ];

    let currentTime = new Date(startDate);
    while (currentTime <= endDate) {
      if (currentTime > now) {
        const secondsUntilNotification = Math.floor((currentTime.getTime() - now.getTime()) / 1000);
        
        const notificationId = await Notifications.scheduleNotificationAsync({
          content: {
            title: 'Movement Reminder',
            body: messages[Math.floor(Math.random() * messages.length)],
            sound: true,
            priority: Notifications.AndroidNotificationPriority.DEFAULT,
          },
          trigger: secondsUntilNotification as unknown as Notifications.NotificationTriggerInput,
        });
        
        newNotificationIds.push(notificationId);
      }
      
      currentTime = new Date(currentTime.getTime() + intervalMinutes * 60 * 1000);
    }

    const updatedSettings = {
      ...settings,
      notificationIds: newNotificationIds,
    };
    
    setMovementReminderSettings(updatedSettings);
    await AsyncStorage.setItem(STORAGE_KEYS.MOVEMENT_REMINDERS, JSON.stringify(updatedSettings));
  };

  const cancelAllMovementReminders = async (notificationIds: string[]) => {
    if (Platform.OS === 'web') return;
    
    for (const id of notificationIds) {
      try {
        await Notifications.cancelScheduledNotificationAsync(id);
      } catch (error) {
        console.log('Error canceling notification:', id, error);
      }
    }
  };

  const updateMovementReminderSettings = async (newSettings: Partial<MovementReminderSettings>) => {
    const updatedSettings = {
      ...movementReminderSettings,
      ...newSettings,
    };
    
    setMovementReminderSettings(updatedSettings);
    await AsyncStorage.setItem(STORAGE_KEYS.MOVEMENT_REMINDERS, JSON.stringify(updatedSettings));
    
    if (Platform.OS !== 'web') {
      await scheduleMovementReminders(updatedSettings);
    }
  };

  const persistUser = async (value: User) => {
    setUser(value);
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(value));
    } catch (e) {
      console.log('Failed to persist user', e);
    }
  };

  const updateUserProfile = async (partial: Partial<Omit<User, 'id'>>) => {
    const merged: User = { ...user, ...partial, friends: user.friends ?? [] };
    await persistUser(merged);
    // Update backend if available
    try {
      if (merged.backendId) {
        const data: any = { ...partial };
        // Do not send local-only fields
        delete data.friends;
        await updateUserMutation.mutateAsync({ userId: merged.backendId, data });
      }
    } catch (e) {
      console.log('[FitnessContext] Failed to update backend profile', e);
    }
    return merged;
  };

  const updateAvatar = (avatar: string) => {
    void updateUserProfile({ avatar });
  };

  const addWorkoutPlan = async (plan: Omit<WorkoutPlan, 'id' | 'createdAt' | 'updatedAt' | 'completedCount' | 'isCustom'>) => {
    const now = new Date().toISOString();
    const newPlan: WorkoutPlan = {
      ...plan,
      id: generateId(),
      createdAt: now,
      updatedAt: now,
      completedCount: 0,
      isCustom: true,
    };
    const updated = [...workoutPlans, newPlan];
    setWorkoutPlans(updated);
    await AsyncStorage.setItem(STORAGE_KEYS.WORKOUT_PLANS, JSON.stringify(updated));
    return newPlan;
  };

  const updateWorkoutPlan = async (id: string, updates: Partial<Omit<WorkoutPlan, 'id' | 'createdAt'>>) => {
  const updated = workoutPlans.map((plan: WorkoutPlan) => 
      plan.id === id 
        ? { ...plan, ...updates, updatedAt: new Date().toISOString() }
        : plan
    );
    setWorkoutPlans(updated);
    await AsyncStorage.setItem(STORAGE_KEYS.WORKOUT_PLANS, JSON.stringify(updated));
  };

  const deleteWorkoutPlan = async (id: string) => {
  const updated = workoutPlans.filter((plan: WorkoutPlan) => plan.id !== id);
    setWorkoutPlans(updated);
    await AsyncStorage.setItem(STORAGE_KEYS.WORKOUT_PLANS, JSON.stringify(updated));
  };

  const addWorkoutSession = async (session: Omit<WorkoutSession, 'id'>) => {
    const newSession: WorkoutSession = {
      ...session,
      id: generateId(),
    };
    const updated = [...workoutSessions, newSession];
    setWorkoutSessions(updated);
    await AsyncStorage.setItem(STORAGE_KEYS.WORKOUT_SESSIONS, JSON.stringify(updated));

  const plan = workoutPlans.find((p: WorkoutPlan) => p.id === session.workoutPlanId);
    if (plan) {
      await updateWorkoutPlan(plan.id, {
        completedCount: plan.completedCount + 1,
        lastCompleted: session.endTime,
      });
    }

    return newSession;
  };

  const earnedBadges = useMemo(() => badges.filter((b: Badge) => b.earned), [badges]);
  const recentActivities = useMemo(() => 
    [...activities].sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    ).slice(0, 10)
  , [activities]);
  const recentWorkoutSessions = useMemo(() => 
    [...workoutSessions].sort((a, b) => 
      new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
    )
  , [workoutSessions]);

  return {
    user,
    activities,
    recentActivities,
    weightEntries,
    waterIntakes,
    moods,
    badges,
    earnedBadges,
    dailyStats,
    sleepEntries,
    isLoading,
    movementReminderSettings,
    goals,
    
    addActivity,
    addWeightEntry,
    addWaterIntake,
    addMood,
    addSleepEntry,
    updateAvatar,
  updateUserProfile,
    updateMovementReminderSettings,
    upsertGoal,
    removeGoal,
    resetBadgeIcons,
    
    getTodayStats,
    getTodayWaterIntake,
    getTodayMood,
    getActivityStreak,
    getWeightLoss,
    getTotalCalories,
    getMotivationalQuote,
    getLastSleepEntry,
    getAverageSleepDuration,
    getGoalProgress,
    
    workoutPlans,
    workoutSessions,
    recentWorkoutSessions,
    addWorkoutPlan,
    updateWorkoutPlan,
    deleteWorkoutPlan,
    addWorkoutSession,
  };
});


