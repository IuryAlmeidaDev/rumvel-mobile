import React from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useColorScheme } from 'nativewind';
import {
  ArrowDownRightIcon,
  ArrowUpRightIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  EyeIcon,
  EyeOffIcon,
  MoonIcon,
  RefreshCwIcon,
  SunIcon,
} from 'lucide-react-native';
import { RumvelLogo } from '@/components/brand/RumvelLogo';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { useApp } from '@/context/AppContext';
import { formatFirstAndLastName, getInitials, TABULAR_NUMS } from '@/lib/formatters';

function formatMonthDisplay(ym: string): string {
  const parts = ym.split('-');
  const year = Number(parts[0]) || new Date().getFullYear();
  const monthIdx = (Number(parts[1]) || 1) - 1;
  const date = new Date(year, monthIdx, 1);
  const formatted = new Intl.DateTimeFormat('pt-BR', {
    month: 'short',
    year: 'numeric',
  }).format(date);
  return formatted.charAt(0).toUpperCase() + formatted.slice(1).replace('.', '');
}

export interface AppHeaderProps {
  title?: string;
  subtitle?: string;
  showMonthSelector?: boolean;
  showMarketStrip?: boolean;
}

export function AppHeader({
  title,
  subtitle,
  showMonthSelector = true,
  showMarketStrip = true,
}: AppHeaderProps) {
  const router = useRouter();
  const {
    user,
    isDemo,
    privateMode,
    togglePrivateMode,
    month,
    prevMonth,
    nextMonth,
    marketIndicators,
    isLoadingFinance,
    refreshFinance,
  } = useApp();
  const { colorScheme, toggleColorScheme } = useColorScheme();
  const isDark = colorScheme !== 'light';

  const userName = formatFirstAndLastName(user?.name);
  const initials = getInitials(user?.name);

  return (
    <View className="border-b border-border bg-card px-4 pb-3 pt-2.5">
      {/* Row 1: Official Rumvel Emblem + DEMO Badge on Left; Month Selector + Utility Actions + Avatar on Right */}
      <View className="flex-row items-center justify-between gap-2">
        <View className="flex-row items-center gap-2">
          <RumvelLogo size="xs" />
          {isDemo ? (
            <Badge
              variant="secondary"
              className="h-5 border-primary/30 bg-primary/15 px-2 py-0">
              <Text className="text-[10px] font-bold text-primary">SANDBOX</Text>
            </Badge>
          ) : null}
        </View>

        <View className="flex-row items-center gap-1">
          {showMonthSelector ? (
            <View className="mr-0.5 flex-row items-center rounded-lg border border-border bg-background px-1 py-0.5">
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                hitSlop={6}
                onPress={prevMonth}
                accessibilityLabel="Mês anterior">
                <Icon as={ChevronLeftIcon} className="size-3.5 text-muted-foreground" />
              </Button>
              <Text
                style={TABULAR_NUMS}
                className="min-w-[66px] text-center text-[11px] font-semibold text-foreground">
                {formatMonthDisplay(month)}
              </Text>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                hitSlop={6}
                onPress={nextMonth}
                accessibilityLabel="Próximo mês">
                <Icon as={ChevronRightIcon} className="size-3.5 text-muted-foreground" />
              </Button>
            </View>
          ) : null}

          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-full"
            hitSlop={6}
            onPress={togglePrivateMode}
            accessibilityLabel={privateMode ? 'Mostrar valores' : 'Ocultar valores'}>
            <Icon
              as={privateMode ? EyeOffIcon : EyeIcon}
              className="size-4 text-muted-foreground"
            />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-full"
            hitSlop={6}
            onPress={() => void refreshFinance()}
            disabled={isLoadingFinance}
            accessibilityLabel="Atualizar dados">
            <Icon
              as={RefreshCwIcon}
              className={`size-4 ${isLoadingFinance ? 'text-primary' : 'text-muted-foreground'}`}
            />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-full"
            hitSlop={6}
            onPress={toggleColorScheme}
            accessibilityLabel={isDark ? 'Ativar tema claro' : 'Ativar tema escuro'}>
            <Icon
              as={isDark ? SunIcon : MoonIcon}
              className="size-4 text-muted-foreground"
            />
          </Button>

          <Pressable
            onPress={() => router.push('/(tabs)/accounts')}
            hitSlop={6}
            accessibilityRole="button"
            accessibilityLabel={`Perfil de ${userName || 'usuário'}`}
            className="ml-0.5 active:opacity-80">
            <Avatar alt={userName} className="h-7 w-7 border border-primary/40 bg-secondary">
              <AvatarFallback className="bg-secondary">
                <Text className="text-[10px] font-bold text-secondary-foreground">{initials}</Text>
              </AvatarFallback>
            </Avatar>
          </Pressable>
        </View>
      </View>

      {/* Row 2: Page Intro Title, Subtitle & Full User Name Pill */}
      {title ? (
        <View className="mt-2.5 flex-row items-start justify-between gap-2">
          <View className="flex-1">
            <Text className="text-base font-bold tracking-tight text-foreground">{title}</Text>
            {subtitle ? (
              <Text className="mt-0.5 text-xs text-muted-foreground">{subtitle}</Text>
            ) : null}
          </View>
          {userName ? (
            <Pressable
              onPress={() => router.push('/(tabs)/accounts')}
              className="rounded-full border border-border bg-background/70 px-2.5 py-1 active:opacity-80">
              <Text className="text-[11px] font-medium text-muted-foreground">{userName}</Text>
            </Pressable>
          ) : null}
        </View>
      ) : null}

      {/* Row 3: Edge-to-Edge Market Indicators Strip */}
      {showMarketStrip && marketIndicators.length > 0 ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="-mx-4 mt-2.5"
          contentContainerClassName="items-center gap-2 px-4">
          {marketIndicators.map((indicator) => {
            const pct = indicator.pctChange;
            const isUp = typeof pct === 'number' && pct > 0;
            const isDown = typeof pct === 'number' && pct < 0;
            const isIpca = indicator.id === 'ipca';
            const isBtc = indicator.id === 'btc';
            const displayValue = isBtc
              ? `R$ ${Math.round(indicator.value / 1000)}k`
              : indicator.formattedValue;

            return (
              <View
                key={indicator.id}
                className="flex-row items-center gap-1 rounded-md border border-border/80 bg-background/80 px-2.5 py-1">
                <Text className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                  {indicator.code}
                </Text>
                <Text
                  style={TABULAR_NUMS}
                  className={`text-[11px] font-semibold ${
                    isIpca ? 'text-amber-600 dark:text-amber-400' : 'text-foreground'
                  }`}>
                  {displayValue}
                </Text>
                {typeof pct === 'number' ? (
                  <View className="flex-row items-center gap-0.5">
                    {isUp ? (
                      <Icon as={ArrowUpRightIcon} className="size-2.5 text-primary" />
                    ) : isDown ? (
                      <Icon as={ArrowDownRightIcon} className="size-2.5 text-destructive" />
                    ) : null}
                    <Text
                      style={TABULAR_NUMS}
                      className={`text-[10px] font-semibold ${
                        isUp
                          ? 'text-primary'
                          : isDown
                            ? 'text-destructive'
                            : 'text-muted-foreground'
                      }`}>
                      {Math.abs(pct).toFixed(1)}%
                    </Text>
                  </View>
                ) : null}
              </View>
            );
          })}
        </ScrollView>
      ) : null}
    </View>
  );
}
