import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getCollection, getCollections, getProductsInCollection } from "@/lib/catalog";
import Reveal, { RevealGrid } from "@/components/Reveal";
import ProductCard from "@/components/ProductCard";
import PlaceholderMedia from "@/components/PlaceholderMedia";
import RequestForm from "@/components/RequestForm";

type Params = { params: Promise<{ handle: string }> };

/**
 * `noleggio-auto` ha una pagina dedicata (app/collections/noleggio-auto),
 * costruita sul modello base + add-on + pacchetti. Va esclusa da qui,
 * altrimenti l'export statico genererebbe due volte la stessa rotta.
 */
const ROTTE_DEDICATE = new Set(["noleggio-auto"]);

export async function generateStaticParams() {
  const collections = await getCollections();
  return collections
    .filter((c) => !ROTTE_DEDICATE.has(c.handle))
    .map((c) => ({ handle: c.handle }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { handle } = await params;
  const c = await getCollection(handle);
  if (!c) return {};
  return { title: c.title, description: c.description };
}

export default async function CollectionPage({ params }: Params) {
  const { handle } = await params;
  const collection = await getCollection(handle);
  if (!collection) notFound();
  const products = await getProductsInCollection(handle);

  return (
    <>
      <section className="relative min-h-[520px] h-[68vh] flex items-end px-6 lg:px-10 pb-16">
        {collection.image ? (
          <Image src={collection.image.url} alt={collection.image.altText} fill priority
            sizes="100vw" className="object-cover" />
        ) : (
          <div className="absolute inset-0"><PlaceholderMedia label={`apertura — ${collection.title.toLowerCase()}`} /></div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--ink)] via-[var(--ink)]/55 to-[var(--ink)]/25" />
        <div className="relative w-full max-w-[1280px] mx-auto">
          <Reveal y={16}><p className="kicker mb-6">{collection.kicker}</p></Reveal>
          <Reveal y={24} delay={0.08}>
            <h1 className="font-display text-[clamp(40px,6.4vw,72px)] leading-[1.05] max-w-[16ch]">
              {collection.title}
            </h1>
          </Reveal>
        </div>
      </section>

      <section className="px-6 lg:px-10 py-16 lg:py-24">
        <div className="max-w-[1280px] mx-auto grid gap-10 lg:grid-cols-[1fr_1.2fr] lg:gap-24">
          <Reveal><h2 className="font-display text-2xl lg:text-3xl leading-tight">{collection.description}</h2></Reveal>
          <Reveal delay={0.1}><p className="text-[17px] leading-relaxed text-white/70 max-w-[62ch]">{collection.intro}</p></Reveal>
        </div>
      </section>

      <section className="px-6 lg:px-10 pb-20 lg:pb-[120px]">
        <div className="max-w-[1280px] mx-auto">
          <Reveal>
            <p className="kicker mb-6">{products.length} proposte</p>
            <h2 className="font-display text-3xl lg:text-[40px] leading-tight mb-16">Il catalogo del servizio.</h2>
          </Reveal>
          <RevealGrid className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((p) => <ProductCard key={p.handle} product={p} />)}
          </RevealGrid>
        </div>
      </section>

      <RequestForm />
    </>
  );
}
