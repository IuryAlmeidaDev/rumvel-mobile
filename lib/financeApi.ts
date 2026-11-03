import { financeApiBaseUrl, secureFetch } from './apiClient';

export type FinanceAccount = {
  id: string;
  name: string;
  includeInTotal: boolean;
  archived: boolean;
  type?: string;
  initialBalance?: number;
  initialBalanceDate?: string;
  realized?: number;
  projected?: number;
  color?: string;
  iconSlug?: string;
};

export type FinanceCategory = {
  id: string;
  name: string;
  type: string;
  parentId?: string;
  system?: boolean;
  iconSlug?: string;
  color?: string;
  sortOrder?: number;
};

export type FinanceGoal = {
  id: string;
  categoryId: string;
  year: number;
  month: number;
  targetAmount: number;
  received: number;
  progress: number;
};

export type FinanceTag = {
  id: string;
  name: string;
  color?: string;
};

export type FinanceTransaction = {
  id: string;
  accountId: string;
  amount: number;
  type: string;
  date: string;
  description: string;
  paid: boolean;
  categoryId?: string;
  destinationAccountId?: string;
  ignoredFromBudget?: boolean;
  ignoredFromReports?: boolean;
  installmentNumber?: number;
  totalInstallments?: number;
  recurringId?: string;
  isRecurring?: boolean;
  recurring?: boolean;
};

export type FinanceBudget = {
  id: string;
  categoryId: string;
  year: number;
  month: number;
  limitAmount: number;
  spent: number;
  available: number;
  progress: number;
  status: string;
};

export type FinanceDashboardData = {
  monthLabel: string;
  realizedBalance: number;
  projectedBalance: number;
  income: number;
  expense: number;
  pendingCount: number;
  transactions: FinanceTransaction[];
  upcoming: FinanceTransaction[];
  budgets: FinanceBudget[];
  accounts?: FinanceAccount[];
  categories?: FinanceCategory[];
  goals?: FinanceGoal[];
  tags?: FinanceTag[];
};

export type ApiBudget = {
  id?: string;
  categoryId: string;
  year: number;
  month: number;
  limitAmount: number | string;
};

export type ApiGoal = {
  id?: string;
  categoryId: string;
  year: number;
  month: number;
  targetAmount: number | string;
};

type BudgetProgress = {
  spent: number | string;
  available: number | string;
  progress: number | string;
  status: string;
};

const genericLoadError = 'Não foi possível carregar seus dados financeiros.';

function numberValue(value: number | string | undefined): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function monthRange(now: Date) {
  const year = now.getFullYear();
  const month = now.getMonth();
  const format = (day: number) =>
    `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  return {
    startDate: format(1),
    endDate: format(new Date(year, month + 1, 0).getDate()),
  };
}

function localDateKey(now: Date) {
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

async function request<T>(path: string, signal?: AbortSignal): Promise<T> {
  const response = await secureFetch(`${financeApiBaseUrl}${path}`, { signal });
  if (!response.ok) throw new Error(genericLoadError);
  return (await response.json()) as T;
}

async function requestSafe<T>(path: string, fallback: T, signal?: AbortSignal): Promise<T> {
  try {
    return await request<T>(path, signal);
  } catch (error: any) {
    if (error?.name === 'AbortError') throw error;
    return fallback;
  }
}

export async function loadFinanceDashboard({
  now = new Date(),
  signal,
  enrich = false,
}: {
  now?: Date;
  signal?: AbortSignal;
  enrich?: boolean;
} = {}): Promise<FinanceDashboardData> {
  const { startDate, endDate } = monthRange(now);
  const [accounts, rawTransactions, rawBudgets] = await Promise.all([
    request<FinanceAccount[]>('/accounts?includeArchived=false', signal),
    request<FinanceTransaction[]>(
      `/transactions?startDate=${startDate}&endDate=${endDate}&size=100`,
      signal
    ),
    requestSafe<ApiBudget[]>('/budgets', [], signal),
  ]);

  const includedAccounts = accounts.filter((account) => account.includeInTotal && !account.archived);
  const currentBudgets = rawBudgets.filter(
    (budget) => budget.year === now.getFullYear() && budget.month === now.getMonth() + 1
  );

  if (rawTransactions.length === 100) {
    const seenIds = new Set<string>(rawTransactions.map((t) => t.id).filter(Boolean));
    for (let page = 1; page <= 50; page++) {
      try {
        const next = await request<FinanceTransaction[]>(
          `/transactions?startDate=${startDate}&endDate=${endDate}&size=100&page=${page}`,
          signal
        );
        if (!Array.isArray(next) || next.length === 0) break;
        if (next.some((t) => t.id && seenIds.has(t.id))) break;
        let addedCount = 0;
        for (const item of next) {
          if (!item.id || !seenIds.has(item.id)) {
            if (item.id) seenIds.add(item.id);
            rawTransactions.push(item);
            addedCount++;
          }
        }
        if (addedCount === 0 || next.length < 100) break;
      } catch {
        break;
      }
    }
  }

  const accountsForBalance = enrich ? accounts : includedAccounts;
  const [balancesResults, progressResults] = await Promise.all([
    Promise.allSettled(
      accountsForBalance.map((account) =>
        requestSafe<{ realized: number | string; projected?: number }>(
          `/accounts/${account.id}/balance`,
          { realized: 0, projected: 0 },
          signal
        )
      )
    ),
    Promise.allSettled(
      currentBudgets.map((budget) =>
        requestSafe<BudgetProgress>(
          `/budgets/${budget.id}/progress`,
          {
            spent: 0,
            available: numberValue(budget.limitAmount),
            progress: 0,
            status: 'ON_TRACK',
          },
          signal
        )
      )
    ),
  ]);

  const balanceMap = new Map<string, { realized: number | string; projected?: number }>();
  accountsForBalance.forEach((account, i) => {
    const res = balancesResults[i];
    balanceMap.set(account.id, res.status === 'fulfilled' ? res.value : { realized: 0, projected: 0 });
  });

  const progressByBudget = progressResults.map((r, index) =>
    r.status === 'fulfilled'
      ? r.value
      : {
          spent: 0,
          available: numberValue(currentBudgets[index]?.limitAmount),
          progress: 0,
          status: 'ON_TRACK' as const,
        }
  );

  const transactions = rawTransactions.map((transaction) => ({
    ...transaction,
    amount: numberValue(transaction.amount),
  }));
  const unpaid = transactions.filter((transaction) => !transaction.paid);

  let extra: Partial<FinanceDashboardData> = {};
  if (enrich) {
    const [categories, goals, tags] = await Promise.all([
      requestSafe<FinanceCategory[]>('/categories?includeArchived=false', [], signal),
      requestSafe<FinanceGoal[]>('/income-goals', [], signal),
      requestSafe<FinanceTag[]>('/tags', [], signal),
    ]);
    const currentGoals = goals.filter(
      (goal) => goal.year === now.getFullYear() && goal.month === now.getMonth() + 1
    );
    const goalProgressResults = await Promise.allSettled(
      currentGoals.map((goal) =>
        requestSafe<{ received: number; progress: number }>(
          `/income-goals/${goal.id}/progress`,
          { received: 0, progress: 0 },
          signal
        )
      )
    );
    const goalProgress = goalProgressResults.map((r) =>
      r.status === 'fulfilled' ? r.value : { received: 0, progress: 0 }
    );
    extra = {
      categories,
      tags,
      accounts: accounts.map((account) => {
        const bal = balanceMap.get(account.id) ?? { realized: 0, projected: 0 };
        return {
          ...account,
          realized: numberValue(bal.realized),
          projected: numberValue(bal.projected),
        };
      }),
      goals: currentGoals.map((goal, index) => ({
        ...goal,
        ...goalProgress[index],
      })),
    };
  }

  const realizedBalance = includedAccounts.reduce(
    (total, account) => total + numberValue(balanceMap.get(account.id)?.realized),
    0
  );
  const projectedBalance = includedAccounts.reduce(
    (total, account) =>
      total + numberValue(balanceMap.get(account.id)?.projected ?? balanceMap.get(account.id)?.realized),
    0
  );

  return {
    ...extra,
    monthLabel: new Intl.DateTimeFormat('pt-BR', {
      month: 'long',
      year: 'numeric',
    }).format(now),
    realizedBalance,
    projectedBalance,
    income: transactions
      .filter((transaction) => transaction.type.toUpperCase() === 'INCOME')
      .reduce((total, transaction) => total + Math.abs(transaction.amount), 0),
    expense: transactions
      .filter((transaction) => transaction.type.toUpperCase() === 'EXPENSE')
      .reduce((total, transaction) => total + Math.abs(transaction.amount), 0),
    pendingCount: unpaid.length,
    transactions,
    upcoming: unpaid
      .filter((transaction) => transaction.date >= localDateKey(now))
      .sort((left, right) => left.date.localeCompare(right.date))
      .slice(0, 6),
    budgets: currentBudgets.map((budget, index) => ({
      ...budget,
      id: budget.id ?? `budget-${index}`,
      limitAmount: numberValue(budget.limitAmount),
      spent: numberValue(progressByBudget[index].spent),
      available: numberValue(progressByBudget[index].available),
      progress: numberValue(progressByBudget[index].progress),
      status: progressByBudget[index].status,
    })),
  };
}

export async function listCategories(): Promise<FinanceCategory[]> {
  try {
    const response = await secureFetch(`${financeApiBaseUrl}/categories?includeArchived=false`);
    if (!response.ok) return [];
    return (await response.json()) as FinanceCategory[];
  } catch {
    return [];
  }
}

export async function listBudgets(): Promise<ApiBudget[]> {
  try {
    const response = await secureFetch(`${financeApiBaseUrl}/budgets`);
    if (!response.ok) return [];
    return (await response.json()) as ApiBudget[];
  } catch {
    return [];
  }
}

export async function listTransactions({
  startDate,
  endDate,
  size = 50,
  signal,
}: {
  startDate?: string;
  endDate?: string;
  size?: number;
  signal?: AbortSignal;
} = {}): Promise<FinanceTransaction[]> {
  const params = new URLSearchParams();
  if (startDate) params.set('startDate', startDate);
  if (endDate) params.set('endDate', endDate);
  if (size) params.set('size', String(size));
  const query = params.toString();
  return requestSafe<FinanceTransaction[]>(
    `/transactions${query ? `?${query}` : ''}`,
    [],
    signal
  );
}

export async function payTransaction(id: string): Promise<void> {
  return saveFinance<void>(`/transactions/${id}/pay`, undefined, 'POST');
}

export async function unpayTransaction(id: string): Promise<void> {
  return saveFinance<void>(`/transactions/${id}/unpay`, undefined, 'POST');
}

export async function saveFinance<T = void>(
  path: string,
  body?: unknown,
  method = 'POST'
): Promise<T> {
  const response = await secureFetch(`${financeApiBaseUrl}${path}`, {
    method,
    headers: body === undefined ? undefined : { 'Content-Type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  if (!response.ok) {
    let errorMsg = 'Não foi possível salvar. Confira os campos e tente novamente.';
    try {
      const errorText = await response.text();
      if (errorText) {
        try {
          const parsed = JSON.parse(errorText);
          if (parsed && typeof parsed === 'object') {
            errorMsg = parsed.message || parsed.error || errorText;
          } else {
            errorMsg = errorText;
          }
        } catch {
          errorMsg = errorText;
        }
      }
    } catch {
      // ignore
    }
    throw new Error(errorMsg);
  }
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    return (await response.json()) as T;
  }
  return undefined as T;
}

export async function updateBudget(id: string, data: Partial<ApiBudget>): Promise<ApiBudget> {
  return saveFinance<ApiBudget>(`/budgets/${id}`, data, 'PUT');
}

export async function deleteBudget(id: string): Promise<void> {
  return saveFinance<void>(`/budgets/${id}`, undefined, 'DELETE');
}

export async function copyBudget(id: string, year: number, month: number): Promise<ApiBudget> {
  return saveFinance<ApiBudget>(`/budgets/${id}/copy`, { year, month }, 'POST');
}

export async function updateGoal(id: string, data: Partial<ApiGoal>): Promise<ApiGoal> {
  return saveFinance<ApiGoal>(`/income-goals/${id}`, data, 'PUT');
}

export async function deleteGoal(id: string): Promise<void> {
  return saveFinance<void>(`/income-goals/${id}`, undefined, 'DELETE');
}

export async function copyGoal(id: string, year: number, month: number): Promise<ApiGoal> {
  return saveFinance<ApiGoal>(`/income-goals/${id}/copy`, { year, month }, 'POST');
}

export async function deleteAccount(id: string): Promise<void> {
  return saveFinance<void>(`/accounts/${id}`, { confirmation: 'EXCLUIR' }, 'DELETE');
}

export async function archiveAccount(id: string, archive: boolean): Promise<void> {
  return saveFinance<void>(
    `/accounts/${id}/${archive ? 'archive' : 'unarchive'}`,
    undefined,
    'POST'
  );
}
