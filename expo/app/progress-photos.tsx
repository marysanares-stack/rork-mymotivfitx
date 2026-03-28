import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Dimensions,
  Alert,
} from 'react-native';
import { router, Stack } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Camera,
  X,
  ArrowLeft,
  Calendar,
  Image as ImageIcon,
  ChevronRight,
} from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Colors from '@/constants/colors';

const { width } = Dimensions.get('window');
const PHOTO_GRID_SIZE = (width - 48) / 3;

interface ProgressPhoto {
  id: string;
  uri: string;
  date: string;
  note?: string;
}

export default function ProgressPhotosScreen() {
  const insets = useSafeAreaInsets();
  const [photos, setPhotos] = useState<ProgressPhoto[]>([]);
  const [showCamera, setShowCamera] = useState(false);
  const [selectedPhotos, setSelectedPhotos] = useState<ProgressPhoto[]>([]);
  const [permission, requestPermission] = useCameraPermissions();
  const [cameraRef, setCameraRef] = useState<CameraView | null>(null);
  const [showComparison, setShowComparison] = useState(false);

  useEffect(() => {
    loadPhotos();
  }, []);

  const loadPhotos = async () => {
    try {
      const stored = await AsyncStorage.getItem('@progress_photos');
      if (stored) {
        setPhotos(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Error loading photos:', error);
    }
  };

  const savePhotos = async (newPhotos: ProgressPhoto[]) => {
    try {
      await AsyncStorage.setItem('@progress_photos', JSON.stringify(newPhotos));
      setPhotos(newPhotos);
    } catch (error) {
      console.error('Error saving photos:', error);
    }
  };

  const handleOpenCamera = async () => {
    if (!permission?.granted) {
      const result = await requestPermission();
      if (!result.granted) {
        Alert.alert('Camera Permission', 'Camera permission is required to take photos');
        return;
      }
    }
    setShowCamera(true);
  };

  const handleTakePhoto = async () => {
    if (!cameraRef) return;

    try {
      const photo = await cameraRef.takePictureAsync({ quality: 0.8 });
      if (photo) {
        const newPhoto: ProgressPhoto = {
          id: `photo-${Date.now()}`,
          uri: photo.uri,
          date: new Date().toISOString(),
        };
        const updated = [newPhoto, ...photos];
        await savePhotos(updated);
        setShowCamera(false);
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('Error', 'Failed to take photo');
    }
  };

  const handleDeletePhoto = (id: string) => {
    Alert.alert('Delete Photo', 'Are you sure you want to delete this photo?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          const updated = photos.filter(p => p.id !== id);
          await savePhotos(updated);
        },
      },
    ]);
  };

  const handleSelectPhoto = (photo: ProgressPhoto) => {
    if (selectedPhotos.find(p => p.id === photo.id)) {
      setSelectedPhotos(selectedPhotos.filter(p => p.id !== photo.id));
    } else {
      if (selectedPhotos.length < 2) {
        setSelectedPhotos([...selectedPhotos, photo]);
      } else {
        setSelectedPhotos([selectedPhotos[1], photo]);
      }
    }
  };

  const handleCompare = () => {
    if (selectedPhotos.length === 2) {
      setShowComparison(true);
    }
  };

  const sortedPhotos = [...photos].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const getPhotoDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const getDaysBetween = (date1: string, date2: string) => {
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    const diff = Math.abs(d2.getTime() - d1.getTime());
    return Math.floor(diff / (1000 * 60 * 60 * 24));
  };

  if (showCamera) {
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ headerShown: false }} />
        <CameraView
          ref={setCameraRef}
          style={StyleSheet.absoluteFillObject}
          facing="back"
        />
        <View style={[styles.cameraOverlay, { paddingTop: insets.top + 16 }]}>
          <View style={styles.cameraHeader}>
            <TouchableOpacity
              style={styles.cameraCloseBtn}
              onPress={() => setShowCamera(false)}
            >
              <X size={28} color={Colors.white} />
            </TouchableOpacity>
          </View>

          <View style={[styles.cameraControls, { paddingBottom: insets.bottom + 20 }]}>
            <TouchableOpacity style={styles.captureButton} onPress={handleTakePhoto}>
              <View style={styles.captureButtonInner} />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  if (showComparison && selectedPhotos.length === 2) {
    const [before, after] = selectedPhotos.sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    const daysBetween = getDaysBetween(before.date, after.date);

    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <Stack.Screen options={{ headerShown: false }} />
        <LinearGradient
          colors={[Colors.background, Colors.surface]}
          style={StyleSheet.absoluteFillObject}
        />

        <View style={styles.comparisonHeader}>
          <TouchableOpacity onPress={() => setShowComparison(false)}>
            <ArrowLeft size={24} color={Colors.text} />
          </TouchableOpacity>
          <Text style={styles.comparisonTitle}>Before & After</Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.comparisonContent}
        >
          <View style={styles.comparisonCard}>
            <Text style={styles.comparisonSubtitle}>
              {daysBetween} {daysBetween === 1 ? 'day' : 'days'} progress
            </Text>

            <View style={styles.comparisonImages}>
              <View style={styles.comparisonImageContainer}>
                <View style={styles.comparisonImageWrapper}>
                  <Image source={{ uri: before.uri }} style={styles.comparisonImage} />
                  <LinearGradient
                    colors={['transparent', 'rgba(0,0,0,0.6)']}
                    style={styles.comparisonImageOverlay}
                  >
                    <Text style={styles.comparisonLabel}>BEFORE</Text>
                    <Text style={styles.comparisonDate}>{getPhotoDate(before.date)}</Text>
                  </LinearGradient>
                </View>
              </View>

              <View style={styles.comparisonDivider}>
                <ChevronRight size={32} color={Colors.primary} />
              </View>

              <View style={styles.comparisonImageContainer}>
                <View style={styles.comparisonImageWrapper}>
                  <Image source={{ uri: after.uri }} style={styles.comparisonImage} />
                  <LinearGradient
                    colors={['transparent', 'rgba(0,0,0,0.6)']}
                    style={styles.comparisonImageOverlay}
                  >
                    <Text style={styles.comparisonLabel}>AFTER</Text>
                    <Text style={styles.comparisonDate}>{getPhotoDate(after.date)}</Text>
                  </LinearGradient>
                </View>
              </View>
            </View>

            <View style={styles.comparisonStats}>
              <View style={styles.comparisonStat}>
                <Calendar size={20} color={Colors.primary} />
                <Text style={styles.comparisonStatValue}>{daysBetween}</Text>
                <Text style={styles.comparisonStatLabel}>Days</Text>
              </View>
            </View>
          </View>

          <TouchableOpacity
            style={styles.clearSelectionBtn}
            onPress={() => {
              setSelectedPhotos([]);
              setShowComparison(false);
            }}
          >
            <Text style={styles.clearSelectionText}>Select Different Photos</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />
      <LinearGradient
        colors={[Colors.background, Colors.surface]}
        style={StyleSheet.absoluteFillObject}
      />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <ArrowLeft size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Progress Photos</Text>
        <TouchableOpacity onPress={handleOpenCamera}>
          <Camera size={24} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      {selectedPhotos.length > 0 && (
        <View style={styles.selectionBar}>
          <Text style={styles.selectionText}>
            {selectedPhotos.length} photo{selectedPhotos.length > 1 ? 's' : ''} selected
          </Text>
          <View style={styles.selectionActions}>
            {selectedPhotos.length === 2 && (
              <TouchableOpacity style={styles.compareBtn} onPress={handleCompare}>
                <Text style={styles.compareBtnText}>Compare</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity onPress={() => setSelectedPhotos([])}>
              <X size={20} color={Colors.textMuted} />
            </TouchableOpacity>
          </View>
        </View>
      )}

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        {photos.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={styles.emptyIconContainer}>
              <ImageIcon size={64} color={Colors.textMuted} />
            </View>
            <Text style={styles.emptyTitle}>No Progress Photos Yet</Text>
            <Text style={styles.emptyDesc}>
              Start tracking your fitness journey with progress photos
            </Text>
            <TouchableOpacity style={styles.emptyButton} onPress={handleOpenCamera}>
              <LinearGradient
                colors={[Colors.primary, Colors.purple]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.emptyButtonGradient}
              >
                <Camera size={20} color={Colors.white} />
                <Text style={styles.emptyButtonText}>Take First Photo</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.photoGrid}>
            {sortedPhotos.map((photo) => {
              const isSelected = selectedPhotos.find(p => p.id === photo.id);
              return (
                <TouchableOpacity
                  key={photo.id}
                  style={[styles.photoItem, isSelected && styles.photoItemSelected]}
                  onPress={() => handleSelectPhoto(photo)}
                  onLongPress={() => handleDeletePhoto(photo.id)}
                >
                  <Image source={{ uri: photo.uri }} style={styles.photoImage} />
                  {isSelected && (
                    <View style={styles.selectedOverlay}>
                      <View style={styles.selectedBadge}>
                        <Text style={styles.selectedBadgeText}>
                          {selectedPhotos.findIndex(p => p.id === photo.id) + 1}
                        </Text>
                      </View>
                    </View>
                  )}
                  <View style={styles.photoDate}>
                    <Text style={styles.photoDateText}>{getPhotoDate(photo.date)}</Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {photos.length > 0 && (
          <View style={styles.infoCard}>
            <Text style={styles.infoText}>
              💡 Tap to select photos, hold to delete. Select 2 photos to compare your progress!
            </Text>
          </View>
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
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingTop: 8,
  },
  emptyState: {
    alignItems: 'center',
    paddingTop: 80,
    paddingHorizontal: 40,
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: Colors.surfaceLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: Colors.text,
    marginBottom: 12,
    textAlign: 'center',
  },
  emptyDesc: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  emptyButton: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  emptyButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  emptyButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.white,
  },
  photoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  photoItem: {
    width: PHOTO_GRID_SIZE,
    height: PHOTO_GRID_SIZE * 1.3,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: Colors.surfaceLight,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  photoItemSelected: {
    borderColor: Colors.primary,
  },
  photoImage: {
    width: '100%',
    height: '100%',
  },
  photoDate: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  photoDateText: {
    fontSize: 11,
    fontWeight: '600' as const,
    color: Colors.white,
    textAlign: 'center',
  },
  selectedOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(76, 63, 255, 0.3)',
    alignItems: 'flex-end',
    padding: 8,
  },
  selectedBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.white,
  },
  selectedBadgeText: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: Colors.white,
  },
  selectionBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: Colors.surfaceLight,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  selectionText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  selectionActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  compareBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  compareBtnText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.white,
  },
  cameraOverlay: {
    flex: 1,
    justifyContent: 'space-between',
  },
  cameraHeader: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 20,
  },
  cameraCloseBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cameraControls: {
    alignItems: 'center',
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  captureButtonInner: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.primary,
  },
  comparisonHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  comparisonTitle: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  comparisonContent: {
    padding: 20,
  },
  comparisonCard: {
    backgroundColor: Colors.cardBg,
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  comparisonSubtitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 20,
  },
  comparisonImages: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 24,
  },
  comparisonImageContainer: {
    flex: 1,
  },
  comparisonImageWrapper: {
    borderRadius: 16,
    overflow: 'hidden',
    aspectRatio: 3 / 4,
  },
  comparisonImage: {
    width: '100%',
    height: '100%',
  },
  comparisonImageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 12,
  },
  comparisonLabel: {
    fontSize: 12,
    fontWeight: '700' as const,
    color: Colors.white,
    marginBottom: 4,
  },
  comparisonDate: {
    fontSize: 11,
    fontWeight: '500' as const,
    color: Colors.white,
    opacity: 0.9,
  },
  comparisonDivider: {
    width: 40,
    alignItems: 'center',
  },
  comparisonStats: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 32,
  },
  comparisonStat: {
    alignItems: 'center',
    gap: 8,
  },
  comparisonStatValue: {
    fontSize: 32,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  comparisonStatLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  clearSelectionBtn: {
    marginTop: 16,
    padding: 16,
    backgroundColor: Colors.surfaceLight,
    borderRadius: 12,
    alignItems: 'center',
  },
  clearSelectionText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.primary,
  },
  infoCard: {
    marginTop: 16,
    padding: 16,
    backgroundColor: Colors.primary + '10',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.primary + '30',
  },
  infoText: {
    fontSize: 14,
    color: Colors.text,
    textAlign: 'center',
    lineHeight: 20,
  },
});
