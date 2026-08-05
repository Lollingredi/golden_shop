import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { getCollections, getProductsInCollection } from "@/lib/catalog";
import Reveal, { RevealGrid } from "@/components/Reveal";
import ProductCard from "@/components/ProductCard";
import PlaceholderMedia from "@/components/PlaceholderMedia";
import { OperatorBand } from "@/components/Operator";

export const metadata: Metadata = {
  title: "Catalogo",
  description: "Tutte le esperienze Golden: noleggio auto, wedding planner, cena sushi in delivery.",
};

export default async function CollectionsIndex() {
  const collections = await getCollections();
  const groups = await Promise.all(
    collections.map(async (c) => ({ collection: c, products: await getProductsInCollection(c.handle) }))
  );

  return (
    <>
      <section className="pagina-top px-6 lg:px-10 pb-16">
        <div className="contenuto">
          <Reveal>
            <p className="kicker mb-6">Catalogo</p>
            <h1 className="h-pagina max-w-[16ch]">
              Tutto quello che possiamo organizzare.
            </h1>
            <p className="text-[17px] leading-relaxed text-[var(--t2)] mt-8 max-w-[62ch]">
              I prezzi indicati sono il punto di partenza reale, non un'esca: cambiano
              con la data, la città e la formula. Nessun acquisto immediato — ogni voce
              porta a una richiesta.
            </p>
          </Reveal>
        </div>
      </section>

      {/* Le categorie: da qui si entra nel catalogo del singolo servizio.
          Prima erano voci nella barra in alto — ora stanno nel corpo
          della pagina, con l'immagine e la riga che le distingue. */}
      <section className="px-6 lg:px-10 pb-16">
        <div className="contenuto">
          <Reveal>
            <h2 className="kicker mb-8 border-t border-[var(--l1)] pt-10">
              Le categorie
            </h2>
          </Reveal>
          <RevealGrid className="grid gap-6 sm:grid-cols-3">
            {collections.map((c) => (
              <Link key={c.handle} href={`/collections/${c.handle}`} className="group block">
                <div className="relative aspect-[16/9] overflow-hidden bg-[var(--ink-800)]">
                  {c.image ? (
                    <Image src={c.image.url} alt={c.image.altText} fill sizes="33vw"
                      className="object-cover transition-transform duration-700 group-hover:scale-[1.04]" />
                  ) : (
                    <PlaceholderMedia label="" />
                  )}
                  <div className="absolute inset-0 bg-[var(--ink)]/45 group-hover:bg-[var(--ink)]/25 transition-colors duration-300" />
                  <h3 className="h-blocco absolute inset-0 grid place-items-center text-center px-4 text-white">
                    {c.title}
                  </h3>
                </div>
                <span className="label inline-block mt-4 text-[var(--champagne)] border-b border-[var(--champagne)]/40 pb-1 group-hover:border-[var(--champagne)] transition-colors">
                  Catalogo {c.title.toLowerCase()}
                </span>
              </Link>
            ))}
          </RevealGrid>
        </div>
      </section>

      {groups.map(({ collection: c, products }) => (
        <section key={c.handle} className="px-6 lg:px-10 pb-20 lg:pb-[120px]">
          <div className="contenuto">
            <Reveal>
              <div className="flex flex-wrap items-baseline justify-between gap-6 mb-10 border-t border-[var(--l1)] pt-10">
                <h2 className="h-sezione">{c.title}</h2>
                <Link href={`/collections/${c.handle}`}
                  className="label text-[var(--champagne)] border-b border-[var(--champagne)]/40 pb-1 hover:border-[var(--champagne)] transition-colors">
                  Vedi il servizio
                </Link>
              </div>
            </Reveal>
            <RevealGrid className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {products.map((p) => <ProductCard key={p.handle} product={p} />)}
            </RevealGrid>
          </div>
        </section>
      ))}

      {/* Innesco concierge 3 di 4 — in fondo al catalogo */}
      <OperatorBand
        contesto="Catalogo"
        titolo="Tre servizi e quindici proposte sono tante da soppesare da soli."
        testo="Dite a un concierge la data, la città e l'occasione: vi rimanda due o tre nomi invece di quindici. È il modo più rapido di uscire dal catalogo."
      />
    </>
  );
}
