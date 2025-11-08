import React, { useMemo, useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Gift, Send } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { useSocial } from '@/contexts/SocialContext';
import { User, Sticker } from '@/types';

export default function SendGiftScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { friends, stickers, sendGift } = useSocial();

  const [selectedFriend, setSelectedFriend] = useState<string | null>(null);
  const [selectedSticker, setSelectedSticker] = useState<string | null>(null);
  const [message, setMessage] = useState<string>('');

  const canSend = useMemo(() => !!selectedFriend && !!selectedSticker, [selectedFriend, selectedSticker]);

  const onSend = useCallback(() => {
    if (!selectedFriend || !selectedSticker) return;
    sendGift(selectedFriend, selectedSticker, message.trim() ? message : undefined);
    router.back();
  }, [message, router, selectedFriend, selectedSticker, sendGift]);

  const stickersByCategory = useMemo(() => {
    const grouped: Record<string, Sticker[]> = {};
    stickers.forEach((sticker) => {
      if (!grouped[sticker.category]) {
        grouped[sticker.category] = [];
      }
      grouped[sticker.category].push(sticker);
    });
    return grouped;
  }, [stickers]);

  const categoryLabels: Record<string, string> = {
    achievement: '🏆 Achievements',
    motivational: '⚡ Motivation',
    strength: '💪 Strength',
    support: '🤝 Support',
    celebration: '🎉 Celebration',
    wellness: '🧘 Wellness',
    cardio: '🏃 Cardio',
  };

  const renderFriend = (friend: User) => {
    const isSelected = selectedFriend === friend.id;
    return (
      <TouchableOpacity
        key={friend.id}
        style={[styles.friendItem, isSelected && styles.friendItemSelected]}
        onPress={() => setSelectedFriend(friend.id)}
        testID={`friend-${friend.id}`}
      >
        <View style={styles.friendAvatar}>
          <Text style={styles.friendAvatarText}>{friend.avatar}</Text>
        </View>
        <Text style={styles.friendName}>{friend.name}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}
      testID="send-gift-screen"
    >
      <LinearGradient colors={[Colors.background, Colors.surface]} style={StyleSheet.absoluteFillObject} />

      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Gift color={Colors.accent} size={24} />
          <Text style={styles.title}>Send Motivation</Text>
        </View>
        <TouchableOpacity
          onPress={onSend}
          disabled={!canSend}
          style={[styles.sendButton, !canSend && { opacity: 0.5 }]}
          testID="send-gift-button"
        >
          <Send color={Colors.white} size={18} />
          <Text style={styles.sendButtonText}>Send</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.headerSection}>
          <Text style={styles.headerTitle}>Send a Gift</Text>
          <Text style={styles.headerDesc}>Motivate your friends with meaningful gifts that show you care about their fitness journey.</Text>
        </View>

        <Text style={styles.sectionTitle}>Choose a friend</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.friendsRow}
        >
          {friends.map(renderFriend)}
        </ScrollView>

        <Text style={styles.sectionTitle}>Choose a gift</Text>
        {Object.entries(stickersByCategory).map(([category, categoryStickers]) => (
          <View key={category} style={styles.categorySection}>
            <Text style={styles.categoryTitle}>{categoryLabels[category] || category}</Text>
            <View style={styles.grid}>
              {categoryStickers.map(s => {
                const isPicked = selectedSticker === s.id;
                return (
                  <TouchableOpacity
                    key={s.id}
                    style={[styles.sticker, isPicked && styles.stickerPicked]}
                    onPress={() => setSelectedSticker(s.id)}
                    testID={`sticker-${s.id}`}
                  >
                    <Text style={styles.stickerEmoji}>{s.emoji}</Text>
                    <Text style={styles.stickerName}>{s.name}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        ))}

        <Text style={styles.sectionTitle}>Add a note</Text>
        <View style={styles.inputWrapper}>
          <TextInput
            value={message}
            onChangeText={setMessage}
            placeholder="Say something encouraging"
            placeholderTextColor={Colors.textMuted}
            style={styles.input}
            multiline
            maxLength={140}
            testID="gift-message-input"
          />
          <Text style={styles.counter}>{message.length}/140</Text>
        </View>

        <View style={{ height: Platform.OS === 'web' ? 24 : 64 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  title: { fontSize: 20, fontWeight: '700' as const, color: Colors.text },
  sendButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.primary,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 24,
  },
  sendButtonText: { color: Colors.white, fontWeight: '700' as const },
  scroll: { flex: 1 },
  scrollContent: { padding: 20 },
  headerSection: {
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: Colors.text,
    marginBottom: 8,
  },
  headerDesc: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  sectionTitle: { 
    color: Colors.textMuted, 
    fontSize: 13, 
    fontWeight: '600' as const,
    marginBottom: 12,
    marginTop: 8,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.5,
  },
  categorySection: {
    marginBottom: 20,
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.text,
    marginBottom: 12,
  },
  friendsRow: { gap: 12, paddingBottom: 6 },
  friendItem: {
    width: 110,
    padding: 12,
    borderRadius: 12,
    backgroundColor: Colors.cardBg,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    gap: 8,
  },
  friendItemSelected: { borderColor: Colors.primary },
  friendAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.surfaceLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  friendAvatarText: { fontSize: 24 },
  friendName: { fontSize: 12, fontWeight: '600' as const, color: Colors.text, textAlign: 'center' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  sticker: {
    width: '48%',
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 14,
    backgroundColor: Colors.surface,
    borderWidth: 2,
    borderColor: Colors.border,
    alignItems: 'center',
    gap: 8,
  },
  stickerPicked: { 
    borderColor: Colors.primary,
    backgroundColor: Colors.surfaceLight,
  },
  stickerEmoji: { fontSize: 32 },
  stickerName: { 
    fontSize: 13, 
    color: Colors.text,
    fontWeight: '600' as const,
    textAlign: 'center',
  },
  inputWrapper: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    padding: 12,
    gap: 6,
  },
  input: { color: Colors.text, minHeight: 80, textAlignVertical: 'top' as const },
  counter: { fontSize: 12, color: Colors.textMuted, alignSelf: 'flex-end' },
});
