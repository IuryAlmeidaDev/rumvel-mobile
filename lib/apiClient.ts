import { handleDemoRequest } from './demoBackend';
import { appStorage } from './storage';

export const REFRESH_TOKEN_STORAGE_KEY = 'rumvel_refresh_token';
export const DEMO_MODE_STORAGE_KEY = 'rumvel_demo_mode';

const rawBaseUrl = (process.env.EXPO_PUBLIC_API_BASE_URL ?? 'https://rumvel.me').replace(/\/+$/, '');

export const authApiBaseUrl = (
  process.env.EXPO_PUBLIC_AUTH_API_URL ?? `${rawBaseUrl}/api/auth`
).replace(/\/+$/, '');

export const financeApiBaseUrl = (
  process.env.EXPO_PUBLIC_FINANCE_API_URL ?? `${rawBaseUrl}/api/finance`
).replace(/\/+$/, '');

export const gaApiBaseUrl = (
  process.env.EXPO_PUBLIC_GA_API_URL ?? `${rawBaseUrl}/api/ai`
).replace(/\/+$/, '');

let inMemoryAccessToken: string | null = null;

export function isDemoMode(): boolean {
  return appStorage.getItem(DEMO_MODE_STORAGE_KEY) === 'true';
}

export function setDemoMode(enabled: boolean): void {
  if (enabled) {
    appStorage.setItem(DEMO_MODE_STORAGE_KEY, 'true');
    setAuthSession('demo-access-token', 'demo-refresh-token');
  } else {
    appStorage.removeItem(DEMO_MODE_STORAGE_KEY);
  }
}

export function getAccessToken(): string | null {
  return inMemoryAccessToken;
}

export function getRefreshToken(): string | null {
  try {
    return appStorage.getItem(REFRESH_TOKEN_STORAGE_KEY);
  } catch {
    return null;
  }
}

export function setAuthSession(
  accessToken: string | null,
  refreshToken?: string | null
): void {
  inMemoryAccessToken = accessToken;

  try {
    if (typeof refreshToken === 'string') {
      appStorage.setItem(REFRESH_TOKEN_STORAGE_KEY, refreshToken);
    } else if (refreshToken === null) {
      appStorage.removeItem(REFRESH_TOKEN_STORAGE_KEY);
    }
  } catch (error) {
    console.error('Erro ao sincronizar refresh token:', error);
  }
}

export function clearAuthSession(): void {
  inMemoryAccessToken = null;
  try {
    appStorage.removeItem(REFRESH_TOKEN_STORAGE_KEY);
    appStorage.removeItem(DEMO_MODE_STORAGE_KEY);
  } catch (error) {
    console.error('Erro ao remover refresh token:', error);
  }
}

type AuthFailureListener = () => void;
const authFailureListeners = new Set<AuthFailureListener>();

export function onAuthFailure(listener: AuthFailureListener): () => void {
  authFailureListeners.add(listener);
  return () => {
    authFailureListeners.delete(listener);
  };
}

function notifyAuthFailure(): void {
  authFailureListeners.forEach((listener) => {
    try {
      listener();
    } catch (err) {
      console.error('Erro ao notificar logout listener:', err);
    }
  });
}

let isRefreshing = false;
type QueueItem = {
  resolve: (token: string) => void;
  reject: (err: unknown) => void;
};
let refreshQueue: QueueItem[] = [];

function enqueueRefreshRequest(): Promise<string> {
  return new Promise((resolve, reject) => {
    refreshQueue.push({ resolve, reject });
  });
}

function processRefreshQueue(token: string): void {
  refreshQueue.forEach((subscriber) => subscriber.resolve(token));
  refreshQueue = [];
}

function rejectRefreshQueue(error: unknown): void {
  refreshQueue.forEach((subscriber) => subscriber.reject(error));
  refreshQueue = [];
}

function getRequestUrl(input: RequestInfo | URL): string {
  if (typeof input === 'string') return input;
  if (input instanceof URL) return input.toString();
  return input.url;
}

function isAuthRoute(url: string): boolean {
  const lower = url.toLowerCase();
  return (
    lower.includes('/api/auth/login') ||
    lower.includes('/api/auth/refresh') ||
    lower.includes('/api/auth/register') ||
    lower.includes('/api/auth/verify-email') ||
    lower.includes('/api/auth/resend-code')
  );
}

async function performRefresh(): Promise<string | null> {
  if (isDemoMode()) {
    setAuthSession('demo-access-token', 'demo-refresh-token');
    return 'demo-access-token';
  }

  const currentRefreshToken = getRefreshToken();
  if (!currentRefreshToken) {
    clearAuthSession();
    notifyAuthFailure();
    return null;
  }

  try {
    const response = await fetch(`${authApiBaseUrl}/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refreshToken: currentRefreshToken }),
    });

    if (!response.ok) {
      clearAuthSession();
      notifyAuthFailure();
      return null;
    }

    const data = await response.json();
    const newAccessToken = data.accessToken;
    const newRefreshToken = data.refreshToken ?? currentRefreshToken;

    setAuthSession(newAccessToken, newRefreshToken);
    return newAccessToken;
  } catch {
    clearAuthSession();
    notifyAuthFailure();
    return null;
  }
}

export async function secureFetch(
  input: RequestInfo | URL,
  init?: RequestInit
): Promise<Response> {
  const url = getRequestUrl(input);

  if (isDemoMode()) {
    return handleDemoRequest(url, init);
  }

  const token = getAccessToken();
  const headers = new Headers(init?.headers);
  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(input, {
    ...init,
    headers,
  });

  if (response.status === 401 && !isAuthRoute(url)) {
    if (isRefreshing) {
      try {
        const newToken = await enqueueRefreshRequest();
        const retryHeaders = new Headers(init?.headers);
        retryHeaders.set('Authorization', `Bearer ${newToken}`);
        return await fetch(input, { ...init, headers: retryHeaders });
      } catch {
        return response;
      }
    }

    isRefreshing = true;

    try {
      const refreshedToken = await performRefresh();

      if (refreshedToken) {
        processRefreshQueue(refreshedToken);
        const retryHeaders = new Headers(init?.headers);
        retryHeaders.set('Authorization', `Bearer ${refreshedToken}`);
        return await fetch(input, { ...init, headers: retryHeaders });
      } else {
        rejectRefreshQueue(new Error('Falha ao atualizar token'));
        return response;
      }
    } catch (err) {
      rejectRefreshQueue(err);
      return response;
    } finally {
      isRefreshing = false;
    }
  }

  return response;
}

export function _resetClientStateForTesting(): void {
  inMemoryAccessToken = null;
  isRefreshing = false;
  refreshQueue = [];
  authFailureListeners.clear();
}
