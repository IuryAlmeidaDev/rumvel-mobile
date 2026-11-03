import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@react-native-async-storage/async-storage', () => ({
  default: {
    getItem: vi.fn(async () => null),
    setItem: vi.fn(async () => {}),
    removeItem: vi.fn(async () => {}),
  },
}));
import { isDemoMode, setDemoMode } from '../apiClient';
import { exportUserData, getMe, login } from '../authApi';
import { resetDemoState } from '../demoBackend';
import {
  loadFinanceDashboard,
  payTransaction,
  saveFinance,
  unpayTransaction,
} from '../financeApi';
import {
  formatBrlCurrency,
  formatDateSafe,
  formatFirstAndLastName,
  getInitials,
  parseBrlAmount,
  sanitizeAmountInput,
} from '../formatters';
import {
  applyRecommendationToBudgets,
  calculateAllocations,
  type FinancialQuestionnaire,
} from '../plannerEngine';

describe('Rumvel Mobile MVP - Core Business Logic & API Integration', () => {
  beforeEach(() => {
    setDemoMode(true);
    resetDemoState();
  });

  describe('Formatters & Banking Precision', () => {
    it('parses Brazilian currency strings accurately', () => {
      expect(parseBrlAmount('R$ 1.250,50')).toBe(1250.5);
      expect(parseBrlAmount('9700,00')).toBe(9700);
      expect(parseBrlAmount('45.9')).toBe(45.9);
      expect(parseBrlAmount('')).toBe(0);
    });

    it('masks currency values when Private Mode is enabled', () => {
      expect(formatBrlCurrency(1500, true)).toBe('R$ ••••,••');
      expect(formatBrlCurrency(1500, false)).toContain('1.500,00');
    });

    it('formats user names, initials, and dates safely', () => {
      expect(formatFirstAndLastName('Iury Almeida Dev')).toBe('Iury Dev');
      expect(getInitials('Iury Almeida')).toBe('IA');
      expect(formatDateSafe('2026-10-15')).toContain('15');
      expect(sanitizeAmountInput('R$ 123,45abc')).toBe('123,45');
    });
  });

  describe('AI / Genetic Algorithm Planner Engine (9 Buckets & Hare-Niemeyer)', () => {
    const baseProfile: FinancialQuestionnaire = {
      hasIncome: true,
      monthlyNetIncome: 10000,
      employmentType: 'CLT',
      age: 30,
      housingType: 'RENT',
      housingCost: 2500,
      hasChildren: true,
      residentDependents: 1,
      paysAlimony: true,
      alimonyAmount: 1500,
      debtLevel: 'NONE',
      monthlyDebtPayment: 0,
      investmentAmbition: 'BALANCED',
      riskTolerance: 'MODERATE',
      planningMode: 'BALANCED',
    };

    it('guarantees exact 100% sum across all 9 buckets via Hare-Niemeyer method', () => {
      const rec = calculateAllocations(baseProfile);
      const sumPct = rec.allocations.reduce((acc, b) => acc + b.percentage, 0);
      expect(sumPct).toBe(100);
      expect(rec.financialStatus).toBe('FEASIBLE');
    });

    it('protects alimony and housing floor obligations', () => {
      const rec = calculateAllocations(baseProfile);
      const familyBucket = rec.allocations.find((b) => b.key === 'family');
      const housingBucket = rec.allocations.find((b) => b.key === 'housing');

      expect(familyBucket).toBeDefined();
      expect(familyBucket!.protectedAmount).toBe(1500);
      expect(familyBucket!.kind).toBe('PROTECTED');

      expect(housingBucket).toBeDefined();
      expect(housingBucket!.protectedAmount).toBe(2500);
      expect(housingBucket!.kind).toBe('PROTECTED');
    });

    it('detects DEFICIT when protected obligations exceed reliable monthly income', () => {
      const deficitProfile: FinancialQuestionnaire = {
        ...baseProfile,
        monthlyNetIncome: 3000,
        housingCost: 2500,
        paysAlimony: true,
        alimonyAmount: 1200,
      };
      const rec = calculateAllocations(deficitProfile);
      expect(rec.financialStatus).toBe('DEFICIT');
      expect(rec.alerts.length).toBeGreaterThan(0);
    });

    it('provisions and updates monthly budgets idempotently from AI recommendation', async () => {
      const rec = calculateAllocations(baseProfile);
      const targetYear = new Date().getFullYear();
      const targetMonth = new Date().getMonth() + 1;
      const result = await applyRecommendationToBudgets(rec, [], targetYear, targetMonth);
      expect(result.createdCount).toBeGreaterThan(0);

      const dashboard = await loadFinanceDashboard({ enrich: true });
      expect(dashboard.budgets.length).toBeGreaterThanOrEqual(5);
    });
  });

  describe('Auth, Finance Dashboard, Transactions, Installments & Transfers', () => {
    it('authenticates in Sandbox Demo Mode and retrieves user profile + LGPD export', async () => {
      expect(isDemoMode()).toBe(true);
      const auth = await login({ email: 'demo@rumvel.me', password: '123' });
      expect(auth.accessToken).toBeTruthy();

      const me = await getMe();
      expect(me.email).toBe('iury@rumvel.me');

      const exported = (await exportUserData()) as { exportedAt: string };
      expect(exported.exportedAt).toBeTruthy();
    });

    it('loads consolidated dashboard and supports 1-tap pay/unpay + installments + transfers', async () => {
      const initial = await loadFinanceDashboard({
        enrich: true,
      });

      expect(initial.accounts?.length).toBeGreaterThanOrEqual(3);
      expect(initial.transactions.length).toBeGreaterThan(0);

      const unpaidTx = initial.transactions.find((t) => !t.paid);
      expect(unpaidTx).toBeDefined();

      await payTransaction(unpaidTx!.id);
      const afterPay = await loadFinanceDashboard({});
      const updatedTx = afterPay.transactions.find((t) => t.id === unpaidTx!.id);
      expect(updatedTx?.paid).toBe(true);

      await unpayTransaction(unpaidTx!.id);
      const afterUnpay = await loadFinanceDashboard({});
      expect(afterUnpay.transactions.find((t) => t.id === unpaidTx!.id)?.paid).toBe(false);

      const todayStr = new Date().toISOString().slice(0, 10);

      // Create 3x installment purchase
      const firstAccountId = initial.accounts![0].id;
      const createdInst = await saveFinance<{ totalInstallments: number }>('/installments', {
        accountId: firstAccountId,
        totalAmount: 900,
        totalInstallments: 3,
        startDate: todayStr,
        description: 'Monitor Ultrawide',
      });
      expect(createdInst.totalInstallments).toBe(3);

      // Create atomic transfer between accounts
      const secondAccountId = initial.accounts![1].id;
      await saveFinance('/transactions/transfers', {
        sourceAccountId: firstAccountId,
        destinationAccountId: secondAccountId,
        amount: 500,
        date: todayStr,
        description: 'Aporte Reserva',
      });

      const afterTransfer = await loadFinanceDashboard({ enrich: true });
      expect(
        afterTransfer.transactions.some(
          (t) => t.type === 'TRANSFER' && t.description === 'Aporte Reserva'
        )
      ).toBe(true);
    });
  });
});
