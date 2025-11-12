import { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Stack } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { ShieldAlert, Clock, Target, CheckCircle2, Star, TrendingUp } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { useFitness } from '@/contexts/FitnessContext';

type Stretch = {
  id: string;
  name: string;
  duration: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  targetArea: string[];
  description: string;
  benefits: string[];
  recommended: boolean;
};

const STRETCHES: Stretch[] = [
  {
    id: '1',
    name: 'Hip Flexor Stretch',
    duration: 60,
    difficulty: 'beginner',
    targetArea: ['Hips', 'Legs'],
    description: 'Kneel on one knee, push hips forward gently. Hold 30 seconds each side.',
    benefits: ['Reduces lower back pain', 'Improves posture', 'Increases flexibility'],
    recommended: true,
  },
  {
    id: '2',
    name: 'Shoulder Rolls',
    duration: 45,
    difficulty: 'beginner',
    targetArea: ['Shoulders', 'Upper Back'],
    description: 'Roll shoulders backward in circular motion, then forward.',
    benefits: ['Relieves tension', 'Improves shoulder mobility', 'Prevents stiffness'],
    recommended: true,
  },
  {
    id: '3',
    name: 'Cat-Cow Stretch',
    duration: 90,
    difficulty: 'beginner',
    targetArea: ['Back', 'Core'],
    description: 'On hands and knees, alternate between arching and rounding your spine.',
    benefits: ['Improves spinal flexibility', 'Relieves back pain', 'Massages organs'],
    recommended: true,
  },
  {
    id: '4',
    name: 'Hamstring Stretch',
    duration: 60,
    difficulty: 'intermediate',
    targetArea: ['Legs', 'Lower Back'],
    description: 'Sit with one leg extended, reach toward your toes. Hold 30 seconds each side.',
    benefits: ['Prevents hamstring injuries', 'Improves flexibility', 'Reduces back pain'],
    recommended: false,
  },
  {
    id: '5',
    name: 'Thoracic Spine Rotation',
    duration: 75,
    difficulty: 'intermediate',
    targetArea: ['Back', 'Core'],
    description: 'Lie on side, rotate upper body while keeping hips stable.',
    benefits: ['Improves spinal mobility', 'Reduces stiffness', 'Better posture'],
    recommended: true,
  },
  {
    id: '6',
    name: 'Pigeon Pose',
    duration: 120,
    difficulty: 'advanced',
    targetArea: ['Hips', 'Glutes'],
    description: 'From plank, bring one knee forward between hands. Lower down gently.',
    benefits: ['Deep hip stretch', 'Releases tension', 'Improves hip flexibility'],
    recommended: false,
  },
  {
    id: '7',
    name: 'Wrist Circles',
    duration: 30,
    difficulty: 'beginner',
    targetArea: ['Wrists', 'Forearms'],
    description: 'Rotate wrists in circles clockwise, then counterclockwise.',
    benefits: ['Prevents wrist strain', 'Improves joint health', 'Increases mobility'],
    recommended: true,
  },
  {
    id: '8',
    name: 'Ankle Mobility',
    duration: 45,
    difficulty: 'beginner',
    targetArea: ['Ankles', 'Calves'],
    description: 'Circle ankles, point and flex feet. Do alphabet with toes.',
    benefits: ['Prevents ankle injuries', 'Improves balance', 'Increases mobility'],
    recommended: false,
  },
];

const RECOVERY_TIPS = [
  {
    title: 'Rest Days Are Important',
    description: 'Your muscles need time to repair and grow stronger. Take at least 1-2 rest days per week.',
    icon: '😴',
  },
  {
    title: 'Listen to Your Body',
    description: 'Pain is your body&apos;s warning signal. Stop exercising if you feel sharp or persistent pain.',
    icon: '👂',
  },
  {
    title: 'Proper Form First',
    description: 'Always prioritize correct form over heavy weights or high intensity. Poor form leads to injuries.',
    icon: '✅',
  },
  {
    title: 'Warm Up & Cool Down',
    description: 'Always warm up before workouts and cool down after. This reduces injury risk significantly.',
    icon: '🔥',
  },
  {
    title: 'Stay Hydrated',
    description: 'Dehydration can lead to muscle cramps and reduced performance. Drink water throughout the day.',
    icon: '💧',
  },
  {
    title: 'Progressive Overload',
    description: 'Increase intensity gradually. Sudden jumps in weight or duration increase injury risk.',
    icon: '📈',
  },
];

export default function InjuryPreventionScreen() {
  const { getTodayStats } = useFitness();
  const todayStats = getTodayStats();
  const [selectedDifficulty, setSelectedDifficulty] = useState<'all' | 'beginner' | 'intermediate' | 'advanced'>('all');
  const [completedStretches, setCompletedStretches] = useState<Set<string>>(new Set());

  const activityLevel = todayStats.activeMinutes > 60 ? 'high' : todayStats.activeMinutes > 30 ? 'moderate' : 'low';

  const filteredStretches = STRETCHES.filter(s => 
    selectedDifficulty === 'all' || s.difficulty === selectedDifficulty
  );

  const recommendedStretches = filteredStretches.filter(s => s.recommended);

  const toggleStretch = (id: string) => {
    const newCompleted = new Set(completedStretches);
    if (newCompleted.has(id)) {
      newCompleted.delete(id);
    } else {
      newCompleted.add(id);
    }
    setCompletedStretches(newCompleted);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return Colors.green;
      case 'intermediate': return Colors.orange;
      case 'advanced': return Colors.red;
      default: return Colors.textSecondary;
    }
  };

  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{ 
          title: 'Injury Prevention',
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
        <View style={styles.activityCard}>
          <LinearGradient
            colors={[Colors.red + '20', Colors.pink + '15']}
            style={styles.activityGradient}
          >
            <View style={styles.activityHeader}>
              <View style={styles.iconBadge}>
                <ShieldAlert size={24} color={Colors.red} />
              </View>
              <View style={styles.activityInfo}>
                <Text style={styles.activityTitle}>Today&apos;s Activity Level</Text>
                <Text style={[styles.activityLevel, { 
                  color: activityLevel === 'high' ? Colors.red : activityLevel === 'moderate' ? Colors.orange : Colors.green 
                }]}>
                  {activityLevel.toUpperCase()}
                </Text>
              </View>
            </View>
            <Text style={styles.activitySuggestion}>
              {activityLevel === 'high' 
                ? 'Focus on recovery stretches and light mobility work today.'
                : activityLevel === 'moderate'
                ? 'Add 5-10 minutes of stretching to prevent tightness.'
                : 'Great time for a full stretching routine and mobility work!'}
            </Text>
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Clock size={16} color={Colors.red} />
                <Text style={styles.statText}>{todayStats.activeMinutes} min active</Text>
              </View>
              <View style={styles.statItem}>
                <Target size={16} color={Colors.red} />
                <Text style={styles.statText}>{completedStretches.size} stretches done</Text>
              </View>
            </View>
          </LinearGradient>
        </View>

        {recommendedStretches.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Star size={20} color={Colors.accent} />
              <Text style={styles.sectionTitle}>Recommended For You</Text>
            </View>
            <Text style={styles.sectionSubtitle}>Based on your activity level and common problem areas</Text>

            {recommendedStretches.map((stretch) => (
              <TouchableOpacity
                key={stretch.id}
                style={styles.stretchCard}
                activeOpacity={0.7}
                onPress={() => toggleStretch(stretch.id)}
              >
                <View style={styles.stretchHeader}>
                  <View style={styles.stretchInfo}>
                    <View style={styles.stretchTitleRow}>
                      <Text style={styles.stretchName}>{stretch.name}</Text>
                      {completedStretches.has(stretch.id) && (
                        <CheckCircle2 size={20} color={Colors.green} />
                      )}
                    </View>
                    <View style={styles.stretchMeta}>
                      <View style={styles.metaBadge}>
                        <Clock size={12} color={Colors.textSecondary} />
                        <Text style={styles.metaText}>{stretch.duration}s</Text>
                      </View>
                      <View style={[styles.metaBadge, { backgroundColor: getDifficultyColor(stretch.difficulty) + '20' }]}>
                        <Text style={[styles.metaText, { color: getDifficultyColor(stretch.difficulty) }]}>
                          {stretch.difficulty}
                        </Text>
                      </View>
                      {stretch.targetArea.map((area) => (
                        <View key={area} style={styles.metaBadge}>
                          <Text style={styles.metaText}>{area}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                </View>
                <Text style={styles.stretchDescription}>{stretch.description}</Text>
                <View style={styles.benefitsList}>
                  {stretch.benefits.map((benefit, idx) => (
                    <View key={idx} style={styles.benefitItem}>
                      <View style={styles.benefitDot} />
                      <Text style={styles.benefitText}>{benefit}</Text>
                    </View>
                  ))}
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <TrendingUp size={20} color={Colors.primary} />
            <Text style={styles.sectionTitle}>All Stretches</Text>
          </View>

          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.filterScroll}
            contentContainerStyle={styles.filterContent}
          >
            {['all', 'beginner', 'intermediate', 'advanced'].map((difficulty) => (
              <TouchableOpacity
                key={difficulty}
                style={[
                  styles.filterButton,
                  selectedDifficulty === difficulty && styles.filterButtonActive
                ]}
                onPress={() => setSelectedDifficulty(difficulty as any)}
                activeOpacity={0.7}
              >
                <Text style={[
                  styles.filterText,
                  selectedDifficulty === difficulty && styles.filterTextActive
                ]}>
                  {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {filteredStretches.filter(s => !s.recommended).map((stretch) => (
            <TouchableOpacity
              key={stretch.id}
              style={styles.stretchCard}
              activeOpacity={0.7}
              onPress={() => toggleStretch(stretch.id)}
            >
              <View style={styles.stretchHeader}>
                <View style={styles.stretchInfo}>
                  <View style={styles.stretchTitleRow}>
                    <Text style={styles.stretchName}>{stretch.name}</Text>
                    {completedStretches.has(stretch.id) && (
                      <CheckCircle2 size={20} color={Colors.green} />
                    )}
                  </View>
                  <View style={styles.stretchMeta}>
                    <View style={styles.metaBadge}>
                      <Clock size={12} color={Colors.textSecondary} />
                      <Text style={styles.metaText}>{stretch.duration}s</Text>
                    </View>
                    <View style={[styles.metaBadge, { backgroundColor: getDifficultyColor(stretch.difficulty) + '20' }]}>
                      <Text style={[styles.metaText, { color: getDifficultyColor(stretch.difficulty) }]}>
                        {stretch.difficulty}
                      </Text>
                    </View>
                    {stretch.targetArea.map((area) => (
                      <View key={area} style={styles.metaBadge}>
                        <Text style={styles.metaText}>{area}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              </View>
              <Text style={styles.stretchDescription}>{stretch.description}</Text>
              <View style={styles.benefitsList}>
                {stretch.benefits.map((benefit, idx) => (
                  <View key={idx} style={styles.benefitItem}>
                    <View style={styles.benefitDot} />
                    <Text style={styles.benefitText}>{benefit}</Text>
                  </View>
                ))}
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <ShieldAlert size={20} color={Colors.orange} />
            <Text style={styles.sectionTitle}>Recovery Tips</Text>
          </View>

          {RECOVERY_TIPS.map((tip, idx) => (
            <View key={idx} style={styles.tipCard}>
              <Text style={styles.tipIcon}>{tip.icon}</Text>
              <View style={styles.tipContent}>
                <Text style={styles.tipTitle}>{tip.title}</Text>
                <Text style={styles.tipDescription}>{tip.description}</Text>
              </View>
            </View>
          ))}
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
  activityCard: {
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 24,
  },
  activityGradient: {
    padding: 20,
  },
  activityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  iconBadge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activityInfo: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  activityLevel: {
    fontSize: 20,
    fontWeight: '700' as const,
    letterSpacing: 1,
  },
  activitySuggestion: {
    fontSize: 14,
    color: Colors.text,
    lineHeight: 20,
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 16,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statText: {
    fontSize: 13,
    color: Colors.text,
    fontWeight: '500' as const,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 16,
    lineHeight: 20,
  },
  filterScroll: {
    marginBottom: 16,
    marginHorizontal: -20,
    paddingHorizontal: 20,
  },
  filterContent: {
    gap: 8,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.cardBg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  filterButtonActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  filterText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.textSecondary,
  },
  filterTextActive: {
    color: Colors.white,
  },
  stretchCard: {
    backgroundColor: Colors.cardBg,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  stretchHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  stretchInfo: {
    flex: 1,
  },
  stretchTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  stretchName: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.text,
    flex: 1,
  },
  stretchMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  metaBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: Colors.surfaceLight,
  },
  metaText: {
    fontSize: 11,
    fontWeight: '600' as const,
    color: Colors.textSecondary,
  },
  stretchDescription: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
    marginBottom: 12,
  },
  benefitsList: {
    gap: 6,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  benefitDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.green,
  },
  benefitText: {
    fontSize: 13,
    color: Colors.textSecondary,
    flex: 1,
  },
  tipCard: {
    flexDirection: 'row',
    backgroundColor: Colors.cardBg,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 12,
  },
  tipIcon: {
    fontSize: 32,
  },
  tipContent: {
    flex: 1,
  },
  tipTitle: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: Colors.text,
    marginBottom: 4,
  },
  tipDescription: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
});
