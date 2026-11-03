import React, { useState } from 'react';
import { ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  CopyIcon,
  FolderKanbanIcon,
  PencilIcon,
  PieChartIcon,
  PlusIcon,
  TagIcon,
  TargetIcon,
  Trash2Icon,
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

export default function BudgetsScreen() {
  const { month, privateMode, dashboardData, refreshFinance } = useApp();

  const [activeTab, setActiveTab] = useState<string>('budgets');
  const [modalOpen, setModalOpen] = useState(false);
  const [modalKind, setModalKind] = useState<FinanceFormKind>('budget');
  const [editBudget, setEditBudget] = useState<FinanceBudget | null>(null);
  const [editGoal, setEditGoal] = useState<FinanceGoal | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  const accounts = dashboardData?.accounts ?? [];
  const categories = dashboardData?.categories ?? [];
  const budgets = dashboardData?.budgets ?? [];
  const goals = dashboardData?.goals ?? [];
  const tags = dashboardData?.tags ?? [];

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

  const handleDeleteBudget = async (id: string) => {
    await deleteBudget(id);
    await refreshFinance();
  };

  const handleCopyBudgetNextMonth = async (b: FinanceBudget) => {
    const next = getNextYearMonth();
    await copyBudget(b.id, next.year, next.month);
    setFeedback(`Orçamento copiado para ${String(next.month).padStart(2, '0')}/${next.year}.`);
  };

  const handleDeleteGoal = async (id: string) => {
    await deleteGoal(id);
    await refreshFinance();
  };

  const handleCopyGoalNextMonth = async (g: FinanceGoal) => {
    const next = getNextYearMonth();
    await copyGoal(g.id, next.year, next.month);
    setFeedback(`Meta copiada para ${String(next.month).padStart(2, '0')}/${next.year}.`);
  };

  const handleDeleteCategory = async (id: string) => {
    await saveFinance(`/categories/${id}`, undefined, 'DELETE');
    await refreshFinance();
  };

  const handleDeleteTag = async (id: string) => {
    await saveFinance(`/tags/${id}`, undefined, 'DELETE');
    await refreshFinance();
  };

  const totalBudgetLimit = budgets.reduce((s, b) => s + b.limitAmount, 0);
  const totalBudgetSpent = budgets.reduce((s, b) => s + b.spent, 0);

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <AppHeader
        title="Orçamentos, Metas & Categorias"
        subtitle="Controle de tetos de gastos, metas de receita e taxonomia"
        showMarketStrip={false}
      />

      <ScrollView
        className="flex-1"
        contentContainerClassName="gap-4 p-4 pb-12"
        showsVerticalScrollIndicator={false}>
        {feedback ? (
          <View className="flex-row items-center justify-between rounded-lg border border-primary/40 bg-primary/15 px-3 py-2">
            <Text className="flex-1 text-xs font-semibold text-foreground">{feedback}</Text>
            <Button variant="ghost" size="sm" className="h-6 px-2" onPress={() => setFeedback(null)}>
              <Text className="text-[10px] font-bold text-primary">Fechar</Text>
            </Button>
          </View>
        ) : null}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full flex-row border border-border bg-card">
            <TabsTrigger value="budgets" className="flex-1">
              <Text className="text-xs font-bold">Orçamentos ({budgets.length})</Text>
            </TabsTrigger>
            <TabsTrigger value="goals" className="flex-1">
              <Text className="text-xs font-bold">Metas ({goals.length})</Text>
            </TabsTrigger>
            <TabsTrigger value="categories" className="flex-1">
              <Text className="text-xs font-bold">Categorias</Text>
            </TabsTrigger>
          </TabsList>

          {/* TAB 1: BUDGETS */}
          <TabsContent value="budgets" className="mt-3 gap-3">
            <Card className="border-border bg-card">
              <CardContent className="flex-row items-center justify-between p-4">
                <View>
                  <Text className="text-[11px] font-bold uppercase text-muted-foreground">
                    Consolidado de Orçamentos ({month})
                  </Text>
                  <Text style={TABULAR_NUMS} className="mt-0.5 text-base font-extrabold text-foreground">
                    {formatBrlCurrency(totalBudgetSpent, privateMode)}{' '}
                    <Text className="text-xs font-normal text-muted-foreground">
                      de {formatBrlCurrency(totalBudgetLimit, privateMode)}
                    </Text>
                  </Text>
                </View>
                <Button size="sm" onPress={() => handleOpenNew('budget')}>
                  <Icon as={PlusIcon} className="mr-1.5 size-3.5 text-primary-foreground" />
                  <Text className="text-xs font-bold">Novo Teto</Text>
                </Button>
              </CardContent>
            </Card>

            {budgets.length === 0 ? (
              <Card className="border-dashed border-border bg-card">
                <CardContent className="items-center gap-2 py-8">
                  <Icon as={PieChartIcon} className="size-7 text-muted-foreground" />
                  <Text className="text-sm font-bold text-foreground">
                    Nenhum orçamento definido
                  </Text>
                  <Text className="text-center text-xs text-muted-foreground">
                    Crie tetos mensais por categoria para acompanhar seu ritmo de gastos.
                  </Text>
                </CardContent>
              </Card>
            ) : (
              budgets.map((b) => {
                const cat = categories.find((c) => c.id === b.categoryId);
                const pct = Math.min(100, Math.max(0, Math.round(b.progress)));
                const isExceeded = b.progress >= 100 || b.status === 'EXCEEDED';
                const isWarning = !isExceeded && b.progress >= 80;

                return (
                  <Card key={b.id} className="border-border bg-card">
                    <CardContent className="gap-2.5 p-4">
                      <View className="flex-row items-center justify-between">
                        <View className="flex-row items-center gap-2">
                          <View
                            style={{ backgroundColor: cat?.color ?? '#00d494' }}
                            className="h-3 w-3 rounded-full"
                          />
                          <Text className="text-sm font-bold text-foreground">
                            {cat?.name ?? 'Categoria'}
                          </Text>
                        </View>

                        <View className="flex-row items-center gap-1">
                          <Badge
                            variant={
                              isExceeded ? 'destructive' : isWarning ? 'secondary' : 'outline'
                            }
                            className="h-5 px-1.5 py-0">
                            <Text style={TABULAR_NUMS} className="text-[10px] font-bold">
                              {Math.round(b.progress)}%
                            </Text>
                          </Badge>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-7 w-7"
                            onPress={() => void handleCopyBudgetNextMonth(b)}
                            accessibilityLabel="Copiar para próximo mês">
                            <Icon as={CopyIcon} className="size-3.5 text-muted-foreground" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-7 w-7"
                            onPress={() => handleEditBudget(b)}
                            accessibilityLabel="Editar orçamento">
                            <Icon as={PencilIcon} className="size-3.5 text-muted-foreground" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-7 w-7"
                            onPress={() => void handleDeleteBudget(b.id)}
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
                        className="h-2.5"
                      />

                      <View className="flex-row items-center justify-between">
                        <Text style={TABULAR_NUMS} className="text-xs text-muted-foreground">
                          Utilizado:{' '}
                          <Text className="font-bold text-foreground">
                            {formatBrlCurrency(b.spent, privateMode)}
                          </Text>
                        </Text>
                        <Text style={TABULAR_NUMS} className="text-xs text-muted-foreground">
                          Disponível:{' '}
                          <Text
                            className={`font-bold ${
                              b.available < 0 ? 'text-destructive' : 'text-primary'
                            }`}>
                            {formatBrlCurrency(b.available, privateMode)}
                          </Text>
                        </Text>
                        <Text style={TABULAR_NUMS} className="text-xs font-bold text-foreground">
                          Teto: {formatBrlCurrency(b.limitAmount, privateMode)}
                        </Text>
                      </View>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </TabsContent>

          {/* TAB 2: INCOME GOALS */}
          <TabsContent value="goals" className="mt-3 gap-3">
            <Card className="border-border bg-card">
              <CardContent className="flex-row items-center justify-between p-4">
                <View className="flex-1 pr-2">
                  <Text className="text-sm font-bold text-foreground">
                    Metas Mensais de Receita
                  </Text>
                  <Text className="text-xs text-muted-foreground">
                    Acompanhe o progresso de faturamento, salário e dividendos.
                  </Text>
                </View>
                <Button size="sm" onPress={() => handleOpenNew('goal')}>
                  <Icon as={PlusIcon} className="mr-1.5 size-3.5 text-primary-foreground" />
                  <Text className="text-xs font-bold">Nova Meta</Text>
                </Button>
              </CardContent>
            </Card>

            {goals.length === 0 ? (
              <Card className="border-dashed border-border bg-card">
                <CardContent className="items-center gap-2 py-8">
                  <Icon as={TargetIcon} className="size-7 text-muted-foreground" />
                  <Text className="text-sm font-bold text-foreground">
                    Nenhuma meta de receita criada
                  </Text>
                  <Text className="text-center text-xs text-muted-foreground">
                    Defina alvos mensais para suas fontes de renda.
                  </Text>
                </CardContent>
              </Card>
            ) : (
              goals.map((g) => {
                const cat = categories.find((c) => c.id === g.categoryId);
                const pct = Math.min(100, Math.max(0, Math.round(g.progress)));
                return (
                  <Card key={g.id} className="border-border bg-card">
                    <CardContent className="gap-2.5 p-4">
                      <View className="flex-row items-center justify-between">
                        <Text className="text-sm font-bold text-foreground">
                          {cat?.name ?? 'Receita'}
                        </Text>
                        <View className="flex-row items-center gap-1">
                          <Badge variant="secondary" className="h-5 px-1.5 py-0">
                            <Text style={TABULAR_NUMS} className="text-[10px] font-bold text-primary">
                              {Math.round(g.progress)}% atingido
                            </Text>
                          </Badge>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-7 w-7"
                            onPress={() => void handleCopyGoalNextMonth(g)}>
                            <Icon as={CopyIcon} className="size-3.5 text-muted-foreground" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-7 w-7"
                            onPress={() => handleEditGoal(g)}>
                            <Icon as={PencilIcon} className="size-3.5 text-muted-foreground" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-7 w-7"
                            onPress={() => void handleDeleteGoal(g.id)}>
                            <Icon as={Trash2Icon} className="size-3.5 text-destructive" />
                          </Button>
                        </View>
                      </View>

                      <Progress value={pct} className="h-2.5" />

                      <View className="flex-row justify-between">
                        <Text style={TABULAR_NUMS} className="text-xs text-muted-foreground">
                          Recebido:{' '}
                          <Text className="font-bold text-primary">
                            {formatBrlCurrency(g.received, privateMode)}
                          </Text>
                        </Text>
                        <Text style={TABULAR_NUMS} className="text-xs font-bold text-foreground">
                          Alvo: {formatBrlCurrency(g.targetAmount, privateMode)}
                        </Text>
                      </View>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </TabsContent>

          {/* TAB 3: CATEGORIES & TAGS */}
          <TabsContent value="categories" className="mt-3 gap-4">
            <Card className="border-border bg-card">
              <CardHeader className="flex-row items-center justify-between pb-2">
                <View>
                  <CardTitle className="text-base font-bold text-foreground">
                    Categorias ({categories.length})
                  </CardTitle>
                  <CardDescription className="text-xs text-muted-foreground">
                    Classificação estrutural de despesas e receitas.
                  </CardDescription>
                </View>
                <Button size="sm" onPress={() => handleOpenNew('category')}>
                  <Icon as={FolderKanbanIcon} className="mr-1.5 size-3.5 text-primary-foreground" />
                  <Text className="text-xs font-bold">Nova Categoria</Text>
                </Button>
              </CardHeader>

              <CardContent className="gap-2 pt-2">
                {categories.map((cat) => (
                  <View
                    key={cat.id}
                    className="flex-row items-center justify-between rounded-lg border border-border bg-background/60 px-3 py-2">
                    <View className="flex-row items-center gap-2.5">
                      <View
                        style={{ backgroundColor: cat.color ?? '#00d494' }}
                        className="h-3 w-3 rounded-full"
                      />
                      <Text className="text-xs font-bold text-foreground">{cat.name}</Text>
                      <Badge variant="outline" className="h-4 px-1.5 py-0">
                        <Text className="text-[9px] font-bold">
                          {cat.type.toUpperCase() === 'INCOME' ? 'RECEITA' : 'DESPESA'}
                        </Text>
                      </Badge>
                    </View>
                    {!cat.system ? (
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7"
                        onPress={() => void handleDeleteCategory(cat.id)}>
                        <Icon as={Trash2Icon} className="size-3.5 text-destructive" />
                      </Button>
                    ) : null}
                  </View>
                ))}
              </CardContent>
            </Card>

            <Card className="border-border bg-card">
              <CardHeader className="flex-row items-center justify-between pb-2">
                <View>
                  <CardTitle className="text-base font-bold text-foreground">
                    Etiquetas / Tags ({tags.length})
                  </CardTitle>
                  <CardDescription className="text-xs text-muted-foreground">
                    Marcadores transversais para projetos, centros de custo e viagens.
                  </CardDescription>
                </View>
                <Button size="sm" variant="outline" onPress={() => handleOpenNew('tag')}>
                  <Icon as={TagIcon} className="mr-1.5 size-3.5 text-foreground" />
                  <Text className="text-xs font-bold">Nova Tag</Text>
                </Button>
              </CardHeader>

              <CardContent className="flex-row flex-wrap gap-2 pt-2">
                {tags.map((tag) => (
                  <View
                    key={tag.id}
                    className="flex-row items-center gap-1.5 rounded-full border border-border bg-background px-3 py-1">
                    <View
                      style={{ backgroundColor: tag.color ?? '#00d494' }}
                      className="h-2.5 w-2.5 rounded-full"
                    />
                    <Text className="text-xs font-semibold text-foreground">{tag.name}</Text>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-5 w-5"
                      onPress={() => void handleDeleteTag(tag.id)}>
                      <Icon as={Trash2Icon} className="size-3 text-muted-foreground" />
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
    </SafeAreaView>
  );
}
