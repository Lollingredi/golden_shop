import Link from "next/link";

/** Linguetta laterale fissa (desktop) + barra contatti (mobile) */
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
        <a href="tel:+390000000000" className="label text-[var(--champagne)] text-center py-[18px] min-h-[44px]">
          Telefono
        </a>
        <a
          href="https://wa.me/390000000000"
          className="label text-[var(--champagne)] text-center py-[18px] min-h-[44px] border-l border-[var(--champagne)]/25"
        >
          WhatsApp
        </a>
      </div>
    </>
  );
}
