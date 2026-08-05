import type { Metadata } from "next";
import Image from "next/image";
import { getCollection, getProductsInCollection } from "@/lib/catalog";
import { getPackages } from "@/lib/experiences";
import Reveal, { RevealGrid, RevealItem } from "@/components/Reveal";
import ProductCard from "@/components/ProductCard";
import PackageCard from "@/components/PackageCard";
import ExperienceBuilder, { type BaseOption } from "@/components/ExperienceBuilder";
import RequestForm from "@/components/RequestForm";
import { OperatorBand, OperatorRiga } from "@/components/Operator";
import { BottoneLink } from "@/components/Bottone";

/* ────────────────────────────────────────────────────────────────
   Pagina dedicata al servizio noleggio.

   Sostituisce la resa generica di /collections/[handle] perché qui
   il prodotto non è la vettura: è l'esperienza. La vettura è la base,
   e infatti compare dopo i pacchetti e dopo il configuratore.

   Il file dinamico [handle]/page.tsx esclude questo handle dai suoi
   generateStaticParams, così l'export statico non genera due volte
   la stessa rotta.
   ──────────────────────────────────────────────────────────────── */

export const metadata: Metadata = {
  title: "Noleggio auto — l'esperienza",
  description:
    "La vettura è la base. Rivelazione, fotografo, fiori, brindisi: si compone il momento e poi si sceglie l'auto.",
};

const passaggi = [
  {
    n: "01",
    titolo: "La base",
    testo:
      "Il noleggio vero e proprio: vettura, consegna dove dite voi, coperture e partner verificati prima che il vostro nome finisca su un contratto.",
  },
  {
    n: "02",
    titolo: "Gli add-on",
    testo:
      "Otto servizi che si agganciano alla base, ognuno con la sua crew. Si aggiungono e si tolgono fino al giorno prima, senza rifare il preventivo da capo.",
  },
  {
    n: "03",
    titolo: "Il momento",
    testo:
      "Un referente unico che coordina tutti dall'allestimento alla partenza. Voi dovete solo esserci nell'istante giusto.",
  },
];

const altriModelli = [
  { base: "Barca", addon: "Champagne al tramonto" },
  { base: "Hotel", addon: "Camera allestita a fiori" },
  { base: "Cena", addon: "Musica dal vivo" },
  { base: "Villa", addon: "Fotografo e video" },
];

export default async function NoleggioAutoPage() {
  const collection = await getCollection("noleggio-auto");
  const products = await getProductsInCollection("noleggio-auto");
  const packages = await getPackages();

  const bases: BaseOption[] = products.map((p) => ({
    handle: p.handle,
    title: p.title,
    price: Number(p.priceRange.minVariantPrice.amount),
    imageUrl: p.featuredImage?.url ?? null,
    imageAlt: p.featuredImage?.altText ?? p.title,
    citta: p.metafields.citta,
    durata: p.metafields.durata,
  }));

  /** Vettura di partenza dei pacchetti: la meno cara del servizio */
  const baseEconomica = bases.reduce((min, b) => (b.price < min.price ? b : min), bases[0]);
  const fromBase = baseEconomica.price;

  return (
    <>
      {/* ── Apertura: il momento, non la macchina ─────────────────── */}
      <section className="relative min-h-[560px] h-[76vh] flex items-end px-6 lg:px-10 pb-16">
        <Image
          src="/images/reveal-telo-nero-wide.jpg"
          alt="Vettura coperta da un telo nero teso, con nastro rosso, nel cortile di una villa all'ora blu"
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--ink)] via-[var(--ink)]/55 to-[var(--ink)]/25" />
        {/* Seconda velatura orizzontale: il titolo sta a sinistra e cadeva
            sulla parte più chiara della carrozzeria. */}
        <div className="absolute inset-0 bg-gradient-to-r from-[var(--ink)]/85 via-[var(--ink)]/40 to-transparent" />
        <div className="relative w-full contenuto">
          <Reveal immediato y={16}>
            <p className="kicker mb-6">{collection?.kicker ?? "Servizio uno"} — Noleggio auto</p>
          </Reveal>
          <Reveal immediato y={24} delay={0.08}>
            <h1 className="h-hero max-w-[17ch]">
              Non è l&apos;auto. È la faccia di chi la vede arrivare.
            </h1>
          </Reveal>
          <Reveal immediato y={20} delay={0.16}>
            <p className="text-[17px] leading-relaxed text-[var(--t2)] max-w-[54ch] mt-8">
              Il noleggio è la base. Quello che si ricorda è il telo che cade, il
              fiocco, i fiori sul sedile, il brindisi accanto alla portiera e
              qualcuno che stava fotografando nel momento giusto.
            </p>
          </Reveal>
          <Reveal immediato y={16} delay={0.24}>
            <BottoneLink href="#configura">
              Componi la tua esperienza
            </BottoneLink>
          </Reveal>
        </div>
      </section>

      {/* ── Come funziona ─────────────────────────────────────────── */}
      <section className="sezione border-b border-[var(--l1)]">
        <div className="contenuto">
          {/* Il momento in cui il telo cade, accanto alla spiegazione:
              la sezione prima raccontava a parole ciò che ora si vede. */}
          <div className="grid gap-10 lg:gap-16 md:grid-cols-2 md:items-end mb-16">
            <Reveal>
              <div className="relative aspect-[4/5] overflow-hidden">
                <Image
                  src="/images/reveal-momento.jpg"
                  alt="L'istante in cui il telo nero viene tolto dall'auto, ancora sospeso a mezz'aria"
                  fill
                  sizes="(min-width: 768px) 45vw, 100vw"
                  className="object-cover"
                />
              </div>
            </Reveal>
            <Reveal delay={0.08}>
              <p className="kicker mb-6">Come funziona</p>
              <h2 className="h-sezione max-w-[22ch]">
                Una base, otto add-on, un referente solo.
              </h2>
            </Reveal>
          </div>
          <RevealGrid className="grid gap-10 md:grid-cols-3">
            {passaggi.map((p) => (
              <RevealItem key={p.n}>
                <div className="border-t border-[var(--champagne)]/40 pt-6">
                  <span className="font-display text-[var(--champagne)] text-[15px] tracking-[0.2em]">
                    {p.n}
                  </span>
                  <h3 className="h-blocco mt-3 mb-4">{p.titolo}</h3>
                  <p className="text-[15px] leading-relaxed text-[var(--t2)]">{p.testo}</p>
                </div>
              </RevealItem>
            ))}
          </RevealGrid>
        </div>
      </section>

      {/* ── Pacchetti ─────────────────────────────────────────────── */}
      <section id="pacchetti" className="sezione ancora">
        <div className="contenuto">
          <Reveal>
            <p className="kicker mb-6">Quattro esperienze già pronte</p>
            <h2 className="h-sezione mb-6 max-w-[20ch]">
              Se sapete già che effetto volete fare.
            </h2>
            <p className="text-[17px] leading-relaxed text-[var(--t2)] max-w-[62ch] mb-16">
              Combinazioni che funzionano, con la vettura a scelta e il prezzo
              già chiuso. Costano meno degli stessi servizi presi uno per uno.
            </p>
          </Reveal>
          <RevealGrid className="grid gap-6 lg:grid-cols-2">
            {packages.map((pkg) => (
              <PackageCard
                key={pkg.id}
                pkg={pkg}
                fromBase={fromBase}
                baseTitle={baseEconomica.title}
                baseHandle={baseEconomica.handle}
              />
            ))}
          </RevealGrid>
        </div>
      </section>

      {/* ── Configuratore ─────────────────────────────────────────── */}
      <section
        id="configura"
        className="sezione bg-[var(--ink-800)]/35 border-y border-[var(--l1)] ancora"
      >
        <div className="contenuto">
          <Reveal>
            <p className="kicker mb-6">Su misura</p>
            <h2 className="h-sezione mb-6 max-w-[20ch]">
              Oppure ve la costruite voi.
            </h2>
            <p className="text-[17px] leading-relaxed text-[var(--t2)] max-w-[62ch] mb-16">
              Partite da un pacchetto e cambiatelo, o mettete insieme solo quello
              che serve. Il totale si aggiorna mentre scegliete.
            </p>
          </Reveal>
          {/* Niente <Reveal> qui: applica una trasformata temporanea, e
              dentro c'è una colonna `sticky` che si assesterebbe con un
              sussulto a fine animazione. */}
          <ExperienceBuilder bases={bases} />

          {/* Innesco concierge 4 di 4 — dove la domanda nasce, cioè
              appena finita la scelta degli add-on. Una riga, non una
              fascia: la pagina continua ancora per due sezioni. */}
          <OperatorRiga
            contesto="Dettaglio noleggio — add-on"
            testo="Si può fare la rivelazione in quel cortile? Il fotografo può restare fino a mezzanotte?"
          />
        </div>
      </section>

      {/* ── Le vetture: la base, dopo l'esperienza ────────────────── */}
      <section className="sezione">
        <div className="contenuto">
          <Reveal>
            <p className="kicker mb-6">La base — {products.length} vetture</p>
            <h2 className="h-sezione mb-6 max-w-[20ch]">
              Le macchine, per chi le vuole guardare.
            </h2>
            <p className="text-[17px] leading-relaxed text-[var(--t2)] max-w-[62ch] mb-16">
              {collection?.intro}
            </p>
          </Reveal>
          <RevealGrid className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((p) => (
              <ProductCard key={p.handle} product={p} />
            ))}
          </RevealGrid>
        </div>
      </section>

      {/* ── Lo stesso modello, ovunque ────────────────────────────── */}
      <section className="sezione border-t border-[var(--l1)]">
        <div className="contenuto grid gap-12 lg:grid-cols-[1fr_1.1fr] lg:gap-24 items-start">
          <Reveal>
            <p className="kicker mb-6">Non solo auto</p>
            <h2 className="h-sezione max-w-[16ch]">
              Cambia la base, restano gli add-on.
            </h2>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="text-[17px] leading-relaxed text-[var(--t2)] max-w-[62ch] mb-10">
              Il modello che vedete qui è lo stesso su tutti i servizi Golden:
              qualcosa che si noleggia, e intorno le persone che lo trasformano
              in un ricordo.
            </p>
            <ul className="grid gap-px bg-[var(--l1)] border border-[var(--l1)]">
              {altriModelli.map((m) => (
                <li
                  key={m.base}
                  className="bg-[var(--ink)] px-6 py-5 flex flex-wrap gap-x-4 gap-y-1 items-baseline"
                >
                  <span className="font-display text-xl min-w-[6ch]">{m.base}</span>
                  <span className="text-[var(--champagne)]">+</span>
                  <span className="text-[15px] text-[var(--t2)]">{m.addon}</span>
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </section>

      {/* La fascia larga chiude la pagina, dove chiudere ha un senso */}
      <OperatorBand
        contesto="Dettaglio noleggio"
        titolo="Una domanda sull'allestimento vale una telefonata."
        testo="La torta regge il caldo di agosto? Quel cortile è abbastanza grande per il telo? Un concierge risponde in due minuti, e conosce già i partner."
      />

      <RequestForm origine="Modulo — Noleggio auto" />
    </>
  );
}
