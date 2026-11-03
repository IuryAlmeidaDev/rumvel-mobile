import { formatBrlCurrency } from './formatters';
import { appStorage } from './storage';

export interface MarketIndicator {
  id: 'usd' | 'eur' | 'btc' | 'selic' | 'ipca';
  label: string;
  code: string;
  symbol: string;
  value: number;
  formattedValue: string;
  pctChange?: number;
  high?: number;
  low?: number;
  unit?: string;
  updatedAt: number;
}

export const MARKET_CACHE_KEY = 'rumvel_market_indicators_cache';

export const DEFAULT_FALLBACK_INDICATORS: MarketIndicator[] = [
  {
    id: 'usd',
    label: 'Dólar Comercial',
    code: 'USD',
    symbol: '$',
    value: 5.62,
    formattedValue: 'R$ 5,62',
    pctChange: 0.15,
    updatedAt: Date.now(),
  },
  {
    id: 'eur',
    label: 'Euro',
    code: 'EUR',
    symbol: '€',
    value: 6.18,
    formattedValue: 'R$ 6,18',
    pctChange: -0.1,
    updatedAt: Date.now(),
  },
  {
    id: 'btc',
    label: 'Bitcoin',
    code: 'BTC',
    symbol: '₿',
    value: 365000,
    formattedValue: 'R$ 365.000,00',
    pctChange: 1.25,
    updatedAt: Date.now(),
  },
  {
    id: 'selic',
    label: 'Taxa Selic',
    code: 'SELIC',
    symbol: '%',
    value: 13.75,
    formattedValue: '13,75% a.a.',
    unit: '% a.a.',
    updatedAt: Date.now(),
  },
  {
    id: 'ipca',
    label: 'Inflação (IPCA 12m)',
    code: 'IPCA',
    symbol: '%',
    value: 4.22,
    formattedValue: '4,22% a.a.',
    unit: '% a.a.',
    updatedAt: Date.now(),
  },
];

export function getStoredMarketCache(maxAgeMs?: number): MarketIndicator[] | null {
  try {
    const raw = appStorage.getItem(MARKET_CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed.data)) {
      if (typeof maxAgeMs === 'number' && typeof parsed.timestamp === 'number') {
        if (Date.now() - parsed.timestamp > maxAgeMs) {
          return null;
        }
      }
      return parsed.data;
    }
  } catch {
    // ignore
  }
  return null;
}

export function setStoredMarketCache(data: MarketIndicator[]): void {
  try {
    appStorage.setItem(MARKET_CACHE_KEY, JSON.stringify({ timestamp: Date.now(), data }));
  } catch {
    // ignore
  }
}

export function parseRateValue(value: unknown): number | undefined {
  if (typeof value === 'number' && !isNaN(value) && isFinite(value)) {
    return value;
  }
  if (typeof value === 'string') {
    let cleaned = value.trim().replace(/%/g, '').trim();
    if (cleaned.includes(',') && cleaned.includes('.')) {
      cleaned = cleaned.replace(/\./g, '').replace(',', '.');
    } else if (cleaned.includes(',')) {
      cleaned = cleaned.replace(',', '.');
    }
    const parsed = parseFloat(cleaned);
    if (!isNaN(parsed) && isFinite(parsed)) {
      return parsed;
    }
  }
  return undefined;
}

export async function fetchRatesFromBrasilApi(): Promise<{
  selic?: number;
  ipca?: number;
  cdi?: number;
} | null> {
  try {
    const res = await fetch('https://brasilapi.com.br/api/taxas/v1', {
      headers: { Accept: 'application/json' },
    });
    if (!res.ok) return null;
    const list = await res.json();
    if (!Array.isArray(list)) return null;

    const selicObj = list.find((t: { nome?: string }) => t.nome?.toLowerCase() === 'selic');
    const ipcaObj = list.find((t: { nome?: string }) => t.nome?.toLowerCase() === 'ipca');
    const cdiObj = list.find((t: { nome?: string }) => t.nome?.toLowerCase() === 'cdi');

    return {
      selic: parseRateValue(selicObj?.valor),
      ipca: parseRateValue(ipcaObj?.valor),
      cdi: parseRateValue(cdiObj?.valor),
    };
  } catch {
    return null;
  }
}

export async function fetchMarketIndicators(options?: {
  force?: boolean;
  maxAgeMs?: number;
}): Promise<MarketIndicator[]> {
  if (!options?.force && typeof options?.maxAgeMs === 'number') {
    const fresh = getStoredMarketCache(options.maxAgeMs);
    if (fresh) return fresh;
  }

  const cached = getStoredMarketCache();
  try {
    const [currenciesResult, ratesResult] = await Promise.allSettled([
      fetch('https://economia.awesomeapi.com.br/last/USD-BRL,EUR-BRL,BTC-BRL', {
        headers: { Accept: 'application/json' },
      }).then(async (res) => (res.ok ? res.json() : null)),
      fetchRatesFromBrasilApi(),
    ]);

    const currenciesData =
      currenciesResult.status === 'fulfilled' ? currenciesResult.value : null;
    const ratesData =
      ratesResult.status === 'fulfilled' && ratesResult.value ? ratesResult.value : {};

    if (!currenciesData && ratesData.selic === undefined && ratesData.ipca === undefined) {
      return cached || DEFAULT_FALLBACK_INDICATORS;
    }

    const now = Date.now();
    const cachedUsd = cached?.find((i) => i.id === 'usd');
    const cachedEur = cached?.find((i) => i.id === 'eur');
    const cachedBtc = cached?.find((i) => i.id === 'btc');
    const cachedSelic = cached?.find((i) => i.id === 'selic');
    const cachedIpca = cached?.find((i) => i.id === 'ipca');

    const usdVal = currenciesData?.USDBRL?.bid
      ? parseFloat(currenciesData.USDBRL.bid)
      : (cachedUsd?.value ?? 5.62);
    const eurVal = currenciesData?.EURBRL?.bid
      ? parseFloat(currenciesData.EURBRL.bid)
      : (cachedEur?.value ?? 6.18);
    const btcVal = currenciesData?.BTCBRL?.bid
      ? parseFloat(currenciesData.BTCBRL.bid)
      : (cachedBtc?.value ?? 365000);
    const selicVal = ratesData.selic ?? cachedSelic?.value ?? 13.75;
    const ipcaVal = ratesData.ipca ?? cachedIpca?.value ?? 4.22;

    const formatRate = (val: number) => `${val.toFixed(2).replace('.', ',')}% a.a.`;

    const indicators: MarketIndicator[] = [
      {
        id: 'usd',
        label: 'Dólar Comercial',
        code: 'USD',
        symbol: '$',
        value: usdVal,
        formattedValue: formatBrlCurrency(usdVal),
        pctChange: currenciesData?.USDBRL?.pctChange
          ? parseFloat(currenciesData.USDBRL.pctChange)
          : (cachedUsd?.pctChange ?? 0),
        updatedAt: now,
      },
      {
        id: 'eur',
        label: 'Euro',
        code: 'EUR',
        symbol: '€',
        value: eurVal,
        formattedValue: formatBrlCurrency(eurVal),
        pctChange: currenciesData?.EURBRL?.pctChange
          ? parseFloat(currenciesData.EURBRL.pctChange)
          : (cachedEur?.pctChange ?? 0),
        updatedAt: now,
      },
      {
        id: 'btc',
        label: 'Bitcoin',
        code: 'BTC',
        symbol: '₿',
        value: btcVal,
        formattedValue: formatBrlCurrency(btcVal),
        pctChange: currenciesData?.BTCBRL?.pctChange
          ? parseFloat(currenciesData.BTCBRL.pctChange)
          : (cachedBtc?.pctChange ?? 0),
        updatedAt: now,
      },
      {
        id: 'selic',
        label: 'Taxa Selic',
        code: 'SELIC',
        symbol: '%',
        value: selicVal,
        formattedValue: formatRate(selicVal),
        unit: '% a.a.',
        updatedAt: now,
      },
      {
        id: 'ipca',
        label: 'Inflação (IPCA 12m)',
        code: 'IPCA',
        symbol: '%',
        value: ipcaVal,
        formattedValue: formatRate(ipcaVal),
        unit: '% a.a.',
        updatedAt: now,
      },
    ];

    setStoredMarketCache(indicators);
    return indicators;
  } catch {
    return cached || DEFAULT_FALLBACK_INDICATORS;
  }
}
