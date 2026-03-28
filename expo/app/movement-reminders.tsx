import { useState } from 'react';
import { View, Text, StyleSheet, Switch, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { Stack } from 'expo-router';
import { Clock, Bell, BellOff } from 'lucide-react-native';
import { useFitness } from '@/contexts/FitnessContext';
import Colors from '@/constants/colors';

type IntervalOption = {
  label: string;
  minutes: number;
};

const INTERVAL_OPTIONS: IntervalOption[] = [
  { label: '30 minutes', minutes: 30 },
  { label: '1 hour', minutes: 60 },
  { label: '2 hours', minutes: 120 },
  { label: '3 hours', minutes: 180 },
  { label: '4 hours', minutes: 240 },
];

const TIME_OPTIONS = [
  '06:00', '07:00', '08:00', '09:00', '10:00',
  '11:00', '12:00', '13:00', '14:00', '15:00',
  '16:00', '17:00', '18:00', '19:00', '20:00',
  '21:00', '22:00', '23:00',
];

export default function MovementRemindersScreen() {
  const { movementReminderSettings, updateMovementReminderSettings } = useFitness();
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);

  const handleToggle = async (value: boolean) => {
    console.log('Toggling movement reminders:', value);
    await updateMovementReminderSettings({ enabled: value });
  };

  const handleIntervalChange = async (minutes: number) => {
    console.log('Changing interval:', minutes);
    await updateMovementReminderSettings({ interval: minutes });
  };

  const handleStartTimeChange = async (time: string) => {
    console.log('Changing start time:', time);
    await updateMovementReminderSettings({ startTime: time });
    setShowStartPicker(false);
  };

  const handleEndTimeChange = async (time: string) => {
    console.log('Changing end time:', time);
    await updateMovementReminderSettings({ endTime: time });
    setShowEndPicker(false);
  };

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          headerShown: true,
          title: 'Movement Reminders',
          headerStyle: { backgroundColor: Colors.background },
          headerTintColor: Colors.text,
        }}
      />
      
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <View style={styles.section}>
          <View style={styles.iconHeader}>
            {movementReminderSettings.enabled ? (
              <Bell color={Colors.primary} size={48} />
            ) : (
              <BellOff color={Colors.textMuted} size={48} />
            )}
            <Text style={styles.title}>Stay Active Throughout The Day</Text>
            <Text style={styles.subtitle}>
              Get gentle reminders to move, stretch, and stay healthy
            </Text>
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingLabel}>
              <Text style={styles.settingTitle}>Enable Reminders</Text>
              <Text style={styles.settingDescription}>
                {Platform.OS === 'web' 
                  ? 'Notifications not available on web'
                  : 'Receive notifications to stay active'}
              </Text>
            </View>
            <Switch
              value={movementReminderSettings.enabled}
              onValueChange={handleToggle}
              trackColor={{ false: Colors.border, true: Colors.primary }}
              thumbColor={movementReminderSettings.enabled ? Colors.primary : Colors.surface}
              disabled={Platform.OS === 'web'}
            />
          </View>
        </View>

        {movementReminderSettings.enabled && Platform.OS !== 'web' && (
          <>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Reminder Interval</Text>
              <Text style={styles.sectionDescription}>
                How often would you like to be reminded?
              </Text>
              
              <View style={styles.optionsGrid}>
                {INTERVAL_OPTIONS.map((option) => (
                  <TouchableOpacity
                    key={option.minutes}
                    style={[
                      styles.optionButton,
                      movementReminderSettings.interval === option.minutes && styles.optionButtonActive,
                    ]}
                    onPress={() => handleIntervalChange(option.minutes)}
                  >
                    <Clock
                      color={
                        movementReminderSettings.interval === option.minutes
                          ? Colors.primary
                          : Colors.textMuted
                      }
                      size={20}
                    />
                    <Text
                      style={[
                        styles.optionText,
                        movementReminderSettings.interval === option.minutes && styles.optionTextActive,
                      ]}
                    >
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Active Hours</Text>
              <Text style={styles.sectionDescription}>
                Set the time range for movement reminders
              </Text>

              <View style={styles.timeRow}>
                <View style={styles.timeItem}>
                  <Text style={styles.timeLabel}>Start Time</Text>
                  <TouchableOpacity
                    style={styles.timeButton}
                    onPress={() => setShowStartPicker(!showStartPicker)}
                  >
                    <Clock color={Colors.primary} size={20} />
                    <Text style={styles.timeValue}>{movementReminderSettings.startTime}</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.timeItem}>
                  <Text style={styles.timeLabel}>End Time</Text>
                  <TouchableOpacity
                    style={styles.timeButton}
                    onPress={() => setShowEndPicker(!showEndPicker)}
                  >
                    <Clock color={Colors.primary} size={20} />
                    <Text style={styles.timeValue}>{movementReminderSettings.endTime}</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {showStartPicker && (
                <View style={styles.pickerContainer}>
                  <ScrollView style={styles.picker} nestedScrollEnabled>
                    {TIME_OPTIONS.map((time) => (
                      <TouchableOpacity
                        key={time}
                        style={[
                          styles.pickerItem,
                          movementReminderSettings.startTime === time && styles.pickerItemActive,
                        ]}
                        onPress={() => handleStartTimeChange(time)}
                      >
                        <Text
                          style={[
                            styles.pickerItemText,
                            movementReminderSettings.startTime === time && styles.pickerItemTextActive,
                          ]}
                        >
                          {time}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              )}

              {showEndPicker && (
                <View style={styles.pickerContainer}>
                  <ScrollView style={styles.picker} nestedScrollEnabled>
                    {TIME_OPTIONS.map((time) => (
                      <TouchableOpacity
                        key={time}
                        style={[
                          styles.pickerItem,
                          movementReminderSettings.endTime === time && styles.pickerItemActive,
                        ]}
                        onPress={() => handleEndTimeChange(time)}
                      >
                        <Text
                          style={[
                            styles.pickerItemText,
                            movementReminderSettings.endTime === time && styles.pickerItemTextActive,
                          ]}
                        >
                          {time}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              )}
            </View>

            <View style={styles.infoCard}>
              <Text style={styles.infoTitle}>💡 Pro Tip</Text>
              <Text style={styles.infoText}>
                Regular movement breaks can help improve circulation, reduce stiffness, and boost
                your energy levels throughout the day!
              </Text>
            </View>
          </>
        )}
      </ScrollView>
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
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  section: {
    marginBottom: 32,
  },
  iconHeader: {
    alignItems: 'center' as const,
    marginBottom: 32,
    paddingVertical: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: Colors.text,
    marginTop: 16,
    textAlign: 'center' as const,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textMuted,
    marginTop: 8,
    textAlign: 'center' as const,
    paddingHorizontal: 20,
  },
  settingItem: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
    padding: 20,
    backgroundColor: Colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  settingLabel: {
    flex: 1,
    marginRight: 16,
  },
  settingTitle: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: Colors.text,
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
    color: Colors.textMuted,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: Colors.text,
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    color: Colors.textMuted,
    marginBottom: 16,
  },
  optionsGrid: {
    gap: 12,
  },
  optionButton: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    padding: 16,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.border,
    gap: 12,
  },
  optionButtonActive: {
    backgroundColor: 'rgba(99, 102, 241, 0.2)',
    borderColor: Colors.primary,
  },
  optionText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.textMuted,
  },
  optionTextActive: {
    color: Colors.primary,
  },
  timeRow: {
    flexDirection: 'row' as const,
    gap: 12,
  },
  timeItem: {
    flex: 1,
  },
  timeLabel: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.textMuted,
    marginBottom: 8,
  },
  timeButton: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    padding: 16,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.primary,
    gap: 8,
  },
  timeValue: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  pickerContainer: {
    marginTop: 12,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden' as const,
  },
  picker: {
    maxHeight: 200,
  },
  pickerItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  pickerItemActive: {
    backgroundColor: 'rgba(99, 102, 241, 0.2)',
  },
  pickerItemText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.text,
    textAlign: 'center' as const,
  },
  pickerItemTextActive: {
    color: Colors.primary,
  },
  infoCard: {
    padding: 20,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.success,
    marginTop: 8,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.text,
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: Colors.textMuted,
    lineHeight: 20,
  },
});
