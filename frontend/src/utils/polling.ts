const inFlight = new Map<string, Promise<unknown>>();
const cooldownUntil = new Map<string, number>();

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const shouldPoll = () => {
  if (typeof document !== 'undefined' && document.visibilityState !== 'visible') return false;
  return localStorage.getItem('autopus_polling_enabled') !== 'false';
};

export const runPolledTask = async <T>(key: string, task: () => Promise<T>): Promise<T | undefined> => {
  if (!shouldPoll()) return;
  const now = Date.now();
  const blockedUntil = cooldownUntil.get(key) || 0;
  if (blockedUntil > now) return;
  if (inFlight.has(key)) return inFlight.get(key) as Promise<T>;

  const runner: Promise<T> = (async (): Promise<T> => {
    let attempts = 0;
    while (attempts < 3) {
      try {
        return await task();
      } catch (error: any) {
        attempts += 1;
        const status = error?.response?.status;
        const retryable = status === 429 || status === 502 || status === 503 || status === 504;
        if (!retryable || attempts >= 3) {
          if (retryable) {
            cooldownUntil.set(key, Date.now() + 30000);
          }
          throw error;
        }
        const delay = 300 * Math.pow(2, attempts - 1) + Math.floor(Math.random() * 120);
        await sleep(delay);
      }
    }
    throw new Error('Polling task failed after retries');
  })()
    .finally(() => inFlight.delete(key));

  inFlight.set(key, runner as Promise<unknown>);
  return runner;
};
