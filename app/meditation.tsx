import { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { Stack } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Play, Pause, RotateCcw, Wind, Brain, Heart, Moon, Sun, Flower2, CheckCircle2 } from 'lucide-react-native';
import Colors from '@/constants/colors';



interface Session {
  id: string;
  name: string;
  duration: number;
  type: 'meditation' | 'breathing';
  description: string;
  benefits: string[];
  icon: 'brain' | 'heart' | 'moon' | 'sun' | 'flower' | 'wind';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  inhale?: number;
  hold?: number;
  exhale?: number;
  cycles?: number;
}

const SESSIONS: Session[] = [
  {
    id: '1',
    name: 'Box Breathing',
    duration: 300,
    type: 'breathing',
    description: '4-4-4-4 breathing pattern used by Navy SEALs to reduce stress and improve focus.',
    benefits: ['Reduces anxiety', 'Improves focus', 'Lowers heart rate'],
    icon: 'wind',
    difficulty: 'beginner',
    inhale: 4,
    hold: 4,
    exhale: 4,
    cycles: 10,
  },
  {
    id: '2',
    name: 'Morning Mindfulness',
    duration: 600,
    type: 'meditation',
    description: 'Start your day with clarity and intention. Perfect for morning routine.',
    benefits: ['Increases energy', 'Sets positive tone', 'Improves focus'],
    icon: 'sun',
    difficulty: 'beginner',
  },
  {
    id: '3',
    name: '4-7-8 Breathing',
    duration: 240,
    type: 'breathing',
    description: 'Developed by Dr. Andrew Weil. Excellent for falling asleep quickly.',
    benefits: ['Helps sleep', 'Reduces anxiety', 'Calms nervous system'],
    icon: 'moon',
    difficulty: 'beginner',
    inhale: 4,
    hold: 7,
    exhale: 8,
    cycles: 8,
  },
  {
    id: '4',
    name: 'Stress Relief',
    duration: 480,
    type: 'meditation',
    description: 'Release tension and find calm. Great for midday reset.',
    benefits: ['Reduces stress', 'Relaxes muscles', 'Improves mood'],
    icon: 'flower',
    difficulty: 'intermediate',
  },
  {
    id: '5',
    name: 'Deep Focus',
    duration: 900,
    type: 'meditation',
    description: 'Enhanced concentration meditation for work or study sessions.',
    benefits: ['Improves concentration', 'Enhances productivity', 'Clears mind'],
    icon: 'brain',
    difficulty: 'intermediate',
  },
  {
    id: '6',
    name: 'Loving Kindness',
    duration: 720,
    type: 'meditation',
    description: 'Cultivate compassion and positive emotions toward yourself and others.',
    benefits: ['Increases empathy', 'Reduces negativity', 'Improves relationships'],
    icon: 'heart',
    difficulty: 'intermediate',
  },
  {
    id: '7',
    name: 'Sleep Preparation',
    duration: 600,
    type: 'meditation',
    description: 'Guided relaxation to prepare mind and body for deep, restful sleep.',
    benefits: ['Improves sleep quality', 'Reduces racing thoughts', 'Deep relaxation'],
    icon: 'moon',
    difficulty: 'beginner',
  },
  {
    id: '8',
    name: 'Wim Hof Breathing',
    duration: 420,
    type: 'breathing',
    description: 'Powerful breathing technique to boost energy and strengthen immune system.',
    benefits: ['Increases energy', 'Strengthens immunity', 'Improves mental clarity'],
    icon: 'wind',
    difficulty: 'advanced',
    inhale: 2,
    hold: 15,
    exhale: 2,
    cycles: 3,
  },
];



interface CompletedSession {
  sessionId: string;
  sessionName: string;
  duration: number;
  completedAt: string;
}

export default function MeditationScreen() {
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [isActive, setIsActive] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [completedSessions, setCompletedSessions] = useState<CompletedSession[]>([]);
  const [breathPhase, setBreathPhase] = useState<'inhale' | 'hold' | 'exhale'>('inhale');
  const [currentCycle, setCurrentCycle] = useState(0);
  
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const breathTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const totalMinutes = Math.floor(
    completedSessions.reduce((sum, s) => sum + s.duration, 0) / 60
  );
  const totalSessions = completedSessions.length;
  const currentStreak = 7;

  // Stable callbacks for effects
  const animateBreathing = useCallback(() => {
    if (!selectedSession || selectedSession.type !== 'breathing') return;

    const durations = {
      inhale: (selectedSession.inhale || 4) * 1000,
      hold: (selectedSession.hold || 4) * 1000,
      exhale: (selectedSession.exhale || 4) * 1000,
    };

    if (breathPhase === 'inhale') {
      Animated.timing(scaleAnim, {
        toValue: 1.4,
        duration: durations.inhale,
        useNativeDriver: true,
      }).start(() => {
        setBreathPhase('hold');
      });
    } else if (breathPhase === 'hold') {
      breathTimerRef.current = setTimeout(() => {
        setBreathPhase('exhale');
      }, durations.hold);
    } else if (breathPhase === 'exhale') {
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: durations.exhale,
        useNativeDriver: true,
      }).start(() => {
        const newCycle = currentCycle + 1;
        if (newCycle < (selectedSession.cycles || 10)) {
          setCurrentCycle(newCycle);
          setBreathPhase('inhale');
        }
      });
    }
  }, [selectedSession, breathPhase, currentCycle, scaleAnim]);

  const completeSession = useCallback(() => {
    if (selectedSession) {
      const completed: CompletedSession = {
        sessionId: selectedSession.id,
        sessionName: selectedSession.name,
        duration: selectedSession.duration,
        completedAt: new Date().toISOString(),
      };
      setCompletedSessions([completed, ...completedSessions]);
    }
    setIsActive(false);
    setSelectedSession(null);
  }, [selectedSession, completedSessions]);

  

  useEffect(() => {
    if (isActive && timeRemaining > 0) {
      timerRef.current = setTimeout(() => {
        setTimeRemaining(timeRemaining - 1);
      }, 1000);
    } else if (timeRemaining === 0 && isActive) {
      completeSession();
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isActive, timeRemaining, completeSession]);

  useEffect(() => {
    if (selectedSession?.type === 'breathing' && isActive) {
      animateBreathing();
    }
  }, [breathPhase, isActive, selectedSession, animateBreathing]);

  const startSession = (session: Session) => {
    setSelectedSession(session);
    setTimeRemaining(session.duration);
    setIsActive(true);
    setBreathPhase('inhale');
    setCurrentCycle(0);
    scaleAnim.setValue(1);
  };

  const pauseSession = () => {
    setIsActive(false);
    if (breathTimerRef.current) clearTimeout(breathTimerRef.current);
  };

  const resumeSession = () => {
    setIsActive(true);
  };

  const resetSession = () => {
    setIsActive(false);
    setTimeRemaining(selectedSession?.duration || 0);
    setBreathPhase('inhale');
    setCurrentCycle(0);
    scaleAnim.setValue(1);
    if (breathTimerRef.current) clearTimeout(breathTimerRef.current);
  };


  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getSessionIcon = (iconName: string) => {
    switch (iconName) {
      case 'brain': return <Brain size={24} color={Colors.white} />;
      case 'heart': return <Heart size={24} color={Colors.white} />;
      case 'moon': return <Moon size={24} color={Colors.white} />;
      case 'sun': return <Sun size={24} color={Colors.white} />;
      case 'flower': return <Flower2 size={24} color={Colors.white} />;
      case 'wind': return <Wind size={24} color={Colors.white} />;
      default: return <Brain size={24} color={Colors.white} />;
    }
  };

  const getSessionGradient = (iconName: string): [string, string] => {
    switch (iconName) {
      case 'brain': return [Colors.purple, Colors.indigo];
      case 'heart': return [Colors.red, Colors.pink];
      case 'moon': return [Colors.indigo, Colors.purple];
      case 'sun': return [Colors.orange, Colors.accent];
      case 'flower': return [Colors.pink, Colors.purple];
      case 'wind': return [Colors.cyan, Colors.blue];
      default: return [Colors.primary, Colors.purple];
    }
  };

  if (selectedSession) {
    const progress = 1 - (timeRemaining / selectedSession.duration);
    const [color1, color2] = getSessionGradient(selectedSession.icon);

    return (
      <View style={styles.container}>
        <Stack.Screen 
          options={{ 
            title: selectedSession.name,
            headerStyle: { backgroundColor: Colors.background },
            headerTintColor: Colors.text,
          }} 
        />
        <LinearGradient
          colors={[color1, color2]}
          style={StyleSheet.absoluteFillObject}
        />

        <View style={styles.activeSession}>
          <View style={styles.progressRing}>
            <View style={styles.progressTrack} />
            <View style={[styles.progressFill, { 
              transform: [{ rotate: `${progress * 360}deg` }] 
            }]} />
          </View>

          {selectedSession.type === 'breathing' ? (
            <View style={styles.breathingContainer}>
              <Animated.View style={[
                styles.breathingCircle,
                { transform: [{ scale: scaleAnim }] }
              ]}>
                <LinearGradient
                  colors={[Colors.white + '40', Colors.white + '10']}
                  style={styles.breathingGradient}
                />
              </Animated.View>
              <View style={styles.breathingTextContainer}>
                <Text style={styles.breathingPhase}>
                  {breathPhase === 'inhale' ? 'Breathe In' : breathPhase === 'hold' ? 'Hold' : 'Breathe Out'}
                </Text>
                <Text style={styles.cycleText}>
                  Cycle {currentCycle + 1} of {selectedSession.cycles}
                </Text>
              </View>
            </View>
          ) : (
            <View style={styles.meditationContainer}>
              <Text style={styles.meditationEmoji}>🧘</Text>
              <Text style={styles.meditationText}>Stay focused on your breath</Text>
            </View>
          )}

          <View style={styles.timerContainer}>
            <Text style={styles.timerText}>{formatTime(timeRemaining)}</Text>
            <Text style={styles.timerLabel}>Time Remaining</Text>
          </View>

          <View style={styles.controls}>
            <TouchableOpacity
              style={styles.controlButton}
              onPress={resetSession}
              activeOpacity={0.7}
            >
              <RotateCcw size={24} color={Colors.white} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.mainControl}
              onPress={isActive ? pauseSession : resumeSession}
              activeOpacity={0.7}
            >
              {isActive ? (
                <Pause size={32} color={Colors.white} />
              ) : (
                <Play size={32} color={Colors.white} />
              )}
            </TouchableOpacity>

            <View style={styles.controlButton} />
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{ 
          title: 'Meditation & Breathing',
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
        <View style={styles.statsCard}>
          <LinearGradient
            colors={[Colors.primary, Colors.purple]}
            style={styles.statsGradient}
          >
            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{totalMinutes}</Text>
                <Text style={styles.statLabel}>Minutes</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{totalSessions}</Text>
                <Text style={styles.statLabel}>Sessions</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{currentStreak}</Text>
                <Text style={styles.statLabel}>Day Streak</Text>
              </View>
            </View>
          </LinearGradient>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Sessions</Text>
          <Text style={styles.sectionSubtitle}>Perfect for beginners or quick breaks</Text>
          
          {SESSIONS.filter(s => s.difficulty === 'beginner').map((session) => {
            const [color1, color2] = getSessionGradient(session.icon);
            return (
              <TouchableOpacity
                key={session.id}
                style={styles.sessionCard}
                activeOpacity={0.7}
                onPress={() => startSession(session)}
              >
                <LinearGradient
                  colors={[color1, color2]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.sessionGradient}
                >
                  <View style={styles.sessionHeader}>
                    <View style={styles.sessionIcon}>
                      {getSessionIcon(session.icon)}
                    </View>
                    <View style={styles.sessionInfo}>
                      <Text style={styles.sessionName}>{session.name}</Text>
                      <View style={styles.sessionMeta}>
                        <Text style={styles.sessionDuration}>
                          {Math.floor(session.duration / 60)} min
                        </Text>
                        <Text style={styles.sessionType}>
                          {session.type === 'breathing' ? '🌬️ Breathing' : '🧘 Meditation'}
                        </Text>
                      </View>
                    </View>
                  </View>
                  <Text style={styles.sessionDescription}>{session.description}</Text>
                </LinearGradient>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Intermediate Sessions</Text>
          
          {SESSIONS.filter(s => s.difficulty === 'intermediate').map((session) => {
            const [color1, color2] = getSessionGradient(session.icon);
            return (
              <TouchableOpacity
                key={session.id}
                style={styles.sessionCard}
                activeOpacity={0.7}
                onPress={() => startSession(session)}
              >
                <LinearGradient
                  colors={[color1, color2]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.sessionGradient}
                >
                  <View style={styles.sessionHeader}>
                    <View style={styles.sessionIcon}>
                      {getSessionIcon(session.icon)}
                    </View>
                    <View style={styles.sessionInfo}>
                      <Text style={styles.sessionName}>{session.name}</Text>
                      <View style={styles.sessionMeta}>
                        <Text style={styles.sessionDuration}>
                          {Math.floor(session.duration / 60)} min
                        </Text>
                        <Text style={styles.sessionType}>
                          {session.type === 'breathing' ? '🌬️ Breathing' : '🧘 Meditation'}
                        </Text>
                      </View>
                    </View>
                  </View>
                  <Text style={styles.sessionDescription}>{session.description}</Text>
                </LinearGradient>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Advanced Sessions</Text>
          
          {SESSIONS.filter(s => s.difficulty === 'advanced').map((session) => {
            const [color1, color2] = getSessionGradient(session.icon);
            return (
              <TouchableOpacity
                key={session.id}
                style={styles.sessionCard}
                activeOpacity={0.7}
                onPress={() => startSession(session)}
              >
                <LinearGradient
                  colors={[color1, color2]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.sessionGradient}
                >
                  <View style={styles.sessionHeader}>
                    <View style={styles.sessionIcon}>
                      {getSessionIcon(session.icon)}
                    </View>
                    <View style={styles.sessionInfo}>
                      <Text style={styles.sessionName}>{session.name}</Text>
                      <View style={styles.sessionMeta}>
                        <Text style={styles.sessionDuration}>
                          {Math.floor(session.duration / 60)} min
                        </Text>
                        <Text style={styles.sessionType}>
                          {session.type === 'breathing' ? '🌬️ Breathing' : '🧘 Meditation'}
                        </Text>
                      </View>
                    </View>
                  </View>
                  <Text style={styles.sessionDescription}>{session.description}</Text>
                </LinearGradient>
              </TouchableOpacity>
            );
          })}
        </View>

        {completedSessions.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Recent History</Text>
            {completedSessions.slice(0, 5).map((session, idx) => (
              <View key={idx} style={styles.historyCard}>
                <View style={styles.historyLeft}>
                  <CheckCircle2 size={20} color={Colors.green} />
                  <View style={styles.historyInfo}>
                    <Text style={styles.historyName}>{session.sessionName}</Text>
                    <Text style={styles.historyDate}>
                      {new Date(session.completedAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </Text>
                  </View>
                </View>
                <Text style={styles.historyDuration}>
                  {Math.floor(session.duration / 60)} min
                </Text>
              </View>
            ))}
          </View>
        )}
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
  statsCard: {
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 24,
  },
  statsGradient: {
    padding: 20,
  },
  statsGrid: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 32,
    fontWeight: '700' as const,
    color: Colors.white,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 13,
    color: Colors.white,
    opacity: 0.9,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: Colors.white + '30',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: Colors.text,
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 16,
  },
  sessionCard: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 12,
  },
  sessionGradient: {
    padding: 16,
  },
  sessionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  sessionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.white + '30',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sessionInfo: {
    flex: 1,
  },
  sessionName: {
    fontSize: 17,
    fontWeight: '700' as const,
    color: Colors.white,
    marginBottom: 6,
  },
  sessionMeta: {
    flexDirection: 'row',
    gap: 12,
  },
  sessionDuration: {
    fontSize: 13,
    color: Colors.white,
    opacity: 0.9,
    fontWeight: '600' as const,
  },
  sessionType: {
    fontSize: 13,
    color: Colors.white,
    opacity: 0.9,
  },
  sessionDescription: {
    fontSize: 14,
    color: Colors.white,
    opacity: 0.85,
    lineHeight: 20,
  },
  activeSession: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  progressRing: {
    position: 'absolute',
    top: 60,
    width: 280,
    height: 280,
    borderRadius: 140,
  },
  progressTrack: {
    position: 'absolute',
    width: 280,
    height: 280,
    borderRadius: 140,
    borderWidth: 8,
    borderColor: Colors.white + '30',
  },
  progressFill: {
    position: 'absolute',
    width: 280,
    height: 280,
    borderRadius: 140,
    borderWidth: 8,
    borderColor: Colors.white,
    borderLeftColor: 'transparent',
    borderBottomColor: 'transparent',
  },
  breathingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
  },
  breathingCircle: {
    width: 200,
    height: 200,
    borderRadius: 100,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
  },
  breathingGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 100,
  },
  breathingTextContainer: {
    alignItems: 'center',
  },
  breathingPhase: {
    fontSize: 28,
    fontWeight: '700' as const,
    color: Colors.white,
    marginBottom: 8,
  },
  cycleText: {
    fontSize: 16,
    color: Colors.white,
    opacity: 0.8,
  },
  meditationContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  meditationEmoji: {
    fontSize: 80,
    marginBottom: 16,
  },
  meditationText: {
    fontSize: 18,
    color: Colors.white,
    opacity: 0.9,
  },
  timerContainer: {
    alignItems: 'center',
    marginBottom: 48,
  },
  timerText: {
    fontSize: 56,
    fontWeight: '700' as const,
    color: Colors.white,
    marginBottom: 8,
  },
  timerLabel: {
    fontSize: 16,
    color: Colors.white,
    opacity: 0.8,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 32,
  },
  controlButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.white + '30',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mainControl: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 8,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  historyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.cardBg,
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  historyLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  historyInfo: {
    flex: 1,
  },
  historyName: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: Colors.text,
    marginBottom: 4,
  },
  historyDate: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  historyDuration: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.primary,
  },
});
