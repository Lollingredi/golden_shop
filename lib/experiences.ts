import type { Money } from "./shopify-types";

/* ────────────────────────────────────────────────────────────────
   MODELLO ESPERIENZA — base + add-on + pacchetti

   L'auto è la BASE. Tutto il resto è ciò che rende la giornata
   memorabile. Questo file è la sola sorgente di verità: prezzi,
   testi e composizione dei pacchetti si cambiano qui.

   PER LA MIGRAZIONE A SHOPIFY
   Due strade, entrambe già previste da queste forme:

   a) Add-on come line item properties / prodotti figli
      L'auto è il prodotto principale con le sue varianti; ogni
      add-on diventa un prodotto "servizio" (`productType: "Add-on"`)
      aggiunto al carrello insieme, oppure una line item property
      con prezzo delta. `shopifyHandle` è già l'handle di destinazione.

   b) Pacchetti come prodotti preconfigurati
      Ogni ExperiencePackage diventa un prodotto a sé, con l'auto
      come opzione ("Vettura") e gli add-on già inclusi nel prezzo.
      `shopifyHandle` del pacchetto è l'handle del prodotto bundle.

   Il modello non è legato alle auto: `addons` è una lista di servizi
   agganciabile a qualunque base — barca + champagne, hotel + fiori,
   cena + musica. Cambia la base, restano gli add-on.
   ──────────────────────────────────────────────────────────────── */

const eur = (amount: string): Money => ({ amount, currencyCode: "EUR" });

/** Sconto applicato alla somma degli add-on quando si sceglie un pacchetto */
export const PACKAGE_DISCOUNT = 0.15;

export type Addon = {
  id: string;
  /** Handle del prodotto-servizio su Shopify */
  shopifyHandle: string;
  /** Nome commerciale: è questo che si vende, non il suo contenuto */
  title: string;
  /** Cosa c'è dentro, in due parole — resta sotto il nome */
  contents: string;
  /** Perché lo si compra: il momento, non l'oggetto */
  description: string;
  price: Money;
  durata: string;
  /**
   * Add-on dello stesso gruppo si escludono a vicenda.
   * "racconto" — o il fotografo, o fotografo + video: non entrambi.
   */
  group?: string;
};

export const addons: Addon[] = [
  {
    id: "the-reveal",
    shopifyHandle: "addon-the-reveal",
    title: "The Reveal",
    contents: "Telo + fiocco",
    description:
      "La vettura arriva coperta. Telo nero teso a mano, fiocco in raso, e il momento in cui viene tolto è l'unica cosa che poi si ricorda davvero. La crew resta in silenzio a bordo scena finché non è il momento.",
    price: eur("390"),
    durata: "30 minuti",
  },
  {
    id: "memories",
    shopifyHandle: "addon-memories",
    title: "Memories",
    contents: "Fotografo",
    description:
      "Un fotografo che sa dove mettersi: prende le facce, non solo la carrozzeria. Consegna i file originali, senza filigrana, entro cinque giorni.",
    price: eur("590"),
    durata: "2 ore",
    group: "racconto",
  },
  {
    id: "cinematic",
    shopifyHandle: "addon-cinematic",
    title: "Cinematic",
    contents: "Fotografo + video",
    description:
      "Come Memories, più un videomaker. Ne esce un montato breve, con l'audio dal vero, e il grezzo completo se un giorno lo vorrete rimontare.",
    price: eur("1200"),
    durata: "3 ore",
    group: "racconto",
  },
  {
    id: "romance",
    shopifyHandle: "addon-romance",
    title: "Romance",
    contents: "Fiori",
    description:
      "Composizione fresca del giorno, concordata sul colore dell'auto e non su un catalogo. Sull'abitacolo o tra le mani, come preferite.",
    price: eur("180"),
    durata: "Allestimento incluso",
  },
  {
    id: "party",
    shopifyHandle: "addon-party",
    title: "Party",
    contents: "Palloncini",
    description:
      "Allestimento a palloncini montato prima che arriviate, smontato quando ve ne andate. Nessun palloncino lasciato per strada.",
    price: eur("150"),
    durata: "Allestimento incluso",
  },
  {
    id: "celebration",
    shopifyHandle: "addon-celebration",
    title: "Celebration",
    contents: "Bottiglia + calici",
    description:
      "Bottiglia già fredda nel secchiello, calici veri di vetro. Si brinda accanto all'auto, che è il posto giusto per farlo.",
    price: eur("220"),
    durata: "Consegna in loco",
  },
  {
    id: "road-trip",
    shopifyHandle: "addon-road-trip",
    title: "Road Trip",
    contents: "Percorso panoramico",
    description:
      "Un itinerario disegnato per quella vettura: curve giuste, fondo controllato, due soste dove vale la pena fermarsi. Ve lo consegniamo già sul telefono.",
    price: eur("340"),
    durata: "Mezza giornata",
  },
  {
    id: "birthday",
    shopifyHandle: "addon-birthday",
    title: "Birthday",
    contents: "Torta + candeline",
    description:
      "Torta di pasticceria, non da banco frigo, con le candeline che servono. Arriva intera e alla temperatura giusta.",
    price: eur("160"),
    durata: "Consegna in loco",
  },
];

export const addonById = new Map(addons.map((a) => [a.id, a]));

export type ExperiencePackage = {
  id: string;
  shopifyHandle: string;
  title: string;
  /** La frase che spiega l'occasione, non il contenuto */
  claim: string;
  description: string;
  /** Add-on inclusi, in ordine di racconto. L'auto è sempre la base. */
  addonIds: string[];
  image: string | null;
  imageAlt: string;
  /** Il più venduto: una sola carta può averlo */
  evidenza?: boolean;
};

export const packages: ExperiencePackage[] = [
  {
    id: "the-big-reveal",
    shopifyHandle: "pacchetto-the-big-reveal",
    title: "The Big Reveal",
    claim: "Per chi non sa ancora niente.",
    description:
      "La sorpresa allo stato puro: l'auto coperta, il fiocco, e qualcuno che fotografa la faccia nel momento esatto in cui il telo cade. È il pacchetto che ci chiedono più spesso, e quasi sempre di nascosto.",
    addonIds: ["the-reveal", "memories"],
    image: "/images/urus-nastro-wide.jpg",
    imageAlt: "Vettura coperta con nastro, prima della rivelazione",
    evidenza: true,
  },
  {
    id: "romantic-surprise",
    shopifyHandle: "pacchetto-romantic-surprise",
    title: "Romantic Surprise",
    claim: "Per una sera che deve restare.",
    description:
      "Fiori scelti sul colore dell'auto, bottiglia fredda e calici pronti, un fotografo che sta a distanza e non interrompe. Anniversari e proposte: due terzi delle richieste di questo pacchetto finiscono con un sì.",
    addonIds: ["romance", "celebration", "memories"],
    image: "/images/ferrari-notte.jpg",
    imageAlt: "Dettaglio notturno di una vettura sportiva",
  },
  {
    id: "vip-birthday",
    shopifyHandle: "pacchetto-vip-birthday",
    title: "VIP Birthday",
    claim: "Per un compleanno che si racconta.",
    description:
      "Allestimento a palloncini montato prima che arriviate, torta vera con le candeline, e le fotografie di tutti — non solo del festeggiato. Funziona dai diciotto ai sessanta.",
    addonIds: ["party", "birthday", "memories"],
    image: "/images/urus-showroom.jpg",
    imageAlt: "Vettura arancione allestita per una festa",
  },
  {
    id: "ultimate-experience",
    shopifyHandle: "pacchetto-ultimate-experience",
    title: "Ultimate Experience",
    claim: "Per quando non si torna indietro.",
    description:
      "Tutto insieme, coordinato da un referente unico che sta con voi dall'allestimento alla partenza: rivelazione, fiori, palloncini, brindisi e il servizio fotografico completo.",
    addonIds: ["the-reveal", "romance", "party", "celebration", "memories"],
    image: "/images/showroom.jpg",
    imageAlt: "Vettura in showroom pronta per la consegna",
  },
];

/* ── Calcolo prezzi ─────────────────────────────────────────────── */

export function addonsTotal(ids: string[]): number {
  return ids.reduce((sum, id) => sum + Number(addonById.get(id)?.price.amount ?? 0), 0);
}

/** Somma add-on del pacchetto, scontata */
export function packageAddonsPrice(pkg: ExperiencePackage): number {
  return Math.round(addonsTotal(pkg.addonIds) * (1 - PACKAGE_DISCOUNT));
}

/** Quanto si risparmia scegliendo il pacchetto invece dei singoli add-on */
export function packageSaving(pkg: ExperiencePackage): number {
  return addonsTotal(pkg.addonIds) - packageAddonsPrice(pkg);
}

/* ────────────────────────────────────────────────────────────────
   API — SOSTITUIRE QUI PER SHOPIFY
   Firme già async, come in lib/catalog.ts.
   ──────────────────────────────────────────────────────────────── */

export async function getAddons(): Promise<Addon[]> {
  return addons;
}

export async function getPackages(): Promise<ExperiencePackage[]> {
  return packages;
}

export async function getPackage(id: string): Promise<ExperiencePackage | undefined> {
  return packages.find((p) => p.id === id);
}
