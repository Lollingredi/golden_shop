"use client";

import { useState, useEffect, useId, useRef, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { FiMenu, FiX, FiShoppingBag, FiUser, FiChevronDown } from "react-icons/fi";
import { useAccount, useCart } from "./StoreProvider";
import { BottoneLink } from "./Bottone";

/* Hook estratto da sito-corbi: listener passivo, nessun layout thrashing */
function useScrollPosition(threshold = 20): boolean {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > threshold);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [threshold]);
  return scrolled;
}

/**
 * Le categorie non stanno più qui.
 *
 * Erano tre voci nella barra desktop e quattro nel menu mobile: la
 * barra andava a capo, e su mobile l'unica strada per il catalogo
 * era l'hamburger. Ora i tre servizi si scelgono dal corpo della
 * pagina — sezione "Scegliete il servizio" in homepage e la stessa
 * griglia in cima al catalogo — dove hanno l'immagine accanto.
 * L'header tiene solo ciò che serve ovunque: catalogo, account,
 * carrello, richiesta.
 */
const links = [{ label: "Catalogo", href: "/collections" }];

const linkMobile = links;

/**
 * I tre servizi, in tendina sotto "Catalogo".
 *
 * Sono scritti qui e non importati da `lib/catalog`: l'header è un
 * componente client, e importare `collections` da lì trascinerebbe
 * l'intero catalogo prodotti nel bundle di ogni pagina per tre righe
 * di testo. Se un giorno arriveranno da Shopify, vanno passati come
 * prop dal layout, che è server.
 */
const servizi = [
  { label: "Noleggio auto", nota: "Supercar, auto d'epoca, autista", href: "/collections/noleggio-auto" },
  { label: "Wedding planner", nota: "Corteo, location, fotografo", href: "/collections/wedding-planner" },
  { label: "Cena sushi in delivery", nota: "Omakase e bottiglia a casa", href: "/collections/sushi-delivery" },
];

/**
 * Le pagine che si aprono con un'immagine a tutto schermo possono
 * permettersi l'header trasparente. Tutte le altre no: sul fondo chiaro
 * dell'area personale il gradiente scuro diventa una macchia, e il logo
 * champagne sparisce.
 */
function usaHeaderPieno(pathname: string): boolean {
  const conApertura = pathname === "/" || /^\/collections\/[^/]+\/?$/.test(pathname);
  return !conApertura;
}

export default function Header() {
  const [open, setOpen] = useState(false);
  const [tendina, setTendina] = useState(false);
  const scrolled = useScrollPosition(20);
  const pathname = usePathname();
  const menuId = useId();
  const tendinaId = useId();
  const cart = useCart();
  const { account } = useAccount();
  const pieno = usaHeaderPieno(pathname);
  const ridotto = useReducedMotion();

  /* Chiusura ritardata: uscendo dal link verso la tendina il puntatore
     attraversa qualche pixel di header, e senza questo la tendina
     spariva a metà strada. 140ms bastano e non danno l'impressione che
     resti appesa. */
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const apri = useCallback(() => {
    if (timer.current) clearTimeout(timer.current);
    setTendina(true);
  }, []);
  const chiudi = useCallback((subito = false) => {
    if (timer.current) clearTimeout(timer.current);
    if (subito) setTendina(false);
    else timer.current = setTimeout(() => setTendina(false), 140);
  }, []);
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);

  useEffect(() => {
    setOpen(false);
    setTendina(false);
  }, [pathname]);

  return (
    <header
      aria-label="Navigazione principale"
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled || pieno
          ? "bg-[var(--ink)]/95 backdrop-blur-md shadow-lg border-b border-white/10"
          : "bg-gradient-to-b from-[var(--ink)]/70 to-transparent"
      }`}
    >
      <div className="contenuto px-6 lg:px-10 h-[var(--h-header)] grid grid-cols-[1fr_auto_1fr] items-center gap-6">
        {/* sinistra — desktop */}
        <nav className="hidden lg:flex gap-7 items-center label text-white/70">
          {/*
            "Catalogo" resta un link vero e cliccabile: la tendina è una
            scorciatoia ai tre servizi, non l'unico modo per arrivarci.
            Si apre al passaggio del mouse e anche col focus da tastiera
            (onFocus/onBlur risalgono dai figli), si chiude con Escape.
          */}
          <div
            className="relative"
            onMouseEnter={apri}
            onMouseLeave={() => chiudi()}
            onFocus={apri}
            onBlur={(e) => {
              if (!e.currentTarget.contains(e.relatedTarget as Node | null)) chiudi(true);
            }}
            onKeyDown={(e) => {
              if (e.key === "Escape" && tendina) {
                chiudi(true);
                (e.currentTarget.querySelector("a") as HTMLAnchorElement | null)?.focus();
              }
            }}
          >
            <Link
              href="/collections"
              aria-haspopup="true"
              aria-expanded={tendina}
              aria-controls={tendinaId}
              /* whitespace-nowrap: senza, "Noleggio auto" andava a capo e la
                 barra diventava alta due righe di testo dentro 72px. */
              className={`py-2 whitespace-nowrap flex items-center gap-2 transition-colors duration-150 hover:text-[var(--champagne)] ${
                pathname.startsWith("/collections") || tendina ? "text-[var(--champagne)]" : ""
              }`}
            >
              Catalogo
              <FiChevronDown
                aria-hidden
                className={`w-[13px] h-[13px] transition-transform duration-200 ${
                  tendina ? "rotate-180" : ""
                }`}
              />
            </Link>

            <AnimatePresence>
              {tendina && (
                <motion.div
                  id={tendinaId}
                  initial={ridotto ? { opacity: 0 } : { opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={ridotto ? { opacity: 0 } : { opacity: 0, y: -6 }}
                  transition={{ duration: 0.18, ease: "easeOut" }}
                  /* pt-3 dentro il contenitore, non margin sopra il
                     pannello: il puntatore resta sempre su un elemento
                     figlio e la tendina non lampeggia. */
                  className="absolute left-0 top-full pt-3 w-[280px]"
                >
                  <div className="bg-[var(--ink)]/97 backdrop-blur-md border border-white/10 shadow-2xl py-2">
                    {servizi.map((s) => (
                      <Link
                        key={s.href}
                        href={s.href}
                        onClick={() => chiudi(true)}
                        className={`block px-5 py-3 transition-colors duration-150 hover:bg-white/[0.06] focus-visible:bg-white/[0.06] focus-visible:outline-none ${
                          pathname.startsWith(s.href)
                            ? "text-[var(--champagne)]"
                            : "text-white/85 hover:text-[var(--champagne)]"
                        }`}
                      >
                        <span className="block whitespace-nowrap">{s.label}</span>
                        <span className="block text-[11px] tracking-normal normal-case text-[var(--muted)] mt-1">
                          {s.nota}
                        </span>
                      </Link>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </nav>

        {/* sinistra — mobile: hamburger */}
        <div className="lg:hidden flex">
          <button
            onClick={() => setOpen(!open)}
            aria-label={open ? "Chiudi menu" : "Apri menu"}
            aria-expanded={open}
            aria-controls={menuId}
            className="text-[var(--t1)] p-2 min-h-[44px] min-w-[44px] flex items-center justify-center rounded hover:bg-[var(--l1)] transition-colors duration-150"
          >
            {open ? <FiX className="w-6 h-6" aria-hidden /> : <FiMenu className="w-6 h-6" aria-hidden />}
          </button>
        </div>

        {/* centro — logo */}
        <Link
          href="/"
          className="font-display text-[20px] tracking-[0.34em] pl-[0.34em] text-[var(--champagne)] whitespace-nowrap"
        >
          GOLDEN
        </Link>

        {/* destra */}
        <div className="flex gap-2 sm:gap-4 items-center justify-end label text-white/70">
          <Link
            href={account ? "/account" : "/account/login"}
            aria-label={account ? "Area personale" : "Accedi"}
            className={`w-11 h-11 grid place-items-center hover:text-[var(--champagne)] transition-colors duration-150 ${
              pathname.startsWith("/account") ? "text-[var(--champagne)]" : ""
            }`}
          >
            <FiUser className="w-[19px] h-[19px]" aria-hidden />
          </Link>

          <button
            type="button"
            onClick={cart.open}
            aria-label={cart.hydrated ? `Carrello, ${cart.count} articoli` : "Carrello"}
            className="relative w-11 h-11 grid place-items-center hover:text-[var(--champagne)] transition-colors duration-150"
          >
            <FiShoppingBag className="w-[19px] h-[19px]" aria-hidden />
            {cart.hydrated && cart.count > 0 && (
              <span className="absolute top-[6px] right-[4px] min-w-[17px] h-[17px] px-1 rounded-full bg-[var(--champagne)] text-[var(--ink)] text-[10px] font-medium grid place-items-center tabular-nums">
                {cart.count}
              </span>
            )}
          </button>

          {/* Era px-6 py-[11px]: 41px di altezza, sotto la soglia di tocco.
              Ora la misura arriva da <Bottone>, che parte da 44px. */}
          <BottoneLink href="/#richiesta" aspetto="contorno" misura="sm" className="hidden sm:inline-flex">
            Richiedi
          </BottoneLink>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.nav
            id={menuId}
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="lg:hidden bg-[var(--ink)]/98 backdrop-blur-md border-t border-white/10 px-6 py-5 flex flex-col"
          >
            {[...linkMobile, { label: account ? "Area personale" : "Accedi", href: account ? "/account" : "/account/login" }].map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="label text-white py-4 min-h-[44px] flex items-center border-b border-white/10 last:border-0 hover:text-[var(--champagne)] transition-colors duration-150"
              >
                {l.label}
              </Link>
            ))}
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
