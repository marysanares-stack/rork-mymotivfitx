import createContextHook from '@nkzw/create-context-hook';
import { useState, useEffect, useCallback, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, SocialPost, Activity, Sticker, Gift, Challenge, ChallengeProgress, LeaderboardEntry, LeaderboardPeriod, LeaderboardMetric } from '@/types';
import { useFitness } from './FitnessContext';
import { mockUsers } from '@/mocks/data';

function generateId() {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

const STICKER_CATALOG: Sticker[] = [
  { id: 'sticker-1', emoji: '🔥', name: 'Streak Master', category: 'achievement' },
  { id: 'sticker-2', emoji: '💎', name: 'Consistency King', category: 'achievement' },
  { id: 'sticker-3', emoji: '⚡', name: 'Beast Mode', category: 'motivational' },
  { id: 'sticker-4', emoji: '🎯', name: 'Goal Crusher', category: 'achievement' },
  { id: 'sticker-5', emoji: '🏋️', name: 'Iron Will', category: 'strength' },
  { id: 'sticker-6', emoji: '🚀', name: 'Next Level', category: 'motivational' },
  { id: 'sticker-7', emoji: '💪', name: 'Warrior Spirit', category: 'strength' },
  { id: 'sticker-8', emoji: '🌟', name: 'Inspiration', category: 'motivational' },
  { id: 'sticker-9', emoji: '🔰', name: 'First Step', category: 'support' },
  { id: 'sticker-10', emoji: '🙌', name: 'Proud of You', category: 'support' },
  { id: 'sticker-11', emoji: '⭐', name: 'All Star', category: 'achievement' },
  { id: 'sticker-12', emoji: '💯', name: 'Perfect Form', category: 'achievement' },
  { id: 'sticker-13', emoji: '🎉', name: 'Milestone!', category: 'celebration' },
  { id: 'sticker-14', emoji: '👊', name: 'Keep Fighting', category: 'motivational' },
  { id: 'sticker-15', emoji: '🌅', name: 'Early Bird', category: 'achievement' },
  { id: 'sticker-16', emoji: '🧘', name: 'Mind & Body', category: 'wellness' },
  { id: 'sticker-17', emoji: '🏃', name: 'On The Move', category: 'cardio' },
  { id: 'sticker-18', emoji: '🥊', name: 'Fighting Spirit', category: 'strength' },
  { id: 'sticker-19', emoji: '🎖️', name: 'Dedication', category: 'achievement' },
  { id: 'sticker-20', emoji: '💫', name: 'Unstoppable', category: 'motivational' },
  { id: 'sticker-21', emoji: '🌈', name: 'Better Days', category: 'support' },
  { id: 'sticker-22', emoji: '🦾', name: 'Getting Stronger', category: 'strength' },
  { id: 'sticker-23', emoji: '🧠', name: 'Mental Toughness', category: 'wellness' },
  { id: 'sticker-24', emoji: '❤️‍🔥', name: 'Passion', category: 'motivational' },
];

const STORAGE_KEYS = {
  CHALLENGES: '@social_challenges',
  CHALLENGE_PROGRESS: '@social_challenge_progress',
};

export const [SocialProvider, useSocial] = createContextHook(() => {
  const [friends, setFriends] = useState<User[]>([]);
  const [socialPosts, setSocialPosts] = useState<SocialPost[]>([]);
  const [stickers] = useState<Sticker[]>(STICKER_CATALOG);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [challengeProgress, setChallengeProgress] = useState<ChallengeProgress[]>([]);
  const fitness = useFitness();
  const { earnedBadges, recentActivities, user, activities, dailyStats } = fitness;

  const generateSocialPosts = useCallback(() => {
    const posts: SocialPost[] = [];

    recentActivities.slice(0, 3).forEach(activity => {
      const activityUser = mockUsers.find(u => u.id === activity.userId) || user;
      posts.push({
        id: `post-${activity.id}`,
        userId: activityUser.id,
        userName: activityUser.name,
        userAvatar: activityUser.avatar,
        type: 'activity',
        activity,
        timestamp: activity.date,
        likes: [],
        comments: [],
      });
    });

    earnedBadges.slice(0, 2).forEach(badge => {
      posts.push({
        id: `post-badge-${badge.id}`,
        userId: user.id,
        userName: user.name,
        userAvatar: user.avatar,
        type: 'badge',
        badge,
        timestamp: badge.earnedDate || new Date().toISOString(),
        likes: [],
        comments: [],
      });
    });

    const friendActivities: Activity[] = [
      {
        id: 'friend-activity-1',
        userId: 'user-2',
        type: 'running',
        name: 'Morning Run',
        duration: 35,
        calories: 320,
        distance: 5.2,
        steps: 6500,
        date: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'friend-activity-2',
        userId: 'user-3',
        type: 'strength_training',
        name: 'Upper Body Workout',
        duration: 45,
        calories: 280,
        date: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'friend-activity-3',
        userId: 'user-4',
        type: 'yoga',
        name: 'Evening Yoga',
        duration: 30,
        calories: 120,
        date: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
      },
    ];

    friendActivities.forEach(activity => {
      const friendUser = mockUsers.find(u => u.id === activity.userId);
      if (friendUser) {
        posts.push({
          id: `post-${activity.id}`,
          userId: friendUser.id,
          userName: friendUser.name,
          userAvatar: friendUser.avatar,
          type: 'activity',
          activity,
          timestamp: activity.date,
          likes: [],
          comments: [],
        });
      }
    });

    const sorted = posts.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
    setSocialPosts(sorted);
  }, [earnedBadges, recentActivities, user]);

  useEffect(() => {
    if (!user || !user.friends) return;
    const userFriends = mockUsers.filter(u => user.friends.includes(u.id));
    setFriends(userFriends);
  }, [user]);

  useEffect(() => {
    if (!fitness.isLoading && earnedBadges && recentActivities) {
      generateSocialPosts();
    }
  }, [fitness.isLoading, earnedBadges, recentActivities, generateSocialPosts]);

  const likePost = useCallback((postId: string) => {
    setSocialPosts(prev => prev.map(post => 
      post.id === postId
        ? { ...post, likes: [...post.likes, user.id] }
        : post
    ));
  }, [user.id]);

  const addComment = useCallback((postId: string, text: string) => {
    setSocialPosts(prev => prev.map(post => 
      post.id === postId
        ? {
            ...post,
            comments: [
              ...post.comments,
              {
                id: generateId(),
                userId: user.id,
                userName: user.name,
                userAvatar: user.avatar,
                text,
                timestamp: new Date().toISOString(),
              },
            ],
          }
        : post
    ));
  }, [user]);

  const sendGift = useCallback((toUserId: string, stickerId: string, message?: string) => {
    const toUser = mockUsers.find(u => u.id === toUserId);
    const fromUser = user;
    const sticker = stickers.find(s => s.id === stickerId);
    if (!toUser || !fromUser || !sticker) {
      console.log('sendGift invalid input');
      return;
    }
    const gift: Gift = {
      id: generateId(),
      fromUserId: fromUser.id,
      toUserId: toUser.id,
      sticker,
      message,
    };
    const post: SocialPost = {
      id: `post-gift-${gift.id}`,
      userId: fromUser.id,
      userName: fromUser.name,
      userAvatar: fromUser.avatar,
      type: 'gift',
      gift,
      message,
      timestamp: new Date().toISOString(),
      likes: [],
      comments: [],
    };
    setSocialPosts(prev => [post, ...prev]);
  }, [stickers, user]);

  useEffect(() => {
    loadChallenges();
  }, []);

  const loadChallenges = async () => {
    try {
      const [challengesData, progressData] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.CHALLENGES),
        AsyncStorage.getItem(STORAGE_KEYS.CHALLENGE_PROGRESS),
      ]);
      if (challengesData) setChallenges(JSON.parse(challengesData));
      if (progressData) setChallengeProgress(JSON.parse(progressData));
    } catch (error) {
      console.error('Error loading challenges:', error);
    }
  };

  const createChallenge = useCallback(async (challenge: Challenge) => {
    const updated = [...challenges, challenge];
    setChallenges(updated);
    await AsyncStorage.setItem(STORAGE_KEYS.CHALLENGES, JSON.stringify(updated));
  }, [challenges]);

  const joinChallenge = useCallback(async (challengeId: string, userId: string) => {
    const updated = challenges.map(c => 
      c.id === challengeId
        ? { ...c, participants: [...c.participants, userId] }
        : c
    );
    setChallenges(updated);
    await AsyncStorage.setItem(STORAGE_KEYS.CHALLENGES, JSON.stringify(updated));

    const newProgress: ChallengeProgress = {
      challengeId,
      userId,
      progress: 0,
      lastUpdated: new Date().toISOString(),
      completed: false,
    };
    const updatedProgress = [...challengeProgress, newProgress];
    setChallengeProgress(updatedProgress);
    await AsyncStorage.setItem(STORAGE_KEYS.CHALLENGE_PROGRESS, JSON.stringify(updatedProgress));
  }, [challenges, challengeProgress]);

  const getChallengeProgress = useCallback((challengeId: string, userId: string): number => {
    const challenge = challenges.find(c => c.id === challengeId);
    if (!challenge) return 0;

    const start = new Date(challenge.startDate).getTime();
    const end = new Date(challenge.endDate).getTime();
    const now = new Date().getTime();

    const relevantActivities = activities.filter(a => {
      const activityDate = new Date(a.date).getTime();
      return a.userId === userId && activityDate >= start && activityDate <= end;
    });

    switch (challenge.type) {
      case 'steps':
        return relevantActivities.reduce((sum, a) => sum + (a.steps || 0), 0);
      case 'calories':
        return relevantActivities.reduce((sum, a) => sum + a.calories, 0);
      case 'distance':
        return relevantActivities.reduce((sum, a) => sum + (a.distance || 0), 0);
      case 'active_minutes':
        return relevantActivities.reduce((sum, a) => sum + a.duration, 0);
      case 'workouts':
        return relevantActivities.length;
      case 'plank_time':
        const daysWithActivity = new Set(
          relevantActivities.map(a => a.date.split('T')[0])
        ).size;
        return daysWithActivity;
      default:
        return 0;
    }
  }, [challenges, activities]);

  const getLeaderboard = useCallback((metric: LeaderboardMetric, period: LeaderboardPeriod): LeaderboardEntry[] => {
    const now = new Date();
    let startDate: Date;

    switch (period) {
      case 'weekly':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'monthly':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case 'all-time':
        startDate = new Date(0);
        break;
    }

    const allUsers = [user, ...friends];
    const leaderboard: LeaderboardEntry[] = [];

    allUsers.forEach(u => {
      const userActivities = activities.filter(a => {
        const activityDate = new Date(a.date).getTime();
        return a.userId === u.id && activityDate >= startDate.getTime();
      });

      let value = 0;
      switch (metric) {
        case 'steps':
          value = userActivities.reduce((sum, a) => sum + (a.steps || 0), 0);
          break;
        case 'calories':
          value = userActivities.reduce((sum, a) => sum + a.calories, 0);
          break;
        case 'distance':
          value = userActivities.reduce((sum, a) => sum + (a.distance || 0), 0);
          break;
        case 'active_minutes':
          value = userActivities.reduce((sum, a) => sum + a.duration, 0);
          break;
        case 'workouts':
          value = userActivities.length;
          break;
      }

      leaderboard.push({
        userId: u.id,
        userName: u.name,
        userAvatar: u.avatar,
        value,
        rank: 0,
      });
    });

    leaderboard.sort((a, b) => b.value - a.value);
    leaderboard.forEach((entry, index) => {
      entry.rank = index + 1;
    });

    return leaderboard;
  }, [user, friends, activities]);

  return {
    user,
    friends,
    socialPosts,
    likePost,
    addComment,
    stickers,
    sendGift,
    challenges,
    createChallenge,
    joinChallenge,
    getChallengeProgress,
    getLeaderboard,
  };
});
