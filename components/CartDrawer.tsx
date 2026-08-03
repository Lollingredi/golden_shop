"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { FiX } from "react-icons/fi";
import { useCart, useOperator } from "./StoreProvider";
import { formatAmount } from "@/lib/money";
import { acconto } from "@/lib/store";
import PlaceholderMedia from "./PlaceholderMedia";

/**
 * Carrello a scorrimento: entra da destra, non è una pagina.
 *
 * Scelta deliberata — su un sito di esperienze il carrello si apre
 * dieci volte per una conversione. Portare via l'utente dalla pagina
 * ogni volta è il modo più veloce per fargli perdere il filo.
 */
export default function CartDrawer() {
  const cart = useCart();
  const operator = useOperator();
  const reduced = useReducedMotion();
  const panelRef = useRef<HTMLDivElement>(null);

  /* Il focus entra nel pannello all'apertura: obbligatorio per la tastiera */
  useEffect(() => {
    if (cart.isOpen) panelRef.current?.focus();
  }, [cart.isOpen]);

  const vuoto = cart.lines.length === 0;

  return (
    <AnimatePresence>
      {cart.isOpen && (
        <>
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={cart.close}
            className="fixed inset-0 z-[60] bg-[var(--ink)]/70 backdrop-blur-[2px]"
            aria-hidden
          />

          <motion.aside
            key="panel"
            ref={panelRef}
            tabIndex={-1}
            role="dialog"
            aria-modal="true"
            aria-label="Carrello"
            initial={reduced ? { opacity: 0 } : { x: "100%" }}
            animate={reduced ? { opacity: 1 } : { x: 0 }}
            exit={reduced ? { opacity: 0 } : { x: "100%" }}
            transition={{ duration: reduced ? 0.15 : 0.35, ease: [0, 0, 0.2, 1] }}
            className="fixed top-0 right-0 bottom-0 z-[61] w-full sm:w-[440px] bg-[var(--ink-800)] border-l border-white/10 flex flex-col outline-none"
          >
            <header className="flex items-center justify-between gap-4 px-7 py-6 border-b border-white/10">
              <div>
                <p className="kicker">La vostra selezione</p>
                <p className="text-xs text-[var(--muted)] mt-1">
                  {cart.count === 0
                    ? "Nessuna esperienza"
                    : `${cart.count} ${cart.count === 1 ? "esperienza" : "esperienze"}`}
                </p>
              </div>
              <button
                type="button"
                onClick={cart.close}
                aria-label="Chiudi il carrello"
                className="w-11 h-11 grid place-items-center text-white/70 hover:text-white hover:bg-white/10 transition-colors"
              >
                <FiX className="w-5 h-5" aria-hidden />
              </button>
            </header>

            <div className="flex-1 overflow-y-auto px-7 py-6">
              {vuoto ? (
                <div className="h-full flex flex-col justify-center text-center gap-6">
                  <p className="font-display text-2xl leading-tight">
                    Non avete ancora scelto niente.
                  </p>
                  <p className="text-[15px] text-white/55 leading-relaxed">
                    Si parte da un pacchetto o si compone il momento pezzo per
                    pezzo. Ci vogliono due minuti.
                  </p>
                  <Link
                    href="/collections/noleggio-auto#configura"
                    onClick={cart.close}
                    className="justify-self-center bg-[var(--champagne)] text-[var(--ink)] label px-8 py-4 hover:bg-white transition-colors"
                  >
                    Vai al configuratore
                  </Link>
                </div>
              ) : (
                <ul className="grid gap-6">
                  <AnimatePresence initial={false}>
                    {cart.lines.map((l) => (
                      <motion.li
                        key={l.id}
                        layout={!reduced}
                        initial={reduced ? false : { opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={reduced ? undefined : { opacity: 0, height: 0 }}
                        transition={{ duration: 0.22, ease: [0, 0, 0.2, 1] }}
                        className="overflow-hidden"
                      >
                        <div className="flex gap-4">
                          <div className="relative w-[76px] h-[95px] shrink-0 bg-[var(--ink)] overflow-hidden">
                            {l.imageUrl ? (
                              <Image
                                src={l.imageUrl}
                                alt=""
                                fill
                                sizes="76px"
                                className="object-cover"
                              />
                            ) : (
                              <PlaceholderMedia label={l.title.toLowerCase()} />
                            )}
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between gap-3 items-start">
                              <div className="min-w-0">
                                <p className="text-[11px] tracking-[0.2em] uppercase text-[var(--champagne)]">
                                  {l.kind}
                                </p>
                                <p className="text-[15px] leading-snug mt-1">{l.title}</p>
                                {l.subtitle && (
                                  <p className="text-xs text-[var(--muted)] mt-[2px] truncate">
                                    {l.subtitle}
                                  </p>
                                )}
                              </div>
                              <button
                                type="button"
                                onClick={() => cart.remove(l.id)}
                                aria-label={`Togli ${l.title}`}
                                className="text-xs text-[var(--muted)] hover:text-white transition-colors shrink-0"
                              >
                                Togli
                              </button>
                            </div>

                            {l.attributes.length > 0 && (
                              <ul className="flex flex-wrap gap-1 mt-3">
                                {l.attributes.map((a) => (
                                  <li
                                    key={a.key}
                                    className="text-[11px] px-2 py-[3px] border border-[var(--champagne)]/35 text-[var(--champagne)]"
                                  >
                                    {a.key}
                                  </li>
                                ))}
                              </ul>
                            )}

                            <div className="flex items-center justify-between gap-4 mt-4">
                              <div className="flex items-center border border-white/15">
                                <button
                                  type="button"
                                  onClick={() => cart.setQuantity(l.id, l.quantity - 1)}
                                  aria-label="Diminuisci"
                                  className="w-9 h-9 grid place-items-center text-white/70 hover:text-white hover:bg-white/10 transition-colors"
                                >
                                  −
                                </button>
                                <span className="w-8 text-center text-sm tabular-nums">
                                  {l.quantity}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => cart.setQuantity(l.id, l.quantity + 1)}
                                  aria-label="Aumenta"
                                  className="w-9 h-9 grid place-items-center text-white/70 hover:text-white hover:bg-white/10 transition-colors"
                                >
                                  +
                                </button>
                              </div>
                              <span className="text-[var(--champagne)] text-[15px]">
                                {formatAmount(l.unitPrice * l.quantity)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </motion.li>
                    ))}
                  </AnimatePresence>
                </ul>
              )}
            </div>

            {!vuoto && (
              <footer className="border-t border-white/10 px-7 py-6 grid gap-4">
                <div className="flex justify-between items-baseline">
                  <span className="label text-white/70">Totale indicativo</span>
                  <span className="font-display text-[26px] text-[var(--champagne)]">
                    {formatAmount(cart.subtotal)}
                  </span>
                </div>
                <p className="text-xs leading-relaxed text-[var(--muted)]">
                  Alla conferma si versa un acconto di{" "}
                  {formatAmount(acconto(cart.subtotal))}. Il saldo si regola con il
                  partner, il giorno del servizio.
                </p>
                <Link
                  href="/checkout"
                  onClick={cart.close}
                  className="block text-center bg-[var(--champagne)] text-[var(--ink)] label px-8 py-4 hover:bg-white transition-colors"
                >
                  Vai alla conferma
                </Link>
                <button
                  type="button"
                  onClick={() => operator.open("Carrello")}
                  className="label text-[var(--champagne)] py-2 hover:text-white transition-colors"
                >
                  Parla con un operatore
                </button>
              </footer>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
