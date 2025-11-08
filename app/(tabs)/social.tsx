import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  Heart,
  MessageCircle,
  Clock,
  Flame,
  Route,
  Users,
  Share2,
  Gift,
  Trophy,
  Medal,
} from 'lucide-react-native';
import { useSocial } from '@/contexts/SocialContext';
import Colors from '@/constants/colors';
import { ACTIVITY_TYPES } from '@/mocks/data';
import { SocialPost } from '@/types';

export default function SocialScreen() {
  const insets = useSafeAreaInsets();
  const { friends, socialPosts, likePost } = useSocial();
  const router = useRouter();

  const getActivityTypeInfo = (type: string) => {
    return ACTIVITY_TYPES.find(a => a.value === type) || ACTIVITY_TYPES[0];
  };

  const renderPost = (post: SocialPost) => {
    const isLiked = post.likes.includes(post.userId);
    const timeAgo = getTimeAgo(post.timestamp);

    if (post.type === 'badge' && post.badge) {
      return (
        <View key={post.id} style={styles.postCard}>
          <View style={styles.postHeader}>
            <View style={styles.userInfo}>
              <View style={styles.avatar}>
                {post.userAvatar && (post.userAvatar.startsWith('http') || post.userAvatar.startsWith('data:')) ? (
                  <Image
                    source={{ uri: post.userAvatar }}
                    style={styles.avatarImage}
                    contentFit="cover"
                  />
                ) : (
                  <Text style={styles.avatarText}>{post.userAvatar}</Text>
                )}
              </View>
              <View style={{flex: 1}}>
                <Text style={styles.userName}>{post.userName}</Text>
                <Text style={styles.postTime}>{timeAgo}</Text>
              </View>
            </View>
            {post.userId === post.userId && (
              <TouchableOpacity
                style={styles.shareIconButton}
                onPress={() => router.push(`/share-achievement?badgeId=${post.badge?.id}`)}
              >
                <Share2 size={18} color={Colors.textSecondary} />
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.badgePostContent}>
            <View style={styles.badgePostIcon}>
              {typeof post.badge.icon === 'string' && post.badge.icon.startsWith('http') ? (
                <Image
                  source={{ uri: post.badge.icon }}
                  style={styles.badgePostImage}
                  contentFit="cover"
                  accessible
                  accessibilityLabel={post.badge.name}
                />
              ) : (
                <Text style={styles.badgePostEmoji}>{post.badge.icon}</Text>
              )}
            </View>
            <View style={styles.badgePostInfo}>
              <Text style={styles.badgePostTitle}>Earned a badge!</Text>
              <Text style={styles.badgePostName}>{post.badge.name}</Text>
              <Text style={styles.badgePostDesc}>{post.badge.description}</Text>
            </View>
          </View>

          <View style={styles.postActions}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => likePost(post.id)}
            >
              <Heart
                size={20}
                color={isLiked ? Colors.pink : Colors.textSecondary}
                fill={isLiked ? Colors.pink : 'none'}
              />
              <Text style={[styles.actionText, isLiked && { color: Colors.pink }]}>
                {post.likes.length}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <MessageCircle size={20} color={Colors.textSecondary} />
              <Text style={styles.actionText}>{post.comments.length}</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }

    if (post.type === 'gift' && post.gift) {
      return (
        <View key={post.id} style={styles.postCard}>
          <View style={styles.postHeader}>
            <View style={styles.userInfo}>
              <View style={styles.avatar}>
                {post.userAvatar && (post.userAvatar.startsWith('http') || post.userAvatar.startsWith('data:')) ? (
                  <Image
                    source={{ uri: post.userAvatar }}
                    style={styles.avatarImage}
                    contentFit="cover"
                  />
                ) : (
                  <Text style={styles.avatarText}>{post.userAvatar}</Text>
                )}
              </View>
              <View>
                <Text style={styles.userName}>{post.userName}</Text>
                <Text style={styles.postTime}>{timeAgo}</Text>
              </View>
            </View>
          </View>

          <View style={styles.badgePostContent}>
            <View style={styles.badgePostIcon}>
              <Text style={styles.badgePostEmoji}>{post.gift.sticker.emoji}</Text>
            </View>
            <View style={styles.badgePostInfo}>
              <Text style={styles.badgePostTitle}>Sent a motivation</Text>
              <Text style={styles.badgePostName}>{post.gift.sticker.name}</Text>
              {post.message ? (
                <Text style={styles.badgePostDesc}>{post.message}</Text>
              ) : null}
            </View>
          </View>

          <View style={styles.postActions}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => likePost(post.id)}
            >
              <Heart
                size={20}
                color={isLiked ? Colors.pink : Colors.textSecondary}
                fill={isLiked ? Colors.pink : 'none'}
              />
              <Text style={[styles.actionText, isLiked && { color: Colors.pink }]}>
                {post.likes.length}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <MessageCircle size={20} color={Colors.textSecondary} />
              <Text style={styles.actionText}>{post.comments.length}</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }

    if (post.type === 'activity' && post.activity) {
      const typeInfo = getActivityTypeInfo(post.activity.type);
      return (
        <View key={post.id} style={styles.postCard}>
          <View style={styles.postHeader}>
            <View style={styles.userInfo}>
              <View style={styles.avatar}>
                {post.userAvatar && (post.userAvatar.startsWith('http') || post.userAvatar.startsWith('data:')) ? (
                  <Image
                    source={{ uri: post.userAvatar }}
                    style={styles.avatarImage}
                    contentFit="cover"
                  />
                ) : (
                  <Text style={styles.avatarText}>{post.userAvatar}</Text>
                )}
              </View>
              <View>
                <Text style={styles.userName}>{post.userName}</Text>
                <Text style={styles.postTime}>{timeAgo}</Text>
              </View>
            </View>
          </View>

          <View style={styles.activityPostContent}>
            <View
              style={[
                styles.activityTypeIcon,
                { backgroundColor: typeInfo.color + '20' },
              ]}
            >
              {typeof typeInfo.icon === 'string' && typeInfo.icon.startsWith('http') ? (
                <Image
                  source={{ uri: typeInfo.icon }}
                  style={styles.activityTypeImage}
                  contentFit="cover"
                  accessible
                  accessibilityLabel={typeInfo.label}
                />
              ) : (
                <Text style={styles.activityTypeEmoji}>{typeInfo.icon}</Text>
              )}
            </View>
            <View style={styles.activityPostInfo}>
              <Text style={styles.activityPostName}>{post.activity.name}</Text>
              <Text style={styles.activityPostType}>{typeInfo.label}</Text>
            </View>
          </View>

          <View style={styles.activityStats}>
            <View style={styles.activityStat}>
              <Clock size={16} color={Colors.blue} />
              <Text style={styles.activityStatText}>{post.activity.duration} min</Text>
            </View>
            <View style={styles.activityStat}>
              <Flame size={16} color={Colors.orange} />
              <Text style={styles.activityStatText}>{post.activity.calories} cal</Text>
            </View>
            {post.activity.distance && (
              <View style={styles.activityStat}>
                <Route size={16} color={Colors.green} />
                <Text style={styles.activityStatText}>{post.activity.distance} km</Text>
              </View>
            )}
          </View>

          <View style={styles.postActions}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => likePost(post.id)}
            >
              <Heart
                size={20}
                color={isLiked ? Colors.pink : Colors.textSecondary}
                fill={isLiked ? Colors.pink : 'none'}
              />
              <Text style={[styles.actionText, isLiked && { color: Colors.pink }]}>
                {post.likes.length}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <MessageCircle size={20} color={Colors.textSecondary} />
              <Text style={styles.actionText}>{post.comments.length}</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }

    return null;
  };

  const getTimeAgo = (timestamp: string) => {
    const now = new Date().getTime();
    const time = new Date(timestamp).getTime();
    const diff = now - time;

    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <LinearGradient
        colors={[Colors.background, Colors.surface]}
        style={StyleSheet.absoluteFillObject}
      />

      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Social</Text>
          <Text style={styles.subtitle}>Stay connected with friends</Text>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => router.push('/challenges')}
            testID="challenges-button"
          >
            <Trophy size={18} color={Colors.orange} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => router.push('/leaderboards')}
            testID="leaderboards-button"
          >
            <Medal size={18} color={Colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => router.push('/groups')}
            testID="groups-button"
          >
            <Users size={18} color={Colors.purple} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => router.push('/send-gift')}
            testID="gift-button"
          >
            <Gift size={18} color={Colors.accent} />
          </TouchableOpacity>
        </View>
      </View>

      {friends.length > 0 && (
        <View style={styles.friendsSection}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.friendsList}
          >
            {friends.map((friend) => (
              <TouchableOpacity key={friend.id} style={styles.friendItem}>
                <View style={styles.friendAvatar}>
                  {friend.avatar && (friend.avatar.startsWith('http') || friend.avatar.startsWith('data:')) ? (
                    <Image
                      source={{ uri: friend.avatar }}
                      style={styles.friendAvatarImage}
                      contentFit="cover"
                    />
                  ) : (
                    <Text style={styles.friendAvatarText}>{friend.avatar}</Text>
                  )}
                </View>
                <Text style={styles.friendName}>{friend.name.split(' ')[0]}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {socialPosts.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>👥</Text>
            <Text style={styles.emptyTitle}>No activity yet</Text>
            <Text style={styles.emptyText}>
              Add friends to see their activities and achievements!
            </Text>
          </View>
        ) : (
          socialPosts.map((post) => renderPost(post))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingLeft: 20,
    paddingRight: 12,
    paddingVertical: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  subtitle: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 4,
    marginRight: 4,
  },
  headerButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: Colors.cardBg,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  shareIconButton: {
    padding: 8,
  },
  friendsSection: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  friendsList: {
    paddingHorizontal: 20,
    gap: 16,
  },
  friendItem: {
    alignItems: 'center',
    gap: 8,
  },
  friendAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.surfaceLight,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  friendAvatarText: {
    fontSize: 28,
  },
  friendAvatarImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  friendName: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: Colors.text,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  postCard: {
    backgroundColor: Colors.cardBg,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  postHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
    position: 'relative' as const,
    zIndex: 1,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    position: 'relative' as const,
    zIndex: 2,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.surfaceLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 20,
  },
  avatarImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  userName: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  postTime: {
    fontSize: 12,
    color: Colors.textMuted,
  },
  badgePostContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingVertical: 12,
  },
  badgePostIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.accent + '20',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgePostEmoji: {
    fontSize: 32,
  },
  badgePostImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  badgePostInfo: {
    flex: 1,
  },
  badgePostTitle: {
    fontSize: 12,
    color: Colors.textMuted,
    marginBottom: 4,
  },
  badgePostName: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.text,
    marginBottom: 2,
  },
  badgePostDesc: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  activityPostContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  activityTypeIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activityTypeEmoji: {
    fontSize: 24,
  },
  activityTypeImage: {
    width: 48,
    height: 48,
    borderRadius: 12,
  },
  activityPostInfo: {
    flex: 1,
  },
  activityPostName: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.text,
    marginBottom: 2,
  },
  activityPostType: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  activityStats: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: 12,
  },
  activityStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  activityStatText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.textSecondary,
  },
  postActions: {
    flexDirection: 'row',
    gap: 24,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.textSecondary,
  },
});
