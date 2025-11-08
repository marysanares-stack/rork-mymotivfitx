import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Modal,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Plus, X, TrendingDown, TrendingUp, Ruler, Scale } from 'lucide-react-native';
import Colors from '@/constants/colors';

interface BodyMeasurement {
  id: string;
  date: string;
  weight?: number;
  chest?: number;
  waist?: number;
  hips?: number;
  biceps?: number;
  thighs?: number;
  bodyFat?: number;
}

export default function BodyMeasurementsScreen() {
  const insets = useSafeAreaInsets();
  const [measurements, setMeasurements] = useState<BodyMeasurement[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [weight, setWeight] = useState('');
  const [chest, setChest] = useState('');
  const [waist, setWaist] = useState('');
  const [hips, setHips] = useState('');
  const [biceps, setBiceps] = useState('');
  const [thighs, setThighs] = useState('');
  const [bodyFat, setBodyFat] = useState('');

  const handleAddMeasurement = () => {
    const newMeasurement: BodyMeasurement = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      date: new Date().toISOString(),
      weight: weight ? parseFloat(weight) : undefined,
      chest: chest ? parseFloat(chest) : undefined,
      waist: waist ? parseFloat(waist) : undefined,
      hips: hips ? parseFloat(hips) : undefined,
      biceps: biceps ? parseFloat(biceps) : undefined,
      thighs: thighs ? parseFloat(thighs) : undefined,
      bodyFat: bodyFat ? parseFloat(bodyFat) : undefined,
    };

    setMeasurements([newMeasurement, ...measurements]);
    setShowAddModal(false);
    setWeight('');
    setChest('');
    setWaist('');
    setHips('');
    setBiceps('');
    setThighs('');
    setBodyFat('');
  };

  const getLatestMeasurement = () => {
    return measurements.length > 0 ? measurements[0] : null;
  };

  const getPreviousMeasurement = () => {
    return measurements.length > 1 ? measurements[1] : null;
  };

  const getChange = (current?: number, previous?: number) => {
    if (!current || !previous) return null;
    const diff = current - previous;
    return {
      value: Math.abs(diff),
      isPositive: diff > 0,
    };
  };

  const latest = getLatestMeasurement();
  const previous = getPreviousMeasurement();

  const MeasurementCard = ({ 
    label, 
    value, 
    unit, 
    icon: Icon, 
    color 
  }: { 
    label: string; 
    value?: number; 
    unit: string; 
    icon: typeof Ruler; 
    color: string;
  }) => {
    if (!value) return null;

    const prevValue = previous?.[label.toLowerCase() as keyof BodyMeasurement] as number | undefined;
    const change = getChange(value, prevValue);

    return (
      <View style={styles.measurementCard}>
        <View style={[styles.measurementIcon, { backgroundColor: color + '20' }]}>
          <Icon size={20} color={color} />
        </View>
        <View style={styles.measurementContent}>
          <Text style={styles.measurementLabel}>{label}</Text>
          <View style={styles.measurementValueRow}>
            <Text style={styles.measurementValue}>
              {value} <Text style={styles.measurementUnit}>{unit}</Text>
            </Text>
            {change && (
              <View style={[
                styles.changeIndicator,
                { backgroundColor: change.isPositive ? Colors.red + '20' : Colors.green + '20' }
              ]}>
                {change.isPositive ? (
                  <TrendingUp size={14} color={Colors.red} />
                ) : (
                  <TrendingDown size={14} color={Colors.green} />
                )}
                <Text style={[
                  styles.changeText,
                  { color: change.isPositive ? Colors.red : Colors.green }
                ]}>
                  {change.value.toFixed(1)}
                </Text>
              </View>
            )}
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <LinearGradient
        colors={[Colors.background, Colors.surface]}
        style={StyleSheet.absoluteFillObject}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + 60 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Body Measurements</Text>
            <Text style={styles.subtitle}>Track your progress</Text>
          </View>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setShowAddModal(true)}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={[Colors.primary, Colors.purple]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.addButtonGradient}
            >
              <Plus size={24} color={Colors.white} />
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {measurements.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>📏</Text>
            <Text style={styles.emptyTitle}>No measurements yet</Text>
            <Text style={styles.emptyText}>Start tracking your body measurements to see progress!</Text>
          </View>
        ) : (
          <>
            <View style={styles.latestCard}>
              <LinearGradient
                colors={[Colors.purple, Colors.pink]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.latestGradient}
              >
                <Scale size={32} color={Colors.white} />
                <View style={styles.latestContent}>
                  <Text style={styles.latestLabel}>Latest Update</Text>
                  <Text style={styles.latestDate}>
                    {latest && new Date(latest.date).toLocaleDateString('en-US', {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </Text>
                </View>
              </LinearGradient>
            </View>

            <View style={styles.measurementsGrid}>
              {latest && (
                <>
                  <MeasurementCard
                    label="Weight"
                    value={latest.weight}
                    unit="lbs"
                    icon={Scale}
                    color={Colors.purple}
                  />
                  <MeasurementCard
                    label="Chest"
                    value={latest.chest}
                    unit="in"
                    icon={Ruler}
                    color={Colors.blue}
                  />
                  <MeasurementCard
                    label="Waist"
                    value={latest.waist}
                    unit="in"
                    icon={Ruler}
                    color={Colors.orange}
                  />
                  <MeasurementCard
                    label="Hips"
                    value={latest.hips}
                    unit="in"
                    icon={Ruler}
                    color={Colors.green}
                  />
                  <MeasurementCard
                    label="Biceps"
                    value={latest.biceps}
                    unit="in"
                    icon={Ruler}
                    color={Colors.red}
                  />
                  <MeasurementCard
                    label="Thighs"
                    value={latest.thighs}
                    unit="in"
                    icon={Ruler}
                    color={Colors.cyan}
                  />
                  {latest.bodyFat && (
                    <View style={styles.bodyFatCard}>
                      <Text style={styles.bodyFatLabel}>Body Fat %</Text>
                      <Text style={styles.bodyFatValue}>{latest.bodyFat}%</Text>
                    </View>
                  )}
                </>
              )}
            </View>

            {measurements.length > 1 && (
              <View style={styles.historySection}>
                <Text style={styles.historyTitle}>History</Text>
                {measurements.slice(1).map((measurement) => (
                  <View key={measurement.id} style={styles.historyCard}>
                    <Text style={styles.historyDate}>
                      {new Date(measurement.date).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </Text>
                    <View style={styles.historyValues}>
                      {measurement.weight && (
                        <Text style={styles.historyValue}>Weight: {measurement.weight} lbs</Text>
                      )}
                      {measurement.chest && (
                        <Text style={styles.historyValue}>Chest: {measurement.chest} in</Text>
                      )}
                      {measurement.waist && (
                        <Text style={styles.historyValue}>Waist: {measurement.waist} in</Text>
                      )}
                    </View>
                  </View>
                ))}
              </View>
            )}
          </>
        )}
      </ScrollView>

      <Modal
        visible={showAddModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowAddModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { paddingBottom: insets.bottom + 20 }]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Measurements</Text>
              <TouchableOpacity onPress={() => setShowAddModal(false)}>
                <X size={24} color={Colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalScroll} showsVerticalScrollIndicator={false}>
              <Text style={styles.sectionLabel}>All fields are optional</Text>

              <View style={styles.inputRow}>
                <View style={styles.inputHalf}>
                  <Text style={styles.inputLabel}>Weight (lbs)</Text>
                  <TextInput
                    style={styles.input}
                    value={weight}
                    onChangeText={setWeight}
                    placeholder="165"
                    placeholderTextColor={Colors.textMuted}
                    keyboardType="decimal-pad"
                  />
                </View>
                <View style={styles.inputHalf}>
                  <Text style={styles.inputLabel}>Body Fat %</Text>
                  <TextInput
                    style={styles.input}
                    value={bodyFat}
                    onChangeText={setBodyFat}
                    placeholder="18.5"
                    placeholderTextColor={Colors.textMuted}
                    keyboardType="decimal-pad"
                  />
                </View>
              </View>

              <View style={styles.inputRow}>
                <View style={styles.inputHalf}>
                  <Text style={styles.inputLabel}>Chest (in)</Text>
                  <TextInput
                    style={styles.input}
                    value={chest}
                    onChangeText={setChest}
                    placeholder="40"
                    placeholderTextColor={Colors.textMuted}
                    keyboardType="decimal-pad"
                  />
                </View>
                <View style={styles.inputHalf}>
                  <Text style={styles.inputLabel}>Waist (in)</Text>
                  <TextInput
                    style={styles.input}
                    value={waist}
                    onChangeText={setWaist}
                    placeholder="32"
                    placeholderTextColor={Colors.textMuted}
                    keyboardType="decimal-pad"
                  />
                </View>
              </View>

              <View style={styles.inputRow}>
                <View style={styles.inputHalf}>
                  <Text style={styles.inputLabel}>Hips (in)</Text>
                  <TextInput
                    style={styles.input}
                    value={hips}
                    onChangeText={setHips}
                    placeholder="38"
                    placeholderTextColor={Colors.textMuted}
                    keyboardType="decimal-pad"
                  />
                </View>
                <View style={styles.inputHalf}>
                  <Text style={styles.inputLabel}>Biceps (in)</Text>
                  <TextInput
                    style={styles.input}
                    value={biceps}
                    onChangeText={setBiceps}
                    placeholder="14"
                    placeholderTextColor={Colors.textMuted}
                    keyboardType="decimal-pad"
                  />
                </View>
              </View>

              <Text style={styles.inputLabel}>Thighs (in)</Text>
              <TextInput
                style={styles.input}
                value={thighs}
                onChangeText={setThighs}
                placeholder="22"
                placeholderTextColor={Colors.textMuted}
                keyboardType="decimal-pad"
              />

              <TouchableOpacity style={styles.submitButton} onPress={handleAddMeasurement}>
                <LinearGradient
                  colors={[Colors.primary, Colors.purple]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.submitGradient}
                >
                  <Text style={styles.submitText}>Save Measurements</Text>
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  addButton: {
    borderRadius: 20,
    elevation: 4,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  addButtonGradient: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: Colors.text,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  latestCard: {
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 24,
  },
  latestGradient: {
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  latestContent: {
    flex: 1,
  },
  latestLabel: {
    fontSize: 14,
    color: Colors.white,
    opacity: 0.9,
    marginBottom: 4,
  },
  latestDate: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.white,
  },
  measurementsGrid: {
    gap: 12,
    marginBottom: 24,
  },
  measurementCard: {
    backgroundColor: Colors.cardBg,
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  measurementIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  measurementContent: {
    flex: 1,
  },
  measurementLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  measurementValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  measurementValue: {
    fontSize: 22,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  measurementUnit: {
    fontSize: 16,
    fontWeight: '400' as const,
    color: Colors.textMuted,
  },
  changeIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  changeText: {
    fontSize: 12,
    fontWeight: '600' as const,
  },
  bodyFatCard: {
    backgroundColor: Colors.primary + '20',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  bodyFatLabel: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '600' as const,
    marginBottom: 8,
  },
  bodyFatValue: {
    fontSize: 32,
    fontWeight: '700' as const,
    color: Colors.primary,
  },
  historySection: {
    marginTop: 8,
  },
  historyTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.text,
    marginBottom: 16,
  },
  historyCard: {
    backgroundColor: Colors.cardBg,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  historyDate: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  historyValues: {
    gap: 4,
  },
  historyValue: {
    fontSize: 14,
    color: Colors.text,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  modalScroll: {
    padding: 20,
  },
  sectionLabel: {
    fontSize: 14,
    color: Colors.textMuted,
    marginBottom: 16,
    textAlign: 'center',
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.textSecondary,
    marginBottom: 8,
    marginTop: 8,
  },
  input: {
    backgroundColor: Colors.background,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: Colors.text,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 12,
  },
  inputHalf: {
    flex: 1,
  },
  submitButton: {
    marginTop: 24,
    marginBottom: 8,
    borderRadius: 16,
    overflow: 'hidden',
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
