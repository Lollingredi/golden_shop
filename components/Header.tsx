"use client";

import { useState, useEffect, useId } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { FiMenu, FiX } from "react-icons/fi";

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

const links = [
  { label: "Noleggio auto", href: "/collections/noleggio-auto" },
  { label: "Wedding planner", href: "/collections/wedding-planner" },
  { label: "Sushi delivery", href: "/collections/sushi-delivery" },
  { label: "Catalogo", href: "/collections" },
];

export default function Header() {
  const [open, setOpen] = useState(false);
  const scrolled = useScrollPosition(20);
  const pathname = usePathname();
  const menuId = useId();

  useEffect(() => setOpen(false), [pathname]);

  return (
    <header
      aria-label="Navigazione principale"
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-[var(--ink)]/95 backdrop-blur-md shadow-lg border-b border-white/10"
          : "bg-gradient-to-b from-[var(--ink)]/70 to-transparent"
      }`}
    >
      <div className="max-w-[1280px] mx-auto px-6 lg:px-10 h-[72px] grid grid-cols-[1fr_auto_1fr] items-center gap-6">
        {/* sinistra — desktop */}
        <nav className="hidden lg:flex gap-6 items-center label text-white/85">
          {links.slice(0, 3).map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`py-2 transition-colors duration-150 hover:text-[var(--champagne)] ${
                pathname.startsWith(l.href) ? "text-[var(--champagne)]" : ""
              }`}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        {/* sinistra — mobile: hamburger */}
        <div className="lg:hidden flex">
          <button
            onClick={() => setOpen(!open)}
            aria-label={open ? "Chiudi menu" : "Apri menu"}
            aria-expanded={open}
            aria-controls={menuId}
            className="text-white p-2 min-h-[44px] min-w-[44px] flex items-center justify-center rounded hover:bg-white/10 transition-colors duration-150"
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
        <div className="flex gap-6 items-center justify-end label text-white/75">
          <span className="hidden sm:inline">IT</span>
          <Link href="/collections" className="hidden lg:inline hover:text-[var(--champagne)] transition-colors duration-150">
            Catalogo
          </Link>
          <Link
            href="/#richiesta"
            className="border border-[var(--champagne)] text-[var(--champagne)] px-6 py-[11px] leading-none hover:bg-[var(--champagne)] hover:text-[var(--ink)] transition-colors duration-200"
          >
            Richiedi
          </Link>
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
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="label text-white/90 py-4 min-h-[44px] flex items-center border-b border-white/5 last:border-0 hover:text-[var(--champagne)] transition-colors duration-150"
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
