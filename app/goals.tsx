import { useMemo, useState, type ComponentType } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, Platform, type DimensionValue } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import Colors from '@/constants/colors';
import { useFitness } from '@/contexts/FitnessContext';
import { Goal, GoalType } from '@/types';
import { LinearGradient } from 'expo-linear-gradient';
import { TrendingUp, Target, Footprints, Clock, HeartPulse, Dumbbell, Save, Trash2, Calendar, Route } from 'lucide-react-native';

const goalPresets: { type: GoalType; title: string; unit: string; placeholder: string; icon: ComponentType<any>; period: string }[] = [
  { type: 'weight_target', title: 'Target Weight', unit: 'lb', placeholder: 'e.g., 165', icon: Target, period: 'Anytime' },
  { type: 'steps_daily', title: 'Daily Steps', unit: 'steps', placeholder: 'e.g., 10000', icon: Footprints, period: 'Per day' },
  { type: 'active_minutes_daily', title: 'Active Minutes', unit: 'min', placeholder: 'e.g., 45', icon: Clock, period: 'Per day' },
  { type: 'active_minutes_weekly', title: 'Weekly Time', unit: 'min', placeholder: 'e.g., 150', icon: Clock, period: 'Per week' },
  { type: 'distance_weekly', title: 'Weekly Distance', unit: 'mi', placeholder: 'e.g., 10', icon: Route, period: 'Per week' },
  { type: 'workout_days_weekly', title: 'Workout Days', unit: 'days', placeholder: 'e.g., 5', icon: Calendar, period: 'Per week' },
  { type: 'cardio_minutes_weekly', title: 'Cardio Minutes', unit: 'min', placeholder: 'e.g., 150', icon: HeartPulse, period: 'Per week' },
  { type: 'strength_sessions_weekly', title: 'Strength Sessions', unit: 'sessions', placeholder: 'e.g., 3', icon: Dumbbell, period: 'Per week' },
  { type: 'stand_hours_daily', title: 'Stand Hours', unit: 'hours', placeholder: 'e.g., 12', icon: Clock, period: 'Per day' },
  { type: 'mindfulness_minutes_daily', title: 'Mindfulness', unit: 'min', placeholder: 'e.g., 10', icon: HeartPulse, period: 'Per day' },
  { type: 'floors_climbed_weekly', title: 'Floors Climbed', unit: 'floors', placeholder: 'e.g., 70', icon: TrendingUp, period: 'Per week' },
];

export default function GoalsScreen() {
  const { goals, upsertGoal, removeGoal, getGoalProgress, weightEntries, user } = useFitness();
  const insets = useSafeAreaInsets();
  const [editing, setEditing] = useState<Partial<Goal> | null>(null);
  const [value, setValue] = useState<string>('');

  const sortedGoals = useMemo(() => [...goals].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()), [goals]);

  const percent = (n: number): DimensionValue => `${n}%` as unknown as DimensionValue;

  const startEdit = (preset: typeof goalPresets[number], goal?: Goal) => {
    if (goal) {
      setEditing(goal);
      setValue(String(goal.targetValue));
    } else {
      setEditing({ type: preset.type, title: preset.title, unit: preset.unit } as Partial<Goal>);
      setValue('');
    }
  };

  const save = async () => {
    try {
      if (!editing) return;
      const num = Number(value);
      if (!Number.isFinite(num) || num <= 0) {
        Alert.alert('Invalid value', 'Please enter a positive number.');
        return;
      }

      await upsertGoal({
        id: editing.id,
        type: editing.type as GoalType,
        title: editing.title as string,
        unit: editing.unit as string,
        targetValue: num,
        startValue:
          editing.type === 'weight_target'
            ? (weightEntries[weightEntries.length - 1]?.weight ?? user.weight ?? undefined)
            : undefined,
        notes: editing.notes,
        isActive: true,
      });
      setEditing(null);
      setValue('');
    } catch (e) {
      console.log('Error saving goal', e);
      Alert.alert('Error', 'Could not save goal.');
    }
  };

  const confirmRemove = (id: string) => {
    Alert.alert('Remove goal?', 'This will delete the goal.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: () => removeGoal(id) },
    ]);
  };

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom }]}>
      <Stack.Screen options={{ title: 'Goals', headerStyle: { backgroundColor: Colors.surface }, headerTintColor: Colors.text }} />

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Goals</Text>
          {sortedGoals.length === 0 && (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyText}>No goals yet. Add one below.</Text>
            </View>
          )}

          {sortedGoals.map((g: Goal) => {
            const Icon = goalPresets.find(p => p.type === g.type)?.icon ?? TrendingUp;
            const progress = getGoalProgress(g);
            return (
              <View key={g.id} style={styles.goalCard} testID={`goal-${g.id}`}>
                <View style={styles.goalHeader}>
                  <View style={[styles.iconBadge, { backgroundColor: Colors.primary + '22' }]}>
                    <Icon size={20} color={Colors.primary} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.goalTitle}>{g.title}</Text>
                    <Text style={styles.goalSub}>
                      Target: {g.targetValue} {g.unit} · {progress.periodLabel}
                    </Text>
                  </View>
                  <TouchableOpacity accessibilityRole="button" onPress={() => confirmRemove(g.id)}>
                    <Trash2 size={18} color={Colors.textSecondary} />
                  </TouchableOpacity>
                </View>
                <View style={styles.progressBar}>
                  <View style={[styles.progressFill, { width: percent(parseFloat(progress.percentage.toFixed(1))) }]} />
                </View>
                <Text style={styles.progressLabel}>
                  {progress.currentValue} / {g.targetValue} {g.unit}
                </Text>
                <TouchableOpacity style={styles.editBtn} onPress={() => startEdit(goalPresets.find(p => p.type === g.type)!, g)} activeOpacity={0.8}>
                  <Text style={styles.editText}>Edit Goal</Text>
                </TouchableOpacity>
              </View>
            );
          })}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Add Goal</Text>
          <View style={styles.grid}>
            {goalPresets.map((p) => {
              const Icon = p.icon;
              return (
                <TouchableOpacity key={p.type} style={styles.presetBtn} onPress={() => startEdit(p)} activeOpacity={0.8} testID={`add-${p.type}`}>
                  <LinearGradient colors={[Colors.cardBg, Colors.cardBgLight]} style={styles.presetGradient}>
                    <View style={[styles.iconBadge, { backgroundColor: Colors.accent + '22' }]}>
                      <Icon size={18} color={Colors.accent} />
                    </View>
                    <Text style={styles.presetTitle}>{p.title}</Text>
                    <Text style={styles.presetSub}>{p.period}</Text>
                  </LinearGradient>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </ScrollView>

      {editing && (
        <View style={styles.sheet}>
          <View style={styles.sheetHeader}>
            <Text style={styles.sheetTitle}>{editing.title}</Text>
            <TouchableOpacity onPress={() => setEditing(null)}>
              <Text style={styles.sheetClose}>Close</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.inputLabel}>Target ({editing.unit})</Text>
          <TextInput
            value={value}
            onChangeText={setValue}
            keyboardType={Platform.OS === 'web' ? 'numeric' : 'number-pad'}
            placeholder="Enter value"
            placeholderTextColor={Colors.textMuted}
            style={styles.input}
            testID="goal-input"
          />
          <TouchableOpacity style={styles.saveBtn} onPress={save} activeOpacity={0.85} testID="save-goal">
            <LinearGradient colors={[Colors.primary, Colors.purple]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.saveGradient}>
              <Save size={20} color={Colors.white} />
              <Text style={styles.saveText}>Save Goal</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: 16, paddingBottom: 120 },
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 18, fontWeight: '700' as const, color: Colors.text, marginBottom: 12 },
  emptyCard: { backgroundColor: Colors.cardBg, padding: 16, borderRadius: 16, borderWidth: 1, borderColor: Colors.border },
  emptyText: { color: Colors.textSecondary },
  goalCard: { backgroundColor: Colors.cardBg, padding: 16, borderRadius: 16, borderWidth: 1, borderColor: Colors.border, marginBottom: 12 },
  goalHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
  iconBadge: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  goalTitle: { fontSize: 16, fontWeight: '700' as const, color: Colors.text },
  goalSub: { fontSize: 12, color: Colors.textSecondary },
  progressBar: { height: 8, backgroundColor: Colors.surfaceLight, borderRadius: 6, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: Colors.primary },
  progressLabel: { marginTop: 6, fontSize: 12, color: Colors.textSecondary },
  editBtn: { marginTop: 12, alignSelf: 'flex-start', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 12, backgroundColor: Colors.surfaceLight },
  editText: { color: Colors.text, fontWeight: '600' as const },

  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  presetBtn: { width: '48%', borderRadius: 16, overflow: 'hidden' },
  presetGradient: { padding: 14, gap: 8, minHeight: 96 },
  presetTitle: { color: Colors.text, fontWeight: '700' as const },
  presetSub: { color: Colors.textMuted, fontSize: 12 },

  sheet: { position: 'absolute', left: 0, right: 0, bottom: 0, backgroundColor: Colors.surface, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 16, gap: 12, borderTopWidth: 1, borderColor: Colors.border },
  sheetHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sheetTitle: { color: Colors.text, fontWeight: '700' as const, fontSize: 16 },
  sheetClose: { color: Colors.textSecondary },
  inputLabel: { color: Colors.textSecondary, marginTop: 4 },
  input: { backgroundColor: Colors.cardBg, borderWidth: 1, borderColor: Colors.border, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 12, color: Colors.text, marginTop: 6 },
  saveBtn: { marginTop: 8 },
  saveGradient: { padding: 14, borderRadius: 12, flexDirection: 'row', alignItems: 'center', gap: 8, justifyContent: 'center' },
  saveText: { color: Colors.white, fontWeight: '700' as const },
});
