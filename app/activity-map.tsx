import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Platform,
  Alert,
} from 'react-native';
import type * as Location from 'expo-location';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Play,
  Pause,
  Square,
  MapPin,
  TrendingUp,
  Clock,
  Zap,
  Mountain,
  ChevronLeft,
} from 'lucide-react-native';
import { router } from 'expo-router';
import { useFitness } from '@/contexts/FitnessContext';
import Colors from '@/constants/colors';
import { ActivityRoute, ActivityType } from '@/types';

const { width, height } = Dimensions.get('window');

type TrackingStatus = 'idle' | 'tracking' | 'paused';

function WebFallback() {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.container} testID="activity-map-web">
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}> 
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()} activeOpacity={0.7} testID="back-button">
          <ChevronLeft size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Track Activity</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={[styles.map, styles.webMapFallback]} testID="web-map-fallback">
        <MapPin size={24} color={Colors.text} />
        <Text style={styles.webMapText}>Map view is unavailable on web</Text>
        <Text style={styles.webMapSubtext}>Open on an iOS or Android device to track your route</Text>
      </View>

      <View style={[styles.statsPanel, { paddingBottom: insets.bottom + 20 }]} testID="stats-panel">
        <Text style={styles.infoTitle}>Why this screen?</Text>
        <Text style={styles.infoText}>{`This feature uses native maps and precise location tracking that aren't available in the web preview.`}</Text>
        <Text style={styles.infoText}>
          Scan the QR code in the preview to open the app on your phone and start tracking.
        </Text>
      </View>
    </View>
  );
}

function NativeMapView() {
  const insets = useSafeAreaInsets();
  const { addActivity } = useFitness();
  const mapRef = useRef<any | null>(null);
  const locationSubscription = useRef<Location.LocationSubscription | null>(null);

  const [MapView, setMapView] = useState<any>(null);
  const [Marker, setMarker] = useState<any>(null);
  const [Polyline, setPolyline] = useState<any>(null);
  const [PROVIDER_GOOGLE, setPROVIDER_GOOGLE] = useState<any>(null);
  
  const [trackingStatus, setTrackingStatus] = useState<TrackingStatus>('idle');
  const [routePoints, setRoutePoints] = useState<ActivityRoute[]>([]);
  const [currentLocation, setCurrentLocation] = useState<Location.LocationObject | null>(null);
  const [selectedActivityType, setSelectedActivityType] = useState<ActivityType>('running');
  const [LocationRuntime, setLocationRuntime] = useState<typeof import('expo-location') | null>(null);

  const [stats, setStats] = useState({
    distance: 0,
    duration: 0,
    elevation: 0,
    avgSpeed: 0,
    calories: 0,
  });

  const [startTime, setStartTime] = useState<number | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // requestLocationPermission is intentionally stable here and we only want
  // to run this module preload once on mount. Silencing exhaustive-deps
  // prevents a noisy lint warning while keeping behavior unchanged.
   
  useEffect(() => {
    (async () => {
      try {
        const maps = await import('react-native-maps');
        setMapView(() => maps.default);
        setMarker(() => maps.Marker);
        setPolyline(() => maps.Polyline);
        setPROVIDER_GOOGLE(() => maps.PROVIDER_GOOGLE);

        const loc = await import('expo-location');
        setLocationRuntime(loc);

        await requestLocationPermission();
      } catch (e) {
        console.error('Failed to load modules:', e);
      }
    })();

    return () => {
      if (locationSubscription.current) {
        locationSubscription.current.remove();
      }
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  const requestLocationPermission = async () => {
    try {
      if (!LocationRuntime) return;
      const { status: foregroundStatus } = await LocationRuntime.requestForegroundPermissionsAsync();
      if (foregroundStatus !== 'granted') {
        Alert.alert('Permission Required', 'Location permission is needed to track your activity');
        return;
      }
      const location = await LocationRuntime.getCurrentPositionAsync({
        accuracy: LocationRuntime.Accuracy.High,
      });
      setCurrentLocation(location);
      if (mapRef.current && location) {
        mapRef.current.animateToRegion(
          {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          },
          1000,
        );
      }
    } catch (error) {
      console.error('Error requesting location permission:', error);
    }
  };

  const startTracking = async () => {
    try {
      if (!LocationRuntime) return;
      setTrackingStatus('tracking');
      setStartTime(Date.now());
      setRoutePoints([]);
      setStats({ distance: 0, duration: 0, elevation: 0, avgSpeed: 0, calories: 0 });

      timerRef.current = setInterval(() => {
        if (startTime) {
          const elapsed = Math.floor((Date.now() - startTime) / 1000);
          setStats((prev) => ({ ...prev, duration: elapsed }));
        }
      }, 1000);

      locationSubscription.current = await LocationRuntime.watchPositionAsync(
        {
          accuracy: LocationRuntime.Accuracy.High,
          timeInterval: 3000,
          distanceInterval: 5,
        },
        (location) => {
          handleLocationUpdate(location);
        },
      );
    } catch (error) {
      console.error('Error starting tracking:', error);
      Alert.alert('Error', 'Failed to start tracking');
    }
  };

  const handleLocationUpdate = (location: Location.LocationObject) => {
    setCurrentLocation(location);

    const newPoint: ActivityRoute = {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
      timestamp: location.timestamp,
      elevation: location.coords.altitude ?? undefined,
      speed: location.coords.speed ?? undefined,
    };

    setRoutePoints((prevPoints) => {
      const updatedPoints = [...prevPoints, newPoint];

      if (prevPoints.length > 0) {
        const lastPoint = prevPoints[prevPoints.length - 1];
        const distance = calculateDistance(
          lastPoint.latitude,
          lastPoint.longitude,
          newPoint.latitude,
          newPoint.longitude,
        );

        const elevationGain = newPoint.elevation && lastPoint.elevation ? Math.max(0, newPoint.elevation - lastPoint.elevation) : 0;

        setStats((prev) => {
          const newDistance = prev.distance + distance;
          const newElevation = prev.elevation + elevationGain;
          const avgSpeed = stats.duration > 0 ? (newDistance / stats.duration) * 3600 : 0;
          const calories = calculateCalories(newDistance, stats.duration);
          return { ...prev, distance: newDistance, elevation: newElevation, avgSpeed, calories };
        });
      }

      if (mapRef.current && updatedPoints.length > 1) {
        const coordinates = updatedPoints.map((p) => ({ latitude: p.latitude, longitude: p.longitude }));
        mapRef.current.fitToCoordinates(coordinates, {
          edgePadding: { top: 100, right: 50, bottom: 300, left: 50 },
          animated: true,
        });
      }

      return updatedPoints;
    });
  };

  const pauseTracking = () => {
    setTrackingStatus('paused');
    if (locationSubscription.current) {
      locationSubscription.current.remove();
      locationSubscription.current = null;
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const resumeTracking = async () => {
    if (!LocationRuntime) return;
    setTrackingStatus('tracking');
    const pausedDuration = stats.duration;
    setStartTime(Date.now() - pausedDuration * 1000);

    timerRef.current = setInterval(() => {
      setStats((prev) => ({ ...prev, duration: pausedDuration + Math.floor((Date.now() - (startTime || Date.now())) / 1000) }));
    }, 1000);

    locationSubscription.current = await LocationRuntime.watchPositionAsync(
      {
        accuracy: LocationRuntime.Accuracy.High,
        timeInterval: 3000,
        distanceInterval: 5,
      },
      (location) => {
        handleLocationUpdate(location);
      },
    );
  };

  const stopTracking = () => {
    if (locationSubscription.current) {
      locationSubscription.current.remove();
      locationSubscription.current = null;
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (routePoints.length > 0) {
      saveActivity();
    }
    setTrackingStatus('idle');
    setRoutePoints([]);
    setStartTime(null);
  };

  const saveActivity = () => {
    const steps = Math.floor(stats.distance * 1312.336);
    addActivity({
      type: selectedActivityType,
      name: `${getActivityLabel(selectedActivityType)} Activity`,
      duration: Math.floor(stats.duration / 60),
      calories: Math.floor(stats.calories),
      distance: parseFloat(stats.distance.toFixed(2)),
      steps,
      notes: `Route tracked with ${routePoints.length} points. Elevation gain: ${Math.floor(stats.elevation)}m`,
    });
    Alert.alert('Activity Saved!', `Great job! You've completed your ${getActivityLabel(selectedActivityType).toLowerCase()} activity.`, [{ text: 'OK', onPress: () => router.back() }]);
  };

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };
  const toRad = (value: number): number => value * Math.PI / 180;

  const calculateCalories = (distance: number, duration: number): number => {
    const met = selectedActivityType === 'running' ? 9.8 : selectedActivityType === 'cycling' ? 7.5 : selectedActivityType === 'walking' ? 3.8 : 6.0;
    const hours = duration / 3600;
    const weight = 70;
    return met * weight * hours;
  };

  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const getActivityLabel = (type: ActivityType): string => {
    const labels: Record<ActivityType, string> = {
      walking: 'Walking',
      running: 'Running',
      swimming: 'Swimming',
      cycling: 'Cycling',
      dance: 'Dance',
      zumba: 'Zumba',
      martial_arts: 'Martial Arts',
      strength_training: 'Strength Training',
      pilates: 'Pilates',
      tai_chi: 'Tai Chi',
      yoga: 'Yoga',
      hiking: 'Hiking',
      other: 'Other',
    };
    return labels[type];
  };

  const activityTypes: ActivityType[] = ['walking', 'running', 'cycling', 'hiking'];

  if (!MapView || !Marker || !Polyline) {
    return (
      <View style={[styles.container, { alignItems: 'center', justifyContent: 'center' }]}>
        <Text style={styles.webMapText}>Loading map...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container} testID="activity-map-native">
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
        initialRegion={{
          latitude: currentLocation?.coords.latitude ?? 37.78825,
          longitude: currentLocation?.coords.longitude ?? -122.4324,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}
        showsUserLocation
        showsMyLocationButton={false}
        showsCompass
        followsUserLocation={trackingStatus === 'tracking'}
      >
        {routePoints.length > 1 && (
          <Polyline
            coordinates={routePoints.map((p) => ({ latitude: p.latitude, longitude: p.longitude }))}
            strokeColor={Colors.primary}
            strokeWidth={4}
            lineCap="round"
            lineJoin="round"
          />
        )}

        {routePoints.length > 0 && (
          <>
            <Marker
              coordinate={{
                latitude: routePoints[0].latitude,
                longitude: routePoints[0].longitude,
              }}
              anchor={{ x: 0.5, y: 0.5 }}
            >
              <View style={styles.startMarker}>
                <Text style={styles.markerText}>S</Text>
              </View>
            </Marker>

            {trackingStatus !== 'idle' && (
              <Marker
                coordinate={{
                  latitude: routePoints[routePoints.length - 1].latitude,
                  longitude: routePoints[routePoints.length - 1].longitude,
                }}
                anchor={{ x: 0.5, y: 0.5 }}
              >
                <View style={styles.endMarker}>
                  <View style={styles.pulseOuter} />
                  <View style={styles.pulseInner} />
                </View>
              </Marker>
            )}
          </>
        )}
      </MapView>

      <View style={[styles.header, { paddingTop: insets.top + 10 }]}> 
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()} activeOpacity={0.7} testID="back-button">
          <ChevronLeft size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Track Activity</Text>
        <View style={{ width: 40 }} />
      </View>

      {trackingStatus === 'idle' && (
        <View style={styles.activitySelector}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.activityScrollContent}>
            {activityTypes.map((type) => (
              <TouchableOpacity
                key={type}
                style={[styles.activityTypeButton, selectedActivityType === type && styles.activityTypeButtonActive]}
                onPress={() => setSelectedActivityType(type)}
                activeOpacity={0.7}
                testID={`activity-type-${type}`}
              >
                <Text style={[styles.activityTypeText, selectedActivityType === type && styles.activityTypeTextActive]}>
                  {getActivityLabel(type)}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      <View style={[styles.statsPanel, { paddingBottom: insets.bottom + 20 }]} testID="stats-panel">
        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <MapPin size={20} color={Colors.blue} />
            <Text style={styles.statValue}>{stats.distance.toFixed(2)}</Text>
            <Text style={styles.statLabel}>km</Text>
          </View>

          <View style={styles.statItem}>
            <Clock size={20} color={Colors.green} />
            <Text style={styles.statValue}>{formatDuration(stats.duration)}</Text>
            <Text style={styles.statLabel}>Duration</Text>
          </View>

          <View style={styles.statItem}>
            <Mountain size={20} color={Colors.orange} />
            <Text style={styles.statValue}>{Math.floor(stats.elevation)}</Text>
            <Text style={styles.statLabel}>Elevation (m)</Text>
          </View>

          <View style={styles.statItem}>
            <Zap size={20} color={Colors.red} />
            <Text style={styles.statValue}>{Math.floor(stats.calories)}</Text>
            <Text style={styles.statLabel}>kcal</Text>
          </View>
        </View>

        {stats.avgSpeed > 0 && (
          <View style={styles.speedContainer}>
            <TrendingUp size={16} color={Colors.cyan} />
            <Text style={styles.speedText}>Avg Speed: {stats.avgSpeed.toFixed(1)} km/h</Text>
          </View>
        )}

        <View style={styles.controls}>
          {trackingStatus === 'idle' && (
            <TouchableOpacity style={styles.startButton} onPress={startTracking} activeOpacity={0.8} testID="start-tracking">
              <LinearGradient colors={[Colors.primary, Colors.purple]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.buttonGradient}>
                <Play size={28} color={Colors.white} fill={Colors.white} />
                <Text style={styles.buttonText}>Start Tracking</Text>
              </LinearGradient>
            </TouchableOpacity>
          )}

          {trackingStatus === 'tracking' && (
            <View style={styles.trackingControls}>
              <TouchableOpacity style={styles.pauseButton} onPress={pauseTracking} activeOpacity={0.8} testID="pause-tracking">
                <Pause size={24} color={Colors.white} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.stopButton} onPress={stopTracking} activeOpacity={0.8} testID="stop-tracking">
                <Square size={24} color={Colors.white} fill={Colors.white} />
              </TouchableOpacity>
            </View>
          )}

          {trackingStatus === 'paused' && (
            <View style={styles.trackingControls}>
              <TouchableOpacity style={styles.resumeButton} onPress={resumeTracking} activeOpacity={0.8} testID="resume-tracking">
                <LinearGradient colors={[Colors.green, Colors.cyan]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.buttonGradient}>
                  <Play size={24} color={Colors.white} fill={Colors.white} />
                  <Text style={styles.buttonText}>Resume</Text>
                </LinearGradient>
              </TouchableOpacity>
              <TouchableOpacity style={styles.stopButton} onPress={stopTracking} activeOpacity={0.8} testID="stop-tracking">
                <Square size={24} color={Colors.white} fill={Colors.white} />
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </View>
  );
}

export default function ActivityMapScreen() {
  if (Platform.OS === 'web') {
    return <WebFallback />;
  }
  return <NativeMapView />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  map: {
    width,
    height,
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 10,
    backgroundColor: 'rgba(15, 23, 42, 0.9)',
    zIndex: 10,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  webMapFallback: {
    backgroundColor: Colors.cardBg,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  webMapText: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  webMapSubtext: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.text,
    marginBottom: 4,
  },
  infoText: {
    fontSize: 13,
    color: Colors.textMuted,
  },
  activitySelector: {
    position: 'absolute',
    top: 100,
    left: 0,
    right: 0,
    zIndex: 9,
  },
  activityScrollContent: {
    paddingHorizontal: 20,
    gap: 10,
  },
  activityTypeButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    borderWidth: 2,
    borderColor: Colors.border,
  },
  activityTypeButtonActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  activityTypeText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.textSecondary,
  },
  activityTypeTextActive: {
    color: Colors.white,
  },
  statsPanel: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 20,
    paddingTop: 24,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statItem: {
    alignItems: 'center',
    gap: 4,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: Colors.text,
    marginTop: 4,
  },
  statLabel: {
    fontSize: 11,
    color: Colors.textMuted,
    fontWeight: '500' as const,
  },
  speedContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: Colors.cardBg,
    borderRadius: 12,
    marginBottom: 16,
  },
  speedText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.cyan,
  },
  controls: {
    gap: 12,
  },
  startButton: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    gap: 12,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.white,
  },
  trackingControls: {
    flexDirection: 'row',
    gap: 12,
  },
  pauseButton: {
    flex: 1,
    backgroundColor: Colors.orange,
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resumeButton: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
  },
  stopButton: {
    backgroundColor: Colors.red,
    paddingVertical: 18,
    paddingHorizontal: 24,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  startMarker: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.green,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: Colors.white,
  },
  markerText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.white,
  },
  endMarker: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pulseOuter: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.primary,
    opacity: 0.3,
  },
  pulseInner: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: Colors.primary,
    borderWidth: 3,
    borderColor: Colors.white,
  },
});
