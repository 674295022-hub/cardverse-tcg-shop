import { Currency } from '../types/tcg';

export const CURRENCY_RATES: Record<Currency, number> = {
  THB: 1.0,
  USD: 0.028,
  JPY: 4.25,
};

export const CURRENCY_SYMBOLS: Record<Currency, string> = {
  THB: '฿',
  USD: '$',
  JPY: '¥',
};

export function formatPrice(amountInTHB: number, currency: Currency = 'THB'): string {
  const rate = CURRENCY_RATES[currency] ?? 1.0;
  const converted = amountInTHB * rate;
  const symbol = CURRENCY_SYMBOLS[currency] ?? '฿';

  if (currency === 'USD') {
    return `${symbol}${converted.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  } else if (currency === 'JPY') {
    return `${symbol}${Math.round(converted).toLocaleString('ja-JP')}`;
  } else {
    return `${symbol}${Math.round(converted).toLocaleString('th-TH')}`;
  }
}
