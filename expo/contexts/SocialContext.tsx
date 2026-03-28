import createContextHook from '@nkzw/create-context-hook';
import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, SocialPost, Activity, Sticker, Gift, Challenge, ChallengeProgress, LeaderboardEntry, LeaderboardPeriod, LeaderboardMetric } from '@/types';
import { useFitness } from './FitnessContext';
import { trpc } from '@/lib/trpc';

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

const STORAGE_PREFIX = {
  NO_FRIENDS_DISMISSED: '@social_no_friends_banner_dismissed',
};

export const [SocialProvider, useSocial] = createContextHook(() => {
  const [friends, setFriends] = useState<User[]>([]);
  const [socialPosts, setSocialPosts] = useState<SocialPost[]>([]);
  const [stickers] = useState<Sticker[]>(STICKER_CATALOG);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [challengeProgress, setChallengeProgress] = useState<ChallengeProgress[]>([]);
  const [noFriendsBannerDismissed, setNoFriendsBannerDismissed] = useState<boolean>(false);
  const fitness = useFitness();
  const { earnedBadges, recentActivities, user, activities, updateUserProfile } = fitness;
  const isFitnessLoading = fitness.isLoading;

  const generateSocialPosts = useCallback(() => {
    const posts: SocialPost[] = [];

  recentActivities.slice(0, 3).forEach((activity: Activity) => {
      const activityUser = user; // Only own activities for now
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

  earnedBadges.slice(0, 2).forEach((badge: any) => {
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

    // Future: append real friend activities when backend routes exist

    const sorted = posts.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
    setSocialPosts(sorted);
  }, [earnedBadges, recentActivities, user]);

  // Fetch friends from backend when backendId is available
  const backendId = user.backendId;
  const friendsQuery = trpc.user.friends.list.useQuery(
    { userId: backendId as string },
    { enabled: !!backendId, refetchOnMount: 'always' }
  );

  useEffect(() => {
    if (friendsQuery.data) {
      const data = friendsQuery.data as unknown as User[];
      setFriends(data);
      // Update fitness user.friends with friend IDs for badge logic
      const friendIds = data.map((f: any) => f.id);
      if (JSON.stringify(friendIds) !== JSON.stringify(user.friends)) {
        void updateUserProfile({ friends: friendIds } as any);
      }
    }
  }, [friendsQuery.data, updateUserProfile, user.friends]);

  useEffect(() => {
    if (!isFitnessLoading && earnedBadges && recentActivities) {
      generateSocialPosts();
    }
  }, [isFitnessLoading, earnedBadges, recentActivities, generateSocialPosts, fitness]);

  // Load persisted dismissal state per user
  useEffect(() => {
    const loadDismissal = async () => {
      try {
        if (!user?.id) return;
        const key = `${STORAGE_PREFIX.NO_FRIENDS_DISMISSED}:${user.id}`;
        const val = await AsyncStorage.getItem(key);
        setNoFriendsBannerDismissed(val === 'true');
      } catch {
        // non-fatal
      }
    };
    void loadDismissal();
  }, [user?.id]);

  const dismissNoFriendsBanner = useCallback(async () => {
    try {
      if (!user?.id) return;
      setNoFriendsBannerDismissed(true);
      const key = `${STORAGE_PREFIX.NO_FRIENDS_DISMISSED}:${user.id}`;
      await AsyncStorage.setItem(key, 'true');
    } catch {
      // non-fatal
    }
  }, [user?.id]);

  const likePost = useCallback((postId: string) => {
    setSocialPosts((prev: SocialPost[]) => prev.map((post: SocialPost) => 
      post.id === postId
        ? { ...post, likes: [...post.likes, user.id] }
        : post
    ));
  }, [user.id]);

  const addComment = useCallback((postId: string, text: string) => {
    setSocialPosts((prev: SocialPost[]) => prev.map((post: SocialPost) => 
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
  const toUser = friends.find((u: User) => u.id === toUserId);
    const fromUser = user;
  const sticker = stickers.find((s: Sticker) => s.id === stickerId);
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
  setSocialPosts((prev: SocialPost[]) => [post, ...prev]);
  }, [stickers, user, friends]);

  // Friend management mutations
  const addFriendMutation = trpc.user.friends.add.useMutation();
  const removeFriendMutation = trpc.user.friends.remove.useMutation();

  const addFriend = useCallback(async (friendId: string) => {
    if (!backendId) return;
    await addFriendMutation.mutateAsync({ userId: backendId, friendId });
    await friendsQuery.refetch();
  }, [backendId, addFriendMutation, friendsQuery]);

  const removeFriend = useCallback(async (friendId: string) => {
    if (!backendId) return;
    await removeFriendMutation.mutateAsync({ userId: backendId, friendId });
    await friendsQuery.refetch();
  }, [backendId, removeFriendMutation, friendsQuery]);

  useEffect(() => {
    (async () => {
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
    })();
  }, []);

  const createChallenge = useCallback(async (challenge: Challenge) => {
    const updated = [...challenges, challenge];
    setChallenges(updated);
    await AsyncStorage.setItem(STORAGE_KEYS.CHALLENGES, JSON.stringify(updated));
  }, [challenges]);

  const joinChallenge = useCallback(async (challengeId: string, userId: string) => {
    const updated = challenges.map((c: Challenge) => 
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
  const challenge = challenges.find((c: Challenge) => c.id === challengeId);
    if (!challenge) return 0;

    const start = new Date(challenge.startDate).getTime();
    const end = new Date(challenge.endDate).getTime();
    

    const relevantActivities = activities.filter((a: Activity) => {
      const activityDate = new Date(a.date).getTime();
      return a.userId === userId && activityDate >= start && activityDate <= end;
    });

    switch (challenge.type) {
      case 'steps':
        return relevantActivities.reduce((sum: number, a: Activity) => sum + (a.steps || 0), 0);
      case 'calories':
        return relevantActivities.reduce((sum: number, a: Activity) => sum + a.calories, 0);
      case 'distance':
        return relevantActivities.reduce((sum: number, a: Activity) => sum + (a.distance || 0), 0);
      case 'active_minutes':
        return relevantActivities.reduce((sum: number, a: Activity) => sum + a.duration, 0);
      case 'workouts':
        return relevantActivities.length;
      case 'plank_time':
        const daysWithActivity = new Set(
          relevantActivities.map((a: Activity) => a.date.split('T')[0])
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

  const allUsers: User[] = [user, ...friends];
    const leaderboard: LeaderboardEntry[] = [];

    allUsers.forEach((u: User) => {
      const userActivities = activities.filter((a: Activity) => {
        const activityDate = new Date(a.date).getTime();
        return a.userId === u.id && activityDate >= startDate.getTime();
      });

      let value = 0;
      switch (metric) {
        case 'steps':
          value = userActivities.reduce((sum: number, a: Activity) => sum + (a.steps || 0), 0);
          break;
        case 'calories':
          value = userActivities.reduce((sum: number, a: Activity) => sum + a.calories, 0);
          break;
        case 'distance':
          value = userActivities.reduce((sum: number, a: Activity) => sum + (a.distance || 0), 0);
          break;
        case 'active_minutes':
          value = userActivities.reduce((sum: number, a: Activity) => sum + a.duration, 0);
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
    noFriendsBannerDismissed,
    dismissNoFriendsBanner,
    addComment,
    stickers,
    sendGift,
    addFriend,
    removeFriend,
    challenges,
    createChallenge,
    joinChallenge,
    getChallengeProgress,
    getLeaderboard,
  };
});
