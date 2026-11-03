import { appStorage } from './storage';

const DEMO_STATE_KEY = 'rumvel_demo_state_v1';

export interface DemoAccount {
  id: string;
  name: string;
  type: string;
  includeInTotal: boolean;
  archived: boolean;
  initialBalance: number;
  initialBalanceDate: string;
  color?: string;
  iconSlug?: string;
}

export interface DemoCategory {
  id: string;
  name: string;
  type: 'EXPENSE' | 'INCOME';
  parentId?: string;
  system?: boolean;
  iconSlug?: string;
  color?: string;
  sortOrder?: number;
}

export interface DemoTag {
  id: string;
  name: string;
  color?: string;
}

export interface DemoTransaction {
  id: string;
  accountId: string;
  destinationAccountId?: string;
  amount: number;
  type: 'EXPENSE' | 'INCOME' | 'TRANSFER';
  date: string;
  description: string;
  paid: boolean;
  categoryId?: string;
  ignoredFromBudget?: boolean;
  ignoredFromReports?: boolean;
  installmentNumber?: number;
  totalInstallments?: number;
  recurringId?: string;
  isRecurring?: boolean;
}

export interface DemoBudget {
  id: string;
  categoryId: string;
  year: number;
  month: number;
  limitAmount: number;
  rolloverType?: string;
  includePending?: boolean;
}

export interface DemoGoal {
  id: string;
  categoryId: string;
  year: number;
  month: number;
  targetAmount: number;
}

interface DemoState {
  accounts: DemoAccount[];
  categories: DemoCategory[];
  tags: DemoTag[];
  transactions: DemoTransaction[];
  budgets: DemoBudget[];
  goals: DemoGoal[];
}

function getDefaultDemoState(): DemoState {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  const ym = `${year}-${String(month).padStart(2, '0')}`;

  return {
    accounts: [
      {
        id: 'acc-nubank',
        name: 'Nubank Conta',
        type: 'CHECKING',
        includeInTotal: true,
        archived: false,
        initialBalance: 4250.0,
        initialBalanceDate: `${ym}-01`,
        color: '#8b5cf6',
      },
      {
        id: 'acc-itau',
        name: 'Itaú Uniclass',
        type: 'CHECKING',
        includeInTotal: true,
        archived: false,
        initialBalance: 8900.0,
        initialBalanceDate: `${ym}-01`,
        color: '#f97316',
      },
      {
        id: 'acc-inter',
        name: 'Reserva CDB Inter',
        type: 'INVESTMENT',
        includeInTotal: true,
        archived: false,
        initialBalance: 18500.0,
        initialBalanceDate: `${ym}-01`,
        color: '#10b981',
      },
      {
        id: 'acc-wallet',
        name: 'Carteira Física',
        type: 'WALLET',
        includeInTotal: true,
        archived: false,
        initialBalance: 320.0,
        initialBalanceDate: `${ym}-01`,
        color: '#64748b',
      },
    ],
    categories: [
      { id: 'cat-moradia', name: 'Moradia', type: 'EXPENSE', system: true, iconSlug: 'home', color: '#6366f1' },
      { id: 'cat-alimentacao', name: 'Alimentação', type: 'EXPENSE', system: true, iconSlug: 'shopping-cart', color: '#10b981' },
      { id: 'cat-transporte', name: 'Transporte', type: 'EXPENSE', system: true, iconSlug: 'car', color: '#0284c7' },
      { id: 'cat-saude', name: 'Saúde', type: 'EXPENSE', system: true, iconSlug: 'heart-pulse', color: '#f43f5e' },
      { id: 'cat-familia', name: 'Família', type: 'EXPENSE', system: true, iconSlug: 'users', color: '#ec4899' },
      { id: 'cat-lazer', name: 'Lazer', type: 'EXPENSE', system: true, iconSlug: 'sparkles', color: '#f59e0b' },
      { id: 'cat-dividas', name: 'Dívidas', type: 'EXPENSE', system: true, iconSlug: 'credit-card', color: '#ef4444' },
      { id: 'cat-reserva', name: 'Reserva de Emergência', type: 'EXPENSE', system: true, iconSlug: 'shield', color: '#14b8a6' },
      { id: 'cat-investimentos', name: 'Investimentos', type: 'EXPENSE', system: true, iconSlug: 'trending-up', color: '#8b5cf6' },
      { id: 'cat-salario', name: 'Salário / Pró-labore', type: 'INCOME', system: true, iconSlug: 'briefcase', color: '#00d494' },
      { id: 'cat-freelance', name: 'Projetos & Consultoria', type: 'INCOME', system: true, iconSlug: 'coins', color: '#10b981' },
      { id: 'cat-rendimentos', name: 'Dividendos & Rendimentos', type: 'INCOME', system: true, iconSlug: 'trending-up', color: '#3b82f6' },
    ],
    tags: [
      { id: 'tag-essencial', name: 'Essencial Blindado', color: '#00d494' },
      { id: 'tag-fixo', name: 'Custo Fixo', color: '#6366f1' },
      { id: 'tag-recorrente', name: 'Assinatura', color: '#f59e0b' },
    ],
    transactions: [
      {
        id: 'tx-1',
        accountId: 'acc-itau',
        amount: 9500.0,
        type: 'INCOME',
        date: `${ym}-05`,
        description: 'Salário Mensal Líquido',
        paid: true,
        categoryId: 'cat-salario',
        isRecurring: true,
      },
      {
        id: 'tx-2',
        accountId: 'acc-nubank',
        amount: 2400.0,
        type: 'INCOME',
        date: `${ym}-12`,
        description: 'Consultoria Arquitetura Cloud',
        paid: true,
        categoryId: 'cat-freelance',
      },
      {
        id: 'tx-3',
        accountId: 'acc-itau',
        amount: 2250.0,
        type: 'EXPENSE',
        date: `${ym}-06`,
        description: 'Aluguel + Condomínio Residencial',
        paid: true,
        categoryId: 'cat-moradia',
        isRecurring: true,
      },
      {
        id: 'tx-4',
        accountId: 'acc-nubank',
        amount: 1180.5,
        type: 'EXPENSE',
        date: `${ym}-08`,
        description: 'Supermercado Atacadista Mensal',
        paid: true,
        categoryId: 'cat-alimentacao',
      },
      {
        id: 'tx-5',
        accountId: 'acc-nubank',
        amount: 460.0,
        type: 'EXPENSE',
        date: `${ym}-10`,
        description: 'Combustível & Tag Pedágio',
        paid: true,
        categoryId: 'cat-transporte',
      },
      {
        id: 'tx-6',
        accountId: 'acc-itau',
        amount: 690.0,
        type: 'EXPENSE',
        date: `${ym}-15`,
        description: 'Plano de Saúde Unimed',
        paid: false,
        categoryId: 'cat-saude',
        isRecurring: true,
      },
      {
        id: 'tx-7',
        accountId: 'acc-nubank',
        amount: 340.0,
        type: 'EXPENSE',
        date: `${ym}-18`,
        description: 'Energia Elétrica + Fibra Óptica',
        paid: false,
        categoryId: 'cat-moradia',
        isRecurring: true,
      },
      {
        id: 'tx-8',
        accountId: 'acc-nubank',
        amount: 390.0,
        type: 'EXPENSE',
        date: `${ym}-20`,
        description: 'Jantar Aniversário & Cinema',
        paid: false,
        categoryId: 'cat-lazer',
      },
      {
        id: 'tx-9',
        accountId: 'acc-inter',
        amount: 1500.0,
        type: 'EXPENSE',
        date: `${ym}-22`,
        description: 'Aporte Mensal Tesouro Selic / CDB',
        paid: false,
        categoryId: 'cat-reserva',
        isRecurring: true,
      },
    ],
    budgets: [
      { id: 'bdg-moradia', categoryId: 'cat-moradia', year, month, limitAmount: 2800 },
      { id: 'bdg-alimentacao', categoryId: 'cat-alimentacao', year, month, limitAmount: 1600 },
      { id: 'bdg-transporte', categoryId: 'cat-transporte', year, month, limitAmount: 800 },
      { id: 'bdg-saude', categoryId: 'cat-saude', year, month, limitAmount: 850 },
      { id: 'bdg-lazer', categoryId: 'cat-lazer', year, month, limitAmount: 950 },
      { id: 'bdg-reserva', categoryId: 'cat-reserva', year, month, limitAmount: 1500 },
    ],
    goals: [
      { id: 'goal-salario', categoryId: 'cat-salario', year, month, targetAmount: 9500 },
      { id: 'goal-freelance', categoryId: 'cat-freelance', year, month, targetAmount: 3500 },
    ],
  };
}

function loadState(): DemoState {
  try {
    const raw = appStorage.getItem(DEMO_STATE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as DemoState;
      if (parsed && Array.isArray(parsed.accounts) && Array.isArray(parsed.transactions)) {
        return parsed;
      }
    }
  } catch {
    // ignore
  }
  const initial = getDefaultDemoState();
  saveState(initial);
  return initial;
}

function saveState(state: DemoState): void {
  appStorage.setItem(DEMO_STATE_KEY, JSON.stringify(state));
}

export function resetDemoState(): void {
  saveState(getDefaultDemoState());
}

function jsonResponse(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

function noContentResponse(): Response {
  return new Response(null, { status: 204 });
}

export async function handleDemoRequest(urlStr: string, init?: RequestInit): Promise<Response> {
  const state = loadState();
  const method = (init?.method ?? 'GET').toUpperCase();
  const parsedUrl = new URL(urlStr, 'http://localhost');
  const path = parsedUrl.pathname.replace(/^\/api\/(finance|auth)/, '');
  const body = init?.body ? JSON.parse(String(init.body)) : {};

  // Auth routes
  if (parsedUrl.pathname.includes('/api/auth')) {
    if (path === '/me') {
      return jsonResponse({
        id: 'demo-user-01',
        name: 'Iury Almeida',
        email: 'iury@rumvel.me',
        role: 'USER',
        status: 'ACTIVE',
      });
    }
    if (path === '/export-data') {
      return jsonResponse({
        exportedAt: new Date().toISOString(),
        user: { id: 'demo-user-01', name: 'Iury Almeida', email: 'iury@rumvel.me' },
        ...state,
      });
    }
    if (path === '/delete-account' || path === '/logout') {
      return noContentResponse();
    }
    return jsonResponse({
      accessToken: 'demo-access-token',
      refreshToken: 'demo-refresh-token',
      user: {
        id: 'demo-user-01',
        name: body?.name || 'Iury Almeida',
        email: body?.email || 'iury@rumvel.me',
        role: 'USER',
        status: 'ACTIVE',
      },
    });
  }

  // Accounts
  if (path === '/accounts' && method === 'GET') {
    const includeArchived = parsedUrl.searchParams.get('includeArchived') === 'true';
    const list = includeArchived ? state.accounts : state.accounts.filter((a) => !a.archived);
    return jsonResponse(list);
  }

  if (path === '/accounts' && method === 'POST') {
    const newAcc: DemoAccount = {
      id: `acc-${Date.now()}`,
      name: body.name || 'Nova Conta',
      type: body.type || 'CHECKING',
      includeInTotal: body.includeInTotal !== false,
      archived: false,
      initialBalance: Number(body.initialBalance) || 0,
      initialBalanceDate: body.initialBalanceDate || new Date().toISOString().slice(0, 10),
      color: body.color,
      iconSlug: body.iconSlug,
    };
    state.accounts.push(newAcc);
    saveState(state);
    return jsonResponse(newAcc, 201);
  }

  const accBalanceMatch = /^\/accounts\/([^/]+)\/balance$/.exec(path);
  if (accBalanceMatch && method === 'GET') {
    const accId = accBalanceMatch[1];
    const acc = state.accounts.find((a) => a.id === accId);
    if (!acc) return jsonResponse({ realized: 0, projected: 0 });

    let realized = Number(acc.initialBalance) || 0;
    let projected = Number(acc.initialBalance) || 0;

    for (const tx of state.transactions) {
      const amt = Math.abs(Number(tx.amount) || 0);
      if (tx.accountId === accId) {
        const delta = tx.type === 'INCOME' ? amt : -amt;
        projected += delta;
        if (tx.paid) realized += delta;
      } else if (tx.type === 'TRANSFER' && tx.destinationAccountId === accId) {
        projected += amt;
        if (tx.paid) realized += amt;
      }
    }
    return jsonResponse({ realized, projected });
  }

  const accArchiveMatch = /^\/accounts\/([^/]+)\/(archive|unarchive)$/.exec(path);
  if (accArchiveMatch && method === 'POST') {
    const [, accId, action] = accArchiveMatch;
    const acc = state.accounts.find((a) => a.id === accId);
    if (acc) {
      acc.archived = action === 'archive';
      saveState(state);
    }
    return noContentResponse();
  }

  const accItemMatch = /^\/accounts\/([^/]+)$/.exec(path);
  if (accItemMatch) {
    const accId = accItemMatch[1];
    if (method === 'PUT') {
      const idx = state.accounts.findIndex((a) => a.id === accId);
      if (idx !== -1) {
        state.accounts[idx] = {
          ...state.accounts[idx],
          name: body.name ?? state.accounts[idx].name,
          type: body.type ?? state.accounts[idx].type,
          initialBalance: body.initialBalance !== undefined ? Number(body.initialBalance) : state.accounts[idx].initialBalance,
          includeInTotal: body.includeInTotal !== undefined ? Boolean(body.includeInTotal) : state.accounts[idx].includeInTotal,
        };
        saveState(state);
        return jsonResponse(state.accounts[idx]);
      }
    }
    if (method === 'DELETE') {
      state.accounts = state.accounts.filter((a) => a.id !== accId);
      state.transactions = state.transactions.filter((t) => t.accountId !== accId);
      saveState(state);
      return noContentResponse();
    }
  }

  // Transactions
  if (path === '/transactions' && method === 'GET') {
    const startDate = parsedUrl.searchParams.get('startDate');
    const endDate = parsedUrl.searchParams.get('endDate');
    const page = Number(parsedUrl.searchParams.get('page') || '0');
    if (page > 0) return jsonResponse([]);
    let list = [...state.transactions];
    if (startDate) list = list.filter((t) => t.date >= startDate);
    if (endDate) list = list.filter((t) => t.date <= endDate);
    list.sort((a, b) => b.date.localeCompare(a.date));
    return jsonResponse(list);
  }

  if ((path === '/transactions' || path === '/transactions/transfers') && method === 'POST') {
    const newTx: DemoTransaction = {
      id: `tx-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      accountId: body.accountId || body.sourceAccountId,
      destinationAccountId: body.destinationAccountId,
      amount: Math.abs(Number(body.amount) || 0),
      type: path.endsWith('/transfers') ? 'TRANSFER' : body.type || 'EXPENSE',
      date: body.date || new Date().toISOString().slice(0, 10),
      description: body.description || 'Lançamento',
      paid: path.endsWith('/transfers') ? true : Boolean(body.paid),
      categoryId: body.categoryId,
      ignoredFromBudget: Boolean(body.ignoredFromBudget),
    };
    state.transactions.unshift(newTx);
    saveState(state);
    return jsonResponse(newTx, 201);
  }

  const txPayMatch = /^\/transactions\/([^/]+)\/(pay|unpay)$/.exec(path);
  if (txPayMatch && method === 'POST') {
    const [, txId, action] = txPayMatch;
    const tx = state.transactions.find((t) => t.id === txId);
    if (tx) {
      tx.paid = action === 'pay';
      saveState(state);
    }
    return noContentResponse();
  }

  const txItemMatch = /^\/transactions\/([^/]+)$/.exec(path);
  if (txItemMatch) {
    const txId = txItemMatch[1];
    if (method === 'PUT') {
      const idx = state.transactions.findIndex((t) => t.id === txId);
      if (idx !== -1) {
        state.transactions[idx] = {
          ...state.transactions[idx],
          amount: body.amount !== undefined ? Math.abs(Number(body.amount)) : state.transactions[idx].amount,
          date: body.date ?? state.transactions[idx].date,
          categoryId: body.categoryId ?? state.transactions[idx].categoryId,
          description: body.description ?? state.transactions[idx].description,
          paid: body.paid !== undefined ? Boolean(body.paid) : state.transactions[idx].paid,
          accountId: body.accountId ?? state.transactions[idx].accountId,
        };
        saveState(state);
        return jsonResponse(state.transactions[idx]);
      }
    }
    if (method === 'DELETE') {
      state.transactions = state.transactions.filter((t) => t.id !== txId);
      saveState(state);
      return noContentResponse();
    }
  }

  // Installments
  if (path === '/installments' && method === 'POST') {
    const count = Math.max(2, Math.min(120, Number(body.count ?? body.totalInstallments) || 2));
    const total = Math.abs(Number(body.totalAmount) || 0);
    const perInstallment = Math.floor((total / count) * 100) / 100;
    const remainder = Math.round((total - perInstallment * count) * 100) / 100;
    const firstDateStr = body.firstDate || body.startDate || new Date().toISOString().slice(0, 10);
    const baseDate = new Date(`${firstDateStr}T12:00:00`);

    for (let i = 0; i < count; i++) {
      const d = new Date(baseDate);
      d.setMonth(d.getMonth() + i);
      const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      state.transactions.push({
        id: `tx-inst-${Date.now()}-${i}`,
        accountId: body.accountId,
        categoryId: body.categoryId,
        amount: i === 0 ? perInstallment + remainder : perInstallment,
        type: 'EXPENSE',
        date: dateStr,
        description: `${body.description} (${i + 1}/${count})`,
        paid: false,
        installmentNumber: i + 1,
        totalInstallments: count,
      });
    }
    saveState(state);
    return jsonResponse({
      id: `grp-${Date.now()}`,
      totalAmount: total,
      totalInstallments: count,
      firstInstallmentDate: body.firstDate,
      description: body.description,
    }, 201);
  }

  // Recurring
  if (path === '/recurring' && method === 'POST') {
    const ruleId = `rec-${Date.now()}`;
    const baseDate = new Date(`${body.startDate || new Date().toISOString().slice(0, 10)}T12:00:00`);
    for (let i = 0; i < 6; i++) {
      const d = new Date(baseDate);
      if (body.frequency === 'WEEKLY') {
        d.setDate(d.getDate() + i * 7);
      } else if (body.frequency === 'YEARLY') {
        d.setFullYear(d.getFullYear() + i);
      } else {
        d.setMonth(d.getMonth() + i);
      }
      const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      state.transactions.push({
        id: `tx-rec-${Date.now()}-${i}`,
        accountId: body.accountId,
        categoryId: body.categoryId,
        amount: Math.abs(Number(body.amount) || 0),
        type: body.type || 'EXPENSE',
        date: dateStr,
        description: body.description,
        paid: false,
        recurringId: ruleId,
        isRecurring: true,
      });
    }
    saveState(state);
    return jsonResponse({ id: ruleId, ...body }, 201);
  }

  // Categories
  if (path === '/categories' && method === 'GET') {
    return jsonResponse(state.categories);
  }
  if (path === '/categories' && method === 'POST') {
    const newCat: DemoCategory = {
      id: `cat-${Date.now()}`,
      name: body.name,
      type: body.type || 'EXPENSE',
      parentId: body.parentId,
      iconSlug: body.iconSlug,
      color: body.color || '#10b981',
    };
    state.categories.push(newCat);
    saveState(state);
    return jsonResponse(newCat, 201);
  }
  const catItemMatch = /^\/categories\/([^/]+)$/.exec(path);
  if (catItemMatch) {
    const catId = catItemMatch[1];
    if (method === 'PUT') {
      const idx = state.categories.findIndex((c) => c.id === catId);
      if (idx !== -1) {
        state.categories[idx] = { ...state.categories[idx], ...body };
        saveState(state);
        return jsonResponse(state.categories[idx]);
      }
    }
    if (method === 'DELETE') {
      state.categories = state.categories.filter((c) => c.id !== catId);
      saveState(state);
      return noContentResponse();
    }
  }

  // Tags
  if (path === '/tags' && method === 'GET') {
    return jsonResponse(state.tags);
  }
  if (path === '/tags' && method === 'POST') {
    const newTag: DemoTag = {
      id: `tag-${Date.now()}`,
      name: body.name,
      color: body.color || '#00d494',
    };
    state.tags.push(newTag);
    saveState(state);
    return jsonResponse(newTag, 201);
  }
  const tagItemMatch = /^\/tags\/([^/]+)$/.exec(path);
  if (tagItemMatch && method === 'DELETE') {
    state.tags = state.tags.filter((t) => t.id !== tagItemMatch[1]);
    saveState(state);
    return noContentResponse();
  }

  // Budgets
  if (path === '/budgets' && method === 'GET') {
    return jsonResponse(state.budgets);
  }
  if (path === '/budgets' && method === 'POST') {
    const newBdg: DemoBudget = {
      id: `bdg-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
      categoryId: body.categoryId,
      year: Number(body.year),
      month: Number(body.month),
      limitAmount: Number(body.limitAmount) || 0,
      rolloverType: body.rolloverType || 'NO_ROLLOVER',
      includePending: body.includePending !== false,
    };
    state.budgets.push(newBdg);
    saveState(state);
    return jsonResponse(newBdg, 201);
  }
  const bdgProgressMatch = /^\/budgets\/([^/]+)\/progress$/.exec(path);
  if (bdgProgressMatch && method === 'GET') {
    const bdg = state.budgets.find((b) => b.id === bdgProgressMatch[1]);
    if (!bdg) {
      return jsonResponse({ spent: 0, available: 0, progress: 0, status: 'ON_TRACK' });
    }
    const ymPrefix = `${bdg.year}-${String(bdg.month).padStart(2, '0')}`;
    const spent = state.transactions
      .filter(
        (t) =>
          t.type === 'EXPENSE' &&
          t.categoryId === bdg.categoryId &&
          t.date.startsWith(ymPrefix) &&
          !t.ignoredFromBudget
      )
      .reduce((sum, t) => sum + Math.abs(Number(t.amount) || 0), 0);
    const limit = Number(bdg.limitAmount) || 1;
    const available = limit - spent;
    const progress = Math.round((spent / limit) * 100);
    const status = progress >= 100 ? 'EXCEEDED' : progress >= 80 ? 'WARNING' : 'ON_TRACK';
    return jsonResponse({ spent, available, progress, status });
  }
  const bdgItemMatch = /^\/budgets\/([^/]+)$/.exec(path);
  if (bdgItemMatch) {
    const bdgId = bdgItemMatch[1];
    if (method === 'PUT') {
      const idx = state.budgets.findIndex((b) => b.id === bdgId);
      if (idx !== -1) {
        state.budgets[idx] = {
          ...state.budgets[idx],
          limitAmount: Number(body.limitAmount) || state.budgets[idx].limitAmount,
        };
        saveState(state);
        return jsonResponse(state.budgets[idx]);
      }
    }
    if (method === 'DELETE') {
      state.budgets = state.budgets.filter((b) => b.id !== bdgId);
      saveState(state);
      return noContentResponse();
    }
  }

  // Income Goals
  if (path === '/income-goals' && method === 'GET') {
    return jsonResponse(state.goals);
  }
  if (path === '/income-goals' && method === 'POST') {
    const newGoal: DemoGoal = {
      id: `goal-${Date.now()}`,
      categoryId: body.categoryId,
      year: Number(body.year),
      month: Number(body.month),
      targetAmount: Number(body.targetAmount) || 0,
    };
    state.goals.push(newGoal);
    saveState(state);
    return jsonResponse(newGoal, 201);
  }
  const goalProgressMatch = /^\/income-goals\/([^/]+)\/progress$/.exec(path);
  if (goalProgressMatch && method === 'GET') {
    const goal = state.goals.find((g) => g.id === goalProgressMatch[1]);
    if (!goal) return jsonResponse({ received: 0, progress: 0 });
    const ymPrefix = `${goal.year}-${String(goal.month).padStart(2, '0')}`;
    const received = state.transactions
      .filter(
        (t) =>
          t.type === 'INCOME' &&
          t.categoryId === goal.categoryId &&
          t.date.startsWith(ymPrefix)
      )
      .reduce((sum, t) => sum + Math.abs(Number(t.amount) || 0), 0);
    const target = Number(goal.targetAmount) || 1;
    const progress = Math.round((received / target) * 100);
    return jsonResponse({ received, progress });
  }
  const goalItemMatch = /^\/income-goals\/([^/]+)$/.exec(path);
  if (goalItemMatch) {
    const goalId = goalItemMatch[1];
    if (method === 'PUT') {
      const idx = state.goals.findIndex((g) => g.id === goalId);
      if (idx !== -1) {
        state.goals[idx] = {
          ...state.goals[idx],
          targetAmount: Number(body.targetAmount) || state.goals[idx].targetAmount,
        };
        saveState(state);
        return jsonResponse(state.goals[idx]);
      }
    }
    if (method === 'DELETE') {
      state.goals = state.goals.filter((g) => g.id !== goalId);
      saveState(state);
      return noContentResponse();
    }
  }

  return jsonResponse({ ok: true });
}
