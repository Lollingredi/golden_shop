/* ────────────────────────────────────────────────────────────────
   IL MOTORE DI PREZZO

   Una funzione pura: stessi ingressi, stessa uscita, sempre.
   Non importa React, non importa Next, non legge l'ora di sistema,
   non parla con la rete. È scritta per girare in due posti:

     nel browser   per mostrare il prezzo mentre si configura
     sul server    per ricalcolarlo prima di aprire la cassa

   Sono la stessa funzione perché devono dare lo stesso numero.
   Se un giorno divergessero, il cliente vedrebbe una cifra al
   riepilogo e un'altra al pagamento — che è l'invariante I1 di
   MOTORE-PREZZO.md, e il modo più rapido per perdere una vendita.

   FORMULA
     riga = base × Mc × Ms × Ma  +  Σ(addon × Mc)  − sconto pacchetto

   Tre cose non ovvie, decise in MOTORE-PREZZO.md § 2:

   1. Gli add-on prendono il cluster ma NON l'anticipo. Un fiocco in
      raso non costa di più perché lo si ordina con tre giorni di
      preavviso: l'urgenza pesa sul mezzo e sull'equipaggio.
   2. Lo sconto pacchetto si applica per ULTIMO, sulla somma già
      moltiplicata. Altrimenti a Porto Cervo il pacchetto sconterebbe
      meno di quanto promette la scheda.
   3. `adesso` si passa da fuori. Mai Date.now() qui dentro: senza
      questo, la funzione non è verificabile e i test dipendono dal
      giorno in cui girano.

   COSA NON FA
   Non conosce il catalogo. Chi la chiama risolve gli identificativi
   in prezzi di listino e li passa qui. È il motivo per cui continuerà
   a funzionare identica quando i prezzi arriveranno da Shopify invece
   che da lib/catalog.ts.
   ──────────────────────────────────────────────────────────────── */

import { luogoById, type ClusterId } from "./luoghi";
import {
  ETICHETTE_FASCIA,
  REGOLE_VERE,
  fascia,
  regole as regoleDefault,
  stagioneDi,
  type Regole,
} from "./regole";

/* ── Ingresso ────────────────────────────────────────────────── */

export type AddonRichiesto = {
  id: string;
  titolo: string;
  /** Prezzo di listino in euro, dal catalogo */
  listino: number;
};

export type RigaRichiesta = {
  kind: "prodotto" | "pacchetto" | "esperienza";
  titolo: string;
  /** GID della variante: passa dritto a Shopify, qui non si guarda */
  merchandiseId: string;
  /** Listino base in euro */
  base: number;
  addon: AddonRichiesto[];
  /** Sconto pacchetto, da 0 a 1. Assente per le righe fuori pacchetto */
  scontoPacchetto?: number;
  quantita: number;
};

export type RichiestaQuotazione = {
  righe: RigaRichiesta[];
  /** id di lib/luoghi.ts, non testo libero */
  luogo: string;
  /** "AAAA-MM-GG" */
  dataEvento: string;
  /** L'istante della quotazione. Iniettato sempre, anche in produzione */
  adesso: Date;
};

/* ── Uscita ──────────────────────────────────────────────────── */

export type Fattore = {
  asse: "cluster" | "stagione" | "anticipo" | "luogo";
  etichetta: string;
  fattore: number;
};

export type AddonQuotato = AddonRichiesto & { quotato: number };

export type RigaQuotata = {
  kind: RigaRichiesta["kind"];
  titolo: string;
  merchandiseId: string;
  quantita: number;
  /** Listino di partenza, per mostrare "da 1.900 €" accanto al quotato */
  listino: number;
  baseQuotata: number;
  addon: AddonQuotato[];
  /** Somma add-on quotati, prima dello sconto pacchetto */
  addonLordo: number;
  /** Sconto pacchetto, in euro */
  sconto: number;
  /** Prezzo di una unità, arrotondato. È la cifra che vede il cliente */
  unitario: number;
  totale: number;
};

export type Quotazione = {
  versioneRegole: string;
  /**
   * Vero finché REGOLE_VERE è falsa: i moltiplicatori sono
   * segnaposto. L'interfaccia deve dire "indicativo" e non incassare.
   */
  provvisoria: boolean;
  luogo: { id: string; nome: string; cluster: ClusterId };
  dataEvento: string;
  giorniAnticipo: number;
  /** ISO. Entrambi servono all'invariante I2: ogni preventivo scade */
  emessaIl: string;
  scadeIl: string;
  /** La traccia: quali regole hanno prodotto questo prezzo (invariante I3) */
  fattori: Fattore[];
  righe: RigaQuotata[];
  totale: number;
  /** Quanto va ai fornitori, e quanto resta. Invariante I5: si sanno adesso */
  costoFornitore: number;
  margine: number;
};

export type CodiceErrore =
  | "carrello-vuoto"
  | "luogo-sconosciuto"
  | "luogo-non-attivo"
  | "data-non-valida"
  | "data-passata"
  | "anticipo-insufficiente"
  | "riga-non-valida";

export type Esito =
  | { ok: true; quotazione: Quotazione }
  | { ok: false; errore: CodiceErrore; messaggio: string };

/* ── Aiutanti ────────────────────────────────────────────────── */

const FORMATO_DATA = /^\d{4}-\d{2}-\d{2}$/;

/** Mezzanotte UTC del giorno di calendario: confronta date, non istanti */
function giornoUTC(d: Date): number {
  return Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
}

/** Sempre verso l'alto, a multipli di `passo`. 2.847 → 2.850, mai 2.847 */
export function arrotonda(valore: number, passo: number): number {
  if (passo <= 0) return Math.round(valore);
  return Math.ceil(valore / passo) * passo;
}

const centesimi = (n: number): number => Math.round(n * 100) / 100;

const errore = (errore: CodiceErrore, messaggio: string): Esito => ({ ok: false, errore, messaggio });

/* ── La funzione ─────────────────────────────────────────────── */

export function quota(richiesta: RichiestaQuotazione, r: Regole = regoleDefault): Esito {
  const { righe, luogo: luogoId, dataEvento, adesso } = richiesta;

  if (righe.length === 0) return errore("carrello-vuoto", "Non c'è niente da quotare.");

  const luogo = luogoById(luogoId);
  if (!luogo) return errore("luogo-sconosciuto", `Località "${luogoId}" non riconosciuta.`);
  if (!luogo.attivo)
    return errore("luogo-non-attivo", `${luogo.nome} non è ancora fra le località servite.`);

  if (!FORMATO_DATA.test(dataEvento))
    return errore("data-non-valida", "La data va scritta come AAAA-MM-GG.");
  const data = new Date(`${dataEvento}T00:00:00Z`);
  if (Number.isNaN(data.getTime())) return errore("data-non-valida", "Data inesistente.");

  const giorni = Math.round((giornoUTC(data) - giornoUTC(adesso)) / 86_400_000);
  if (giorni < 0) return errore("data-passata", "La data dell'evento è già passata.");
  if (giorni < r.anticipoMinimoGiorni)
    return errore(
      "anticipo-insufficiente",
      "Sotto questo preavviso la disponibilità va verificata da un concierge.",
    );

  for (const riga of righe) {
    if (riga.quantita < 1 || !Number.isFinite(riga.base) || riga.base < 0)
      return errore("riga-non-valida", `Riga "${riga.titolo}" incoerente.`);
  }

  /* I tre moltiplicatori, più l'eventuale correzione di località */
  const rc = r.cluster[luogo.cluster];
  const stagione = stagioneDi(data, luogo.cluster, r);
  const i = fascia(giorni);
  const mAnticipo = r.anticipo[i] ?? 1;
  const mLuogo = r.moltiplicatoreLuogo[luogo.id] ?? 1;

  const mc = rc.moltiplicatore * mLuogo;

  const fattori: Fattore[] = [
    { asse: "cluster", etichetta: rc.etichetta, fattore: rc.moltiplicatore },
    { asse: "stagione", etichetta: stagione.etichetta, fattore: stagione.fattore },
    { asse: "anticipo", etichetta: ETICHETTE_FASCIA[i], fattore: mAnticipo },
  ];
  if (mLuogo !== 1) fattori.push({ asse: "luogo", etichetta: luogo.nome, fattore: mLuogo });

  /* Le righe */
  const quotate: RigaQuotata[] = righe.map((riga) => {
    const baseQuotata = riga.base * mc * stagione.fattore * mAnticipo;

    const addon: AddonQuotato[] = riga.addon.map((a) => ({ ...a, quotato: a.listino * mc }));
    const addonLordo = addon.reduce((s, a) => s + a.quotato, 0);
    const sconto = addonLordo * (riga.scontoPacchetto ?? 0);

    const unitario = arrotonda(baseQuotata + addonLordo - sconto, r.arrotondamento);

    return {
      kind: riga.kind,
      titolo: riga.titolo,
      merchandiseId: riga.merchandiseId,
      quantita: riga.quantita,
      listino: riga.base + riga.addon.reduce((s, a) => s + a.listino, 0),
      baseQuotata: centesimi(baseQuotata),
      addon: addon.map((a) => ({ ...a, quotato: centesimi(a.quotato) })),
      addonLordo: centesimi(addonLordo),
      sconto: centesimi(sconto),
      unitario,
      totale: unitario * riga.quantita,
    };
  });

  const totale = quotate.reduce((s, r2) => s + r2.totale, 0);
  const costoFornitore = centesimi(totale * (1 - rc.commissione));

  const scadeIl = new Date(adesso.getTime() + r.scadenzaPreventivoMinuti * 60_000);

  return {
    ok: true,
    quotazione: {
      versioneRegole: r.versione,
      provvisoria: !REGOLE_VERE,
      luogo: { id: luogo.id, nome: luogo.nome, cluster: luogo.cluster },
      dataEvento,
      giorniAnticipo: giorni,
      emessaIl: adesso.toISOString(),
      scadeIl: scadeIl.toISOString(),
      fattori,
      righe: quotate,
      totale,
      costoFornitore,
      margine: centesimi(totale - costoFornitore),
    },
  };
}

/* ── Il contorno ─────────────────────────────────────────────── */

/** Invariante I2. Un preventivo scaduto non si paga: si riquota. */
export function scaduta(q: Quotazione, adesso: Date): boolean {
  return adesso.getTime() > new Date(q.scadeIl).getTime();
}

/**
 * Invariante I4, lato server: si ricalcola e si confronta col totale
 * che il browser ha mostrato. Se non coincide, non si apre la cassa —
 * o è passato del tempo, o qualcuno ha toccato il prezzo.
 */
export function totaleCoincide(q: Quotazione, atteso: number): boolean {
  return Math.abs(q.totale - atteso) < 0.005;
}

/** Fuori dalla funzione pura di proposito: usa il generatore di casualità */
export function nuovoIdPreventivo(): string {
  return `GLD-Q-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;
}
