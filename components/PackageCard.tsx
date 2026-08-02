import Image from "next/image";
import Link from "next/link";
import { addonById, packageAddonsPrice, packageSaving, type ExperiencePackage } from "@/lib/experiences";
import { formatAmount } from "@/lib/money";
import PlaceholderMedia from "./PlaceholderMedia";
import { RevealItem } from "./Reveal";

/**
 * Pacchetto = esperienza preconfigurata.
 * Su Shopify diventa un prodotto bundle con l'auto come opzione.
 */
export default function PackageCard({
  pkg,
  fromBase,
}: {
  pkg: ExperiencePackage;
  fromBase: number;
}) {
  const addonsPrice = packageAddonsPrice(pkg);
  const saving = packageSaving(pkg);
  const composizione = ["Auto", ...pkg.addonIds.map((id) => addonById.get(id)?.title ?? id)];

  return (
    <RevealItem className="h-full">
      <article
        className={`h-full flex flex-col border ${
          pkg.evidenza ? "border-[var(--champagne)]" : "border-white/12"
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
            <h3 className="font-display text-[28px] leading-tight">{pkg.title}</h3>
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
                    ? "border-white/25 text-white/70"
                    : "border-[var(--champagne)]/40 text-[var(--champagne)]"
                }`}
              >
                {c}
              </li>
            ))}
          </ul>

          <p className="text-[15px] leading-relaxed text-white/65 mb-8">{pkg.description}</p>

          <div className="mt-auto pt-6 border-t border-white/10 flex flex-wrap gap-4 justify-between items-baseline">
            <div>
              <span className="block text-[var(--champagne)] font-display text-2xl">
                da {formatAmount(fromBase + addonsPrice)}
              </span>
              <span className="text-xs text-[var(--muted)]">
                vettura inclusa · {formatAmount(saving)} di risparmio sui singoli
              </span>
            </div>
            <Link
              href="#configura"
              className="label border border-[var(--champagne)] text-[var(--champagne)] px-6 py-3 hover:bg-[var(--champagne)] hover:text-[var(--ink)] transition-colors duration-200"
            >
              Configura
            </Link>
          </div>
        </div>
      </article>
    </RevealItem>
  );
}
