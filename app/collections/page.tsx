import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { getCollections, getProductsInCollection } from "@/lib/catalog";
import Reveal, { RevealGrid } from "@/components/Reveal";
import ProductCard from "@/components/ProductCard";
import PlaceholderMedia from "@/components/PlaceholderMedia";

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
      <section className="px-6 lg:px-10 pt-[140px] lg:pt-[180px] pb-16">
        <div className="max-w-[1280px] mx-auto">
          <Reveal>
            <p className="kicker mb-6">Catalogo</p>
            <h1 className="font-display text-[clamp(36px,5.4vw,64px)] leading-[1.08] max-w-[16ch]">
              Tutto quello che possiamo organizzare.
            </h1>
            <p className="text-[17px] leading-relaxed text-white/70 mt-8 max-w-[62ch]">
              I prezzi indicati sono il punto di partenza reale, non un'esca: cambiano
              con la data, la città e la formula. Nessun acquisto immediato — ogni voce
              porta a una richiesta.
            </p>
          </Reveal>
        </div>
      </section>

      {/* Navigazione rapida fra i tre servizi */}
      <section className="px-6 lg:px-10 pb-16">
        <div className="max-w-[1280px] mx-auto">
          <RevealGrid className="grid gap-6 sm:grid-cols-3">
            {collections.map((c) => (
              <Link key={c.handle} href={`/collections/${c.handle}`} className="group block">
                <div className="relative aspect-[16/9] overflow-hidden bg-[var(--ink-800)]">
                  {c.image ? (
                    <Image src={c.image.url} alt={c.image.altText} fill sizes="33vw"
                      className="object-cover transition-transform duration-700 group-hover:scale-[1.04]" />
                  ) : (
                    <PlaceholderMedia label={`fotografia — ${c.title.toLowerCase()}`} />
                  )}
                  <div className="absolute inset-0 bg-[var(--ink)]/45 group-hover:bg-[var(--ink)]/25 transition-colors duration-300" />
                  <h2 className="absolute inset-0 grid place-items-center font-display text-2xl text-center px-4">
                    {c.title}
                  </h2>
                </div>
              </Link>
            ))}
          </RevealGrid>
        </div>
      </section>

      {groups.map(({ collection: c, products }) => (
        <section key={c.handle} className="px-6 lg:px-10 pb-20 lg:pb-[120px]">
          <div className="max-w-[1280px] mx-auto">
            <Reveal>
              <div className="flex flex-wrap items-baseline justify-between gap-6 mb-10 border-t border-white/10 pt-10">
                <h2 className="font-display text-2xl lg:text-3xl">{c.title}</h2>
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
    </>
  );
}
