import { useMemo, useState } from 'react';
import type { ReactElement } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, ActivityIndicator, ScrollView } from 'react-native';
import { Stack } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ShieldCheck, RefreshCw, Footprints, Clock, Moon, AlertTriangle, CheckCircle2, ListChecks } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { useHealthSync } from '@/contexts/HealthSyncContext';
import type { HealthMetric } from '@/types';

const METRICS: HealthMetric[] = ['steps', 'active_minutes', 'sleep'];

export default function SyncScreen() {
  const insets = useSafeAreaInsets();
  const { requestPermissions, queuePull, startNextJob, jobs, authorized, useMetricSummary, isAvailable } = useHealthSync();
  const [isRequesting, setIsRequesting] = useState<boolean>(false);
  const [isPulling, setIsPulling] = useState<boolean>(false);

  const stepsSummary = useMetricSummary('steps', 'today');
  const activeSummary = useMetricSummary('active_minutes', 'today');
  const sleepSummary = useMetricSummary('sleep', 'today');

  const allAuthorized = useMemo(() => METRICS.every(m => authorized[m] === true), [authorized]);

  const handleRequest = async () => {
    try {
      setIsRequesting(true);
      await requestPermissions(METRICS);
    } catch (e) {
      console.log('[Sync] Permission request failed', e);
    } finally {
      setIsRequesting(false);
    }
  };

  const handlePull = async () => {
    try {
      setIsPulling(true);
      const since = new Date();
      since.setDate(since.getDate() - 7);
      await queuePull(METRICS, since.toISOString(), new Date().toISOString());
      await startNextJob();
    } catch (e) {
      console.log('[Sync] Pull queue failed', e);
    } finally {
      setIsPulling(false);
    }
  };

  const statusColor = isAvailable ? (allAuthorized ? Colors.green : Colors.orange) : Colors.textMuted;
  const statusText = isAvailable ? (allAuthorized ? 'Ready' : 'Permissions needed') : 'Not available on this platform';

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom, paddingTop: Math.max(0, insets.top / 2) }]}>
      <Stack.Screen options={{ title: 'Health Sync' }} />
      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: Math.max(24, insets.bottom + 16) }]} showsVerticalScrollIndicator={false}>
        <View style={styles.card} testID="syncStatusCard">
          <View style={[styles.statusRow]}> 
            <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
            <Text style={styles.statusText}>{statusText}</Text>
          </View>
          {Platform.OS === 'web' && (
            <View style={styles.warningRow}>
              <AlertTriangle size={16} color={Colors.orange} />
              <Text style={styles.warningText}>Native health sources require iOS/Android. Web uses mock summaries.</Text>
            </View>
          )}

          <View style={styles.actionsRow}>
            <TouchableOpacity
              style={[styles.actionButton, !isAvailable ? styles.btnDisabled : allAuthorized ? styles.btnSecondary : styles.btnPrimary]}
              onPress={handleRequest}
              disabled={!isAvailable || isRequesting || allAuthorized}
              activeOpacity={0.8}
              testID="requestPermissionsBtn"
            >
              {isRequesting ? (
                <ActivityIndicator color={Colors.white} />
              ) : (
                <>
                  <ShieldCheck size={18} color={Colors.white} />
                  <Text style={styles.actionText}>{allAuthorized ? 'Authorized' : 'Request Permissions'}</Text>
                </>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, styles.btnPrimary]}
              onPress={handlePull}
              disabled={!allAuthorized || isPulling}
              activeOpacity={0.8}
              testID="pullNowBtn"
            >
              {isPulling ? (
                <ActivityIndicator color={Colors.white} />
              ) : (
                <>
                  <RefreshCw size={18} color={Colors.white} />
                  <Text style={styles.actionText}>Pull Now</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.grid}>
          <SummaryCard
            renderIcon={() => <Footprints size={22} color={Colors.blue} />}
            title="Steps"
            value={stepsSummary.data?.value ?? 0}
            unit={stepsSummary.data?.unit ?? 'steps'}
            loading={stepsSummary.isLoading}
            testID="stepsSummary"
          />
          <SummaryCard
            renderIcon={() => <Clock size={22} color={Colors.green} />}
            title="Active Minutes"
            value={activeSummary.data?.value ?? 0}
            unit={activeSummary.data?.unit ?? 'min'}
            loading={activeSummary.isLoading}
            testID="activeMinutesSummary"
          />
          <SummaryCard
            renderIcon={() => <Moon size={22} color={Colors.indigo} />}
            title="Sleep"
            value={sleepSummary.data?.value ?? 0}
            unit={sleepSummary.data?.unit ?? 'h'}
            loading={sleepSummary.isLoading}
            testID="sleepSummary"
          />
        </View>

        <View style={styles.card}>
          <View style={styles.jobsHeader}>
            <ListChecks size={18} color={Colors.textSecondary} />
            <Text style={styles.jobsTitle}>Recent Jobs</Text>
          </View>
          {jobs.length === 0 ? (
            <Text style={styles.jobsEmpty}>No sync jobs yet.</Text>
          ) : (
            jobs.slice(0, 5).map(j => (
              <View key={j.id} style={styles.jobRow}>
                <View style={[styles.badge, j.direction === 'pull' ? styles.badgePull : styles.badgePush]}>
                  <Text style={styles.badgeText}>{j.direction.toUpperCase()}</Text>
                </View>
                <Text style={styles.jobText}>{j.metrics.join(', ')} · {new Date(j.createdAt).toLocaleTimeString()}</Text>
                <View style={styles.jobStatus}>
                  {j.status === 'success' && <CheckCircle2 size={16} color={Colors.green} />}
                  {j.status !== 'success' && <Text style={styles.jobStatusText}>{j.status}</Text>}
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
}

function SummaryCard({ renderIcon, title, value, unit, loading, testID }: { renderIcon: () => ReactElement; title: string; value: number; unit: string; loading: boolean; testID: string }) {
  return (
    <View style={styles.summaryCard} testID={testID}>
      <View style={styles.summaryHeader}>
        <View style={styles.summaryIcon}>{renderIcon()}</View>
        <Text style={styles.summaryTitle}>{title}</Text>
      </View>
      {loading ? (
        <ActivityIndicator color={Colors.textSecondary} />
      ) : (
        <Text style={styles.summaryValue}>{Math.round(value)} <Text style={styles.summaryUnit}>{unit}</Text></Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: 16, paddingBottom: 40 },
  card: { backgroundColor: Colors.cardBg, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: Colors.border, marginBottom: 16 },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  statusText: { color: Colors.text, fontSize: 14, fontWeight: '600' as const },
  warningRow: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: Colors.orange + '15', borderColor: Colors.orange + '30', borderWidth: 1, padding: 10, borderRadius: 8, marginTop: 8 },
  warningText: { color: Colors.text, fontSize: 12, flex: 1 },
  actionsRow: { flexDirection: 'row', gap: 12, marginTop: 8 },
  actionButton: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 12, borderRadius: 12 },
  btnPrimary: { backgroundColor: Colors.primary },
  btnSecondary: { backgroundColor: Colors.green },
  btnDisabled: { backgroundColor: Colors.surfaceLight },
  actionText: { color: Colors.white, fontWeight: '700' as const, fontSize: 14 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  summaryCard: { flexBasis: '31%', flexGrow: 1, backgroundColor: Colors.cardBg, borderRadius: 14, padding: 14, borderWidth: 1, borderColor: Colors.border },
  summaryHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  summaryIcon: { width: 34, height: 34, borderRadius: 10, backgroundColor: Colors.surfaceLight, alignItems: 'center', justifyContent: 'center' },
  summaryTitle: { color: Colors.textSecondary, fontWeight: '600' as const, fontSize: 12 },
  summaryValue: { color: Colors.text, fontWeight: '700' as const, fontSize: 20 },
  summaryUnit: { color: Colors.textMuted, fontWeight: '600' as const, fontSize: 12 },
  jobsHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  jobsTitle: { color: Colors.text, fontWeight: '700' as const, fontSize: 14 },
  jobsEmpty: { color: Colors.textSecondary, fontSize: 13 },
  jobRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 8 },
  badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  badgePull: { backgroundColor: Colors.blue + '20' },
  badgePush: { backgroundColor: Colors.purple + '20' },
  badgeText: { color: Colors.text, fontSize: 10, fontWeight: '700' as const },
  jobText: { flex: 1, color: Colors.textSecondary, fontSize: 12 },
  jobStatus: { minWidth: 60, alignItems: 'flex-end' },
  jobStatusText: { color: Colors.textMuted, fontSize: 12 },
});
