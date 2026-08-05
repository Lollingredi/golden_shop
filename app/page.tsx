import Link from "next/link";
import Image from "next/image";
import { getCollections, getProductsInCollection } from "@/lib/catalog";
import Reveal, { RevealGrid } from "@/components/Reveal";
import ProductCard from "@/components/ProductCard";
import PlaceholderMedia from "@/components/PlaceholderMedia";
import RequestForm from "@/components/RequestForm";
import { OperatorLink, OperatorPopup } from "@/components/Operator";
import { BottoneLink } from "@/components/Bottone";

const steps = [
  { n: "01", t: "Arrivo", d: "Concordiamo luogo e ora con voi, non con il partner. Alle spalle, tutto è già stato provato." },
  { n: "02", t: "Rivelazione", d: "Telo nero, nastro rosso, forbici. Nessun annuncio, nessun applauso su richiesta." },
  { n: "03", t: "Il momento", d: "La colonna sonora la scegliete voi in anticipo. Da lì in poi la giornata è vostra." },
  { n: "04", t: "Il ricordo", d: "Fotografie e video entro cinque giorni, senza filigrane e senza montaggi enfatici." },
];

const how = [
  { k: "Passo uno", t: "Ci dite cosa avete in mente", d: "Anche solo una data e una città. Al resto arriviamo insieme." },
  { k: "Passo due", t: "Verifichiamo il partner", d: "Documenti, coperture, mezzo reale. Ricevete una proposta con un prezzo definitivo." },
  { k: "Passo tre", t: "Restiamo fino alla fine", d: "Un referente unico, raggiungibile durante l'intera giornata." },
];

export default async function Home() {
  const collections = await getCollections();
  const bestsellers = (await getProductsInCollection("noleggio-auto")).slice(0, 3);

  return (
    <>
      {/* ── Apertura ─────────────────────────────────────────── */}
      <section className="relative min-h-[720px] h-screen flex items-center px-6 lg:px-10">
        <Image
          src="/images/urus-nastro.jpg"
          alt="Consegna di una Lamborghini Urus con nastro"
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[var(--ink)]/85 via-[var(--ink)]/55 to-[var(--ink)]/10" />
        <div className="relative w-full contenuto">
          <Reveal immediato y={16}>
            <p className="kicker mb-6">Marketplace italiano di esperienze</p>
          </Reveal>
          <Reveal immediato y={24} delay={0.08}>
            <h1 className="h-hero max-w-[14ch] text-balance">
              Il giorno si ricorda da come è stato consegnato.
            </h1>
          </Reveal>
          <Reveal immediato y={24} delay={0.18}>
            {/* Erano due pillole a raggio pieno su fondo avorio: l'unico
                elemento arrotondato di tutto il sito, e la prima cosa che
                si vedeva. Ora sono i pulsanti del sistema, e la seconda
                apre il pannello invece di rimandare al modulo. */}
            <div className="flex flex-wrap gap-4 mt-16">
              <BottoneLink href="/collections">Scegli la tua esperienza</BottoneLink>
              <OperatorLink contesto="Apertura homepage" aspetto="contorno" misura="md" />
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── Le categorie ─────────────────────────────────────── */}
      {/* Stavano nella barra in alto, tre voci di testo. Qui hanno
          l'immagine e una riga che spiega cosa contiene il catalogo:
          si sceglie guardando, non leggendo un menu. Ogni riquadro
          porta al catalogo del servizio. */}
      <section id="servizi" className="sezione ancora">
        <div className="contenuto">
          <Reveal>
            <p className="kicker mb-6">Le categorie</p>
            <h2 className="h-sezione mb-6 max-w-[20ch]">
              Strada, cerimonia, tavola.
            </h2>
            <p className="text-[17px] leading-relaxed text-[var(--t2)] mb-16 max-w-[56ch]">
              Tre cataloghi separati, ognuno con i suoi partner e i suoi prezzi
              di partenza. Si entra da qui.
            </p>
          </Reveal>

          <RevealGrid className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {collections.map((c) => (
              <Link key={c.handle} href={`/collections/${c.handle}`} className="group block text-white">
                <div className="relative aspect-[4/5] overflow-hidden bg-[var(--ink-800)]">
                  {c.image ? (
                    <Image
                      src={c.image.url}
                      alt={c.image.altText}
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                    />
                  ) : (
                    <PlaceholderMedia label={`fotografia — ${c.title.toLowerCase()}`} />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-[var(--ink)]/70 via-[var(--ink)]/10 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-8">
                    <p className="kicker mb-3">{c.kicker}</p>
                    <h3 className="h-blocco">{c.title}</h3>
                  </div>
                </div>
                <p className="mt-4 text-sm text-[var(--muted)] leading-relaxed max-w-[38ch]">{c.description}</p>
                <span className="label inline-block mt-4 text-[var(--champagne)] border-b border-[var(--champagne)]/40 pb-1 group-hover:border-[var(--champagne)] transition-colors">
                  Catalogo {c.title.toLowerCase()}
                </span>
              </Link>
            ))}
          </RevealGrid>
        </div>
      </section>

      {/* ── Celebrity Experience ─────────────────────────────── */}
      <section className="bg-[var(--ink-800)] sezione">
        <div className="contenuto">
          <Reveal>
            <p className="kicker mb-6">Il servizio firma</p>
            <h2 className="h-sezione mb-4">Celebrity Experience</h2>
            <p className="text-[17px] leading-relaxed text-[var(--t2)] mb-16 max-w-[62ch]">
              Il veicolo arriva coperto da un telo nero e chiuso da un nastro rosso. Il cliente
              taglia il nastro. Parte la colonna sonora. Un fotografo e un videomaker restano fino alla fine.
            </p>
          </Reveal>
          <RevealGrid className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((s) => (
              <div key={s.n} className="border-t border-[var(--champagne)]/30 pt-6">
                <p className="font-display text-2xl text-[var(--champagne)] mb-4">{s.n}</p>
                <h3 className="h-blocco mb-4">{s.t}</h3>
                <p className="text-[17px] leading-relaxed text-[var(--t2)]">{s.d}</p>
              </div>
            ))}
          </RevealGrid>
        </div>
      </section>

      {/* ── In evidenza dal catalogo ─────────────────────────── */}
      <section className="sezione">
        <div className="contenuto">
          <Reveal>
            <div className="flex flex-wrap items-baseline justify-between gap-6 mb-16">
              <div>
                <p className="kicker mb-6">Dal catalogo</p>
                <h2 className="h-sezione">In evidenza questa settimana.</h2>
              </div>
              <Link href="/collections" className="label text-[var(--champagne)] border-b border-[var(--champagne)]/40 pb-1 hover:border-[var(--champagne)] transition-colors">
                Vedi tutto il catalogo
              </Link>
            </div>
          </Reveal>
          <RevealGrid className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {bestsellers.map((p) => <ProductCard key={p.handle} product={p} />)}
          </RevealGrid>
        </div>
      </section>

      {/* ── Come funziona ────────────────────────────────────── */}
      {/* zona-chiara: gli stessi token del resto del sito, ribaltati.
          Prima questa sezione si dipingeva a mano, kicker compresi
          (style inline con --gold-text), perché era l'unica chiara. */}
      <section className="zona-chiara sezione">
        <div className="contenuto">
          <Reveal>
            <div className="bg-[var(--ink-800)] border border-[var(--champagne-dk)] p-10 lg:p-24">
              <p className="kicker mb-6">Come funziona</p>
              <h2 className="h-sezione mb-16 max-w-[24ch]">
                Tre passaggi, una sola persona di riferimento.
              </h2>
              <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
                {how.map((s) => (
                  <div key={s.k}>
                    <p className="kicker mb-4">{s.k}</p>
                    <h3 className="h-blocco mb-4">{s.t}</h3>
                    <p className="text-[17px] leading-relaxed max-w-[40ch] text-[var(--t2)]">{s.d}</p>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <RequestForm origine="Modulo — Homepage" />

      {/* Innesco concierge 2 di 4 — popup, una volta per visitatore */}
      <OperatorPopup contesto="Homepage" />
    </>
  );
}
