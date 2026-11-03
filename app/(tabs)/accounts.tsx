import React, { useMemo, useState } from 'react';
import { ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ArchiveIcon,
  CalculatorIcon,
  DownloadIcon,
  LandmarkIcon,
  LogOutIcon,
  PencilIcon,
  PlusIcon,
  RefreshCwIcon,
  RotateCcwIcon,
  ShieldCheckIcon,
  Trash2Icon,
} from 'lucide-react-native';
import { AppHeader } from '@/components/finance/AppHeader';
import { FinanceFormModal } from '@/components/finance/FinanceFormModal';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
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

  const handleRemoveAccount = async (acc: FinanceAccount) => {
    await deleteAccount(acc.id);
    await refreshFinance();
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
        title="Contas, Mercado & LGPD"
        subtitle="Saldos bancários, indicadores BCB e privacidade de dados"
        showMonthSelector={false}
      />

      <ScrollView
        className="flex-1"
        contentContainerClassName="gap-4 p-4 pb-12"
        showsVerticalScrollIndicator={false}>
        {/* Section 1: Bank Accounts */}
        <Card className="border-border bg-card">
          <CardHeader className="flex-row items-center justify-between pb-2">
            <View className="flex-1 pr-2">
              <CardTitle className="text-base font-bold text-foreground">
                Contas Bancárias & Carteiras ({accounts.length})
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground">
                Saldos realizados e projetados por instituição financeira.
              </CardDescription>
            </View>
            <Button size="sm" onPress={handleOpenCreateAccount}>
              <Icon as={PlusIcon} className="mr-1.5 size-3.5 text-primary-foreground" />
              <Text className="text-xs font-bold">Nova Conta</Text>
            </Button>
          </CardHeader>

          <CardContent className="gap-2.5 pt-2">
            {accounts.map((acc) => (
              <View
                key={acc.id}
                className={`rounded-lg border border-border bg-background/70 p-3.5 ${
                  acc.archived ? 'opacity-60' : ''
                }`}>
                <View className="flex-row items-start justify-between">
                  <View className="flex-row items-center gap-2.5">
                    <View className="h-9 w-9 items-center justify-center rounded-lg border border-primary/40 bg-primary/15">
                      <Icon as={LandmarkIcon} className="size-4 text-primary" />
                    </View>
                    <View>
                      <View className="flex-row items-center gap-1.5">
                        <Text className="text-sm font-bold text-foreground">{acc.name}</Text>
                        <Badge variant="outline" className="h-4 px-1.5 py-0">
                          <Text className="text-[9px] font-bold">{acc.type ?? 'CONTA'}</Text>
                        </Badge>
                        {acc.archived ? (
                          <Badge variant="secondary" className="h-4 px-1.5 py-0">
                            <Text className="text-[9px] font-bold">ARQUIVADA</Text>
                          </Badge>
                        ) : null}
                      </View>
                      <Text className="text-[11px] text-muted-foreground">
                        {acc.includeInTotal
                          ? 'Incluída no saldo consolidado'
                          : 'Ignorada no saldo consolidado'}
                      </Text>
                    </View>
                  </View>

                  <View className="flex-row items-center gap-1">
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7"
                      onPress={() => handleOpenEditAccount(acc)}
                      accessibilityLabel="Editar conta">
                      <Icon as={PencilIcon} className="size-3.5 text-muted-foreground" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7"
                      onPress={() => void handleToggleArchive(acc)}
                      accessibilityLabel="Arquivar ou desarquivar conta">
                      <Icon as={ArchiveIcon} className="size-3.5 text-muted-foreground" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7"
                      onPress={() => void handleRemoveAccount(acc)}
                      accessibilityLabel="Excluir conta">
                      <Icon as={Trash2Icon} className="size-3.5 text-destructive" />
                    </Button>
                  </View>
                </View>

                <Separator className="my-2.5" />

                <View className="flex-row justify-between">
                  <View>
                    <Text className="text-[10px] uppercase text-muted-foreground">
                      Saldo Realizado
                    </Text>
                    <Text style={TABULAR_NUMS} className="text-sm font-extrabold text-primary">
                      {formatBrlCurrency(acc.realized ?? 0, privateMode)}
                    </Text>
                  </View>
                  <View className="items-end">
                    <Text className="text-[10px] uppercase text-muted-foreground">
                      Saldo Projetado
                    </Text>
                    <Text style={TABULAR_NUMS} className="text-sm font-bold text-foreground">
                      {formatBrlCurrency(acc.projected ?? acc.realized ?? 0, privateMode)}
                    </Text>
                  </View>
                </View>
              </View>
            ))}
          </CardContent>
        </Card>

        {/* Section 2: Market Radar & CDI/IPCA Simulator */}
        <Card className="border-border bg-card">
          <CardHeader className="flex-row items-center justify-between pb-2">
            <View className="flex-1 pr-2">
              <View className="flex-row items-center gap-1.5">
                <Icon as={CalculatorIcon} className="size-4 text-primary" />
                <CardTitle className="text-base font-bold text-foreground">
                  Simulador de Rendimento Real (Selic vs IPCA)
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
              className="h-8 w-8"
              disabled={isLoadingMarket}
              onPress={() => void refreshMarket(true)}>
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
                <Text style={TABULAR_NUMS} className="mt-0.5 text-sm font-extrabold text-foreground">
                  {formatBrlCurrency(simResults.cdiNet12m, privateMode)}
                </Text>
                <Text className="text-[10px] text-muted-foreground">Já descontado IR (17,5%)</Text>
              </View>

              <View className="min-w-[46%] flex-1 rounded-lg border border-border bg-background/70 p-3">
                <Text className="text-[10px] font-bold uppercase text-muted-foreground">
                  Ganho Real Acima do IPCA
                </Text>
                <Text style={TABULAR_NUMS} className="mt-0.5 text-sm font-extrabold text-primary">
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
                Perfil, Segurança & Direitos LGPD
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
                <Icon as={RotateCcwIcon} className="size-4 text-amber-400" />
                <Text className="text-xs font-semibold">
                  Restaurar Dados Originais do Modo Sandbox
                </Text>
              </Button>
            ) : null}

            <Button
              variant="outline"
              className="w-full flex-row items-center justify-start gap-2.5"
              onPress={() => void logout()}>
              <Icon as={LogOutIcon} className="size-4 text-foreground" />
              <Text className="text-xs font-semibold">Encerrar Sessão com Segurança</Text>
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
              <Text className="text-xs font-bold">
                Excluir Minha Conta Permanentemente (Direito ao Esquecimento)
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
