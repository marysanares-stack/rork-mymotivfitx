import { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
} from 'react-native';
import { Stack } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Plus,
  Dumbbell,
  Timer,
  Target,
  Trash2,
  Edit,
  X,
  Check,
  Calendar,
} from 'lucide-react-native';
import { useFitness } from '@/contexts/FitnessContext';
import Colors from '@/constants/colors';
import { Exercise, WorkoutPlan } from '@/types';

// width not used in this screen; removed to satisfy lint

type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced';
type WorkoutCategory = 'strength' | 'cardio' | 'flexibility' | 'mixed';

export default function WorkoutPlansScreen() {
  const insets = useSafeAreaInsets();
  const { workoutPlans, addWorkoutPlan, updateWorkoutPlan, deleteWorkoutPlan } = useFitness();
  const [showModal, setShowModal] = useState(false);
  const [editingPlan, setEditingPlan] = useState<WorkoutPlan | null>(null);

  const [planName, setPlanName] = useState('');
  const [planDescription, setPlanDescription] = useState('');
  const [difficulty, setDifficulty] = useState<DifficultyLevel>('beginner');
  const [category, setCategory] = useState<WorkoutCategory>('mixed');
  const [exercises, setExercises] = useState<Exercise[]>([]);

  const [exerciseName, setExerciseName] = useState('');
  const [exerciseSets, setExerciseSets] = useState('3');
  const [exerciseReps, setExerciseReps] = useState('10');
  const [exerciseDuration, setExerciseDuration] = useState('');
  const [exerciseRest, setExerciseRest] = useState('60');

  const resetForm = () => {
    setPlanName('');
    setPlanDescription('');
    setDifficulty('beginner');
    setCategory('mixed');
    setExercises([]);
    setExerciseName('');
    setExerciseSets('3');
    setExerciseReps('10');
    setExerciseDuration('');
    setExerciseRest('60');
    setEditingPlan(null);
  };

  const openEditModal = (plan: WorkoutPlan) => {
    setEditingPlan(plan);
    setPlanName(plan.name);
    setPlanDescription(plan.description || '');
    setDifficulty(plan.difficulty);
    setCategory(plan.category);
    setExercises([...plan.exercises]);
    setShowModal(true);
  };

  const addExercise = () => {
    if (!exerciseName.trim()) {
      Alert.alert('Error', 'Please enter exercise name');
      return;
    }

    const newExercise: Exercise = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: exerciseName.trim(),
      sets: exerciseSets ? parseInt(exerciseSets, 10) : undefined,
      reps: exerciseReps ? parseInt(exerciseReps, 10) : undefined,
      duration: exerciseDuration ? parseInt(exerciseDuration, 10) : undefined,
      restTime: exerciseRest ? parseInt(exerciseRest, 10) : undefined,
    };

    setExercises([...exercises, newExercise]);
    setExerciseName('');
    setExerciseSets('3');
    setExerciseReps('10');
    setExerciseDuration('');
    setExerciseRest('60');
  };

  const removeExercise = (id: string) => {
    setExercises(exercises.filter(e => e.id !== id));
  };

  const savePlan = async () => {
    if (!planName.trim()) {
      Alert.alert('Error', 'Please enter a plan name');
      return;
    }

    if (exercises.length === 0) {
      Alert.alert('Error', 'Please add at least one exercise');
      return;
    }

    const totalDuration = exercises.reduce((sum, e) => {
      const exerciseTime = (e.sets || 1) * ((e.duration || 0) + (e.restTime || 0));
      return sum + exerciseTime;
    }, 0);

    if (editingPlan) {
      await updateWorkoutPlan(editingPlan.id, {
        name: planName.trim(),
        description: planDescription.trim(),
        difficulty,
        category,
        exercises,
        duration: Math.round(totalDuration / 60),
      });
    } else {
      await addWorkoutPlan({
        name: planName.trim(),
        description: planDescription.trim(),
        difficulty,
        category,
        exercises,
        duration: Math.round(totalDuration / 60),
      });
    }

    setShowModal(false);
    resetForm();
  };

  const handleDelete = (plan: WorkoutPlan) => {
    Alert.alert(
      'Delete Workout Plan',
      `Are you sure you want to delete "${plan.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteWorkoutPlan(plan.id),
        },
      ]
    );
  };

  const difficultyColors: Record<DifficultyLevel, string> = {
    beginner: Colors.green,
    intermediate: Colors.orange,
    advanced: Colors.red,
  };

  const categoryIcons: Record<WorkoutCategory, typeof Dumbbell> = {
    strength: Dumbbell,
    cardio: Timer,
    flexibility: Target,
    mixed: Target,
  };

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: 'Workout Plans',
          headerStyle: {
            backgroundColor: Colors.background,
          },
          headerTintColor: Colors.text,
        }}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 80 }]}
        showsVerticalScrollIndicator={false}
      >
        {workoutPlans.length === 0 ? (
          <View style={styles.emptyState}>
            <Dumbbell size={64} color={Colors.textMuted} />
            <Text style={styles.emptyText}>No Workout Plans Yet</Text>
            <Text style={styles.emptySubtext}>
              Create custom workout plans to track your fitness journey
            </Text>
          </View>
        ) : (
          workoutPlans.map((plan) => {
            const CategoryIcon = categoryIcons[plan.category];
            return (
              <View key={plan.id} style={styles.planCard}>
                <View style={styles.planHeader}>
                  <View style={styles.planInfo}>
                    <Text style={styles.planName}>{plan.name}</Text>
                    {plan.description && (
                      <Text style={styles.planDescription} numberOfLines={2}>
                        {plan.description}
                      </Text>
                    )}
                  </View>
                  <View style={styles.planActions}>
                    <TouchableOpacity
                      onPress={() => openEditModal(plan)}
                      style={styles.actionButton}
                      activeOpacity={0.7}
                    >
                      <Edit size={18} color={Colors.primary} />
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => handleDelete(plan)}
                      style={styles.actionButton}
                      activeOpacity={0.7}
                    >
                      <Trash2 size={18} color={Colors.red} />
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={styles.planMeta}>
                  <View style={styles.metaItem}>
                    <CategoryIcon size={14} color={Colors.textMuted} />
                    <Text style={styles.metaText}>{plan.exercises.length} exercises</Text>
                  </View>
                  <View style={styles.metaItem}>
                    <Timer size={14} color={Colors.textMuted} />
                    <Text style={styles.metaText}>{plan.duration} min</Text>
                  </View>
                  <View
                    style={[
                      styles.difficultyBadge,
                      { backgroundColor: difficultyColors[plan.difficulty] + '20' },
                    ]}
                  >
                    <Text
                      style={[
                        styles.difficultyText,
                        { color: difficultyColors[plan.difficulty] },
                      ]}
                    >
                      {plan.difficulty}
                    </Text>
                  </View>
                </View>

                {plan.completedCount > 0 && (
                  <View style={styles.planStats}>
                    <View style={styles.statItem}>
                      <Calendar size={14} color={Colors.textMuted} />
                      <Text style={styles.statText}>
                        Completed {plan.completedCount} time{plan.completedCount !== 1 ? 's' : ''}
                      </Text>
                    </View>
                    {plan.lastCompleted && (
                      <Text style={styles.lastCompletedText}>
                        Last: {new Date(plan.lastCompleted).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </Text>
                    )}
                  </View>
                )}

                <View style={styles.exercisesList}>
                  {plan.exercises.map((exercise, index) => (
                    <View key={exercise.id} style={styles.exerciseItem}>
                      <Text style={styles.exerciseNumber}>{index + 1}</Text>
                      <View style={styles.exerciseInfo}>
                        <Text style={styles.exerciseName}>{exercise.name}</Text>
                        <Text style={styles.exerciseDetails}>
                          {exercise.sets && exercise.reps
                            ? `${exercise.sets} sets × ${exercise.reps} reps`
                            : exercise.duration
                            ? `${exercise.duration}s`
                            : 'Custom'}
                        </Text>
                      </View>
                    </View>
                  ))}
                </View>
              </View>
            );
          })
        )}
      </ScrollView>

      <TouchableOpacity
        style={styles.fab}
        activeOpacity={0.9}
        onPress={() => setShowModal(true)}
      >
        <LinearGradient
          colors={[Colors.primary, Colors.purple]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.fabGradient}
        >
          <Plus size={28} color={Colors.white} />
        </LinearGradient>
      </TouchableOpacity>

      <Modal visible={showModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { paddingBottom: insets.bottom + 20 }]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingPlan ? 'Edit Workout Plan' : 'New Workout Plan'}
              </Text>
              <TouchableOpacity
                onPress={() => {
                  setShowModal(false);
                  resetForm();
                }}
                activeOpacity={0.7}
              >
                <X size={24} color={Colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView
              style={styles.modalScroll}
              contentContainerStyle={styles.modalScrollContent}
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.formGroup}>
                <Text style={styles.label}>Plan Name *</Text>
                <TextInput
                  style={styles.input}
                  value={planName}
                  onChangeText={setPlanName}
                  placeholder="e.g., Full Body Workout"
                  placeholderTextColor={Colors.textMuted}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Description</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={planDescription}
                  onChangeText={setPlanDescription}
                  placeholder="Optional description"
                  placeholderTextColor={Colors.textMuted}
                  multiline
                  numberOfLines={3}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Difficulty</Text>
                <View style={styles.buttonGroup}>
                  {(['beginner', 'intermediate', 'advanced'] as DifficultyLevel[]).map((level) => (
                    <TouchableOpacity
                      key={level}
                      style={[
                        styles.optionButton,
                        difficulty === level && {
                          backgroundColor: difficultyColors[level] + '20',
                          borderColor: difficultyColors[level],
                        },
                      ]}
                      onPress={() => setDifficulty(level)}
                      activeOpacity={0.7}
                    >
                      <Text
                        style={[
                          styles.optionText,
                          difficulty === level && { color: difficultyColors[level] },
                        ]}
                      >
                        {level}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Category</Text>
                <View style={styles.buttonGroup}>
                  {(['strength', 'cardio', 'flexibility', 'mixed'] as WorkoutCategory[]).map((cat) => (
                    <TouchableOpacity
                      key={cat}
                      style={[
                        styles.optionButton,
                        category === cat && styles.optionButtonActive,
                      ]}
                      onPress={() => setCategory(cat)}
                      activeOpacity={0.7}
                    >
                      <Text
                        style={[
                          styles.optionText,
                          category === cat && styles.optionTextActive,
                        ]}
                      >
                        {cat}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.divider} />

              <Text style={styles.sectionTitle}>Exercises</Text>

              {exercises.map((exercise) => (
                <View key={exercise.id} style={styles.addedExercise}>
                  <View style={styles.addedExerciseInfo}>
                    <Text style={styles.addedExerciseName}>{exercise.name}</Text>
                    <Text style={styles.addedExerciseDetails}>
                      {exercise.sets && exercise.reps
                        ? `${exercise.sets} × ${exercise.reps}`
                        : exercise.duration
                        ? `${exercise.duration}s`
                        : 'Custom'}
                    </Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => removeExercise(exercise.id)}
                    activeOpacity={0.7}
                  >
                    <X size={20} color={Colors.red} />
                  </TouchableOpacity>
                </View>
              ))}

              <View style={styles.addExerciseSection}>
                <View style={styles.formGroup}>
                  <Text style={styles.label}>Exercise Name *</Text>
                  <TextInput
                    style={styles.input}
                    value={exerciseName}
                    onChangeText={setExerciseName}
                    placeholder="e.g., Push-ups"
                    placeholderTextColor={Colors.textMuted}
                  />
                </View>

                <View style={styles.row}>
                  <View style={styles.formGroupHalf}>
                    <Text style={styles.label}>Sets</Text>
                    <TextInput
                      style={styles.input}
                      value={exerciseSets}
                      onChangeText={setExerciseSets}
                      placeholder="3"
                      placeholderTextColor={Colors.textMuted}
                      keyboardType="number-pad"
                    />
                  </View>

                  <View style={styles.formGroupHalf}>
                    <Text style={styles.label}>Reps</Text>
                    <TextInput
                      style={styles.input}
                      value={exerciseReps}
                      onChangeText={setExerciseReps}
                      placeholder="10"
                      placeholderTextColor={Colors.textMuted}
                      keyboardType="number-pad"
                    />
                  </View>
                </View>

                <View style={styles.row}>
                  <View style={styles.formGroupHalf}>
                    <Text style={styles.label}>Duration (s)</Text>
                    <TextInput
                      style={styles.input}
                      value={exerciseDuration}
                      onChangeText={setExerciseDuration}
                      placeholder="Optional"
                      placeholderTextColor={Colors.textMuted}
                      keyboardType="number-pad"
                    />
                  </View>

                  <View style={styles.formGroupHalf}>
                    <Text style={styles.label}>Rest (s)</Text>
                    <TextInput
                      style={styles.input}
                      value={exerciseRest}
                      onChangeText={setExerciseRest}
                      placeholder="60"
                      placeholderTextColor={Colors.textMuted}
                      keyboardType="number-pad"
                    />
                  </View>
                </View>

                <TouchableOpacity
                  style={styles.addExerciseButton}
                  onPress={addExercise}
                  activeOpacity={0.7}
                >
                  <Plus size={20} color={Colors.primary} />
                  <Text style={styles.addExerciseButtonText}>Add Exercise</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>

            <TouchableOpacity
              style={styles.saveButton}
              onPress={savePlan}
              activeOpacity={0.9}
            >
              <LinearGradient
                colors={[Colors.primary, Colors.purple]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.saveButtonGradient}
              >
                <Check size={20} color={Colors.white} />
                <Text style={styles.saveButtonText}>
                  {editingPlan ? 'Update Plan' : 'Create Plan'}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: Colors.text,
    marginTop: 20,
  },
  emptySubtext: {
    fontSize: 14,
    color: Colors.textMuted,
    textAlign: 'center',
    marginTop: 8,
    maxWidth: 280,
  },
  planCard: {
    backgroundColor: Colors.cardBg,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  planInfo: {
    flex: 1,
    marginRight: 12,
  },
  planName: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.text,
    marginBottom: 4,
  },
  planDescription: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  planActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.surfaceLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  planMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 12,
    color: Colors.textMuted,
    fontWeight: '500' as const,
  },
  difficultyBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  difficultyText: {
    fontSize: 11,
    fontWeight: '600' as const,
    textTransform: 'capitalize',
  },
  planStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statText: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '500' as const,
  },
  lastCompletedText: {
    fontSize: 11,
    color: Colors.textMuted,
  },
  exercisesList: {
    gap: 8,
  },
  exerciseItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: Colors.surfaceLight,
    padding: 12,
    borderRadius: 12,
  },
  exerciseNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.primary + '20',
    color: Colors.primary,
    fontSize: 12,
    fontWeight: '700' as const,
    textAlign: 'center',
    lineHeight: 24,
  },
  exerciseInfo: {
    flex: 1,
  },
  exerciseName: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.text,
    marginBottom: 2,
  },
  exerciseDetails: {
    fontSize: 12,
    color: Colors.textMuted,
  },
  fab: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    borderRadius: 28,
    elevation: 8,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  fabGradient: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
    paddingTop: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  modalScroll: {
    flex: 1,
  },
  modalScrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  formGroup: {
    marginBottom: 20,
  },
  formGroupHalf: {
    flex: 1,
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.text,
    marginBottom: 8,
  },
  input: {
    backgroundColor: Colors.cardBg,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    color: Colors.text,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  buttonGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  optionButton: {
    flex: 1,
    minWidth: 80,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: Colors.cardBg,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    alignItems: 'center',
  },
  optionButtonActive: {
    backgroundColor: Colors.primary + '20',
    borderColor: Colors.primary,
  },
  optionText: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: Colors.textSecondary,
    textTransform: 'capitalize',
  },
  optionTextActive: {
    color: Colors.primary,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.text,
    marginBottom: 16,
  },
  addedExercise: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.cardBg,
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  addedExerciseInfo: {
    flex: 1,
  },
  addedExerciseName: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.text,
    marginBottom: 2,
  },
  addedExerciseDetails: {
    fontSize: 12,
    color: Colors.textMuted,
  },
  addExerciseSection: {
    marginTop: 16,
    padding: 16,
    backgroundColor: Colors.surfaceLight,
    borderRadius: 16,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  addExerciseButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: Colors.primary + '15',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.primary + '30',
  },
  addExerciseButtonText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.primary,
  },
  saveButton: {
    marginHorizontal: 20,
    marginTop: 16,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  saveButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.white,
  },
});
