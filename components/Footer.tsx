import Link from "next/link";
import { OperatorLink } from "./Operator";

/* ────────────────────────────────────────────────────────────────
   Footer in due righe, non tre.

   Prima erano: logo + sei voci (di cui due non erano link, e stavano
   in fila con quelle che lo erano), poi una fascia concierge con
   pulsante bordato, poi due righe legali. 367px per dire quattro cose.

   Adesso: i link dove ci si aspetta i link, e una riga sola in fondo
   con marchio, assistenza e copyright.
   ──────────────────────────────────────────────────────────────── */

const voci = [
  { label: "Noleggio auto", href: "/collections/noleggio-auto" },
  { label: "Wedding planner", href: "/collections/wedding-planner" },
  { label: "Sushi delivery", href: "/collections/sushi-delivery" },
  { label: "Catalogo", href: "/collections" },
  { label: "Area personale", href: "/account" },
];

export default function Footer() {
  return (
    <footer className="border-t border-[var(--l1)] px-6 lg:px-10 py-14">
      <div className="contenuto grid gap-10">
        <div className="flex flex-wrap gap-x-10 gap-y-6 justify-between items-baseline">
          <div>
            <Link
              href="/"
              className="font-display text-[20px] tracking-[0.34em] text-[var(--champagne)]"
            >
              GOLDEN
            </Link>
            {/* Città e garanzia erano voci di navigazione pur non essendo
                link: adesso stanno sotto il marchio, dove sono una nota. */}
            <p className="text-xs text-[var(--muted)] mt-3">
              Milano · Bergamo · Monza — partner verificati
            </p>
          </div>

          <nav className="flex flex-wrap gap-x-7 gap-y-2 text-xs text-[var(--t2)]">
            {voci.map((v) => (
              <Link
                key={v.href}
                href={v.href}
                className="hover:text-[var(--champagne)] transition-colors"
              >
                {v.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="border-t border-[var(--l1)] pt-6 flex flex-wrap gap-x-8 gap-y-3 justify-between items-center text-xs text-[var(--muted)]">
          <p>
            GOLDEN è un marchio del gruppo gestionale{" "}
            <span className="text-[var(--champagne)] tracking-[0.12em]">MarcasEnt</span>
            {" · "}© {new Date().getFullYear()} — Tutti i diritti riservati
          </p>
          {/* Innesco concierge 1 di 4: un link, non una fascia con pulsante */}
          <OperatorLink contesto="Footer" aspetto="testo" misura="sm" />
        </div>
      </div>
    </footer>
  );
}
