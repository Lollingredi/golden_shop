import type { Collection, Product, Image } from "./shopify-types";

/* ────────────────────────────────────────────────────────────────
   Sorgente dati statica.

   PER LA MIGRAZIONE A SHOPIFY: sostituire il corpo delle funzioni in
   fondo al file con le chiamate alla Storefront API. Le firme e i tipi
   di ritorno restano identici, quindi nessuna pagina va toccata.
   Le funzioni sono già async proprio per questo.
   ──────────────────────────────────────────────────────────────── */

const img = (file: string, altText: string, w = 1400, h = 1750): Image => ({
  url: `/images/${file}`,
  altText,
  width: w,
  height: h,
});

const eur = (amount: string) => ({ amount, currencyCode: "EUR" });

function makeProduct(p: {
  handle: string;
  title: string;
  description: string;
  vendor: string;
  productType: string;
  collection: string;
  price: string;
  maxPrice?: string;
  image: Image;
  citta?: string;
  durata?: string;
  incluso?: string[];
  partner?: string;
  tags?: string[];
}): Product & { collectionHandle: string } {
  return {
    id: `gid://golden/Product/${p.handle}`,
    handle: p.handle,
    title: p.title,
    description: p.description,
    vendor: p.vendor,
    productType: p.productType,
    tags: p.tags ?? [],
    featuredImage: p.image,
    images: p.image ? [p.image] : [],
    priceRange: {
      minVariantPrice: eur(p.price),
      maxVariantPrice: eur(p.maxPrice ?? p.price),
    },
    variants: [
      {
        id: `gid://golden/ProductVariant/${p.handle}-1`,
        title: "Standard",
        availableForSale: true,
        price: eur(p.price),
        selectedOptions: [{ name: "Formula", value: "Standard" }],
      },
      {
        id: `gid://golden/ProductVariant/${p.handle}-2`,
        title: "Con Celebrity Experience",
        availableForSale: true,
        price: eur(p.maxPrice ?? String(Number(p.price) + 900)),
        selectedOptions: [{ name: "Formula", value: "Con Celebrity Experience" }],
      },
    ],
    metafields: {
      citta: p.citta,
      durata: p.durata,
      incluso: p.incluso,
      partner: p.partner,
    },
    collectionHandle: p.collection,
  };
}

/* ── Collezioni = i tre servizi ─────────────────────────────────── */

export const collections: Collection[] = [
  {
    id: "gid://golden/Collection/noleggio-auto",
    handle: "noleggio-auto",
    title: "Noleggio auto",
    kicker: "Servizio uno",
    description:
      "Supercar, auto d'epoca e berline con autista, consegnate dove volete.",
    intro:
      "Ogni vettura è di un partner verificato, con documenti e coperture controllati da noi prima che il vostro nome compaia su un contratto. La consegna può essere ordinaria oppure diventare la Celebrity Experience: telo nero, nastro rosso, fotografo.",
    image: img("miura-strada.jpg", "Lamborghini Miura su strada di montagna"),
  },
  {
    id: "gid://golden/Collection/wedding-planner",
    handle: "wedding-planner",
    title: "Wedding planner",
    kicker: "Servizio due",
    description:
      "Il corteo, la location, il fotografo. Una sola persona di riferimento.",
    intro:
      "Non organizziamo il vostro matrimonio al posto vostro: teniamo insieme i fornitori che lo rendono memorabile. Auto, allestimenti, riprese e tempi, coordinati da un referente unico raggiungibile per tutta la giornata.",
    image: img("urus-nastro.jpg", "Auto da cerimonia con nastro", 1800, 1012),
  },
  {
    id: "gid://golden/Collection/sushi-delivery",
    handle: "sushi-delivery",
    title: "Cena sushi in delivery",
    kicker: "Servizio tre",
    description:
      "Omakase e bottiglia scelta, consegnati a casa alla temperatura giusta.",
    intro:
      "Il sushi arriva dal banco di un itamae, non da una cucina industriale: pesce lavorato lo stesso giorno, riso a temperatura, trasporto isotermico. La bottiglia la scegliete voi, oppure la abbiniamo noi al menù.",
    image: null,
  },
];

/* ── Prodotti ───────────────────────────────────────────────────── */

const raw = [
  /* NOLEGGIO AUTO */
  makeProduct({
    handle: "lamborghini-miura-p400",
    title: "Lamborghini Miura P400",
    collection: "noleggio-auto",
    vendor: "Collezione privata — Bergamo",
    productType: "Auto d'epoca",
    price: "1900",
    maxPrice: "2800",
    image: img("miura-strada.jpg", "Lamborghini Miura P400 gialla in movimento"),
    citta: "Milano",
    durata: "1 giorno",
    partner: "Collezione privata verificata",
    tags: ["auto d'epoca", "icona", "V12"],
    description:
      "La vettura che nel 1966 ha inventato la supercar. Restauro conservativo, targa storica, meccanica revisionata. Si guida, non si espone: la consegniamo con il pieno e un briefing di quaranta minuti prima che tocchiate il volante.",
    incluso: ["Consegna e ritiro nel raggio di 80 km", "Briefing di guida", "Assicurazione kasko con franchigia dichiarata", "200 km inclusi"],
  }),
  makeProduct({
    handle: "lamborghini-urus-se",
    title: "Lamborghini Urus SE",
    collection: "noleggio-auto",
    vendor: "Concessionaria partner — Milano",
    productType: "SUV sportivo",
    price: "1200",
    maxPrice: "2100",
    image: img("urus-showroom.jpg", "Lamborghini Urus SE arancione in showroom", 2000, 700),
    citta: "Milano",
    durata: "1 giorno",
    partner: "Concessionaria ufficiale",
    tags: ["suv", "ibrida", "4 posti"],
    description:
      "L'unica della gamma con cui si può partire in quattro e portare i bagagli. Ibrida plug-in, quindi entra anche in Area C senza discussioni. La più richiesta per i trasferimenti lunghi e per chi non vuole rinunciare al comfort.",
    incluso: ["Consegna in città", "Pieno incluso", "Assicurazione kasko", "300 km inclusi"],
  }),
  makeProduct({
    handle: "lamborghini-miura-sv-concorso",
    title: "Miura SV — formula concorso",
    collection: "noleggio-auto",
    vendor: "Collezione privata — Brescia",
    productType: "Auto d'epoca",
    price: "2400",
    maxPrice: "3600",
    image: img("miura-concorso.jpg", "Lamborghini Miura SV verde a un concorso d'eleganza"),
    citta: "Su richiesta",
    durata: "Weekend",
    partner: "Collezione privata verificata",
    tags: ["concorso", "collezione", "evento"],
    description:
      "Pensata per chi porta la vettura a un concorso d'eleganza o a un raduno. Include il trasporto in bisarca chiusa fino alla sede dell'evento e un tecnico della collezione presente per tutta la durata.",
    incluso: ["Trasporto in bisarca chiusa", "Tecnico presente in loco", "Pulizia di presentazione", "Documentazione storica del telaio"],
  }),
  makeProduct({
    handle: "ferrari-portofino-serata",
    title: "Ferrari Portofino — formula serata",
    collection: "noleggio-auto",
    vendor: "Noleggiatore partner — Milano",
    productType: "Cabriolet",
    price: "1400",
    maxPrice: "2300",
    image: img("ferrari-notte.jpg", "Dettaglio notturno di una Ferrari"),
    citta: "Milano",
    durata: "18:00 – 02:00",
    partner: "Noleggiatore con licenza NCC",
    tags: ["cabriolet", "serata", "V8"],
    description:
      "Formula pensata per una sera soltanto: ritiro alle diciotto, riconsegna entro le due. Tetto rigido apribile, due posti dietro utilizzabili per le borse. La più scelta per anniversari e proposte.",
    incluso: ["Consegna all'indirizzo indicato", "Ritiro notturno", "Assicurazione kasko", "150 km inclusi"],
  }),
  makeProduct({
    handle: "rolls-royce-dawn-transfer-jet",
    title: "Rolls-Royce Dawn con transfer da jet",
    collection: "noleggio-auto",
    vendor: "Partner aviazione + NCC",
    productType: "Transfer",
    price: "3200",
    maxPrice: "4400",
    image: img("jet-rolls.jpg", "Rolls-Royce bianca accanto a un jet privato in pista"),
    citta: "Linate · Malpensa",
    durata: "Trasferimento singolo",
    partner: "Handler autorizzato in pista",
    tags: ["transfer", "aviazione", "autista"],
    description:
      "L'auto vi aspetta sottobordo, non al parcheggio. Coordiniamo l'handler dell'aeroporto e l'autista in modo che i due orari coincidano davvero, anche quando il volo slitta.",
    incluso: ["Accesso sottobordo con handler", "Autista in uniforme", "Monitoraggio del volo in tempo reale", "Attesa fino a 90 minuti"],
  }),
  makeProduct({
    handle: "murcielago-sv-showroom",
    title: "Murciélago LP670 SV",
    collection: "noleggio-auto",
    vendor: "Collezione privata — Modena",
    productType: "Supercar",
    price: "2100",
    maxPrice: "3000",
    image: img("showroom.jpg", "Lamborghini Murciélago SV arancione in showroom"),
    citta: "Modena",
    durata: "1 giorno",
    partner: "Collezione privata verificata",
    tags: ["V12", "serie limitata", "aspirato"],
    description:
      "Trecentocinquanta esemplari costruiti, V12 aspirato, cambio robotizzato. Una delle ultime Lamborghini senza filtri elettronici tra il piede e il motore. Richiede patente da almeno cinque anni.",
    incluso: ["Briefing di guida esteso", "Consegna su bisarca", "Assicurazione kasko", "150 km inclusi"],
  }),

  /* WEDDING PLANNER */
  makeProduct({
    handle: "auto-cerimonia-urus",
    title: "Auto per la cerimonia",
    collection: "wedding-planner",
    vendor: "Noleggiatore partner",
    productType: "Cerimonia",
    price: "1600",
    maxPrice: "2500",
    image: img("urus-nastro.jpg", "Lamborghini Urus nera addobbata con nastro e fiori", 1800, 1012),
    citta: "Milano · Bergamo",
    durata: "Mezza giornata",
    partner: "Noleggiatore con licenza NCC",
    tags: ["cerimonia", "autista", "addobbo"],
    description:
      "Vettura, autista in abito scuro e addobbo floreale concordato con la vostra fiorista, non con la nostra. Percorso provato il giorno prima, compresi i punti dove ci si ferma per le fotografie.",
    incluso: ["Autista in abito scuro", "Addobbo floreale coordinato", "Sopralluogo del percorso", "Attesa illimitata in chiesa"],
  }),
  makeProduct({
    handle: "corteo-supercar",
    title: "Corteo di supercar",
    collection: "wedding-planner",
    vendor: "Rete partner",
    productType: "Cerimonia",
    price: "4800",
    maxPrice: "7200",
    image: img("miura-concorso.jpg", "Corteo di auto d'epoca"),
    citta: "Su richiesta",
    durata: "Giornata intera",
    partner: "Rete di collezionisti verificati",
    tags: ["corteo", "flotta", "ospiti"],
    description:
      "Da tre a otto vetture coordinate, con partenze scaglionate perché arrivino insieme e non alla spicciolata. Include il coordinamento con il fotografo per la posa di gruppo, che è l'unico momento in cui serve davvero fermarle tutte.",
    incluso: ["Da 3 a 8 vetture", "Autisti coordinati via radio", "Prova del percorso", "Coordinamento con il fotografo"],
  }),
  makeProduct({
    handle: "location-allestimento",
    title: "Location e allestimento",
    collection: "wedding-planner",
    vendor: "Partner location",
    productType: "Allestimento",
    price: "6500",
    maxPrice: "14000",
    image: img("piazza.jpg", "Segnaposto — da sostituire con una fotografia di location"),
    citta: "Veneto · Lombardia",
    durata: "Giornata intera",
    partner: "Dimore storiche convenzionate",
    tags: ["location", "allestimento", "dimora storica"],
    description:
      "Dimore storiche, ville e corti con cui abbiamo già lavorato, quindi con planimetrie, vincoli e orari di chiusura noti in anticipo. L'allestimento floreale e luminoso è compreso nella proposta.",
    incluso: ["Sopralluogo con voi", "Allestimento floreale", "Service luci e audio", "Piano B in caso di pioggia"],
  }),
  makeProduct({
    handle: "celebrity-experience-sposi",
    title: "Celebrity Experience per gli sposi",
    collection: "wedding-planner",
    vendor: "Golden",
    productType: "Esperienza",
    price: "2900",
    maxPrice: "4200",
    image: img("ferrari-notte.jpg", "Rivelazione notturna dell'auto"),
    citta: "Ovunque in Italia",
    durata: "45 minuti",
    partner: "Crew interna Golden",
    tags: ["celebrity experience", "rivelazione", "video"],
    description:
      "Il momento in cui la vettura viene rivelata agli sposi all'uscita dal ricevimento. Telo nero, nastro rosso, colonna sonora scelta da voi in anticipo. Fotografo e videomaker restano fino alla partenza.",
    incluso: ["Telo, nastro e crew", "Colonna sonora concordata", "Video cinematico entro 5 giorni", "Album fotografico digitale"],
  }),
  makeProduct({
    handle: "servizio-fotografico-matrimonio",
    title: "Servizio fotografico e video",
    collection: "wedding-planner",
    vendor: "Studio partner",
    productType: "Fotografia",
    price: "3400",
    maxPrice: "5600",
    image: img("showroom.jpg", "Fotografo al lavoro"),
    citta: "Su richiesta",
    durata: "Giornata intera",
    partner: "Studio fotografico verificato",
    tags: ["fotografia", "video", "drone"],
    description:
      "Due fotografi e un videomaker per l'intera giornata. Consegna dei file senza filigrane e senza montaggi enfatici: il montato lungo lo ricevete grezzo, così potete farne quello che volete negli anni.",
    incluso: ["2 fotografi + 1 videomaker", "Riprese con drone dove consentito", "File originali senza filigrana", "Consegna entro 30 giorni"],
  }),

  /* SUSHI DELIVERY */
  makeProduct({
    handle: "omakase-due-champagne",
    title: "Omakase per due con Champagne",
    collection: "sushi-delivery",
    vendor: "Itamae partner — Milano",
    productType: "Cena",
    price: "280",
    maxPrice: "420",
    image: null,
    citta: "Milano",
    durata: "Consegna 19:30 – 22:00",
    partner: "Ristorante verificato",
    tags: ["omakase", "champagne", "2 persone"],
    description:
      "Venti pezzi scelti dall'itamae in base al pescato del giorno, non da un menù fisso. Riso servito a temperatura corporea, come va servito. Bottiglia di Champagne brut in ghiaccio, consegnata già fredda.",
    incluso: ["20 pezzi omakase", "Champagne brut 75 cl", "Trasporto isotermico", "Bacchette e piatti in ceramica, ritirati il giorno dopo"],
  }),
  makeProduct({
    handle: "sashimi-selection-bollicine",
    title: "Sashimi Selection e bollicine",
    collection: "sushi-delivery",
    vendor: "Itamae partner — Milano",
    productType: "Cena",
    price: "190",
    maxPrice: "310",
    image: null,
    citta: "Milano",
    durata: "Consegna 19:30 – 22:00",
    partner: "Ristorante verificato",
    tags: ["sashimi", "franciacorta", "2 persone"],
    description:
      "Solo pesce crudo, senza riso: tonno, ricciola, capasanta e il pescato del giorno. Abbinato a un Franciacorta pas dosé, che regge il grasso del tonno meglio di uno Champagne dosato.",
    incluso: ["Sashimi per due", "Franciacorta pas dosé 75 cl", "Trasporto isotermico", "Salse e wasabi fresco"],
  }),
  makeProduct({
    handle: "sushi-party-sei-magnum",
    title: "Sushi Party per sei con Magnum",
    collection: "sushi-delivery",
    vendor: "Itamae partner — Milano",
    productType: "Cena",
    price: "780",
    maxPrice: "1100",
    image: null,
    citta: "Milano · Monza",
    durata: "Consegna su appuntamento",
    partner: "Ristorante verificato",
    tags: ["6 persone", "magnum", "festa"],
    description:
      "Sessanta pezzi su vassoi da portata, pensati per stare al centro di un tavolo per tutta la sera. Magnum di Champagne da un litro e mezzo, che a tavola fa una figura diversa da due bottiglie.",
    incluso: ["60 pezzi su vassoi", "Magnum di Champagne 150 cl", "Secchiello e ghiaccio", "Ritiro del materiale il giorno dopo"],
  }),
  makeProduct({
    handle: "itamae-a-domicilio",
    title: "Itamae a domicilio",
    collection: "sushi-delivery",
    vendor: "Itamae partner — Milano",
    productType: "Chef privato",
    price: "1200",
    maxPrice: "1800",
    image: null,
    citta: "Milano",
    durata: "3 ore",
    partner: "Chef verificato",
    tags: ["chef privato", "omakase", "fino a 8"],
    description:
      "Il sushi non viaggia: arriva l'itamae e lo prepara davanti a voi, pezzo per pezzo, per un massimo di otto persone. Serve un piano di lavoro libero di almeno un metro e mezzo e un lavello raggiungibile.",
    incluso: ["Itamae per 3 ore", "Pesce e riso inclusi", "Abbinamento di due bottiglie", "Pulizia della postazione a fine servizio"],
  }),
];

const products: Product[] = raw.map(({ collectionHandle: _c, ...p }) => p);
const productCollection = new Map(raw.map((p) => [p.handle, p.collectionHandle]));

/* ────────────────────────────────────────────────────────────────
   API — SOSTITUIRE QUI PER SHOPIFY
   Le firme sono già async e i tipi già quelli della Storefront API.
   ──────────────────────────────────────────────────────────────── */

export async function getCollections(): Promise<Collection[]> {
  return collections;
}

export async function getCollection(handle: string): Promise<Collection | undefined> {
  return collections.find((c) => c.handle === handle);
}

export async function getProducts(): Promise<Product[]> {
  return products;
}

export async function getProduct(handle: string): Promise<Product | undefined> {
  return products.find((p) => p.handle === handle);
}

export async function getProductsInCollection(handle: string): Promise<Product[]> {
  return products.filter((p) => productCollection.get(p.handle) === handle);
}

export function collectionOfProduct(handle: string): string | undefined {
  return productCollection.get(handle);
}
