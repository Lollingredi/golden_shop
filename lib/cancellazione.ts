/* ────────────────────────────────────────────────────────────────
   LA POLITICA DI CANCELLAZIONE

   Sta accanto al motore di prezzo, e non altrove, per una ragione
   sola: è la stessa curva vista dal lato opposto.

   Se il prezzo sale avvicinandosi alla data, è perché avvicinandosi
   alla data i costi si bloccano — l'equipaggio è impegnato, il mezzo
   è tolto dal mercato, il fornitore ha già detto di no a qualcun
   altro. Quegli stessi costi sono quelli che non si recuperano se il
   cliente cancella. Le due curve leggono le SCAGLIONI_GIORNI di
   lib/regole.ts, così non possono divergere per distrazione.

   Nota su cosa questo file non è: la politica commerciale la scrive
   una persona e la approva un legale. Qui c'è solo il calcolo, e i
   numeri stanno in lib/regole.ts dietro REGOLE_VERE come tutti gli
   altri.
   ──────────────────────────────────────────────────────────────── */

import { ETICHETTE_FASCIA, fascia, regole as regoleDefault, type Regole } from "./regole";

export type EsitoCancellazione = {
  giorniAllEvento: number;
  fascia: string;
  /** Quota trattenuta, da 0 a 1 */
  quotaTrattenuta: number;
  /** In euro */
  trattenuto: number;
  rimborso: number;
};

function giornoUTC(d: Date): number {
  return Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
}

const centesimi = (n: number): number => Math.round(n * 100) / 100;

/**
 * Quanto si rimborsa se si cancella `adesso` un evento del
 * `dataEvento` pagato `incassato`.
 *
 * Una cancellazione a evento già passato non è una cancellazione:
 * trattiene tutto. Il caso "il servizio non è stato erogato per
 * causa nostra" non passa da qui — è un rimborso pieno deciso da
 * una persona.
 */
export function calcolaRimborso(
  incassato: number,
  dataEvento: string,
  adesso: Date,
  r: Regole = regoleDefault,
): EsitoCancellazione {
  const data = new Date(`${dataEvento}T00:00:00Z`);
  const giorni = Math.round((giornoUTC(data) - giornoUTC(adesso)) / 86_400_000);

  const i = giorni < 0 ? 0 : fascia(giorni);
  const quota = r.trattenuta[i] ?? 1;
  const trattenuto = centesimi(incassato * quota);

  return {
    giorniAllEvento: giorni,
    fascia: giorni < 0 ? "Evento già trascorso" : ETICHETTE_FASCIA[i],
    quotaTrattenuta: quota,
    trattenuto,
    rimborso: centesimi(incassato - trattenuto),
  };
}

/**
 * La curva in forma leggibile, per la pagina dei termini e per il
 * riepilogo che il cliente accetta al pagamento. Il testo delle
 * condizioni e il codice che le applica devono venire dallo stesso
 * posto, altrimenti fra sei mesi diranno due cose diverse.
 */
export function tabellaCancellazione(r: Regole = regoleDefault) {
  return ETICHETTE_FASCIA.map((etichetta, i) => ({
    etichetta,
    quotaTrattenuta: r.trattenuta[i] ?? 1,
    rimborsoPercentuale: Math.round((1 - (r.trattenuta[i] ?? 1)) * 100),
  }));
}
