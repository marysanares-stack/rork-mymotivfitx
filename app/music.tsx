import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Linking,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Music, Play, ChevronRight } from 'lucide-react-native';
import { Stack } from 'expo-router';
import Colors from '@/constants/colors';

type Playlist = {
  id: string;
  name: string;
  type: 'pump' | 'recovery';
  appleMusicUrl: string;
  spotifyUrl: string;
  description: string;
  gradient: [string, string];
};

const PLAYLISTS: Playlist[] = [
  {
    id: '1',
    name: 'Pump Up',
    type: 'pump',
    appleMusicUrl: 'https://music.apple.com/us/playlist/mymotivfit-pump-up/pl.u-abcd1234',
    spotifyUrl: 'https://open.spotify.com/playlist/0abcd1234MyMotivFitPumpUp',
    description: 'High-energy tracks to power through your workout',
    gradient: [Colors.orange, Colors.red],
  },
  {
    id: '2',
    name: 'Recovery Flow',
    type: 'recovery',
    appleMusicUrl: 'https://music.apple.com/us/playlist/mymotivfit-recovery-flow/pl.u-wxyz5678',
    spotifyUrl: 'https://open.spotify.com/playlist/0wxyz5678MyMotivFitRecoveryFlow',
    description: 'Calming melodies for cool-down and stretching',
    gradient: [Colors.indigo, Colors.purple],
  },
];

export default function MusicScreen() {
  const insets = useSafeAreaInsets();

  const openPlaylist = async (url: string, platform: 'Apple Music' | 'Spotify') => {
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        console.log(`Cannot open ${platform} URL`);
      }
    } catch (error) {
      console.error('Error opening playlist:', error);
    }
  };

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          headerShown: true,
          headerTitle: 'Workout Music',
          headerStyle: {
            backgroundColor: Colors.surface,
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
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 20 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View style={styles.musicIconWrapper}>
            <Music size={32} color={Colors.primary} />
          </View>
          <Text style={styles.headerTitle}>MyMotivFitX Playlists</Text>
          <Text style={styles.headerSubtitle}>
            Curated playlists to fuel your fitness journey
          </Text>
        </View>

        {PLAYLISTS.map((playlist) => (
          <View key={playlist.id} style={styles.playlistCard}>
            <LinearGradient
              colors={playlist.gradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.playlistHeader}
            >
              <View style={styles.playlistHeaderContent}>
                <Play size={40} color={Colors.white} fill={Colors.white} />
                <View style={styles.playlistInfo}>
                  <Text style={styles.playlistName}>{playlist.name}</Text>
                  <Text style={styles.playlistDescription}>{playlist.description}</Text>
                </View>
              </View>
            </LinearGradient>

            <View style={styles.playlistActions}>
              <TouchableOpacity
                style={styles.platformButton}
                onPress={() => openPlaylist(playlist.appleMusicUrl, 'Apple Music')}
                activeOpacity={0.7}
              >
                <View style={styles.platformButtonContent}>
                  <View style={styles.appleMusicIcon}>
                    <Text style={styles.appleMusicIconText}></Text>
                  </View>
                  <Text style={styles.platformButtonText}>Open in Apple Music</Text>
                </View>
                <ChevronRight size={20} color={Colors.textSecondary} />
              </TouchableOpacity>

              <View style={styles.divider} />

              <TouchableOpacity
                style={styles.platformButton}
                onPress={() => openPlaylist(playlist.spotifyUrl, 'Spotify')}
                activeOpacity={0.7}
              >
                <View style={styles.platformButtonContent}>
                  <View style={styles.spotifyIcon}>
                    <Text style={styles.spotifyIconText}>♫</Text>
                  </View>
                  <Text style={styles.platformButtonText}>Open in Spotify</Text>
                </View>
                <ChevronRight size={20} color={Colors.textSecondary} />
              </TouchableOpacity>
            </View>
          </View>
        ))}

        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>🎧 Listen While You Train</Text>
          <Text style={styles.infoText}>
            Tap a button to open the playlist in your preferred music app. Keep the music playing while you use MyMotivFitX to track your workout!
          </Text>
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
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  musicIconWrapper: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.primary + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: Colors.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  playlistCard: {
    backgroundColor: Colors.cardBg,
    borderRadius: 20,
    marginBottom: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  playlistHeader: {
    padding: 24,
  },
  playlistHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  playlistInfo: {
    flex: 1,
  },
  playlistName: {
    fontSize: 22,
    fontWeight: '700' as const,
    color: Colors.white,
    marginBottom: 6,
  },
  playlistDescription: {
    fontSize: 14,
    color: Colors.white,
    opacity: 0.9,
  },
  playlistActions: {
    padding: 16,
  },
  platformButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  platformButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  appleMusicIcon: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#FC3C44',
    alignItems: 'center',
    justifyContent: 'center',
  },
  appleMusicIconText: {
    fontSize: 20,
    color: Colors.white,
  },
  spotifyIcon: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#1DB954',
    alignItems: 'center',
    justifyContent: 'center',
  },
  spotifyIconText: {
    fontSize: 20,
    color: Colors.white,
  },
  platformButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: 8,
  },
  infoCard: {
    backgroundColor: Colors.primary + '15',
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.primary + '30',
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.text,
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
});
