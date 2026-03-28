import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router, Stack } from 'expo-router';
import { ArrowLeft, Play } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { ACTIVITY_TYPES } from '@/mocks/data';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 60) / 2;

export default function AllActivitiesScreen() {
  const insets = useSafeAreaInsets();

  const handleActivityPress = (activityValue: string) => {
    router.push(`/live-workout/${activityValue}`);
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />

      <LinearGradient
        colors={[Colors.background, Colors.surface]}
        style={StyleSheet.absoluteFillObject}
      />

      <View style={styles.header}>
        <TouchableOpacity
          onPress={handleBack}
          style={styles.backButton}
          activeOpacity={0.7}
        >
          <ArrowLeft size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>All Activities</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 20 }]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.subtitle}>
          Choose an activity to start auto-tracking your workout
        </Text>

        <View style={styles.grid}>
          {ACTIVITY_TYPES.map((activity) => (
            <TouchableOpacity
              key={activity.value}
              style={styles.activityCard}
              activeOpacity={0.7}
              onPress={() => handleActivityPress(activity.value)}
            >
              <View style={styles.cardContainer}>
                <Image
                  source={{ uri: activity.icon }}
                  style={styles.activityImage}
                  resizeMode="cover"
                />
                <LinearGradient
                  colors={['transparent', activity.color + 'E0']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 0, y: 1 }}
                  style={styles.cardGradient}
                >
                  <Text style={styles.activityLabel}>{activity.label}</Text>
                  
                  <View style={styles.playButton}>
                    <Play size={16} color={Colors.white} fill={Colors.white} />
                  </View>
                </LinearGradient>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>How Auto-Tracking Works</Text>
          <View style={styles.infoItem}>
            <Text style={styles.infoNumber}>1</Text>
            <Text style={styles.infoText}>
              Select an activity from the list above
            </Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoNumber}>2</Text>
            <Text style={styles.infoText}>
              Press Start to begin tracking duration, calories, steps & more
            </Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoNumber}>3</Text>
            <Text style={styles.infoText}>
              Press Finish when done - your workout will be automatically logged
            </Text>
          </View>
        </View>
      </ScrollView>
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
    borderRadius: 20,
    backgroundColor: Colors.cardBg,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: 32,
  },
  activityCard: {
    width: CARD_WIDTH,
    aspectRatio: 0.85,
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  cardContainer: {
    flex: 1,
    position: 'relative',
  },
  activityImage: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  cardGradient: {
    flex: 1,
    padding: 16,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  activityLabel: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.white,
    textAlign: 'center',
    marginVertical: 8,
  },
  playButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoCard: {
    backgroundColor: Colors.cardBg,
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.text,
    marginBottom: 20,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
    gap: 16,
  },
  infoNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.primary + '20',
    color: Colors.primary,
    fontSize: 16,
    fontWeight: '700' as const,
    textAlign: 'center',
    lineHeight: 32,
  },
  infoText: {
    flex: 1,
    fontSize: 15,
    color: Colors.textSecondary,
    lineHeight: 22,
  },
});
