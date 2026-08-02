import Link from "next/link";
import Image from "next/image";
import type { Product } from "@/lib/shopify-types";
import { fromPrice } from "@/lib/money";
import PlaceholderMedia from "./PlaceholderMedia";
import { RevealItem } from "./Reveal";

export default function ProductCard({ product }: { product: Product }) {
  const { featuredImage: img, metafields: m } = product;
  return (
    <RevealItem>
      <Link href={`/products/${product.handle}`} className="group block text-white">
        <div className="relative aspect-[4/5] overflow-hidden bg-[var(--ink-800)]">
          {img ? (
            <Image
              src={img.url}
              alt={img.altText}
              fill
              sizes="(max-width: 768px) 100vw, 33vw"
              className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
            />
          ) : (
            <PlaceholderMedia label={`fotografia — ${product.title.toLowerCase()}`} />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[var(--ink)]/70 via-[var(--ink)]/10 to-transparent" />
          <h3 className="absolute bottom-0 left-0 right-0 p-8 font-display text-2xl leading-tight">
            {product.title}
          </h3>
        </div>
        <div className="mt-4 flex flex-wrap gap-2 text-xs text-[var(--muted)]">
          {m.citta && <span>{m.citta}</span>}
          {m.citta && m.durata && <span>·</span>}
          {m.durata && <span>{m.durata}</span>}
          <span>·</span>
          <span className="text-[var(--champagne)]">{fromPrice(product.priceRange.minVariantPrice)}</span>
        </div>
      </Link>
    </RevealItem>
  );
}
