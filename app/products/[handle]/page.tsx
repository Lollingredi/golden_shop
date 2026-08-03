import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import {
  getProduct, getProducts, getProductsInCollection,
  getCollection, collectionOfProduct,
} from "@/lib/catalog";
import { formatMoney, fromPrice } from "@/lib/money";
import Reveal, { RevealGrid } from "@/components/Reveal";
import ProductCard from "@/components/ProductCard";
import PlaceholderMedia from "@/components/PlaceholderMedia";
import { AddProductButton } from "@/components/AddToCart";
import { OperatorLink } from "@/components/Operator";

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
      <div className="px-6 lg:px-10 pt-[100px] lg:pt-[120px]">
        <nav aria-label="Percorso" className="max-w-[1280px] mx-auto text-xs text-[var(--muted)] flex gap-2 flex-wrap">
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
          <span className="text-white/70">{product.title}</span>
        </nav>
      </div>

      <section className="px-6 lg:px-10 py-10 lg:py-16">
        <div className="max-w-[1280px] mx-auto grid gap-10 lg:grid-cols-2 lg:gap-16 items-start">
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
          <Reveal delay={0.1} className="lg:sticky lg:top-[104px]">
            <p className="kicker mb-4">{product.productType}</p>
            <h1 className="font-display text-[clamp(30px,4vw,44px)] leading-tight mb-4">{product.title}</h1>
            <p className="text-sm text-[var(--muted)] mb-8">{product.vendor}</p>

            <p className="font-display text-3xl text-[var(--champagne)] mb-2">
              {fromPrice(product.priceRange.minVariantPrice)}
            </p>
            <p className="text-xs text-[var(--muted)] mb-10">
              Prezzo indicativo. Varia con data, città e formula.
            </p>

            {/* Varianti — statiche: diventeranno selettori con Shopify */}
            <fieldset className="mb-10">
              <legend className="kicker mb-4">Formula</legend>
              <div className="grid gap-3">
                {product.variants.map((v, i) => (
                  <div key={v.id}
                    className={`flex justify-between items-center gap-4 border px-5 py-4 text-sm ${
                      i === 0 ? "border-[var(--champagne)] text-white" : "border-white/15 text-white/70"
                    }`}>
                    <span>{v.title}</span>
                    <span className={i === 0 ? "text-[var(--champagne)]" : ""}>{formatMoney(v.price)}</span>
                  </div>
                ))}
              </div>
            </fieldset>

            <div className="flex flex-wrap gap-4 mb-4">
              <AddProductButton
                merchandiseId={product.variants[0].id}
                title={product.title}
                subtitle={product.variants[0].title}
                imageUrl={img?.url ?? null}
                unitPrice={Number(product.priceRange.minVariantPrice.amount)}
              />
              <Link href="/#richiesta"
                className="border border-[var(--champagne)] text-[var(--champagne)] label px-10 py-4 hover:bg-[var(--champagne)] hover:text-[var(--ink)] transition-colors duration-200">
                Richiedi disponibilità
              </Link>
            </div>
            <OperatorLink
              contesto={product.title}
              className="label text-[var(--champagne)] py-4 mb-6 hover:text-white transition-colors"
            />
            {colHandle === "noleggio-auto" && (
              <p className="text-sm leading-relaxed text-white/60 mb-10 border-l border-[var(--champagne)]/40 pl-4">
                Questa è la base.{" "}
                <Link href="/collections/noleggio-auto#configura" className="text-[var(--champagne)] hover:text-white transition-colors">
                  Nel configuratore
                </Link>{" "}
                ci aggiungete rivelazione, fotografo, fiori e brindisi.
              </p>
            )}

            <dl className="grid gap-3 text-sm border-t border-white/10 pt-6">
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
      <section className="px-6 lg:px-10 py-16 lg:py-24 bg-[var(--ink-800)]">
        <div className="max-w-[1280px] mx-auto grid gap-12 lg:grid-cols-2 lg:gap-24">
          <Reveal>
            <p className="kicker mb-6">Dettagli</p>
            <p className="text-[17px] leading-relaxed text-white/80 max-w-[62ch]">{product.description}</p>
          </Reveal>
          {m.incluso && (
            <Reveal delay={0.1}>
              <p className="kicker mb-6">Cosa include</p>
              <ul className="grid gap-4">
                {m.incluso.map((i) => (
                  <li key={i} className="flex gap-4 text-[17px] leading-relaxed text-white/80 border-b border-white/10 pb-4">
                    <span className="text-[var(--champagne)]" aria-hidden>—</span>{i}
                  </li>
                ))}
              </ul>
            </Reveal>
          )}
        </div>
      </section>

      {related.length > 0 && (
        <section className="px-6 lg:px-10 py-20 lg:py-[120px]">
          <div className="max-w-[1280px] mx-auto">
            <Reveal>
              <p className="kicker mb-6">Dallo stesso servizio</p>
              <h2 className="font-display text-3xl lg:text-[40px] leading-tight mb-16">Potrebbe interessarvi anche.</h2>
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
