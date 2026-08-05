import Image from "next/image";
import Link from "next/link";
import { addonById, packageAddonsPrice, packageSaving, type ExperiencePackage } from "@/lib/experiences";
import { formatAmount } from "@/lib/money";
import PlaceholderMedia from "./PlaceholderMedia";
import { RevealItem } from "./Reveal";
import { AddPackageButton } from "./AddToCart";

/**
 * Pacchetto = esperienza preconfigurata.
 * Su Shopify diventa un prodotto bundle con l'auto come opzione.
 */
export default function PackageCard({
  pkg,
  fromBase,
  baseTitle,
  baseHandle,
}: {
  pkg: ExperiencePackage;
  fromBase: number;
  /** Vettura di partenza proposta: la meno cara del servizio */
  baseTitle: string;
  baseHandle: string;
}) {
  const addonsPrice = packageAddonsPrice(pkg);
  const saving = packageSaving(pkg);
  const composizione = ["Auto", ...pkg.addonIds.map((id) => addonById.get(id)?.title ?? id)];

  return (
    <RevealItem className="h-full">
      <article
        className={`h-full flex flex-col border ${
          pkg.evidenza ? "border-[var(--champagne)]" : "border-[var(--l1)]"
        }`}
      >
        <div className="relative aspect-[16/9] overflow-hidden bg-[var(--ink-800)]">
          {pkg.image ? (
            <Image
              src={pkg.image}
              alt={pkg.imageAlt}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover"
            />
          ) : (
            <PlaceholderMedia label={`fotografia — ${pkg.title.toLowerCase()}`} />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[var(--ink)]/85 via-[var(--ink)]/20 to-transparent" />
          {pkg.evidenza && (
            <span className="absolute top-0 left-0 bg-[var(--champagne)] text-[var(--ink)] label px-4 py-2">
              Il più richiesto
            </span>
          )}
          <div className="absolute bottom-0 left-0 right-0 p-7">
            <h3 className="h-blocco">{pkg.title}</h3>
            <p className="text-[15px] text-[var(--champagne)] mt-1">{pkg.claim}</p>
          </div>
        </div>

        <div className="flex flex-col flex-1 p-7">
          <ul className="flex flex-wrap gap-2 mb-6">
            {composizione.map((c, i) => (
              <li
                key={c}
                className={`text-xs px-3 py-[6px] border ${
                  i === 0
                    ? "border-[var(--l2)] text-[var(--t2)]"
                    : "border-[var(--champagne)]/40 text-[var(--champagne)]"
                }`}
              >
                {c}
              </li>
            ))}
          </ul>

          <p className="text-[15px] leading-relaxed text-[var(--t2)] mb-8">{pkg.description}</p>

          <div className="mt-auto pt-6 border-t border-[var(--l1)] grid gap-5">
            {/* Stesso trattamento del prezzo di ProductCard: display, champagne,
                riga sua, metadati sotto in muted. */}
            <div>
              <p className="font-display text-xl text-[var(--champagne)]">
                da {formatAmount(fromBase + addonsPrice)}
              </p>
              <p className="mt-1 text-xs text-[var(--muted)]">
                vettura inclusa · {formatAmount(saving)} di risparmio sui singoli
              </p>
            </div>
            <div className="flex flex-wrap gap-x-6 gap-y-3 items-center">
              <AddPackageButton
                merchandiseId={`gid://golden/ProductVariant/${baseHandle}-1`}
                title={pkg.title}
                subtitle={baseTitle}
                imageUrl={pkg.image}
                unitPrice={fromBase + addonsPrice}
                sconto={saving}
                attributes={pkg.addonIds.map((id) => ({
                  key: addonById.get(id)?.title ?? id,
                  value: addonById.get(id)?.contents ?? "",
                }))}
              />
              {/* Azione secondaria: testo, non un secondo pulsante */}
              <Link
                href="#configura"
                className="label text-[var(--t2)] border-b border-[var(--l2)] pb-1 hover:text-[var(--t1)] hover:border-[var(--l3)] transition-colors duration-200"
              >
                Cambia vettura
              </Link>
            </div>
          </div>
        </div>
      </article>
    </RevealItem>
  );
}
