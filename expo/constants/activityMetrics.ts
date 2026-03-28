import { ActivityType } from '@/types';

// Calorie burn per minute (rough heuristics)
export const CALORIE_RATE_PER_MIN: Partial<Record<ActivityType, number>> = {
  running: 10,
  swimming: 11,
  cycling: 8,
  walking: 4,
  hiking: 6,
  dance: 7,
  zumba: 8,
  martial_arts: 9,
  strength_training: 6,
  pilates: 5,
  tai_chi: 4,
  yoga: 3,
  other: 5,
};

// Steps per minute (only for activities that produce steps)
export const STEPS_RATE_PER_MIN: Partial<Record<ActivityType, number>> = {
  running: 160,
  walking: 100,
  hiking: 110,
  dance: 120,
  zumba: 130,
  martial_arts: 90,
  tai_chi: 60,
};

// Distance per hour in km (converted to per second where used)
export const DISTANCE_RATE_PER_HOUR_KM: Partial<Record<ActivityType, number>> = {
  running: 10,
  walking: 5,
  cycling: 20,
  swimming: 3,
  hiking: 4,
};

export const getCalorieRate = (type: ActivityType): number =>
  CALORIE_RATE_PER_MIN[type] ?? 5;

export const getStepsRate = (type: ActivityType): number =>
  STEPS_RATE_PER_MIN[type] ?? 0;

export const getDistanceRate = (type: ActivityType): number =>
  DISTANCE_RATE_PER_HOUR_KM[type] ?? 0;
