/* ────────────────────────────────────────────────────────────────
   Forme dati di carrello, account e richieste.

   Anche qui vale la regola di lib/shopify-types.ts: le forme sono
   quelle che la Storefront API restituirà, così la migrazione tocca
   solo l'implementazione.

   CORRISPONDENZE SHOPIFY
   ──────────────────────
   CartLine        → Cart.lines[] (CartLine)
     .merchandiseId  → merchandiseId (GID della variante)
     .attributes     → attributes[] (line item properties): è qui che
                       finiscono gli add-on scelti nel configuratore
   Cart            → Cart (checkoutUrl compreso)
   Account         → Customer (Customer Account API)
   Richiesta       → Order oppure DraftOrder, a seconda che si incassi
                     subito o si mandi un preventivo

   OGGI non c'è backend: tutto vive in localStorage, sul browser di
   chi naviga. Nessun dato esce dal dispositivo.
   ──────────────────────────────────────────────────────────────── */

export const STORAGE_KEYS = {
  cart: "golden.cart.v1",
  account: "golden.account.v1",
  richieste: "golden.richieste.v1",
  salvati: "golden.salvati.v1",
  popup: "golden.popup-operatore.v1",
} as const;

/** Attributo di riga: diventa `attributes` su Shopify */
export type LineAttribute = { key: string; value: string };

export type CartLine = {
  /** Chiave locale: base + add-on scelti. Righe identiche si sommano. */
  id: string;
  /** GID della variante Shopify da usare in fase di migrazione */
  merchandiseId: string;
  kind: "prodotto" | "pacchetto" | "esperienza";
  title: string;
  /** Riga sotto il titolo: vettura scelta, oppure formula */
  subtitle?: string;
  imageUrl: string | null;
  /** Prezzo unitario in euro, già comprensivo degli add-on della riga */
  unitPrice: number;
  quantity: number;
  /** Add-on e note: diventano line item properties */
  attributes: LineAttribute[];
  /** Quanto si è risparmiato con la formula pacchetto, se applicata */
  sconto?: number;
};

export type Account = {
  email: string;
  nome: string;
  telefono?: string;
  citta?: string;
  /** ISO date */
  dal: string;
};

export type Richiesta = {
  id: string;
  /** ISO date */
  createdAt: string;
  lines: CartLine[];
  totale: number;
  data?: string;
  citta?: string;
  note?: string;
  stato: "In lavorazione" | "Confermata" | "Conclusa";
};

/* ── Chiavi di riga ─────────────────────────────────────────────── */

/**
 * Due righe sono la stessa riga se hanno stessa base e stessi add-on.
 * Serve a far sommare le quantità invece di duplicare.
 */
export function lineKey(merchandiseId: string, attributes: LineAttribute[]): string {
  const attrs = [...attributes]
    .map((a) => `${a.key}=${a.value}`)
    .sort()
    .join("|");
  return attrs ? `${merchandiseId}::${attrs}` : merchandiseId;
}

/* ── Totali ─────────────────────────────────────────────────────── */

export function cartSubtotal(lines: CartLine[]): number {
  return lines.reduce((s, l) => s + l.unitPrice * l.quantity, 0);
}

export function cartCount(lines: CartLine[]): number {
  return lines.reduce((s, l) => s + l.quantity, 0);
}

/**
 * Acconto richiesto alla conferma. Il saldo si regola con il partner.
 * Cambiarlo qui lo cambia in tutto il sito.
 */
export const ACCONTO = 0.3;

export function acconto(totale: number): number {
  return Math.round(totale * ACCONTO);
}

/* ── localStorage con guardie ───────────────────────────────────── */

export function readStorage<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function writeStorage(key: string, value: unknown): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* quota piena o navigazione privata: si prosegue senza persistenza */
  }
}

export function makeId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}
