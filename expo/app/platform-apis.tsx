import { useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Switch,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack, router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  ArrowLeft,
  Apple,
  Smartphone,
  Activity,
  Heart,
  Moon,
  Footprints,
  Flame,
  TrendingUp,
  Download,
  Upload,
  AlertCircle,
  RefreshCw,
} from 'lucide-react-native';
import Colors from '@/constants/colors';
import { useFitness } from '@/contexts/FitnessContext';


type HealthDataType = {
  readonly name: string;
};

type HealthData = {
  value: number;
  startDate: string;
  endDate: string;
  metadata?: Record<string, any>;
};

type QueryHealthDataOptions = {
  dataType: HealthDataType;
  startDate: string;
  endDate: string;
  limit?: number;
};

const createHealthMock = () => ({
  isAvailableAsync: async () => {
    console.log('Health API is mocked for demo purposes');
    return true;
  },
  requestHealthPermissionsAsync: async (readPermissions?: HealthDataType[], writePermissions?: HealthDataType[]) => {
    console.log('Health permissions are mocked for demo purposes', readPermissions, writePermissions);
    return { granted: true };
  },
  getHealthPermissionsAsync: async (readPermissions?: HealthDataType[], writePermissions?: HealthDataType[]) => {
    console.log('Health permissions check is mocked for demo purposes', readPermissions, writePermissions);
    return { granted: false };
  },
  queryHealthDataAsync: async (options: QueryHealthDataOptions) => {
    console.log('Health data query is mocked for demo purposes', options);
    const mockData: HealthData[] = [];
    const count = Math.floor(Math.random() * 20) + 5;
    for (let i = 0; i < count; i++) {
      mockData.push({
        value: Math.floor(Math.random() * 1000) + 100,
        startDate: new Date(Date.now() - i * 60 * 60 * 1000).toISOString(),
        endDate: new Date(Date.now() - i * 60 * 60 * 1000 + 30 * 60 * 1000).toISOString(),
      });
    }
    return mockData;
  },
  writeHealthDataAsync: async () => {
    console.log('Health data write is mocked for demo purposes');
  },
  HealthDataTypes: {
    Steps: { name: 'Steps' },
    HeartRate: { name: 'HeartRate' },
    ActiveEnergyBurned: { name: 'ActiveEnergyBurned' },
    DistanceWalkingRunning: { name: 'DistanceWalkingRunning' },
    SleepAnalysis: { name: 'SleepAnalysis' },
    Workout: { name: 'Workout' },
  },
});

const createHealthWeb = () => ({
  isAvailableAsync: async () => false,
  requestHealthPermissionsAsync: async (readPermissions?: HealthDataType[], writePermissions?: HealthDataType[]) => {
    console.log('Health permissions request (web - not supported)', readPermissions, writePermissions);
    return { granted: false };
  },
  getHealthPermissionsAsync: async (readPermissions?: HealthDataType[], writePermissions?: HealthDataType[]) => {
    console.log('Health permissions check (web - not supported)', readPermissions, writePermissions);
    return { granted: false };
  },
  queryHealthDataAsync: async () => [],
  writeHealthDataAsync: async () => {},
  HealthDataTypes: {
    Steps: { name: 'Steps' },
    HeartRate: { name: 'HeartRate' },
    ActiveEnergyBurned: { name: 'ActiveEnergyBurned' },
    DistanceWalkingRunning: { name: 'DistanceWalkingRunning' },
    SleepAnalysis: { name: 'SleepAnalysis' },
    Workout: { name: 'Workout' },
  },
});

const Health = Platform.OS === 'web' ? createHealthWeb() : createHealthMock();

type DataType = {
  id: string;
  name: string;
  description: string;
  icon: ReactNode;
  color: string;
  enabled: boolean;
  syncDirection: 'both' | 'import' | 'export';
  lastSync?: string;
  recordCount?: number;
};

export default function PlatformAPIsScreen() {
  const insets = useSafeAreaInsets();
  const { activities, sleepEntries, getTodayStats } = useFitness();
  const [connected, setConnected] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null);
  const [isHealthAvailable, setIsHealthAvailable] = useState(false);

  const [dataTypes, setDataTypes] = useState<DataType[]>([
    {
      id: 'steps',
      name: 'Steps',
      description: 'Daily step count',
      icon: <Footprints size={20} color={Colors.blue} />,
      color: Colors.blue,
      enabled: true,
      syncDirection: 'both',
      lastSync: '2 hours ago',
      recordCount: 147,
    },
    {
      id: 'heart_rate',
      name: 'Heart Rate',
      description: 'Heart rate measurements',
      icon: <Heart size={20} color={Colors.red} />,
      color: Colors.red,
      enabled: true,
      syncDirection: 'import',
      lastSync: '1 hour ago',
      recordCount: 89,
    },
    {
      id: 'calories',
      name: 'Calories Burned',
      description: 'Active & resting energy',
      icon: <Flame size={20} color={Colors.orange} />,
      color: Colors.orange,
      enabled: true,
      syncDirection: 'both',
      lastSync: '2 hours ago',
      recordCount: 125,
    },
    {
      id: 'workouts',
      name: 'Workouts',
      description: 'Exercise sessions',
      icon: <Activity size={20} color={Colors.green} />,
      color: Colors.green,
      enabled: true,
      syncDirection: 'both',
      lastSync: '3 hours ago',
      recordCount: activities.length,
    },
    {
      id: 'sleep',
      name: 'Sleep Analysis',
      description: 'Sleep duration & quality',
      icon: <Moon size={20} color={Colors.indigo} />,
      color: Colors.indigo,
      enabled: true,
      syncDirection: 'both',
      lastSync: '5 hours ago',
      recordCount: sleepEntries.length,
    },
    {
      id: 'distance',
      name: 'Distance',
      description: 'Walking & running distance',
      icon: <TrendingUp size={20} color={Colors.cyan} />,
      color: Colors.cyan,
      enabled: false,
      syncDirection: 'both',
    },
  ]);

  const platformName = Platform.OS === 'ios' ? 'Apple Health' : Platform.OS === 'android' ? 'Google Fit' : 'Health API';

  useEffect(() => {
    checkHealthAvailability();
  }, []);

  const checkHealthAvailability = async () => {
    if (Platform.OS === 'web') {
      setIsHealthAvailable(false);
      return;
    }

    try {
      const available = await Health.isAvailableAsync();
      setIsHealthAvailable(available);
      console.log('Health API available:', available);

      if (available) {
        const status = await Health.getHealthPermissionsAsync(
          [Health.HealthDataTypes.Steps],
          [Health.HealthDataTypes.Steps]
        );
        if (status.granted) {
          setConnected(true);
        }
      }
    } catch (error) {
      console.error('Error checking health availability:', error);
      setIsHealthAvailable(false);
    }
  };

  const handleConnect = async () => {
    if (Platform.OS === 'web') {
      Alert.alert(
        'Not Available on Web',
        'Platform health APIs are only available on mobile devices. Please run this app on iOS or Android to connect to Apple Health or Google Fit.',
      );
      return;
    }

    if (!isHealthAvailable) {
      Alert.alert(
        'Health API Not Available',
        `${platformName} is not available on this device. Please make sure you have the latest version of ${platformName} installed.`,
      );
      return;
    }

    try {
      const readPermissions = [
        Health.HealthDataTypes.Steps,
        Health.HealthDataTypes.HeartRate,
        Health.HealthDataTypes.ActiveEnergyBurned,
        Health.HealthDataTypes.DistanceWalkingRunning,
        Health.HealthDataTypes.SleepAnalysis,
        Health.HealthDataTypes.Workout,
      ];

      const writePermissions = [
        Health.HealthDataTypes.Steps,
        Health.HealthDataTypes.ActiveEnergyBurned,
        Health.HealthDataTypes.DistanceWalkingRunning,
        Health.HealthDataTypes.SleepAnalysis,
        Health.HealthDataTypes.Workout,
      ];

      console.log('Requesting health permissions...');
      const { granted } = await Health.requestHealthPermissionsAsync(
        readPermissions,
        writePermissions
      );

      if (granted) {
        setConnected(true);
        setLastSyncTime(new Date().toISOString());
        Alert.alert(
          'Connected!',
          `Successfully connected to ${platformName}. Data sync enabled.`,
        );
        handleSync();
      } else {
        Alert.alert(
          'Permission Denied',
          `Unable to connect to ${platformName}. Please grant the necessary permissions in your device settings.`,
        );
      }
    } catch (error) {
      console.error('Error connecting to health platform:', error);
      Alert.alert(
        'Connection Error',
        `Failed to connect to ${platformName}. Please try again later.`,
      );
    }
  };

  const handleDisconnect = () => {
    Alert.alert(
      `Disconnect from ${platformName}`,
      'This will stop syncing data with your health platform.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Disconnect',
          style: 'destructive',
          onPress: () => {
            setConnected(false);
            setLastSyncTime(null);
            console.log(`Disconnected from ${platformName}`);
          },
        },
      ],
    );
  };

  const handleSync = async () => {
    if (!connected) {
      Alert.alert('Not Connected', `Please connect to ${platformName} first.`);
      return;
    }

    if (Platform.OS === 'web') {
      return;
    }

    setSyncing(true);
    console.log('Starting manual sync...');

    try {
      const now = new Date();
      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());

      const stepsData = await Health.queryHealthDataAsync({
        dataType: Health.HealthDataTypes.Steps,
        startDate: startOfDay.toISOString(),
        endDate: now.toISOString(),
      });
      console.log('Steps data:', stepsData);

      const heartRateData = await Health.queryHealthDataAsync({
        dataType: Health.HealthDataTypes.HeartRate,
        startDate: startOfDay.toISOString(),
        endDate: now.toISOString(),
      });
      console.log('Heart rate data:', heartRateData);

      const caloriesData = await Health.queryHealthDataAsync({
        dataType: Health.HealthDataTypes.ActiveEnergyBurned,
        startDate: startOfDay.toISOString(),
        endDate: now.toISOString(),
      });
      console.log('Calories data:', caloriesData);

      const workoutData = await Health.queryHealthDataAsync({
        dataType: Health.HealthDataTypes.Workout,
        startDate: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        endDate: now.toISOString(),
      });
      console.log('Workout data:', workoutData);

      const sleepData = await Health.queryHealthDataAsync({
        dataType: Health.HealthDataTypes.SleepAnalysis,
        startDate: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        endDate: now.toISOString(),
      });
      console.log('Sleep data:', sleepData);

      const totalSteps = stepsData.reduce((sum: number, entry: any) => sum + (entry.value || 0), 0);
      const totalCalories = caloriesData.reduce((sum: number, entry: any) => sum + (entry.value || 0), 0);

      setDataTypes(prev =>
        prev.map(dt => {
          if (dt.id === 'steps') {
            return { ...dt, recordCount: stepsData.length, lastSync: 'Just now' };
          }
          if (dt.id === 'heart_rate') {
            return { ...dt, recordCount: heartRateData.length, lastSync: 'Just now' };
          }
          if (dt.id === 'calories') {
            return { ...dt, recordCount: caloriesData.length, lastSync: 'Just now' };
          }
          if (dt.id === 'workouts') {
            return { ...dt, recordCount: workoutData.length, lastSync: 'Just now' };
          }
          if (dt.id === 'sleep') {
            return { ...dt, recordCount: sleepData.length, lastSync: 'Just now' };
          }
          return dt;
        })
      );

      setSyncing(false);
      setLastSyncTime(new Date().toISOString());
      Alert.alert(
        'Sync Complete',
        `Successfully synced data with ${platformName}.\n\nSteps: ${Math.round(totalSteps)}\nCalories: ${Math.round(totalCalories)} kcal\nWorkouts: ${workoutData.length}\nSleep logs: ${sleepData.length}`,
      );
    } catch (error) {
      console.error('Error syncing health data:', error);
      setSyncing(false);
      Alert.alert(
        'Sync Error',
        `Failed to sync data with ${platformName}. Please try again.`,
      );
    }
  };

  const toggleDataType = async (id: string) => {
    if (!connected) {
      Alert.alert('Not Connected', `Please connect to ${platformName} first.`);
      return;
    }

    const dataType = dataTypes.find(dt => dt.id === id);
    if (!dataType) return;

    if (Platform.OS !== 'web' && !dataType.enabled) {
      try {
        const healthDataType = getHealthDataType(id);
        if (healthDataType) {
          const { granted } = await Health.requestHealthPermissionsAsync(
            [healthDataType],
            [healthDataType]
          );
          
          if (!granted) {
            Alert.alert(
              'Permission Required',
              `Please grant permission for ${dataType.name} in ${platformName}.`,
            );
            return;
          }
        }
      } catch (error) {
        console.error('Error requesting permission:', error);
      }
    }

    setDataTypes(prev =>
      prev.map(dt =>
        dt.id === id ? { ...dt, enabled: !dt.enabled } : dt
      )
    );
  };

  const getHealthDataType = (id: string): HealthDataType | null => {
    switch (id) {
      case 'steps':
        return Health.HealthDataTypes.Steps;
      case 'heart_rate':
        return Health.HealthDataTypes.HeartRate;
      case 'calories':
        return Health.HealthDataTypes.ActiveEnergyBurned;
      case 'workouts':
        return Health.HealthDataTypes.Workout;
      case 'sleep':
        return Health.HealthDataTypes.SleepAnalysis;
      case 'distance':
        return Health.HealthDataTypes.DistanceWalkingRunning;
      default:
        return null;
    }
  };

  const getStatusColor = () => {
    if (!connected) return Colors.textMuted;
    if (syncing) return Colors.orange;
    return Colors.green;
  };

  const getStatusText = () => {
    if (!connected) return 'Not Connected';
    if (syncing) return 'Syncing...';
    return 'Connected';
  };

  const formatSyncTime = (isoString: string | null) => {
    if (!isoString) return 'Never';
    const date = new Date(isoString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  };

  const todayStats = getTodayStats();
  const totalDataPoints = dataTypes.reduce((sum, dt) => sum + (dt.recordCount || 0), 0);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Stack.Screen options={{ headerShown: false }} />
      
      <LinearGradient
        colors={[Colors.background, Colors.surface]}
        style={StyleSheet.absoluteFillObject}
      />

      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
          activeOpacity={0.7}
        >
          <ArrowLeft size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Platform Integration</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.platformCard}>
          <LinearGradient
            colors={
              Platform.OS === 'ios'
                ? [Colors.red, Colors.pink]
                : [Colors.blue, Colors.cyan]
            }
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.platformGradient}
          >
            <View style={styles.platformHeader}>
              <View style={styles.platformIconWrapper}>
                {Platform.OS === 'ios' ? (
                  <Apple size={32} color={Colors.white} />
                ) : (
                  <Smartphone size={32} color={Colors.white} />
                )}
              </View>
              <View style={styles.platformInfo}>
                <Text style={styles.platformName}>{platformName}</Text>
                <View style={styles.statusRow}>
                  <View
                    style={[
                      styles.statusDot,
                      { backgroundColor: getStatusColor() },
                    ]}
                  />
                  <Text style={styles.statusText}>{getStatusText()}</Text>
                </View>
              </View>
            </View>

            {connected && (
              <View style={styles.syncInfo}>
                <View style={styles.syncInfoRow}>
                  <Text style={styles.syncLabel}>Last Sync:</Text>
                  <Text style={styles.syncValue}>
                    {formatSyncTime(lastSyncTime)}
                  </Text>
                </View>
                <View style={styles.syncInfoRow}>
                  <Text style={styles.syncLabel}>Data Points:</Text>
                  <Text style={styles.syncValue}>{totalDataPoints}</Text>
                </View>
              </View>
            )}

            {!connected ? (
              <TouchableOpacity
                style={styles.connectButton}
                onPress={handleConnect}
                activeOpacity={0.8}
              >
                <Text style={styles.connectButtonText}>Connect Now</Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.connectedActions}>
                <TouchableOpacity
                  style={[styles.actionButton, styles.syncButton]}
                  onPress={handleSync}
                  disabled={syncing}
                  activeOpacity={0.8}
                >
                  <RefreshCw
                    size={18}
                    color={Colors.white}
                    style={syncing ? styles.spinning : undefined}
                  />
                  <Text style={styles.actionButtonText}>
                    {syncing ? 'Syncing...' : 'Sync Now'}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionButton, styles.disconnectButton]}
                  onPress={handleDisconnect}
                  activeOpacity={0.8}
                >
                  <Text style={styles.disconnectButtonText}>Disconnect</Text>
                </TouchableOpacity>
              </View>
            )}
          </LinearGradient>
        </View>

        {Platform.OS === 'web' && (
          <View style={styles.warningCard}>
            <AlertCircle size={20} color={Colors.orange} />
            <Text style={styles.warningText}>
              Health API integration is only available on iOS and Android devices.
              Run this app on a mobile device to access platform integrations.
            </Text>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Data Types</Text>
          <Text style={styles.sectionDescription}>
            Choose which data to sync with {platformName}
          </Text>

          <View style={styles.dataTypesList}>
            {dataTypes.map((dataType) => (
              <View key={dataType.id} style={styles.dataTypeCard}>
                <View style={styles.dataTypeHeader}>
                  <View
                    style={[
                      styles.dataTypeIcon,
                      { backgroundColor: dataType.color + '20' },
                    ]}
                  >
                    {dataType.icon}
                  </View>
                  <View style={styles.dataTypeInfo}>
                    <Text style={styles.dataTypeName}>{dataType.name}</Text>
                    <Text style={styles.dataTypeDescription}>
                      {dataType.description}
                    </Text>
                  </View>
                  <Switch
                    value={dataType.enabled}
                    onValueChange={() => toggleDataType(dataType.id)}
                    trackColor={{
                      false: Colors.surfaceLight,
                      true: dataType.color,
                    }}
                    thumbColor={Colors.white}
                    disabled={!connected}
                  />
                </View>

                {dataType.enabled && connected && (
                  <View style={styles.dataTypeDetails}>
                    <View style={styles.detailRow}>
                      <View style={styles.syncDirection}>
                        {dataType.syncDirection === 'both' && (
                          <>
                            <Download size={14} color={Colors.textSecondary} />
                            <Upload size={14} color={Colors.textSecondary} />
                            <Text style={styles.syncDirectionText}>
                              Two-way sync
                            </Text>
                          </>
                        )}
                        {dataType.syncDirection === 'import' && (
                          <>
                            <Download size={14} color={Colors.textSecondary} />
                            <Text style={styles.syncDirectionText}>Import only</Text>
                          </>
                        )}
                        {dataType.syncDirection === 'export' && (
                          <>
                            <Upload size={14} color={Colors.textSecondary} />
                            <Text style={styles.syncDirectionText}>Export only</Text>
                          </>
                        )}
                      </View>
                    </View>
                    {dataType.lastSync && (
                      <Text style={styles.lastSyncText}>
                        Last synced: {dataType.lastSync}
                      </Text>
                    )}
                    {dataType.recordCount !== undefined && (
                      <Text style={styles.recordCountText}>
                        {dataType.recordCount} records
                      </Text>
                    )}
                  </View>
                )}
              </View>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Current Stats</Text>
          <Text style={styles.sectionDescription}>
            Your fitness data that can be synced
          </Text>

          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <View style={[styles.statIcon, { backgroundColor: Colors.blue + '20' }]}>
                <Footprints size={20} color={Colors.blue} />
              </View>
              <Text style={styles.statValue}>{todayStats.steps}</Text>
              <Text style={styles.statLabel}>Steps Today</Text>
            </View>

            <View style={styles.statCard}>
              <View style={[styles.statIcon, { backgroundColor: Colors.orange + '20' }]}>
                <Flame size={20} color={Colors.orange} />
              </View>
              <Text style={styles.statValue}>{todayStats.calories}</Text>
              <Text style={styles.statLabel}>Calories</Text>
            </View>

            <View style={styles.statCard}>
              <View style={[styles.statIcon, { backgroundColor: Colors.green + '20' }]}>
                <Activity size={20} color={Colors.green} />
              </View>
              <Text style={styles.statValue}>{activities.length}</Text>
              <Text style={styles.statLabel}>Workouts</Text>
            </View>

            <View style={styles.statCard}>
              <View style={[styles.statIcon, { backgroundColor: Colors.indigo + '20' }]}>
                <Moon size={20} color={Colors.indigo} />
              </View>
              <Text style={styles.statValue}>{sleepEntries.length}</Text>
              <Text style={styles.statLabel}>Sleep Logs</Text>
            </View>
          </View>
        </View>

        <View style={styles.infoSection}>
          <Text style={styles.infoTitle}>About Platform Integration</Text>
          <Text style={styles.infoText}>
            {Platform.OS === 'ios' && (
              'Apple Health integration allows this app to read and write health data securely. All data stays on your device and is protected by iOS security features.'
            )}
            {Platform.OS === 'android' && (
              'Google Fit integration allows this app to read and write fitness data securely. All data is encrypted and protected by Android security features.'
            )}
            {Platform.OS === 'web' && (
              'Platform health APIs are only available on mobile devices. To access Apple Health or Google Fit integration, please run this app on iOS or Android.'
            )}
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  platformCard: {
    borderRadius: 24,
    overflow: 'hidden',
    marginBottom: 24,
    elevation: 4,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  platformGradient: {
    padding: 24,
  },
  platformHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  platformIconWrapper: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  platformInfo: {
    flex: 1,
  },
  platformName: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: Colors.white,
    marginBottom: 6,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 14,
    color: Colors.white,
    opacity: 0.9,
  },
  syncInfo: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    gap: 8,
  },
  syncInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  syncLabel: {
    fontSize: 14,
    color: Colors.white,
    opacity: 0.8,
  },
  syncValue: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.white,
  },
  connectButton: {
    backgroundColor: Colors.white,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  connectButtonText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.primary,
  },
  connectedActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  syncButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
  },
  disconnectButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.white,
  },
  disconnectButtonText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.white,
  },
  spinning: {
    transform: [{ rotate: '180deg' }],
  },
  warningCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: Colors.orange + '15',
    padding: 16,
    borderRadius: 16,
    marginBottom: 24,
    gap: 12,
    borderWidth: 1,
    borderColor: Colors.orange + '30',
  },
  warningText: {
    flex: 1,
    fontSize: 14,
    color: Colors.text,
    lineHeight: 20,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: Colors.text,
    marginBottom: 6,
  },
  sectionDescription: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 16,
  },
  dataTypesList: {
    gap: 12,
  },
  dataTypeCard: {
    backgroundColor: Colors.cardBg,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  dataTypeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dataTypeIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  dataTypeInfo: {
    flex: 1,
  },
  dataTypeName: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.text,
    marginBottom: 2,
  },
  dataTypeDescription: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  dataTypeDetails: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    gap: 6,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  syncDirection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  syncDirectionText: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  lastSyncText: {
    fontSize: 12,
    color: Colors.textMuted,
  },
  recordCountText: {
    fontSize: 12,
    color: Colors.textMuted,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: Colors.cardBg,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: Colors.text,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  infoSection: {
    backgroundColor: Colors.cardBg,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.text,
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
});
