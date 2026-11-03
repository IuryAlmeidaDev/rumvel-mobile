import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  clearAuthSession,
  getAccessToken,
  getRefreshToken,
  isDemoMode,
  onAuthFailure,
  setDemoMode,
} from '@/lib/apiClient';
import {
  getMe,
  login as apiLogin,
  logout as apiLogout,
  refreshToken as apiRefreshToken,
  register as apiRegister,
  resendVerificationCode as apiResendVerificationCode,
  verifyEmail as apiVerifyEmail,
  type AuthResponse,
  type LoginDto,
  type RegisterDto,
  type RegisterResponse,
  type User,
} from '@/lib/authApi';
import { resetDemoState } from '@/lib/demoBackend';
import {
  loadFinanceDashboard,
  payTransaction,
  unpayTransaction,
  type FinanceDashboardData,
  type FinanceTransaction,
} from '@/lib/financeApi';
import {
  DEFAULT_FALLBACK_INDICATORS,
  fetchMarketIndicators,
  type MarketIndicator,
} from '@/lib/marketService';
import { appStorage, initAppStorage } from '@/lib/storage';

const USER_STORAGE_KEY = 'rumvel_user_profile';
const PRIVATE_MODE_STORAGE_KEY = 'rumvel_private_mode';

function getCurrentYearMonth(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  return `${y}-${m}`;
}

function shiftYearMonth(ym: string, deltaMonths: number): string {
  const parts = ym.split('-');
  const year = Number(parts[0]) || new Date().getFullYear();
  const monthIndex = (Number(parts[1]) || 1) - 1;
  const date = new Date(year, monthIndex + deltaMonths, 1);
  const nextY = date.getFullYear();
  const nextM = String(date.getMonth() + 1).padStart(2, '0');
  return `${nextY}-${nextM}`;
}

export interface AppContextValue {
  user: User | null;
  isAuthenticated: boolean;
  isLoadingAuth: boolean;
  isDemo: boolean;
  privateMode: boolean;
  togglePrivateMode: () => void;
  month: string;
  setMonth: (month: string) => void;
  prevMonth: () => void;
  nextMonth: () => void;
  dashboardData: FinanceDashboardData | null;
  isLoadingFinance: boolean;
  financeError: string | null;
  refreshFinance: () => Promise<void>;
  optimisticTogglePay: (tx: FinanceTransaction, targetPaid: boolean) => Promise<void>;
  marketIndicators: MarketIndicator[];
  isLoadingMarket: boolean;
  refreshMarket: (force?: boolean) => Promise<void>;
  login: (dto: LoginDto) => Promise<AuthResponse>;
  loginDemo: () => Promise<void>;
  register: (dto: RegisterDto) => Promise<RegisterResponse>;
  verifyEmail: (email: string, code: string) => Promise<AuthResponse>;
  resendVerificationCode: (email: string) => Promise<{ success: boolean; message: string }>;
  logout: () => Promise<void>;
  resetDemoSandbox: () => Promise<void>;
}

const AppContext = createContext<AppContextValue | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState<boolean>(true);
  const [isDemo, setIsDemo] = useState<boolean>(false);
  const [privateMode, setPrivateMode] = useState<boolean>(false);
  const [month, setMonth] = useState<string>(getCurrentYearMonth);

  const [dashboardData, setDashboardData] = useState<FinanceDashboardData | null>(null);
  const [isLoadingFinance, setIsLoadingFinance] = useState<boolean>(false);
  const [financeError, setFinanceError] = useState<string | null>(null);

  const [marketIndicators, setMarketIndicators] = useState<MarketIndicator[]>(
    DEFAULT_FALLBACK_INDICATORS
  );
  const [isLoadingMarket, setIsLoadingMarket] = useState<boolean>(false);

  const persistUser = useCallback((nextUser: User | null) => {
    setUser(nextUser);
    try {
      if (nextUser) {
        appStorage.setItem(USER_STORAGE_KEY, JSON.stringify(nextUser));
      } else {
        appStorage.removeItem(USER_STORAGE_KEY);
      }
    } catch {
      // ignore storage error
    }
  }, []);

  const refreshMarket = useCallback(async (force = false) => {
    setIsLoadingMarket(true);
    try {
      const indicators = await fetchMarketIndicators({ force });
      setMarketIndicators(indicators);
    } catch {
      // fallback already handled in marketService
    } finally {
      setIsLoadingMarket(false);
    }
  }, []);

  const refreshFinance = useCallback(async () => {
    setIsLoadingFinance(true);
    setFinanceError(null);
    try {
      const [yStr, mStr] = month.split('-');
      const yearNum = Number(yStr) || new Date().getFullYear();
      const monthIdx = (Number(mStr) || 1) - 1;
      const targetDate = new Date(yearNum, monthIdx, 15);
      const data = await loadFinanceDashboard({
        now: targetDate,
        enrich: true,
      });
      setDashboardData(data);
    } catch (err) {
      setFinanceError(
        err instanceof Error ? err.message : 'Não foi possível carregar os dados financeiros.'
      );
    } finally {
      setIsLoadingFinance(false);
    }
  }, [month]);

  useEffect(() => {
    let mounted = true;
    const unsubscribe = onAuthFailure(() => {
      if (!mounted) return;
      persistUser(null);
      setDashboardData(null);
      setIsDemo(false);
    });

    async function bootstrap() {
      await initAppStorage();
      if (!mounted) return;

      const savedPrivate = appStorage.getItem(PRIVATE_MODE_STORAGE_KEY) === 'true';
      setPrivateMode(savedPrivate);

      const demoEnabled = isDemoMode();
      setIsDemo(demoEnabled);

      let storedUser: User | null = null;
      const rawUser = appStorage.getItem(USER_STORAGE_KEY);
      if (rawUser) {
        try {
          storedUser = JSON.parse(rawUser) as User;
        } catch {
          storedUser = null;
        }
      }

      if (demoEnabled) {
        setDemoMode(true);
        try {
          const me = await getMe();
          if (mounted) persistUser(me);
        } catch {
          if (mounted && storedUser) persistUser(storedUser);
        } finally {
          if (mounted) setIsLoadingAuth(false);
        }
        return;
      }

      const hasRefresh = Boolean(getRefreshToken());
      const hasAccess = Boolean(getAccessToken());

      if (!hasRefresh && !hasAccess) {
        persistUser(null);
        setIsLoadingAuth(false);
        return;
      }

      if (storedUser) {
        setUser(storedUser);
      }

      try {
        if (!hasAccess && hasRefresh) {
          const refreshed = await apiRefreshToken();
          if (mounted && refreshed?.user) {
            persistUser(refreshed.user);
          }
        }
        const me = await getMe();
        if (mounted) {
          persistUser(me);
        }
      } catch {
        if (!mounted) return;
        clearAuthSession();
        persistUser(null);
      } finally {
        if (mounted) {
          setIsLoadingAuth(false);
        }
      }
    }

    void bootstrap();
    void refreshMarket(false);

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, [persistUser, refreshMarket]);

  useEffect(() => {
    if (user && !isLoadingAuth) {
      void refreshFinance();
    }
  }, [user, isLoadingAuth, month, refreshFinance]);

  const togglePrivateMode = useCallback(() => {
    setPrivateMode((prev) => {
      const next = !prev;
      appStorage.setItem(PRIVATE_MODE_STORAGE_KEY, next ? 'true' : 'false');
      return next;
    });
  }, []);

  const prevMonth = useCallback(() => {
    setMonth((prev) => shiftYearMonth(prev, -1));
  }, []);

  const nextMonth = useCallback(() => {
    setMonth((prev) => shiftYearMonth(prev, 1));
  }, []);

  const login = useCallback(
    async (dto: LoginDto) => {
      setDemoMode(false);
      setIsDemo(false);
      const response = await apiLogin(dto);
      persistUser(response.user);
      return response;
    },
    [persistUser]
  );

  const loginDemo = useCallback(async () => {
    setDemoMode(true);
    setIsDemo(true);
    const response = await apiLogin({
      email: 'demo@rumvel.me',
      password: 'demo-password',
    });
    persistUser(response.user);
  }, [persistUser]);

  const register = useCallback(
    async (dto: RegisterDto) => {
      setDemoMode(false);
      setIsDemo(false);
      const response = await apiRegister(dto);
      if ('accessToken' in response && response.user) {
        persistUser(response.user);
      }
      return response;
    },
    [persistUser]
  );

  const verifyEmail = useCallback(
    async (email: string, code: string) => {
      const response = await apiVerifyEmail(email, code);
      persistUser(response.user);
      return response;
    },
    [persistUser]
  );

  const resendVerificationCode = useCallback(async (email: string) => {
    return apiResendVerificationCode(email);
  }, []);

  const logout = useCallback(async () => {
    await apiLogout();
    setDemoMode(false);
    setIsDemo(false);
    persistUser(null);
    setDashboardData(null);
  }, [persistUser]);

  const resetDemoSandbox = useCallback(async () => {
    resetDemoState();
    await refreshFinance();
  }, [refreshFinance]);

  const optimisticTogglePay = useCallback(
    async (tx: FinanceTransaction, targetPaid: boolean) => {
      const delta = targetPaid ? 1 : -1;
      const amountAbs = Math.abs(tx.amount);
      const isExpense = tx.type.toUpperCase() === 'EXPENSE';
      const isIncome = tx.type.toUpperCase() === 'INCOME';

      setDashboardData((current) => {
        if (!current) return current;
        const nextTransactions = current.transactions.map((item) =>
          item.id === tx.id ? { ...item, paid: targetPaid } : item
        );
        const balanceShift = isIncome
          ? amountAbs * delta
          : isExpense
            ? -amountAbs * delta
            : 0;

        return {
          ...current,
          realizedBalance: current.realizedBalance + balanceShift,
          pendingCount: Math.max(0, current.pendingCount - delta),
          transactions: nextTransactions,
          upcoming: nextTransactions
            .filter((item) => !item.paid)
            .sort((a, b) => a.date.localeCompare(b.date))
            .slice(0, 6),
        };
      });

      try {
        if (targetPaid) {
          await payTransaction(tx.id);
        } else {
          await unpayTransaction(tx.id);
        }
        await refreshFinance();
      } catch (err) {
        await refreshFinance();
        throw err;
      }
    },
    [refreshFinance]
  );

  const value = useMemo<AppContextValue>(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      isLoadingAuth,
      isDemo,
      privateMode,
      togglePrivateMode,
      month,
      setMonth,
      prevMonth,
      nextMonth,
      dashboardData,
      isLoadingFinance,
      financeError,
      refreshFinance,
      optimisticTogglePay,
      marketIndicators,
      isLoadingMarket,
      refreshMarket,
      login,
      loginDemo,
      register,
      verifyEmail,
      resendVerificationCode,
      logout,
      resetDemoSandbox,
    }),
    [
      user,
      isLoadingAuth,
      isDemo,
      privateMode,
      togglePrivateMode,
      month,
      prevMonth,
      nextMonth,
      dashboardData,
      isLoadingFinance,
      financeError,
      refreshFinance,
      optimisticTogglePay,
      marketIndicators,
      isLoadingMarket,
      refreshMarket,
      login,
      loginDemo,
      register,
      verifyEmail,
      resendVerificationCode,
      logout,
      resetDemoSandbox,
    ]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) {
    throw new Error('useApp deve ser usado dentro de um AppProvider');
  }
  return ctx;
}
