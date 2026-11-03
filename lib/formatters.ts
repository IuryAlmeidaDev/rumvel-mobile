import type { TextStyle } from 'react-native';

export const TABULAR_NUMS: TextStyle = {
  fontVariant: ['tabular-nums'],
};

/** Aceita valores brasileiros e decimais sem agrupamento; rejeita entradas malformadas. */
export function parseBrlAmount(value: string | number | undefined | null): number {
  if (typeof value === 'number') return Number.isFinite(value) ? value : NaN;
  if (value == null || !value.trim()) return 0;
  const text = value.trim().replace(/^R\$\s*/i, '');
  const brazilian = /^-?(?:\d{1,3}(?:\.\d{3})+|\d+)(?:,\d{1,2})?$/;
  const decimal = /^-?\d+(?:\.\d{1,2})?$/;
  const normalized = brazilian.test(text)
    ? text.replace(/\./g, '').replace(',', '.')
    : decimal.test(text)
      ? text
      : 'invalid';
  const amount = Number(normalized);
  return Number.isFinite(amount) ? amount : NaN;
}

export function formatBrlCurrency(value: number, privateMode = false): string {
  if (privateMode) return 'R$ ••••,••';
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(Number.isFinite(value) ? value : 0);
}

/**
 * Sanitiza a entrada de valor monetário (BRL), aceitando exclusivamente números
 * e separadores válidos (. e ,). Rejeita letras, símbolos e caracteres especiais.
 */
export function sanitizeAmountInput(value: string): string {
  if (!value) return '';

  let cleaned = value.trim().replace(/^R\$\s*/i, '');
  cleaned = cleaned.replace(/[^\d.,]/g, '');

  if (!cleaned) return '';

  if (cleaned.startsWith(',') || cleaned.startsWith('.')) {
    cleaned = '0' + cleaned;
  }

  cleaned = cleaned.replace(/([.,])\1+/g, '$1');

  const commaIndex = cleaned.indexOf(',');
  if (commaIndex !== -1) {
    const beforeComma = cleaned.slice(0, commaIndex);
    const afterComma = cleaned.slice(commaIndex + 1).replace(/[.,]/g, '');
    cleaned = `${beforeComma},${afterComma}`;
  }

  return cleaned;
}

const PT_PREPOSITIONS = new Set(['de', 'da', 'do', 'das', 'dos', 'e']);

export function capitalizeWord(word: string): string {
  if (!word) return '';
  return word
    .split('-')
    .map((hyphenPart) => {
      if (!hyphenPart) return '';
      const apostropheParts = hyphenPart.split("'");
      return apostropheParts
        .map((part) =>
          part
            ? part.charAt(0).toLocaleUpperCase('pt-BR') + part.slice(1).toLocaleLowerCase('pt-BR')
            : ''
        )
        .join("'");
    })
    .join('-');
}

export function formatProperName(name?: string | null): string {
  if (!name || !name.trim()) return '';
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '';

  return parts
    .map((word, index) => {
      const lower = word.toLocaleLowerCase('pt-BR');
      if (index > 0 && index < parts.length - 1 && PT_PREPOSITIONS.has(lower)) {
        return lower;
      }
      return capitalizeWord(word);
    })
    .join(' ');
}

export function formatFirstAndLastName(name?: string | null): string {
  if (!name || !name.trim()) return '';
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '';
  if (parts.length === 1) return capitalizeWord(parts[0]);

  const first = capitalizeWord(parts[0]);
  const last = capitalizeWord(parts[parts.length - 1]);
  return `${first} ${last}`;
}

export const formatDisplayName = formatFirstAndLastName;

export function getInitials(name?: string | null): string {
  if (!name || !name.trim()) return 'US';
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'US';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function parseDateSafe(dateStr?: string | null): Date | null {
  if (!dateStr || typeof dateStr !== 'string' || !dateStr.trim()) return null;
  const str = dateStr.trim();

  const brMatch = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(str);
  if (brMatch) {
    const [, d, m, y] = brMatch;
    const date = new Date(`${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}T12:00:00`);
    return isNaN(date.getTime()) ? null : date;
  }

  if (/^\d{4}-\d{2}-\d{2}$/.test(str)) {
    const date = new Date(`${str}T12:00:00`);
    return isNaN(date.getTime()) ? null : date;
  }

  if (/^\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}/.test(str)) {
    const date = new Date(str.replace(/\s+/, 'T'));
    return isNaN(date.getTime()) ? null : date;
  }

  const date = new Date(str);
  return isNaN(date.getTime()) ? null : date;
}

export function formatDateSafe(
  dateStr?: string | null,
  options: Intl.DateTimeFormatOptions = { day: '2-digit', month: 'short' },
  locale = 'pt-BR'
): string {
  const d = parseDateSafe(dateStr);
  if (!d) return dateStr ?? '';
  try {
    return new Intl.DateTimeFormat(locale, options).format(d);
  } catch {
    return dateStr ?? '';
  }
}

export function getTodayString(refDate = new Date()): string {
  const year = refDate.getFullYear();
  const month = String(refDate.getMonth() + 1).padStart(2, '0');
  const day = String(refDate.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
