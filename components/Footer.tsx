import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-white/10 px-6 lg:px-10 py-16">
      <div className="max-w-[1280px] mx-auto grid gap-10">
        <div className="flex flex-wrap gap-8 justify-between items-baseline">
          <Link href="/" className="font-display text-[20px] tracking-[0.34em] text-[var(--champagne)]">
            GOLDEN
          </Link>
          <nav className="flex flex-wrap gap-6 text-xs text-[var(--muted)]">
            <Link href="/collections/noleggio-auto" className="hover:text-[var(--champagne)] transition-colors">Noleggio auto</Link>
            <Link href="/collections/wedding-planner" className="hover:text-[var(--champagne)] transition-colors">Wedding planner</Link>
            <Link href="/collections/sushi-delivery" className="hover:text-[var(--champagne)] transition-colors">Sushi delivery</Link>
            <span>Milano · Bergamo · Monza</span>
            <span>Partner verificati</span>
          </nav>
        </div>

        <div className="border-t border-white/10 pt-8 flex flex-wrap gap-x-8 gap-y-3 justify-between items-baseline">
          <p className="text-xs text-[var(--muted)]">
            GOLDEN è un marchio del gruppo gestionale{" "}
            <span className="text-[var(--champagne)] tracking-[0.12em]">MarcasEnt</span>
          </p>
          <p className="text-xs text-[var(--muted)]">
            © {new Date().getFullYear()} MarcasEnt — Tutti i diritti riservati
          </p>
        </div>
      </div>
    </footer>
  );
}
