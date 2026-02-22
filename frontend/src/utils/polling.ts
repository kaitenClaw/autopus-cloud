import { useEffect, useState, useCallback } from 'react';

/**
 * A hook for simple HTTP polling that mimics a stream.
 * Useful as a fallback for Socket.io.
 */
export function usePolling<T>(
  fetcher: () => Promise<T[]>,
  intervalMs: number = 2000,
  enabled: boolean = true
) {
  const [data, setData] = useState<T[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const poll = useCallback(async () => {
    try {
      const result = await fetcher();
      setData(result);
      setError(null);
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  }, [fetcher]);

  useEffect(() => {
    if (!enabled) return;

    poll();
    const id = setInterval(poll, intervalMs);
    return () => clearInterval(id);
  }, [poll, intervalMs, enabled]);

  return { data, isLoading, error, refetch: poll };
}

// Global registry for polling tasks to prevent overlapping requests
const pendingTasks: Record<string, Promise<any> | null> = {};
const lastRun: Record<string, number> = {};

export async function runPolledTask<T>(key: string, task: () => Promise<T>): Promise<T> {
  if (pendingTasks[key]) {
    return pendingTasks[key];
  }

  const promise = task().finally(() => {
    pendingTasks[key] = null;
    lastRun[key] = Date.now();
  });

  pendingTasks[key] = promise;
  return promise;
}

export function shouldPoll(key: string, intervalMs: number): boolean {
  const last = lastRun[key] || 0;
  return Date.now() - last > intervalMs;
}
