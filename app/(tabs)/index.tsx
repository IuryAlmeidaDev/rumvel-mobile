import React, { useMemo, useState } from 'react';
import { ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  ArrowDownLeftIcon,
  ArrowRightIcon,
  ArrowRightLeftIcon,
  ArrowUpRightIcon,
  CalendarIcon,
  CheckCircle2Icon,
  ClockIcon,
  PieChartIcon,
  PlusIcon,
  RotateCcwIcon,
  SparklesIcon,
  WalletIcon,
} from 'lucide-react-native';
import { AppHeader } from '@/components/finance/AppHeader';
import { BankBadge } from '@/components/finance/BankBadge';
import { CategoryBadge, getCategoryMeta } from '@/components/finance/CategoryBadge';
import { FinanceFormModal, type FinanceFormKind } from '@/components/finance/FinanceFormModal';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Icon } from '@/components/ui/icon';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { Text } from '@/components/ui/text';
import { useApp } from '@/context/AppContext';
import {
  formatBrlCurrency,
  formatDateSafe,
  getTodayString,
  TABULAR_NUMS,
} from '@/lib/formatters';
import type { FinanceTransaction } from '@/lib/financeApi';

export default function DashboardScreen() {
  const router = useRouter();
  const {
    month,
    privateMode,
    dashboardData,
    isLoadingFinance,
    financeError,
    refreshFinance,
    optimisticTogglePay,
  } = useApp();

  const [modalOpen, setModalOpen] = useState(false);
  const [modalKind, setModalKind] = useState<FinanceFormKind>('transaction');
  const [defaultTxType, setDefaultTxType] = useState<'EXPENSE' | 'INCOME' | 'TRANSFER'>('EXPENSE');
  const [payingId, setPayingId] = useState<string | null>(null);
  const [lastPaidTx, setLastPaidTx] = useState<FinanceTransaction | null>(null);

  const openQuickTx = (type: 'EXPENSE' | 'INCOME' | 'TRANSFER') => {
    setModalKind('transaction');
    setDefaultTxType(type);
    setModalOpen(true);
  };

  const openNewAccount = () => {
    setModalKind('account');
    setModalOpen(true);
  };

  const accounts = dashboardData?.accounts ?? [];
  const categories = dashboardData?.categories ?? [];
  const transactions = dashboardData?.transactions ?? [];
  const budgets = dashboardData?.budgets ?? [];

  const categoryMap = useMemo(() => {
    const map = new Map<
      string,
      { name: string; color?: string; iconSlug?: string; parentId?: string | null; type?: string }
    >();
    categories.forEach((c) =>
      map.set(c.id, {
        name: c.name,
        color: c.color,
        iconSlug: c.iconSlug,
        parentId: c.parentId,
        type: c.type,
      })
    );
    return map;
  }, [categories]);

  const accountMap = useMemo(() => {
    const map = new Map<string, string>();
    accounts.forEach((a) => map.set(a.id, a.name));
    return map;
  }, [accounts]);

  const dailyAverageMeta = useMemo(() => {
    const expense = dashboardData?.expense ?? 0;
    if (expense <= 0) {
      return { amount: 0, note: 'Sem despesas no mês' };
    }
    const [yearStr, monthStr] = month.split('-');
    const year = parseInt(yearStr, 10) || new Date().getFullYear();
    const m = parseInt(monthStr, 10) || 1;
    const daysInMonth = new Date(year, m, 0).getDate();
    const now = new Date();
    const isCurrentMonth = now.getFullYear() === year && now.getMonth() + 1 === m;
    const daysCount = isCurrentMonth
      ? Math.max(1, Math.min(now.getDate(), daysInMonth))
      : daysInMonth;
    const avg = expense / daysCount;
    const note = isCurrentMonth
      ? `Ritmo em ${daysCount} ${daysCount === 1 ? 'dia' : 'dias'}`
      : `Média em ${daysInMonth} dias`;
    return { amount: avg, note };
  }, [dashboardData?.expense, month]);

  const unpaidTransactions = useMemo(() => {
    return transactions
      .filter((t) => !t.paid && t.type.toUpperCase() !== 'TRANSFER')
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(0, 5);
  }, [transactions]);

  const recentTransactions = useMemo(() => {
    return [...transactions]
      .sort((a, b) => b.date.localeCompare(a.date))
      .slice(0, 6);
  }, [transactions]);

  const categoryBreakdown = useMemo(() => {
    const expenses = transactions.filter((t) => t.type.toUpperCase() === 'EXPENSE');
    const totalExpense = expenses.reduce((sum, t) => sum + Math.abs(t.amount), 0);
    if (totalExpense <= 0) return [];

    const byCat = new Map<string, number>();
    expenses.forEach((t) => {
      const key = t.categoryId || 'uncategorized';
      byCat.set(key, (byCat.get(key) ?? 0) + Math.abs(t.amount));
    });

    return Array.from(byCat.entries())
      .map(([catId, amount]) => {
        const info = categoryMap.get(catId);
        const parentInfo = info?.parentId ? categoryMap.get(info.parentId) : undefined;
        const pct = Math.round((amount / totalExpense) * 100);
        const meta = getCategoryMeta(
          info?.name ?? 'Sem categoria',
          parentInfo?.name,
          'EXPENSE',
          info?.iconSlug,
          info?.color
        );
        return {
          catId,
          name: info?.name ?? 'Sem categoria',
          parentName: parentInfo?.name,
          iconSlug: info?.iconSlug,
          color: meta.color,
          amount,
          pct,
        };
      })
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);
  }, [transactions, categoryMap]);

  const todayStr = getTodayString();

  const handleTogglePay = async (tx: FinanceTransaction) => {
    setPayingId(tx.id);
    try {
      await optimisticTogglePay(tx, !tx.paid);
      if (!tx.paid) {
        setLastPaidTx(tx);
      } else {
        setLastPaidTx(null);
      }
    } finally {
      setPayingId(null);
    }
  };

  const handleUndoPay = async () => {
    if (!lastPaidTx) return;
    const target = lastPaidTx;
    setLastPaidTx(null);
    setPayingId(target.id);
    try {
      await optimisticTogglePay({ ...target, paid: true }, false);
    } finally {
      setPayingId(null);
    }
  };

  const realizedBalance = dashboardData?.realizedBalance ?? 0;
  const projectedBalance = dashboardData?.projectedBalance ?? realizedBalance;

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <AppHeader
        title="Seu dinheiro, com clareza."
        subtitle="Um olhar completo para suas finanças. Tudo no seu ritmo."
      />

      <ScrollView
        className="flex-1"
        contentContainerClassName="gap-4 p-4 pb-10"
        showsVerticalScrollIndicator={false}>
        {financeError ? (
          <Card className="border-destructive/50 bg-destructive/10">
            <CardContent className="flex-row items-center justify-between p-4">
              <Text className="flex-1 text-xs font-medium text-destructive">{financeError}</Text>
              <Button size="sm" variant="outline" onPress={() => void refreshFinance()}>
                <Text className="text-xs">Tentar novamente</Text>
              </Button>
            </CardContent>
          </Card>
        ) : null}

        {/* Hero Consolidated Balance Card (Display Hierarchy + Projected Balance & Daily Rhythm) */}
        <Card className="border-border bg-card">
          <CardContent className="gap-3 p-4">
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center gap-2">
                <View className="h-7 w-7 items-center justify-center rounded-lg bg-primary/15">
                  <Icon as={WalletIcon} className="size-4 text-primary" />
                </View>
                <Text className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                  Saldo Consolidado Realizado
                </Text>
              </View>
              <Badge variant="outline" className="border-border px-2 py-0.5">
                <Text className="text-[10px] font-bold uppercase text-muted-foreground">
                  {accounts.filter((a) => a.includeInTotal !== false).length} contas
                </Text>
              </Badge>
            </View>

            {isLoadingFinance && !dashboardData ? (
              <Skeleton className="h-9 w-48 rounded-md" />
            ) : (
              <Text
                style={TABULAR_NUMS}
                className={`text-3xl font-extrabold tracking-tight ${
                  realizedBalance > 0
                    ? 'text-primary'
                    : realizedBalance < 0
                      ? 'text-destructive'
                      : 'text-foreground'
                }`}>
                {formatBrlCurrency(realizedBalance, privateMode)}
              </Text>
            )}

            <View className="flex-row items-center justify-between border-t border-border/70 pt-3">
              <View className="flex-1 pr-2">
                <Text className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  Saldo Projetado no Mês
                </Text>
                <Text
                  style={TABULAR_NUMS}
                  className="mt-0.5 text-sm font-bold text-foreground">
                  {formatBrlCurrency(projectedBalance, privateMode)}
                </Text>
              </View>

              <View className="h-7 w-[1px] bg-border/70" />

              <View className="flex-1 items-end pl-2">
                <View className="flex-row items-center gap-1">
                  <Icon as={CalendarIcon} className="size-3 text-muted-foreground" />
                  <Text className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    {dailyAverageMeta.note}
                  </Text>
                </View>
                <Text
                  style={TABULAR_NUMS}
                  className="mt-0.5 text-sm font-bold text-foreground">
                  {formatBrlCurrency(dailyAverageMeta.amount, privateMode)}
                  <Text className="text-xs font-normal text-muted-foreground">/dia</Text>
                </Text>
              </View>
            </View>
          </CardContent>
        </Card>

        {/* Quick Launch Action Bar */}
        <View className="flex-row gap-2">
          <Button
            variant="default"
            size="sm"
            className="h-10 flex-1 flex-row items-center justify-center gap-1.5"
            onPress={() => openQuickTx('EXPENSE')}>
            <Icon as={PlusIcon} className="size-4 text-primary-foreground" />
            <Text className="text-xs font-semibold text-primary-foreground">Novo lançamento</Text>
          </Button>

          <Button
            variant="secondary"
            size="sm"
            className="h-10 flex-row items-center justify-center gap-1.5 border border-primary/30 bg-primary/15 px-3.5"
            onPress={() => openQuickTx('INCOME')}>
            <Icon as={ArrowUpRightIcon} className="size-3.5 text-primary" />
            <Text className="text-xs font-semibold text-primary">Receita</Text>
          </Button>

          <Button
            variant="outline"
            size="sm"
            className="h-10 flex-row items-center justify-center gap-1.5 px-3"
            onPress={() => openQuickTx('TRANSFER')}>
            <Icon as={ArrowRightLeftIcon} className="size-3.5 text-foreground" />
            <Text className="text-xs font-semibold">Transf.</Text>
          </Button>
        </View>

        {/* 2-Column Pulse Grid: Entradas vs. Saídas (No Truncation) */}
        <View className="flex-row gap-3">
          <Card className="flex-1 border-border bg-card">
            <CardContent className="justify-between gap-1.5 p-3.5">
              <View className="flex-row items-center justify-between">
                <Text className="text-xs font-medium text-muted-foreground">Entradas do mês</Text>
                <Icon as={ArrowUpRightIcon} className="size-4 text-primary" />
              </View>
              <Text
                style={TABULAR_NUMS}
                className="text-lg font-bold tracking-tight text-primary">
                {formatBrlCurrency(dashboardData?.income ?? 0, privateMode)}
              </Text>
              <Text className="text-[11px] text-muted-foreground">Recebidas e previstas</Text>
            </CardContent>
          </Card>

          <Card className="flex-1 border-border bg-card">
            <CardContent className="justify-between gap-1.5 p-3.5">
              <View className="flex-row items-center justify-between">
                <Text className="text-xs font-medium text-muted-foreground">Saídas do mês</Text>
                <Icon as={ArrowDownLeftIcon} className="size-4 text-destructive" />
              </View>
              <Text
                style={TABULAR_NUMS}
                className="text-lg font-bold tracking-tight text-destructive">
                {formatBrlCurrency(dashboardData?.expense ?? 0, privateMode)}
              </Text>
              <Text className="text-[11px] text-muted-foreground">Pagas e pendentes</Text>
            </CardContent>
          </Card>
        </View>

        {/* Onboarding / AI Planner Banner (Shown prominently when no budgets exist, compact otherwise) */}
        {budgets.length === 0 ? (
          <Card className="border-primary/30 bg-card">
            <CardContent className="flex-row items-center justify-between gap-3 p-4">
              <View className="flex-row items-center gap-3 flex-1">
                <View className="h-10 w-10 items-center justify-center rounded-xl border border-primary/30 bg-primary/15">
                  <Icon as={SparklesIcon} className="size-5 text-primary" />
                </View>
                <View className="flex-1">
                  <Text className="text-sm font-bold text-foreground">
                    Planejador Inteligente Rumvel
                  </Text>
                  <Text className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
                    Distribua sua renda nos 9 potes protegendo moradia e prioridades.
                  </Text>
                </View>
              </View>
              <Button
                size="sm"
                className="h-9 px-3"
                onPress={() => router.push('/(tabs)/planner')}>
                <Text className="text-xs font-semibold text-primary-foreground">Planejar</Text>
              </Button>
            </CardContent>
          </Card>
        ) : null}

        {/* Minhas Contas (with BankBadge) */}
        <Card className="border-border bg-card">
          <CardHeader className="flex-row items-center justify-between pb-2">
            <View>
              <CardTitle className="text-base font-bold text-foreground">Minhas contas</CardTitle>
              <CardDescription className="text-xs text-muted-foreground">
                Seu dinheiro, bem localizado.
              </CardDescription>
            </View>
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9"
              hitSlop={8}
              accessibilityLabel="Adicionar conta"
              onPress={openNewAccount}>
              <Icon as={PlusIcon} className="size-4 text-foreground" />
            </Button>
          </CardHeader>

          <CardContent className="gap-0 pt-1">
            {accounts.length === 0 ? (
              <View className="items-center py-6">
                <Text className="text-xs font-semibold text-foreground">
                  Tudo começa com uma conta
                </Text>
                <Text className="mt-1 text-[11px] text-muted-foreground">
                  Adicione sua conta bancária, poupança ou carteira.
                </Text>
              </View>
            ) : (
              accounts.slice(0, 4).map((acc, idx) => (
                <View
                  key={acc.id}
                  className={`flex-row items-center gap-3 py-3 ${
                    idx > 0 ? 'border-t border-border/60' : ''
                  }`}>
                  <BankBadge name={acc.name} type={acc.type} size="sm" />
                  <View className="flex-1">
                    <Text className="text-xs font-semibold text-foreground" numberOfLines={1}>
                      {acc.name}
                    </Text>
                    <Text className="mt-0.5 text-[11px] text-muted-foreground">
                      {acc.includeInTotal ? 'Incluída no saldo' : 'Fora do saldo total'}
                    </Text>
                  </View>
                  <Text style={TABULAR_NUMS} className="text-xs font-semibold text-foreground">
                    {formatBrlCurrency(acc.realized ?? 0, privateMode)}
                  </Text>
                </View>
              ))
            )}
          </CardContent>

          <CardFooter className="pt-2">
            <Button
              variant="outline"
              size="sm"
              className="w-full flex-row items-center justify-center gap-1.5"
              onPress={() => router.push('/(tabs)/accounts')}>
              <Text className="text-xs font-semibold">Gerenciar contas</Text>
              <Icon as={ArrowRightIcon} className="size-3.5 text-foreground" />
            </Button>
          </CardFooter>
        </Card>

        {/* Despesas por Categoria (with official CategoryBadge & semantic colored Progress) */}
        <Card className="border-border bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-bold text-foreground">
              Despesas por categoria
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground">
              Para onde seu dinheiro foi neste mês.
            </CardDescription>
          </CardHeader>
          <CardContent className="gap-3 pt-2">
            {categoryBreakdown.length === 0 ? (
              <Text className="py-4 text-center text-xs text-muted-foreground">
                Nenhuma despesa registrada neste mês.
              </Text>
            ) : (
              categoryBreakdown.map((item) => (
                <View key={item.catId} className="gap-1.5">
                  <View className="flex-row items-center justify-between">
                    <View className="flex-row items-center gap-2.5">
                      <CategoryBadge
                        name={item.name}
                        parentName={item.parentName}
                        type="EXPENSE"
                        iconSlug={item.iconSlug}
                        color={item.color}
                        size="sm"
                      />
                      <Text className="text-xs font-semibold text-foreground">{item.name}</Text>
                    </View>
                    <View className="flex-row items-center gap-2">
                      <Text style={TABULAR_NUMS} className="text-xs font-semibold text-foreground">
                        {formatBrlCurrency(item.amount, privateMode)}
                      </Text>
                      <Badge variant="secondary" className="h-4 px-1.5 py-0">
                        <Text style={TABULAR_NUMS} className="text-[10px] font-bold">
                          {item.pct}%
                        </Text>
                      </Badge>
                    </View>
                  </View>
                  <Progress
                    value={item.pct}
                    indicatorColor={item.color}
                    className="h-2 bg-secondary"
                  />
                </View>
              ))
            )}
          </CardContent>
        </Card>

        {/* Orçamentos do mês */}
        <Card className="border-border bg-card">
          <CardHeader className="flex-row items-center justify-between pb-2">
            <View>
              <CardTitle className="text-base font-bold text-foreground">
                Orçamentos do mês
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground">
                Mais intenção em cada escolha.
              </CardDescription>
            </View>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 flex-row items-center gap-1 px-2"
              onPress={() => router.push('/(tabs)/planner')}>
              <Icon as={SparklesIcon} className="size-3.5 text-primary" />
              <Text className="text-[11px] font-semibold text-primary">Planejador IA</Text>
            </Button>
          </CardHeader>

          <CardContent className="gap-3 pt-2">
            {budgets.length === 0 ? (
              <View className="items-center gap-2 py-4">
                <Text className="text-xs font-semibold text-foreground">
                  Planeje seu próximo passo
                </Text>
                <Text className="text-center text-[11px] text-muted-foreground">
                  Crie limites por categoria para acompanhar seus gastos.
                </Text>
                <Button
                  size="sm"
                  variant="outline"
                  onPress={() => router.push('/(tabs)/planner')}>
                  <Text className="text-xs font-semibold">Gerar com Planejador IA</Text>
                </Button>
              </View>
            ) : (
              budgets.slice(0, 4).map((b) => {
                const cat = categoryMap.get(b.categoryId);
                const parentCat = cat?.parentId ? categoryMap.get(cat.parentId) : undefined;
                const catName = cat?.name ?? 'Categoria';
                const pct = Math.min(100, Math.max(0, Math.round(b.progress)));
                const isExceeded = b.progress > 100 || b.status === 'EXCEEDED';
                const isWarning = !isExceeded && b.progress > 80;

                return (
                  <View key={b.id} className="gap-2 py-1.5">
                    <View className="flex-row items-center justify-between">
                      <View className="flex-row items-center gap-2.5">
                        <CategoryBadge
                          name={catName}
                          parentName={parentCat?.name}
                          iconSlug={cat?.iconSlug}
                          color={cat?.color}
                          size="sm"
                        />
                        <Text className="text-sm font-medium text-foreground">{catName}</Text>
                      </View>
                      <Text
                        style={TABULAR_NUMS}
                        className={`text-xs ${
                          isExceeded ? 'font-semibold text-destructive' : 'text-muted-foreground'
                        }`}>
                        {Math.round(b.progress)}% usado
                      </Text>
                    </View>
                    <Progress
                      value={pct}
                      indicatorClassName={
                        isExceeded
                          ? 'bg-destructive'
                          : isWarning
                            ? 'bg-amber-500'
                            : 'bg-primary'
                      }
                      className="h-2 bg-secondary"
                    />
                    <View className="flex-row justify-between">
                      <Text style={TABULAR_NUMS} className="text-xs text-muted-foreground">
                        {formatBrlCurrency(b.spent, privateMode)}
                      </Text>
                      <Text style={TABULAR_NUMS} className="text-xs text-muted-foreground">
                        de {formatBrlCurrency(b.limitAmount, privateMode)}
                      </Text>
                    </View>
                  </View>
                );
              })
            )}
          </CardContent>

          <CardFooter className="pt-1">
            <Button
              variant="ghost"
              size="sm"
              className="flex-row items-center gap-1.5 px-0"
              onPress={() => router.push('/(tabs)/budgets')}>
              <Text className="text-xs font-semibold text-primary">Ver planejamento</Text>
              <Icon as={ArrowRightIcon} className="size-3.5 text-primary" />
            </Button>
          </CardFooter>
        </Card>

        {/* Próximos lançamentos (with 1-tap Undo banner and non-crushed two-line layout) */}
        <Card className="border-border bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-bold text-foreground">
              Próximos lançamentos
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground">
              Compromissos em aberto no período selecionado.
            </CardDescription>
          </CardHeader>

          <CardContent className="gap-0 pt-1">
            {lastPaidTx ? (
              <View className="mb-2 flex-row items-center justify-between rounded-lg border border-primary/30 bg-primary/10 px-3 py-2">
                <Text className="flex-1 text-xs font-medium text-foreground" numberOfLines={1}>
                  Efetivado: <Text className="font-bold text-xs">{lastPaidTx.description}</Text>
                </Text>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 flex-row items-center gap-1 px-2"
                  onPress={() => void handleUndoPay()}>
                  <Icon as={RotateCcwIcon} className="size-3.5 text-primary" />
                  <Text className="text-xs font-bold text-primary">Desfazer</Text>
                </Button>
              </View>
            ) : null}

            {unpaidTransactions.length === 0 ? (
              <View className="flex-row items-center gap-2.5 py-3">
                <Icon as={CheckCircle2Icon} className="size-5 text-primary" />
                <Text className="text-xs font-medium text-muted-foreground">
                  Nenhum lançamento pendente neste mês.
                </Text>
              </View>
            ) : (
              unpaidTransactions.map((tx, idx) => {
                const isOverdue = tx.date.slice(0, 10) < todayStr;
                const cat = tx.categoryId ? categoryMap.get(tx.categoryId) : undefined;
                const parentCat = cat?.parentId ? categoryMap.get(cat.parentId) : undefined;
                const accName = accountMap.get(tx.accountId) ?? 'Conta';

                return (
                  <View
                    key={tx.id}
                    className={`flex-row items-center gap-3 py-3 ${
                      idx > 0 ? 'border-t border-border/60' : ''
                    }`}>
                    {tx.categoryId ? (
                      <CategoryBadge
                        name={cat?.name}
                        parentName={parentCat?.name}
                        type={tx.type}
                        iconSlug={cat?.iconSlug}
                        color={cat?.color}
                        size="sm"
                      />
                    ) : (
                      <View className="h-8 w-8 items-center justify-center rounded-lg bg-muted">
                        <Icon as={ClockIcon} className="size-4 text-muted-foreground" />
                      </View>
                    )}

                    <View className="flex-1 pr-1">
                      <Text className="text-xs font-semibold text-foreground" numberOfLines={1}>
                        {tx.description || 'Sem descrição'}
                      </Text>
                      <Text className="mt-0.5 text-[11px] text-muted-foreground" numberOfLines={1}>
                        {isOverdue ? (
                          <Text className="text-[11px] font-semibold text-destructive">
                            Atrasado ·{' '}
                          </Text>
                        ) : null}
                        {formatDateSafe(tx.date)} · {accName}
                      </Text>
                    </View>

                    <View className="items-end gap-1">
                      <Text style={TABULAR_NUMS} className="text-xs font-bold text-foreground">
                        {formatBrlCurrency(Math.abs(tx.amount), privateMode)}
                      </Text>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 px-2.5"
                        hitSlop={6}
                        disabled={payingId === tx.id}
                        onPress={() => void handleTogglePay(tx)}>
                        <Text className="text-[11px] font-semibold">
                          {payingId === tx.id ? '...' : 'Efetivar'}
                        </Text>
                      </Button>
                    </View>
                  </View>
                );
              })
            )}
          </CardContent>
        </Card>

        {/* Últimos lançamentos */}
        <Card className="border-border bg-card">
          <CardHeader className="flex-row items-center justify-between pb-2">
            <View>
              <CardTitle className="text-base font-bold text-foreground">
                Últimos lançamentos
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground">
                Os movimentos mais recentes do mês.
              </CardDescription>
            </View>
            <Button
              variant="ghost"
              size="sm"
              className="flex-row items-center gap-1 px-2"
              onPress={() => router.push('/(tabs)/transactions')}>
              <Text className="text-xs font-semibold text-primary">Ver todos</Text>
              <Icon as={ArrowRightIcon} className="size-3.5 text-primary" />
            </Button>
          </CardHeader>

          <CardContent className="gap-0 pt-1">
            {recentTransactions.length === 0 ? (
              <Text className="py-4 text-center text-xs text-muted-foreground">
                Nenhum lançamento registrado neste mês.
              </Text>
            ) : (
              recentTransactions.map((tx, idx) => {
                const typeUpper = tx.type.toUpperCase();
                const isIncome = typeUpper === 'INCOME';
                const isExpense = typeUpper === 'EXPENSE';
                const isOverdue = !tx.paid && tx.date.slice(0, 10) < todayStr;
                const cat = tx.categoryId ? categoryMap.get(tx.categoryId) : undefined;
                const parentCat = cat?.parentId ? categoryMap.get(cat.parentId) : undefined;
                const accName = accountMap.get(tx.accountId) ?? 'Conta';

                return (
                  <View
                    key={tx.id}
                    className={`flex-row items-center justify-between gap-3 py-3 ${
                      idx > 0 ? 'border-t border-border/60' : ''
                    }`}>
                    <View className="flex-row items-center gap-3 flex-1">
                      <CategoryBadge
                        name={cat?.name}
                        parentName={parentCat?.name}
                        type={tx.type}
                        iconSlug={cat?.iconSlug}
                        color={cat?.color}
                        size="md"
                      />
                      <View className="flex-1">
                        <Text className="text-xs font-semibold text-foreground" numberOfLines={1}>
                          {tx.description || 'Sem descrição'}
                        </Text>
                        <Text className="mt-0.5 text-[11px] text-muted-foreground">
                          {accName} • {formatDateSafe(tx.date)}
                        </Text>
                      </View>
                    </View>

                    <View className="items-end">
                      <Text
                        style={TABULAR_NUMS}
                        className={`text-xs font-semibold ${
                          isIncome
                            ? 'text-primary'
                            : isExpense
                              ? 'text-destructive'
                              : 'text-foreground'
                        }`}>
                        {isExpense ? '− ' : isIncome ? '+ ' : ''}
                        {formatBrlCurrency(Math.abs(tx.amount), privateMode)}
                      </Text>

                      <View className="mt-1 flex-row items-center gap-1 rounded-full border border-border/80 bg-background px-2 py-0.5">
                        <View
                          className={`h-1.5 w-1.5 rounded-full ${
                            tx.paid
                              ? 'bg-primary'
                              : isOverdue
                                ? 'bg-destructive'
                                : 'bg-amber-500'
                          }`}
                        />
                        <Text className="text-[10px] font-bold uppercase text-muted-foreground">
                          {tx.paid ? 'Pago' : isOverdue ? 'Atrasado' : 'Pendente'}
                        </Text>
                      </View>
                    </View>
                  </View>
                );
              })
            )}
          </CardContent>
        </Card>
      </ScrollView>

      <FinanceFormModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        kind={modalKind}
        defaultTxType={defaultTxType}
        month={month}
        accounts={accounts}
        categories={categories}
        onSuccess={refreshFinance}
      />
    </SafeAreaView>
  );
}
