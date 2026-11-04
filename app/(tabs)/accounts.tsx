import React, { useMemo, useState } from 'react';
import { ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ArchiveIcon,
  CalculatorIcon,
  DownloadIcon,
  LogOutIcon,
  PencilIcon,
  PlusIcon,
  RefreshCwIcon,
  RotateCcwIcon,
  ShieldCheckIcon,
  Trash2Icon,
} from 'lucide-react-native';
import { AppHeader } from '@/components/finance/AppHeader';
import { BankBadge } from '@/components/finance/BankBadge';
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
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Icon } from '@/components/ui/icon';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Text } from '@/components/ui/text';
import { useApp } from '@/context/AppContext';
import { deleteUserAccount, exportUserData } from '@/lib/authApi';
import {
  archiveAccount,
  deleteAccount,
  type FinanceAccount,
} from '@/lib/financeApi';
import {
  formatBrlCurrency,
  parseBrlAmount,
  sanitizeAmountInput,
  TABULAR_NUMS,
} from '@/lib/formatters';

const ACCOUNT_TYPE_LABELS: Record<string, string> = {
  CHECKING: 'Conta corrente',
  SAVINGS: 'Poupança',
  CASH: 'Dinheiro',
  WALLET: 'Carteira',
  INVESTMENT: 'Investimentos',
  CREDIT: 'Cartão de crédito',
  OTHER: 'Outra conta',
};

export default function AccountsScreen() {
  const {
    user,
    isDemo,
    month,
    privateMode,
    dashboardData,
    marketIndicators,
    isLoadingMarket,
    refreshMarket,
    refreshFinance,
    logout,
    resetDemoSandbox,
  } = useApp();

  const [modalOpen, setModalOpen] = useState(false);
  const [editAcc, setEditAcc] = useState<FinanceAccount | null>(null);
  const [accountToDelete, setAccountToDelete] = useState<FinanceAccount | null>(null);
  const [deletingBankAcc, setDeletingBankAcc] = useState(false);

  // CDI / Inflation Simulator state
  const [simCapitalInput, setSimCapitalInput] = useState('10000');

  // LGPD Export & Account Deletion Dialogs
  const [exportedJson, setExportedJson] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [deletePhrase, setDeletePhrase] = useState('');
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deletingAccount, setDeletingAccount] = useState(false);

  const accounts = dashboardData?.accounts ?? [];
  const categories = dashboardData?.categories ?? [];

  const selicRate = useMemo(() => {
    const found = marketIndicators.find((i) => i.id === 'selic');
    return found?.value ?? 13.75;
  }, [marketIndicators]);

  const ipcaRate = useMemo(() => {
    const found = marketIndicators.find((i) => i.id === 'ipca');
    return found?.value ?? 4.22;
  }, [marketIndicators]);

  const simResults = useMemo(() => {
    const principal = Math.max(0, parseBrlAmount(simCapitalInput));
    const cdiGross12m = principal * (1 + selicRate / 100);
    const cdiNet12m = principal + (cdiGross12m - principal) * 0.825; // 17.5% IR
    const poupanca12m = principal * 1.0617; // ~6.17% a.a.
    const realGainAboveInflation = cdiNet12m / (1 + ipcaRate / 100) - principal;
    return {
      principal,
      cdiNet12m,
      poupanca12m,
      realGainAboveInflation,
    };
  }, [simCapitalInput, selicRate, ipcaRate]);

  const handleOpenCreateAccount = () => {
    setEditAcc(null);
    setModalOpen(true);
  };

  const handleOpenEditAccount = (acc: FinanceAccount) => {
    setEditAcc(acc);
    setModalOpen(true);
  };

  const handleToggleArchive = async (acc: FinanceAccount) => {
    await archiveAccount(acc.id, !acc.archived);
    await refreshFinance();
  };

  const handleConfirmRemoveAccount = async () => {
    if (!accountToDelete) return;
    setDeletingBankAcc(true);
    try {
      await deleteAccount(accountToDelete.id);
      setAccountToDelete(null);
      await refreshFinance();
    } finally {
      setDeletingBankAcc(false);
    }
  };

  const handleExportLgpdData = async () => {
    try {
      const payload = await exportUserData();
      setExportedJson(JSON.stringify(payload, null, 2));
    } catch (err) {
      setExportedJson(
        JSON.stringify(
          {
            error: err instanceof Error ? err.message : 'Erro ao exportar dados.',
          },
          null,
          2
        )
      );
    }
  };

  const handleConfirmDeleteUser = async () => {
    setDeleteError(null);
    if (deletePhrase.trim().toUpperCase() !== 'EXCLUIR MINHA CONTA') {
      setDeleteError('Digite exatamente a frase EXCLUIR MINHA CONTA para confirmar.');
      return;
    }
    setDeletingAccount(true);
    try {
      await deleteUserAccount(deletePassword, deletePhrase.trim());
      setDeleteDialogOpen(false);
      await logout();
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : 'Erro ao excluir conta.');
    } finally {
      setDeletingAccount(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <AppHeader
        title="Minhas contas"
        subtitle="Acompanhe onde seu dinheiro está."
        showMonthSelector={false}
      />

      <ScrollView
        className="flex-1"
        contentContainerClassName="w-full max-w-3xl self-center gap-4 p-4 pb-12"
        showsVerticalScrollIndicator={false}>
        {/* Top Action Row */}
        <View className="flex-row items-center justify-between">
          <Text className="text-xs font-medium text-muted-foreground">
            {accounts.length} {accounts.length === 1 ? 'conta cadastrada' : 'contas cadastradas'}
          </Text>
          <Button size="sm" onPress={handleOpenCreateAccount}>
            <Icon as={PlusIcon} className="mr-1.5 size-3.5 text-primary-foreground" />
            <Text className="text-xs font-semibold text-primary-foreground">Nova conta</Text>
          </Button>
        </View>

        {/* Accounts Catalog Grid */}
        <View className="gap-3">
          {accounts.map((acc) => (
            <Card
              key={acc.id}
              className={`border-border bg-card ${acc.archived ? 'opacity-65' : ''}`}>
              <CardHeader className="flex-row items-start justify-between pb-2">
                <View className="flex-1 pr-3">
                  <CardTitle className="text-base font-bold text-foreground">
                    {acc.name}
                  </CardTitle>
                  <CardDescription className="mt-0.5 text-xs text-muted-foreground">
                    {ACCOUNT_TYPE_LABELS[acc.type ?? 'OTHER'] ?? 'Outra conta'}
                  </CardDescription>
                </View>
                <BankBadge name={acc.name} type={acc.type} size="md" />
              </CardHeader>

              <CardContent className="pb-3 pt-1">
                <Text className="text-[11px] text-muted-foreground">Saldo realizado</Text>
                <Text
                  style={TABULAR_NUMS}
                  className="mt-1 text-2xl font-bold tracking-tight text-foreground">
                  {formatBrlCurrency(acc.realized ?? 0, privateMode)}
                </Text>
                <Text className="mt-2 text-xs text-muted-foreground">
                  Projetado:{' '}
                  <Text style={TABULAR_NUMS} className="font-semibold text-foreground">
                    {formatBrlCurrency(acc.projected ?? acc.realized ?? 0, privateMode)}
                  </Text>
                </Text>
              </CardContent>

              <CardFooter className="flex-col items-stretch gap-2.5 pt-0">
                <View className="flex-row flex-wrap items-center justify-between gap-2">
                  <Badge variant="secondary">
                    <Text className="text-[10px] font-semibold">
                      {acc.includeInTotal
                        ? 'Incluída no saldo total'
                        : 'Fora do saldo total'}
                    </Text>
                  </Badge>
                  {acc.archived ? (
                    <Badge variant="outline">
                      <Text className="text-[10px] text-muted-foreground">Arquivada</Text>
                    </Badge>
                  ) : null}
                </View>

                <View className="flex-row flex-wrap items-center justify-end gap-1.5 border-t border-border/70 pt-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-9 flex-row items-center gap-1.5 px-3"
                    hitSlop={6}
                    onPress={() => handleOpenEditAccount(acc)}
                    accessibilityLabel={`Editar conta ${acc.name}`}>
                    <Icon as={PencilIcon} className="size-3.5 text-muted-foreground" />
                    <Text className="text-xs font-medium text-foreground">Editar</Text>
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-9 flex-row items-center gap-1.5 px-3"
                    hitSlop={6}
                    onPress={() => void handleToggleArchive(acc)}
                    accessibilityLabel={`${acc.archived ? 'Desarquivar' : 'Arquivar'} conta ${acc.name}`}>
                    <Icon as={ArchiveIcon} className="size-3.5 text-muted-foreground" />
                    <Text className="text-xs font-medium text-foreground">
                      {acc.archived ? 'Desarquivar' : 'Arquivar'}
                    </Text>
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-9 flex-row items-center gap-1.5 px-3"
                    hitSlop={6}
                    onPress={() => setAccountToDelete(acc)}
                    accessibilityLabel={`Excluir conta ${acc.name}`}>
                    <Icon as={Trash2Icon} className="size-3.5 text-destructive" />
                    <Text className="text-xs font-medium text-destructive">Excluir</Text>
                  </Button>
                </View>
              </CardFooter>
            </Card>
          ))}

          {/* Add Account Card */}
          <Card className="border-dashed border-border bg-card">
            <CardContent className="items-center justify-center gap-1.5 py-6">
              <Text className="text-sm font-bold text-foreground">
                Um lugar para cada saldo
              </Text>
              <Text className="text-center text-xs text-muted-foreground">
                Adicione suas contas para ter uma visão completa.
              </Text>
            </CardContent>
            <CardFooter>
              <Button
                variant="outline"
                className="w-full flex-row items-center justify-center gap-1.5"
                onPress={handleOpenCreateAccount}>
                <Icon as={PlusIcon} className="size-4 text-foreground" />
                <Text className="text-xs font-semibold">Adicionar conta</Text>
              </Button>
            </CardFooter>
          </Card>
        </View>

        {/* Section 2: Market Radar & CDI/IPCA Simulator */}
        <Card className="border-border bg-card">
          <CardHeader className="flex-row items-center justify-between pb-2">
            <View className="flex-1 pr-2">
              <View className="flex-row items-center gap-1.5">
                <Icon as={CalculatorIcon} className="size-4 text-primary" />
                <CardTitle className="text-base font-bold text-foreground">
                  Calculadora de Inflação & CDI
                </CardTitle>
              </View>
              <CardDescription className="text-xs text-muted-foreground">
                Projeção para 12 meses com base na Selic ({selicRate.toFixed(2)}% a.a.) e IPCA (
                {ipcaRate.toFixed(2)}% a.a.).
              </CardDescription>
            </View>
            <Button
              size="icon"
              variant="outline"
              className="h-9 w-9"
              hitSlop={6}
              disabled={isLoadingMarket}
              onPress={() => void refreshMarket(true)}
              accessibilityLabel="Atualizar taxas de mercado">
              <Icon as={RefreshCwIcon} className="size-3.5 text-primary" />
            </Button>
          </CardHeader>

          <CardContent className="gap-3 pt-2">
            <View className="gap-1.5">
              <Label nativeID="sim-cap">Capital Aplicado (R$)</Label>
              <Input
                keyboardType="decimal-pad"
                style={TABULAR_NUMS}
                value={simCapitalInput}
                onChangeText={(v) => setSimCapitalInput(sanitizeAmountInput(v))}
              />
            </View>

            <View className="flex-row flex-wrap gap-2">
              <View className="min-w-[46%] flex-1 rounded-lg border border-primary/40 bg-primary/10 p-3">
                <Text className="text-[10px] font-bold uppercase text-primary">
                  100% CDI Líquido (12m)
                </Text>
                <Text style={TABULAR_NUMS} className="mt-0.5 text-sm font-bold text-foreground">
                  {formatBrlCurrency(simResults.cdiNet12m, privateMode)}
                </Text>
                <Text className="text-[10px] text-muted-foreground">Já descontado IR (17,5%)</Text>
              </View>

              <View className="min-w-[46%] flex-1 rounded-lg border border-border bg-background/70 p-3">
                <Text className="text-[10px] font-bold uppercase text-muted-foreground">
                  Ganho Real Acima do IPCA
                </Text>
                <Text style={TABULAR_NUMS} className="mt-0.5 text-sm font-bold text-primary">
                  +{formatBrlCurrency(simResults.realGainAboveInflation, privateMode)}
                </Text>
                <Text className="text-[10px] text-muted-foreground">
                  Poupança: {formatBrlCurrency(simResults.poupanca12m, privateMode)}
                </Text>
              </View>
            </View>
          </CardContent>
        </Card>

        {/* Section 3: Profile, Sandbox & LGPD Compliance */}
        <Card className="border-border bg-card">
          <CardHeader className="pb-2">
            <View className="flex-row items-center gap-1.5">
              <Icon as={ShieldCheckIcon} className="size-4 text-primary" />
              <CardTitle className="text-base font-bold text-foreground">
                Privacidade & Seus Dados (LGPD)
              </CardTitle>
            </View>
            <CardDescription className="text-xs text-muted-foreground">
              {user?.name} • {user?.email}
            </CardDescription>
          </CardHeader>

          <CardContent className="gap-2.5 pt-2">
            <Button
              variant="outline"
              className="w-full flex-row items-center justify-start gap-2.5"
              onPress={() => void handleExportLgpdData()}>
              <Icon as={DownloadIcon} className="size-4 text-primary" />
              <Text className="text-xs font-semibold">
                Exportar Meus Dados Pessoais (Portabilidade LGPD JSON)
              </Text>
            </Button>

            {isDemo ? (
              <Button
                variant="outline"
                className="w-full flex-row items-center justify-start gap-2.5"
                onPress={() => void resetDemoSandbox()}>
                <Icon as={RotateCcwIcon} className="size-4 text-amber-600 dark:text-amber-400" />
                <Text className="text-xs font-semibold">
                  Restaurar Dados Originais do Modo Demonstração
                </Text>
              </Button>
            ) : null}

            <Button
              variant="outline"
              className="w-full flex-row items-center justify-start gap-2.5"
              onPress={() => void logout()}>
              <Icon as={LogOutIcon} className="size-4 text-foreground" />
              <Text className="text-xs font-semibold">Sair da Sessão</Text>
            </Button>

            <Separator className="my-1" />

            <Button
              variant="destructive"
              className="w-full flex-row items-center justify-center gap-2"
              onPress={() => {
                setDeleteError(null);
                setDeletePassword('');
                setDeletePhrase('');
                setDeleteDialogOpen(true);
              }}>
              <Icon as={Trash2Icon} className="size-4 text-destructive-foreground" />
              <Text className="text-xs font-bold text-destructive-foreground">
                Excluir Minha Conta Permanentemente
              </Text>
            </Button>
          </CardContent>
        </Card>
      </ScrollView>

      <FinanceFormModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        kind="account"
        month={month}
        accounts={accounts}
        categories={categories}
        editAccount={editAcc}
        onSuccess={refreshFinance}
      />

      {/* Bank Account Deletion Confirmation AlertDialog */}
      <AlertDialog
        open={Boolean(accountToDelete)}
        onOpenChange={(o) => !o && setAccountToDelete(null)}>
        <AlertDialogContent className="border-border bg-card">
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir conta bancária?</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir a conta &ldquo;{accountToDelete?.name}&rdquo;? Esta
              ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-row justify-end gap-2">
            <AlertDialogCancel disabled={deletingBankAcc}>
              <Text>Cancelar</Text>
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive"
              disabled={deletingBankAcc}
              onPress={() => void handleConfirmRemoveAccount()}>
              <Text className="font-bold text-destructive-foreground">
                {deletingBankAcc ? 'Excluindo...' : 'Excluir'}
              </Text>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* LGPD Export Viewer Dialog */}
      <Dialog open={Boolean(exportedJson)} onOpenChange={(o) => !o && setExportedJson(null)}>
        <DialogContent className="max-h-[85%] w-[94%] max-w-md border-border bg-card p-5">
          <DialogHeader>
            <DialogTitle>Portabilidade de Dados (LGPD)</DialogTitle>
            <DialogDescription>
              Registro integral dos seus dados armazenados no ecossistema Rumvel.
            </DialogDescription>
          </DialogHeader>
          <ScrollView className="max-h-[340px] rounded-lg border border-border bg-background p-3">
            <Text className="font-mono text-[10px] text-foreground">{exportedJson}</Text>
          </ScrollView>
          <DialogFooter>
            <Button size="sm" onPress={() => setExportedJson(null)}>
              <Text>Fechar</Text>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* LGPD Account Deletion Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="w-[94%] max-w-md border-border bg-card p-5">
          <DialogHeader>
            <DialogTitle className="text-destructive">Excluir Conta Permanentemente</DialogTitle>
            <DialogDescription>
              Esta ação é irreversível e apagará todas as suas contas, lançamentos e orçamentos.
            </DialogDescription>
          </DialogHeader>

          <View className="gap-3 py-2">
            {deleteError ? (
              <View className="rounded-lg border border-destructive/40 bg-destructive/10 p-2.5">
                <Text className="text-xs text-destructive">{deleteError}</Text>
              </View>
            ) : null}

            <View className="gap-1.5">
              <Label nativeID="del-pass">Sua Senha</Label>
              <Input
                secureTextEntry
                placeholder="Digite sua senha atual"
                value={deletePassword}
                onChangeText={setDeletePassword}
              />
            </View>

            <View className="gap-1.5">
              <Label nativeID="del-phrase">
                Digite <Text className="font-bold text-destructive">EXCLUIR MINHA CONTA</Text>
              </Label>
              <Input
                placeholder="EXCLUIR MINHA CONTA"
                autoCapitalize="characters"
                value={deletePhrase}
                onChangeText={setDeletePhrase}
              />
            </View>
          </View>

          <DialogFooter className="flex-row justify-end gap-2">
            <Button variant="outline" size="sm" onPress={() => setDeleteDialogOpen(false)}>
              <Text>Cancelar</Text>
            </Button>
            <Button
              variant="destructive"
              size="sm"
              disabled={deletingAccount}
              onPress={() => void handleConfirmDeleteUser()}>
              <Text className="font-bold">
                {deletingAccount ? 'Excluindo...' : 'Confirmar Exclusão'}
              </Text>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </SafeAreaView>
  );
}
