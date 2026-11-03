import React, { useMemo, useState } from 'react';
import { ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  AlertTriangleIcon,
  ArrowDownLeftIcon,
  ArrowRightLeftIcon,
  ArrowUpRightIcon,
  CheckCircle2Icon,
  ClockIcon,
  PencilIcon,
  PlusIcon,
  RepeatIcon,
  SearchIcon,
  Trash2Icon,
} from 'lucide-react-native';
import { AppHeader } from '@/components/finance/AppHeader';
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
import { Card, CardContent } from '@/components/ui/card';
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

type TxFilter = 'ALL' | 'EXPENSE' | 'INCOME' | 'TRANSFER' | 'PENDING' | 'OVERDUE' | 'PAID';

export default function TransactionsScreen() {
  const { month, privateMode, dashboardData, refreshFinance, optimisticTogglePay } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<TxFilter>('ALL');
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
    const map = new Map<string, string>();
    categories.forEach((c) => map.set(c.id, c.name));
    return map;
  }, [categories]);

  const accountMap = useMemo(() => {
    const map = new Map<string, string>();
    accounts.forEach((a) => map.set(a.id, a.name));
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

        if (activeFilter === 'EXPENSE' && typeUpper !== 'EXPENSE') return false;
        if (activeFilter === 'INCOME' && typeUpper !== 'INCOME') return false;
        if (activeFilter === 'TRANSFER' && typeUpper !== 'TRANSFER') return false;
        if (activeFilter === 'PENDING' && tx.paid) return false;
        if (activeFilter === 'OVERDUE' && !isOverdue) return false;
        if (activeFilter === 'PAID' && !tx.paid) return false;

        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const catName = (tx.categoryId ? categoryMap.get(tx.categoryId) : '')?.toLowerCase() ?? '';
          const accName = (accountMap.get(tx.accountId) ?? '').toLowerCase();
          return (
            tx.description.toLowerCase().includes(q) ||
            catName.includes(q) ||
            accName.includes(q)
          );
        }
        return true;
      })
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [transactions, selectedAccountId, activeFilter, searchQuery, todayStr, categoryMap, accountMap]);

  const summary = useMemo(() => {
    let income = 0;
    let expense = 0;
    filteredTransactions.forEach((tx) => {
      const t = tx.type.toUpperCase();
      if (t === 'INCOME') income += Math.abs(tx.amount);
      else if (t === 'EXPENSE') expense += Math.abs(tx.amount);
    });
    return { income, expense, net: income - expense };
  }, [filteredTransactions]);

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
        title="Extrato & Lançamentos"
        subtitle="Gestão de receitas, despesas, parcelas e recorrências"
        showMarketStrip={false}
      />

      <View className="border-b border-border bg-card px-4 py-3">
        {/* Search + New Button */}
        <View className="flex-row items-center gap-2">
          <View className="relative flex-1 justify-center">
            <Input
              placeholder="Buscar descrição, categoria ou conta..."
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
            <Text className="text-xs font-bold">Novo</Text>
          </Button>
        </View>

        {/* Type / Status Filter Pills */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="mt-2.5"
          contentContainerClassName="gap-1.5">
          {(
            [
              { key: 'ALL', label: 'Todos' },
              { key: 'EXPENSE', label: 'Despesas' },
              { key: 'INCOME', label: 'Receitas' },
              { key: 'TRANSFER', label: 'Transferências' },
              { key: 'PENDING', label: 'Pendentes' },
              { key: 'OVERDUE', label: 'Atrasados' },
              { key: 'PAID', label: 'Pagos / Recebidos' },
            ] as const
          ).map((f) => (
            <Button
              key={f.key}
              size="sm"
              variant={activeFilter === f.key ? 'default' : 'outline'}
              className="h-7 px-2.5"
              onPress={() => setActiveFilter(f.key)}>
              <Text className="text-[11px] font-semibold">{f.label}</Text>
            </Button>
          ))}
        </ScrollView>

        {/* Account Filter Pills */}
        {accounts.length > 0 ? (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="mt-2"
            contentContainerClassName="gap-1.5">
            <Button
              size="sm"
              variant={selectedAccountId === 'ALL' ? 'secondary' : 'ghost'}
              className="h-6 px-2"
              onPress={() => setSelectedAccountId('ALL')}>
              <Text className="text-[10px] font-bold">Todas as Contas</Text>
            </Button>
            {accounts.map((acc) => (
              <Button
                key={acc.id}
                size="sm"
                variant={selectedAccountId === acc.id ? 'secondary' : 'ghost'}
                className="h-6 px-2"
                onPress={() => setSelectedAccountId(acc.id)}>
                <Text className="text-[10px] font-semibold">{acc.name}</Text>
              </Button>
            ))}
          </ScrollView>
        ) : null}
      </View>

      <ScrollView
        className="flex-1"
        contentContainerClassName="gap-3 p-4 pb-10"
        showsVerticalScrollIndicator={false}>
        {/* Filtered Summary Strip */}
        <View className="flex-row gap-2">
          <View className="flex-1 rounded-lg border border-border bg-card p-2.5">
            <Text className="text-[10px] uppercase text-muted-foreground">Entradas</Text>
            <Text style={TABULAR_NUMS} className="text-xs font-bold text-primary">
              {formatBrlCurrency(summary.income, privateMode)}
            </Text>
          </View>
          <View className="flex-1 rounded-lg border border-border bg-card p-2.5">
            <Text className="text-[10px] uppercase text-muted-foreground">Saídas</Text>
            <Text style={TABULAR_NUMS} className="text-xs font-bold text-destructive">
              {formatBrlCurrency(summary.expense, privateMode)}
            </Text>
          </View>
          <View className="flex-1 rounded-lg border border-border bg-card p-2.5">
            <Text className="text-[10px] uppercase text-muted-foreground">
              Itens ({filteredTransactions.length})
            </Text>
            <Text
              style={TABULAR_NUMS}
              className={`text-xs font-bold ${
                summary.net >= 0 ? 'text-primary' : 'text-destructive'
              }`}>
              {formatBrlCurrency(summary.net, privateMode)}
            </Text>
          </View>
        </View>

        {/* Transactions List */}
        {filteredTransactions.length === 0 ? (
          <Card className="border-dashed border-border bg-card">
            <CardContent className="items-center justify-center gap-2 py-10">
              <Icon as={SearchIcon} className="size-7 text-muted-foreground" />
              <Text className="text-sm font-bold text-foreground">
                Nenhum lançamento encontrado
              </Text>
              <Text className="text-center text-xs text-muted-foreground">
                Ajuste os filtros ou registre uma nova movimentação neste período.
              </Text>
              <Button size="sm" className="mt-2" onPress={handleOpenCreate}>
                <Icon as={PlusIcon} className="mr-1.5 size-3.5 text-primary-foreground" />
                <Text className="text-xs font-bold">Adicionar Lançamento</Text>
              </Button>
            </CardContent>
          </Card>
        ) : (
          filteredTransactions.map((tx) => {
            const typeUpper = tx.type.toUpperCase();
            const isIncome = typeUpper === 'INCOME';
            const isTransfer = typeUpper === 'TRANSFER';
            const isOverdue = !tx.paid && tx.date.slice(0, 10) < todayStr;
            const catName = tx.categoryId ? categoryMap.get(tx.categoryId) : undefined;
            const accName = accountMap.get(tx.accountId) ?? 'Conta';
            const destAccName = tx.destinationAccountId
              ? accountMap.get(tx.destinationAccountId)
              : undefined;

            return (
              <Card key={tx.id} className="border-border bg-card">
                <CardContent className="gap-2.5 p-3.5">
                  <View className="flex-row items-start justify-between gap-2">
                    <View className="flex-row items-start gap-2.5 flex-1">
                      <View
                        className={`mt-0.5 h-8 w-8 items-center justify-center rounded-lg border ${
                          isIncome
                            ? 'border-primary/40 bg-primary/15'
                            : isTransfer
                              ? 'border-sky-500/40 bg-sky-500/15'
                              : 'border-destructive/40 bg-destructive/15'
                        }`}>
                        <Icon
                          as={
                            isIncome
                              ? ArrowDownLeftIcon
                              : isTransfer
                                ? ArrowRightLeftIcon
                                : ArrowUpRightIcon
                          }
                          className={`size-4 ${
                            isIncome
                              ? 'text-primary'
                              : isTransfer
                                ? 'text-sky-400'
                                : 'text-destructive'
                          }`}
                        />
                      </View>

                      <View className="flex-1">
                        <Text className="text-sm font-bold text-foreground" numberOfLines={1}>
                          {tx.description}
                        </Text>
                        <Text className="text-[11px] text-muted-foreground">
                          {isTransfer
                            ? `${accName} → ${destAccName ?? 'Destino'}`
                            : `${catName ?? 'Sem Categoria'} • ${accName}`}
                        </Text>

                        <View className="mt-1.5 flex-row flex-wrap items-center gap-1.5">
                          <Badge
                            variant={
                              tx.paid
                                ? 'outline'
                                : isOverdue
                                  ? 'destructive'
                                  : 'secondary'
                            }
                            className="h-4 px-1.5 py-0">
                            <Icon
                              as={
                                tx.paid
                                  ? CheckCircle2Icon
                                  : isOverdue
                                    ? AlertTriangleIcon
                                    : ClockIcon
                              }
                              className="mr-1 size-2.5 text-foreground"
                            />
                            <Text className="text-[9px] font-bold">
                              {tx.paid
                                ? isIncome
                                  ? 'RECEBIDO'
                                  : 'PAGO'
                                : isOverdue
                                  ? 'ATRASADO'
                                  : 'PENDENTE'}
                            </Text>
                          </Badge>

                          <Text style={TABULAR_NUMS} className="text-[10px] text-muted-foreground">
                            {formatDateSafe(tx.date)}
                          </Text>

                          {tx.installmentNumber && tx.totalInstallments ? (
                            <Badge variant="secondary" className="h-4 px-1.5 py-0">
                              <Text style={TABULAR_NUMS} className="text-[9px] font-bold">
                                Parcela {tx.installmentNumber}/{tx.totalInstallments}
                              </Text>
                            </Badge>
                          ) : null}

                          {tx.isRecurring || tx.recurring || tx.recurringId ? (
                            <Badge variant="secondary" className="h-4 px-1.5 py-0">
                              <Icon as={RepeatIcon} className="mr-1 size-2.5 text-primary" />
                              <Text className="text-[9px] font-bold text-primary">FIXO</Text>
                            </Badge>
                          ) : null}
                        </View>
                      </View>
                    </View>

                    <View className="items-end">
                      <Text
                        style={TABULAR_NUMS}
                        className={`text-sm font-extrabold ${
                          isIncome
                            ? 'text-primary'
                            : isTransfer
                              ? 'text-sky-400'
                              : 'text-foreground'
                        }`}>
                        {isIncome ? '+' : isTransfer ? '⇄ ' : '-'}
                        {formatBrlCurrency(Math.abs(tx.amount), privateMode)}
                      </Text>

                      <View className="mt-2 flex-row items-center gap-1">
                        {!isTransfer ? (
                          <Button
                            size="sm"
                            variant={tx.paid ? 'ghost' : 'outline'}
                            className="h-7 px-2"
                            onPress={() => void optimisticTogglePay(tx, !tx.paid)}>
                            <Text className="text-[10px] font-bold text-primary">
                              {tx.paid ? 'Estornar' : isIncome ? 'Receber' : 'Pagar'}
                            </Text>
                          </Button>
                        ) : null}

                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-7 w-7"
                          onPress={() => handleOpenEdit(tx)}
                          accessibilityLabel="Editar lançamento">
                          <Icon as={PencilIcon} className="size-3.5 text-muted-foreground" />
                        </Button>

                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-7 w-7"
                          onPress={() => setDeleteTarget(tx)}
                          accessibilityLabel="Excluir lançamento">
                          <Icon as={Trash2Icon} className="size-3.5 text-destructive" />
                        </Button>
                      </View>
                    </View>
                  </View>
                </CardContent>
              </Card>
            );
          })
        )}
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
            <AlertDialogTitle>Excluir Lançamento?</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja remover &ldquo;{deleteTarget?.description}&rdquo;? O saldo da
              conta será recalculado imediatamente.
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
