import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import {
  MessageCircle,
  Users,
  Trophy,
  TrendingUp,
  Send,
  Plus,
  X,
  Target,
  Award,
  ChevronRight,
} from 'lucide-react-native';
import Colors from '@/constants/colors';
import { useGroups } from '@/contexts/GroupsContext';
import { useFitness } from '@/contexts/FitnessContext';
import { mockUsers } from '@/mocks/data';

type Tab = 'chat' | 'members' | 'challenges' | 'stats';

export default function GroupDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const {
    groups,
    getGroupMessages,
    sendMessage,
    createChallenge,
    getGroupChallenges,
    addGroupMembers,
    removeGroupMember,
    deleteGroup,
  } = useGroups();
  const { user, activities } = useFitness();

  const group = groups.find(g => g.id === id);
  const [activeTab, setActiveTab] = useState<Tab>('chat');
  const [messageText, setMessageText] = useState('');
  const [showChallengeModal, setShowChallengeModal] = useState(false);
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    if (activeTab === 'chat') {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: false });
      }, 100);
    }
  }, [activeTab]);

  if (!group) {
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ title: 'Group Not Found' }} />
        <Text style={styles.errorText}>Group not found</Text>
      </View>
    );
  }

  const messages = getGroupMessages(group.id);
  const challenges = getGroupChallenges(group.id);
  const members = mockUsers.filter(u => group.members.includes(u.id));
  const isAdmin = group.admin === user.id;
  const availableFriends = mockUsers.filter(
    u => user.friends.includes(u.id) && !group.members.includes(u.id)
  );

  const handleSendMessage = () => {
    if (!messageText.trim()) return;
    sendMessage(messageText, undefined, group.id);
    setMessageText('');
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const getMemberStats = (userId: string) => {
    const memberActivities = activities.filter(a => a.userId === userId);
    const totalSteps = memberActivities.reduce((sum, a) => sum + (a.steps || 0), 0);
    const totalCalories = memberActivities.reduce((sum, a) => sum + a.calories, 0);
    const totalDistance = memberActivities.reduce((sum, a) => sum + (a.distance || 0), 0);
    return { totalSteps, totalCalories, totalDistance };
  };

  const renderChat = () => (
    <KeyboardAvoidingView
      style={styles.chatContainer}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={100}
    >
      <ScrollView
        ref={scrollViewRef}
        style={styles.messagesContainer}
        contentContainerStyle={styles.messagesContent}
        onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
      >
        {messages.length === 0 ? (
          <View style={styles.emptyState}>
            <MessageCircle size={48} color={Colors.textMuted} />
            <Text style={styles.emptyText}>No messages yet</Text>
            <Text style={styles.emptySubtext}>Start the conversation!</Text>
          </View>
        ) : (
          messages.map(msg => {
            const isOwn = msg.senderId === user.id;
            return (
              <View
                key={msg.id}
                style={[styles.messageBubble, isOwn ? styles.ownMessage : styles.otherMessage]}
              >
                {!isOwn && (
                  <View style={styles.messageHeader}>
                    <Text style={styles.senderAvatar}>{msg.senderAvatar}</Text>
                    <Text style={styles.senderName}>{msg.senderName}</Text>
                  </View>
                )}
                <Text style={[styles.messageText, isOwn && styles.ownMessageText]}>
                  {msg.text}
                </Text>
                <Text style={[styles.messageTime, isOwn && styles.ownMessageTime]}>
                  {new Date(msg.timestamp).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </Text>
              </View>
            );
          })
        )}
      </ScrollView>

      <View style={styles.messageInputContainer}>
        <TextInput
          style={styles.messageInput}
          placeholder="Type a message..."
          placeholderTextColor={Colors.textMuted}
          value={messageText}
          onChangeText={setMessageText}
          multiline
          maxLength={500}
        />
        <TouchableOpacity
          style={[styles.sendButton, !messageText.trim() && styles.sendButtonDisabled]}
          onPress={handleSendMessage}
          disabled={!messageText.trim()}
        >
          <Send size={20} color={Colors.white} />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );

  const renderMembers = () => (
    <ScrollView style={styles.tabContent}>
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Members ({members.length})</Text>
          {isAdmin && availableFriends.length > 0 && (
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => setShowAddMemberModal(true)}
            >
              <Plus size={18} color={Colors.primary} />
              <Text style={styles.addButtonText}>Add</Text>
            </TouchableOpacity>
          )}
        </View>

        {members.map(member => {
          const stats = getMemberStats(member.id);
          const isMemberAdmin = member.id === group.admin;

          return (
            <View key={member.id} style={styles.memberCard}>
              <View style={styles.memberHeader}>
                <Text style={styles.memberAvatar}>{member.avatar}</Text>
                <View style={styles.memberInfo}>
                  <View style={styles.memberNameRow}>
                    <Text style={styles.memberName}>{member.name}</Text>
                    {isMemberAdmin && <Text style={styles.adminBadge}>Admin</Text>}
                  </View>
                  <View style={styles.memberStats}>
                    <Text style={styles.memberStatText}>
                      {stats.totalSteps.toLocaleString()} steps
                    </Text>
                    <Text style={styles.memberStatSeparator}>•</Text>
                    <Text style={styles.memberStatText}>
                      {stats.totalCalories.toLocaleString()} cal
                    </Text>
                  </View>
                </View>
                {isAdmin && !isMemberAdmin && (
                  <TouchableOpacity
                    style={styles.removeButton}
                    onPress={() => {
                      removeGroupMember(group.id, member.id);
                    }}
                  >
                    <X size={18} color={Colors.error} />
                  </TouchableOpacity>
                )}
              </View>
            </View>
          );
        })}
      </View>
    </ScrollView>
  );

  const renderChallenges = () => (
    <ScrollView style={styles.tabContent}>
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Active Challenges</Text>
          {isAdmin && (
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => setShowChallengeModal(true)}
            >
              <Plus size={18} color={Colors.primary} />
              <Text style={styles.addButtonText}>Create</Text>
            </TouchableOpacity>
          )}
        </View>

        {challenges.length === 0 ? (
          <View style={styles.emptyState}>
            <Trophy size={48} color={Colors.textMuted} />
            <Text style={styles.emptyText}>No challenges yet</Text>
            <Text style={styles.emptySubtext}>Create a challenge to compete!</Text>
          </View>
        ) : (
          challenges.map(challenge => {
            const daysLeft = Math.ceil(
              (new Date(challenge.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
            );
            const isActive = daysLeft > 0;

            return (
              <View key={challenge.id} style={styles.challengeCard}>
                <View style={styles.challengeHeader}>
                  <Text style={styles.challengeName}>{challenge.name}</Text>
                  <Text style={[styles.challengeStatus, !isActive && styles.challengeExpired]}>
                    {isActive ? `${daysLeft}d left` : 'Ended'}
                  </Text>
                </View>

                <View style={styles.challengeGoal}>
                  <Target size={16} color={Colors.primary} />
                  <Text style={styles.challengeGoalText}>
                    Goal: {challenge.goal.toLocaleString()}{' '}
                    {challenge.type === 'steps'
                      ? 'steps'
                      : challenge.type === 'calories'
                      ? 'calories'
                      : challenge.type === 'distance'
                      ? 'miles'
                      : 'days'}
                  </Text>
                </View>

                <View style={styles.leaderboard}>
                  <Text style={styles.leaderboardTitle}>Leaderboard</Text>
                  {challenge.leaderboard.slice(0, 5).map((entry, index) => {
                    const member = mockUsers.find(u => u.id === entry.userId);
                    if (!member) return null;

                    const progress = (entry.progress / challenge.goal) * 100;

                    return (
                      <View key={entry.userId} style={styles.leaderboardEntry}>
                        <View style={styles.leaderboardRank}>
                          <Text style={styles.rankNumber}>#{index + 1}</Text>
                        </View>
                        <Text style={styles.leaderboardAvatar}>{member.avatar}</Text>
                        <View style={styles.leaderboardInfo}>
                          <Text style={styles.leaderboardName}>{member.name}</Text>
                          <View style={styles.progressBar}>
                            <View
                              style={[
                                styles.progressFill,
                                { width: `${Math.min(progress, 100)}%` },
                              ]}
                            />
                          </View>
                        </View>
                        <Text style={styles.leaderboardProgress}>
                          {entry.progress.toLocaleString()}
                        </Text>
                      </View>
                    );
                  })}
                </View>
              </View>
            );
          })
        )}
      </View>
    </ScrollView>
  );

  const renderStats = () => (
    <ScrollView style={styles.tabContent}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Group Statistics</Text>

        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <View style={styles.statIcon}>
              <Target size={24} color={Colors.primary} />
            </View>
            <Text style={styles.statValue}>{group.totalSteps.toLocaleString()}</Text>
            <Text style={styles.statLabel}>Total Steps</Text>
          </View>

          <View style={styles.statCard}>
            <View style={styles.statIcon}>
              <TrendingUp size={24} color={Colors.secondary} />
            </View>
            <Text style={styles.statValue}>{group.totalCalories.toLocaleString()}</Text>
            <Text style={styles.statLabel}>Total Calories</Text>
          </View>

          <View style={styles.statCard}>
            <View style={styles.statIcon}>
              <Award size={24} color={Colors.accent} />
            </View>
            <Text style={styles.statValue}>{group.totalDistance.toFixed(1)}</Text>
            <Text style={styles.statLabel}>Total Miles</Text>
          </View>

          <View style={styles.statCard}>
            <View style={styles.statIcon}>
              <Users size={24} color={Colors.primary} />
            </View>
            <Text style={styles.statValue}>{group.members.length}</Text>
            <Text style={styles.statLabel}>Members</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Member Rankings</Text>
        <View style={styles.rankingsList}>
          {members
            .map(member => ({
              member,
              stats: getMemberStats(member.id),
            }))
            .sort((a, b) => b.stats.totalSteps - a.stats.totalSteps)
            .map((item, index) => (
              <View key={item.member.id} style={styles.rankingCard}>
                <View style={styles.rankingPosition}>
                  <Text style={styles.rankingNumber}>#{index + 1}</Text>
                </View>
                <Text style={styles.rankingAvatar}>{item.member.avatar}</Text>
                <View style={styles.rankingInfo}>
                  <Text style={styles.rankingName}>{item.member.name}</Text>
                  <Text style={styles.rankingStats}>
                    {item.stats.totalSteps.toLocaleString()} steps •{' '}
                    {item.stats.totalCalories.toLocaleString()} cal
                  </Text>
                </View>
                <ChevronRight size={20} color={Colors.textMuted} />
              </View>
            ))}
        </View>
      </View>

      {isAdmin && (
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => {
            deleteGroup(group.id);
            router.back();
          }}
        >
          <Text style={styles.deleteButtonText}>Delete Group</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: group.name,
          headerStyle: { backgroundColor: Colors.surface },
          headerTintColor: Colors.text,
        }}
      />

      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'chat' && styles.activeTab]}
          onPress={() => setActiveTab('chat')}
        >
          <MessageCircle size={20} color={activeTab === 'chat' ? Colors.primary : Colors.textMuted} />
          <Text style={[styles.tabText, activeTab === 'chat' && styles.activeTabText]}>Chat</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'members' && styles.activeTab]}
          onPress={() => setActiveTab('members')}
        >
          <Users size={20} color={activeTab === 'members' ? Colors.primary : Colors.textMuted} />
          <Text style={[styles.tabText, activeTab === 'members' && styles.activeTabText]}>
            Members
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'challenges' && styles.activeTab]}
          onPress={() => setActiveTab('challenges')}
        >
          <Trophy size={20} color={activeTab === 'challenges' ? Colors.primary : Colors.textMuted} />
          <Text style={[styles.tabText, activeTab === 'challenges' && styles.activeTabText]}>
            Challenges
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'stats' && styles.activeTab]}
          onPress={() => setActiveTab('stats')}
        >
          <TrendingUp size={20} color={activeTab === 'stats' ? Colors.primary : Colors.textMuted} />
          <Text style={[styles.tabText, activeTab === 'stats' && styles.activeTabText]}>Stats</Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'chat' && renderChat()}
      {activeTab === 'members' && renderMembers()}
      {activeTab === 'challenges' && renderChallenges()}
      {activeTab === 'stats' && renderStats()}

      <ChallengeModal
        visible={showChallengeModal}
        onClose={() => setShowChallengeModal(false)}
        onSubmit={(name, type, goal, endDate) => {
          createChallenge(group.id, name, type, goal, endDate);
          setShowChallengeModal(false);
        }}
      />

      <AddMemberModal
        visible={showAddMemberModal}
        onClose={() => setShowAddMemberModal(false)}
        friends={availableFriends}
        onSubmit={(memberIds) => {
          addGroupMembers(group.id, memberIds);
          setShowAddMemberModal(false);
        }}
      />
    </View>
  );
}

function ChallengeModal({
  visible,
  onClose,
  onSubmit,
}: {
  visible: boolean;
  onClose: () => void;
  onSubmit: (name: string, type: any, goal: number, endDate: string) => void;
}) {
  const [name, setName] = useState('');
  const [type, setType] = useState<'steps' | 'calories' | 'distance' | 'active_days'>('steps');
  const [goal, setGoal] = useState('');
  const [days, setDays] = useState('7');

  const handleSubmit = () => {
    if (!name.trim() || !goal) return;

    const endDate = new Date();
    endDate.setDate(endDate.getDate() + parseInt(days));

    onSubmit(name, type, parseInt(goal), endDate.toISOString());
    setName('');
    setGoal('');
    setDays('7');
  };

  const challengeTypes = [
    { value: 'steps', label: 'Steps', icon: '🚶' },
    { value: 'calories', label: 'Calories', icon: '🔥' },
    { value: 'distance', label: 'Distance', icon: '📏' },
    { value: 'active_days', label: 'Active Days', icon: '📅' },
  ];

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Create Challenge</Text>
            <TouchableOpacity onPress={onClose}>
              <X size={24} color={Colors.text} />
            </TouchableOpacity>
          </View>

          <TextInput
            style={styles.input}
            placeholder="Challenge Name"
            placeholderTextColor={Colors.textMuted}
            value={name}
            onChangeText={setName}
          />

          <Text style={styles.inputLabel}>Challenge Type</Text>
          <View style={styles.typeGrid}>
            {challengeTypes.map(ct => (
              <TouchableOpacity
                key={ct.value}
                style={[styles.typeButton, type === ct.value && styles.typeButtonActive]}
                onPress={() => setType(ct.value as any)}
              >
                <Text style={styles.typeIcon}>{ct.icon}</Text>
                <Text
                  style={[styles.typeLabel, type === ct.value && styles.typeLabelActive]}
                >
                  {ct.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <TextInput
            style={styles.input}
            placeholder="Goal Amount"
            placeholderTextColor={Colors.textMuted}
            value={goal}
            onChangeText={setGoal}
            keyboardType="numeric"
          />

          <TextInput
            style={styles.input}
            placeholder="Duration (days)"
            placeholderTextColor={Colors.textMuted}
            value={days}
            onChangeText={setDays}
            keyboardType="numeric"
          />

          <View style={styles.modalActions}>
            <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.submitButton, (!name.trim() || !goal) && styles.submitButtonDisabled]}
              onPress={handleSubmit}
              disabled={!name.trim() || !goal}
            >
              <Text style={styles.submitButtonText}>Create</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

function AddMemberModal({
  visible,
  onClose,
  friends,
  onSubmit,
}: {
  visible: boolean;
  onClose: () => void;
  friends: any[];
  onSubmit: (memberIds: string[]) => void;
}) {
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);

  const toggleMember = (userId: string) => {
    if (selectedMembers.includes(userId)) {
      setSelectedMembers(selectedMembers.filter(id => id !== userId));
    } else {
      setSelectedMembers([...selectedMembers, userId]);
    }
  };

  const handleSubmit = () => {
    if (selectedMembers.length === 0) return;
    onSubmit(selectedMembers);
    setSelectedMembers([]);
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Add Members</Text>
            <TouchableOpacity onPress={onClose}>
              <X size={24} color={Colors.text} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.friendsList}>
            {friends.map(friend => (
              <TouchableOpacity
                key={friend.id}
                style={styles.friendItem}
                onPress={() => toggleMember(friend.id)}
              >
                <View style={styles.friendInfo}>
                  <Text style={styles.friendAvatar}>{friend.avatar}</Text>
                  <Text style={styles.friendName}>{friend.name}</Text>
                </View>
                <View
                  style={[
                    styles.checkbox,
                    selectedMembers.includes(friend.id) && styles.checkboxSelected,
                  ]}
                >
                  {selectedMembers.includes(friend.id) && (
                    <Text style={styles.checkmark}>✓</Text>
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <View style={styles.modalActions}>
            <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.submitButton,
                selectedMembers.length === 0 && styles.submitButtonDisabled,
              ]}
              onPress={handleSubmit}
              disabled={selectedMembers.length === 0}
            >
              <Text style={styles.submitButtonText}>Add {selectedMembers.length > 0 ? `(${selectedMembers.length})` : ''}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  errorText: {
    fontSize: 16,
    color: Colors.textMuted,
    textAlign: 'center',
    marginTop: 40,
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 6,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: Colors.primary,
  },
  tabText: {
    fontSize: 14,
    color: Colors.textMuted,
    fontWeight: '500' as const,
  },
  activeTabText: {
    color: Colors.primary,
    fontWeight: '600' as const,
  },
  tabContent: {
    flex: 1,
  },
  chatContainer: {
    flex: 1,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: 16,
    gap: 12,
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 16,
    marginVertical: 4,
  },
  ownMessage: {
    alignSelf: 'flex-end',
    backgroundColor: Colors.primary,
  },
  otherMessage: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  messageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    gap: 6,
  },
  senderAvatar: {
    fontSize: 16,
  },
  senderName: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  messageText: {
    fontSize: 15,
    color: Colors.text,
    lineHeight: 20,
  },
  ownMessageText: {
    color: Colors.white,
  },
  messageTime: {
    fontSize: 10,
    color: Colors.textMuted,
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  ownMessageTime: {
    color: Colors.white + 'AA',
  },
  messageInputContainer: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    gap: 8,
    alignItems: 'flex-end',
  },
  messageInput: {
    flex: 1,
    backgroundColor: Colors.background,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 15,
    color: Colors.text,
    maxHeight: 100,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: Colors.textMuted,
  },
  section: {
    padding: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: Colors.text,
    marginBottom: 16,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: Colors.primary + '20',
    borderRadius: 16,
  },
  addButtonText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.primary,
  },
  memberCard: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  memberHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  memberAvatar: {
    fontSize: 32,
    marginRight: 12,
  },
  memberInfo: {
    flex: 1,
  },
  memberNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  memberName: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  adminBadge: {
    fontSize: 10,
    fontWeight: '700' as const,
    color: Colors.white,
    backgroundColor: Colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  memberStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  memberStatText: {
    fontSize: 13,
    color: Colors.textMuted,
  },
  memberStatSeparator: {
    fontSize: 13,
    color: Colors.textMuted,
  },
  removeButton: {
    padding: 8,
  },
  challengeCard: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  challengeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  challengeName: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.text,
    flex: 1,
  },
  challengeStatus: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: Colors.primary,
    backgroundColor: Colors.primary + '20',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  challengeExpired: {
    color: Colors.textMuted,
    backgroundColor: Colors.textMuted + '20',
  },
  challengeGoal: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  challengeGoalText: {
    fontSize: 14,
    color: Colors.textMuted,
  },
  leaderboard: {
    marginTop: 8,
  },
  leaderboardTitle: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.text,
    marginBottom: 12,
  },
  leaderboardEntry: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  leaderboardRank: {
    width: 32,
  },
  rankNumber: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: Colors.textMuted,
  },
  leaderboardAvatar: {
    fontSize: 24,
    marginRight: 12,
  },
  leaderboardInfo: {
    flex: 1,
  },
  leaderboardName: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.text,
    marginBottom: 4,
  },
  progressBar: {
    height: 6,
    backgroundColor: Colors.background,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 3,
  },
  leaderboardProgress: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: Colors.primary,
    marginLeft: 8,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.primary + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: Colors.text,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.textMuted,
    textAlign: 'center',
  },
  rankingsList: {
    gap: 12,
  },
  rankingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  rankingPosition: {
    width: 36,
  },
  rankingNumber: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.primary,
  },
  rankingAvatar: {
    fontSize: 28,
    marginRight: 12,
  },
  rankingInfo: {
    flex: 1,
  },
  rankingName: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: Colors.text,
    marginBottom: 2,
  },
  rankingStats: {
    fontSize: 12,
    color: Colors.textMuted,
  },
  deleteButton: {
    margin: 16,
    padding: 16,
    backgroundColor: Colors.error + '20',
    borderRadius: 12,
    alignItems: 'center',
  },
  deleteButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.error,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 32,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: Colors.text,
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: Colors.textMuted,
    marginTop: 8,
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
    padding: 24,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  input: {
    backgroundColor: Colors.background,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: Colors.text,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.text,
    marginBottom: 12,
  },
  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16,
  },
  typeButton: {
    flex: 1,
    minWidth: '45%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 16,
    backgroundColor: Colors.background,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.border,
  },
  typeButtonActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary + '10',
  },
  typeIcon: {
    fontSize: 24,
  },
  typeLabel: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.textMuted,
  },
  typeLabelActive: {
    color: Colors.primary,
  },
  friendsList: {
    maxHeight: 300,
    marginBottom: 24,
  },
  friendItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  friendInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  friendAvatar: {
    fontSize: 24,
  },
  friendName: {
    fontSize: 16,
    color: Colors.text,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  checkmark: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '700' as const,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    backgroundColor: Colors.background,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  submitButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    backgroundColor: Colors.primary,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: Colors.textMuted,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.white,
  },
});
