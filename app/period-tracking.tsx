import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Alert,
} from 'react-native';
import { Stack } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Calendar, Heart, Activity, Droplets, TrendingUp, Info } from 'lucide-react-native';
import Colors from '@/constants/colors';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');
const STORAGE_KEY = '@period_tracking';

interface PeriodEntry {
  id: string;
  startDate: string;
  endDate?: string;
  symptoms: string[];
  mood: string;
  flow: 'light' | 'medium' | 'heavy';
  notes?: string;
}

interface CycleData {
  entries: PeriodEntry[];
  averageCycleLength: number;
  lastPeriod: PeriodEntry | null;
  nextPredicted: string | null;
  ovulationPredicted: string | null;
}

const SYMPTOMS = [
  { id: 'cramps', label: 'Cramps', emoji: '😣' },
  { id: 'headache', label: 'Headache', emoji: '🤕' },
  { id: 'bloating', label: 'Bloating', emoji: '💨' },
  { id: 'fatigue', label: 'Fatigue', emoji: '😴' },
  { id: 'mood_swings', label: 'Mood Swings', emoji: '😢' },
  { id: 'acne', label: 'Acne', emoji: '🔴' },
  { id: 'back_pain', label: 'Back Pain', emoji: '🦴' },
  { id: 'tender_breasts', label: 'Tender Breasts', emoji: '💚' },
];

const MOODS = [
  { id: 'happy', emoji: '😊', label: 'Happy' },
  { id: 'neutral', emoji: '😐', label: 'Neutral' },
  { id: 'sad', emoji: '😢', label: 'Sad' },
  { id: 'irritable', emoji: '😠', label: 'Irritable' },
  { id: 'anxious', emoji: '😰', label: 'Anxious' },
];

export default function PeriodTrackingScreen() {
  const [cycleData, setCycleData] = useState<CycleData>({
    entries: [],
    averageCycleLength: 28,
    lastPeriod: null,
    nextPredicted: null,
    ovulationPredicted: null,
  });
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [selectedMood, setSelectedMood] = useState<string>('neutral');
  const [selectedFlow, setSelectedFlow] = useState<'light' | 'medium' | 'heavy'>('medium');

  // loadData is intentionally called once on mount.
   
  useEffect(() => {
    loadData();
  }, []);

  // saveData / calculatePredictions are stable for our usage here; run when entries change.
   
  useEffect(() => {
    if (cycleData.entries.length > 0) {
      saveData();
      calculatePredictions();
    }
  }, [cycleData.entries]);

  const loadData = async () => {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEY);
      if (data) {
        const parsed = JSON.parse(data);
        setCycleData(parsed);
      }
    } catch (error) {
      console.error('Error loading period data:', error);
    }
  };

  const saveData = async () => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(cycleData));
    } catch (error) {
      console.error('Error saving period data:', error);
    }
  };

  const calculatePredictions = () => {
    if (cycleData.entries.length < 2) return;

    const sortedEntries = [...cycleData.entries].sort((a, b) => 
      new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
    );

    const lastEntry = sortedEntries[0];
    
    const cycleLengths: number[] = [];
    for (let i = 0; i < sortedEntries.length - 1; i++) {
      const current = new Date(sortedEntries[i].startDate);
      const previous = new Date(sortedEntries[i + 1].startDate);
      const diff = Math.floor((current.getTime() - previous.getTime()) / (1000 * 60 * 60 * 24));
      if (diff > 0 && diff < 45) {
        cycleLengths.push(diff);
      }
    }

    const avgCycleLength = cycleLengths.length > 0
      ? Math.round(cycleLengths.reduce((a, b) => a + b, 0) / cycleLengths.length)
      : 28;

    const lastPeriodDate = new Date(lastEntry.startDate);
    const nextPeriodDate = new Date(lastPeriodDate);
    nextPeriodDate.setDate(nextPeriodDate.getDate() + avgCycleLength);

    const ovulationDate = new Date(lastPeriodDate);
    ovulationDate.setDate(ovulationDate.getDate() + Math.floor(avgCycleLength / 2));

    setCycleData({
      ...cycleData,
      averageCycleLength: avgCycleLength,
      lastPeriod: lastEntry,
      nextPredicted: nextPeriodDate.toISOString(),
      ovulationPredicted: ovulationDate.toISOString(),
    });
  };

  const startPeriod = () => {
    const newEntry: PeriodEntry = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      startDate: new Date().toISOString(),
      symptoms: selectedSymptoms,
      mood: selectedMood,
      flow: selectedFlow,
    };

    setCycleData({
      ...cycleData,
      entries: [newEntry, ...cycleData.entries],
    });

    Alert.alert('Period Started', 'Your period has been logged successfully.');
    setSelectedSymptoms([]);
    setSelectedMood('neutral');
    setSelectedFlow('medium');
  };

  const endPeriod = () => {
    if (cycleData.lastPeriod && !cycleData.lastPeriod.endDate) {
      const updated = cycleData.entries.map(entry =>
        entry.id === cycleData.lastPeriod!.id
          ? { ...entry, endDate: new Date().toISOString() }
          : entry
      );
      setCycleData({
        ...cycleData,
        entries: updated,
      });
      Alert.alert('Period Ended', 'Your period end date has been logged.');
    }
  };

  const toggleSymptom = (id: string) => {
    if (selectedSymptoms.includes(id)) {
      setSelectedSymptoms(selectedSymptoms.filter(s => s !== id));
    } else {
      setSelectedSymptoms([...selectedSymptoms, id]);
    }
  };

  const getDaysUntilNext = () => {
    if (!cycleData.nextPredicted) return null;
    const now = new Date();
    const next = new Date(cycleData.nextPredicted);
    const diff = Math.floor((next.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return diff;
  };

  const getDaysUntilOvulation = () => {
    if (!cycleData.ovulationPredicted) return null;
    const now = new Date();
    const ovulation = new Date(cycleData.ovulationPredicted);
    const diff = Math.floor((ovulation.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return diff;
  };

  const getCurrentPhase = () => {
    if (!cycleData.lastPeriod) return 'Unknown';
    
    const lastPeriodDate = new Date(cycleData.lastPeriod.startDate);
    const now = new Date();
    const daysSinceLastPeriod = Math.floor((now.getTime() - lastPeriodDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (cycleData.lastPeriod && !cycleData.lastPeriod.endDate) {
      return 'Menstrual';
    } else if (daysSinceLastPeriod < 14) {
      return 'Follicular';
    } else if (daysSinceLastPeriod < 18) {
      return 'Ovulation';
    } else {
      return 'Luteal';
    }
  };

  const getPhaseInfo = (phase: string) => {
    switch (phase) {
      case 'Menstrual':
        return {
          description: 'Your period is here. Focus on rest and self-care.',
          tips: ['Stay hydrated', 'Use heat for cramps', 'Gentle exercise'],
          color: Colors.red,
        };
      case 'Follicular':
        return {
          description: 'Energy levels rising. Great time for new activities.',
          tips: ['Try new workouts', 'Increase intensity', 'Good for planning'],
          color: Colors.green,
        };
      case 'Ovulation':
        return {
          description: 'Peak fertility window. Highest energy levels.',
          tips: ['Most social time', 'Peak performance', 'High energy workouts'],
          color: Colors.cyan,
        };
      case 'Luteal':
        return {
          description: 'Energy may decrease. Focus on comfort and routine.',
          tips: ['Maintain consistency', 'Watch cravings', 'Practice self-care'],
          color: Colors.purple,
        };
      default:
        return {
          description: 'Track your cycle to see predictions.',
          tips: ['Log your period', 'Track symptoms', 'Monitor patterns'],
          color: Colors.textSecondary,
        };
    }
  };

  const daysUntilNext = getDaysUntilNext();
  const daysUntilOvulation = getDaysUntilOvulation();
  const currentPhase = getCurrentPhase();
  const phaseInfo = getPhaseInfo(currentPhase);
  const isOnPeriod = cycleData.lastPeriod && !cycleData.lastPeriod.endDate;

  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{ 
          title: 'Period Tracking',
          headerStyle: { backgroundColor: Colors.background },
          headerTintColor: Colors.text,
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
        <View style={styles.cycleCard}>
          <LinearGradient
            colors={[phaseInfo.color, phaseInfo.color + 'CC']}
            style={styles.cycleGradient}
          >
            <View style={styles.cycleHeader}>
              <Calendar size={32} color={Colors.white} />
              <View style={styles.cycleInfo}>
                <Text style={styles.cyclePhase}>{currentPhase} Phase</Text>
                <Text style={styles.cycleDays}>
                  {daysUntilNext !== null && daysUntilNext >= 0
                    ? `${daysUntilNext} days until next period`
                    : 'Track your cycle'}
                </Text>
              </View>
            </View>
            <Text style={styles.phaseDescription}>{phaseInfo.description}</Text>
          </LinearGradient>
        </View>

        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Droplets size={24} color={Colors.red} />
            <Text style={styles.statValue}>{cycleData.averageCycleLength}</Text>
            <Text style={styles.statLabel}>Avg Cycle</Text>
          </View>

          <View style={styles.statCard}>
            <Activity size={24} color={Colors.cyan} />
            <Text style={styles.statValue}>
              {daysUntilOvulation !== null && daysUntilOvulation >= 0 ? daysUntilOvulation : '-'}
            </Text>
            <Text style={styles.statLabel}>To Ovulation</Text>
          </View>

          <View style={styles.statCard}>
            <Heart size={24} color={Colors.pink} />
            <Text style={styles.statValue}>{cycleData.entries.length}</Text>
            <Text style={styles.statLabel}>Tracked</Text>
          </View>
        </View>

        <View style={styles.tipsCard}>
          <View style={styles.tipsHeader}>
            <Info size={20} color={phaseInfo.color} />
            <Text style={styles.tipsTitle}>Phase Tips</Text>
          </View>
          {phaseInfo.tips.map((tip, idx) => (
            <View key={idx} style={styles.tipItem}>
              <View style={[styles.tipDot, { backgroundColor: phaseInfo.color }]} />
              <Text style={styles.tipText}>{tip}</Text>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Log Your Period</Text>

          <View style={styles.flowSection}>
            <Text style={styles.subTitle}>Flow Intensity</Text>
            <View style={styles.flowButtons}>
              {['light', 'medium', 'heavy'].map((flow) => (
                <TouchableOpacity
                  key={flow}
                  style={[
                    styles.flowButton,
                    selectedFlow === flow && styles.flowButtonActive
                  ]}
                  onPress={() => setSelectedFlow(flow as any)}
                  activeOpacity={0.7}
                >
                  <Text style={[
                    styles.flowText,
                    selectedFlow === flow && styles.flowTextActive
                  ]}>
                    {flow.charAt(0).toUpperCase() + flow.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.moodsSection}>
            <Text style={styles.subTitle}>How are you feeling?</Text>
            <View style={styles.moodsGrid}>
              {MOODS.map((mood) => (
                <TouchableOpacity
                  key={mood.id}
                  style={[
                    styles.moodButton,
                    selectedMood === mood.id && styles.moodButtonActive
                  ]}
                  onPress={() => setSelectedMood(mood.id)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.moodEmoji}>{mood.emoji}</Text>
                  <Text style={styles.moodLabel}>{mood.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.symptomsSection}>
            <Text style={styles.subTitle}>Symptoms</Text>
            <View style={styles.symptomsGrid}>
              {SYMPTOMS.map((symptom) => (
                <TouchableOpacity
                  key={symptom.id}
                  style={[
                    styles.symptomButton,
                    selectedSymptoms.includes(symptom.id) && styles.symptomButtonActive
                  ]}
                  onPress={() => toggleSymptom(symptom.id)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.symptomEmoji}>{symptom.emoji}</Text>
                  <Text style={styles.symptomLabel}>{symptom.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.actionButtons}>
            {isOnPeriod ? (
              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: Colors.orange }]}
                onPress={endPeriod}
                activeOpacity={0.7}
              >
                <LinearGradient
                  colors={[Colors.orange, Colors.red]}
                  style={styles.actionGradient}
                >
                  <Text style={styles.actionButtonText}>End Period</Text>
                </LinearGradient>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={styles.actionButton}
                onPress={startPeriod}
                activeOpacity={0.7}
              >
                <LinearGradient
                  colors={[Colors.red, Colors.pink]}
                  style={styles.actionGradient}
                >
                  <Text style={styles.actionButtonText}>Start Period</Text>
                </LinearGradient>
              </TouchableOpacity>
            )}
          </View>
        </View>

        <View style={styles.fitnessInsights}>
          <View style={styles.insightsHeader}>
            <TrendingUp size={20} color={Colors.primary} />
            <Text style={styles.insightsTitle}>Fitness Insights</Text>
          </View>
          <Text style={styles.insightsText}>
            Your menstrual cycle affects your energy, strength, and recovery. During the follicular phase (after your period), you may feel stronger and recover faster. During the luteal phase (before your period), prioritize rest and lighter workouts.
          </Text>
          <Text style={styles.insightsText}>
            Listen to your body and adjust your fitness routine based on how you feel throughout your cycle.
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  cycleCard: {
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 20,
    elevation: 4,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  cycleGradient: {
    padding: 20,
  },
  cycleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 16,
  },
  cycleInfo: {
    flex: 1,
  },
  cyclePhase: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: Colors.white,
    marginBottom: 4,
  },
  cycleDays: {
    fontSize: 14,
    color: Colors.white,
    opacity: 0.9,
  },
  phaseDescription: {
    fontSize: 14,
    color: Colors.white,
    opacity: 0.9,
    lineHeight: 20,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.cardBg,
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: Colors.text,
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  tipsCard: {
    backgroundColor: Colors.cardBg,
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  tipsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 6,
  },
  tipDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  tipText: {
    fontSize: 14,
    color: Colors.text,
    flex: 1,
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
  subTitle: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: Colors.text,
    marginBottom: 12,
  },
  flowSection: {
    marginBottom: 24,
  },
  flowButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  flowButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: Colors.cardBg,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
  },
  flowButtonActive: {
    backgroundColor: Colors.red,
    borderColor: Colors.red,
  },
  flowText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.textSecondary,
  },
  flowTextActive: {
    color: Colors.white,
  },
  moodsSection: {
    marginBottom: 24,
  },
  moodsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  moodButton: {
    width: (width - 60) / 3,
    backgroundColor: Colors.cardBg,
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  moodButtonActive: {
    backgroundColor: Colors.primary + '20',
    borderColor: Colors.primary,
  },
  moodEmoji: {
    fontSize: 32,
    marginBottom: 6,
  },
  moodLabel: {
    fontSize: 12,
    color: Colors.text,
    fontWeight: '600' as const,
  },
  symptomsSection: {
    marginBottom: 24,
  },
  symptomsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  symptomButton: {
    width: (width - 60) / 2,
    backgroundColor: Colors.cardBg,
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  symptomButtonActive: {
    backgroundColor: Colors.pink + '20',
    borderColor: Colors.pink,
  },
  symptomEmoji: {
    fontSize: 24,
  },
  symptomLabel: {
    fontSize: 13,
    color: Colors.text,
    fontWeight: '600' as const,
    flex: 1,
  },
  actionButtons: {
    gap: 12,
  },
  actionButton: {
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  actionGradient: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  actionButtonText: {
    fontSize: 17,
    fontWeight: '700' as const,
    color: Colors.white,
  },
  fitnessInsights: {
    backgroundColor: Colors.primary + '15',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.primary + '30',
  },
  insightsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  insightsTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  insightsText: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
    marginBottom: 12,
  },
});
