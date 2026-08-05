import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import {
  getProduct, getProducts, getProductsInCollection,
  getCollection, collectionOfProduct,
} from "@/lib/catalog";
import Reveal, { RevealGrid } from "@/components/Reveal";
import ProductCard from "@/components/ProductCard";
import PlaceholderMedia from "@/components/PlaceholderMedia";
import ScegliFormula from "@/components/ScegliFormula";

type Params = { params: Promise<{ handle: string }> };

export async function generateStaticParams() {
  const products = await getProducts();
  return products.map((p) => ({ handle: p.handle }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { handle } = await params;
  const p = await getProduct(handle);
  if (!p) return {};
  return { title: p.title, description: p.description.slice(0, 155) };
}

export default async function ProductPage({ params }: Params) {
  const { handle } = await params;
  const product = await getProduct(handle);
  if (!product) notFound();

  const colHandle = collectionOfProduct(handle);
  const collection = colHandle ? await getCollection(colHandle) : undefined;
  const related = colHandle
    ? (await getProductsInCollection(colHandle)).filter((p) => p.handle !== handle).slice(0, 3)
    : [];

  const { featuredImage: img, metafields: m } = product;

  return (
    <>
      <div className="sotto-header px-6 lg:px-10">
        <nav aria-label="Percorso" className="contenuto text-xs text-[var(--muted)] flex gap-2 flex-wrap">
          <Link href="/collections" className="hover:text-[var(--champagne)] transition-colors">Catalogo</Link>
          {collection && (
            <>
              <span>/</span>
              <Link href={`/collections/${collection.handle}`} className="hover:text-[var(--champagne)] transition-colors">
                {collection.title}
              </Link>
            </>
          )}
          <span>/</span>
          <span className="text-[var(--t2)]">{product.title}</span>
        </nav>
      </div>

      <section className="px-6 lg:px-10 py-10 lg:py-16">
        <div className="contenuto grid gap-10 lg:grid-cols-2 lg:gap-16 items-start">
          {/* Galleria */}
          <Reveal>
            <div className="relative aspect-[4/5] overflow-hidden bg-[var(--ink-800)]">
              {img ? (
                <Image src={img.url} alt={img.altText} fill priority
                  sizes="(max-width: 1024px) 100vw, 50vw" className="object-cover" />
              ) : (
                <PlaceholderMedia label={`fotografia — ${product.title.toLowerCase()}`} />
              )}
            </div>
          </Reveal>

          {/* Colonna acquisto — sticky su desktop */}
          <Reveal delay={0.1} className="lg:sticky lg:top-[calc(var(--h-header)+32px)]">
            <p className="kicker mb-4">{product.productType}</p>
            <h1 className="h-pagina mb-4">{product.title}</h1>
            <p className="text-sm text-[var(--muted)] mb-8">{product.vendor}</p>

            {/* Prezzo, formula e acquisto stanno insieme perché si
                influenzano: cambiare formula cambia prezzo e variante. */}
            <ScegliFormula
              variants={product.variants}
              titolo={product.title}
              imageUrl={img?.url ?? null}
            />

            {colHandle === "noleggio-auto" && (
              <Link
                href="/collections/noleggio-auto#configura"
                className="group block border border-[var(--champagne)]/35 bg-[var(--champagne)]/[0.06] px-6 py-5 mb-10 hover:border-[var(--champagne)] transition-colors"
              >
                <p className="kicker mb-2">Questa è solo la base</p>
                <p className="text-[15px] leading-relaxed text-[var(--t2)]">
                  Nel configuratore ci aggiungete rivelazione, fotografo, fiori
                  e brindisi.{" "}
                  <span className="text-[var(--champagne)] group-hover:underline">
                    Componi l&apos;esperienza →
                  </span>
                </p>
              </Link>
            )}

            <dl className="grid gap-3 text-sm border-t border-[var(--l1)] pt-6">
              {m.citta && (
                <div className="flex justify-between gap-6"><dt className="text-[var(--muted)]">Città</dt><dd>{m.citta}</dd></div>
              )}
              {m.durata && (
                <div className="flex justify-between gap-6"><dt className="text-[var(--muted)]">Durata</dt><dd>{m.durata}</dd></div>
              )}
              {m.partner && (
                <div className="flex justify-between gap-6"><dt className="text-[var(--muted)]">Partner</dt><dd className="text-[var(--champagne)]">{m.partner}</dd></div>
              )}
            </dl>
          </Reveal>
        </div>
      </section>

      {/* Descrizione + cosa include */}
      <section className="sezione-stretta bg-[var(--ink-800)]">
        <div className="contenuto grid gap-12 lg:grid-cols-2 lg:gap-24">
          <Reveal>
            <p className="kicker mb-6">Dettagli</p>
            <p className="text-[17px] leading-relaxed text-[var(--t2)] max-w-[62ch]">{product.description}</p>
          </Reveal>
          {m.incluso && (
            <Reveal delay={0.1}>
              <p className="kicker mb-6">Cosa include</p>
              <ul className="grid gap-4">
                {m.incluso.map((i) => (
                  <li key={i} className="flex gap-4 text-[17px] leading-relaxed text-[var(--t2)] border-b border-[var(--l1)] pb-4">
                    <span className="text-[var(--champagne)]" aria-hidden>—</span>{i}
                  </li>
                ))}
              </ul>
            </Reveal>
          )}
        </div>
      </section>

      {related.length > 0 && (
        <section className="sezione">
          <div className="contenuto">
            <Reveal>
              <p className="kicker mb-6">Dallo stesso servizio</p>
              <h2 className="h-sezione mb-16">Potrebbe interessarvi anche.</h2>
            </Reveal>
            <RevealGrid className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((p) => <ProductCard key={p.handle} product={p} />)}
            </RevealGrid>
          </div>
        </section>
      )}
    </>
  );
}
