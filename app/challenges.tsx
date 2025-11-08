import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Platform,
} from 'react-native';
import { Stack } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Trophy,
  Plus,
  Calendar,
  Target,
  Users,
  Flame,
  Check,
  X,
} from 'lucide-react-native';
import Colors from '@/constants/colors';
import { Challenge, ChallengeType } from '@/types';
import { useSocial } from '@/contexts/SocialContext';

function generateId() {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

const CHALLENGE_TEMPLATES = [
  {
    name: '30-Day Plank Challenge',
    description: 'Hold a plank for 60 seconds every day for 30 days',
    type: 'plank_time' as ChallengeType,
    goal: 30,
    unit: 'days',
    duration: 30,
    icon: '🏋️',
  },
  {
    name: '10K Steps Daily',
    description: 'Walk 10,000 steps every day for 7 days',
    type: 'steps' as ChallengeType,
    goal: 70000,
    unit: 'steps',
    duration: 7,
    icon: '👣',
  },
  {
    name: 'Burn 5000 Calories',
    description: 'Burn a total of 5,000 calories in 2 weeks',
    type: 'calories' as ChallengeType,
    goal: 5000,
    unit: 'calories',
    duration: 14,
    icon: '🔥',
  },
  {
    name: '50K Distance',
    description: 'Cover 50km in 30 days',
    type: 'distance' as ChallengeType,
    goal: 50,
    unit: 'km',
    duration: 30,
    icon: '🏃',
  },
  {
    name: '20 Workouts in 30 Days',
    description: 'Complete 20 workout sessions',
    type: 'workouts' as ChallengeType,
    goal: 20,
    unit: 'workouts',
    duration: 30,
    icon: '💪',
  },
];

export default function ChallengesScreen() {
  const { challenges, joinChallenge, createChallenge, getChallengeProgress, user } = useSocial();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<typeof CHALLENGE_TEMPLATES[0] | null>(null);

  const handleCreateChallenge = () => {
    if (!selectedTemplate) return;
    
    const startDate = new Date().toISOString();
    const endDate = new Date(Date.now() + selectedTemplate.duration * 24 * 60 * 60 * 1000).toISOString();
    
    const newChallenge: Challenge = {
      id: generateId(),
      name: selectedTemplate.name,
      description: selectedTemplate.description,
      type: selectedTemplate.type,
      goal: selectedTemplate.goal,
      unit: selectedTemplate.unit,
      startDate,
      endDate,
      participants: [user.id],
      createdBy: user.id,
      icon: selectedTemplate.icon,
      isActive: true,
    };
    
    createChallenge(newChallenge);
    setShowCreateModal(false);
    setSelectedTemplate(null);
  };

  const handleJoinChallenge = (challengeId: string) => {
    joinChallenge(challengeId, user.id);
  };

  const getDaysRemaining = (endDate: string) => {
    const end = new Date(endDate).getTime();
    const now = new Date().getTime();
    const diff = end - now;
    return Math.max(0, Math.ceil(diff / (24 * 60 * 60 * 1000)));
  };

  const activeChallenges = challenges.filter((c: Challenge) => c.isActive);
  const userChallenges = activeChallenges.filter((c: Challenge) => c.participants.includes(user.id));
  const availableChallenges = activeChallenges.filter((c: Challenge) => !c.participants.includes(user.id));

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          headerShown: true,
          title: 'Challenges',
          headerStyle: { backgroundColor: Colors.surface },
          headerTintColor: Colors.text,
          headerShadowVisible: false,
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
        <View style={styles.headerSection}>
          <Text style={styles.headerTitle}>Join or create challenges</Text>
          <Text style={styles.headerSubtitle}>
            Compete with friends and achieve your goals together
          </Text>
        </View>

        <TouchableOpacity
          style={styles.createButton}
          onPress={() => setShowCreateModal(true)}
        >
          <LinearGradient
            colors={[Colors.primary, Colors.accent]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.createButtonGradient}
          >
            <Plus size={24} color="#fff" />
            <Text style={styles.createButtonText}>Create New Challenge</Text>
          </LinearGradient>
        </TouchableOpacity>

        {userChallenges.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Trophy size={20} color={Colors.primary} />
              <Text style={styles.sectionTitle}>Your Active Challenges</Text>
            </View>
            {userChallenges.map((challenge: Challenge) => {
              const progress = getChallengeProgress(challenge.id, user.id);
              const percentage = (progress / challenge.goal) * 100;
              const daysLeft = getDaysRemaining(challenge.endDate);
              
              return (
                <View key={challenge.id} style={styles.challengeCard}>
                  <View style={styles.challengeHeader}>
                    <View style={styles.challengeIcon}>
                      <Text style={styles.challengeIconText}>{challenge.icon}</Text>
                    </View>
                    <View style={styles.challengeInfo}>
                      <Text style={styles.challengeName}>{challenge.name}</Text>
                      <Text style={styles.challengeDescription}>{challenge.description}</Text>
                    </View>
                  </View>

                  <View style={styles.challengeProgress}>
                    <View style={styles.progressBarContainer}>
                      <View style={[styles.progressBar, { width: `${Math.min(100, percentage)}%` }]} />
                    </View>
                    <Text style={styles.progressText}>
                      {progress.toFixed(0)} / {challenge.goal} {challenge.unit}
                    </Text>
                  </View>

                  <View style={styles.challengeFooter}>
                    <View style={styles.challengeStat}>
                      <Calendar size={16} color={Colors.textSecondary} />
                      <Text style={styles.challengeStatText}>{daysLeft} days left</Text>
                    </View>
                    <View style={styles.challengeStat}>
                      <Users size={16} color={Colors.textSecondary} />
                      <Text style={styles.challengeStatText}>{challenge.participants.length} joined</Text>
                    </View>
                  </View>
                </View>
              );
            })}
          </View>
        )}

        {availableChallenges.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Target size={20} color={Colors.orange} />
              <Text style={styles.sectionTitle}>Available Challenges</Text>
            </View>
            {availableChallenges.map((challenge: Challenge) => {
              const daysLeft = getDaysRemaining(challenge.endDate);
              
              return (
                <View key={challenge.id} style={styles.challengeCard}>
                  <View style={styles.challengeHeader}>
                    <View style={styles.challengeIcon}>
                      <Text style={styles.challengeIconText}>{challenge.icon}</Text>
                    </View>
                    <View style={styles.challengeInfo}>
                      <Text style={styles.challengeName}>{challenge.name}</Text>
                      <Text style={styles.challengeDescription}>{challenge.description}</Text>
                    </View>
                  </View>

                  <View style={styles.challengeGoal}>
                    <Flame size={18} color={Colors.orange} />
                    <Text style={styles.challengeGoalText}>
                      Goal: {challenge.goal} {challenge.unit}
                    </Text>
                  </View>

                  <View style={styles.challengeFooter}>
                    <View style={styles.challengeStat}>
                      <Calendar size={16} color={Colors.textSecondary} />
                      <Text style={styles.challengeStatText}>{daysLeft} days left</Text>
                    </View>
                    <View style={styles.challengeStat}>
                      <Users size={16} color={Colors.textSecondary} />
                      <Text style={styles.challengeStatText}>{challenge.participants.length} joined</Text>
                    </View>
                    <TouchableOpacity
                      style={styles.joinButton}
                      onPress={() => handleJoinChallenge(challenge.id)}
                    >
                      <Text style={styles.joinButtonText}>Join</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })}
          </View>
        )}

        {challenges.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>🏆</Text>
            <Text style={styles.emptyTitle}>No challenges yet</Text>
            <Text style={styles.emptyText}>
              Create your first challenge and invite friends to join!
            </Text>
          </View>
        )}
      </ScrollView>

      <Modal
        visible={showCreateModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowCreateModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Create Challenge</Text>
              <TouchableOpacity onPress={() => setShowCreateModal(false)}>
                <X size={24} color={Colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalScroll} showsVerticalScrollIndicator={false}>
              <Text style={styles.modalSubtitle}>Choose a challenge template</Text>
              
              {CHALLENGE_TEMPLATES.map((template, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.templateCard,
                    selectedTemplate?.name === template.name && styles.templateCardSelected,
                  ]}
                  onPress={() => setSelectedTemplate(template)}
                >
                  <View style={styles.templateIcon}>
                    <Text style={styles.templateIconText}>{template.icon}</Text>
                  </View>
                  <View style={styles.templateInfo}>
                    <Text style={styles.templateName}>{template.name}</Text>
                    <Text style={styles.templateDescription}>{template.description}</Text>
                    <View style={styles.templateMeta}>
                      <Text style={styles.templateMetaText}>
                        {template.duration} days • {template.goal} {template.unit}
                      </Text>
                    </View>
                  </View>
                  {selectedTemplate?.name === template.name && (
                    <View style={styles.templateCheck}>
                      <Check size={20} color={Colors.primary} />
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>

            <TouchableOpacity
              style={[styles.modalButton, !selectedTemplate && styles.modalButtonDisabled]}
              onPress={handleCreateChallenge}
              disabled={!selectedTemplate}
            >
              <Text style={styles.modalButtonText}>Create Challenge</Text>
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
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  headerSection: {
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700' as const,
    color: Colors.text,
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    lineHeight: 22,
  },
  createButton: {
    marginBottom: 24,
    borderRadius: 16,
    overflow: 'hidden',
  },
  createButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  createButtonText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#fff',
  },
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  challengeCard: {
    backgroundColor: Colors.cardBg,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  challengeHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 16,
  },
  challengeIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primary + '20',
    alignItems: 'center',
    justifyContent: 'center',
  },
  challengeIconText: {
    fontSize: 28,
  },
  challengeInfo: {
    flex: 1,
  },
  challengeName: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.text,
    marginBottom: 4,
  },
  challengeDescription: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  challengeProgress: {
    marginBottom: 12,
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: Colors.surfaceLight,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressBar: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  challengeGoal: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: Colors.orange + '15',
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  challengeGoalText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.orange,
  },
  challengeFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  challengeStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  challengeStatText: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  joinButton: {
    marginLeft: 'auto',
    paddingVertical: 8,
    paddingHorizontal: 20,
    backgroundColor: Colors.primary,
    borderRadius: 20,
  },
  joinButtonText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#fff',
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
    paddingHorizontal: 40,
    lineHeight: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 24,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  modalScroll: {
    maxHeight: 400,
    paddingHorizontal: 24,
  },
  modalSubtitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.textSecondary,
    marginBottom: 16,
  },
  templateCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: Colors.cardBg,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: Colors.border,
  },
  templateCardSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary + '10',
  },
  templateIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.surfaceLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  templateIconText: {
    fontSize: 24,
  },
  templateInfo: {
    flex: 1,
  },
  templateName: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: Colors.text,
    marginBottom: 4,
  },
  templateDescription: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginBottom: 6,
    lineHeight: 18,
  },
  templateMeta: {
    flexDirection: 'row',
  },
  templateMetaText: {
    fontSize: 12,
    color: Colors.textMuted,
  },
  templateCheck: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.primary + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  modalButton: {
    marginHorizontal: 24,
    marginTop: 20,
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  modalButtonDisabled: {
    backgroundColor: Colors.textMuted,
    opacity: 0.5,
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#fff',
  },
});
