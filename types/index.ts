export type ActivityType = 
  | 'walking'
  | 'running'
  | 'swimming'
  | 'cycling'
  | 'dance'
  | 'zumba'
  | 'martial_arts'
  | 'strength_training'
  | 'pilates'
  | 'tai_chi'
  | 'yoga'
  | 'hiking'
  | 'other';

export interface Activity {
  id: string;
  userId: string;
  type: ActivityType;
  name: string;
  duration: number;
  calories: number;
  distance?: number;
  steps?: number;
  date: string;
  notes?: string;
}

export interface User {
  id: string;
  backendId?: string; // persisted backend record id
  name: string;
  email: string;
  avatar: string;
  weight?: number;
  height?: number;
  age?: number;
  gender?: 'male' | 'female' | 'other';
  friends: string[];
}

export interface WeightEntry {
  id: string;
  weight: number;
  date: string;
  notes?: string;
}

export interface WaterIntake {
  id: string;
  amount: number;
  date: string;
  goal: number;
}

export interface Mood {
  id: string;
  emoji: string;
  label: string;
  date: string;
  notes?: string;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  type: 'steps' | 'consecutive_days' | 'weight_loss' | 'distance' | 'calories' | 'water' | 'social' | 'friends';
  requirement: number;
  earned: boolean;
  earnedDate?: string;
}

export interface Sticker {
  id: string;
  name: string;
  category: 'medal' | 'emoji' | 'trophy' | 'motivational' | 'achievement' | 'strength' | 'support' | 'celebration' | 'wellness' | 'cardio';
  emoji?: string;
  imageUrl?: string;
}

export interface Gift {
  id: string;
  fromUserId: string;
  toUserId: string;
  sticker: Sticker;
  message?: string;
}

export interface SocialPost {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  type: 'activity' | 'badge' | 'goal' | 'gift';
  activity?: Activity;
  badge?: Badge;
  message?: string;
  gift?: Gift;
  timestamp: string;
  likes: string[];
  comments: Comment[];
}

export interface Comment {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  text: string;
  timestamp: string;
}

export interface DailyStats {
  date: string;
  steps: number;
  calories: number;
  activeMinutes: number;
  distance: number;
  waterIntake: number;
}

export type GoalType =
  | 'weight_target'
  | 'steps_daily'
  | 'active_minutes_daily'
  | 'cardio_minutes_weekly'
  | 'strength_sessions_weekly'
  | 'active_minutes_weekly'
  | 'distance_weekly'
  | 'workout_days_weekly'
  | 'stand_hours_daily'
  | 'mindfulness_minutes_daily'
  | 'floors_climbed_weekly';

export interface Goal {
  id: string;
  type: GoalType;
  title: string;
  targetValue: number;
  unit: string;
  createdAt: string;
  updatedAt: string;
  startValue?: number;
  notes?: string;
  isActive: boolean;
}

export interface GoalProgress {
  goalId: string;
  currentValue: number;
  percentage: number; // 0-100
  periodLabel: string; // e.g., "Today", "This Week"
}

export type SleepQuality = 'poor' | 'fair' | 'good' | 'excellent';

export interface SleepEntry {
  id: string;
  bedTime: string;
  wakeTime: string;
  duration: number;
  quality: SleepQuality;
  notes?: string;
  interruptions?: number;
  deepSleep?: number;
  lightSleep?: number;
  remSleep?: number;
}

export interface MovementReminderSettings {
  enabled: boolean;
  interval: number;
  startTime: string;
  endTime: string;
  notificationIds: string[];
}

export interface FoodEntry {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber?: number;
  sugar?: number;
  sodium?: number;
  servingSize: string;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  date: string;
  notes?: string;
}

export interface NutritionGoals {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface BodyMeasurement {
  id: string;
  date: string;
  weight?: number;
  chest?: number;
  waist?: number;
  hips?: number;
  biceps?: number;
  thighs?: number;
  neck?: number;
  bodyFat?: number;
  notes?: string;
}

export interface ActivityRoute {
  latitude: number;
  longitude: number;
  timestamp: number;
  elevation?: number;
  speed?: number;
}

export interface SwimmingMetrics {
  laps: number;
  strokes: number;
  avgDepth?: number;
  maxDepth?: number;
  poolLength: number;
}

export interface Group {
  id: string;
  name: string;
  description?: string;
  members: string[];
  admin: string;
  createdAt: string;
  avatar: string;
  totalSteps: number;
  totalCalories: number;
  totalDistance: number;
}

export interface GroupChallenge {
  id: string;
  groupId: string;
  name: string;
  type: 'steps' | 'calories' | 'distance' | 'active_days';
  goal: number;
  startDate: string;
  endDate: string;
  participants: string[];
  leaderboard: { userId: string; progress: number }[];
}

export interface Message {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  receiverId?: string;
  groupId?: string;
  text: string;
  timestamp: string;
  read: boolean;
}

export interface Conversation {
  id: string;
  type: 'direct' | 'group';
  participants: string[];
  lastMessage?: Message;
  unreadCount: number;
  name?: string;
  avatar?: string;
}

// Health/Watch sync models
export type HealthMetric =
  | 'steps'
  | 'active_minutes'
  | 'distance'
  | 'heart_rate'
  | 'resting_heart_rate'
  | 'vo2max'
  | 'sleep'
  | 'stand_hours'
  | 'mindfulness_minutes'
  | 'floors_climbed'
  | 'weight';

export type HealthSource = 'apple_health' | 'google_health_connect' | 'manual' | 'mock';

export interface HealthValue {
  metric: HealthMetric;
  value: number;
  unit: string;
}

export interface HealthSample {
  id: string;
  metric: HealthMetric;
  start: string;
  end?: string;
  value?: number;
  unit?: string;
  source: HealthSource;
  metadata?: Record<string, string | number | boolean>;
}

export interface HealthWorkoutSample extends HealthSample {
  activityType?: ActivityType;
  calories?: number;
  distance?: number;
  steps?: number;
}

export type SyncDirection = 'pull' | 'push';
export type SyncStatus = 'pending' | 'running' | 'success' | 'error';

export interface SyncJob {
  id: string;
  direction: SyncDirection;
  metrics: HealthMetric[];
  since?: string;
  until?: string;
  createdAt: string;
  status: SyncStatus;
  errorMessage?: string;
}

export interface Exercise {
  id: string;
  name: string;
  sets?: number;
  reps?: number;
  duration?: number;
  restTime?: number;
  notes?: string;
  targetMuscles?: string[];
}

export interface WorkoutPlan {
  id: string;
  name: string;
  description?: string;
  exercises: Exercise[];
  duration: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  category: 'strength' | 'cardio' | 'flexibility' | 'mixed';
  createdAt: string;
  updatedAt: string;
  isCustom: boolean;
  completedCount: number;
  lastCompleted?: string;
}

export interface WorkoutSession {
  id: string;
  workoutPlanId: string;
  workoutPlanName: string;
  startTime: string;
  endTime: string;
  duration: number;
  calories: number;
  notes?: string;
  exercises: {
    exerciseId: string;
    name: string;
    setsCompleted: number;
    repsCompleted?: number[];
    durationCompleted?: number;
  }[];
}

export type ChallengeType = 'steps' | 'calories' | 'distance' | 'active_minutes' | 'workouts' | 'plank_time';

export interface Challenge {
  id: string;
  name: string;
  description: string;
  type: ChallengeType;
  goal: number;
  unit: string;
  startDate: string;
  endDate: string;
  participants: string[];
  createdBy: string;
  icon?: string;
  isActive: boolean;
}

export interface ChallengeProgress {
  challengeId: string;
  userId: string;
  progress: number;
  lastUpdated: string;
  completed: boolean;
}

export type LeaderboardPeriod = 'weekly' | 'monthly' | 'all-time';
export type LeaderboardMetric = 'steps' | 'calories' | 'distance' | 'active_minutes' | 'workouts';

export interface LeaderboardEntry {
  userId: string;
  userName: string;
  userAvatar: string;
  value: number;
  rank: number;
}
