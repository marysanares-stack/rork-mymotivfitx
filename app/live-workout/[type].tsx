import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Play,
  Pause,
  Square,
  Flame,
  Clock,
  Footprints,
  Heart,
  X,
} from 'lucide-react-native';
import { router, useLocalSearchParams, Stack } from 'expo-router';
import { useFitness } from '@/contexts/FitnessContext';
import Colors from '@/constants/colors';
import { ACTIVITY_TYPES } from '@/mocks/data';
import { ActivityType } from '@/types';
import * as Haptics from 'expo-haptics';

export default function LiveWorkoutScreen() {
  const insets = useSafeAreaInsets();
  const { type } = useLocalSearchParams<{ type: string }>();
  const { addActivity } = useFitness();
  
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [calories, setCalories] = useState(0);
  const [steps, setSteps] = useState(0);
  const [distance, setDistance] = useState(0);
  const [heartRate, setHeartRate] = useState(0);

  const pulseAnim = useRef(new Animated.Value(1)).current;
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number>(0);
  const pausedTimeRef = useRef<number>(0);

  const activityType = (type as ActivityType) || 'walking';
  const activityInfo = ACTIVITY_TYPES.find(a => a.value === activityType) || ACTIVITY_TYPES[0];

  useEffect(() => {
    if (isRunning && !isPaused) {
      const heartRateInterval = setInterval(() => {
        setHeartRate(Math.floor(Math.random() * (160 - 120 + 1)) + 120);
      }, 2000);

      return () => clearInterval(heartRateInterval);
    }
  }, [isRunning, isPaused]);

  useEffect(() => {
    if (isRunning && !isPaused) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.1,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [isRunning, isPaused, pulseAnim]);

  useEffect(() => {
    if (isRunning && !isPaused) {
      intervalRef.current = setInterval(() => {
        setElapsedSeconds(prev => {
          const newSeconds = prev + 1;
          
          const calorieRate = getCalorieRate(activityType);
          setCalories(Math.floor((newSeconds / 60) * calorieRate));
          
          const stepsRate = getStepsRate(activityType);
          if (stepsRate > 0) {
            setSteps(Math.floor((newSeconds / 60) * stepsRate));
          }
          
          const distanceRate = getDistanceRate(activityType);
          if (distanceRate > 0) {
            setDistance(parseFloat(((newSeconds / 3600) * distanceRate).toFixed(2)));
          }
          
          return newSeconds;
        });
      }, 1000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, isPaused, activityType]);

  const getCalorieRate = (type: ActivityType): number => {
    const rates: Record<string, number> = {
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
    return rates[type] || 5;
  };

  const getStepsRate = (type: ActivityType): number => {
    const rates: Record<string, number> = {
      running: 160,
      walking: 100,
      hiking: 110,
      dance: 120,
      zumba: 130,
      martial_arts: 90,
      tai_chi: 60,
    };
    return rates[type] || 0;
  };

  const getDistanceRate = (type: ActivityType): number => {
    const rates: Record<string, number> = {
      running: 10,
      walking: 5,
      cycling: 20,
      swimming: 3,
      hiking: 4,
    };
    return rates[type] || 0;
  };

  const handleStartPause = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    if (!isRunning) {
      setIsRunning(true);
      startTimeRef.current = Date.now();
    } else {
      if (isPaused) {
        setIsPaused(false);
        const pauseDuration = Date.now() - pausedTimeRef.current;
        startTimeRef.current += pauseDuration;
      } else {
        setIsPaused(true);
        pausedTimeRef.current = Date.now();
      }
    }
  };

  const handleStop = () => {
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }

    if (elapsedSeconds < 60) {
      router.back();
      return;
    }

    const durationMinutes = Math.floor(elapsedSeconds / 60);
    
    addActivity({
      type: activityType,
      name: `${activityInfo.label} Session`,
      duration: durationMinutes,
      calories: calories,
      distance: distance > 0 ? distance : undefined,
      steps: steps > 0 ? steps : undefined,
      notes: `Completed ${formatTime(elapsedSeconds)} of ${activityInfo.label.toLowerCase()}`,
    });

    router.back();
  };

  const handleCancel = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    router.back();
  };

  const formatTime = (seconds: number): string => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />
      
      <LinearGradient
        colors={[activityInfo.color, Colors.background]}
        style={StyleSheet.absoluteFillObject}
      />

      <View style={styles.header}>
        <TouchableOpacity
          onPress={handleCancel}
          style={styles.closeButton}
          activeOpacity={0.7}
        >
          <X size={24} color={Colors.white} />
        </TouchableOpacity>
        <Text style={styles.activityTitle}>{activityInfo.label}</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.content}>
        <View style={styles.emojiContainer}>
          <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
            <Text style={styles.activityEmoji}>{activityInfo.icon}</Text>
          </Animated.View>
        </View>

        <View style={styles.timerContainer}>
          <Text style={styles.timerLabel}>Duration</Text>
          <Text style={styles.timerText}>{formatTime(elapsedSeconds)}</Text>
        </View>

        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: Colors.orange + '30' }]}>
              <Flame size={24} color={Colors.white} />
            </View>
            <Text style={styles.statValue}>{calories}</Text>
            <Text style={styles.statLabel}>Calories</Text>
          </View>

          {steps > 0 && (
            <View style={styles.statCard}>
              <View style={[styles.statIcon, { backgroundColor: Colors.blue + '30' }]}>
                <Footprints size={24} color={Colors.white} />
              </View>
              <Text style={styles.statValue}>{steps.toLocaleString()}</Text>
              <Text style={styles.statLabel}>Steps</Text>
            </View>
          )}

          {distance > 0 && (
            <View style={styles.statCard}>
              <View style={[styles.statIcon, { backgroundColor: Colors.green + '30' }]}>
                <Clock size={24} color={Colors.white} />
              </View>
              <Text style={styles.statValue}>{distance}</Text>
              <Text style={styles.statLabel}>km</Text>
            </View>
          )}

          {isRunning && !isPaused && heartRate > 0 && (
            <View style={styles.statCard}>
              <View style={[styles.statIcon, { backgroundColor: Colors.red + '30' }]}>
                <Heart size={24} color={Colors.white} />
              </View>
              <Text style={styles.statValue}>{heartRate}</Text>
              <Text style={styles.statLabel}>BPM</Text>
            </View>
          )}
        </View>

        {isRunning && (
          <Text style={styles.infoText}>
            {isPaused ? 'Workout paused' : 'Tracking your workout...'}
          </Text>
        )}
        {!isRunning && (
          <Text style={styles.infoText}>
            Press start to begin tracking your {activityInfo.label.toLowerCase()} session
          </Text>
        )}
      </View>

      <View style={[styles.controls, { paddingBottom: insets.bottom + 20 }]}>
        <TouchableOpacity
          style={styles.controlButton}
          onPress={handleStartPause}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={isRunning && !isPaused ? [Colors.orange, Colors.red] : [Colors.green, Colors.cyan]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.controlGradient}
          >
            {!isRunning || isPaused ? (
              <Play size={32} color={Colors.white} fill={Colors.white} />
            ) : (
              <Pause size={32} color={Colors.white} />
            )}
          </LinearGradient>
          <Text style={styles.controlLabel}>
            {!isRunning ? 'Start' : isPaused ? 'Resume' : 'Pause'}
          </Text>
        </TouchableOpacity>

        {isRunning && (
          <TouchableOpacity
            style={styles.controlButton}
            onPress={handleStop}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={[Colors.red, Colors.pink]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.controlGradient}
            >
              <Square size={32} color={Colors.white} fill={Colors.white} />
            </LinearGradient>
            <Text style={styles.controlLabel}>Finish</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  activityTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: Colors.white,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  emojiContainer: {
    marginBottom: 32,
  },
  activityEmoji: {
    fontSize: 80,
  },
  timerContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  timerLabel: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.white,
    opacity: 0.8,
    marginBottom: 8,
  },
  timerText: {
    fontSize: 64,
    fontWeight: '700' as const,
    color: Colors.white,
    fontVariant: ['tabular-nums'],
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 16,
    marginBottom: 24,
  },
  statCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    minWidth: 100,
    backdropFilter: 'blur(10px)',
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: Colors.white,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: Colors.white,
    opacity: 0.8,
  },
  infoText: {
    fontSize: 16,
    color: Colors.white,
    textAlign: 'center',
    opacity: 0.9,
    paddingHorizontal: 40,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 24,
    paddingHorizontal: 20,
  },
  controlButton: {
    alignItems: 'center',
    gap: 12,
  },
  controlGradient: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 8,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  controlLabel: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.white,
  },
});
