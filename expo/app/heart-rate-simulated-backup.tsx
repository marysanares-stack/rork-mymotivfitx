import { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Platform,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Stack } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Heart, Info } from 'lucide-react-native';
import Colors from '@/constants/colors';

export default function HeartRateScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [isScanning, setIsScanning] = useState(false);
  const [heartRate, setHeartRate] = useState<number | null>(null);
  const [measurements, setMeasurements] = useState<number[]>([]);
  const [scanProgress, setScanProgress] = useState(0);


  const heartbeatScale = useRef(new Animated.Value(1)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const intervalRef = useRef<any | null>(null);
  const timeoutRef = useRef<any | null>(null);
  const animationRef = useRef<any | null>(null);
  const isScanningRef = useRef(isScanning);
  const redValuesRef = useRef<number[]>([]);
  const scanStartTimeRef = useRef<number>(0);
  const frameCountRef = useRef(0);

  useEffect(() => {
    isScanningRef.current = isScanning;
  }, [isScanning]);

  useEffect(() => {
    if (isScanning) {
      animationRef.current = Animated.loop(
        Animated.sequence([
          Animated.timing(heartbeatScale, {
            toValue: 1.2,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(heartbeatScale, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
        ])
      );
      animationRef.current.start();

      progressAnim.setValue(0);
      Animated.timing(progressAnim, {
        toValue: 1,
        duration: 15000,
        useNativeDriver: false,
      }).start();
    } else {
      if (animationRef.current) {
        try {
          animationRef.current.stop();
        } catch {}
        animationRef.current = null;
      }
      heartbeatScale.setValue(1);
      progressAnim.setValue(0);
    }

    return () => {
      if (animationRef.current) {
        try {
          animationRef.current.stop();
        } catch {}
        animationRef.current = null;
      }
    };
  }, [isScanning, heartbeatScale, progressAnim]);

  const startScanning = () => {
    console.log('Starting heart rate scan');
    setIsScanning(true);
    setHeartRate(null);
    setScanProgress(0);
    redValuesRef.current = [];
    scanStartTimeRef.current = Date.now();
    frameCountRef.current = 0;

    intervalRef.current = setInterval(() => {
      if (!isScanningRef.current) {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
        return;
      }
      processFrame(null);
    }, 100);

    timeoutRef.current = setTimeout(() => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      if (isScanningRef.current) {
        stopScanning();
      }
      timeoutRef.current = null;
    }, 15000);
  };

  const stopScanning = () => {
    console.log('Stopping heart rate scan');
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (animationRef.current) {
      try {
        animationRef.current.stop();
      } catch {}
      animationRef.current = null;
    }

    setIsScanning(false);
    setScanProgress(0);

    if (redValuesRef.current.length > 0) {
      const calculatedBPM = calculateHeartRate(redValuesRef.current);
      if (calculatedBPM > 0 && calculatedBPM < 200) {
        setHeartRate(calculatedBPM);
        setMeasurements(prev => [...prev, calculatedBPM]);
        console.log('Heart rate calculated:', calculatedBPM);
      }
    }
    
    redValuesRef.current = [];
    frameCountRef.current = 0;
  };

  const calculateHeartRate = (redValues: number[]): number => {
    if (redValues.length < 30) return 0;

    const mean = redValues.reduce((a, b) => a + b, 0) / redValues.length;
    const normalized = redValues.map(v => v - mean);
    
    let peaks = 0;
    const threshold = Math.max(...normalized) * 0.6;
    
    for (let i = 1; i < normalized.length - 1; i++) {
      if (
        normalized[i] > threshold &&
        normalized[i] > normalized[i - 1] &&
        normalized[i] > normalized[i + 1]
      ) {
        peaks++;
      }
    }

    const scanDuration = (Date.now() - scanStartTimeRef.current) / 1000;
    const bpm = Math.round((peaks / scanDuration) * 60);
    
    console.log('Calculated BPM:', bpm, 'Peaks:', peaks, 'Duration:', scanDuration);
    return bpm;
  };

  const processFrame = (data: any) => {
    if (!isScanning) return;
    
    frameCountRef.current++;
    const now = Date.now();
    const elapsed = (now - scanStartTimeRef.current) / 1000;
    
    setScanProgress(Math.min((elapsed / 15) * 100, 100));

    const simulatedRed = 128 + Math.sin(frameCountRef.current * 0.1) * 20;
    redValuesRef.current.push(simulatedRed);
  };

  if (!permission) {
    return (
      <View style={styles.container}>
        <LinearGradient
          colors={[Colors.background, Colors.surface]}
          style={StyleSheet.absoluteFillObject}
        />
        <Text style={styles.messageText}>Loading...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ title: 'Heart Rate Monitor' }} />
        <LinearGradient
          colors={[Colors.background, Colors.surface]}
          style={StyleSheet.absoluteFillObject}
        />
        
        <View style={styles.permissionContainer}>
          <View style={styles.iconContainer}>
            <Heart size={60} color={Colors.red} />
          </View>
          <Text style={styles.title}>Camera Access Required</Text>
          <Text style={styles.messageText}>
            We need access to your camera to measure your heart rate using photoplethysmography (PPG).
          </Text>
          <TouchableOpacity 
            style={styles.primaryButton}
            onPress={requestPermission}
          >
            <Text style={styles.buttonText}>Grant Permission</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Heart Rate Monitor' }} />
      <LinearGradient
        colors={[Colors.background, Colors.surface]}
        style={StyleSheet.absoluteFillObject}
      />

      <View style={styles.content}>
        <Text style={styles.subtitle}>
          Place your finger over the rear camera and flash
        </Text>
        
        <View style={styles.warningCard}>
          <Info size={16} color={Colors.orange} />
          <Text style={styles.warningText}>
            Note: This feature uses simulated data in Expo Go. Native camera frame access requires a production build.
          </Text>
        </View>

        <View style={styles.cameraContainer}>
          {Platform.OS !== 'web' ? (
            <>
              <CameraView
                style={styles.camera}
                facing="back"
                enableTorch={isScanning}
                onCameraReady={() => console.log('Camera ready')}
              />
              <View style={styles.cameraOverlay}>
                <View style={[styles.fingerPlacement, isScanning && styles.fingerPlacementActive]}>
                  <Text style={styles.fingerText}>Place finger here</Text>
                </View>
              </View>
            </>
          ) : (
            <View style={[styles.camera, styles.webCamera]}>
              <Text style={styles.webCameraText}>
                Camera preview not available on web
              </Text>
              <Text style={styles.webCameraSubtext}>
                Heart rate will be simulated
              </Text>
            </View>
          )}
        </View>

        <View style={styles.statsContainer}>
          <Animated.View 
            style={[
              styles.heartRateCircle,
              { transform: [{ scale: heartbeatScale }] }
            ]}
          >
            <LinearGradient
              colors={[Colors.red, Colors.pink]}
              style={styles.heartRateGradient}
            >
              <Heart size={40} color={Colors.white} fill={Colors.white} />
              <Text style={styles.heartRateValue}>
                {heartRate !== null ? heartRate : '--'}
              </Text>
              <Text style={styles.heartRateLabel}>BPM</Text>
            </LinearGradient>
          </Animated.View>

          {isScanning && (
            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <Animated.View 
                  style={[
                    styles.progressFill,
                    {
                      width: progressAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: ['0%', '100%']
                      })
                    }
                  ]}
                />
              </View>
              <Text style={styles.progressText}>
                {Math.round(scanProgress)}% - Keep finger still
              </Text>
            </View>
          )}

          {!isScanning && measurements.length > 0 && (
            <View style={styles.measurementsContainer}>
              <Text style={styles.measurementsTitle}>Recent Measurements</Text>
              <View style={styles.measurementsList}>
                {measurements.slice(-5).reverse().map((bpm, index) => (
                  <View key={index} style={styles.measurementItem}>
                    <Text style={styles.measurementValue}>{bpm} BPM</Text>
                    <Text style={styles.measurementTime}>
                      {new Date().toLocaleTimeString()}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          )}
        </View>

        <TouchableOpacity 
          style={[
            styles.scanButton,
            isScanning && styles.scanButtonActive
          ]}
          onPress={isScanning ? stopScanning : startScanning}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={isScanning 
              ? [Colors.orange, Colors.red] 
              : [Colors.red, Colors.pink]
            }
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.scanButtonGradient}
          >
            <Text style={styles.scanButtonText}>
              {isScanning ? 'Stop Scanning' : 'Start Scanning'}
            </Text>
          </LinearGradient>
        </TouchableOpacity>

        <View style={styles.infoCard}>
          <Info size={16} color={Colors.blue} />
          <Text style={styles.infoText}>
            For best results, ensure your finger completely covers the camera lens and flash.
            Stay still during the 15-second measurement.
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: Colors.red + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 22,
    fontWeight: '700' as const,
    color: Colors.text,
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginBottom: 24,
    textAlign: 'center',
  },
  messageText: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 30,
  },
  cameraContainer: {
    width: '100%',
    height: 200,
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 30,
  },
  camera: {
    width: '100%',
    height: '100%',
  },
  webCamera: {
    backgroundColor: Colors.cardBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  webCameraText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.text,
    marginBottom: 8,
  },
  webCameraSubtext: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  cameraOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fingerPlacement: {
    width: 150,
    height: 150,
    borderRadius: 75,
    borderWidth: 3,
    borderColor: Colors.white,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  fingerPlacementActive: {
    borderColor: Colors.red,
    backgroundColor: 'rgba(255, 100, 100, 0.2)',
  },
  fingerText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.white,
    textAlign: 'center',
  },
  statsContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  heartRateCircle: {
    width: 180,
    height: 180,
    borderRadius: 90,
    marginBottom: 20,
  },
  heartRateGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 90,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heartRateValue: {
    fontSize: 48,
    fontWeight: '700' as const,
    color: Colors.white,
    marginTop: 8,
  },
  heartRateLabel: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.white,
    opacity: 0.9,
  },
  progressContainer: {
    width: '100%',
    alignItems: 'center',
  },
  progressBar: {
    width: '100%',
    height: 8,
    backgroundColor: Colors.surfaceLight,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.red,
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.textSecondary,
  },
  measurementsContainer: {
    width: '100%',
    marginTop: 20,
  },
  measurementsTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.text,
    marginBottom: 12,
  },
  measurementsList: {
    gap: 8,
  },
  measurementItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.cardBg,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  measurementValue: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  measurementTime: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  scanButton: {
    width: '100%',
    height: 56,
    borderRadius: 28,
    overflow: 'hidden',
    marginBottom: 20,
  },
  scanButtonActive: {
    elevation: 8,
    shadowColor: Colors.red,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  scanButtonGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scanButtonText: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.white,
  },
  primaryButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 40,
    paddingVertical: 16,
    borderRadius: 28,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.white,
  },
  warningCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: Colors.orange + '15',
    padding: 12,
    borderRadius: 12,
    gap: 10,
    marginBottom: 20,
  },
  warningText: {
    flex: 1,
    fontSize: 12,
    color: Colors.textSecondary,
    lineHeight: 16,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: Colors.blue + '10',
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
});
