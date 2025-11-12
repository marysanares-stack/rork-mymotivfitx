import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { Stack } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Send, User, Bot, Dumbbell, Target, Info } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { useRorkAgent, createRorkTool } from '@/lib/rork-toolkit-stub';
import { z } from 'zod';
import { useFitness } from '@/contexts/FitnessContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';



export default function AICoachScreen() {
  const [input, setInput] = useState('');
  const insets = useSafeAreaInsets();
  const { addWorkoutPlan, user, getTodayStats } = useFitness();

  const generateId = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  const { messages, error, sendMessage, status } = useRorkAgent({
    tools: {
      createWorkoutPlan: createRorkTool({
        description: 'Create a custom workout plan for the user',
        zodSchema: z.object({
          name: z.string().describe('Name of the workout plan'),
          description: z.string().describe('Detailed description of the plan'),
          difficulty: z.enum(['beginner', 'intermediate', 'advanced']).describe('Difficulty level'),
          duration: z.number().describe('Duration in minutes per session'),
          frequency: z.string().describe('How often to do this workout (e.g., "3x per week")'),
          exercises: z.array(z.object({
            name: z.string(),
            sets: z.number().optional(),
            reps: z.number().optional(),
            duration: z.number().optional(),
            notes: z.string().optional(),
          })).describe('List of exercises in the plan'),
        }),
        async execute(toolInput) {
          await addWorkoutPlan({
            name: toolInput.name,
            description: `${toolInput.description}\n\nFrequency: ${toolInput.frequency}`,
            difficulty: toolInput.difficulty,
            duration: toolInput.duration,
            category: 'mixed',
            exercises: toolInput.exercises.map((ex: {
              name: string;
              sets?: number;
              reps?: number;
              duration?: number;
              notes?: string;
            }) => ({
              id: generateId(),
              name: ex.name,
              sets: ex.sets,
              reps: ex.reps,
              duration: ex.duration,
              notes: ex.notes,
            })),
          });
          return `Created workout plan: ${toolInput.name}`;
        },
      }),
      getUserStats: createRorkTool({
        description: 'Get user\'s current fitness statistics to provide personalized recommendations',
        zodSchema: z.object({}),
        execute() {
          const stats = getTodayStats();
          return JSON.stringify({
            todaySteps: stats.steps,
            todayCalories: stats.calories,
            todayActiveMinutes: stats.activeMinutes,
            userName: user.name,
          });
        },
      }),
    },
  });

  const isLoading = Boolean(status);

  const handleSend = () => {
    if (!input.trim() || isLoading) return;
    sendMessage(input.trim());
    setInput('');
  };

  const quickPrompts = [
    { icon: '💪', text: 'Create a beginner strength plan', prompt: 'Create a beginner-friendly strength training workout plan for me' },
    { icon: '🏃', text: 'Running form tips', prompt: 'Give me tips on proper running form and technique' },
    { icon: '🎯', text: 'Build muscle', prompt: 'I want to build muscle. What exercises should I focus on?' },
    { icon: '🔥', text: 'Fat loss workout', prompt: 'Create a workout plan focused on fat loss and cardio' },
  ];

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom }]}>
      <Stack.Screen
        options={{
          headerShown: true,
          title: 'AI Workout Coach',
          headerStyle: {
            backgroundColor: Colors.background,
          },
          headerTintColor: Colors.text,
          headerShadowVisible: false,
        }}
      />
      
      <LinearGradient
        colors={[Colors.background, Colors.surface]}
        style={StyleSheet.absoluteFillObject}
      />

      <ScrollView
        style={styles.messagesContainer}
        contentContainerStyle={styles.messagesContent}
        showsVerticalScrollIndicator={false}
      >
        {messages.length === 0 && (
          <View style={styles.welcomeContainer}>
            <View style={styles.welcomeIconContainer}>
              <LinearGradient
                colors={[Colors.primary, Colors.purple]}
                style={styles.welcomeIconGradient}
              >
                <Bot size={40} color={Colors.white} />
              </LinearGradient>
            </View>
            <Text style={styles.welcomeTitle}>AI Workout Coach</Text>
            <Text style={styles.welcomeDescription}>
              Hello! I&apos;m your AI Workout Coach. I can help you with:
            </Text>
            <Text style={styles.welcomeFeature}>• Form tips and exercise technique advice</Text>
            <Text style={styles.welcomeFeature}>• Exercise suggestions based on your goals</Text>
            <Text style={styles.welcomeFeature}>• Creating personalized workout plans</Text>
            <Text style={styles.welcomeFeature}>• Workout recommendations</Text>
          </View>
        )}

        {messages.length <= 1 && (
          <View style={styles.quickPromptsContainer}>
            <Text style={styles.quickPromptsTitle}>Quick Start</Text>
            <View style={styles.quickPrompts}>
              {quickPrompts.map((prompt, idx) => (
                <TouchableOpacity
                  key={idx}
                  style={styles.quickPromptCard}
                  onPress={() => {
                    setInput(prompt.prompt);
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={styles.quickPromptIcon}>{prompt.icon}</Text>
                  <Text style={styles.quickPromptText}>{prompt.text}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {messages.map((message) => (
          <View
            key={message.id}
            style={[
              styles.messageRow,
              message.role === 'user' ? styles.userMessageRow : styles.assistantMessageRow,
            ]}
          >
            <View
              style={[
                styles.messageAvatar,
                message.role === 'user' ? styles.userAvatar : styles.assistantAvatar,
              ]}
            >
              {message.role === 'user' ? (
                <User size={16} color={Colors.white} />
              ) : (
                <Bot size={16} color={Colors.white} />
              )}
            </View>
            <View
              style={[
                styles.messageBubble,
                message.role === 'user' ? styles.userBubble : styles.assistantBubble,
              ]}
            >
              {message.parts.map((part, idx) => {
                if (part.type === 'text') {
                  return (
                    <Text
                      key={idx}
                      style={[
                        styles.messageText,
                        message.role === 'user' ? styles.userText : styles.assistantText,
                      ]}
                    >
                      {part.text}
                    </Text>
                  );
                }

                if (part.type === 'tool') {
                  const toolName = part.toolName;

                  if (part.state === 'input-streaming' || part.state === 'input-available') {
                    return (
                      <View key={idx} style={styles.toolCall}>
                        <Dumbbell size={16} color={Colors.primary} />
                        <Text style={styles.toolCallText}>
                          {toolName === 'createWorkoutPlan' ? 'Creating workout plan...' : 'Analyzing...'}
                        </Text>
                      </View>
                    );
                  }

                  if (part.state === 'output-available') {
                    return (
                      <View key={idx} style={styles.toolResult}>
                        <Target size={16} color={Colors.green} />
                        <Text style={styles.toolResultText}>
                          {typeof part.output === 'string' ? part.output : 'Action completed successfully'}
                        </Text>
                      </View>
                    );
                  }

                  if (part.state === 'output-error') {
                    return (
                      <View key={idx} style={styles.toolError}>
                        <Info size={16} color={Colors.red} />
                        <Text style={styles.toolErrorText}>
                          Error: {part.errorText}
                        </Text>
                      </View>
                    );
                  }
                }

                return null;
              })}
            </View>
          </View>
        ))}

        {isLoading && (
          <View style={[styles.messageRow, styles.assistantMessageRow]}>
            <View style={[styles.messageAvatar, styles.assistantAvatar]}>
              <Bot size={16} color={Colors.white} />
            </View>
            <View style={[styles.messageBubble, styles.assistantBubble]}>
              <ActivityIndicator color={Colors.primary} size="small" />
            </View>
          </View>
        )}

        {error && (
          <View style={styles.errorContainer}>
            <Info size={16} color={Colors.red} />
            <Text style={styles.errorText}>Error: {String(error)}</Text>
          </View>
        )}
      </ScrollView>

      <View style={styles.inputContainer}>
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.input}
            placeholder="Ask about workouts, form, exercises..."
            placeholderTextColor={Colors.textMuted}
            value={input}
            onChangeText={setInput}
            multiline
            maxLength={500}
            editable={!isLoading}
          />
          <TouchableOpacity
            style={[styles.sendButton, (!input.trim() || isLoading) && styles.sendButtonDisabled]}
            onPress={handleSend}
            activeOpacity={0.7}
            disabled={!input.trim() || isLoading}
          >
            <LinearGradient
              colors={!input.trim() || isLoading ? [Colors.surfaceLight, Colors.surfaceLight] : [Colors.primary, Colors.purple]}
              style={styles.sendButtonGradient}
            >
              <Send size={20} color={Colors.white} />
            </LinearGradient>
          </TouchableOpacity>
        </View>
        {Platform.OS === 'ios' && <View style={styles.iosBottomSpacer} />}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: 16,
    paddingBottom: 24,
  },
  quickPromptsContainer: {
    marginBottom: 24,
  },
  quickPromptsTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.text,
    marginBottom: 12,
  },
  quickPrompts: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  quickPromptCard: {
    width: '48%',
    backgroundColor: Colors.cardBg,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    gap: 8,
  },
  quickPromptIcon: {
    fontSize: 32,
  },
  quickPromptText: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: Colors.text,
    textAlign: 'center',
  },
  messageRow: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 10,
  },
  userMessageRow: {
    justifyContent: 'flex-end',
  },
  assistantMessageRow: {
    justifyContent: 'flex-start',
  },
  messageAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  userAvatar: {
    backgroundColor: Colors.primary,
  },
  assistantAvatar: {
    backgroundColor: Colors.purple,
  },
  messageBubble: {
    maxWidth: '75%',
    padding: 14,
    borderRadius: 16,
  },
  userBubble: {
    backgroundColor: Colors.primary,
    borderBottomRightRadius: 4,
  },
  assistantBubble: {
    backgroundColor: Colors.cardBg,
    borderWidth: 1,
    borderColor: Colors.border,
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 22,
  },
  userText: {
    color: Colors.white,
  },
  assistantText: {
    color: Colors.text,
  },
  toolCall: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 8,
    backgroundColor: Colors.primary + '15',
    borderRadius: 8,
    marginTop: 8,
  },
  toolCallText: {
    fontSize: 13,
    color: Colors.primary,
    fontWeight: '600' as const,
  },
  toolResult: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 8,
    backgroundColor: Colors.green + '15',
    borderRadius: 8,
    marginTop: 8,
  },
  toolResultText: {
    fontSize: 13,
    color: Colors.green,
    fontWeight: '600' as const,
    flex: 1,
  },
  toolError: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 8,
    backgroundColor: Colors.red + '15',
    borderRadius: 8,
    marginTop: 8,
  },
  toolErrorText: {
    fontSize: 13,
    color: Colors.red,
    flex: 1,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    backgroundColor: Colors.red + '15',
    borderRadius: 12,
    marginTop: 8,
  },
  errorText: {
    fontSize: 13,
    color: Colors.red,
    flex: 1,
  },
  inputContainer: {
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    padding: 12,
  },
  inputWrapper: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'flex-end',
  },
  input: {
    flex: 1,
    backgroundColor: Colors.cardBg,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    color: Colors.text,
    maxHeight: 100,
  },
  sendButton: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  sendButtonGradient: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iosBottomSpacer: {
    height: 8,
  },
  welcomeContainer: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 24,
  },
  welcomeIconContainer: {
    marginBottom: 20,
  },
  welcomeIconGradient: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: Colors.text,
    marginBottom: 12,
  },
  welcomeDescription: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 24,
  },
  welcomeFeature: {
    fontSize: 14,
    color: Colors.text,
    marginBottom: 8,
    lineHeight: 20,
  },
});
