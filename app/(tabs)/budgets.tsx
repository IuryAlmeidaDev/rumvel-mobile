import React, { useMemo, useState } from 'react';
import { ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ArrowDownLeftIcon,
  CopyIcon,
  GaugeIcon,
  PencilIcon,
  PieChartIcon,
  PlusIcon,
  TagIcon,
  TagsIcon,
  TargetIcon,
  Trash2Icon,
  WalletIcon,
} from 'lucide-react-native';
import { AppHeader } from '@/components/finance/AppHeader';
import { CategoryBadge } from '@/components/finance/CategoryBadge';
import { FinanceFormModal, type FinanceFormKind } from '@/components/finance/FinanceFormModal';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Text } from '@/components/ui/text';
import { useApp } from '@/context/AppContext';
import {
  copyBudget,
  copyGoal,
  deleteBudget,
  deleteGoal,
  saveFinance,
  type FinanceBudget,
  type FinanceGoal,
} from '@/lib/financeApi';
import { formatBrlCurrency, TABULAR_NUMS } from '@/lib/formatters';

interface PendingDelete {
  kind: 'budget' | 'goal' | 'category' | 'tag';
  id: string;
  label: string;
}

export default function BudgetsScreen() {
  const { month, privateMode, dashboardData, refreshFinance } = useApp();

  const [activeTab, setActiveTab] = useState<string>('budgets');
  const [modalOpen, setModalOpen] = useState(false);
  const [modalKind, setModalKind] = useState<FinanceFormKind>('budget');
  const [editBudget, setEditBudget] = useState<FinanceBudget | null>(null);
  const [editGoal, setEditGoal] = useState<FinanceGoal | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<PendingDelete | null>(null);
  const [deleting, setDeleting] = useState(false);

  const accounts = dashboardData?.accounts ?? [];
  const categories = dashboardData?.categories ?? [];
  const budgets = dashboardData?.budgets ?? [];
  const goals = dashboardData?.goals ?? [];
  const tags = dashboardData?.tags ?? [];

  const budgetOverviewMetrics = useMemo(() => {
    if (!budgets.length) return null;
    const totalBudgeted = budgets.reduce((acc, b) => acc + (Number(b.limitAmount) || 0), 0);
    const totalSpent = budgets.reduce((acc, b) => acc + (Number(b.spent) || 0), 0);
    const remaining = totalBudgeted - totalSpent;
    const percentUsed = totalBudgeted > 0 ? Math.round((totalSpent / totalBudgeted) * 100) : 0;
    const exceededCount = budgets.filter(
      (b) => (Number(b.spent) || 0) > (Number(b.limitAmount) || 0)
    ).length;

    return {
      totalBudgeted,
      totalSpent,
      remaining,
      percentUsed,
      exceededCount,
      totalCount: budgets.length,
    };
  }, [budgets]);

  const getNextYearMonth = () => {
    const [yStr, mStr] = month.split('-');
    const y = Number(yStr) || new Date().getFullYear();
    const m = Number(mStr) || 1;
    return m === 12 ? { year: y + 1, month: 1 } : { year: y, month: m + 1 };
  };

  const handleOpenNew = (kind: FinanceFormKind) => {
    setEditBudget(null);
    setEditGoal(null);
    setModalKind(kind);
    setModalOpen(true);
  };

  const handleEditBudget = (b: FinanceBudget) => {
    setEditBudget(b);
    setEditGoal(null);
    setModalKind('budget');
    setModalOpen(true);
  };

  const handleEditGoal = (g: FinanceGoal) => {
    setEditGoal(g);
    setEditBudget(null);
    setModalKind('goal');
    setModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!pendingDelete) return;
    setDeleting(true);
    try {
      if (pendingDelete.kind === 'budget') {
        await deleteBudget(pendingDelete.id);
      } else if (pendingDelete.kind === 'goal') {
        await deleteGoal(pendingDelete.id);
      } else if (pendingDelete.kind === 'category') {
        await saveFinance(`/categories/${pendingDelete.id}`, undefined, 'DELETE');
      } else if (pendingDelete.kind === 'tag') {
        await saveFinance(`/tags/${pendingDelete.id}`, undefined, 'DELETE');
      }
      setPendingDelete(null);
      await refreshFinance();
    } finally {
      setDeleting(false);
    }
  };

  const handleCopyBudgetNextMonth = async (b: FinanceBudget) => {
    const next = getNextYearMonth();
    try {
      await copyBudget(b.id, next.year, next.month);
      setFeedback(`Orçamento copiado para ${String(next.month).padStart(2, '0')}/${next.year}.`);
    } catch (err) {
      setFeedback(
        err instanceof Error ? err.message : 'Não foi possível copiar o orçamento.'
      );
    }
  };

  const handleCopyGoalNextMonth = async (g: FinanceGoal) => {
    const next = getNextYearMonth();
    try {
      await copyGoal(g.id, next.year, next.month);
      setFeedback(`Meta copiada para ${String(next.month).padStart(2, '0')}/${next.year}.`);
    } catch (err) {
      setFeedback(
        err instanceof Error ? err.message : 'Não foi possível copiar a meta.'
      );
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <AppHeader
        title="Orçamentos"
        subtitle="Dê um destino para cada parte do seu dinheiro."
        showMarketStrip={false}
      />

      <ScrollView
        className="flex-1"
        contentContainerClassName="w-full max-w-3xl self-center gap-4 p-4 pb-12"
        showsVerticalScrollIndicator={false}>
        {feedback ? (
          <View className="flex-row items-center justify-between rounded-lg border border-primary/40 bg-primary/15 px-3 py-2">
            <Text className="flex-1 text-xs font-semibold text-foreground">{feedback}</Text>
            <Button variant="ghost" size="sm" className="h-7 px-2" onPress={() => setFeedback(null)}>
              <Text className="text-[10px] font-bold text-primary">Dispensar</Text>
            </Button>
          </View>
        ) : null}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full flex-row border border-border bg-card">
            <TabsTrigger value="budgets" className="flex-1">
              <Text className="text-xs font-semibold">Orçamentos ({budgets.length})</Text>
            </TabsTrigger>
            <TabsTrigger value="goals" className="flex-1">
              <Text className="text-xs font-semibold">Metas ({goals.length})</Text>
            </TabsTrigger>
            <TabsTrigger value="categories" className="flex-1">
              <Text className="text-xs font-semibold">Categorias</Text>
            </TabsTrigger>
          </TabsList>

          {/* TAB 1: BUDGETS */}
          <TabsContent value="budgets" className="mt-3 gap-3">
            {/* 4 Overview Metrics (matching web budgetOverviewMetrics) */}
            {budgetOverviewMetrics ? (
              <View className="gap-3">
                <View className="flex-row gap-3">
                  <Card className="flex-1 border-border bg-card">
                    <CardContent className="gap-1.5 p-3.5">
                      <View className="flex-row items-center justify-between">
                        <Text className="text-xs font-medium text-muted-foreground">
                          Total planejado
                        </Text>
                        <Icon as={TargetIcon} className="size-4 text-muted-foreground" />
                      </View>
                      <Text style={TABULAR_NUMS} className="text-lg font-bold text-foreground">
                        {formatBrlCurrency(budgetOverviewMetrics.totalBudgeted, privateMode)}
                      </Text>
                      <Text className="text-[11px] text-muted-foreground">
                        {budgetOverviewMetrics.totalCount}{' '}
                        {budgetOverviewMetrics.totalCount === 1
                          ? 'limite definido'
                          : 'limites definidos'}{' '}
                        no mês
                      </Text>
                    </CardContent>
                  </Card>

                  <Card className="flex-1 border-border bg-card">
                    <CardContent className="gap-1.5 p-3.5">
                      <View className="flex-row items-center justify-between">
                        <Text className="text-xs font-medium text-muted-foreground">
                          Gasto realizado
                        </Text>
                        <Icon as={ArrowDownLeftIcon} className="size-4 text-muted-foreground" />
                      </View>
                      <Text
                        style={TABULAR_NUMS}
                        className={`text-lg font-bold ${
                          budgetOverviewMetrics.totalSpent > budgetOverviewMetrics.totalBudgeted
                            ? 'text-destructive'
                            : 'text-foreground'
                        }`}>
                        {formatBrlCurrency(budgetOverviewMetrics.totalSpent, privateMode)}
                      </Text>
                      <Text className="text-[11px] text-muted-foreground">
                        Nas categorias com teto
                      </Text>
                    </CardContent>
                  </Card>
                </View>

                <View className="flex-row gap-3">
                  <Card className="flex-1 border-border bg-card">
                    <CardContent className="gap-1.5 p-3.5">
                      <View className="flex-row items-center justify-between">
                        <Text className="text-xs font-medium text-muted-foreground">
                          Saldo disponível
                        </Text>
                        <Icon as={WalletIcon} className="size-4 text-muted-foreground" />
                      </View>
                      <Text
                        style={TABULAR_NUMS}
                        className={`text-lg font-bold ${
                          budgetOverviewMetrics.remaining >= 0
                            ? 'text-primary'
                            : 'text-destructive'
                        }`}>
                        {formatBrlCurrency(budgetOverviewMetrics.remaining, privateMode)}
                      </Text>
                      <Text className="text-[11px] text-muted-foreground">
                        {budgetOverviewMetrics.remaining >= 0
                          ? 'Margem livre para gastar'
                          : 'Teto total ultrapassado'}
                      </Text>
                    </CardContent>
                  </Card>

                  <Card className="flex-1 border-border bg-card">
                    <CardContent className="gap-1.5 p-3.5">
                      <View className="flex-row items-center justify-between">
                        <Text className="text-xs font-medium text-muted-foreground">
                          Execução global
                        </Text>
                        <Icon as={GaugeIcon} className="size-4 text-muted-foreground" />
                      </View>
                      <Text style={TABULAR_NUMS} className="text-lg font-bold text-foreground">
                        {budgetOverviewMetrics.percentUsed}%
                      </Text>
                      <Text className="text-[11px] text-muted-foreground">
                        {budgetOverviewMetrics.exceededCount > 0
                          ? `${budgetOverviewMetrics.exceededCount} teto(s) estourado(s)`
                          : 'Todos dentro do limite'}
                      </Text>
                    </CardContent>
                  </Card>
                </View>
              </View>
            ) : null}

            <Card className="border-border bg-card">
              <CardHeader className="flex-row items-center justify-between pb-2">
                <View className="flex-1 pr-2">
                  <CardTitle className="text-base font-bold text-foreground">
                    Limites por categoria
                  </CardTitle>
                  <CardDescription className="text-xs text-muted-foreground">
                    Acompanhe a evolução mensal de cada orçamento.
                  </CardDescription>
                </View>
                <Button size="sm" onPress={() => handleOpenNew('budget')}>
                  <Icon as={PlusIcon} className="mr-1.5 size-3.5 text-primary-foreground" />
                  <Text className="text-xs font-semibold text-primary-foreground">
                    Novo orçamento
                  </Text>
                </Button>
              </CardHeader>

              <CardContent className="gap-3 pt-2">
                {budgets.length === 0 ? (
                  <View className="items-center gap-2 py-8">
                    <Icon as={PieChartIcon} className="size-7 text-muted-foreground" />
                    <Text className="text-sm font-bold text-foreground">
                      Planeje seu próximo passo
                    </Text>
                    <Text className="text-center text-xs text-muted-foreground">
                      Crie limites por categoria para acompanhar seus gastos.
                    </Text>
                  </View>
                ) : (
                  budgets.map((b, idx) => {
                    const cat = categories.find((c) => c.id === b.categoryId);
                    const parentCat = cat?.parentId
                      ? categories.find((c) => c.id === cat.parentId)
                      : undefined;
                    const catName = cat?.name ?? 'Categoria';
                    const pct = Math.min(100, Math.max(0, Math.round(b.progress)));
                    const isExceeded = b.progress > 100 || b.status === 'EXCEEDED';
                    const isWarning = !isExceeded && b.progress > 80;

                    return (
                      <View
                        key={b.id}
                        className={`gap-2.5 py-2.5 ${
                          idx > 0 ? 'border-t border-border/60' : ''
                        }`}>
                        <View className="flex-row items-center justify-between">
                          <View className="flex-row items-center gap-2.5 flex-1 pr-2">
                            <CategoryBadge
                              name={catName}
                              parentName={parentCat?.name}
                              iconSlug={cat?.iconSlug}
                              color={cat?.color}
                              size="sm"
                            />
                            <Text className="text-sm font-semibold text-foreground" numberOfLines={1}>
                              {catName}
                            </Text>
                          </View>

                          <View className="flex-row items-center gap-1.5">
                            <Text
                              style={TABULAR_NUMS}
                              className={`mr-1 text-xs ${
                                isExceeded
                                  ? 'font-semibold text-destructive'
                                  : 'text-muted-foreground'
                              }`}>
                              {Math.round(b.progress)}% usado
                            </Text>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8"
                              hitSlop={6}
                              onPress={() => void handleCopyBudgetNextMonth(b)}
                              accessibilityLabel="Copiar para próximo mês">
                              <Icon as={CopyIcon} className="size-3.5 text-muted-foreground" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8"
                              hitSlop={6}
                              onPress={() => handleEditBudget(b)}
                              accessibilityLabel="Editar orçamento">
                              <Icon as={PencilIcon} className="size-3.5 text-muted-foreground" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8"
                              hitSlop={6}
                              onPress={() =>
                                setPendingDelete({
                                  kind: 'budget',
                                  id: b.id,
                                  label: `o orçamento de ${catName}`,
                                })
                              }
                              accessibilityLabel="Excluir orçamento">
                              <Icon as={Trash2Icon} className="size-3.5 text-destructive" />
                            </Button>
                          </View>
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

                        <View className="flex-row items-center justify-between">
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
            </Card>
          </TabsContent>

          {/* TAB 2: INCOME GOALS */}
          <TabsContent value="goals" className="mt-3 gap-3">
            <Card className="border-border bg-card">
              <CardHeader className="flex-row items-center justify-between pb-2">
                <View className="flex-1 pr-2">
                  <CardTitle className="text-base font-bold text-foreground">
                    Metas de receita
                  </CardTitle>
                  <CardDescription className="text-xs text-muted-foreground">
                    Transforme seus planos em progresso.
                  </CardDescription>
                </View>
                <Button size="sm" onPress={() => handleOpenNew('goal')}>
                  <Icon as={PlusIcon} className="mr-1.5 size-3.5 text-primary-foreground" />
                  <Text className="text-xs font-semibold text-primary-foreground">Nova meta</Text>
                </Button>
              </CardHeader>

              <CardContent className="gap-3 pt-2">
                {goals.length === 0 ? (
                  <View className="items-center gap-2 py-8">
                    <Icon as={TargetIcon} className="size-7 text-muted-foreground" />
                    <Text className="text-sm font-bold text-foreground">
                      Nenhuma meta de receita criada
                    </Text>
                    <Text className="text-center text-xs text-muted-foreground">
                      Defina alvos mensais para suas fontes de renda.
                    </Text>
                  </View>
                ) : (
                  goals.map((g, idx) => {
                    const cat = categories.find((c) => c.id === g.categoryId);
                    const catName = cat?.name ?? 'Receita';
                    const pct = Math.min(100, Math.max(0, Math.round(g.progress)));
                    return (
                      <View
                        key={g.id}
                        className={`gap-2.5 py-2.5 ${
                          idx > 0 ? 'border-t border-border/60' : ''
                        }`}>
                        <View className="flex-row items-center justify-between">
                          <View className="flex-row items-center gap-2.5 flex-1 pr-2">
                            <CategoryBadge
                              name={catName}
                              type="INCOME"
                              iconSlug={cat?.iconSlug}
                              color={cat?.color}
                              size="sm"
                            />
                            <Text className="text-sm font-semibold text-foreground" numberOfLines={1}>
                              {catName}
                            </Text>
                          </View>
                          <View className="flex-row items-center gap-1.5">
                            <Badge variant="secondary" className="h-5 px-1.5 py-0">
                              <Text
                                style={TABULAR_NUMS}
                                className="text-[10px] font-bold text-primary">
                                {Math.round(g.progress)}% atingido
                              </Text>
                            </Badge>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8"
                              hitSlop={6}
                              onPress={() => void handleCopyGoalNextMonth(g)}
                              accessibilityLabel={`Copiar meta de ${catName} para próximo mês`}>
                              <Icon as={CopyIcon} className="size-3.5 text-muted-foreground" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8"
                              hitSlop={6}
                              onPress={() => handleEditGoal(g)}
                              accessibilityLabel={`Editar meta de ${catName}`}>
                              <Icon as={PencilIcon} className="size-3.5 text-muted-foreground" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8"
                              hitSlop={6}
                              onPress={() =>
                                setPendingDelete({
                                  kind: 'goal',
                                  id: g.id,
                                  label: `a meta de ${catName}`,
                                })
                              }
                              accessibilityLabel={`Excluir meta de ${catName}`}>
                              <Icon as={Trash2Icon} className="size-3.5 text-destructive" />
                            </Button>
                          </View>
                        </View>

                        <Progress value={pct} className="h-2 bg-secondary" />

                        <View className="flex-row justify-between">
                          <Text style={TABULAR_NUMS} className="text-xs text-muted-foreground">
                            Recebido:{' '}
                            <Text className="font-semibold text-primary">
                              {formatBrlCurrency(g.received, privateMode)}
                            </Text>
                          </Text>
                          <Text style={TABULAR_NUMS} className="text-xs text-muted-foreground">
                            Alvo: {formatBrlCurrency(g.targetAmount, privateMode)}
                          </Text>
                        </View>
                      </View>
                    );
                  })
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB 3: CATEGORIES & TAGS */}
          <TabsContent value="categories" className="mt-3 gap-4">
            <Card className="border-border bg-card">
              <CardHeader className="flex-row items-center justify-between pb-2">
                <View className="flex-1 pr-2">
                  <CardTitle className="text-base font-bold text-foreground">
                    Categorias ({categories.length})
                  </CardTitle>
                  <CardDescription className="text-xs text-muted-foreground">
                    Uma organização que faz sentido para você.
                  </CardDescription>
                </View>
                <Button size="sm" onPress={() => handleOpenNew('category')}>
                  <Icon as={TagsIcon} className="mr-1.5 size-3.5 text-primary-foreground" />
                  <Text className="text-xs font-semibold text-primary-foreground">
                    Nova categoria
                  </Text>
                </Button>
              </CardHeader>

              <CardContent className="gap-2 pt-2">
                {categories.map((cat) => {
                  const parentCat = cat.parentId
                    ? categories.find((c) => c.id === cat.parentId)
                    : undefined;
                  return (
                    <View
                      key={cat.id}
                      className="flex-row items-center justify-between rounded-lg border border-border bg-background/60 px-3 py-2.5">
                      <View className="flex-row items-center gap-2.5 flex-1 pr-2">
                        <CategoryBadge
                          name={cat.name}
                          parentName={parentCat?.name}
                          type={cat.type}
                          iconSlug={cat.iconSlug}
                          color={cat.color}
                          size="sm"
                        />
                        <Text className="text-xs font-semibold text-foreground">{cat.name}</Text>
                        <Badge variant="outline" className="h-4 px-1.5 py-0">
                          <Text className="text-[10px] font-bold uppercase">
                            {cat.type.toUpperCase() === 'INCOME' ? 'Receita' : 'Despesa'}
                          </Text>
                        </Badge>
                      </View>
                      {!cat.system ? (
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8"
                          hitSlop={6}
                          onPress={() =>
                            setPendingDelete({
                              kind: 'category',
                              id: cat.id,
                              label: `a categoria "${cat.name}"`,
                            })
                          }
                          accessibilityLabel={`Excluir categoria ${cat.name}`}>
                          <Icon as={Trash2Icon} className="size-3.5 text-destructive" />
                        </Button>
                      ) : null}
                    </View>
                  );
                })}
              </CardContent>
            </Card>

            <Card className="border-border bg-card">
              <CardHeader className="flex-row items-center justify-between pb-2">
                <View className="flex-1 pr-2">
                  <CardTitle className="text-base font-bold text-foreground">
                    Etiquetas ({tags.length})
                  </CardTitle>
                  <CardDescription className="text-xs text-muted-foreground">
                    Marcadores transversais para projetos, centros de custo e viagens.
                  </CardDescription>
                </View>
                <Button size="sm" variant="outline" onPress={() => handleOpenNew('tag')}>
                  <Icon as={TagIcon} className="mr-1.5 size-3.5 text-foreground" />
                  <Text className="text-xs font-semibold">Nova etiqueta</Text>
                </Button>
              </CardHeader>

              <CardContent className="flex-row flex-wrap gap-2 pt-2">
                {tags.map((tag) => (
                  <View
                    key={tag.id}
                    className="flex-row items-center gap-1.5 rounded-full border border-border bg-background pl-3 pr-1.5 py-1">
                    <View
                      style={{ backgroundColor: tag.color ?? '#00d494' }}
                      className="h-2.5 w-2.5 rounded-full"
                    />
                    <Text className="text-xs font-semibold text-foreground">{tag.name}</Text>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7"
                      hitSlop={8}
                      onPress={() =>
                        setPendingDelete({
                          kind: 'tag',
                          id: tag.id,
                          label: `a etiqueta "${tag.name}"`,
                        })
                      }
                      accessibilityLabel={`Excluir etiqueta ${tag.name}`}>
                      <Icon as={Trash2Icon} className="size-3.5 text-muted-foreground" />
                    </Button>
                  </View>
                ))}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </ScrollView>

      <FinanceFormModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        kind={modalKind}
        month={month}
        accounts={accounts}
        categories={categories}
        editBudget={editBudget}
        editGoal={editGoal}
        onSuccess={refreshFinance}
      />

      <AlertDialog
        open={Boolean(pendingDelete)}
        onOpenChange={(o) => !o && setPendingDelete(null)}>
        <AlertDialogContent className="border-border bg-card">
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão?</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir {pendingDelete?.label}? Esta ação não pode ser
              desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-row justify-end gap-2">
            <AlertDialogCancel disabled={deleting}>
              <Text>Cancelar</Text>
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive"
              disabled={deleting}
              onPress={() => void handleConfirmDelete()}>
              <Text className="font-bold text-destructive-foreground">
                {deleting ? 'Excluindo...' : 'Excluir'}
              </Text>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </SafeAreaView>
  );
}
