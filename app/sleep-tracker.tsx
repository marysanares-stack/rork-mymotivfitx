import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Modal,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Moon,
  Sun,
  Clock,
  TrendingUp,
  Calendar,
  ChevronLeft,
  Plus,
  X,
} from 'lucide-react-native';
import { useFitness } from '@/contexts/FitnessContext';
import Colors from '@/constants/colors';
import { router } from 'expo-router';
import { SleepQuality } from '@/types';
import DateTimePicker from '@react-native-community/datetimepicker';

const qualityOptions: { value: SleepQuality; label: string; emoji: string; color: string }[] = [
  { value: 'poor', label: 'Poor', emoji: '😴', color: Colors.red },
  { value: 'fair', label: 'Fair', emoji: '😐', color: Colors.orange },
  { value: 'good', label: 'Good', emoji: '😊', color: Colors.blue },
  { value: 'excellent', label: 'Excellent', emoji: '😄', color: Colors.green },
];

export default function SleepTrackerScreen() {
  const insets = useSafeAreaInsets();
  const { sleepEntries, addSleepEntry, getLastSleepEntry, getAverageSleepDuration } = useFitness();
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [bedTime, setBedTime] = useState(new Date());
  const [wakeTime, setWakeTime] = useState(new Date());
  const [quality, setQuality] = useState<SleepQuality>('good');
  const [notes, setNotes] = useState('');
  const [interruptions, setInterruptions] = useState('0');
  const [showBedTimePicker, setShowBedTimePicker] = useState(false);
  const [showWakeTimePicker, setShowWakeTimePicker] = useState(false);

  const lastSleep = getLastSleepEntry();
  const avgSleep7Days = getAverageSleepDuration(7);
  const avgSleep30Days = getAverageSleepDuration(30);

  const recentSleep = useMemo(() => {
    return [...sleepEntries]
      .sort((a, b) => new Date(b.wakeTime).getTime() - new Date(a.wakeTime).getTime())
      .slice(0, 7);
  }, [sleepEntries]);

  const handleAddSleep = () => {
    const duration = (wakeTime.getTime() - bedTime.getTime()) / (1000 * 60 * 60);
    
    if (duration <= 0 || duration > 24) {
      alert('Please select valid sleep times');
      return;
    }

    addSleepEntry({
      bedTime: bedTime.toISOString(),
      wakeTime: wakeTime.toISOString(),
      duration,
      quality,
      notes: notes.trim() || undefined,
      interruptions: parseInt(interruptions) || 0,
    });

    setShowAddModal(false);
    setBedTime(new Date());
    setWakeTime(new Date());
    setQuality('good');
    setNotes('');
    setInterruptions('0');
  };

  const formatTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  const formatDuration = (hours: number) => {
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    return `${h}h ${m}m`;
  };

  const getQualityColor = (q: SleepQuality) => {
    return qualityOptions.find(opt => opt.value === q)?.color || Colors.blue;
  };

  const getQualityEmoji = (q: SleepQuality) => {
    return qualityOptions.find(opt => opt.value === q)?.emoji || '😊';
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <LinearGradient
        colors={[Colors.background, Colors.surface]}
        style={StyleSheet.absoluteFillObject}
      />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ChevronLeft size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Sleep Tracker</Text>
        <TouchableOpacity onPress={() => setShowAddModal(true)} style={styles.addButton}>
          <Plus size={24} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {lastSleep && (
          <View style={styles.lastSleepCard}>
            <LinearGradient
              colors={[Colors.indigo, Colors.purple]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.lastSleepGradient}
            >
              <View style={styles.lastSleepHeader}>
                <Moon size={32} color={Colors.white} />
                <Text style={styles.lastSleepTitle}>Last Night&apos;s Sleep</Text>
              </View>
              <Text style={styles.lastSleepDuration}>
                {formatDuration(lastSleep.duration)}
              </Text>
              <View style={styles.lastSleepDetails}>
                <View style={styles.lastSleepDetail}>
                  <Moon size={16} color={Colors.white} />
                  <Text style={styles.lastSleepDetailText}>
                    {formatTime(lastSleep.bedTime)}
                  </Text>
                </View>
                <View style={styles.lastSleepDetail}>
                  <Sun size={16} color={Colors.white} />
                  <Text style={styles.lastSleepDetailText}>
                    {formatTime(lastSleep.wakeTime)}
                  </Text>
                </View>
                <View style={styles.lastSleepDetail}>
                  <Text style={styles.lastSleepEmoji}>
                    {getQualityEmoji(lastSleep.quality)}
                  </Text>
                  <Text style={styles.lastSleepDetailText}>
                    {lastSleep.quality.charAt(0).toUpperCase() + lastSleep.quality.slice(1)}
                  </Text>
                </View>
              </View>
            </LinearGradient>
          </View>
        )}

        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <View style={styles.statIcon}>
              <TrendingUp size={20} color={Colors.blue} />
            </View>
            <Text style={styles.statValue}>{formatDuration(avgSleep7Days)}</Text>
            <Text style={styles.statLabel}>7-Day Average</Text>
          </View>

          <View style={styles.statCard}>
            <View style={styles.statIcon}>
              <Calendar size={20} color={Colors.green} />
            </View>
            <Text style={styles.statValue}>{formatDuration(avgSleep30Days)}</Text>
            <Text style={styles.statLabel}>30-Day Average</Text>
          </View>

          <View style={styles.statCard}>
            <View style={styles.statIcon}>
              <Clock size={20} color={Colors.purple} />
            </View>
            <Text style={styles.statValue}>{sleepEntries.length}</Text>
            <Text style={styles.statLabel}>Total Logs</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Sleep</Text>
          {recentSleep.length === 0 ? (
            <View style={styles.emptyState}>
              <Moon size={48} color={Colors.textMuted} />
              <Text style={styles.emptyText}>No sleep entries yet</Text>
              <Text style={styles.emptySubtext}>
                Track your sleep to see insights
              </Text>
            </View>
          ) : (
            recentSleep.map((entry) => (
              <View key={entry.id} style={styles.sleepCard}>
                <View style={styles.sleepCardHeader}>
                  <View style={styles.sleepCardDate}>
                    <Calendar size={16} color={Colors.textSecondary} />
                    <Text style={styles.sleepCardDateText}>
                      {formatDate(entry.wakeTime)}
                    </Text>
                  </View>
                  <Text style={styles.sleepCardEmoji}>
                    {getQualityEmoji(entry.quality)}
                  </Text>
                </View>

                <View style={styles.sleepCardContent}>
                  <View style={styles.sleepCardTime}>
                    <View style={styles.sleepTimeRow}>
                      <Moon size={16} color={Colors.indigo} />
                      <Text style={styles.sleepTimeText}>
                        {formatTime(entry.bedTime)}
                      </Text>
                    </View>
                    <View style={styles.sleepTimeRow}>
                      <Sun size={16} color={Colors.orange} />
                      <Text style={styles.sleepTimeText}>
                        {formatTime(entry.wakeTime)}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.sleepCardStats}>
                    <Text style={styles.sleepDuration}>
                      {formatDuration(entry.duration)}
                    </Text>
                    {entry.interruptions !== undefined && entry.interruptions > 0 && (
                      <Text style={styles.sleepInterruptions}>
                        {entry.interruptions} interruption{entry.interruptions !== 1 ? 's' : ''}
                      </Text>
                    )}
                  </View>
                </View>

                {entry.notes && (
                  <Text style={styles.sleepNotes}>{entry.notes}</Text>
                )}

                <View style={styles.qualityBar}>
                  <View
                    style={[
                      styles.qualityBarFill,
                      {
                        width:
                          entry.quality === 'poor'
                            ? '25%'
                            : entry.quality === 'fair'
                            ? '50%'
                            : entry.quality === 'good'
                            ? '75%'
                            : '100%',
                        backgroundColor: getQualityColor(entry.quality),
                      },
                    ]}
                  />
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>

      <Modal
        visible={showAddModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowAddModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { paddingBottom: insets.bottom + 20 }]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Log Sleep</Text>
              <TouchableOpacity onPress={() => setShowAddModal(false)}>
                <X size={24} color={Colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.formSection}>
                <Text style={styles.formLabel}>Bed Time</Text>
                <TouchableOpacity
                  style={styles.timeButton}
                  onPress={() => setShowBedTimePicker(true)}
                >
                  <Moon size={20} color={Colors.indigo} />
                  <Text style={styles.timeButtonText}>
                    {bedTime.toLocaleTimeString('en-US', {
                      hour: 'numeric',
                      minute: '2-digit',
                      hour12: true,
                    })}
                  </Text>
                </TouchableOpacity>
                {showBedTimePicker && (
                  <DateTimePicker
                    value={bedTime}
                    mode="time"
                    is24Hour={false}
                    onChange={(_event, date) => {
                      setShowBedTimePicker(Platform.OS === 'ios');
                      if (date) setBedTime(date);
                    }}
                  />
                )}
              </View>

              <View style={styles.formSection}>
                <Text style={styles.formLabel}>Wake Time</Text>
                <TouchableOpacity
                  style={styles.timeButton}
                  onPress={() => setShowWakeTimePicker(true)}
                >
                  <Sun size={20} color={Colors.orange} />
                  <Text style={styles.timeButtonText}>
                    {wakeTime.toLocaleTimeString('en-US', {
                      hour: 'numeric',
                      minute: '2-digit',
                      hour12: true,
                    })}
                  </Text>
                </TouchableOpacity>
                {showWakeTimePicker && (
                  <DateTimePicker
                    value={wakeTime}
                    mode="time"
                    is24Hour={false}
                    onChange={(_event, date) => {
                      setShowWakeTimePicker(Platform.OS === 'ios');
                      if (date) setWakeTime(date);
                    }}
                  />
                )}
              </View>

              <View style={styles.formSection}>
                <Text style={styles.formLabel}>Sleep Quality</Text>
                <View style={styles.qualityOptions}>
                  {qualityOptions.map((option) => (
                    <TouchableOpacity
                      key={option.value}
                      style={[
                        styles.qualityOption,
                        quality === option.value && {
                          backgroundColor: option.color + '20',
                          borderColor: option.color,
                        },
                      ]}
                      onPress={() => setQuality(option.value)}
                    >
                      <Text style={styles.qualityEmoji}>{option.emoji}</Text>
                      <Text
                        style={[
                          styles.qualityLabel,
                          quality === option.value && { color: option.color },
                        ]}
                      >
                        {option.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.formSection}>
                <Text style={styles.formLabel}>Interruptions (optional)</Text>
                <TextInput
                  style={styles.input}
                  value={interruptions}
                  onChangeText={setInterruptions}
                  keyboardType="number-pad"
                  placeholder="0"
                  placeholderTextColor={Colors.textMuted}
                />
              </View>

              <View style={styles.formSection}>
                <Text style={styles.formLabel}>Notes (optional)</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={notes}
                  onChangeText={setNotes}
                  placeholder="How did you sleep?"
                  placeholderTextColor={Colors.textMuted}
                  multiline
                  numberOfLines={3}
                />
              </View>

              <TouchableOpacity
                style={styles.submitButton}
                onPress={handleAddSleep}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={[Colors.indigo, Colors.purple]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.submitGradient}
                >
                  <Text style={styles.submitText}>Log Sleep</Text>
                </LinearGradient>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
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
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  addButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingTop: 0,
    paddingBottom: 40,
  },
  lastSleepCard: {
    marginBottom: 20,
    borderRadius: 24,
    overflow: 'hidden',
  },
  lastSleepGradient: {
    padding: 24,
  },
  lastSleepHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  lastSleepTitle: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: Colors.white,
  },
  lastSleepDuration: {
    fontSize: 48,
    fontWeight: '700' as const,
    color: Colors.white,
    marginBottom: 16,
  },
  lastSleepDetails: {
    flexDirection: 'row',
    gap: 20,
  },
  lastSleepDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  lastSleepDetailText: {
    fontSize: 14,
    color: Colors.white,
    opacity: 0.9,
  },
  lastSleepEmoji: {
    fontSize: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
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
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: Colors.surfaceLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.text,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.text,
    marginBottom: 16,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: Colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  sleepCard: {
    backgroundColor: Colors.cardBg,
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  sleepCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sleepCardDate: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  sleepCardDateText: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '600' as const,
  },
  sleepCardEmoji: {
    fontSize: 24,
  },
  sleepCardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  sleepCardTime: {
    gap: 8,
  },
  sleepTimeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sleepTimeText: {
    fontSize: 14,
    color: Colors.text,
    fontWeight: '500' as const,
  },
  sleepCardStats: {
    alignItems: 'flex-end',
  },
  sleepDuration: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  sleepInterruptions: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  sleepNotes: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontStyle: 'italic',
    marginBottom: 12,
  },
  qualityBar: {
    height: 4,
    backgroundColor: Colors.surfaceLight,
    borderRadius: 2,
    overflow: 'hidden',
  },
  qualityBarFill: {
    height: '100%',
    borderRadius: 2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  formSection: {
    marginBottom: 24,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.text,
    marginBottom: 12,
  },
  timeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: Colors.cardBg,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  timeButtonText: {
    fontSize: 16,
    color: Colors.text,
    fontWeight: '600' as const,
  },
  qualityOptions: {
    flexDirection: 'row',
    gap: 8,
  },
  qualityOption: {
    flex: 1,
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    backgroundColor: Colors.cardBg,
    borderWidth: 2,
    borderColor: Colors.border,
  },
  qualityEmoji: {
    fontSize: 24,
    marginBottom: 4,
  },
  qualityLabel: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  input: {
    backgroundColor: Colors.cardBg,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    fontSize: 16,
    color: Colors.text,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  submitButton: {
    borderRadius: 16,
    overflow: 'hidden',
    marginTop: 8,
  },
  submitGradient: {
    padding: 18,
    alignItems: 'center',
  },
  submitText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.white,
  },
});
