import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Linking } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Colors from '@/constants/colors';
import { Music, Play, ChevronRight, Settings2 } from 'lucide-react-native';
import { router } from 'expo-router';

 type MusicPlatform = 'apple' | 'spotify';
 type PlaylistKind = 'pump' | 'recovery';

 type Preferences = {
   platform: MusicPlatform;
   playlist: PlaylistKind;
 };

 const APPLE_URLS: Record<PlaylistKind, string> = {
   pump: 'https://music.apple.com/us/playlist/mymotivfit-pump-up/pl.u-abcd1234',
   recovery: 'https://music.apple.com/us/playlist/mymotivfit-recovery-flow/pl.u-wxyz5678',
 } as const;

 const SPOTIFY_URLS: Record<PlaylistKind, string> = {
   pump: 'https://open.spotify.com/playlist/0abcd1234MyMotivFitPumpUp',
   recovery: 'https://open.spotify.com/playlist/0wxyz5678MyMotivFitRecoveryFlow',
 } as const;

 const STORAGE_KEY = 'mmx_music_prefs_v1';

 export default function MusicQuickLaunch() {
   const [prefs, setPrefs] = useState<Preferences>({ platform: 'spotify', playlist: 'pump' });
   const [loading, setLoading] = useState<boolean>(true);

   useEffect(() => {
     const load = async () => {
       try {
         const s = await AsyncStorage.getItem(STORAGE_KEY);
         if (s) {
           const parsed = JSON.parse(s) as Partial<Preferences>;
           setPrefs({ platform: parsed.platform ?? 'spotify', playlist: parsed.playlist ?? 'pump' });
         }
       } catch (e) {
         console.log('MusicQuickLaunch: failed to load prefs', e);
       } finally {
         setLoading(false);
       }
     };
     load();
   }, []);

   const url = useMemo(() => {
     const isApple = prefs.platform === 'apple';
     return isApple ? APPLE_URLS[prefs.playlist] : SPOTIFY_URLS[prefs.playlist];
   }, [prefs]);

   const title = useMemo(() => {
     const playlistTitle = prefs.playlist === 'pump' ? 'Pump Up' : 'Recovery Flow';
     const platformTitle = prefs.platform === 'apple' ? 'Apple Music' : 'Spotify';
     return `${playlistTitle} on ${platformTitle}`;
   }, [prefs]);

   const savePrefs = useCallback(async (next: Preferences) => {
     try {
       await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
     } catch (e) {
       console.log('MusicQuickLaunch: failed to save prefs', e);
     }
   }, []);

   const setPlatform = useCallback((platform: MusicPlatform) => {
     setPrefs((prev) => {
       const next = { ...prev, platform };
       savePrefs(next);
       return next;
     });
   }, [savePrefs]);

   const setPlaylist = useCallback((playlist: PlaylistKind) => {
     setPrefs((prev) => {
       const next = { ...prev, playlist };
       savePrefs(next);
       return next;
     });
   }, [savePrefs]);

   const open = useCallback(async () => {
     try {
       console.log('MusicQuickLaunch: attempting to open', url);
       const supported = await Linking.canOpenURL(url);
       if (supported) {
         await Linking.openURL(url);
       } else {
         console.log('MusicQuickLaunch: cannot open url', url);
       }
     } catch (e) {
       console.log('MusicQuickLaunch: open error', e);
     }
   }, [url]);

   if (loading) {
     return null;
   }

   return (
     <View style={styles.wrapper} testID="music-quick-launch">
       <LinearGradient
         colors={[Colors.cardBg, Colors.cardBgLight]}
         style={styles.card}
       >
         <View style={styles.left}>
           <View style={styles.iconWrap}>
             <Music size={20} color={Colors.white} />
           </View>
           <View style={styles.texts}>
             <Text style={styles.title}>Quick Launch</Text>
             <Text style={styles.subtitle}>{title}</Text>
           </View>
         </View>

         <View style={styles.controls}>
           <View style={styles.switchRow}>
             <TouchableOpacity
               testID="btn-pump"
               accessibilityRole="button"
               style={[styles.switchBtn, prefs.playlist === 'pump' ? styles.switchBtnActive : undefined]}
               onPress={() => setPlaylist('pump')}
               activeOpacity={0.7}
             >
               <Text style={[styles.switchBtnText, prefs.playlist === 'pump' ? styles.switchBtnTextActive : undefined]}>Pump</Text>
             </TouchableOpacity>
             <TouchableOpacity
               testID="btn-recovery"
               accessibilityRole="button"
               style={[styles.switchBtn, prefs.playlist === 'recovery' ? styles.switchBtnActive : undefined]}
               onPress={() => setPlaylist('recovery')}
               activeOpacity={0.7}
             >
               <Text style={[styles.switchBtnText, prefs.playlist === 'recovery' ? styles.switchBtnTextActive : undefined]}>Recovery</Text>
             </TouchableOpacity>
           </View>

           <View style={styles.switchRow}>
             <TouchableOpacity
               testID="btn-apple"
               accessibilityRole="button"
               style={[styles.switchBtn, prefs.platform === 'apple' ? styles.switchBtnActive : undefined]}
               onPress={() => setPlatform('apple')}
               activeOpacity={0.7}
             >
               <Text style={[styles.switchBtnText, prefs.platform === 'apple' ? styles.switchBtnTextActive : undefined]}> Music</Text>
             </TouchableOpacity>
             <TouchableOpacity
               testID="btn-spotify"
               accessibilityRole="button"
               style={[styles.switchBtn, prefs.platform === 'spotify' ? styles.switchBtnActive : undefined]}
               onPress={() => setPlatform('spotify')}
               activeOpacity={0.7}
             >
               <Text style={[styles.switchBtnText, prefs.platform === 'spotify' ? styles.switchBtnTextActive : undefined]}>Spotify</Text>
             </TouchableOpacity>
           </View>

           <View style={styles.actionsRow}>
             <TouchableOpacity testID="btn-open-playlist" style={styles.openBtn} onPress={open} activeOpacity={0.8}>
               <Play size={16} color={Colors.white} />
               <Text style={styles.openBtnText}>Play</Text>
               <ChevronRight size={16} color={Colors.white} />
             </TouchableOpacity>

             <TouchableOpacity
               testID="btn-more-music"
               style={styles.settingsBtn}
               onPress={() => router.push('/music')}
               activeOpacity={0.7}
             >
               <Settings2 size={16} color={Colors.text} />
               <Text style={styles.settingsText}>More</Text>
             </TouchableOpacity>
           </View>
         </View>
       </LinearGradient>
     </View>
   );
 }

 const styles = StyleSheet.create({
   wrapper: {
     marginBottom: 16,
   },
   card: {
     borderRadius: 20,
     padding: 14,
     borderWidth: 1,
     borderColor: Colors.border,
   },
   left: {
     flexDirection: 'row',
     alignItems: 'center',
     gap: 10,
     marginBottom: 12,
   },
   iconWrap: {
     width: 36,
     height: 36,
     borderRadius: 10,
     backgroundColor: Colors.primary,
     alignItems: 'center',
     justifyContent: 'center',
   },
   texts: {
     flex: 1,
   },
   title: {
     fontSize: 12,
     color: Colors.textSecondary,
     marginBottom: 2,
     fontWeight: '600' as const,
   },
   subtitle: {
     fontSize: 16,
     color: Colors.text,
     fontWeight: '700' as const,
   },
   controls: {
     gap: 8,
   },
   switchRow: {
     flexDirection: 'row',
     gap: 8,
   },
   switchBtn: {
     flex: 1,
     paddingVertical: 8,
     borderRadius: 10,
     backgroundColor: Colors.surfaceLight,
     alignItems: 'center',
     borderWidth: 1,
     borderColor: Colors.border,
   },
   switchBtnActive: {
     backgroundColor: Colors.primary + '30',
     borderColor: Colors.primary,
   },
   switchBtnText: {
     fontSize: 12,
     color: Colors.textSecondary,
     fontWeight: '600' as const,
   },
   switchBtnTextActive: {
     color: Colors.white,
   },
   actionsRow: {
     flexDirection: 'row',
     gap: 8,
     marginTop: 4,
   },
   openBtn: {
     flex: 1,
     flexDirection: 'row',
     alignItems: 'center',
     justifyContent: 'center',
     gap: 8,
     paddingVertical: 10,
     borderRadius: 10,
     backgroundColor: Colors.primary,
   },
   openBtnText: {
     color: Colors.white,
     fontWeight: '700' as const,
     fontSize: 14,
   },
   settingsBtn: {
     flexDirection: 'row',
     alignItems: 'center',
     gap: 6,
     paddingHorizontal: 12,
     borderRadius: 10,
     borderWidth: 1,
     borderColor: Colors.border,
     backgroundColor: Colors.cardBg,
   },
   settingsText: {
     color: Colors.text,
     fontSize: 12,
     fontWeight: '600' as const,
   },
 });