"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { formatAmount } from "@/lib/money";
import { addons, addonById, packages, packageAddonsPrice } from "@/lib/experiences";
import PlaceholderMedia from "./PlaceholderMedia";

export type BaseOption = {
  handle: string;
  title: string;
  price: number;
  imageUrl: string | null;
  imageAlt: string;
  citta?: string;
  durata?: string;
};

/**
 * Il configuratore: si parte dal momento, non dalla vettura.
 *
 * La base (l'auto) è un passaggio, gli add-on sono il prodotto.
 * Su Shopify questo diventa: variante principale + line item properties,
 * oppure il pacchetto preconfigurato scelto qui sopra.
 */
export default function ExperienceBuilder({ bases }: { bases: BaseOption[] }) {
  const reduced = useReducedMotion();
  const [baseHandle, setBaseHandle] = useState(bases[0]?.handle ?? "");
  const [selected, setSelected] = useState<string[]>(["the-reveal", "memories"]);
  const [preset, setPreset] = useState<string | null>("the-big-reveal");

  const base = bases.find((b) => b.handle === baseHandle) ?? bases[0];

  function toggle(id: string) {
    setPreset(null);
    setSelected((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      const group = addonById.get(id)?.group;
      const cleaned = group
        ? prev.filter((x) => addonById.get(x)?.group !== group)
        : prev;
      return [...cleaned, id];
    });
  }

  function applyPreset(id: string) {
    const pkg = packages.find((p) => p.id === id);
    if (!pkg) return;
    setPreset(id);
    setSelected(pkg.addonIds);
  }

  const chosen = useMemo(
    () => selected.map((id) => addonById.get(id)!).filter(Boolean),
    [selected]
  );
  const addonsSum = chosen.reduce((s, a) => s + Number(a.price.amount), 0);
  const presetPkg = preset ? packages.find((p) => p.id === preset) : undefined;
  const addonsCharged = presetPkg ? packageAddonsPrice(presetPkg) : addonsSum;
  const saving = addonsSum - addonsCharged;
  const total = (base?.price ?? 0) + addonsCharged;

  return (
    <div className="grid gap-12 lg:grid-cols-[1fr_380px] lg:gap-16 items-start">
      {/* ── colonna sinistra: i passaggi ─────────────────────────── */}
      <div className="grid gap-14">
        {/* passo 1 — l'esperienza */}
        <div>
          <p className="kicker mb-4">Passo 1 — L&apos;occasione</p>
          <h3 className="font-display text-2xl leading-tight mb-6">
            Da dove partiamo?
          </h3>
          <div className="flex flex-wrap gap-3">
            {packages.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => applyPreset(p.id)}
                aria-pressed={preset === p.id}
                className={`label px-5 py-3 border transition-colors duration-200 ${
                  preset === p.id
                    ? "bg-[var(--champagne)] text-[var(--ink)] border-[var(--champagne)]"
                    : "border-white/20 text-white/80 hover:border-[var(--champagne)] hover:text-[var(--champagne)]"
                }`}
              >
                {p.title}
              </button>
            ))}
            <button
              type="button"
              onClick={() => {
                setPreset(null);
                setSelected([]);
              }}
              aria-pressed={preset === null && selected.length === 0}
              className="label px-5 py-3 border border-white/20 text-white/50 hover:border-white/50 hover:text-white/80 transition-colors duration-200"
            >
              Parto da zero
            </button>
          </div>
        </div>

        {/* passo 2 — gli add-on: il cuore della pagina */}
        <div>
          <p className="kicker mb-4">Passo 2 — Cosa succede</p>
          <h3 className="font-display text-2xl leading-tight mb-2">
            Componete il momento.
          </h3>
          <p className="text-[15px] text-white/55 mb-8 max-w-[60ch]">
            Ogni voce è un servizio a sé, con la sua crew. Si aggiungono e si
            tolgono fino al giorno prima.
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            {addons.map((a) => {
              const on = selected.includes(a.id);
              return (
                <button
                  key={a.id}
                  type="button"
                  onClick={() => toggle(a.id)}
                  aria-pressed={on}
                  className={`group text-left p-6 border transition-colors duration-200 ${
                    on
                      ? "border-[var(--champagne)] bg-[var(--champagne)]/[0.07]"
                      : "border-white/12 hover:border-white/35 bg-[var(--ink-800)]/40"
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <span className="font-display text-xl leading-tight block">
                        {a.title}
                      </span>
                      <span className="text-xs text-[var(--muted)]">{a.contents}</span>
                    </div>
                    <span
                      aria-hidden
                      className={`shrink-0 w-6 h-6 border flex items-center justify-center text-[13px] leading-none transition-colors duration-200 ${
                        on
                          ? "bg-[var(--champagne)] border-[var(--champagne)] text-[var(--ink)]"
                          : "border-white/30 text-transparent group-hover:border-white/60"
                      }`}
                    >
                      ✓
                    </span>
                  </div>
                  <p className="text-[14px] leading-relaxed text-white/60 mt-4">
                    {a.description}
                  </p>
                  <div className="flex justify-between items-baseline mt-5 pt-4 border-t border-white/10 text-xs">
                    <span className="text-[var(--muted)]">{a.durata}</span>
                    <span className="text-[var(--champagne)]">
                      + {formatAmount(Number(a.price.amount))}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
          <p className="text-xs text-[var(--muted)] mt-4">
            Memories e Cinematic si escludono: Cinematic è Memories con il video.
          </p>
        </div>

        {/* passo 3 — la base, volutamente per ultima */}
        <div>
          <p className="kicker mb-4">Passo 3 — Su cosa</p>
          <h3 className="font-display text-2xl leading-tight mb-2">
            E poi scegliete la vettura.
          </h3>
          <p className="text-[15px] text-white/55 mb-8 max-w-[60ch]">
            È la base dell&apos;esperienza. Tutte hanno consegna, coperture e
            partner verificati: cambia il carattere, non il servizio.
          </p>
          <div className="grid gap-3 sm:grid-cols-3">
            {bases.map((b) => {
              const on = b.handle === baseHandle;
              return (
                <button
                  key={b.handle}
                  type="button"
                  onClick={() => setBaseHandle(b.handle)}
                  aria-pressed={on}
                  className={`text-left border transition-colors duration-200 ${
                    on ? "border-[var(--champagne)]" : "border-white/12 hover:border-white/35"
                  }`}
                >
                  <div className="relative aspect-[16/10] overflow-hidden bg-[var(--ink-800)]">
                    {b.imageUrl ? (
                      <Image
                        src={b.imageUrl}
                        alt={b.imageAlt}
                        fill
                        sizes="(max-width: 640px) 100vw, 220px"
                        className={`object-cover transition-opacity duration-300 ${
                          on ? "opacity-100" : "opacity-60"
                        }`}
                      />
                    ) : (
                      <PlaceholderMedia label={b.title.toLowerCase()} />
                    )}
                  </div>
                  <div className="p-4">
                    <span className="block text-[15px] leading-snug">{b.title}</span>
                    <span className="text-xs text-[var(--champagne)]">
                      da {formatAmount(b.price)}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── colonna destra: il riepilogo ─────────────────────────── */}
      <div className="lg:sticky lg:top-[96px] bg-[var(--ink-800)] p-8">
        <p className="kicker mb-6">La vostra esperienza</p>

        {presetPkg && (
          <p className="font-display text-2xl leading-tight mb-6">{presetPkg.title}</p>
        )}

        <dl className="grid gap-3 text-[15px]">
          <div className="flex justify-between gap-4 pb-3 border-b border-white/10">
            <dt className="text-white/60">Base — {base?.title}</dt>
            <dd className="shrink-0">{formatAmount(base?.price ?? 0)}</dd>
          </div>

          <AnimatePresence initial={false}>
            {chosen.map((a) => (
              <motion.div
                key={a.id}
                layout={!reduced}
                initial={reduced ? false : { opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={reduced ? undefined : { opacity: 0, height: 0 }}
                transition={{ duration: 0.22, ease: [0, 0, 0.2, 1] }}
                className="flex justify-between gap-4 pb-3 border-b border-white/10 overflow-hidden"
              >
                <dt className="text-white/60">{a.title}</dt>
                <dd className="shrink-0">{formatAmount(Number(a.price.amount))}</dd>
              </motion.div>
            ))}
          </AnimatePresence>

          {chosen.length === 0 && (
            <p className="text-[14px] text-[var(--muted)] py-2">
              Nessun add-on: resta il noleggio, e basta.
            </p>
          )}

          {saving > 0 && (
            <div className="flex justify-between gap-4 pb-3 border-b border-white/10 text-[var(--champagne)]">
              <dt>Formula pacchetto</dt>
              <dd className="shrink-0">− {formatAmount(saving)}</dd>
            </div>
          )}
        </dl>

        <div className="flex justify-between items-baseline mt-6 mb-2">
          <span className="label text-white/70">Totale indicativo</span>
          <span className="font-display text-[28px] text-[var(--champagne)]">
            {formatAmount(total)}
          </span>
        </div>
        <p className="text-xs leading-relaxed text-[var(--muted)] mb-8">
          Prezzi per una giornata, IVA esclusa. Il preventivo definitivo arriva
          da una persona, dopo che ci avete detto data e città.
        </p>

        <Link
          href="/#richiesta"
          className="block text-center bg-[var(--champagne)] text-[var(--ink)] label px-8 py-4 hover:bg-white transition-colors duration-200"
        >
          Richiedi questa esperienza
        </Link>
      </div>
    </div>
  );
}
