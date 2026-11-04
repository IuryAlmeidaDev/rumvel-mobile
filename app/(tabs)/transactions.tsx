import React, { useMemo, useState } from 'react';
import { ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ArrowRightLeftIcon,
  PencilIcon,
  PlusIcon,
  RepeatIcon,
  SearchIcon,
  Trash2Icon,
  XIcon,
} from 'lucide-react-native';
import { AppHeader } from '@/components/finance/AppHeader';
import { BankBadge } from '@/components/finance/BankBadge';
import { CategoryBadge } from '@/components/finance/CategoryBadge';
import { FinanceFormModal } from '@/components/finance/FinanceFormModal';
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
import { Input } from '@/components/ui/input';
import { Text } from '@/components/ui/text';
import { useApp } from '@/context/AppContext';
import { saveFinance, type FinanceTransaction } from '@/lib/financeApi';
import {
  formatBrlCurrency,
  formatDateSafe,
  getTodayString,
  TABULAR_NUMS,
} from '@/lib/formatters';

type TxTypeFilter = 'ALL' | 'EXPENSE' | 'INCOME' | 'TRANSFER';
type TxStatusFilter = 'ALL' | 'PENDING' | 'OVERDUE' | 'PAID';

export default function TransactionsScreen() {
  const { month, privateMode, dashboardData, refreshFinance, optimisticTogglePay } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<TxTypeFilter>('ALL');
  const [statusFilter, setStatusFilter] = useState<TxStatusFilter>('ALL');
  const [selectedAccountId, setSelectedAccountId] = useState<string>('ALL');

  const [modalOpen, setModalOpen] = useState(false);
  const [editTx, setEditTx] = useState<FinanceTransaction | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<FinanceTransaction | null>(null);
  const [deleting, setDeleting] = useState(false);

  const accounts = dashboardData?.accounts ?? [];
  const categories = dashboardData?.categories ?? [];
  const transactions = dashboardData?.transactions ?? [];
  const todayStr = getTodayString();

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
    const map = new Map<string, { name: string; type?: string }>();
    accounts.forEach((a) => map.set(a.id, { name: a.name, type: a.type }));
    return map;
  }, [accounts]);

  const filteredTransactions = useMemo(() => {
    return transactions
      .filter((tx) => {
        if (selectedAccountId !== 'ALL' && tx.accountId !== selectedAccountId) {
          return false;
        }
        const typeUpper = tx.type.toUpperCase();
        const isOverdue = !tx.paid && tx.date.slice(0, 10) < todayStr;
        const isPending = !tx.paid && tx.date.slice(0, 10) >= todayStr;

        if (typeFilter === 'EXPENSE' && typeUpper !== 'EXPENSE') return false;
        if (typeFilter === 'INCOME' && typeUpper !== 'INCOME') return false;
        if (typeFilter === 'TRANSFER' && typeUpper !== 'TRANSFER') return false;

        if (statusFilter === 'PENDING' && !isPending) return false;
        if (statusFilter === 'OVERDUE' && !isOverdue) return false;
        if (statusFilter === 'PAID' && !tx.paid) return false;

        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const catName =
            (tx.categoryId ? categoryMap.get(tx.categoryId)?.name : '')?.toLowerCase() ?? '';
          const accName = (accountMap.get(tx.accountId)?.name ?? '').toLowerCase();
          return (
            tx.description.toLowerCase().includes(q) ||
            catName.includes(q) ||
            accName.includes(q)
          );
        }
        return true;
      })
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [
    transactions,
    selectedAccountId,
    typeFilter,
    statusFilter,
    searchQuery,
    todayStr,
    categoryMap,
    accountMap,
  ]);

  const hasActiveFilters =
    typeFilter !== 'ALL' ||
    statusFilter !== 'ALL' ||
    selectedAccountId !== 'ALL' ||
    searchQuery.trim() !== '';

  const clearFilters = () => {
    setSearchQuery('');
    setTypeFilter('ALL');
    setStatusFilter('ALL');
    setSelectedAccountId('ALL');
  };

  const handleOpenCreate = () => {
    setEditTx(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (tx: FinanceTransaction) => {
    setEditTx(tx);
    setModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await saveFinance(`/transactions/${deleteTarget.id}`, undefined, 'DELETE');
      setDeleteTarget(null);
      await refreshFinance();
    } finally {
      setDeleting(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <AppHeader
        title="Lançamentos"
        subtitle="Cada entrada e saída, organizada em um só lugar."
        showMarketStrip={false}
      />

      <View className="border-b border-border bg-card px-4 py-3">
        {/* Search + Novo lançamento Button */}
        <View className="flex-row items-center gap-2">
          <View className="relative flex-1 justify-center">
            <Input
              placeholder="Buscar descrição, conta ou categoria…"
              value={searchQuery}
              onChangeText={setSearchQuery}
              className="h-9 pl-3 pr-3 text-xs"
            />
          </View>
          <Button
            size="sm"
            className="h-9 flex-row items-center gap-1.5 px-3"
            onPress={handleOpenCreate}>
            <Icon as={PlusIcon} className="size-4 text-primary-foreground" />
            <Text className="text-xs font-semibold text-primary-foreground">Novo lançamento</Text>
          </Button>
        </View>

        {/* Independent Type & Status Filter Pills */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="-mx-4 mt-2.5"
          contentContainerClassName="items-center gap-1.5 px-4">
          {(
            [
              { key: 'ALL', label: 'Todos' },
              { key: 'INCOME', label: 'Receitas' },
              { key: 'EXPENSE', label: 'Despesas' },
              { key: 'TRANSFER', label: 'Transf.' },
            ] as const
          ).map((f) => (
            <Button
              key={f.key}
              size="sm"
              variant={typeFilter === f.key ? 'default' : 'outline'}
              className="h-7 px-2.5"
              onPress={() => setTypeFilter(f.key)}>
              <Text className="text-[11px] font-semibold">{f.label}</Text>
            </Button>
          ))}

          <View className="mx-1 h-4 w-[1px] bg-border" />

          {(
            [
              { key: 'ALL', label: 'Qualquer status' },
              { key: 'OVERDUE', label: 'Atrasados' },
              { key: 'PENDING', label: 'Pendentes' },
              { key: 'PAID', label: 'Pagos' },
            ] as const
          ).map((s) => (
            <Button
              key={s.key}
              size="sm"
              variant={statusFilter === s.key ? 'secondary' : 'outline'}
              className={`h-7 px-2.5 ${
                statusFilter === s.key ? 'border border-primary/40 bg-primary/15' : ''
              }`}
              onPress={() => setStatusFilter(s.key)}>
              <Text
                className={`text-[11px] font-semibold ${
                  statusFilter === s.key ? 'text-primary' : ''
                }`}>
                {s.label}
              </Text>
            </Button>
          ))}
        </ScrollView>

        {/* Account Filter Pills with BankBadge */}
        {accounts.length > 0 ? (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="-mx-4 mt-2"
            contentContainerClassName="items-center gap-1.5 px-4">
            <Button
              size="sm"
              variant={selectedAccountId === 'ALL' ? 'secondary' : 'ghost'}
              className="h-7 px-2.5"
              onPress={() => setSelectedAccountId('ALL')}>
              <Text className="text-[11px] font-semibold">Todas as contas</Text>
            </Button>
            {accounts.map((acc) => (
              <Button
                key={acc.id}
                size="sm"
                variant={selectedAccountId === acc.id ? 'secondary' : 'ghost'}
                className="h-7 flex-row items-center gap-1.5 px-2.5"
                onPress={() => setSelectedAccountId(acc.id)}>
                <BankBadge name={acc.name} type={acc.type} size="xs" />
                <Text className="text-[11px] font-semibold">{acc.name}</Text>
              </Button>
            ))}
            {hasActiveFilters ? (
              <Button
                size="sm"
                variant="ghost"
                className="h-7 flex-row items-center gap-1 px-2"
                onPress={clearFilters}>
                <Icon as={XIcon} className="size-3 text-muted-foreground" />
                <Text className="text-[11px] text-muted-foreground">Limpar filtros</Text>
              </Button>
            ) : null}
          </ScrollView>
        ) : null}
      </View>

      <ScrollView
        className="flex-1"
        contentContainerClassName="gap-3 p-4 pb-10"
        showsVerticalScrollIndicator={false}>
        <Card className="border-border bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-bold text-foreground">
              Todos os lançamentos
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground">
              {filteredTransactions.length}{' '}
              {filteredTransactions.length === 1
                ? 'lançamento encontrado no período.'
                : 'lançamentos encontrados no período.'}
            </CardDescription>
          </CardHeader>

          <CardContent className="gap-0 px-4 pt-1">
            {filteredTransactions.length === 0 ? (
              <View className="items-center justify-center gap-2 py-8">
                <Icon as={SearchIcon} className="size-6 text-muted-foreground" />
                <Text className="text-sm font-bold text-foreground">
                  Nenhum lançamento encontrado
                </Text>
                <Text className="text-center text-xs text-muted-foreground">
                  {hasActiveFilters
                    ? 'Tente outra busca ou altere os filtros selecionados.'
                    : 'Adicione uma conta e registre seu primeiro lançamento.'}
                </Text>
                {hasActiveFilters ? (
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-2 flex-row items-center gap-1.5"
                    onPress={clearFilters}>
                    <Icon as={XIcon} className="size-3.5 text-foreground" />
                    <Text className="text-xs">Limpar filtros</Text>
                  </Button>
                ) : null}
              </View>
            ) : (
              filteredTransactions.map((tx, idx) => {
                const typeUpper = tx.type.toUpperCase();
                const isIncome = typeUpper === 'INCOME';
                const isExpense = typeUpper === 'EXPENSE';
                const isTransfer = typeUpper === 'TRANSFER';
                const isOverdue = !tx.paid && tx.date.slice(0, 10) < todayStr;
                const cat = tx.categoryId ? categoryMap.get(tx.categoryId) : undefined;
                const parentCat = cat?.parentId ? categoryMap.get(cat.parentId) : undefined;
                const acc = accountMap.get(tx.accountId);
                const accName = acc?.name ?? 'Conta';
                const destAccName = tx.destinationAccountId
                  ? accountMap.get(tx.destinationAccountId)?.name
                  : undefined;

                return (
                  <View
                    key={tx.id}
                    className={`flex-row items-center justify-between gap-3 py-3.5 ${
                      idx > 0 ? 'border-t border-border/60' : ''
                    }`}>
                    {/* Left: CategoryBadge + Description & Account/Date */}
                    <View className="flex-row items-center gap-3 flex-1">
                      {isTransfer ? (
                        <View className="h-9 w-9 items-center justify-center rounded-xl border border-sky-500/30 bg-sky-500/15">
                          <Icon
                            as={ArrowRightLeftIcon}
                            className="size-4 text-sky-600 dark:text-sky-400"
                          />
                        </View>
                      ) : (
                        <CategoryBadge
                          name={cat?.name}
                          parentName={parentCat?.name}
                          type={tx.type}
                          iconSlug={cat?.iconSlug}
                          color={cat?.color}
                          size="md"
                        />
                      )}

                      <View className="flex-1">
                        <Text className="text-xs font-semibold text-foreground" numberOfLines={1}>
                          {tx.description || 'Sem descrição'}
                        </Text>

                        <View className="mt-1 flex-row flex-wrap items-center gap-1.5">
                          <BankBadge name={accName} type={acc?.type} size="xs" />
                          <Text className="text-[11px] text-muted-foreground" numberOfLines={1}>
                            {isTransfer ? `${accName} → ${destAccName ?? 'Destino'}` : accName}
                          </Text>
                          <Text className="text-[11px] text-muted-foreground">•</Text>
                          <Text style={TABULAR_NUMS} className="text-[11px] text-muted-foreground">
                            {formatDateSafe(tx.date)}
                          </Text>
                        </View>

                        {(tx.installmentNumber && tx.totalInstallments) ||
                        tx.isRecurring ||
                        tx.recurring ||
                        tx.recurringId ? (
                          <View className="mt-1 flex-row items-center gap-1.5">
                            {tx.installmentNumber && tx.totalInstallments ? (
                              <Badge variant="secondary" className="h-4 px-1.5 py-0">
                                <Text style={TABULAR_NUMS} className="text-[10px] font-bold">
                                  {tx.installmentNumber}/{tx.totalInstallments}
                                </Text>
                              </Badge>
                            ) : null}
                            {tx.isRecurring || tx.recurring || tx.recurringId ? (
                              <Badge variant="secondary" className="h-4 px-1.5 py-0">
                                <Icon as={RepeatIcon} className="mr-1 size-2.5 text-primary" />
                                <Text className="text-[10px] font-bold text-primary">
                                  Recorrente
                                </Text>
                              </Badge>
                            ) : null}
                          </View>
                        ) : null}
                      </View>
                    </View>

                    {/* Right: Amount + Status Badge + Actions */}
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

                      <View className="mt-1.5 flex-row items-center gap-1.5">
                        {/* Status Pill matching web getTransactionStatusConfig */}
                        <View
                          className={`flex-row items-center gap-1 rounded-full border px-2 py-0.5 ${
                            tx.paid
                              ? 'border-primary/25 bg-primary/10'
                              : isOverdue
                                ? 'border-destructive/30 bg-destructive/10'
                                : 'border-border/80 bg-background'
                          }`}>
                          <View
                            className={`h-1.5 w-1.5 rounded-full ${
                              tx.paid
                                ? 'bg-primary'
                                : isOverdue
                                  ? 'bg-destructive'
                                  : 'bg-amber-500'
                            }`}
                          />
                          <Text
                            className={`text-[10px] font-bold uppercase ${
                              tx.paid
                                ? 'text-primary'
                                : isOverdue
                                  ? 'text-destructive'
                                  : 'text-muted-foreground'
                            }`}>
                            {tx.paid ? 'Pago' : isOverdue ? 'Atrasado' : 'Pendente'}
                          </Text>
                        </View>

                        {!isTransfer ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 px-2"
                            hitSlop={6}
                            onPress={() => void optimisticTogglePay(tx, !tx.paid)}>
                            <Text className="text-[10px] font-semibold text-foreground">
                              {tx.paid ? 'Desfazer' : 'Baixar'}
                            </Text>
                          </Button>
                        ) : null}

                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8"
                          hitSlop={6}
                          onPress={() => handleOpenEdit(tx)}
                          accessibilityLabel={`Editar lançamento ${tx.description}`}>
                          <Icon as={PencilIcon} className="size-3.5 text-muted-foreground" />
                        </Button>

                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8"
                          hitSlop={6}
                          onPress={() => setDeleteTarget(tx)}
                          accessibilityLabel={`Excluir lançamento ${tx.description}`}>
                          <Icon as={Trash2Icon} className="size-3.5 text-destructive" />
                        </Button>
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
        kind="transaction"
        month={month}
        accounts={accounts}
        categories={categories}
        editTransaction={editTx}
        onSuccess={refreshFinance}
      />

      <AlertDialog open={Boolean(deleteTarget)} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <AlertDialogContent className="border-border bg-card">
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir lançamento?</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja remover &ldquo;{deleteTarget?.description}&rdquo;? Esta ação
              não pode ser desfeita.
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
