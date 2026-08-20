/* ────────────────────────────────────────────────────────────────
   LE REGOLE DI PREZZO — DATI, NON CODICE

   Questo file non calcola niente: dichiara i moltiplicatori. Il
   calcolo sta in lib/prezzo.ts e non conosce nessun numero.

   Tre assi, nell'ordine in cui si applicano:
     Mc  cluster geografico    dove si svolge l'evento
     Ms  stagione              quando, dentro l'anno
     Ma  anticipo              quanto manca da adesso alla data

   ┌──────────────────────────────────────────────────────────────┐
   │  REGOLE_VERE = false                                         │
   │                                                              │
   │  I numeri qui sotto sono SEGNAPOSTO. Sono plausibili, non    │
   │  sono decisi: li decide chi conosce i fornitori, non chi     │
   │  scrive il codice.                                           │
   │                                                              │
   │  Finché la spia è falsa, ogni quotazione esce con            │
   │  `provvisoria: true`, e l'interfaccia deve dire "prezzo      │
   │  indicativo" invece di incassare. È lo stesso meccanismo di  │
   │  CONTATTI_VERI in lib/contatti.ts, e per la stessa ragione:  │
   │  un prezzo sbagliato mostrato come definitivo fa più danno   │
   │  di un prezzo che non c'è.                                   │
   └──────────────────────────────────────────────────────────────┘
   ──────────────────────────────────────────────────────────────── */

import type { ClusterId } from "./luoghi";

export const REGOLE_VERE = false;

/* ── Le fasce di giorni, dichiarate UNA volta ────────────────────

   Le stesse soglie governano due curve opposte: quanto costa di più
   prenotare sotto data, e quanto si trattiene se si cancella sotto
   data. Sono lo stesso costo visto dai due lati, quindi devono
   vivere sullo stesso asse — se un giorno divergono, è perché
   qualcuno ha cambiato una delle due dimenticando l'altra.

   Quattro soglie → cinque fasce:
     [0]  meno di 3 giorni
     [1]  da 3 a 7
     [2]  da 7 a 30
     [3]  da 30 a 90
     [4]  oltre 90
   ──────────────────────────────────────────────────────────────── */
export const SCAGLIONI_GIORNI = [3, 7, 30, 90] as const;

/** Indice di fascia per un numero di giorni. Unica funzione di questo file. */
export function fascia(giorni: number): number {
  for (let i = 0; i < SCAGLIONI_GIORNI.length; i++) {
    if (giorni < SCAGLIONI_GIORNI[i]) return i;
  }
  return SCAGLIONI_GIORNI.length;
}

export const ETICHETTE_FASCIA = [
  "Sotto i 3 giorni",
  "Da 3 a 7 giorni",
  "Da 7 a 30 giorni",
  "Da 30 a 90 giorni",
  "Oltre 90 giorni",
] as const;

/* ── Le forme ────────────────────────────────────────────────── */

export type RegolaCluster = {
  etichetta: string;
  /** Mc — moltiplicatore applicato a base e add-on */
  moltiplicatore: number;
  /**
   * Commissione d'intermediazione GOLDEN sul valore della riga.
   * Dal catalogo servizi § 1: 15-20% nord e centro, 20-25% costiera.
   * Qui sta un valore singolo; il costo fornitore è il resto.
   */
  commissione: number;
};

export type RegolaStagione = {
  id: string;
  etichetta: string;
  /** "MM-GG" inclusi. Se `da` > `a` il periodo scavalca il capodanno. */
  da: string;
  a: string;
  /** Ms per cluster. Un cluster assente eredita 1 */
  fattori: Partial<Record<ClusterId, number>>;
};

export type Regole = {
  /** Cambia ogni volta che cambia un numero. Finisce nella traccia dell'ordine. */
  versione: string;
  cluster: Record<ClusterId, RegolaCluster>;
  /** Il PRIMO periodo che contiene la data vince: l'ordine è significativo */
  stagioni: RegolaStagione[];
  /** Ma per fascia. Stessa lunghezza di ETICHETTE_FASCIA */
  anticipo: number[];
  /** Quota trattenuta in caso di cancellazione, per fascia. Stessa lunghezza */
  trattenuta: number[];
  /**
   * Correzione per singola località, quando il cluster è troppo grosso.
   * Caso noto: Cortina d'Ampezzo sta nel cluster nord, ma la sua alta
   * stagione è l'inverno — l'opposto di Milano. Finché il volume non
   * lo giustifica la tabella resta vuota e la grana resta quella del
   * cluster: è una semplificazione dichiarata, non una svista.
   */
  moltiplicatoreLuogo: Record<string, number>;
  /** Per quanti minuti una quotazione resta valida */
  scadenzaPreventivoMinuti: number;
  /** I totali si arrotondano a multipli di questa cifra, sempre verso l'alto */
  arrotondamento: number;
  /** Quanti giorni minimi di anticipo accettiamo. Sotto, si parla con un concierge */
  anticipoMinimoGiorni: number;
};

/* ── I numeri (provvisori) ───────────────────────────────────── */

export const regole: Regole = {
  versione: "2026-01-provvisoria",

  cluster: {
    nord: { etichetta: "Milano & Nord Italia", moltiplicatore: 1.0, commissione: 0.175 },
    centro: { etichetta: "Roma & Centro Italia", moltiplicatore: 1.0, commissione: 0.175 },
    costiera: { etichetta: "Costiera, Isole & Resort", moltiplicatore: 1.15, commissione: 0.225 },
  },

  stagioni: [
    {
      id: "ferragosto",
      etichetta: "Ferragosto",
      da: "08-05",
      a: "08-25",
      fattori: { nord: 1.05, centro: 1.1, costiera: 1.45 },
    },
    {
      id: "estate",
      etichetta: "Alta stagione estiva",
      da: "06-15",
      a: "09-15",
      fattori: { nord: 1.05, centro: 1.1, costiera: 1.3 },
    },
    {
      id: "fine-anno",
      etichetta: "Festività di fine anno",
      da: "12-20",
      a: "01-06",
      fattori: { nord: 1.2, centro: 1.15, costiera: 1.1 },
    },
  ],

  //          <3     3-7    7-30   30-90   >90
  anticipo: [1.25, 1.15, 1.0, 1.0, 0.95],
  trattenuta: [1.0, 0.75, 0.5, 0.25, 0.1],

  moltiplicatoreLuogo: {},

  scadenzaPreventivoMinuti: 30,
  arrotondamento: 10,
  anticipoMinimoGiorni: 1,
};

/* ── Lettura delle regole ────────────────────────────────────── */

const mmgg = (d: Date): string =>
  `${String(d.getUTCMonth() + 1).padStart(2, "0")}-${String(d.getUTCDate()).padStart(2, "0")}`;

/** Il periodo contiene la data? Gestisce i periodi che scavalcano il capodanno. */
export function periodoContiene(s: RegolaStagione, data: Date): boolean {
  const g = mmgg(data);
  return s.da <= s.a ? g >= s.da && g <= s.a : g >= s.da || g <= s.a;
}

export function stagioneDi(
  data: Date,
  cluster: ClusterId,
  r: Regole = regole,
): { fattore: number; etichetta: string; id: string } {
  for (const s of r.stagioni) {
    if (periodoContiene(s, data)) {
      return { fattore: s.fattori[cluster] ?? 1, etichetta: s.etichetta, id: s.id };
    }
  }
  return { fattore: 1, etichetta: "Bassa stagione", id: "bassa" };
}
