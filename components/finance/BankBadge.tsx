import React from 'react';
import { View } from 'react-native';
import {
  CoinsIcon,
  CreditCardIcon,
  LandmarkIcon,
  PiggyBankIcon,
  WalletIcon,
} from 'lucide-react-native';
import { Text } from '@/components/ui/text';
import { cn } from '@/lib/utils';

export interface BankPreset {
  id: string;
  name: string;
  shortName: string;
  symbol: string;
  keywords: string[];
  color: string;
  bgColor: string;
  textColor: string;
}

export const FAMOUS_BANKS: BankPreset[] = [
  {
    id: 'inter',
    name: 'Banco Inter',
    shortName: 'Inter',
    symbol: 'in',
    keywords: ['inter', 'banco inter'],
    color: '#ff7a00',
    bgColor: '#ff7a00',
    textColor: '#ffffff',
  },
  {
    id: 'nubank',
    name: 'Nubank',
    shortName: 'Nubank',
    symbol: 'Nu',
    keywords: ['nubank', 'nu', 'nu conta', 'nuconta', 'roxinho'],
    color: '#820ad1',
    bgColor: '#820ad1',
    textColor: '#ffffff',
  },
  {
    id: 'picpay',
    name: 'PicPay',
    shortName: 'PicPay',
    symbol: 'P',
    keywords: ['picpay', 'pic pay'],
    color: '#11c76f',
    bgColor: '#11c76f',
    textColor: '#ffffff',
  },
  {
    id: 'bradesco',
    name: 'Bradesco',
    shortName: 'Bradesco',
    symbol: 'B',
    keywords: ['bradesco', 'next', 'digio'],
    color: '#cc092f',
    bgColor: '#cc092f',
    textColor: '#ffffff',
  },
  {
    id: 'itau',
    name: 'Itaú',
    shortName: 'Itaú',
    symbol: 'it',
    keywords: ['itau', 'itaú', 'iti'],
    color: '#ec7000',
    bgColor: '#003399',
    textColor: '#ffbb00',
  },
  {
    id: 'santander',
    name: 'Santander',
    shortName: 'Santander',
    symbol: 'S',
    keywords: ['santander'],
    color: '#ec0000',
    bgColor: '#ec0000',
    textColor: '#ffffff',
  },
  {
    id: 'bb',
    name: 'Banco do Brasil',
    shortName: 'BB',
    symbol: 'BB',
    keywords: ['banco do brasil', 'bb'],
    color: '#fcf800',
    bgColor: '#003882',
    textColor: '#fcf800',
  },
  {
    id: 'caixa',
    name: 'Caixa Econômica',
    shortName: 'Caixa',
    symbol: 'X',
    keywords: ['caixa', 'cef', 'caixa economica', 'caixa econômica'],
    color: '#005ca9',
    bgColor: '#005ca9',
    textColor: '#f39200',
  },
  {
    id: 'c6',
    name: 'C6 Bank',
    shortName: 'C6 Bank',
    symbol: 'C6',
    keywords: ['c6', 'c6 bank', 'c6bank'],
    color: '#242424',
    bgColor: '#1a1a1a',
    textColor: '#ffffff',
  },
  {
    id: 'mercadopago',
    name: 'Mercado Pago',
    shortName: 'Mercado Pago',
    symbol: 'MP',
    keywords: ['mercado pago', 'mercadopago', 'mp'],
    color: '#00a650',
    bgColor: '#009ee3',
    textColor: '#ffffff',
  },
  {
    id: 'btg',
    name: 'BTG Pactual',
    shortName: 'BTG',
    symbol: 'BTG',
    keywords: ['btg', 'btg pactual'],
    color: '#0d1e38',
    bgColor: '#0d1e38',
    textColor: '#ffffff',
  },
  {
    id: 'xp',
    name: 'XP Investimentos',
    shortName: 'XP',
    symbol: 'XP',
    keywords: ['xp', 'xp investimentos', 'rico', 'clear'],
    color: '#000000',
    bgColor: '#111111',
    textColor: '#ffffff',
  },
  {
    id: 'pagbank',
    name: 'PagBank',
    shortName: 'PagBank',
    symbol: 'PB',
    keywords: ['pagbank', 'pagseguro'],
    color: '#00b28e',
    bgColor: '#00b28e',
    textColor: '#ffffff',
  },
  {
    id: 'neon',
    name: 'Neon',
    shortName: 'Neon',
    symbol: 'N',
    keywords: ['neon', 'banco neon'],
    color: '#00e5ff',
    bgColor: '#00294d',
    textColor: '#00e5ff',
  },
  {
    id: 'sicoob',
    name: 'Sicoob',
    shortName: 'Sicoob',
    symbol: 'Si',
    keywords: ['sicoob'],
    color: '#003641',
    bgColor: '#003641',
    textColor: '#00ae9d',
  },
  {
    id: 'sicredi',
    name: 'Sicredi',
    shortName: 'Sicredi',
    symbol: 'Sic',
    keywords: ['sicredi'],
    color: '#3ea135',
    bgColor: '#3ea135',
    textColor: '#ffffff',
  },
  {
    id: 'carteira',
    name: 'Dinheiro / Carteira',
    shortName: 'Dinheiro',
    symbol: '$',
    keywords: ['carteira', 'dinheiro', 'cash', 'bolso', 'especie', 'espécie'],
    color: '#10b981',
    bgColor: '#064e3b',
    textColor: '#34d399',
  },
];

const NORMALIZE_MAP: Record<string, string> = {
  á: 'a',
  à: 'a',
  ã: 'a',
  â: 'a',
  é: 'e',
  ê: 'e',
  í: 'i',
  ó: 'o',
  ô: 'o',
  õ: 'o',
  ú: 'u',
  ç: 'c',
};

function normalize(str?: string | null): string {
  if (!str) return '';
  return str
    .toLowerCase()
    .split('')
    .map((c) => NORMALIZE_MAP[c] || c)
    .join('');
}

export function matchBank(accountName?: string | null): BankPreset | null {
  if (!accountName) return null;
  const norm = normalize(accountName);

  for (const bank of FAMOUS_BANKS) {
    if (bank.keywords.some((kw) => norm.includes(normalize(kw)))) {
      return bank;
    }
  }
  return null;
}

export interface BankBadgeProps {
  name?: string | null;
  type?: string | null;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  className?: string;
}

export function BankBadge({
  name,
  type,
  size = 'md',
  className,
}: BankBadgeProps) {
  const bank = matchBank(name);

  const dims = {
    xs: { box: 20, radius: 6, icon: 12 },
    sm: { box: 28, radius: 8, icon: 14 },
    md: { box: 36, radius: 11, icon: 17 },
    lg: { box: 44, radius: 14, icon: 21 },
  }[size];

  const getFontSize = (len: number) => {
    if (size === 'xs') return len === 1 ? 10 : len === 2 ? 8 : 7;
    if (size === 'sm') return len === 1 ? 12 : len === 2 ? 10 : 8;
    if (size === 'lg') return len === 1 ? 18 : len === 2 ? 15 : 12;
    return len === 1 ? 14 : len === 2 ? 11 : 9;
  };

  if (bank) {
    if (bank.id === 'carteira') {
      return (
        <View
          accessible
          accessibilityLabel={name ?? 'Carteira'}
          style={{
            width: dims.box,
            height: dims.box,
            borderRadius: dims.radius,
            backgroundColor: 'rgba(16, 185, 129, 0.15)',
            borderColor: 'rgba(16, 185, 129, 0.35)',
            borderWidth: 1,
          }}
          className={cn('items-center justify-center', className)}>
          <WalletIcon size={dims.icon} color="#10b981" />
        </View>
      );
    }

    const fontSize = getFontSize(bank.symbol.length);
    return (
      <View
        accessible
        accessibilityLabel={name ?? bank.name}
        style={{
          width: dims.box,
          height: dims.box,
          borderRadius: dims.radius,
          backgroundColor: bank.bgColor,
          borderColor: `${bank.color}70`,
          borderWidth: 1,
        }}
        className={cn('items-center justify-center overflow-hidden', className)}>
        <Text
          style={{
            color: bank.textColor,
            fontSize,
            lineHeight: fontSize + 2,
          }}
          className="font-extrabold tracking-tight">
          {bank.symbol}
        </Text>
      </View>
    );
  }

  // Fallback by account type or name keywords
  const lower = (name ?? '').toLowerCase();
  let FallbackIcon = LandmarkIcon;
  let iconColor = '#00d494';
  let bg = 'rgba(0, 212, 148, 0.12)';
  let border = 'rgba(0, 212, 148, 0.28)';

  if (type === 'SAVINGS' || lower.includes('poupança') || lower.includes('poupanca')) {
    FallbackIcon = PiggyBankIcon;
    iconColor = '#10b981';
    bg = 'rgba(16, 185, 129, 0.12)';
    border = 'rgba(16, 185, 129, 0.3)';
  } else if (type === 'CASH' || lower.includes('dinheiro') || lower.includes('carteira')) {
    FallbackIcon = WalletIcon;
    iconColor = '#94a3b8';
    bg = 'rgba(148, 163, 184, 0.12)';
    border = 'rgba(148, 163, 184, 0.3)';
  } else if (lower.includes('investimento') || lower.includes('corretora')) {
    FallbackIcon = CoinsIcon;
    iconColor = '#a78bfa';
    bg = 'rgba(139, 92, 246, 0.14)';
    border = 'rgba(139, 92, 246, 0.32)';
  } else if (lower.includes('cartão') || lower.includes('cartao') || lower.includes('crédito')) {
    FallbackIcon = CreditCardIcon;
    iconColor = '#f59e0b';
    bg = 'rgba(245, 158, 11, 0.14)';
    border = 'rgba(245, 158, 11, 0.32)';
  }

  return (
    <View
      accessible
      accessibilityLabel={name || 'Conta'}
      style={{
        width: dims.box,
        height: dims.box,
        borderRadius: dims.radius,
        backgroundColor: bg,
        borderColor: border,
        borderWidth: 1,
      }}
      className={cn('items-center justify-center', className)}>
      <FallbackIcon size={dims.icon} color={iconColor} />
    </View>
  );
}
