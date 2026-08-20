import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";

/* ────────────────────────────────────────────────────────────────
   Il pulsante, in un posto solo.

   Prima esistevano quattordici combinazioni di padding e sette di
   colore, ognuna ripetuta a mano: cambiare l'hover del pulsante
   principale voleva dire cercarlo in undici file. E l'unico
   `px-6 py-[11px]` dell'header era alto 41px, sotto la soglia di
   tocco di 44px.

   Tre aspetti, due misure. Se serve un quarto aspetto, si aggiunge
   qui — non nella pagina.
   ──────────────────────────────────────────────────────────────── */

export type Aspetto = "primario" | "contorno" | "testo" | "tenue";
export type Misura = "md" | "sm";

/*
 * Attenzione: `inline-flex` è qui dentro, e in Tailwind fra due utility
 * di `display` vince l'ordine nel foglio di stile, non quello scritto
 * nell'attributo class. Passare `className="hidden"` a un <Bottone>
 * quindi NON lo nasconde. Per mostrarlo o nasconderlo a certe misure,
 * mettere `hidden`/`sm:hidden` su un contenitore attorno al pulsante
 * (`<span className="hidden sm:contents">`), non sul pulsante stesso.
 */
const BASE =
  "label inline-flex items-center justify-center text-center transition-colors duration-200 disabled:opacity-40 disabled:pointer-events-none";

/*
 * I colori arrivano dalle variabili, non dai valori: è così che il
 * pulsante funziona anche dentro .zona-chiara senza sapere di esserci.
 */
const ASPETTO: Record<Aspetto, string> = {
  /** L'azione della schermata. Una sola per volta. */
  primario:
    "bg-[var(--azione-fondo)] text-[var(--azione-testo)] hover:bg-[var(--azione-hover)]",
  /** L'alternativa dichiarata: stessa importanza, meno peso. */
  contorno:
    "border border-[var(--champagne)] text-[var(--champagne)] hover:bg-[var(--champagne)] hover:text-[var(--su-champagne)]",
  /** Terza strada, o azione di servizio. Nessun contenitore. */
  testo: "text-[var(--champagne)] hover:text-[var(--t1)]",
  /** Annulla, indietro, più tardi: deve esserci, non deve chiamare. */
  tenue: "text-[var(--t3)] hover:text-[var(--t1)]",
};

const MISURA: Record<Misura, string> = {
  md: "px-10 py-4 min-h-[52px]",
  sm: "px-6 py-3 min-h-[44px]", // 44px è la soglia di tocco, non un caso
};

/** Solo per la variante testo: niente contenitore, ma area cliccabile piena */
const MISURA_TESTO: Record<Misura, string> = {
  md: "px-2 py-4 min-h-[52px]",
  sm: "px-2 py-3 min-h-[44px]",
};

function classi(aspetto: Aspetto, misura: Misura, pieno: boolean, extra?: string) {
  const senzaContenitore = aspetto === "testo" || aspetto === "tenue";
  const m = senzaContenitore ? MISURA_TESTO[misura] : MISURA[misura];
  return [BASE, ASPETTO[aspetto], m, pieno && "w-full", extra]
    .filter(Boolean)
    .join(" ");
}

type Comune = {
  aspetto?: Aspetto;
  misura?: Misura;
  /** Occupa tutta la larghezza disponibile: colonne strette, pannelli */
  pieno?: boolean;
  className?: string;
  children: ReactNode;
};

export function Bottone({
  aspetto = "primario",
  misura = "md",
  pieno = false,
  className,
  children,
  ...props
}: Comune & Omit<ComponentProps<"button">, "className" | "children">) {
  return (
    <button {...props} className={classi(aspetto, misura, pieno, className)}>
      {children}
    </button>
  );
}

/** Stessa faccia, ma naviga: usare sempre questo per i collegamenti */
export function BottoneLink({
  aspetto = "primario",
  misura = "md",
  pieno = false,
  className,
  children,
  ...props
}: Comune & Omit<ComponentProps<typeof Link>, "className" | "children">) {
  return (
    <Link {...props} className={classi(aspetto, misura, pieno, className)}>
      {children}
    </Link>
  );
}

/** Collegamento esterno (telefono, WhatsApp): `<a>` nudo, non Link */
export function BottoneA({
  aspetto = "contorno",
  misura = "md",
  pieno = false,
  className,
  children,
  ...props
}: Comune & Omit<ComponentProps<"a">, "className" | "children">) {
  return (
    <a {...props} className={classi(aspetto, misura, pieno, className)}>
      {children}
    </a>
  );
}
