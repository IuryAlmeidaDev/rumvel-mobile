import React from 'react';
import { ScrollView, View } from 'react-native';
import { useColorScheme } from 'nativewind';
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  EyeIcon,
  EyeOffIcon,
  MoonStarIcon,
  RefreshCwIcon,
  SparklesIcon,
  SunIcon,
  TrendingDownIcon,
  TrendingUpIcon,
} from 'lucide-react-native';
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

interface AppHeaderProps {
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

  const userName = formatFirstAndLastName(user?.name);
  const initials = getInitials(user?.name);

  return (
    <View className="border-b border-border bg-card px-4 pb-3 pt-3">
      {/* Top Row: Brand / User + Action Controls */}
      <View className="flex-row items-center justify-between gap-2">
        <View className="flex-row items-center gap-2.5">
          <Avatar alt={userName} className="h-9 w-9 border border-primary/40 bg-primary/15">
            <AvatarFallback className="bg-primary/15">
              <Text className="text-xs font-bold text-primary">{initials}</Text>
            </AvatarFallback>
          </Avatar>
          <View>
            <View className="flex-row items-center gap-1.5">
              <Text className="text-xs font-bold uppercase tracking-wider text-primary">
                RUMVEL
              </Text>
              {isDemo ? (
                <Badge variant="secondary" className="h-4 border-primary/30 bg-primary/15 px-1.5 py-0">
                  <Text className="text-[9px] font-bold text-primary">SANDBOX</Text>
                </Badge>
              ) : null}
            </View>
            <Text className="text-sm font-semibold text-foreground" numberOfLines={1}>
              {title ?? `Olá, ${userName}`}
            </Text>
            {subtitle ? (
              <Text className="text-[11px] text-muted-foreground" numberOfLines={1}>
                {subtitle}
              </Text>
            ) : null}
          </View>
        </View>

        <View className="flex-row items-center gap-1">
          {showMonthSelector ? (
            <View className="mr-1 flex-row items-center rounded-lg border border-border bg-background px-1 py-0.5">
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onPress={prevMonth}
                accessibilityLabel="Mês anterior">
                <Icon as={ChevronLeftIcon} className="size-4 text-muted-foreground" />
              </Button>
              <Text
                style={TABULAR_NUMS}
                className="min-w-[68px] text-center text-xs font-semibold text-foreground">
                {formatMonthDisplay(month)}
              </Text>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onPress={nextMonth}
                accessibilityLabel="Próximo mês">
                <Icon as={ChevronRightIcon} className="size-4 text-muted-foreground" />
              </Button>
            </View>
          ) : null}

          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-full"
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
            onPress={toggleColorScheme}
            accessibilityLabel="Alternar tema">
            <Icon
              as={colorScheme === 'dark' ? SunIcon : MoonStarIcon}
              className="size-4 text-muted-foreground"
            />
          </Button>
        </View>
      </View>

      {/* Market Indicators Strip */}
      {showMarketStrip && marketIndicators.length > 0 ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="mt-2.5"
          contentContainerClassName="gap-2 pr-2">
          {marketIndicators.map((indicator) => {
            const pct = indicator.pctChange;
            const isPositive = typeof pct === 'number' && pct > 0;
            const isNegative = typeof pct === 'number' && pct < 0;
            return (
              <View
                key={indicator.id}
                className="flex-row items-center gap-1.5 rounded-md border border-border/80 bg-background/80 px-2.5 py-1">
                <Text className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  {indicator.code}
                </Text>
                <Text
                  style={TABULAR_NUMS}
                  className="text-[11px] font-semibold text-foreground">
                  {indicator.formattedValue}
                </Text>
                {typeof pct === 'number' ? (
                  <View className="flex-row items-center gap-0.5">
                    <Icon
                      as={isPositive ? TrendingUpIcon : isNegative ? TrendingDownIcon : SparklesIcon}
                      className={`size-2.5 ${
                        isPositive
                          ? 'text-primary'
                          : isNegative
                            ? 'text-destructive'
                            : 'text-muted-foreground'
                      }`}
                    />
                    <Text
                      style={TABULAR_NUMS}
                      className={`text-[10px] font-medium ${
                        isPositive
                          ? 'text-primary'
                          : isNegative
                            ? 'text-destructive'
                            : 'text-muted-foreground'
                      }`}>
                      {pct > 0 ? `+${pct.toFixed(2)}%` : `${pct.toFixed(2)}%`}
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
