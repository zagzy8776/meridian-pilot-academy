import { CURRENCY } from './config';

export function formatMoney(cents: number, currency: string = CURRENCY) {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: currency.toUpperCase(),
    minimumFractionDigits: 2,
  }).format(cents / 100);
}

// Stripe wants lowercase ISO; the DB stores it verbatim.
export function normaliseCurrency(c: string) {
  return String(c).trim().toLowerCase();
}