import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSocial } from '@/contexts/SocialContext';
import Colors from '@/constants/colors';
import { trpc } from '@/lib/trpc';
import { User } from '@/types';

export default function FriendSearchScreen() {
  const insets = useSafeAreaInsets();
  const { friends, addFriend, removeFriend, user } = useSocial();
  const [query, setQuery] = useState('');
  const [submittedQuery, setSubmittedQuery] = useState('');

  const searchQuery = trpc.user.friends.search.useQuery(
    { query: submittedQuery, currentUserId: user.backendId || '' },
    { enabled: submittedQuery.length > 1 }
  );

  const onSearch = () => {
    setSubmittedQuery(query.trim());
  };

  // Debounce the search as user types
  useEffect(() => {
    const t = setTimeout(() => {
      if (query.trim().length > 1) {
        setSubmittedQuery(query.trim());
      }
    }, 300);
    return () => clearTimeout(t);
  }, [query]);

  const isFriend = (backendId: string) => friends.some((f: User) => (f as any).id === backendId);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <LinearGradient colors={[Colors.background, Colors.surface]} style={StyleSheet.absoluteFillObject} />
      <View style={styles.header}>
        <Text style={styles.title}>Find Friends</Text>
        <Text style={styles.subtitle}>Search by name or email</Text>
      </View>
      <View style={styles.searchRow}>
        <TextInput
          style={styles.input}
          placeholder="Search users..."
          placeholderTextColor={Colors.textMuted}
          value={query}
          onChangeText={setQuery}
          autoCapitalize="none"
          returnKeyType="search"
          onSubmitEditing={onSearch}
        />
        <TouchableOpacity style={[styles.searchBtn, query.trim().length === 0 && styles.searchBtnDisabled]} disabled={query.trim().length === 0} onPress={onSearch}>
          <Text style={styles.searchBtnText}>Search</Text>
        </TouchableOpacity>
      </View>
      <ScrollView style={styles.results} contentContainerStyle={styles.resultsContent}>
        {searchQuery.isLoading && (
          <View style={styles.loadingRow}><ActivityIndicator color={Colors.primary} /><Text style={styles.loadingText}>Searching...</Text></View>
        )}
        {!searchQuery.isLoading && submittedQuery.length > 1 && (searchQuery.data?.length === 0) && (
          <Text style={styles.emptyText}>No users found for "{submittedQuery}"</Text>
        )}
        {searchQuery.data?.map((u: any) => {
          const friend = isFriend(u.id);
          return (
            <View key={u.id} style={styles.userRow}>
              <View style={styles.avatar}>
                {u.avatar && (u.avatar.startsWith('http') || u.avatar.startsWith('data:')) ? (
                  <Text style={styles.avatarEmoji}>🖼️</Text>
                ) : (
                  <Text style={styles.avatarEmoji}>{u.avatar || '🙂'}</Text>
                )}
              </View>
              <View style={styles.userInfo}> 
                <Text style={styles.userName}>{u.name}</Text>
                <Text style={styles.userEmail}>{u.email}</Text>
              </View>
              {friend ? (
                <TouchableOpacity style={[styles.actionBtn, styles.removeBtn]} onPress={() => removeFriend(u.id)} testID={`remove-friend-${u.id}`}>
                  <Text style={styles.actionBtnText}>Remove</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity style={[styles.actionBtn, styles.addBtn]} onPress={() => addFriend(u.id)} testID={`add-friend-${u.id}`}>
                  <Text style={styles.actionBtnText}>Add</Text>
                </TouchableOpacity>
              )}
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 20, paddingVertical: 16 },
  title: { fontSize: 24, fontWeight: '700', color: Colors.text },
  subtitle: { fontSize: 13, color: Colors.textSecondary, marginTop: 4 },
  searchRow: { flexDirection: 'row', paddingHorizontal: 20, gap: 12 },
  input: { flex: 1, backgroundColor: Colors.cardBg, borderRadius: 14, paddingHorizontal: 16, paddingVertical: 14, borderWidth: 1, borderColor: Colors.border, color: Colors.text },
  searchBtn: { paddingHorizontal: 18, paddingVertical: 14, borderRadius: 14, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center' },
  searchBtnDisabled: { opacity: 0.4 },
  searchBtnText: { color: Colors.white, fontWeight: '600' },
  results: { flex: 1, marginTop: 16 },
  resultsContent: { padding: 20, gap: 16 },
  loadingRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  loadingText: { color: Colors.textSecondary },
  emptyText: { color: Colors.textSecondary, fontStyle: 'italic' },
  userRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.cardBg, borderWidth: 1, borderColor: Colors.border, padding: 14, borderRadius: 16, gap: 14 },
  avatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: Colors.surfaceLight, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: Colors.primary },
  avatarEmoji: { fontSize: 24 },
  userInfo: { flex: 1 },
  userName: { fontSize: 16, fontWeight: '600', color: Colors.text },
  userEmail: { fontSize: 12, color: Colors.textSecondary },
  actionBtn: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 10 },
  addBtn: { backgroundColor: Colors.green + '30', borderWidth: 1, borderColor: Colors.green },
  removeBtn: { backgroundColor: Colors.error + '20', borderWidth: 1, borderColor: Colors.error },
  actionBtnText: { fontSize: 13, fontWeight: '600', color: Colors.text },
});
