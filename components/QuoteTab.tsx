import Link from "next/link";
import { TELEFONO_HREF, WHATSAPP_HREF, CONTATTI_VERI } from "@/lib/contatti";

/* ────────────────────────────────────────────────────────────────
   Linguetta laterale fissa (desktop) + barra contatti (mobile).

   I numeri arrivano da lib/contatti.ts: erano scritti a mano qui e
   in Operator.tsx, con lo stesso segnaposto ripetuto in due punti.

   Finché `CONTATTI_VERI` è false la barra mobile non offre telefono
   e WhatsApp — porterebbero al numero zero — ma manda al modulo di
   richiesta, che invece funziona.
   ──────────────────────────────────────────────────────────────── */

export default function QuoteTab() {
  return (
    <>
      <Link
        href="/#richiesta"
        className="hidden lg:block fixed left-0 top-1/2 -translate-y-1/2 z-40 bg-[var(--champagne)] text-[var(--ink)] label px-[11px] py-6 border-y border-r border-[var(--champagne-dk)] hover:bg-white transition-colors duration-200"
        style={{ writingMode: "vertical-rl" }}
      >
        Preventivo gratuito
      </Link>

      <div className="lg:hidden fixed inset-x-0 bottom-0 z-40 grid grid-cols-2 bg-[var(--ink-800)]/98 backdrop-blur-md border-t border-[var(--champagne)]/25">
        {CONTATTI_VERI ? (
          <>
            <a
              href={TELEFONO_HREF}
              className="label text-[var(--champagne)] text-center py-[18px] min-h-[44px]"
            >
              Telefono
            </a>
            <a
              href={WHATSAPP_HREF}
              target="_blank"
              rel="noopener noreferrer"
              className="label text-[var(--champagne)] text-center py-[18px] min-h-[44px] border-l border-[var(--champagne)]/25"
            >
              WhatsApp
            </a>
          </>
        ) : (
          <>
            <Link
              href="/collections"
              className="label text-[var(--champagne)] text-center py-[18px] min-h-[44px]"
            >
              Catalogo
            </Link>
            <Link
              href="/#richiesta"
              className="label text-[var(--champagne)] text-center py-[18px] min-h-[44px] border-l border-[var(--champagne)]/25"
            >
              Preventivo
            </Link>
          </>
        )}
      </div>
    </>
  );
}
