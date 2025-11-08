import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Share,
  Platform,
  Alert,
} from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Share2, Twitter, Facebook, MessageCircle, Copy, Check } from 'lucide-react-native';
import { Image } from 'expo-image';
import Colors from '@/constants/colors';
import { useFitness } from '@/contexts/FitnessContext';

export default function ShareAchievementScreen() {
  const { badgeId } = useLocalSearchParams<{ badgeId?: string }>();
  const router = useRouter();
  const { earnedBadges } = useFitness();
  const [copied, setCopied] = useState(false);

  const badge = earnedBadges.find(b => b.id === badgeId);

  if (!badge) {
    return (
      <View style={styles.container}>
        <Stack.Screen
          options={{
            headerShown: true,
            title: 'Share Achievement',
            headerStyle: { backgroundColor: Colors.surface },
            headerTintColor: Colors.text,
            headerShadowVisible: false,
          }}
        />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Badge not found</Text>
        </View>
      </View>
    );
  }

  const shareText = `🎉 I just earned the "${badge.name}" badge! ${badge.description} 💪 #FitnessGoals`;
  const shareUrl = 'https://yourapp.com';

  const handleShare = async (platform?: 'twitter' | 'facebook' | 'message') => {
    try {
      if (Platform.OS === 'web') {
        if (platform === 'twitter') {
          window.open(
            `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`,
            '_blank'
          );
        } else if (platform === 'facebook') {
          window.open(
            `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(shareText)}`,
            '_blank'
          );
        } else {
          await navigator.share({
            title: badge.name,
            text: shareText,
            url: shareUrl,
          }).catch((error) => {
            console.log('Web share error:', error);
          });
        }
      } else {
        if (platform) {
          Alert.alert(
            'Share',
            'This would open the respective app on a real device.',
            [{ text: 'OK' }]
          );
        } else {
          await Share.share({
            message: shareText,
            url: shareUrl,
            title: badge.name,
          });
        }
      }
    } catch (error) {
      console.error('Error sharing:', error);
      if (error instanceof Error && error.message !== 'User closed') {
        Alert.alert('Error', 'Failed to share achievement');
      }
    }
  };

  const handleCopyLink = () => {
    if (Platform.OS === 'web') {
      navigator.clipboard.writeText(shareText);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          headerShown: true,
          title: 'Share Achievement',
          headerStyle: { backgroundColor: Colors.surface },
          headerTintColor: Colors.text,
          headerShadowVisible: false,
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
        <View style={styles.badgePreview}>
          <LinearGradient
            colors={[Colors.primary, Colors.accent]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.badgePreviewGradient}
          >
            <View style={styles.badgeIconContainer}>
              {typeof badge.icon === 'string' && badge.icon.startsWith('http') ? (
                <Image
                  source={{ uri: badge.icon }}
                  style={styles.badgeIcon}
                  contentFit="cover"
                />
              ) : (
                <Text style={styles.badgeIconText}>{badge.icon}</Text>
              )}
            </View>
            <Text style={styles.badgeName}>{badge.name}</Text>
            <Text style={styles.badgeDescription}>{badge.description}</Text>
            {badge.earnedDate && (
              <Text style={styles.badgeDate}>
                Earned on {new Date(badge.earnedDate).toLocaleDateString()}
              </Text>
            )}
          </LinearGradient>
        </View>

        <View style={styles.shareSection}>
          <Text style={styles.sectionTitle}>Share your achievement</Text>
          <Text style={styles.sectionSubtitle}>
            Let your friends know about your progress!
          </Text>

          <View style={styles.shareButtons}>
            <TouchableOpacity
              style={styles.shareButton}
              onPress={() => handleShare()}
            >
              <View style={[styles.shareButtonIcon, { backgroundColor: Colors.primary + '20' }]}>
                <Share2 size={24} color={Colors.primary} />
              </View>
              <Text style={styles.shareButtonText}>Share</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.shareButton}
              onPress={() => handleShare('twitter')}
            >
              <View style={[styles.shareButtonIcon, { backgroundColor: '#1DA1F2' + '20' }]}>
                <Twitter size={24} color="#1DA1F2" />
              </View>
              <Text style={styles.shareButtonText}>Twitter</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.shareButton}
              onPress={() => handleShare('facebook')}
            >
              <View style={[styles.shareButtonIcon, { backgroundColor: '#4267B2' + '20' }]}>
                <Facebook size={24} color="#4267B2" />
              </View>
              <Text style={styles.shareButtonText}>Facebook</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.shareButton}
              onPress={() => handleShare('message')}
            >
              <View style={[styles.shareButtonIcon, { backgroundColor: Colors.green + '20' }]}>
                <MessageCircle size={24} color={Colors.green} />
              </View>
              <Text style={styles.shareButtonText}>Message</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.copyButton}
            onPress={handleCopyLink}
          >
            {copied ? (
              <>
                <Check size={20} color={Colors.green} />
                <Text style={[styles.copyButtonText, { color: Colors.green }]}>
                  Copied!
                </Text>
              </>
            ) : (
              <>
                <Copy size={20} color={Colors.textSecondary} />
                <Text style={styles.copyButtonText}>Copy message</Text>
              </>
            )}
          </TouchableOpacity>

          <View style={styles.previewCard}>
            <Text style={styles.previewLabel}>Preview:</Text>
            <Text style={styles.previewText}>{shareText}</Text>
          </View>
        </View>
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
  },
  badgePreview: {
    borderRadius: 24,
    overflow: 'hidden',
    marginBottom: 32,
  },
  badgePreviewGradient: {
    paddingVertical: 48,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  badgeIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  badgeIcon: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  badgeIconText: {
    fontSize: 64,
  },
  badgeName: {
    fontSize: 28,
    fontWeight: '700' as const,
    color: '#fff',
    textAlign: 'center',
    marginBottom: 12,
  },
  badgeDescription: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 16,
  },
  badgeDate: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
  },
  shareSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: Colors.text,
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginBottom: 24,
    lineHeight: 22,
  },
  shareButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: 24,
  },
  shareButton: {
    alignItems: 'center',
    gap: 8,
    width: '22%',
  },
  shareButtonIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shareButtonText: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: Colors.text,
    textAlign: 'center',
  },
  copyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    paddingHorizontal: 20,
    backgroundColor: Colors.cardBg,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 20,
  },
  copyButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.textSecondary,
  },
  previewCard: {
    backgroundColor: Colors.cardBg,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  previewLabel: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  previewText: {
    fontSize: 15,
    color: Colors.text,
    lineHeight: 22,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    fontSize: 16,
    color: Colors.textSecondary,
  },
});
