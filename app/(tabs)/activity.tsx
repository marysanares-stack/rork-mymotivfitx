import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Modal,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Plus,
  X,
  Clock,
  Flame,
  Route,
  Footprints,
  Calendar,
} from 'lucide-react-native';
import { useFitness } from '@/contexts/FitnessContext';
import Colors from '@/constants/colors';
import { ACTIVITY_TYPES } from '@/mocks/data';
import { ActivityType } from '@/types';

export default function ActivityScreen() {
  const insets = useSafeAreaInsets();
  const { recentActivities, addActivity } = useFitness();
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedType, setSelectedType] = useState<ActivityType>('walking');
  const [activityName, setActivityName] = useState('');
  const [duration, setDuration] = useState('');
  const [calories, setCalories] = useState('');
  const [distance, setDistance] = useState('');
  const [steps, setSteps] = useState('');
  const [notes, setNotes] = useState('');

  const handleAddActivity = () => {
    if (!activityName || !duration || !calories) return;

    addActivity({
      type: selectedType,
      name: activityName,
      duration: parseInt(duration, 10),
      calories: parseInt(calories, 10),
      distance: distance ? parseFloat(distance) : undefined,
      steps: steps ? parseInt(steps, 10) : undefined,
      notes: notes || undefined,
    });

    setShowAddModal(false);
    setActivityName('');
    setDuration('');
    setCalories('');
    setDistance('');
    setSteps('');
    setNotes('');
    setSelectedType('walking');
  };

  const getActivityTypeInfo = (type: ActivityType) => {
    return ACTIVITY_TYPES.find(a => a.value === type) || ACTIVITY_TYPES[0];
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <LinearGradient
        colors={[Colors.background, Colors.surface]}
        style={StyleSheet.absoluteFillObject}
      />

      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Activities</Text>
          <Text style={styles.subtitle}>Track your fitness journey</Text>
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

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {recentActivities.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>🏃‍♂️</Text>
            <Text style={styles.emptyTitle}>No activities yet</Text>
            <Text style={styles.emptyText}>Start logging your workouts to see them here!</Text>
          </View>
        ) : (
          recentActivities.map((activity) => {
            const typeInfo = getActivityTypeInfo(activity.type);
            return (
              <View key={activity.id} style={styles.activityCard}>
                <View style={styles.activityHeader}>
                  <View style={styles.activityIconContainer}>
                    <View
                      style={[
                        styles.activityIcon,
                        { backgroundColor: typeInfo.color + '20' },
                      ]}
                    >
                      <Text style={styles.activityEmoji}>{typeInfo.emoji}</Text>
                    </View>
                    <View style={styles.activityInfo}>
                      <Text style={styles.activityName}>{activity.name}</Text>
                      <Text style={styles.activityType}>{typeInfo.label}</Text>
                    </View>
                  </View>
                  <View style={styles.activityDate}>
                    <Calendar size={14} color={Colors.textMuted} />
                    <Text style={styles.activityDateText}>
                      {new Date(activity.date).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </Text>
                  </View>
                </View>

                <View style={styles.activityStats}>
                  <View style={styles.statItem}>
                    <Clock size={16} color={Colors.blue} />
                    <Text style={styles.statText}>{activity.duration} min</Text>
                  </View>
                  <View style={styles.statItem}>
                    <Flame size={16} color={Colors.orange} />
                    <Text style={styles.statText}>{activity.calories} cal</Text>
                  </View>
                  {activity.distance && (
                    <View style={styles.statItem}>
                      <Route size={16} color={Colors.green} />
                      <Text style={styles.statText}>{activity.distance} km</Text>
                    </View>
                  )}
                  {activity.steps && (
                    <View style={styles.statItem}>
                      <Footprints size={16} color={Colors.purple} />
                      <Text style={styles.statText}>{activity.steps}</Text>
                    </View>
                  )}
                </View>

                {activity.notes && (
                  <Text style={styles.activityNotes}>{activity.notes}</Text>
                )}
              </View>
            );
          })
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
              <Text style={styles.modalTitle}>Log Activity</Text>
              <TouchableOpacity onPress={() => setShowAddModal(false)}>
                <X size={24} color={Colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView
              style={styles.modalScroll}
              showsVerticalScrollIndicator={false}
            >
              <Text style={styles.inputLabel}>Activity Type</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.typeScroll}
              >
                {ACTIVITY_TYPES.map((type) => (
                  <TouchableOpacity
                    key={type.value}
                    style={[
                      styles.typeButton,
                      selectedType === type.value && styles.typeButtonSelected,
                    ]}
                    onPress={() => setSelectedType(type.value as ActivityType)}
                  >
                    <View style={styles.typeImageContainer}>
                      <Image
                        source={{ uri: type.icon }}
                        style={styles.typeImage}
                        resizeMode="cover"
                      />
                      <View style={[styles.typeImageOverlay, { backgroundColor: type.color + '40' }]} />
                    </View>
                    <Text
                      style={[
                        styles.typeLabel,
                        selectedType === type.value && styles.typeLabelSelected,
                      ]}
                    >
                      {type.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <Text style={styles.inputLabel}>Activity Name</Text>
              <TextInput
                style={styles.input}
                value={activityName}
                onChangeText={setActivityName}
                placeholder="e.g., Morning Run"
                placeholderTextColor={Colors.textMuted}
              />

              <View style={styles.inputRow}>
                <View style={styles.inputHalf}>
                  <Text style={styles.inputLabel}>Duration (min)</Text>
                  <TextInput
                    style={styles.input}
                    value={duration}
                    onChangeText={setDuration}
                    placeholder="30"
                    placeholderTextColor={Colors.textMuted}
                    keyboardType="numeric"
                  />
                </View>
                <View style={styles.inputHalf}>
                  <Text style={styles.inputLabel}>Calories</Text>
                  <TextInput
                    style={styles.input}
                    value={calories}
                    onChangeText={setCalories}
                    placeholder="250"
                    placeholderTextColor={Colors.textMuted}
                    keyboardType="numeric"
                  />
                </View>
              </View>

              <View style={styles.inputRow}>
                <View style={styles.inputHalf}>
                  <Text style={styles.inputLabel}>Distance (km)</Text>
                  <TextInput
                    style={styles.input}
                    value={distance}
                    onChangeText={setDistance}
                    placeholder="5.0"
                    placeholderTextColor={Colors.textMuted}
                    keyboardType="decimal-pad"
                  />
                </View>
                <View style={styles.inputHalf}>
                  <Text style={styles.inputLabel}>Steps</Text>
                  <TextInput
                    style={styles.input}
                    value={steps}
                    onChangeText={setSteps}
                    placeholder="5000"
                    placeholderTextColor={Colors.textMuted}
                    keyboardType="numeric"
                  />
                </View>
              </View>

              <Text style={styles.inputLabel}>Notes (Optional)</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={notes}
                onChangeText={setNotes}
                placeholder="How did it feel?"
                placeholderTextColor={Colors.textMuted}
                multiline
                numberOfLines={4}
              />

              <TouchableOpacity
                style={[
                  styles.submitButton,
                  (!activityName || !duration || !calories) && styles.submitButtonDisabled,
                ]}
                onPress={handleAddActivity}
                disabled={!activityName || !duration || !calories}
              >
                <LinearGradient
                  colors={[Colors.primary, Colors.purple]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.submitGradient}
                >
                  <Text style={styles.submitText}>Log Activity</Text>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingTop: 0,
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
  activityCard: {
    backgroundColor: Colors.cardBg,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  activityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  activityIconContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  activityIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activityEmoji: {
    fontSize: 24,
  },
  activityInfo: {
    gap: 4,
  },
  activityName: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  activityType: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  activityDate: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  activityDateText: {
    fontSize: 12,
    color: Colors.textMuted,
  },
  activityStats: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.textSecondary,
  },
  activityNotes: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 12,
    fontStyle: 'italic',
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
  inputLabel: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.textSecondary,
    marginBottom: 8,
    marginTop: 16,
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
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  inputRow: {
    flexDirection: 'row',
    gap: 12,
  },
  inputHalf: {
    flex: 1,
  },
  typeScroll: {
    marginBottom: 8,
  },
  typeButton: {
    paddingHorizontal: 8,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.border,
    marginRight: 8,
    alignItems: 'center',
    minWidth: 80,
  },
  typeButtonSelected: {
    backgroundColor: Colors.primary + '20',
    borderColor: Colors.primary,
  },
  typeImageContainer: {
    width: 60,
    height: 60,
    borderRadius: 10,
    overflow: 'hidden',
    marginBottom: 6,
  },
  typeImage: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  typeImageOverlay: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  typeLabel: {
    fontSize: 11,
    fontWeight: '600' as const,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  typeLabelSelected: {
    color: Colors.primary,
  },
  submitButton: {
    marginTop: 24,
    marginBottom: 8,
    borderRadius: 16,
    overflow: 'hidden',
  },
  submitButtonDisabled: {
    opacity: 0.5,
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
