import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getCollection, getProductsInCollection } from "@/lib/catalog";
import { getPackages } from "@/lib/experiences";
import Reveal, { RevealGrid, RevealItem } from "@/components/Reveal";
import ProductCard from "@/components/ProductCard";
import PackageCard from "@/components/PackageCard";
import ExperienceBuilder, { type BaseOption } from "@/components/ExperienceBuilder";
import RequestForm from "@/components/RequestForm";
import { OperatorBand } from "@/components/Operator";

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
          src="/images/urus-nastro-wide.jpg"
          alt="Vettura coperta e legata con un nastro, prima della rivelazione"
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--ink)] via-[var(--ink)]/60 to-[var(--ink)]/30" />
        <div className="relative w-full max-w-[1280px] mx-auto">
          <Reveal y={16}>
            <p className="kicker mb-6">{collection?.kicker ?? "Servizio uno"} — Noleggio auto</p>
          </Reveal>
          <Reveal y={24} delay={0.08}>
            <h1 className="font-display text-[clamp(38px,6.2vw,72px)] leading-[1.05] max-w-[17ch]">
              Non è l&apos;auto. È la faccia di chi la vede arrivare.
            </h1>
          </Reveal>
          <Reveal y={20} delay={0.16}>
            <p className="text-[17px] leading-relaxed text-white/70 max-w-[54ch] mt-8">
              Il noleggio è la base. Quello che si ricorda è il telo che cade, il
              fiocco, i fiori sul sedile, il brindisi accanto alla portiera e
              qualcuno che stava fotografando nel momento giusto.
            </p>
          </Reveal>
          <Reveal y={16} delay={0.24}>
            <Link
              href="#configura"
              className="inline-block mt-10 bg-[var(--champagne)] text-[var(--ink)] label px-10 py-4 hover:bg-white transition-colors duration-200"
            >
              Componi la tua esperienza
            </Link>
          </Reveal>
        </div>
      </section>

      {/* ── Come funziona ─────────────────────────────────────────── */}
      <section className="px-6 lg:px-10 py-20 lg:py-28 border-b border-white/10">
        <div className="max-w-[1280px] mx-auto">
          <Reveal>
            <p className="kicker mb-6">Come funziona</p>
            <h2 className="font-display text-3xl lg:text-[40px] leading-tight mb-16 max-w-[22ch]">
              Una base, otto add-on, un referente solo.
            </h2>
          </Reveal>
          <RevealGrid className="grid gap-10 md:grid-cols-3">
            {passaggi.map((p) => (
              <RevealItem key={p.n}>
                <div className="border-t border-[var(--champagne)]/40 pt-6">
                  <span className="font-display text-[var(--champagne)] text-[15px] tracking-[0.2em]">
                    {p.n}
                  </span>
                  <h3 className="font-display text-2xl leading-tight mt-3 mb-4">{p.titolo}</h3>
                  <p className="text-[15px] leading-relaxed text-white/60">{p.testo}</p>
                </div>
              </RevealItem>
            ))}
          </RevealGrid>
        </div>
      </section>

      {/* ── Pacchetti ─────────────────────────────────────────────── */}
      <section id="pacchetti" className="px-6 lg:px-10 py-20 lg:py-28 scroll-mt-[72px]">
        <div className="max-w-[1280px] mx-auto">
          <Reveal>
            <p className="kicker mb-6">Quattro esperienze già pronte</p>
            <h2 className="font-display text-3xl lg:text-[40px] leading-tight mb-6 max-w-[20ch]">
              Se sapete già che effetto volete fare.
            </h2>
            <p className="text-[17px] leading-relaxed text-white/65 max-w-[62ch] mb-16">
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
        className="px-6 lg:px-10 py-20 lg:py-28 bg-[var(--ink-800)]/35 border-y border-white/10 scroll-mt-[72px]"
      >
        <div className="max-w-[1280px] mx-auto">
          <Reveal>
            <p className="kicker mb-6">Su misura</p>
            <h2 className="font-display text-3xl lg:text-[40px] leading-tight mb-6 max-w-[20ch]">
              Oppure ve la costruite voi.
            </h2>
            <p className="text-[17px] leading-relaxed text-white/65 max-w-[62ch] mb-16">
              Partite da un pacchetto e cambiatelo, o mettete insieme solo quello
              che serve. Il totale si aggiorna mentre scegliete.
            </p>
          </Reveal>
          <Reveal delay={0.08}>
            <ExperienceBuilder bases={bases} />
          </Reveal>
        </div>
      </section>

      {/* Innesco operatore 4 di 4 — subito dopo la scelta degli add-on,
          dove nascono le domande vere: si può fare, in quella data? */}
      <OperatorBand
        contesto="Dettaglio noleggio — add-on"
        titolo="Una domanda sull'allestimento vale una telefonata."
        testo="Si può fare la rivelazione in quel cortile? Il fotografo può restare fino a mezzanotte? La torta regge il caldo di agosto? Un operatore risponde in due minuti, e conosce già i partner."
      />

      {/* ── Le vetture: la base, dopo l'esperienza ────────────────── */}
      <section className="px-6 lg:px-10 py-20 lg:py-28">
        <div className="max-w-[1280px] mx-auto">
          <Reveal>
            <p className="kicker mb-6">La base — {products.length} vetture</p>
            <h2 className="font-display text-3xl lg:text-[40px] leading-tight mb-6 max-w-[20ch]">
              Le macchine, per chi le vuole guardare.
            </h2>
            <p className="text-[17px] leading-relaxed text-white/65 max-w-[62ch] mb-16">
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
      <section className="px-6 lg:px-10 py-20 lg:py-28 border-t border-white/10">
        <div className="max-w-[1280px] mx-auto grid gap-12 lg:grid-cols-[1fr_1.1fr] lg:gap-24 items-start">
          <Reveal>
            <p className="kicker mb-6">Non solo auto</p>
            <h2 className="font-display text-3xl lg:text-[40px] leading-tight max-w-[16ch]">
              Cambia la base, restano gli add-on.
            </h2>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="text-[17px] leading-relaxed text-white/65 max-w-[62ch] mb-10">
              Il modello che vedete qui è lo stesso su tutti i servizi Golden:
              qualcosa che si noleggia, e intorno le persone che lo trasformano
              in un ricordo.
            </p>
            <ul className="grid gap-px bg-white/10 border border-white/10">
              {altriModelli.map((m) => (
                <li
                  key={m.base}
                  className="bg-[var(--ink)] px-6 py-5 flex flex-wrap gap-x-4 gap-y-1 items-baseline"
                >
                  <span className="font-display text-xl min-w-[6ch]">{m.base}</span>
                  <span className="text-[var(--champagne)]">+</span>
                  <span className="text-[15px] text-white/65">{m.addon}</span>
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </section>

      <RequestForm />
    </>
  );
}
