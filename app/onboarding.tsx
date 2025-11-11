import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Colors from '@/constants/colors';
import { useFitness } from '@/contexts/FitnessContext';
import { router } from 'expo-router';

// Simple onboarding collects profile basics before user explores app.
export default function OnboardingScreen() {
  const insets = useSafeAreaInsets();
  const { user, updateUserProfile } = useFitness();
  const [name, setName] = useState(user.name || '');
  const [email, setEmail] = useState(user.email || '');
  const [avatar, setAvatar] = useState(user.avatar || '🙂');
  const [step, setStep] = useState(0);

  useEffect(() => {
    // If already onboarded (has backendId + name + email), skip
    if (user.backendId && user.name && user.email) {
      router.replace('/(tabs)');
    }
  }, [user]);

  const steps = [
    'Welcome',
    'Profile',
    'Avatar',
    'Finish'
  ];

  const next = async () => {
    if (step === steps.length - 1) {
      await updateUserProfile({ name: name.trim(), email: email.trim(), avatar });
      router.replace('/(tabs)');
      return;
    }
    setStep(s => s + 1);
  };

  const back = () => {
    if (step === 0) return;
    setStep(s => s - 1);
  };

  const avatarChoices = ['🙂','😄','🔥','💪','🚀','🌟','🏃','🧘','🥇','🎯'];

  return (
    <KeyboardAvoidingView style={{ flex:1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <LinearGradient colors={[Colors.background, Colors.surface]} style={StyleSheet.absoluteFillObject} />
      <ScrollView contentContainerStyle={[styles.container, { paddingTop: insets.top + 24, paddingBottom: insets.bottom + 24 }]} showsVerticalScrollIndicator={false}>
        <View style={{ alignItems: 'flex-end' }}>
          <TouchableOpacity
            onPress={async () => {
              const fallbackName = name.trim() || 'Friend';
              const fallbackEmail = email.trim() || `user-${user.id}@example.com`;
              const fallbackAvatar = avatar || '🙂';
              await updateUserProfile({ name: fallbackName, email: fallbackEmail, avatar: fallbackAvatar });
              router.replace('/(tabs)');
            }}
          >
            <Text style={styles.skipLink}>Skip</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.progress}>{step + 1} / {steps.length}</Text>
        <Text style={styles.title}>{steps[step]}</Text>

        {step === 0 && (
          <View style={styles.section}>
            <Text style={styles.paragraph}>Welcome to MyMotivFitX! Let's set up your profile so we can personalize your experience.</Text>
          </View>
        )}

        {step === 1 && (
          <View style={styles.section}>
            <Text style={styles.label}>Name</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="Your name"
              placeholderTextColor={Colors.textMuted}
            />
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="you@example.com"
              keyboardType="email-address"
              autoCapitalize="none"
              placeholderTextColor={Colors.textMuted}
            />
          </View>
        )}

        {step === 2 && (
          <View style={styles.section}>
            <Text style={styles.label}>Choose an avatar</Text>
            <View style={styles.avatarGrid}>
              {avatarChoices.map(a => (
                <TouchableOpacity
                  key={a}
                  style={[styles.avatarChoice, avatar === a && styles.avatarChoiceActive]}
                  onPress={() => setAvatar(a)}
                >
                  <Text style={styles.avatarEmoji}>{a}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {step === 3 && (
          <View style={styles.section}>
            <Text style={styles.summary}>Ready to go!</Text>
            <Text style={styles.paragraph}>Name: <Text style={styles.bold}>{name || '—'}</Text></Text>
            <Text style={styles.paragraph}>Email: <Text style={styles.bold}>{email || '—'}</Text></Text>
            <Text style={styles.paragraph}>Avatar: <Text style={styles.bold}>{avatar}</Text></Text>
          </View>
        )}

        <View style={styles.navRow}>
          <TouchableOpacity style={[styles.navBtn, step === 0 && styles.navBtnDisabled]} disabled={step === 0} onPress={back}>
            <Text style={styles.navBtnText}>Back</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.navBtn, styles.navPrimary, (step === 1 && (!name.trim() || !email.trim())) && styles.navBtnDisabled]}
            disabled={(step === 1 && (!name.trim() || !email.trim()))}
            onPress={next}
          >
            <Text style={[styles.navBtnText, styles.navPrimaryText]}>{step === steps.length - 1 ? 'Finish' : 'Next'}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: 24 },
  skipLink: { color: Colors.textSecondary, textDecorationLine: 'underline', marginBottom: 8 },
  progress: { fontSize: 12, color: Colors.textSecondary, marginBottom: 8 },
  title: { fontSize: 28, fontWeight: '700', color: Colors.text, marginBottom: 12 },
  section: { marginBottom: 24 },
  paragraph: { fontSize: 14, color: Colors.textSecondary, lineHeight: 20, marginBottom: 8 },
  label: { fontSize: 13, fontWeight: '600', color: Colors.text, marginBottom: 6, marginTop: 4 },
  input: { backgroundColor: Colors.cardBg, borderRadius: 14, paddingHorizontal: 16, paddingVertical: 14, borderWidth: 1, borderColor: Colors.border, color: Colors.text, fontSize: 16, marginBottom: 12 },
  avatarGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  avatarChoice: { width: 64, height: 64, borderRadius: 16, backgroundColor: Colors.surfaceLight, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: Colors.border },
  avatarChoiceActive: { borderColor: Colors.primary, backgroundColor: Colors.primary + '20' },
  avatarEmoji: { fontSize: 32 },
  summary: { fontSize: 20, fontWeight: '600', color: Colors.text, marginBottom: 12 },
  bold: { fontWeight: '700', color: Colors.text },
  navRow: { flexDirection: 'row', gap: 16, marginTop: 12 },
  navBtn: { flex: 1, paddingVertical: 16, borderRadius: 14, backgroundColor: Colors.cardBg, alignItems: 'center', borderWidth: 1, borderColor: Colors.border },
  navBtnDisabled: { opacity: 0.35 },
  navBtnText: { fontSize: 16, fontWeight: '600', color: Colors.text },
  navPrimary: { backgroundColor: Colors.primary },
  navPrimaryText: { color: Colors.white },
});
