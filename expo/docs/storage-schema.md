# AsyncStorage Schema (MyMotivFitX)

This document catalogs all AsyncStorage keys, the data shape they store, and purpose / migration notes. Update whenever keys or structures change.

## Conventions
- All keys are versioned implicitly via suffixes (e.g. `:v1`) or by replacing entire structures on upgrade.
- Dates are ISO strings. IDs are usually `${Date.now()}-${random}`.
- When evolving a structure: write a migration routine that reads old format, transforms, then writes new JSON under the same key.

## FitnessContext Keys
| Key | Shape | Purpose |
|-----|-------|---------|
| `@fitness_activities` | `Activity[]` | Logged user activities (type, duration, calories, optional steps/distance/notes). |
| `@fitness_weight` | `WeightEntry[]` | Historical weight entries (weight, date, notes). |
| `@fitness_water` | `WaterIntake[]` | Daily water intake aggregation (amount, goal, date). |
| `@fitness_moods` | `Mood[]` | User mood entries (emoji, label, notes, date). |
| `@fitness_badges` | `Badge[]` | Badge definitions + earned state + earnedDate. |
| `@fitness_stats` | `DailyStats[]` | Aggregated per-day metrics (steps, calories, activeMinutes, distance, waterIntake). |
| `@fitness_sleep` | `SleepEntry[]` | Sleep history (startTime, wakeTime, duration, quality). |
| `@fitness_movement_reminders` | `MovementReminderSettings` | Notification schedule config (enabled, interval, start/end times, notificationIds). |
| `@fitness_goals` | `Goal[]` | User goal definitions (type, targetValue, unit, active state, startValue, timestamps). |
| `@fitness_workout_plans` | `WorkoutPlan[]` | Custom workout plans (sessions, metadata, completion count). |
| `@fitness_workout_sessions` | `WorkoutSession[]` | Executed workout sessions tied to plans. |

## MotivationContext Keys
| Key | Shape | Purpose |
|-----|-------|---------|
| `motivation:seen:v1` | `Record<string, number>` | Map of phrase ID -> first seen timestamp for uniqueness avoidance. |

## HealthSyncContext Keys
| Key | Shape | Purpose |
|-----|-------|---------|
| `healthsync:jobs:v1` | `SyncJob[]` | Queue of pull/push sync jobs with status. |
| `healthsync:sources:v1` | `HealthSource[]` | Detected / authorized health data sources. |
| `healthsync:authorized_metrics:v1` | `AuthorizedMetrics` | Which metrics user allowed (boolean flags). |

## SocialContext Keys
| Key | Shape | Purpose |
|-----|-------|---------|
| `@social_challenges` | `Challenge[]` | Social challenge definitions (participants, time window, type). |
| `@social_challenge_progress` | `ChallengeProgress[]` | Per-user progress snapshots. |

## GroupsContext Keys
| Key | Shape | Purpose |
|-----|-------|---------|
| `@fitness_groups` | `Group[]` | Group definitions (members, avatar, aggregate stats). |
| `@fitness_messages` | `Message[]` | Group & direct messages. |
| `@fitness_challenges` | `GroupChallenge[]` | Group-level challenges (type, goal, leaderboard). |

## Data Shapes ( Interfaces )
Below is a condensed reference of key fields (see `types/` for full definitions).

- `Activity`: `{ id, userId, type, name, duration, calories, steps?, distance?, notes?, date }`
- `WeightEntry`: `{ id, weight, date, notes? }`
- `WaterIntake`: `{ id, amount, date, goal }`
- `Mood`: `{ id, emoji, label, date, notes? }`
- `Badge`: `{ id, name, description, icon, type, requirement, earned, earnedDate? }`
- `DailyStats`: `{ date, steps, calories, activeMinutes, distance, waterIntake }`
- `SleepEntry`: `{ id, startTime, wakeTime, duration, quality? }`
- `MovementReminderSettings`: `{ enabled, interval, startTime, endTime, notificationIds: string[] }`
- `Goal`: `{ id, type, title, targetValue, unit, startValue?, notes?, createdAt, updatedAt, isActive }`
- `WorkoutPlan`: `{ id, title, description?, sessions: Exercise[][], createdAt, updatedAt, completedCount, isCustom, lastCompleted? }`
- `WorkoutSession`: `{ id, workoutPlanId, startTime, endTime, notes?, exercises: Exercise[] }`
- `SyncJob`: `{ id, direction: 'pull'|'push', metrics: HealthMetric[], status, since?, until?, errorMessage?, createdAt }`
- `AuthorizedMetrics`: `Partial<Record<HealthMetric, boolean>>`
- `Challenge`: `{ id, name, type, startDate, endDate, participants: string[] }`
- `ChallengeProgress`: `{ challengeId, userId, progress, lastUpdated, completed }`
- `Group`: `{ id, name, description?, members: string[], admin: string, createdAt, avatar, totalSteps, totalCalories, totalDistance }`
- `Message`: `{ id, senderId, senderName, senderAvatar, receiverId?, groupId?, text, timestamp, read }`
- `GroupChallenge`: `{ id, groupId, name, type, goal, startDate, endDate, participants: string[], leaderboard: {userId, progress}[] }`

## Migration Guidelines
1. Add new optional fields: Just start writing them; old entries parse safely.
2. Remove a field: Provide a cleanup script or handle undefined at usage sites.
3. Change field meaning or type: Use a version bump in key name (e.g., `@fitness_activities_v2`) then migrate once on load.
4. Large data pruning: Consider archiving old arrays under a dated key (e.g., `@fitness_activities_archive_2025Q4`).

## Reset Strategy (Development)
To clear local data for QA:
```ts
await AsyncStorage.multiRemove([
  '@fitness_activities','@fitness_weight','@fitness_water','@fitness_moods','@fitness_badges','@fitness_stats','@fitness_sleep','@fitness_movement_reminders','@fitness_goals','@fitness_workout_plans','@fitness_workout_sessions','motivation:seen:v1','healthsync:jobs:v1','healthsync:sources:v1','healthsync:authorized_metrics:v1','@social_challenges','@social_challenge_progress','@fitness_groups','@fitness_messages','@fitness_challenges'
]);
```
Wrap the snippet in a debug-only screen or dev menu action—never ship it.

## Open Improvements
- Add encryption-at-rest (e.g., secure store) for sensitive metrics if expanded beyond wellness.
- Implement periodic compaction (remove obsolete messages / sessions greater than N months old).
- Add checksum or signature if tamper detection is needed.

---
Maintain this file as the single source of truth for client-side persistence.
