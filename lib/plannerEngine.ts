import { gaApiBaseUrl, isDemoMode } from './apiClient';
import {
  listBudgets,
  listCategories,
  saveFinance,
  type ApiBudget,
  type FinanceCategory,
} from './financeApi';

export type EmploymentType =
  | 'CLT'
  | 'PJ'
  | 'PUBLIC_SERVANT'
  | 'TEMPORARY_CONTRACT'
  | 'STUDENT'
  | 'OTHER';

export type HousingType = 'RENT' | 'MORTGAGE' | 'OWNED' | 'FAMILY_SHARED';

export type DebtLevel = 'NONE' | 'MODERATE' | 'CRITICAL';

export type InvestmentAmbition = 'LIGHT' | 'BALANCED' | 'AGGRESSIVE';

export type RiskTolerance = 'CONSERVATIVE' | 'MODERATE' | 'AGGRESSIVE';

export type PlanningMode = 'BALANCED' | 'DEBT_PAYOFF';
export type FinancialStatus = 'FEASIBLE' | 'DEFICIT';
export type AllocationKind = 'PROTECTED' | 'ADJUSTABLE';
export type AlertSeverity = 'INFO' | 'WARNING' | 'CRITICAL';

export interface RecommendationAlert {
  code: string;
  severity: AlertSeverity;
  title: string;
  message: string;
  action?: 'ENABLE_DEBT_PAYOFF';
}

export interface DetailedExpenses {
  paysRent: boolean;
  rentAmount: number;
  paysCondo: boolean;
  condoAmount: number;
  paysElectricity: boolean;
  electricityAmount: number;
  paysWater: boolean;
  waterAmount: number;
  paysGas: boolean;
  gasAmount: number;
  paysInternet: boolean;
  internetAmount: number;
  paysMobilePlan: boolean;
  mobilePlanAmount: number;
  paysGroceries: boolean;
  groceriesAmount: number;
  paysTransport: boolean;
  transportAmount: number;
  paysHealth: boolean;
  healthAmount: number;
}

export interface FinancialQuestionnaire {
  hasIncome: boolean;
  monthlyNetIncome: number;
  employmentType: EmploymentType;
  age: number;
  housingType: HousingType;
  housingCost: number;
  hasChildren?: boolean;
  residentDependents?: number;
  dependents?: number;
  paysAlimony: boolean;
  alimonyAmount: number;
  debtLevel: DebtLevel;
  monthlyDebtPayment: number;
  investmentAmbition: InvestmentAmbition;
  riskTolerance: RiskTolerance;
  detailedExpenses?: DetailedExpenses;
  hasRecurringExtraIncome?: boolean;
  recurringExtraIncomeAmount?: number;
  canGenerateExtraIncome?: boolean;
  planningMode?: PlanningMode;
}

export type BucketKey =
  | 'housing'
  | 'food'
  | 'transport'
  | 'health'
  | 'family'
  | 'lifestyle'
  | 'debt'
  | 'emergency'
  | 'investments';

export interface AllocationBucket {
  key: BucketKey;
  name: string;
  categoryName: string;
  percentage: number;
  amount: number;
  description: string;
  color: string;
  protectedAmount: number;
  optimizedAmount: number;
  kind: AllocationKind;
  reason: string;
  tip: string;
}

export interface PlannerRecommendation {
  version?: number;
  ruleName: string;
  strategySummary: string;
  allocations: AllocationBucket[];
  summary: {
    monthlyIncome: number;
    essentialExpenses: number;
    lifestyleExpenses: number;
    debtAndSavings: number;
    emergencyTargetMonths: number;
    emergencyTargetAmount: number;
    reliableIncome: number;
    protectedObligations: number;
    flexibleBalance: number;
    deficit: number;
  };
  strategicNotes: string[];
  planningMode: PlanningMode;
  financialStatus: FinancialStatus;
  alerts: RecommendationAlert[];
}

export const BUCKET_METADATA: Record<
  BucketKey,
  { name: string; categoryName: string; color: string }
> = {
  housing: {
    name: 'Moradia & Habitação',
    categoryName: 'Moradia',
    color: '#6366f1',
  },
  food: {
    name: 'Alimentação Essencial',
    categoryName: 'Alimentação',
    color: '#10b981',
  },
  transport: {
    name: 'Transporte & Mobilidade',
    categoryName: 'Transporte',
    color: '#0284c7',
  },
  health: {
    name: 'Saúde & Bem-Estar',
    categoryName: 'Saúde',
    color: '#f43f5e',
  },
  family: {
    name: 'Família & Dependentes',
    categoryName: 'Família',
    color: '#ec4899',
  },
  lifestyle: {
    name: 'Lazer & Vida Pessoal',
    categoryName: 'Lazer',
    color: '#f59e0b',
  },
  debt: {
    name: 'Quitação de Dívidas',
    categoryName: 'Dívidas',
    color: '#ef4444',
  },
  emergency: {
    name: 'Reserva de Emergência',
    categoryName: 'Reserva de Emergência',
    color: '#14b8a6',
  },
  investments: {
    name: 'Investimentos & Futuro',
    categoryName: 'Investimentos',
    color: '#8b5cf6',
  },
};

export function calculateAllocations(input: FinancialQuestionnaire): PlannerRecommendation {
  const income = Math.max(0, input.monthlyNetIncome || 0);

  if (!input.hasIncome || income <= 0) {
    return createZeroIncomeRecommendation(input);
  }

  let housingShare = 0.25;
  let protectedHousing = 0;
  if (input.detailedExpenses) {
    const rawHousingCost =
      (input.detailedExpenses.paysRent ? input.detailedExpenses.rentAmount : 0) +
      (input.detailedExpenses.paysCondo ? input.detailedExpenses.condoAmount : 0) +
      (input.detailedExpenses.paysElectricity ? input.detailedExpenses.electricityAmount : 0) +
      (input.detailedExpenses.paysWater ? input.detailedExpenses.waterAmount : 0) +
      (input.detailedExpenses.paysGas ? input.detailedExpenses.gasAmount : 0) +
      (input.detailedExpenses.paysInternet ? input.detailedExpenses.internetAmount : 0) +
      (input.detailedExpenses.paysMobilePlan ? input.detailedExpenses.mobilePlanAmount : 0);
    protectedHousing = rawHousingCost;
    const minFloor =
      input.housingType === 'OWNED' || input.housingType === 'FAMILY_SHARED' ? 0.02 : 0.12;
    housingShare = Math.min(0.45, Math.max(minFloor, rawHousingCost / income));
  } else if (input.housingType === 'RENT' || input.housingType === 'MORTGAGE') {
    protectedHousing = input.housingCost || 0;
    const costRatio = input.housingCost / income;
    housingShare = Math.min(0.4, Math.max(0.2, costRatio));
  } else if (input.housingType === 'OWNED') {
    protectedHousing = input.housingCost || 0;
    const costRatio = (input.housingCost || income * 0.1) / income;
    housingShare = Math.min(0.2, Math.max(0.02, costRatio));
  } else if (input.housingType === 'FAMILY_SHARED') {
    protectedHousing = input.housingCost || 0;
    const costRatio = (input.housingCost || income * 0.05) / income;
    housingShare = Math.min(0.15, Math.max(0.02, costRatio));
  }

  const residentDependents = Math.max(0, input.residentDependents ?? input.dependents ?? 0);
  let foodShare = 0.15 + residentDependents * 0.04;
  let protectedFood = 0;
  if (
    input.detailedExpenses &&
    input.detailedExpenses.paysGroceries &&
    input.detailedExpenses.groceriesAmount > 0
  ) {
    protectedFood = input.detailedExpenses.groceriesAmount;
    foodShare = Math.min(0.4, input.detailedExpenses.groceriesAmount / income);
  } else {
    foodShare = Math.min(0.3, foodShare);
  }

  let transportShare = 0.1;
  let protectedTransport = 0;
  if (
    input.detailedExpenses &&
    input.detailedExpenses.paysTransport &&
    input.detailedExpenses.transportAmount > 0
  ) {
    protectedTransport = input.detailedExpenses.transportAmount;
    transportShare = Math.min(0.2, input.detailedExpenses.transportAmount / income);
  }

  let healthShare = 0.07 + residentDependents * 0.02;
  let protectedHealth = 0;
  if (input.age > 50) healthShare += 0.03;
  if (
    input.detailedExpenses &&
    input.detailedExpenses.paysHealth &&
    input.detailedExpenses.healthAmount > 0
  ) {
    protectedHealth = input.detailedExpenses.healthAmount;
    healthShare = Math.min(0.2, input.detailedExpenses.healthAmount / income);
  }

  let familyShare = 0;
  let protectedFamily = 0;
  if (input.paysAlimony && input.alimonyAmount > 0) {
    protectedFamily = input.alimonyAmount;
    const alimonyRatio = input.alimonyAmount / income;
    familyShare = Math.min(0.55, Math.max(0.05, alimonyRatio));
    if (residentDependents > 0) {
      familyShare += Math.min(0.1, residentDependents * 0.02);
    }
  } else if (residentDependents > 0) {
    familyShare = Math.min(0.2, residentDependents * 0.04);
  }

  let debtShare = 0;
  if (input.debtLevel === 'CRITICAL') {
    const userPaymentRatio = (input.monthlyDebtPayment || 0) / income;
    debtShare = Math.min(0.35, Math.max(0.22, userPaymentRatio));
  } else if (input.debtLevel === 'MODERATE') {
    const userPaymentRatio = (input.monthlyDebtPayment || 0) / income;
    debtShare = Math.min(0.2, Math.max(0.1, userPaymentRatio));
  }

  let emergencyMonthsTarget = 6;
  if (input.employmentType === 'PJ' || input.employmentType === 'OTHER') {
    emergencyMonthsTarget = 8;
  } else if (input.employmentType === 'TEMPORARY_CONTRACT') {
    emergencyMonthsTarget = 7;
  } else if (input.employmentType === 'CLT') {
    emergencyMonthsTarget = 5;
  } else if (input.employmentType === 'PUBLIC_SERVANT') {
    emergencyMonthsTarget = 3;
  } else if (input.employmentType === 'STUDENT') {
    emergencyMonthsTarget = 4;
  }

  let emergencyShare = 0.1;
  let investmentShare = 0.15;

  if (input.investmentAmbition === 'LIGHT') {
    investmentShare = 0.08;
    emergencyShare = 0.12;
  } else if (input.investmentAmbition === 'BALANCED') {
    investmentShare = 0.15;
    emergencyShare = 0.1;
  } else if (input.investmentAmbition === 'AGGRESSIVE') {
    investmentShare = 0.25;
    emergencyShare = 0.08;
  }

  if (input.debtLevel === 'CRITICAL' || input.planningMode === 'DEBT_PAYOFF') {
    investmentShare = Math.min(0.05, investmentShare);
    emergencyShare = 0.05;
    if (debtShare > 0) debtShare += 0.08;
  }

  const lifestyleShare = 0.15;

  const rawShares: Record<BucketKey, number> = {
    housing: housingShare,
    food: foodShare,
    transport: transportShare,
    health: healthShare,
    family: familyShare,
    lifestyle: lifestyleShare,
    debt: debtShare,
    emergency: emergencyShare,
    investments: investmentShare,
  };

  const totalWeight = Object.values(rawShares).reduce((acc, val) => acc + val, 0);
  const keys = Object.keys(rawShares) as BucketKey[];
  const normalizedPercentages: Record<BucketKey, number> = {} as Record<BucketKey, number>;

  if (totalWeight <= 0) {
    keys.forEach((key) => {
      normalizedPercentages[key] = 0;
    });
  } else {
    const fractions = keys.map((key) => {
      const exact = (rawShares[key] / totalWeight) * 100;
      const integerPart = Math.floor(exact);
      const remainder = exact - integerPart;
      return { key, integerPart, remainder, weight: rawShares[key] };
    });

    const currentSum = fractions.reduce((sum, f) => sum + f.integerPart, 0);
    const toDistribute = Math.round(100 - currentSum);

    fractions.sort((a, b) => b.remainder - a.remainder || b.weight - a.weight);

    for (let i = 0; i < toDistribute && i < fractions.length; i++) {
      fractions[i].integerPart += 1;
    }

    fractions.forEach((f) => {
      normalizedPercentages[f.key] = f.integerPart;
    });
  }

  const protectedByKey: Record<BucketKey, number> = {
    housing: protectedHousing,
    food: protectedFood,
    transport: protectedTransport,
    health: protectedHealth,
    family: protectedFamily,
    lifestyle: 0,
    debt: input.monthlyDebtPayment || 0,
    emergency: 0,
    investments: 0,
  };

  const allocations: AllocationBucket[] = keys.map((key) => {
    const meta = BUCKET_METADATA[key];
    const pct = normalizedPercentages[key];
    const amount = Math.round((pct / 100) * income);
    const prot = protectedByKey[key];

    let desc = '';
    switch (key) {
      case 'housing':
        desc =
          input.housingType === 'RENT'
            ? 'Cobre aluguel e utilidades essenciais da residência.'
            : input.housingType === 'MORTGAGE'
              ? 'Parcela do financiamento imobiliário e manutenção.'
              : 'Custos fixos de condomínio, taxas e manutenção residencial.';
        break;
      case 'food':
        desc =
          residentDependents > 0
            ? `Alimentação e compras de supermercado para você e ${residentDependents} dependente(s).`
            : 'Supermercado e feira essenciais para o mês.';
        break;
      case 'transport':
        desc = 'Combustível, transporte coletivo, aplicativos e manutenção.';
        break;
      case 'health':
        desc = 'Plano de saúde, farmácia, cuidados médicos e prevenção.';
        break;
      case 'family':
        desc =
          input.paysAlimony && input.alimonyAmount > 0
            ? `Pensão alimentícia (${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(input.alimonyAmount)}) e assistência direta aos dependentes.`
            : residentDependents > 0
              ? `Assistência, educação e suporte para ${residentDependents} dependente(s) da família.`
              : 'Suporte familiar e dependentes.';
        break;
      case 'lifestyle':
        desc = 'Momentos de lazer, restaurantes, hobbies e compras pessoais.';
        break;
      case 'debt':
        desc =
          debtShare > 0
            ? 'Aporte prioritário para abater parcelas e zerar juros caros.'
            : 'Sem necessidade de alocação no momento (livre de dívidas).';
        break;
      case 'emergency':
        desc = `Foco em construir sua reserva de segurança recomendada (${emergencyMonthsTarget} meses).`;
        break;
      case 'investments':
        desc =
          input.riskTolerance === 'AGGRESSIVE'
            ? 'Multiplicação patrimonial com foco em longo prazo e ativos de risco.'
            : input.riskTolerance === 'CONSERVATIVE'
              ? 'Renda fixa e títulos seguros focados em preservação de capital.'
              : 'Carteira balanceada entre valorização e segurança.';
        break;
    }

    return {
      key,
      name: meta.name,
      categoryName: meta.categoryName,
      percentage: pct,
      amount,
      description: desc,
      color: meta.color,
      protectedAmount: prot,
      optimizedAmount: amount,
      kind: prot > 0 ? 'PROTECTED' : 'ADJUSTABLE',
      reason: desc,
      tip: 'Revise este valor de acordo com sua realidade mensal.',
    };
  });

  const essentialExpenses = allocations
    .filter((a) => ['housing', 'food', 'transport', 'health', 'family'].includes(a.key))
    .reduce((acc, a) => acc + a.amount, 0);

  const lifestyleExpenses = allocations
    .filter((a) => a.key === 'lifestyle')
    .reduce((acc, a) => acc + a.amount, 0);

  const debtAndSavings = allocations
    .filter((a) => ['debt', 'emergency', 'investments'].includes(a.key))
    .reduce((acc, a) => acc + a.amount, 0);

  const emergencyTargetAmount = essentialExpenses * emergencyMonthsTarget;
  const totalProtected = Object.values(protectedByKey).reduce((s, v) => s + v, 0);
  const deficit = Math.max(0, totalProtected - income);

  let ruleName = 'Seu planejamento mensal';
  const notes: string[] = [];

  if (input.debtLevel === 'CRITICAL') {
    ruleName = 'Estratégia Anti-Endividamento Prioritária';
    notes.push(
      'Alocação concentrada na quitação de dívidas de juros altos (efeito bola de neve reverso).'
    );
    notes.push(
      'Investimentos de longo prazo foram temporariamente reduzidos para estancar o custo dos juros.'
    );
  } else if (input.employmentType === 'PJ' || input.employmentType === 'OTHER') {
    ruleName = 'Blindagem Financeira para PJ / Autônomo';
    notes.push(
      'Como você não possui garantias CLT (13º, FGTS), sua reserva de emergência recomendada é de 8 meses de custos essenciais.'
    );
    notes.push('Alocação reforçada para reserva de emergência com liquidez diária.');
  } else if (input.employmentType === 'TEMPORARY_CONTRACT') {
    ruleName = 'Blindagem para Contrato / Processo Seletivo (PSS)';
    notes.push(
      'Sua meta de reserva foi reforçada para 7 meses a fim de assegurar estabilidade financeira entre contratos.'
    );
  } else if (input.employmentType === 'CLT') {
    ruleName = 'Equilíbrio Estruturado para CLT';
    notes.push(
      'Aproveite o 13º salário e férias para reforçar seus aportes de investimentos sem comprometer a renda mensal corrente.'
    );
  } else if (input.employmentType === 'PUBLIC_SERVANT') {
    ruleName = 'Crescimento Patrimonial para Servidor';
    notes.push(
      'Devido à estabilidade de renda, sua reserva de emergência pode ser menor (3 meses), permitindo aportes maiores para o longo prazo.'
    );
  }

  if (input.paysAlimony && input.alimonyAmount > 0) {
    notes.push(
      `Pensão alimentícia de ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(input.alimonyAmount)} mensal foi garantida como obrigação legal inegociável.`
    );
  }

  if (input.housingCost / income > 0.35) {
    notes.push(
      'Atenção: Seus custos com moradia ultrapassam 35% da sua renda líquida. Vale renegociar despesas acessórias.'
    );
  }

  return {
    version: 2,
    ruleName,
    strategySummary: `Alocação inteligente personalizada para renda mensal de ${new Intl.NumberFormat(
      'pt-BR',
      { style: 'currency', currency: 'BRL' }
    ).format(income)}.`,
    allocations,
    summary: {
      monthlyIncome: income,
      essentialExpenses,
      lifestyleExpenses,
      debtAndSavings,
      emergencyTargetMonths: emergencyMonthsTarget,
      emergencyTargetAmount,
      reliableIncome: income,
      protectedObligations: totalProtected,
      flexibleBalance: Math.max(0, income - totalProtected),
      deficit,
    },
    strategicNotes: notes,
    planningMode: input.planningMode ?? 'BALANCED',
    financialStatus: deficit > 0 ? 'DEFICIT' : 'FEASIBLE',
    alerts:
      deficit > 0
        ? [
            {
              code: 'DEFICIT_DETECTED',
              severity: 'CRITICAL',
              title: 'Compromissos superam a renda declarada',
              message:
                'Suas obrigações protegidas ultrapassam sua renda líquida. Priorize renegociação imediata ou geração de renda extra.',
            },
          ]
        : [],
  };
}

function createZeroIncomeRecommendation(input: FinancialQuestionnaire): PlannerRecommendation {
  const prot = (input.housingCost || 0) + (input.alimonyAmount || 0);
  return {
    version: 2,
    ruleName: 'Plano de Transição & Controle Mínimo',
    strategySummary:
      'Sem renda ativa informada no momento. Foco em redução máxima de custos e busca de fontes de renda.',
    allocations: [
      {
        key: 'housing',
        name: 'Moradia & Habitação',
        categoryName: 'Moradia',
        percentage: 40,
        amount: input.housingCost || 0,
        description: 'Contenção de despesas de moradia e contas básicas.',
        color: '#6366f1',
        protectedAmount: input.housingCost || 0,
        optimizedAmount: 0,
        kind: 'PROTECTED',
        reason: 'O valor de moradia informado foi preservado.',
        tip: 'Priorize moradia e contas básicas.',
      },
      {
        key: 'food',
        name: 'Alimentação Essencial',
        categoryName: 'Alimentação',
        percentage: 30,
        amount: 0,
        description: 'Prioridade absoluta de sobrevivência básica.',
        color: '#10b981',
        protectedAmount: 0,
        optimizedAmount: 0,
        kind: 'ADJUSTABLE',
        reason: 'Sem renda disponível para distribuição orçamentária.',
        tip: 'Busque apoio e fontes reais de renda.',
      },
      {
        key: 'family',
        name: 'Família & Dependentes',
        categoryName: 'Família',
        percentage: input.paysAlimony ? 30 : 0,
        amount: input.alimonyAmount || 0,
        description: 'Compromissos essenciais de família e pensão.',
        color: '#ec4899',
        protectedAmount: input.alimonyAmount || 0,
        optimizedAmount: 0,
        kind: input.paysAlimony ? 'PROTECTED' : 'ADJUSTABLE',
        reason: 'A pensão informada foi preservada.',
        tip: 'Separe a pensão assim que receber renda.',
      },
    ],
    summary: {
      monthlyIncome: 0,
      essentialExpenses: prot,
      lifestyleExpenses: 0,
      debtAndSavings: 0,
      emergencyTargetMonths: 6,
      emergencyTargetAmount: prot * 6,
      reliableIncome: 0,
      protectedObligations: prot,
      flexibleBalance: 0,
      deficit: prot,
    },
    strategicNotes: [
      'Priorize a geração de renda imediata (freelance, recolocação, auxílios).',
      'Evite novas contratações de crédito ou parcelamentos durante este período.',
    ],
    planningMode: input.planningMode ?? 'BALANCED',
    financialStatus: 'DEFICIT',
    alerts: [],
  };
}

export class PlannerApiError extends Error {
  readonly name = 'PlannerApiError';
  constructor(
    public readonly code: 'VALIDATION_ERROR' | 'RECOMMENDATION_UNAVAILABLE',
    message: string
  ) {
    super(message);
  }
}

export async function getAiRecommendation(
  input: FinancialQuestionnaire
): Promise<PlannerRecommendation> {
  if (isDemoMode()) {
    return calculateAllocations(input);
  }

  try {
    const res = await fetch(`${gaApiBaseUrl}/optimize-allocations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    });

    if (res.status === 422) {
      throw new PlannerApiError(
        'VALIDATION_ERROR',
        'Revise os valores informados antes de gerar a recomendação.'
      );
    }

    if (res.ok) {
      const data = await res.json();
      if (data && Array.isArray(data.allocations)) {
        return data as PlannerRecommendation;
      }
    }
  } catch (error) {
    if (error instanceof PlannerApiError && error.code === 'VALIDATION_ERROR') {
      throw error;
    }
    return calculateAllocations(input);
  }

  return calculateAllocations(input);
}

export async function applyRecommendationToBudgets(
  recommendation: PlannerRecommendation,
  categories: FinanceCategory[],
  year: number,
  month: number
): Promise<{ createdCount: number; errors: string[] }> {
  let createdCount = 0;
  const errors: string[] = [];

  let availableCategories = [...categories];
  if (availableCategories.length === 0) {
    try {
      availableCategories = await listCategories();
    } catch {
      // ignore
    }
  }

  let existingBudgets: ApiBudget[] = [];
  try {
    existingBudgets = await listBudgets();
  } catch {
    // ignore
  }

  for (const item of recommendation.allocations) {
    if (item.amount <= 0) continue;

    let category = availableCategories.find(
      (c) =>
        c.type === 'EXPENSE' &&
        c.name.trim().toLowerCase() === item.categoryName.trim().toLowerCase()
    );

    if (!category) {
      try {
        const created = await saveFinance<FinanceCategory>('/categories', {
          name: item.categoryName,
          type: 'EXPENSE',
          color: item.color,
        });
        if (created && created.id) {
          category = created;
          availableCategories.push(created);
        }
      } catch {
        try {
          const refreshed = await listCategories();
          availableCategories = refreshed;
          category = availableCategories.find(
            (c) =>
              c.type === 'EXPENSE' &&
              c.name.trim().toLowerCase() === item.categoryName.trim().toLowerCase()
          );
        } catch {
          // ignore
        }
        if (!category) {
          errors.push(`Não foi possível criar a categoria ${item.categoryName}`);
          continue;
        }
      }
    }

    if (category) {
      const existingBudget = existingBudgets.find(
        (b) =>
          b.categoryId === category.id &&
          Number(b.year) === year &&
          Number(b.month) === month
      );

      try {
        if (existingBudget && existingBudget.id) {
          await saveFinance(
            `/budgets/${existingBudget.id}`,
            {
              limitAmount: item.amount,
              rolloverType: 'NO_ROLLOVER',
              includePending: true,
            },
            'PUT'
          );
        } else {
          await saveFinance('/budgets', {
            categoryId: category.id,
            year,
            month,
            limitAmount: item.amount,
            rolloverType: 'NO_ROLLOVER',
            includePending: true,
          });
        }
        createdCount++;
      } catch {
        errors.push(`Erro ao aplicar orçamento de ${item.name}`);
      }
    }
  }

  return { createdCount, errors };
}
