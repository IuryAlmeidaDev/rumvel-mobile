import React, { useEffect, useState } from 'react';
import { ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  AlertTriangleIcon,
  CheckCircle2Icon,
  LockIcon,
  ShieldAlertIcon,
  SparklesIcon,
  TrendingUpIcon,
  Wand2Icon,
} from 'lucide-react-native';
import { AppHeader } from '@/components/finance/AppHeader';
import { CategoryBadge } from '@/components/finance/CategoryBadge';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Icon } from '@/components/ui/icon';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Text } from '@/components/ui/text';
import { useApp } from '@/context/AppContext';
import {
  formatBrlCurrency,
  parseBrlAmount,
  sanitizeAmountInput,
  TABULAR_NUMS,
} from '@/lib/formatters';
import {
  applyRecommendationToBudgets,
  getAiRecommendation,
  type AllocationBucket,
  type DebtLevel,
  type EmploymentType,
  type FinancialQuestionnaire,
  type HousingType,
  type InvestmentAmbition,
  type PlannerRecommendation,
  type PlanningMode,
  type RecommendationAlert,
} from '@/lib/plannerEngine';

const EMPLOYMENT_OPTIONS: { value: EmploymentType; label: string }[] = [
  { value: 'CLT', label: 'CLT (Carteira Assinada)' },
  { value: 'PUBLIC_SERVANT', label: 'Servidor Público' },
  { value: 'PJ', label: 'PJ / Autônomo / Empresário' },
  { value: 'TEMPORARY_CONTRACT', label: 'Contrato Temporário' },
  { value: 'STUDENT', label: 'Estudante / Bolsista' },
];

const HOUSING_OPTIONS: { value: HousingType; label: string }[] = [
  { value: 'RENT', label: 'Aluguel' },
  { value: 'MORTGAGE', label: 'Financiamento Imobiliário' },
  { value: 'OWNED', label: 'Imóvel Próprio Quitado' },
  { value: 'FAMILY_SHARED', label: 'Mora com a Família' },
];

export default function PlannerScreen() {
  const { month, privateMode, dashboardData, refreshFinance } = useApp();

  const [activeTab, setActiveTab] = useState<string>('form');

  // Questionnaire inputs
  const [netIncomeInput, setNetIncomeInput] = useState('9700');
  const [extraIncomeInput, setExtraIncomeInput] = useState('0');
  const [employmentType, setEmploymentType] = useState<EmploymentType>('CLT');
  const [ageInput, setAgeInput] = useState('30');
  const [dependentsInput, setDependentsInput] = useState('0');

  const [housingType, setHousingType] = useState<HousingType>('RENT');
  const [housingCostInput, setHousingCostInput] = useState('2450');
  const [groceriesInput, setGroceriesInput] = useState('1100');
  const [transportInput, setTransportInput] = useState('450');
  const [healthInput, setHealthInput] = useState('380');

  const [paysAlimony, setPaysAlimony] = useState(false);
  const [alimonyAmountInput, setAlimonyAmountInput] = useState('0');

  const [debtLevel, setDebtLevel] = useState<DebtLevel>('NONE');
  const [debtPaymentInput, setDebtPaymentInput] = useState('0');

  const [investmentAmbition, setInvestmentAmbition] = useState<InvestmentAmbition>('BALANCED');
  const [planningMode, setPlanningMode] = useState<PlanningMode>('BALANCED');

  // Result state
  const [recommendation, setRecommendation] = useState<PlannerRecommendation | null>(null);
  const [calculating, setCalculating] = useState(false);
  const [applying, setApplying] = useState(false);
  const [applyFeedback, setApplyFeedback] = useState<string | null>(null);

  const buildQuestionnaire = (overrideMode?: PlanningMode): FinancialQuestionnaire => {
    const netIncome = Math.max(0, parseBrlAmount(netIncomeInput));
    const extraIncome = Math.max(0, parseBrlAmount(extraIncomeInput));
    const housingCost = Math.max(0, parseBrlAmount(housingCostInput));
    const groceries = Math.max(0, parseBrlAmount(groceriesInput));
    const transport = Math.max(0, parseBrlAmount(transportInput));
    const health = Math.max(0, parseBrlAmount(healthInput));
    const alimony = paysAlimony ? Math.max(0, parseBrlAmount(alimonyAmountInput)) : 0;
    const debtPayment = debtLevel !== 'NONE' ? Math.max(0, parseBrlAmount(debtPaymentInput)) : 0;
    const deps = Math.max(0, Number(dependentsInput) || 0);

    return {
      hasIncome: netIncome + extraIncome > 0,
      monthlyNetIncome: netIncome,
      hasRecurringExtraIncome: extraIncome > 0,
      recurringExtraIncomeAmount: extraIncome,
      employmentType,
      age: Math.max(18, Math.min(100, Number(ageInput) || 30)),
      housingType,
      housingCost,
      hasChildren: deps > 0,
      residentDependents: deps,
      dependents: deps,
      paysAlimony,
      alimonyAmount: alimony,
      debtLevel,
      monthlyDebtPayment: debtPayment,
      investmentAmbition,
      riskTolerance:
        investmentAmbition === 'AGGRESSIVE'
          ? 'AGGRESSIVE'
          : investmentAmbition === 'LIGHT'
            ? 'CONSERVATIVE'
            : 'MODERATE',
      planningMode: overrideMode ?? planningMode,
      detailedExpenses: {
        paysRent: housingType === 'RENT' || housingType === 'MORTGAGE',
        rentAmount: housingCost,
        paysCondo: false,
        condoAmount: 0,
        paysElectricity: false,
        electricityAmount: 0,
        paysWater: false,
        waterAmount: 0,
        paysGas: false,
        gasAmount: 0,
        paysInternet: false,
        internetAmount: 0,
        paysMobilePlan: false,
        mobilePlanAmount: 0,
        paysGroceries: groceries > 0,
        groceriesAmount: groceries,
        paysTransport: transport > 0,
        transportAmount: transport,
        paysHealth: health > 0,
        healthAmount: health,
      },
    };
  };

  const runOptimization = async (overrideMode?: PlanningMode, switchTab = true) => {
    setCalculating(true);
    setApplyFeedback(null);
    try {
      const q = buildQuestionnaire(overrideMode);
      const res = await getAiRecommendation(q);
      setRecommendation(res);
      if (switchTab) {
        setActiveTab('result');
      }
    } finally {
      setCalculating(false);
    }
  };

  useEffect(() => {
    void runOptimization(undefined, false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSyncFromCurrentDashboard = () => {
    if (!dashboardData) return;
    if (dashboardData.income > 0) {
      setNetIncomeInput(String(Math.round(dashboardData.income)));
    }
  };

  const handleApplyToBudgets = async () => {
    if (!recommendation) return;
    setApplying(true);
    setApplyFeedback(null);
    try {
      const [yearStr, monthStr] = month.split('-');
      const targetYear = Number(yearStr) || new Date().getFullYear();
      const targetMonth = Number(monthStr) || new Date().getMonth() + 1;

      const result = await applyRecommendationToBudgets(
        recommendation,
        dashboardData?.categories ?? [],
        targetYear,
        targetMonth
      );
      await refreshFinance();
      setApplyFeedback(
        `Sucesso! ${result.createdCount} orçamentos aplicados/atualizados para ${month}.`
      );
    } catch (err) {
      setApplyFeedback(
        err instanceof Error ? err.message : 'Não foi possível aplicar os orçamentos.'
      );
    } finally {
      setApplying(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <AppHeader
        title="Planejador IA"
        subtitle="Alocação orçamentária personalizada para sua renda, moradia e objetivos."
        showMarketStrip={false}
      />

      <ScrollView
        className="flex-1"
        contentContainerClassName="gap-4 p-4 pb-12"
        showsVerticalScrollIndicator={false}>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full flex-row border border-border bg-card">
            <TabsTrigger value="form" className="flex-1">
              <Text className="text-xs font-semibold">1. Seu Perfil Financeiro</Text>
            </TabsTrigger>
            <TabsTrigger value="result" className="flex-1">
              <Text className="text-xs font-semibold">2. Recomendação IA</Text>
            </TabsTrigger>
          </TabsList>

          {/* TAB 1: QUESTIONNAIRE */}
          <TabsContent value="form" className="mt-3 gap-4">
            <Card className="border-border bg-card">
              <CardHeader className="pb-2">
                <View className="flex-row items-center justify-between">
                  <CardTitle className="text-base font-bold text-foreground">
                    Renda & Estabilidade Profissional
                  </CardTitle>
                  {dashboardData && dashboardData.income > 0 ? (
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 px-2"
                      onPress={handleSyncFromCurrentDashboard}>
                      <Text className="text-[10px] font-bold text-primary">
                        Usar Renda do Mês
                      </Text>
                    </Button>
                  ) : null}
                </View>
                <CardDescription className="text-xs text-muted-foreground">
                  Define sua renda mensal confiável e os meses de reserva de emergência exigidos.
                </CardDescription>
              </CardHeader>

              <CardContent className="gap-3.5 pt-2">
                <View className="flex-row gap-2.5">
                  <View className="flex-1 gap-1.5">
                    <Label nativeID="pl-net">Renda Líquida Mensal (R$)</Label>
                    <Input
                      keyboardType="decimal-pad"
                      style={TABULAR_NUMS}
                      value={netIncomeInput}
                      onChangeText={(v) => setNetIncomeInput(sanitizeAmountInput(v))}
                    />
                  </View>
                  <View className="flex-1 gap-1.5">
                    <Label nativeID="pl-extra">Renda Extra Recorrente (R$)</Label>
                    <Input
                      keyboardType="decimal-pad"
                      style={TABULAR_NUMS}
                      value={extraIncomeInput}
                      onChangeText={(v) => setExtraIncomeInput(sanitizeAmountInput(v))}
                    />
                  </View>
                </View>

                <View className="gap-1.5">
                  <Label nativeID="pl-emp">Vínculo Profissional</Label>
                  <View className="flex-row flex-wrap gap-1.5">
                    {EMPLOYMENT_OPTIONS.map((opt) => (
                      <Button
                        key={opt.value}
                        size="sm"
                        variant={employmentType === opt.value ? 'default' : 'outline'}
                        className="h-8 px-2.5"
                        onPress={() => setEmploymentType(opt.value)}>
                        <Text className="text-xs">{opt.label}</Text>
                      </Button>
                    ))}
                  </View>
                </View>

                <View className="flex-row gap-2.5">
                  <View className="flex-1 gap-1.5">
                    <Label nativeID="pl-age">Idade</Label>
                    <Input
                      keyboardType="number-pad"
                      style={TABULAR_NUMS}
                      value={ageInput}
                      onChangeText={setAgeInput}
                    />
                  </View>
                  <View className="flex-1 gap-1.5">
                    <Label nativeID="pl-dep">Dependentes Residentes</Label>
                    <Input
                      keyboardType="number-pad"
                      style={TABULAR_NUMS}
                      value={dependentsInput}
                      onChangeText={setDependentsInput}
                    />
                  </View>
                </View>
              </CardContent>
            </Card>

            {/* Protected Obligations & Essential Costs */}
            <Card className="border-border bg-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-bold text-foreground">
                  O Essencial Protegido
                </CardTitle>
                <CardDescription className="text-xs text-muted-foreground">
                  Moradia, alimentação, saúde e pensão alimentícia são tratados como piso
                  inegociável de sobrevivência.
                </CardDescription>
              </CardHeader>

              <CardContent className="gap-3.5 pt-2">
                <View className="gap-1.5">
                  <Label nativeID="pl-housing">Regime de Moradia</Label>
                  <View className="flex-row flex-wrap gap-1.5">
                    {HOUSING_OPTIONS.map((opt) => (
                      <Button
                        key={opt.value}
                        size="sm"
                        variant={housingType === opt.value ? 'default' : 'outline'}
                        className="h-8 px-2.5"
                        onPress={() => setHousingType(opt.value)}>
                        <Text className="text-xs">{opt.label}</Text>
                      </Button>
                    ))}
                  </View>
                </View>

                <View className="flex-row gap-2.5">
                  <View className="flex-1 gap-1.5">
                    <Label nativeID="pl-hcost">Moradia + Contas (R$)</Label>
                    <Input
                      keyboardType="decimal-pad"
                      style={TABULAR_NUMS}
                      value={housingCostInput}
                      onChangeText={(v) => setHousingCostInput(sanitizeAmountInput(v))}
                    />
                  </View>
                  <View className="flex-1 gap-1.5">
                    <Label nativeID="pl-food">Supermercado Mensal (R$)</Label>
                    <Input
                      keyboardType="decimal-pad"
                      style={TABULAR_NUMS}
                      value={groceriesInput}
                      onChangeText={(v) => setGroceriesInput(sanitizeAmountInput(v))}
                    />
                  </View>
                </View>

                <View className="flex-row gap-2.5">
                  <View className="flex-1 gap-1.5">
                    <Label nativeID="pl-trans">Transporte Essencial (R$)</Label>
                    <Input
                      keyboardType="decimal-pad"
                      style={TABULAR_NUMS}
                      value={transportInput}
                      onChangeText={(v) => setTransportInput(sanitizeAmountInput(v))}
                    />
                  </View>
                  <View className="flex-1 gap-1.5">
                    <Label nativeID="pl-health">Saúde / Plano / Remédios (R$)</Label>
                    <Input
                      keyboardType="decimal-pad"
                      style={TABULAR_NUMS}
                      value={healthInput}
                      onChangeText={(v) => setHealthInput(sanitizeAmountInput(v))}
                    />
                  </View>
                </View>

                <Separator />

                <View className="flex-row items-center justify-between rounded-lg border border-border bg-background p-3">
                  <View className="flex-1 pr-2">
                    <Text className="text-xs font-bold text-foreground">
                      Paga Pensão Alimentícia (Obrigação Legal)
                    </Text>
                    <Text className="text-[11px] text-muted-foreground">
                      Blindada em 100% pelo motor como prioridade absoluta.
                    </Text>
                  </View>
                  <Switch checked={paysAlimony} onCheckedChange={setPaysAlimony} />
                </View>

                {paysAlimony ? (
                  <View className="gap-1.5">
                    <Label nativeID="pl-alim">Valor Mensal da Pensão (R$)</Label>
                    <Input
                      keyboardType="decimal-pad"
                      style={TABULAR_NUMS}
                      value={alimonyAmountInput}
                      onChangeText={(v) => setAlimonyAmountInput(sanitizeAmountInput(v))}
                    />
                  </View>
                ) : null}
              </CardContent>
            </Card>

            {/* Debt & Strategy Mode */}
            <Card className="border-border bg-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-bold text-foreground">
                  Dívidas, Investimentos & Modo de Planejamento
                </CardTitle>
                <CardDescription className="text-xs text-muted-foreground">
                  Configure seu nível de endividamento e ambição patrimonial.
                </CardDescription>
              </CardHeader>

              <CardContent className="gap-3.5 pt-2">
                <View className="gap-1.5">
                  <Label nativeID="pl-debt">Situação de Dívidas (Cartão / Empréstimos)</Label>
                  <View className="flex-row gap-2">
                    {(
                      [
                        { key: 'NONE', label: 'Sem Dívidas' },
                        { key: 'MODERATE', label: 'Moderada' },
                        { key: 'CRITICAL', label: 'Crítica / Juros Altos' },
                      ] as const
                    ).map((d) => (
                      <Button
                        key={d.key}
                        size="sm"
                        variant={debtLevel === d.key ? 'default' : 'outline'}
                        className="h-8 flex-1 px-2"
                        onPress={() => setDebtLevel(d.key)}>
                        <Text className="text-[11px] font-semibold">{d.label}</Text>
                      </Button>
                    ))}
                  </View>
                </View>

                {debtLevel !== 'NONE' ? (
                  <View className="gap-1.5">
                    <Label nativeID="pl-debt-val">Parcela Mensal Atual de Dívidas (R$)</Label>
                    <Input
                      keyboardType="decimal-pad"
                      style={TABULAR_NUMS}
                      value={debtPaymentInput}
                      onChangeText={(v) => setDebtPaymentInput(sanitizeAmountInput(v))}
                    />
                  </View>
                ) : null}

                <View className="gap-1.5">
                  <Label nativeID="pl-inv">Ambição de Construção de Patrimônio</Label>
                  <View className="flex-row gap-2">
                    {(
                      [
                        { key: 'LIGHT', label: 'Leve' },
                        { key: 'BALANCED', label: 'Equilibrada' },
                        { key: 'AGGRESSIVE', label: 'Agressiva' },
                      ] as const
                    ).map((inv) => (
                      <Button
                        key={inv.key}
                        size="sm"
                        variant={investmentAmbition === inv.key ? 'default' : 'outline'}
                        className="h-8 flex-1"
                        onPress={() => setInvestmentAmbition(inv.key)}>
                        <Text className="text-xs">{inv.label}</Text>
                      </Button>
                    ))}
                  </View>
                </View>

                <View className="gap-1.5">
                  <Label nativeID="pl-mode">Estratégia do Algoritmo</Label>
                  <View className="flex-row gap-2">
                    <Button
                      size="sm"
                      variant={planningMode === 'BALANCED' ? 'default' : 'outline'}
                      className="flex-1"
                      onPress={() => setPlanningMode('BALANCED')}>
                      <Text className="text-xs font-bold">Equilíbrio & Crescimento</Text>
                    </Button>
                    <Button
                      size="sm"
                      variant={planningMode === 'DEBT_PAYOFF' ? 'destructive' : 'outline'}
                      className="flex-1"
                      onPress={() => setPlanningMode('DEBT_PAYOFF')}>
                      <Text className="text-xs font-bold">Quitação de Dívidas</Text>
                    </Button>
                  </View>
                </View>

                <Button
                  className="mt-2 h-11 w-full flex-row items-center justify-center gap-2"
                  disabled={calculating}
                  onPress={() => void runOptimization(undefined, true)}>
                  <Icon as={SparklesIcon} className="size-4 text-primary-foreground" />
                  <Text className="font-semibold text-primary-foreground">
                    {calculating ? 'Calculando planejamento...' : 'Gerar Recomendação IA'}
                  </Text>
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB 2: AI RECOMMENDATION RESULT */}
          <TabsContent value="result" className="mt-3 gap-4">
            {recommendation ? (
              <>
                {/* Strategy Summary Header Card */}
                <Card className="border-primary/40 bg-card">
                  <CardHeader className="pb-2">
                    <View className="flex-row flex-wrap items-center justify-between gap-2">
                      <Badge variant="secondary" className="border-primary/40 bg-primary/15">
                        <Icon as={SparklesIcon} className="mr-1 size-3 text-primary" />
                        <Text className="text-[10px] font-bold text-primary">
                          PLANEJADOR INTELIGENTE RUMVEL
                        </Text>
                      </Badge>

                      <Badge
                        variant={
                          recommendation.financialStatus === 'DEFICIT' ? 'destructive' : 'outline'
                        }>
                        <Text className="text-[10px] font-bold">
                          {recommendation.financialStatus === 'DEFICIT'
                            ? 'ALERTA DE DÉFICIT'
                            : 'ORÇAMENTO VIÁVEL (100%)'}
                        </Text>
                      </Badge>
                    </View>

                    <CardTitle className="mt-2 text-lg font-bold text-foreground">
                      {recommendation.ruleName}
                    </CardTitle>
                    <CardDescription className="text-xs text-muted-foreground">
                      {recommendation.strategySummary}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="gap-3 pt-2">
                    <View className="flex-row flex-wrap gap-2">
                      <View className="min-w-[46%] flex-1 rounded-lg border border-border bg-background/70 p-2.5">
                        <Text className="text-[10px] uppercase text-muted-foreground">
                          Renda Confiável
                        </Text>
                        <Text style={TABULAR_NUMS} className="text-sm font-bold text-primary">
                          {formatBrlCurrency(
                            recommendation.summary.reliableIncome,
                            privateMode
                          )}
                        </Text>
                      </View>

                      <View className="min-w-[46%] flex-1 rounded-lg border border-border bg-background/70 p-2.5">
                        <Text className="text-[10px] uppercase text-muted-foreground">
                          Obrigações Protegidas
                        </Text>
                        <Text
                          style={TABULAR_NUMS}
                          className="text-sm font-bold text-foreground">
                          {formatBrlCurrency(
                            recommendation.summary.protectedObligations,
                            privateMode
                          )}
                        </Text>
                      </View>

                      <View className="min-w-[46%] flex-1 rounded-lg border border-border bg-background/70 p-2.5">
                        <Text className="text-[10px] uppercase text-muted-foreground">
                          Reserva Recomendada ({recommendation.summary.emergencyTargetMonths}m)
                        </Text>
                        <Text
                          style={TABULAR_NUMS}
                          className="text-sm font-bold text-sky-600 dark:text-sky-400">
                          {formatBrlCurrency(
                            recommendation.summary.emergencyTargetAmount,
                            privateMode
                          )}
                        </Text>
                      </View>

                      <View className="min-w-[46%] flex-1 rounded-lg border border-border bg-background/70 p-2.5">
                        <Text className="text-[10px] uppercase text-muted-foreground">
                          Saldo Flexível
                        </Text>
                        <Text
                          style={TABULAR_NUMS}
                          className="text-sm font-bold text-foreground">
                          {formatBrlCurrency(recommendation.summary.flexibleBalance, privateMode)}
                        </Text>
                      </View>
                    </View>

                    {/* Alerts */}
                    {recommendation.alerts.map((alert: RecommendationAlert) => (
                      <View
                        key={alert.code}
                        className={`rounded-lg border p-3 ${
                          alert.severity === 'CRITICAL'
                            ? 'border-destructive/50 bg-destructive/10'
                            : 'border-amber-500/40 bg-amber-500/10'
                        }`}>
                        <View className="flex-row items-center gap-1.5">
                          <Icon
                            as={
                              alert.severity === 'CRITICAL' ? ShieldAlertIcon : AlertTriangleIcon
                            }
                            className={`size-4 ${
                              alert.severity === 'CRITICAL'
                                ? 'text-destructive'
                                : 'text-amber-600 dark:text-amber-400'
                            }`}
                          />
                          <Text className="text-xs font-bold text-foreground">{alert.title}</Text>
                        </View>
                        <Text className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
                          {alert.message}
                        </Text>
                        {alert.action === 'ENABLE_DEBT_PAYOFF' &&
                        recommendation.planningMode !== 'DEBT_PAYOFF' ? (
                          <Button
                            size="sm"
                            variant="destructive"
                            className="mt-2 self-start"
                            onPress={() => {
                              setPlanningMode('DEBT_PAYOFF');
                              void runOptimization('DEBT_PAYOFF', false);
                            }}>
                            <Text className="text-xs font-bold">
                              Ativar Modo Quitação de Dívidas
                            </Text>
                          </Button>
                        ) : null}
                      </View>
                    ))}

                    {applyFeedback ? (
                      <View className="flex-row items-center gap-2 rounded-lg border border-primary/40 bg-primary/15 p-3">
                        <Icon as={CheckCircle2Icon} className="size-4 text-primary" />
                        <Text className="flex-1 text-xs font-semibold text-foreground">
                          {applyFeedback}
                        </Text>
                      </View>
                    ) : null}

                    <Button
                      className="h-11 w-full flex-row items-center justify-center gap-2"
                      disabled={applying}
                      onPress={() => void handleApplyToBudgets()}>
                      <Icon as={Wand2Icon} className="size-4 text-primary-foreground" />
                      <Text className="font-semibold text-primary-foreground">
                        {applying
                          ? 'Aplicando aos orçamentos...'
                          : `Aplicar aos Orçamentos (${month})`}
                      </Text>
                    </Button>
                  </CardContent>
                </Card>

                {/* Allocation Buckets List with official CategoryBadge */}
                <Card className="border-border bg-card">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base font-bold text-foreground">
                      Distribuição nos Baldes Orçamentários
                    </CardTitle>
                    <CardDescription className="text-xs text-muted-foreground">
                      Baldes protegidos blindam suas obrigações fixas; baldes ajustáveis absorvem
                      sua estratégia.
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="gap-3.5 pt-2">
                    {recommendation.allocations
                      .filter((b: AllocationBucket) => b.percentage > 0 || b.amount > 0)
                      .map((bucket: AllocationBucket) => {
                        const isProtected = bucket.kind === 'PROTECTED';
                        return (
                          <View
                            key={bucket.key}
                            className="gap-2 rounded-lg border border-border bg-background/60 p-3">
                            <View className="flex-row items-center justify-between gap-2">
                              <View className="flex-row items-center gap-2.5 flex-1">
                                <CategoryBadge
                                  name={bucket.name}
                                  color={bucket.color}
                                  size="sm"
                                />
                                <View className="flex-1">
                                  <View className="flex-row items-center gap-1.5 flex-wrap">
                                    <Text
                                      className="text-xs font-bold text-foreground"
                                      numberOfLines={1}>
                                      {bucket.name}
                                    </Text>
                                    {isProtected ? (
                                      <Badge
                                        variant="secondary"
                                        className="h-4 border-amber-500/40 bg-amber-500/15 px-1.5 py-0">
                                        <Icon
                                          as={LockIcon}
                                          className="mr-1 size-2.5 text-amber-600 dark:text-amber-400"
                                        />
                                        <Text className="text-[10px] font-bold text-amber-600 dark:text-amber-400">
                                          Protegido
                                        </Text>
                                      </Badge>
                                    ) : null}
                                  </View>
                                </View>
                              </View>

                              <View className="flex-row items-center gap-2">
                                <Text
                                  style={TABULAR_NUMS}
                                  className="text-xs font-bold text-foreground">
                                  {formatBrlCurrency(bucket.amount, privateMode)}
                                </Text>
                                <Badge variant="outline" className="h-5 px-1.5 py-0">
                                  <Text style={TABULAR_NUMS} className="text-[10px] font-bold">
                                    {bucket.percentage}%
                                  </Text>
                                </Badge>
                              </View>
                            </View>

                            <Progress
                              value={bucket.percentage}
                              indicatorColor={bucket.color}
                              className="h-2 bg-secondary"
                            />

                            <Text className="text-[11px] leading-relaxed text-muted-foreground">
                              {bucket.reason}
                            </Text>
                          </View>
                        );
                      })}
                  </CardContent>
                </Card>

                {/* Strategic Guidance Notes */}
                <Card className="border-border bg-card">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base font-bold text-foreground">
                      Recomendações do seu plano
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="gap-2 pt-1">
                    {recommendation.strategicNotes.map((note: string, idx: number) => (
                      <View key={idx} className="flex-row items-start gap-2">
                        <Icon as={TrendingUpIcon} className="mt-0.5 size-3.5 text-primary" />
                        <Text className="flex-1 text-xs leading-relaxed text-muted-foreground">
                          {note}
                        </Text>
                      </View>
                    ))}
                  </CardContent>
                </Card>
              </>
            ) : null}
          </TabsContent>
        </Tabs>
      </ScrollView>
    </SafeAreaView>
  );
}
