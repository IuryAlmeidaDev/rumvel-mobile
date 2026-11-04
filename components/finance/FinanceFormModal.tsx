import React, { useEffect, useMemo, useState } from 'react';
import { ScrollView, View } from 'react-native';
import { BankBadge } from '@/components/finance/BankBadge';
import {
  CategoryBadge,
  CategoryIconPicker,
  PRESET_COLORS,
} from '@/components/finance/CategoryBadge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Text } from '@/components/ui/text';
import { useApp } from '@/context/AppContext';
import {
  saveFinance,
  updateBudget,
  updateGoal,
  type FinanceAccount,
  type FinanceBudget,
  type FinanceCategory,
  type FinanceGoal,
  type FinanceTransaction,
} from '@/lib/financeApi';
import {
  formatBrlCurrency,
  getTodayString,
  parseBrlAmount,
  sanitizeAmountInput,
  TABULAR_NUMS,
} from '@/lib/formatters';

function isoToBrlDate(iso: string): string {
  const clean = iso.slice(0, 10);
  const parts = clean.split('-');
  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }
  return clean;
}

function formatDateInputMask(raw: string): string {
  const digits = raw.replace(/\D/g, '').slice(0, 8);
  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4, 8)}`;
}

function isValidCalendarDate(year: number, month: number, day: number): boolean {
  if (year < 1900 || year > 2100 || month < 1 || month > 12 || day < 1) return false;
  const maxDays = new Date(year, month, 0).getDate();
  return day <= maxDays;
}

function parseDateToIsoStrict(raw: string): string | null {
  const trimmed = raw.trim();
  const brlMatch = trimmed.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
  if (brlMatch) {
    const day = Number(brlMatch[1]);
    const month = Number(brlMatch[2]);
    const year = Number(brlMatch[3]);
    if (!isValidCalendarDate(year, month, day)) return null;
    const dd = String(day).padStart(2, '0');
    const mm = String(month).padStart(2, '0');
    return `${year}-${mm}-${dd}`;
  }
  const digitsOnly = trimmed.match(/^(\d{2})(\d{2})(\d{4})$/);
  if (digitsOnly) {
    const day = Number(digitsOnly[1]);
    const month = Number(digitsOnly[2]);
    const year = Number(digitsOnly[3]);
    if (!isValidCalendarDate(year, month, day)) return null;
    const dd = String(day).padStart(2, '0');
    const mm = String(month).padStart(2, '0');
    return `${year}-${mm}-${dd}`;
  }
  const isoMatch = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (isoMatch) {
    const year = Number(isoMatch[1]);
    const month = Number(isoMatch[2]);
    const day = Number(isoMatch[3]);
    if (!isValidCalendarDate(year, month, day)) return null;
    return trimmed;
  }
  return null;
}

function getRelativeBrlDate(offsetDays: number): string {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${dd}/${mm}/${yyyy}`;
}

export type FinanceFormKind =
  | 'transaction'
  | 'account'
  | 'budget'
  | 'goal'
  | 'category'
  | 'tag';

export interface FinanceFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  kind: FinanceFormKind;
  defaultTxType?: 'EXPENSE' | 'INCOME' | 'TRANSFER';
  month: string;
  accounts: FinanceAccount[];
  categories: FinanceCategory[];
  editTransaction?: FinanceTransaction | null;
  editAccount?: FinanceAccount | null;
  editBudget?: FinanceBudget | null;
  editGoal?: FinanceGoal | null;
  editCategory?: FinanceCategory | null;
  onSuccess: () => Promise<void> | void;
}

const ACCOUNT_TYPES = [
  { value: 'CHECKING', label: 'Conta Corrente' },
  { value: 'SAVINGS', label: 'Poupança' },
  { value: 'CASH', label: 'Dinheiro / Carteira' },
  { value: 'OTHER', label: 'Outra Conta' },
];

export function FinanceFormModal({
  open,
  onOpenChange,
  kind,
  defaultTxType = 'EXPENSE',
  month,
  accounts,
  categories,
  editTransaction,
  editAccount,
  editBudget,
  editGoal,
  editCategory,
  onSuccess,
}: FinanceFormModalProps) {
  const { privateMode, setMonth } = useApp();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Transaction state
  const [txType, setTxType] = useState<'EXPENSE' | 'INCOME' | 'TRANSFER'>(defaultTxType);
  const [description, setDescription] = useState('');
  const [amountInput, setAmountInput] = useState('');
  const [dateInput, setDateInput] = useState(getTodayString());
  const [accountId, setAccountId] = useState('');
  const [destinationAccountId, setDestinationAccountId] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [paid, setPaid] = useState(true);
  const [recurrenceMode, setRecurrenceMode] = useState<'single' | 'installments' | 'recurring'>(
    'single'
  );
  const [installmentsCount, setInstallmentsCount] = useState('2');
  const [frequency, setFrequency] = useState<'MONTHLY' | 'WEEKLY' | 'YEARLY'>('MONTHLY');

  // Account state
  const [accountName, setAccountName] = useState('');
  const [accountType, setAccountType] = useState('CHECKING');
  const [initialBalanceInput, setInitialBalanceInput] = useState('0');
  const [includeInTotal, setIncludeInTotal] = useState(true);

  // Budget / Goal state
  const [targetCategoryId, setTargetCategoryId] = useState('');
  const [targetAmountInput, setTargetAmountInput] = useState('');

  // Category / Tag state
  const [itemName, setItemName] = useState('');
  const [categoryType, setCategoryType] = useState<'EXPENSE' | 'INCOME'>('EXPENSE');
  const [selectedColor, setSelectedColor] = useState(PRESET_COLORS[0]);
  const [selectedIconSlug, setSelectedIconSlug] = useState<string>('utensils');

  const activeAccounts = useMemo(
    () => accounts.filter((a) => !a.archived),
    [accounts]
  );

  const filteredCategories = useMemo(() => {
    const targetType =
      kind === 'budget'
        ? 'EXPENSE'
        : kind === 'goal'
          ? 'INCOME'
          : txType === 'INCOME'
            ? 'INCOME'
            : 'EXPENSE';
    return categories.filter((c) => c.type.toUpperCase() === targetType);
  }, [categories, kind, txType]);

  useEffect(() => {
    if (!open) return;
    setError(null);

    if (kind === 'transaction') {
      if (editTransaction) {
        const normalizedType = editTransaction.type.toUpperCase() as
          | 'EXPENSE'
          | 'INCOME'
          | 'TRANSFER';
        setTxType(normalizedType);
        setDescription(editTransaction.description);
        setAmountInput(String(Math.abs(editTransaction.amount)).replace('.', ','));
        setDateInput(isoToBrlDate(editTransaction.date.slice(0, 10)));
        setAccountId(editTransaction.accountId);
        setDestinationAccountId(editTransaction.destinationAccountId ?? '');
        setCategoryId(editTransaction.categoryId ?? '');
        setPaid(Boolean(editTransaction.paid));
        setRecurrenceMode('single');
      } else {
        setTxType(defaultTxType);
        setDescription('');
        setAmountInput('');
        setDateInput(isoToBrlDate(getTodayString()));
        const firstAcc = activeAccounts[0]?.id ?? '';
        const secondAcc = activeAccounts[1]?.id ?? firstAcc;
        setAccountId(firstAcc);
        setDestinationAccountId(secondAcc);
        const defaultCat =
          categories.find(
            (c) =>
              c.type.toUpperCase() ===
              (defaultTxType === 'INCOME' ? 'INCOME' : 'EXPENSE')
          )?.id ?? '';
        setCategoryId(defaultCat);
        setPaid(true);
        setRecurrenceMode('single');
        setInstallmentsCount('2');
        setFrequency('MONTHLY');
      }
    } else if (kind === 'account') {
      if (editAccount) {
        setAccountName(editAccount.name);
        setAccountType(editAccount.type ?? 'CHECKING');
        setInitialBalanceInput(
          String(editAccount.initialBalance ?? editAccount.realized ?? 0).replace('.', ',')
        );
        setIncludeInTotal(editAccount.includeInTotal);
      } else {
        setAccountName('');
        setAccountType('CHECKING');
        setInitialBalanceInput('0');
        setIncludeInTotal(true);
      }
    } else if (kind === 'budget') {
      const expenseCats = categories.filter((c) => c.type.toUpperCase() === 'EXPENSE');
      if (editBudget) {
        setTargetCategoryId(editBudget.categoryId);
        setTargetAmountInput(String(editBudget.limitAmount).replace('.', ','));
      } else {
        setTargetCategoryId(expenseCats[0]?.id ?? '');
        setTargetAmountInput('');
      }
    } else if (kind === 'goal') {
      const incomeCats = categories.filter((c) => c.type.toUpperCase() === 'INCOME');
      if (editGoal) {
        setTargetCategoryId(editGoal.categoryId);
        setTargetAmountInput(String(editGoal.targetAmount).replace('.', ','));
      } else {
        setTargetCategoryId(incomeCats[0]?.id ?? '');
        setTargetAmountInput('');
      }
    } else if (kind === 'category' && editCategory) {
      setItemName(editCategory.name);
      setCategoryType(
        editCategory.type.toUpperCase() === 'INCOME' ? 'INCOME' : 'EXPENSE'
      );
      setSelectedColor(editCategory.color || PRESET_COLORS[0]);
      setSelectedIconSlug(editCategory.iconSlug || 'utensils');
    } else {
      setItemName('');
      setCategoryType('EXPENSE');
      setSelectedColor(PRESET_COLORS[0]);
      setSelectedIconSlug('utensils');
    }
  }, [
    open,
    kind,
    defaultTxType,
    editTransaction,
    editAccount,
    editBudget,
    editGoal,
    editCategory,
    activeAccounts,
    categories,
  ]);

  useEffect(() => {
    if (kind === 'transaction' && !editTransaction && txType !== 'TRANSFER') {
      const valid = filteredCategories.some((c) => c.id === categoryId);
      if (!valid && filteredCategories[0]) {
        setCategoryId(filteredCategories[0].id);
      }
    }
  }, [txType, kind, editTransaction, filteredCategories, categoryId]);

  const handleSubmit = async () => {
    setError(null);
    setSubmitting(true);

    try {
      const [yearStr, monthStr] = month.split('-');
      const yearNum = Number(yearStr) || new Date().getFullYear();
      const monthNum = Number(monthStr) || new Date().getMonth() + 1;

      if (kind === 'transaction') {
        const numericAmount = parseBrlAmount(amountInput);
        if (numericAmount <= 0) {
          throw new Error('Informe um valor maior que R$ 0,00.');
        }
        if (!accountId) {
          throw new Error('Selecione uma conta bancária.');
        }
        const cleanDesc =
          description.trim() ||
          (txType === 'TRANSFER'
            ? 'Transferência entre contas'
            : txType === 'INCOME'
              ? 'Nova Receita'
              : 'Nova Despesa');
        const resolvedIsoDate = parseDateToIsoStrict(dateInput);
        if (!resolvedIsoDate) {
          throw new Error('Informe uma data válida no formato DD/MM/AAAA.');
        }

        if (editTransaction) {
          await saveFinance(
            `/transactions/${editTransaction.id}`,
            {
              accountId,
              categoryId: txType === 'TRANSFER' ? undefined : categoryId || undefined,
              destinationAccountId: txType === 'TRANSFER' ? destinationAccountId : undefined,
              amount: numericAmount,
              type: txType,
              date: resolvedIsoDate,
              description: cleanDesc,
              paid,
            },
            'PUT'
          );
        } else if (txType === 'TRANSFER') {
          if (!destinationAccountId || destinationAccountId === accountId) {
            throw new Error('Selecione uma conta de destino diferente da conta de origem.');
          }
          await saveFinance('/transactions/transfers', {
            sourceAccountId: accountId,
            destinationAccountId,
            amount: numericAmount,
            date: resolvedIsoDate,
            description: cleanDesc,
          });
        } else if (recurrenceMode === 'installments') {
          const totalInst = Math.max(2, Math.min(120, Number(installmentsCount) || 2));
          await saveFinance('/installments', {
            accountId,
            categoryId: categoryId || undefined,
            totalAmount: numericAmount,
            totalInstallments: totalInst,
            startDate: resolvedIsoDate,
            description: cleanDesc,
          });
        } else if (recurrenceMode === 'recurring') {
          await saveFinance('/recurring', {
            accountId,
            categoryId: categoryId || undefined,
            amount: numericAmount,
            type: txType,
            startDate: resolvedIsoDate,
            frequency,
            description: cleanDesc,
          });
        } else {
          await saveFinance('/transactions', {
            accountId,
            categoryId: categoryId || undefined,
            amount: numericAmount,
            type: txType,
            date: resolvedIsoDate,
            description: cleanDesc,
            paid,
          });
        }

        const savedMonth = resolvedIsoDate.slice(0, 7);
        if (/^\d{4}-\d{2}$/.test(savedMonth) && savedMonth !== month) {
          setMonth(savedMonth);
        }
      } else if (kind === 'account') {
        if (!accountName.trim()) {
          throw new Error('Informe o nome da conta.');
        }
        const initialBalance = parseBrlAmount(initialBalanceInput);
        if (editAccount) {
          await saveFinance(
            `/accounts/${editAccount.id}`,
            {
              name: accountName.trim(),
              type: accountType,
              includeInTotal,
            },
            'PUT'
          );
        } else {
          await saveFinance('/accounts', {
            name: accountName.trim(),
            type: accountType,
            initialBalance,
            initialBalanceDate: getTodayString(),
            includeInTotal,
          });
        }
      } else if (kind === 'budget') {
        if (!targetCategoryId) {
          throw new Error('Selecione uma categoria de despesa.');
        }
        const limitAmount = parseBrlAmount(targetAmountInput);
        if (limitAmount <= 0) {
          throw new Error('Informe um limite mensal maior que R$ 0,00.');
        }
        if (editBudget) {
          await updateBudget(editBudget.id, {
            categoryId: targetCategoryId,
            year: editBudget.year,
            month: editBudget.month,
            limitAmount,
          });
        } else {
          await saveFinance('/budgets', {
            categoryId: targetCategoryId,
            year: yearNum,
            month: monthNum,
            limitAmount,
          });
        }
      } else if (kind === 'goal') {
        if (!targetCategoryId) {
          throw new Error('Selecione uma categoria de receita.');
        }
        const targetAmount = parseBrlAmount(targetAmountInput);
        if (targetAmount <= 0) {
          throw new Error('Informe uma meta mensal maior que R$ 0,00.');
        }
        if (editGoal) {
          await updateGoal(editGoal.id, {
            categoryId: targetCategoryId,
            year: editGoal.year,
            month: editGoal.month,
            targetAmount,
          });
        } else {
          await saveFinance('/income-goals', {
            categoryId: targetCategoryId,
            year: yearNum,
            month: monthNum,
            targetAmount,
          });
        }
      } else if (kind === 'category') {
        if (!itemName.trim()) {
          throw new Error('Informe o nome da categoria.');
        }
        if (editCategory) {
          await saveFinance(
            `/categories/${editCategory.id}`,
            {
              name: itemName.trim(),
              type: categoryType,
              color: selectedColor,
              iconSlug: selectedIconSlug,
            },
            'PUT'
          );
        } else {
          await saveFinance('/categories', {
            name: itemName.trim(),
            type: categoryType,
            color: selectedColor,
            iconSlug: selectedIconSlug,
          });
        }
      } else if (kind === 'tag') {
        if (!itemName.trim()) {
          throw new Error('Informe o nome da etiqueta.');
        }
        await saveFinance('/tags', {
          name: itemName.trim(),
          color: selectedColor,
        });
      }

      await onSuccess();
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar registro.');
    } finally {
      setSubmitting(false);
    }
  };

  const modalTitle =
    kind === 'transaction'
      ? editTransaction
        ? 'Editar lançamento'
        : 'Novo lançamento'
      : kind === 'account'
        ? editAccount
          ? 'Editar conta'
          : 'Nova conta'
        : kind === 'budget'
          ? editBudget
            ? 'Editar orçamento'
            : 'Novo orçamento'
          : kind === 'goal'
            ? editGoal
              ? 'Editar meta de receita'
              : 'Nova meta de receita'
            : kind === 'category'
              ? editCategory
                ? 'Editar categoria'
                : 'Nova categoria'
              : 'Nova etiqueta';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90%] w-[94%] max-w-md border-border bg-card p-5">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold text-foreground">{modalTitle}</DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Preencha os dados para organizar suas finanças.
          </DialogDescription>
        </DialogHeader>

        <ScrollView
          className="max-h-[420px]"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          <View className="gap-3.5 py-2">
            {error ? (
              <View className="rounded-lg border border-destructive/40 bg-destructive/10 p-3">
                <Text className="text-xs font-medium text-destructive">{error}</Text>
              </View>
            ) : null}

            {/* TRANSACTION FORM */}
            {kind === 'transaction' ? (
              <>
                <View className="flex-row gap-2">
                  {(
                    [
                      { key: 'EXPENSE', label: 'Despesa' },
                      { key: 'INCOME', label: 'Receita' },
                      { key: 'TRANSFER', label: 'Transferência' },
                    ] as const
                  ).map((item) => {
                    const selected = txType === item.key;
                    return (
                      <Button
                        key={item.key}
                        variant={selected ? 'default' : 'outline'}
                        size="sm"
                        className="flex-1"
                        accessibilityState={{ selected }}
                        onPress={() => setTxType(item.key)}>
                        <Text className="text-xs font-semibold">{item.label}</Text>
                      </Button>
                    );
                  })}
                </View>

                <View className="gap-1.5">
                  <Label nativeID="tx-desc">Descrição</Label>
                  <Input
                    placeholder="Ex: Supermercado, Salário, Aluguel..."
                    value={description}
                    onChangeText={setDescription}
                    accessibilityLabel="Descrição do lançamento"
                  />
                </View>

                <View className="flex-row gap-2.5">
                  <View className="flex-1 gap-1.5">
                    <Label nativeID="tx-amount">
                      {recurrenceMode === 'installments' ? 'Valor Total (R$)' : 'Valor (R$)'}
                    </Label>
                    <Input
                      keyboardType="decimal-pad"
                      placeholder="0,00"
                      style={TABULAR_NUMS}
                      value={amountInput}
                      onChangeText={(v) => setAmountInput(sanitizeAmountInput(v))}
                      accessibilityLabel="Valor em reais"
                    />
                  </View>
                  <View className="flex-1 gap-1.5">
                    <Label nativeID="tx-date">Data (DD/MM/AAAA)</Label>
                    <Input
                      keyboardType="number-pad"
                      maxLength={10}
                      placeholder="15/10/2026"
                      style={TABULAR_NUMS}
                      value={dateInput}
                      onChangeText={(v) => setDateInput(formatDateInputMask(v))}
                      accessibilityLabel="Data do lançamento no formato dia, mês e ano"
                    />
                    <View className="flex-row gap-1 pt-0.5">
                      {(
                        [
                          { label: 'Ontem', offset: -1 },
                          { label: 'Hoje', offset: 0 },
                          { label: 'Amanhã', offset: 1 },
                        ] as const
                      ).map((chip) => {
                        const val = getRelativeBrlDate(chip.offset);
                        const active = dateInput === val;
                        return (
                          <Button
                            key={chip.label}
                            variant={active ? 'secondary' : 'outline'}
                            size="sm"
                            className="h-6 flex-1 px-1.5"
                            accessibilityState={{ selected: active }}
                            onPress={() => setDateInput(val)}>
                            <Text className="text-[10px] font-semibold">{chip.label}</Text>
                          </Button>
                        );
                      })}
                    </View>
                  </View>
                </View>

                <View className="gap-1.5">
                  <Label nativeID="tx-account">
                    {txType === 'TRANSFER' ? 'Conta de Origem' : 'Conta'}
                  </Label>
                  <View className="flex-row flex-wrap gap-1.5">
                    {activeAccounts.map((acc) => {
                      const active = accountId === acc.id;
                      return (
                        <Button
                          key={acc.id}
                          variant={active ? 'default' : 'outline'}
                          size="sm"
                          className="h-9 flex-row items-center gap-1.5 px-2.5"
                          accessibilityState={{ selected: active }}
                          onPress={() => setAccountId(acc.id)}>
                          <BankBadge name={acc.name} type={acc.type} size="xs" />
                          <Text className="text-xs font-semibold">{acc.name}</Text>
                          <Text
                            style={TABULAR_NUMS}
                            className={`text-[10px] ${
                              active ? 'text-primary-foreground/80' : 'text-muted-foreground'
                            }`}>
                            ({formatBrlCurrency(acc.realized ?? 0, privateMode)})
                          </Text>
                        </Button>
                      );
                    })}
                  </View>
                </View>

                {txType === 'TRANSFER' ? (
                  <View className="gap-1.5">
                    <Label nativeID="tx-dest">Conta de Destino</Label>
                    <View className="flex-row flex-wrap gap-1.5">
                      {activeAccounts.map((acc) => {
                        const active = destinationAccountId === acc.id;
                        return (
                          <Button
                            key={acc.id}
                            variant={active ? 'default' : 'outline'}
                            size="sm"
                            className="h-8 flex-row items-center gap-1.5 px-2.5"
                            accessibilityState={{ selected: active }}
                            onPress={() => setDestinationAccountId(acc.id)}>
                            <BankBadge name={acc.name} type={acc.type} size="xs" />
                            <Text className="text-xs">{acc.name}</Text>
                          </Button>
                        );
                      })}
                    </View>
                  </View>
                ) : (
                  <View className="gap-1.5">
                    <Label nativeID="tx-cat">Categoria</Label>
                    <View className="flex-row flex-wrap gap-1.5">
                      {filteredCategories.map((cat) => {
                        const active = categoryId === cat.id;
                        return (
                          <Button
                            key={cat.id}
                            variant={active ? 'default' : 'outline'}
                            size="sm"
                            className="h-8 flex-row items-center gap-1.5 px-2.5"
                            accessibilityState={{ selected: active }}
                            onPress={() => setCategoryId(cat.id)}>
                            <CategoryBadge
                              name={cat.name}
                              type={cat.type}
                              iconSlug={cat.iconSlug}
                              color={cat.color}
                              size="xs"
                            />
                            <Text className="text-xs">{cat.name}</Text>
                          </Button>
                        );
                      })}
                    </View>
                  </View>
                )}

                {!editTransaction && txType !== 'TRANSFER' ? (
                  <>
                    <Separator className="my-1" />
                    <View className="gap-1.5">
                      <Label nativeID="tx-mode">Modalidade de Lançamento</Label>
                      <View className="flex-row gap-1.5">
                        {(
                          [
                            { key: 'single', label: 'Único' },
                            { key: 'installments', label: 'Parcelado' },
                            { key: 'recurring', label: 'Fixo / Recorrente' },
                          ] as const
                        ).map((m) => (
                          <Button
                            key={m.key}
                            variant={recurrenceMode === m.key ? 'secondary' : 'outline'}
                            size="sm"
                            className="h-8 flex-1 px-2"
                            accessibilityState={{ selected: recurrenceMode === m.key }}
                            onPress={() => setRecurrenceMode(m.key)}>
                            <Text className="text-[11px] font-semibold">{m.label}</Text>
                          </Button>
                        ))}
                      </View>
                    </View>

                    {recurrenceMode === 'installments' ? (
                      <View className="gap-1.5">
                        <Label nativeID="tx-inst">Número de Parcelas (2 a 120x)</Label>
                        <Input
                          keyboardType="number-pad"
                          value={installmentsCount}
                          onChangeText={setInstallmentsCount}
                          placeholder="Ex: 10"
                        />
                      </View>
                    ) : null}

                    {recurrenceMode === 'recurring' ? (
                      <View className="gap-1.5">
                        <Label nativeID="tx-freq">Periodicidade</Label>
                        <View className="flex-row gap-2">
                          {(
                            [
                              { key: 'MONTHLY', label: 'Mensal' },
                              { key: 'WEEKLY', label: 'Semanal' },
                              { key: 'YEARLY', label: 'Anual' },
                            ] as const
                          ).map((f) => (
                            <Button
                              key={f.key}
                              variant={frequency === f.key ? 'default' : 'outline'}
                              size="sm"
                              className="h-8 flex-1"
                              accessibilityState={{ selected: frequency === f.key }}
                              onPress={() => setFrequency(f.key)}>
                              <Text className="text-xs">{f.label}</Text>
                            </Button>
                          ))}
                        </View>
                      </View>
                    ) : null}
                  </>
                ) : null}

                {recurrenceMode === 'single' && txType !== 'TRANSFER' ? (
                  <View className="mt-1 flex-row items-center justify-between rounded-lg border border-border bg-background p-3">
                    <View className="flex-1 pr-2">
                      <Text className="text-xs font-semibold text-foreground">
                        {txType === 'INCOME' ? 'Receita já recebida' : 'Despesa já paga'}
                      </Text>
                      <Text className="text-[11px] text-muted-foreground">
                        Impacta imediatamente o Saldo Realizado.
                      </Text>
                    </View>
                    <Switch checked={paid} onCheckedChange={setPaid} />
                  </View>
                ) : null}
              </>
            ) : null}

            {/* ACCOUNT FORM */}
            {kind === 'account' ? (
              <>
                <View className="gap-1.5">
                  <Label nativeID="acc-name">Nome da Instituição / Conta</Label>
                  <View className="flex-row items-center gap-2">
                    <BankBadge name={accountName || 'Conta'} type={accountType} size="md" />
                    <Input
                      className="flex-1"
                      placeholder="Ex: Nubank, Itaú, Inter, Bradesco..."
                      value={accountName}
                      onChangeText={setAccountName}
                    />
                  </View>
                </View>

                <View className="gap-1.5">
                  <Label nativeID="acc-type">Tipo de Conta</Label>
                  <View className="flex-row flex-wrap gap-1.5">
                    {ACCOUNT_TYPES.map((t) => (
                      <Button
                        key={t.value}
                        variant={accountType === t.value ? 'default' : 'outline'}
                        size="sm"
                        className="h-8 px-2.5"
                        accessibilityState={{ selected: accountType === t.value }}
                        onPress={() => setAccountType(t.value)}>
                        <Text className="text-xs">{t.label}</Text>
                      </Button>
                    ))}
                  </View>
                </View>

                {!editAccount ? (
                  <View className="gap-1.5">
                    <Label nativeID="acc-bal">Saldo Inicial (R$)</Label>
                    <Input
                      keyboardType="decimal-pad"
                      style={TABULAR_NUMS}
                      value={initialBalanceInput}
                      onChangeText={(v) => setInitialBalanceInput(sanitizeAmountInput(v))}
                      placeholder="0,00"
                    />
                  </View>
                ) : null}

                <View className="flex-row items-center justify-between rounded-lg border border-border bg-background p-3">
                  <View className="flex-1 pr-2">
                    <Text className="text-xs font-semibold text-foreground">
                      Incluir no saldo total
                    </Text>
                    <Text className="text-[11px] text-muted-foreground">
                      Soma esta conta no Saldo Realizado da Visão Geral.
                    </Text>
                  </View>
                  <Switch checked={includeInTotal} onCheckedChange={setIncludeInTotal} />
                </View>
              </>
            ) : null}

            {/* BUDGET OR GOAL FORM */}
            {kind === 'budget' || kind === 'goal' ? (
              <>
                <View className="gap-1.5">
                  <Label nativeID="bg-cat">
                    {kind === 'budget' ? 'Categoria de Despesa' : 'Categoria de Receita'}
                  </Label>
                  <View className="flex-row flex-wrap gap-1.5">
                    {filteredCategories.map((cat) => {
                      const active = targetCategoryId === cat.id;
                      return (
                        <Button
                          key={cat.id}
                          variant={active ? 'default' : 'outline'}
                          size="sm"
                          className="h-8 flex-row items-center gap-1.5 px-2.5"
                          accessibilityState={{ selected: active }}
                          onPress={() => setTargetCategoryId(cat.id)}>
                          <CategoryBadge
                            name={cat.name}
                            type={cat.type}
                            iconSlug={cat.iconSlug}
                            color={cat.color}
                            size="xs"
                          />
                          <Text className="text-xs">{cat.name}</Text>
                        </Button>
                      );
                    })}
                  </View>
                </View>

                <View className="gap-1.5">
                  <Label nativeID="bg-amount">
                    {kind === 'budget' ? 'Limite mensal (R$)' : 'Meta de receita (R$)'}
                  </Label>
                  <Input
                    keyboardType="decimal-pad"
                    style={TABULAR_NUMS}
                    placeholder="Ex: 1500,00"
                    value={targetAmountInput}
                    onChangeText={(v) => setTargetAmountInput(sanitizeAmountInput(v))}
                  />
                </View>
              </>
            ) : null}

            {/* CATEGORY OR TAG FORM */}
            {kind === 'category' || kind === 'tag' ? (
              <>
                <View className="gap-1.5">
                  <Label nativeID="item-name">Nome</Label>
                  <Input
                    placeholder={
                      kind === 'category' ? 'Ex: Educação, Pets...' : 'Ex: Viagem, Reembolsável...'
                    }
                    value={itemName}
                    onChangeText={setItemName}
                  />
                </View>

                {kind === 'category' ? (
                  <>
                    <View className="gap-1.5">
                      <Label nativeID="cat-type">Tipo</Label>
                      <View className="flex-row gap-2">
                        <Button
                          variant={categoryType === 'EXPENSE' ? 'default' : 'outline'}
                          size="sm"
                          className="flex-1"
                          accessibilityState={{ selected: categoryType === 'EXPENSE' }}
                          onPress={() => setCategoryType('EXPENSE')}>
                          <Text className="text-xs">Despesa</Text>
                        </Button>
                        <Button
                          variant={categoryType === 'INCOME' ? 'default' : 'outline'}
                          size="sm"
                          className="flex-1"
                          accessibilityState={{ selected: categoryType === 'INCOME' }}
                          onPress={() => setCategoryType('INCOME')}>
                          <Text className="text-xs">Receita</Text>
                        </Button>
                      </View>
                    </View>

                    <CategoryIconPicker
                      selectedSlug={selectedIconSlug}
                      selectedColor={selectedColor}
                      onSelectIcon={setSelectedIconSlug}
                      onSelectColor={setSelectedColor}
                    />
                  </>
                ) : (
                  <View className="gap-1.5">
                    <Label nativeID="item-color">Cor da etiqueta</Label>
                    <View className="flex-row flex-wrap gap-2">
                      {PRESET_COLORS.map((hex) => (
                        <Button
                          key={hex}
                          variant={selectedColor === hex ? 'default' : 'outline'}
                          size="sm"
                          className="h-8 px-2.5"
                          accessibilityState={{ selected: selectedColor === hex }}
                          onPress={() => setSelectedColor(hex)}>
                          <View
                            style={{ backgroundColor: hex }}
                            className="mr-1.5 h-3 w-3 rounded-full"
                          />
                          <Text className="text-[10px]">{hex}</Text>
                        </Button>
                      ))}
                    </View>
                  </View>
                )}
              </>
            ) : null}
          </View>
        </ScrollView>

        <DialogFooter className="flex-row justify-end gap-2 pt-3">
          <Button
            variant="outline"
            size="sm"
            disabled={submitting}
            onPress={() => onOpenChange(false)}>
            <Text>Cancelar</Text>
          </Button>
          <Button size="sm" disabled={submitting} onPress={() => void handleSubmit()}>
            <Text className="font-semibold text-primary-foreground">
              {submitting ? 'Salvando...' : 'Salvar'}
            </Text>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
