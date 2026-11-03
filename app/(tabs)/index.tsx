import React, { useMemo, useState } from 'react';
import { ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  AlertTriangleIcon,
  ArrowDownLeftIcon,
  ArrowRightLeftIcon,
  ArrowUpRightIcon,
  BrainCircuitIcon,
  CheckCircle2Icon,
  ClockIcon,
  PlusIcon,
  TrendingDownIcon,
  TrendingUpIcon,
  WalletIcon,
} from 'lucide-react-native';
import { AppHeader } from '@/components/finance/AppHeader';
import { FinanceFormModal, type FinanceFormKind } from '@/components/finance/FinanceFormModal';
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
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Text } from '@/components/ui/text';
import { useApp } from '@/context/AppContext';
import {
  formatBrlCurrency,
  formatDateSafe,
  getTodayString,
  TABULAR_NUMS,
} from '@/lib/formatters';

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

  const openQuickTx = (type: 'EXPENSE' | 'INCOME' | 'TRANSFER') => {
    setModalKind('transaction');
    setDefaultTxType(type);
    setModalOpen(true);
  };

  const accounts = dashboardData?.accounts ?? [];
  const categories = dashboardData?.categories ?? [];
  const transactions = dashboardData?.transactions ?? [];
  const budgets = dashboardData?.budgets ?? [];

  const categoryMap = useMemo(() => {
    const map = new Map<string, { name: string; color?: string }>();
    categories.forEach((c) => map.set(c.id, { name: c.name, color: c.color }));
    return map;
  }, [categories]);

  const accountMap = useMemo(() => {
    const map = new Map<string, string>();
    accounts.forEach((a) => map.set(a.id, a.name));
    return map;
  }, [accounts]);

  const unpaidTransactions = useMemo(() => {
    return transactions
      .filter((t) => !t.paid && t.type.toUpperCase() !== 'TRANSFER')
      .sort((a, b) => a.date.localeCompare(b.date))
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
        const pct = Math.round((amount / totalExpense) * 100);
        return {
          catId,
          name: info?.name ?? 'Sem Categoria',
          color: info?.color ?? '#00d494',
          amount,
          pct,
        };
      })
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);
  }, [transactions, categoryMap]);

  const netMonthResult = (dashboardData?.income ?? 0) - (dashboardData?.expense ?? 0);
  const dailyPace = (dashboardData?.expense ?? 0) / 30;
  const todayStr = getTodayString();

  const handleTogglePay = async (tx: (typeof transactions)[number]) => {
    setPayingId(tx.id);
    try {
      await optimisticTogglePay(tx, !tx.paid);
    } finally {
      setPayingId(null);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <AppHeader />

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

        {/* Primary Consolidated Balance Card */}
        <Card className="border-border bg-card">
          <CardHeader className="pb-2">
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center gap-2">
                <Icon as={WalletIcon} className="size-4 text-primary" />
                <Text className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Saldo Consolidado Realizado
                </Text>
              </View>
              <Badge variant="outline" className="border-primary/40 bg-primary/10">
                <Text className="text-[10px] font-bold text-primary">
                  {dashboardData?.monthLabel ?? month}
                </Text>
              </Badge>
            </View>

            {isLoadingFinance && !dashboardData ? (
              <Skeleton className="mt-2 h-9 w-48 rounded-md" />
            ) : (
              <Text
                style={TABULAR_NUMS}
                className="mt-1 text-3xl font-extrabold tracking-tight text-foreground">
                {formatBrlCurrency(dashboardData?.realizedBalance ?? 0, privateMode)}
              </Text>
            )}
          </CardHeader>

          <CardContent className="gap-3 pt-1">
            <View className="flex-row items-center justify-between rounded-lg border border-border/80 bg-background/60 px-3 py-2">
              <Text className="text-xs text-muted-foreground">Saldo Projetado no fim do mês</Text>
              <Text style={TABULAR_NUMS} className="text-xs font-bold text-foreground">
                {formatBrlCurrency(dashboardData?.projectedBalance ?? 0, privateMode)}
              </Text>
            </View>

            {/* Quick Action Buttons */}
            <View className="flex-row gap-2 pt-1">
              <Button
                variant="default"
                size="sm"
                className="flex-1 flex-row items-center justify-center gap-1.5"
                onPress={() => openQuickTx('EXPENSE')}>
                <Icon as={PlusIcon} className="size-3.5 text-primary-foreground" />
                <Text className="text-xs font-bold">Despesa</Text>
              </Button>

              <Button
                variant="secondary"
                size="sm"
                className="flex-1 flex-row items-center justify-center gap-1.5 border border-primary/30 bg-primary/15"
                onPress={() => openQuickTx('INCOME')}>
                <Icon as={ArrowDownLeftIcon} className="size-3.5 text-primary" />
                <Text className="text-xs font-bold text-primary">Receita</Text>
              </Button>

              <Button
                variant="outline"
                size="sm"
                className="flex-1 flex-row items-center justify-center gap-1.5"
                onPress={() => openQuickTx('TRANSFER')}>
                <Icon as={ArrowRightLeftIcon} className="size-3.5 text-foreground" />
                <Text className="text-xs font-semibold">Transf.</Text>
              </Button>
            </View>
          </CardContent>
        </Card>

        {/* Income / Expense / Net Pulse Grid */}
        <View className="flex-row gap-3">
          <Card className="flex-1 border-border bg-card">
            <CardContent className="gap-1 p-3.5">
              <View className="flex-row items-center justify-between">
                <Text className="text-[11px] font-semibold uppercase text-muted-foreground">
                  Entradas
                </Text>
                <Icon as={TrendingUpIcon} className="size-4 text-primary" />
              </View>
              <Text style={TABULAR_NUMS} className="text-lg font-extrabold text-primary">
                {formatBrlCurrency(dashboardData?.income ?? 0, privateMode)}
              </Text>
              <Text className="text-[10px] text-muted-foreground">Total de receitas no mês</Text>
            </CardContent>
          </Card>

          <Card className="flex-1 border-border bg-card">
            <CardContent className="gap-1 p-3.5">
              <View className="flex-row items-center justify-between">
                <Text className="text-[11px] font-semibold uppercase text-muted-foreground">
                  Saídas
                </Text>
                <Icon as={TrendingDownIcon} className="size-4 text-destructive" />
              </View>
              <Text style={TABULAR_NUMS} className="text-lg font-extrabold text-destructive">
                {formatBrlCurrency(dashboardData?.expense ?? 0, privateMode)}
              </Text>
              <Text style={TABULAR_NUMS} className="text-[10px] text-muted-foreground">
                Ritmo: {formatBrlCurrency(dailyPace, privateMode)}/dia
              </Text>
            </CardContent>
          </Card>
        </View>

        {/* Monthly Net Balance & AI Planner Callout */}
        <Card className="border-primary/30 bg-card">
          <CardContent className="flex-row items-center justify-between gap-3 p-4">
            <View className="flex-1 gap-1">
              <View className="flex-row items-center gap-1.5">
                <Icon as={BrainCircuitIcon} className="size-4 text-primary" />
                <Text className="text-xs font-bold uppercase tracking-wider text-primary">
                  Balanço Líquido & IA
                </Text>
              </View>
              <Text style={TABULAR_NUMS} className="text-sm font-bold text-foreground">
                Resultado do mês:{' '}
                <Text className={netMonthResult >= 0 ? 'text-primary' : 'text-destructive'}>
                  {formatBrlCurrency(netMonthResult, privateMode)}
                </Text>
              </Text>
              <Text className="text-[11px] text-muted-foreground">
                Otimize seus 9 potes orçamentários com o motor genético Rumvel.
              </Text>
            </View>
            <Button
              size="sm"
              variant="secondary"
              className="border border-primary/40 bg-primary/15"
              onPress={() => router.push('/(tabs)/planner')}>
              <Text className="text-xs font-bold text-primary">Abrir IA</Text>
            </Button>
          </CardContent>
        </Card>

        {/* Upcoming & Overdue Bills (1-Tap Pay) */}
        <Card className="border-border bg-card">
          <CardHeader className="flex-row items-center justify-between pb-2">
            <View>
              <CardTitle className="text-base font-bold text-foreground">
                Compromissos Pendentes ({dashboardData?.pendingCount ?? 0})
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground">
                Baixa rápida em 1 toque com atualização imediata de saldo.
              </CardDescription>
            </View>
            <Button
              variant="link"
              size="sm"
              className="h-auto p-0"
              onPress={() => router.push('/(tabs)/transactions')}>
              <Text className="text-xs font-bold text-primary">Ver todos</Text>
            </Button>
          </CardHeader>

          <CardContent className="gap-2.5 pt-2">
            {unpaidTransactions.length === 0 ? (
              <View className="items-center justify-center rounded-lg border border-dashed border-border py-6">
                <Icon as={CheckCircle2Icon} className="mb-1.5 size-6 text-primary" />
                <Text className="text-xs font-semibold text-foreground">
                  Tudo em dia neste período!
                </Text>
                <Text className="text-[11px] text-muted-foreground">
                  Nenhum lançamento pendente encontrado.
                </Text>
              </View>
            ) : (
              unpaidTransactions.map((tx) => {
                const isOverdue = tx.date.slice(0, 10) < todayStr;
                const isIncome = tx.type.toUpperCase() === 'INCOME';
                const cat = tx.categoryId ? categoryMap.get(tx.categoryId) : undefined;
                const accName = accountMap.get(tx.accountId) ?? 'Conta';

                return (
                  <View
                    key={tx.id}
                    className="flex-row items-center justify-between rounded-lg border border-border bg-background/70 p-3">
                    <View className="flex-1 pr-2">
                      <View className="flex-row items-center gap-1.5">
                        <Badge
                          variant={isOverdue ? 'destructive' : 'secondary'}
                          className="h-4 px-1.5 py-0">
                          <Icon
                            as={isOverdue ? AlertTriangleIcon : ClockIcon}
                            className="mr-1 size-2.5 text-foreground"
                          />
                          <Text className="text-[9px] font-bold">
                            {isOverdue ? 'ATRASADO' : 'PENDENTE'}
                          </Text>
                        </Badge>
                        <Text style={TABULAR_NUMS} className="text-[11px] text-muted-foreground">
                          {formatDateSafe(tx.date)}
                        </Text>
                      </View>
                      <Text
                        className="mt-1 text-xs font-semibold text-foreground"
                        numberOfLines={1}>
                        {tx.description}
                      </Text>
                      <Text className="text-[10px] text-muted-foreground">
                        {cat?.name ?? 'Geral'} • {accName}
                      </Text>
                    </View>

                    <View className="items-end gap-1.5">
                      <Text
                        style={TABULAR_NUMS}
                        className={`text-xs font-bold ${
                          isIncome ? 'text-primary' : 'text-foreground'
                        }`}>
                        {isIncome ? '+' : '-'}
                        {formatBrlCurrency(Math.abs(tx.amount), privateMode)}
                      </Text>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 border-primary/40 bg-primary/10 px-2.5"
                        disabled={payingId === tx.id}
                        onPress={() => void handleTogglePay(tx)}>
                        <Icon as={CheckCircle2Icon} className="mr-1 size-3 text-primary" />
                        <Text className="text-[11px] font-bold text-primary">
                          {payingId === tx.id
                            ? '...'
                            : isIncome
                              ? 'Receber'
                              : 'Pagar'}
                        </Text>
                      </Button>
                    </View>
                  </View>
                );
              })
            )}
          </CardContent>
        </Card>

        {/* Category Expense Breakdown */}
        <Card className="border-border bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-bold text-foreground">
              Distribuição por Categoria
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground">
              Concentração das despesas lançadas no mês selecionado.
            </CardDescription>
          </CardHeader>
          <CardContent className="gap-3 pt-2">
            {categoryBreakdown.length === 0 ? (
              <Text className="py-3 text-center text-xs text-muted-foreground">
                Nenhuma despesa registrada neste mês.
              </Text>
            ) : (
              categoryBreakdown.map((item) => (
                <View key={item.catId} className="gap-1.5">
                  <View className="flex-row items-center justify-between">
                    <View className="flex-row items-center gap-2">
                      <View
                        style={{ backgroundColor: item.color }}
                        className="h-2.5 w-2.5 rounded-full"
                      />
                      <Text className="text-xs font-semibold text-foreground">{item.name}</Text>
                    </View>
                    <View className="flex-row items-center gap-2">
                      <Text style={TABULAR_NUMS} className="text-xs font-bold text-foreground">
                        {formatBrlCurrency(item.amount, privateMode)}
                      </Text>
                      <Badge variant="secondary" className="h-4 px-1.5 py-0">
                        <Text style={TABULAR_NUMS} className="text-[10px] font-bold">
                          {item.pct}%
                        </Text>
                      </Badge>
                    </View>
                  </View>
                  <Progress value={item.pct} className="h-2 bg-secondary" />
                </View>
              ))
            )}
          </CardContent>
        </Card>

        {/* Budgets Traffic-Light Summary */}
        <Card className="border-border bg-card">
          <CardHeader className="flex-row items-center justify-between pb-2">
            <View>
              <CardTitle className="text-base font-bold text-foreground">
                Termômetro de Orçamentos ({budgets.length})
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground">
                Acompanhamento de limites mensais por categoria.
              </CardDescription>
            </View>
            <Button
              variant="link"
              size="sm"
              className="h-auto p-0"
              onPress={() => router.push('/(tabs)/budgets')}>
              <Text className="text-xs font-bold text-primary">Gerenciar</Text>
            </Button>
          </CardHeader>

          <CardContent className="gap-3 pt-2">
            {budgets.length === 0 ? (
              <View className="items-center gap-2 py-4">
                <Text className="text-xs text-muted-foreground">
                  Nenhum orçamento configurado para este mês.
                </Text>
                <Button
                  size="sm"
                  variant="outline"
                  onPress={() => router.push('/(tabs)/planner')}>
                  <Text className="text-xs font-semibold">Gerar Orçamentos com IA</Text>
                </Button>
              </View>
            ) : (
              budgets.slice(0, 4).map((b) => {
                const catName = categoryMap.get(b.categoryId)?.name ?? 'Categoria';
                const pct = Math.min(100, Math.max(0, Math.round(b.progress)));
                const isExceeded = b.progress >= 100 || b.status === 'EXCEEDED';
                const isWarning = !isExceeded && b.progress >= 80;

                return (
                  <View key={b.id} className="gap-1.5 rounded-lg border border-border bg-background/50 p-3">
                    <View className="flex-row items-center justify-between">
                      <Text className="text-xs font-bold text-foreground">{catName}</Text>
                      <Badge
                        variant={isExceeded ? 'destructive' : isWarning ? 'secondary' : 'outline'}
                        className="h-4 px-1.5 py-0">
                        <Text style={TABULAR_NUMS} className="text-[10px] font-bold">
                          {Math.round(b.progress)}% •{' '}
                          {isExceeded ? 'ESTOURADO' : isWarning ? 'ATENÇÃO' : 'DENTRO DO TETO'}
                        </Text>
                      </Badge>
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
                      className="h-2"
                    />
                    <View className="flex-row justify-between">
                      <Text style={TABULAR_NUMS} className="text-[11px] text-muted-foreground">
                        Gasto: {formatBrlCurrency(b.spent, privateMode)}
                      </Text>
                      <Text style={TABULAR_NUMS} className="text-[11px] font-semibold text-foreground">
                        Teto: {formatBrlCurrency(b.limitAmount, privateMode)}
                      </Text>
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
