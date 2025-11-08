import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import createContextHook from '@nkzw/create-context-hook';
import { UseQueryResult, useMutation, useQuery } from '@tanstack/react-query';
import { HealthMetric, HealthSample, HealthSource, SleepEntry, SyncJob, SyncStatus, WeightEntry } from '@/types';
import { useFitness } from '@/contexts/FitnessContext';

const STORAGE_KEYS = {
  jobs: 'healthsync:jobs:v1',
  sources: 'healthsync:sources:v1',
  metrics: 'healthsync:authorized_metrics:v1',
} as const;

function genId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export type AuthorizedMetrics = Partial<Record<HealthMetric, boolean>>;

export type HealthSyncContextType = {
  isAvailable: boolean;
  sources: HealthSource[];
  authorized: AuthorizedMetrics;
  jobs: SyncJob[];
  requestPermissions: (metrics: HealthMetric[]) => Promise<AuthorizedMetrics>;
  queuePull: (metrics: HealthMetric[], since?: string, until?: string) => Promise<SyncJob>;
  queuePush: (samples: HealthSample[]) => Promise<SyncJob>;
  startNextJob: () => Promise<void>;
  clearJobs: () => Promise<void>;
  useMetricSummary: (metric: HealthMetric, period: 'today' | 'this_week') => UseQueryResult<{ value: number; unit: string }, Error>;
};

export const [HealthSyncProvider, useHealthSync] = createContextHook<HealthSyncContextType>(() => {
  const fitness = useFitness();
  const [authorized, setAuthorized] = useState<AuthorizedMetrics>({});
  const [sources, setSources] = useState<HealthSource[]>([]);
  const [jobs, setJobs] = useState<SyncJob[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const [rawAuth, rawJobs, rawSources] = await Promise.all([
          AsyncStorage.getItem(STORAGE_KEYS.metrics),
          AsyncStorage.getItem(STORAGE_KEYS.jobs),
          AsyncStorage.getItem(STORAGE_KEYS.sources),
        ]);
        if (rawAuth) setAuthorized(JSON.parse(rawAuth));
        if (rawJobs) setJobs(JSON.parse(rawJobs));
        if (rawSources) setSources(JSON.parse(rawSources));
        else setSources([Platform.OS === 'ios' ? 'apple_health' : Platform.OS === 'android' ? 'google_health_connect' : 'mock']);
      } catch (e) {
        console.log('[HealthSync] failed to init', e);
      }
    })();
  }, []);

  const persist = useCallback(async (nextJobs: SyncJob[]) => {
    setJobs(nextJobs);
    await AsyncStorage.setItem(STORAGE_KEYS.jobs, JSON.stringify(nextJobs));
  }, []);

  const requestPermissions = useCallback(async (metrics: HealthMetric[]): Promise<AuthorizedMetrics> => {
    const next: AuthorizedMetrics = { ...authorized };
    metrics.forEach(m => { next[m] = true; });
    setAuthorized(next);
    await AsyncStorage.setItem(STORAGE_KEYS.metrics, JSON.stringify(next));
    return next;
  }, [authorized]);

  const queuePull = useCallback(async (metrics: HealthMetric[], since?: string, until?: string) => {
    const job: SyncJob = {
      id: genId(),
      direction: 'pull',
      metrics,
      since,
      until,
      createdAt: new Date().toISOString(),
      status: 'pending',
    };
    const next = [job, ...jobs];
    await persist(next);
    return job;
  }, [jobs, persist]);

  const queuePush = useCallback(async (samples: HealthSample[]) => {
    const metrics = Array.from(new Set(samples.map(s => s.metric)));
    const job: SyncJob = {
      id: genId(),
      direction: 'push',
      metrics,
      createdAt: new Date().toISOString(),
      status: 'pending',
    };
    const next = [job, ...jobs];
    await persist(next);
    return job;
  }, [jobs, persist]);

  const runJob = useMutation({
    mutationFn: async (job: SyncJob) => {
      const idx = jobs.findIndex(j => j.id === job.id);
      const updated = [...jobs];
      updated[idx] = { ...job, status: 'running' as SyncStatus };
      await persist(updated);

      try {
        if (job.direction === 'pull') {
          if (Platform.OS === 'web') {
            // mock: derive data from local fitness context
            // no-op, but could map to fitness state
          } else {
            // placeholder for native integrations later
          }
        } else {
          // push from local to store - placeholder
        }
        const done = updated.map(j => j.id === job.id ? { ...j, status: 'success' as SyncStatus } : j);
        await persist(done);
      } catch (e) {
        const errored = updated.map(j => j.id === job.id ? { ...j, status: 'error' as SyncStatus, errorMessage: String(e) } : j);
        await persist(errored);
      }
    },
  });

  const { mutateAsync } = runJob;
  const startNextJob = useCallback(async () => {
    const next = jobs.find(j => j.status === 'pending');
    if (!next) return;
    await mutateAsync(next);
  }, [jobs, mutateAsync]);

  const clearJobs = useCallback(async () => {
    await persist([]);
  }, [persist]);

  const useMetricSummary = useCallback(
    (metric: HealthMetric, period: 'today' | 'this_week') => {
      return useQuery({
        queryKey: ['healthsync', 'summary', metric, period],
        queryFn: async () => {
          const today = fitness.getTodayStats();
          const { start, end } = (() => {
            const e = new Date();
            const s = new Date();
            s.setDate(e.getDate() - 6);
            s.setHours(0,0,0,0);
            return { start: s, end: e };
          })();

          switch (metric) {
            case 'steps': {
              if (period === 'today') return { value: today.steps, unit: 'steps' };
              const total = fitness.activities.filter(a => {
                const t = new Date(a.date).getTime();
                return t >= start.getTime() && t <= end.getTime();
              }).reduce((sum, a) => sum + (a.steps ?? 0), 0);
              return { value: total, unit: 'steps' };
            }
            case 'active_minutes': {
              if (period === 'today') return { value: today.activeMinutes, unit: 'min' };
              const total = fitness.activities.filter(a => {
                const t = new Date(a.date).getTime();
                return t >= start.getTime() && t <= end.getTime();
              }).reduce((sum, a) => sum + a.duration, 0);
              return { value: total, unit: 'min' };
            }
            case 'distance': {
              if (period === 'today') return { value: today.distance, unit: 'mi' };
              const total = fitness.activities.filter(a => {
                const t = new Date(a.date).getTime();
                return t >= start.getTime() && t <= end.getTime();
              }).reduce((sum, a) => sum + (a.distance ?? 0), 0);
              return { value: total, unit: 'mi' };
            }
            case 'weight': {
              const last: WeightEntry | undefined = fitness.weightEntries[fitness.weightEntries.length - 1];
              return { value: last?.weight ?? (fitness.user.weight ?? 0), unit: 'lb' };
            }
            case 'sleep': {
              const last: SleepEntry | null = fitness.getLastSleepEntry();
              return { value: last?.duration ?? 0, unit: 'h' };
            }
            case 'stand_hours':
            case 'mindfulness_minutes':
            case 'floors_climbed':
            case 'heart_rate':
            case 'resting_heart_rate':
            case 'vo2max':
            default:
              return { value: 0, unit: metric === 'mindfulness_minutes' ? 'min' : 'count' };
          }
        },
      });
    },
    [fitness]
  );

  const isAvailable = Platform.OS !== 'web';

  return useMemo<HealthSyncContextType>(() => ({
    isAvailable,
    sources,
    authorized,
    jobs,
    requestPermissions,
    queuePull,
    queuePush,
    startNextJob,
    clearJobs,
    useMetricSummary,
  }), [isAvailable, sources, authorized, jobs, requestPermissions, queuePull, queuePush, startNextJob, clearJobs, useMetricSummary]);
});
