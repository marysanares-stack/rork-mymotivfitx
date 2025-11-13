import createContextHook from '@nkzw/create-context-hook';
import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Group, Message, GroupChallenge, Conversation } from '@/types';
import { useFitness } from './FitnessContext';
import { mockUsers } from '@/mocks/data';

const STORAGE_KEYS = {
  GROUPS: '@fitness_groups',
  MESSAGES: '@fitness_messages',
  CHALLENGES: '@fitness_challenges',
};

function generateId() {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

const GROUP_AVATARS = ['🏆', '💪', '🔥', '⚡', '🌟', '🎯', '🚀', '👥', '🏃', '🏅'];

export const [GroupsProvider, useGroups] = createContextHook(() => {
  const [groups, setGroups] = useState<Group[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [challenges, setChallenges] = useState<GroupChallenge[]>([]);
  const { user, activities } = useFitness();

  const loadData = useCallback(async () => {
    try {
      const [groupsData, messagesData, challengesData] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.GROUPS),
        AsyncStorage.getItem(STORAGE_KEYS.MESSAGES),
        AsyncStorage.getItem(STORAGE_KEYS.CHALLENGES),
      ]);

      if (groupsData) setGroups(JSON.parse(groupsData));
      if (messagesData) setMessages(JSON.parse(messagesData));
      if (challengesData) setChallenges(JSON.parse(challengesData));
    } catch (error) {
      console.error('Error loading groups data:', error);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    setGroups(prevGroups => {
      const updated = prevGroups.map(group => {
        const memberActivities = activities.filter(a => group.members.includes(a.userId));
        
        const totalSteps = memberActivities.reduce((sum, a) => sum + (a.steps || 0), 0);
        const totalCalories = memberActivities.reduce((sum, a) => sum + a.calories, 0);
        const totalDistance = memberActivities.reduce((sum, a) => sum + (a.distance || 0), 0);

        return {
          ...group,
          totalSteps,
          totalCalories,
          totalDistance,
        };
      });
      
      AsyncStorage.setItem(STORAGE_KEYS.GROUPS, JSON.stringify(updated));
      return updated;
    });
  }, [activities.length]);

  const createGroup = useCallback((name: string, description?: string, memberIds?: string[]) => {
    const newGroup: Group = {
      id: generateId(),
      name,
      description,
      members: [user.id, ...(memberIds || [])],
      admin: user.id,
      createdAt: new Date().toISOString(),
      avatar: GROUP_AVATARS[Math.floor(Math.random() * GROUP_AVATARS.length)],
      totalSteps: 0,
      totalCalories: 0,
      totalDistance: 0,
    };
    
    const updated = [...groups, newGroup];
    setGroups(updated);
    AsyncStorage.setItem(STORAGE_KEYS.GROUPS, JSON.stringify(updated));
    return newGroup;
  }, [groups, user.id]);

  const addGroupMembers = useCallback((groupId: string, memberIds: string[]) => {
    setGroups(prev => {
      const updated = prev.map(g => 
        g.id === groupId
          ? { ...g, members: [...new Set([...g.members, ...memberIds])] }
          : g
      );
      AsyncStorage.setItem(STORAGE_KEYS.GROUPS, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const removeGroupMember = useCallback((groupId: string, memberId: string) => {
    setGroups(prev => {
      const updated = prev.map(g => 
        g.id === groupId
          ? { ...g, members: g.members.filter(id => id !== memberId) }
          : g
      );
      AsyncStorage.setItem(STORAGE_KEYS.GROUPS, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const deleteGroup = useCallback((groupId: string) => {
    const updated = groups.filter(g => g.id !== groupId);
    setGroups(updated);
    AsyncStorage.setItem(STORAGE_KEYS.GROUPS, JSON.stringify(updated));
  }, [groups]);

  const sendMessage = useCallback((text: string, receiverId?: string, groupId?: string) => {
    const newMessage: Message = {
      id: generateId(),
      senderId: user.id,
      senderName: user.name,
      senderAvatar: user.avatar,
      receiverId,
      groupId,
      text,
      timestamp: new Date().toISOString(),
      read: false,
    };
    
    const updated = [...messages, newMessage];
    setMessages(updated);
    AsyncStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(updated));
  }, [messages, user.id, user.name, user.avatar]);

  const markMessagesAsRead = useCallback((conversationId: string) => {
    setMessages(prev => {
      const updated = prev.map(m => {
        if (m.groupId === conversationId || m.senderId === conversationId) {
          return { ...m, read: true };
        }
        return m;
      });
      AsyncStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const getConversations = useCallback((): Conversation[] => {
    const conversations: Conversation[] = [];

    groups.forEach(group => {
      const groupMessages = messages.filter(m => m.groupId === group.id);
      const lastMessage = groupMessages.sort((a, b) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      )[0];
      const unreadCount = groupMessages.filter(m => !m.read && m.senderId !== user.id).length;

      conversations.push({
        id: group.id,
        type: 'group',
        participants: group.members,
        lastMessage,
        unreadCount,
        name: group.name,
        avatar: group.avatar,
      });
    });

    const directMessageUsers = new Set<string>();
    messages.forEach(m => {
      if (m.senderId === user.id && m.receiverId) directMessageUsers.add(m.receiverId);
      if (m.receiverId === user.id && m.senderId) directMessageUsers.add(m.senderId);
    });

    directMessageUsers.forEach(userId => {
      const directMessages = messages.filter(m => 
        (m.senderId === user.id && m.receiverId === userId) ||
        (m.senderId === userId && m.receiverId === user.id)
      );
      const lastMessage = directMessages.sort((a, b) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      )[0];
      const unreadCount = directMessages.filter(m => !m.read && m.senderId !== user.id).length;
      const otherUser = mockUsers.find(u => u.id === userId);

      if (otherUser) {
        conversations.push({
          id: userId,
          type: 'direct',
          participants: [user.id, userId],
          lastMessage,
          unreadCount,
          name: otherUser.name,
          avatar: otherUser.avatar,
        });
      }
    });

    return conversations.sort((a, b) => {
      const aTime = a.lastMessage ? new Date(a.lastMessage.timestamp).getTime() : 0;
      const bTime = b.lastMessage ? new Date(b.lastMessage.timestamp).getTime() : 0;
      return bTime - aTime;
    });
  }, [groups, messages, user.id]);

  const getGroupMessages = useCallback((groupId: string): Message[] => {
    return messages
      .filter(m => m.groupId === groupId)
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  }, [messages]);

  const getDirectMessages = useCallback((userId: string): Message[] => {
    return messages
      .filter(m => 
        (m.senderId === user.id && m.receiverId === userId) ||
        (m.senderId === userId && m.receiverId === user.id)
      )
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  }, [messages, user.id]);

  const createChallenge = useCallback((
    groupId: string,
    name: string,
    type: 'steps' | 'calories' | 'distance' | 'active_days',
    goal: number,
    endDate: string
  ) => {
    const group = groups.find(g => g.id === groupId);
    if (!group) return;

    const newChallenge: GroupChallenge = {
      id: generateId(),
      groupId,
      name,
      type,
      goal,
      startDate: new Date().toISOString(),
      endDate,
      participants: group.members,
      leaderboard: group.members.map(memberId => ({ userId: memberId, progress: 0 })),
    };

    const updated = [...challenges, newChallenge];
    setChallenges(updated);
    AsyncStorage.setItem(STORAGE_KEYS.CHALLENGES, JSON.stringify(updated));
  }, [groups, challenges]);

  useEffect(() => {
    setChallenges(prev => {
      const updated = prev.map(challenge => {
        const leaderboard = challenge.participants.map(userId => {
          const userActivities = activities.filter(a => {
            const activityDate = new Date(a.date);
            const startDate = new Date(challenge.startDate);
            const endDate = new Date(challenge.endDate);
            return a.userId === userId && activityDate >= startDate && activityDate <= endDate;
          });

          let progress = 0;
          switch (challenge.type) {
            case 'steps':
              progress = userActivities.reduce((sum, a) => sum + (a.steps || 0), 0);
              break;
            case 'calories':
              progress = userActivities.reduce((sum, a) => sum + a.calories, 0);
              break;
            case 'distance':
              progress = userActivities.reduce((sum, a) => sum + (a.distance || 0), 0);
              break;
            case 'active_days':
              progress = new Set(userActivities.map(a => a.date.split('T')[0])).size;
              break;
          }

          return { userId, progress };
        }).sort((a, b) => b.progress - a.progress);

        return { ...challenge, leaderboard };
      });

      AsyncStorage.setItem(STORAGE_KEYS.CHALLENGES, JSON.stringify(updated));
      return updated;
    });
  }, [activities.length]);

  const getGroupChallenges = useCallback((groupId: string): GroupChallenge[] => {
    return challenges.filter(c => c.groupId === groupId);
  }, [challenges]);

  return {
    groups,
    messages,
    challenges,
    createGroup,
    addGroupMembers,
    removeGroupMember,
    deleteGroup,
    sendMessage,
    markMessagesAsRead,
    getConversations,
    getGroupMessages,
    getDirectMessages,
    createChallenge,
    getGroupChallenges,
  };
});
