import type { Money } from "./shopify-types";

const fmt = new Intl.NumberFormat("it-IT", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 0,
  /* Senza, Intl non raggruppa i numeri a quattro cifre: usciva
     "1900 €" invece di "1.900 €", su tutti i prezzi sotto i diecimila. */
  useGrouping: true,
});

/** "1900.00" → "€ 1.900" */
export function formatMoney(m: Money): string {
  return fmt.format(Number(m.amount)).replace(/ /g, " ");
}

/** Prezzo di listino in scheda: "da € 1.900" */
export function fromPrice(m: Money): string {
  return `da ${formatMoney(m)}`;
}

/** 1900 → "€ 1.900" — per i totali calcolati a runtime (configuratore) */
export function formatAmount(n: number): string {
  return fmt.format(n).replace(/ /g, " ");
}
