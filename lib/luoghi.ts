/* ────────────────────────────────────────────────────────────────
   I LUOGHI, E IL LORO CLUSTER

   Il prezzo dipende da dove si svolge l'evento. Un cluster non si
   ricava da un campo di testo libero: "Costa Smeralda", "Porto
   Cervo" e "Sardegna" sarebbero tre cluster diversi, e due di
   questi non esistono.

   Quindi il luogo è una scelta da un elenco chiuso. Questo file è
   quell'elenco, e serve a tre cose insieme:
     1. dare l'input geografico a lib/prezzo.ts;
     2. riempire il selettore del configuratore e del modulo;
     3. rispondere "non copriamo lì" invece di inventare un prezzo.

   L'elenco viene dalla Matrice delle Variazioni Regionali del
   catalogo servizi (sezione 1). Aggiungere una località qui è una
   riga; aggiungere un cluster è una decisione commerciale.
   ──────────────────────────────────────────────────────────────── */

export type ClusterId = "nord" | "centro" | "costiera";

export type Luogo = {
  id: string;
  nome: string;
  cluster: ClusterId;
  /**
   * Falso = la località è nel catalogo commerciale ma non la
   * vendiamo ancora. Quotarla restituisce un errore, non un prezzo.
   * Serve per dichiarare il perimetro senza cancellare la riga.
   */
  attivo: boolean;
  /** Fuori Italia: valuta, IVA e fatturazione seguono altre regole */
  estero?: boolean;
  note?: string;
};

export const luoghi: Luogo[] = [
  /* ── Cluster Milano & Nord Italia ────────────────────────────── */
  { id: "milano", nome: "Milano", cluster: "nord", attivo: true, note: "Centro e Quadrilatero" },
  { id: "como", nome: "Como e Lago di Como", cluster: "nord", attivo: true },
  { id: "garda", nome: "Lago di Garda", cluster: "nord", attivo: true },
  { id: "franciacorta", nome: "Franciacorta", cluster: "nord", attivo: true },
  {
    id: "cortina",
    nome: "Cortina d'Ampezzo",
    cluster: "nord",
    attivo: true,
    note: "Stagionalità invertita rispetto al resto del cluster — vedi lib/regole.ts",
  },

  /* ── Cluster Roma & Centro Italia ────────────────────────────── */
  { id: "roma", nome: "Roma", cluster: "centro", attivo: true, note: "Permessi ZTL e accessi VIP aeroporti" },
  { id: "chianti", nome: "Chianti", cluster: "centro", attivo: true },
  { id: "versilia", nome: "Versilia", cluster: "centro", attivo: true },
  { id: "argentario", nome: "Argentario", cluster: "centro", attivo: true },

  /* ── Cluster Costiera, Isole & Resort ────────────────────────── */
  { id: "costiera-amalfitana", nome: "Costiera Amalfitana", cluster: "costiera", attivo: true },
  { id: "capri", nome: "Capri", cluster: "costiera", attivo: true },
  { id: "costa-smeralda", nome: "Costa Smeralda", cluster: "costiera", attivo: true },
  {
    id: "ibiza",
    nome: "Ibiza",
    cluster: "costiera",
    attivo: false,
    estero: true,
    note: "Fuori perimetro del primo anno: valuta, IVA OSS e fornitori non italiani. Vedi MOTORE-PREZZO.md § 4",
  },
];

const perId = new Map(luoghi.map((l) => [l.id, l]));

export function luogoById(id: string): Luogo | undefined {
  return perId.get(id);
}

/** I luoghi che si possono davvero vendere oggi. È questo che va nel selettore. */
export function luoghiAttivi(): Luogo[] {
  return luoghi.filter((l) => l.attivo);
}

/** Luoghi attivi raggruppati per cluster, nell'ordine del catalogo. */
export function luoghiPerCluster(): { cluster: ClusterId; luoghi: Luogo[] }[] {
  const ordine: ClusterId[] = ["nord", "centro", "costiera"];
  return ordine.map((cluster) => ({
    cluster,
    luoghi: luoghiAttivi().filter((l) => l.cluster === cluster),
  }));
}
