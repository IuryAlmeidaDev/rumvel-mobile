import AsyncStorage from '@react-native-async-storage/async-storage';

const memoryStore = new Map<string, string>();

const PERSISTED_KEYS = [
  'rumvel_refresh_token',
  'rumvel_demo_mode',
  'rumvel_theme',
  'rumvel_private_mode',
  'rumvel_market_indicators_cache',
  'rumvel:recurring-rules',
  'rumvel_demo_state_v1',
];

function getLocalStorage(): Storage | null {
  try {
    if (typeof globalThis !== 'undefined' && 'localStorage' in globalThis && globalThis.localStorage) {
      return globalThis.localStorage;
    }
  } catch {
    // ignore
  }
  return null;
}

export async function hydrateStorage(extraKeys: string[] = []): Promise<void> {
  const keysToLoad = Array.from(new Set([...PERSISTED_KEYS, ...extraKeys]));
  try {
    await Promise.all(
      keysToLoad.map(async (key) => {
        const val = await AsyncStorage.getItem(key);
        if (val != null) {
          memoryStore.set(key, val);
        }
      })
    );
  } catch {
    // Fallback to localStorage if AsyncStorage is unavailable in test/web env
    const ls = getLocalStorage();
    if (ls) {
      for (const key of keysToLoad) {
        const val = ls.getItem(key);
        if (val != null) {
          memoryStore.set(key, val);
        }
      }
    }
  }
}

export const initAppStorage = hydrateStorage;

export const appStorage = {
  getItem(key: string): string | null {
    if (memoryStore.has(key)) {
      return memoryStore.get(key) ?? null;
    }
    const ls = getLocalStorage();
    if (ls) {
      try {
        const val = ls.getItem(key);
        if (val != null) {
          memoryStore.set(key, val);
          return val;
        }
      } catch {
        // ignore
      }
    }
    return null;
  },

  setItem(key: string, value: string): void {
    memoryStore.set(key, value);
    const ls = getLocalStorage();
    if (ls) {
      try {
        ls.setItem(key, value);
      } catch {
        // ignore
      }
    }
    void AsyncStorage.setItem(key, value).catch(() => {});
  },

  removeItem(key: string): void {
    memoryStore.delete(key);
    const ls = getLocalStorage();
    if (ls) {
      try {
        ls.removeItem(key);
      } catch {
        // ignore
      }
    }
    void AsyncStorage.removeItem(key).catch(() => {});
  },

  clear(): void {
    memoryStore.clear();
    const ls = getLocalStorage();
    if (ls) {
      try {
        ls.clear();
      } catch {
        // ignore
      }
    }
    void AsyncStorage.clear().catch(() => {});
  },
};
