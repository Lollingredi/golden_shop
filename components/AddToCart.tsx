"use client";

import { useState } from "react";
import { useCart } from "./StoreProvider";
import type { LineAttribute } from "@/lib/store";

/* ────────────────────────────────────────────────────────────────
   I pulsanti che riempiono il carrello.

   Sono client component minuscoli, montati dentro pagine che restano
   server component: così l'HTML del catalogo continua a essere
   generato a build time e solo il pulsante diventa interattivo.
   ──────────────────────────────────────────────────────────────── */

type Base = {
  merchandiseId: string;
  title: string;
  subtitle?: string;
  imageUrl: string | null;
  unitPrice: number;
  attributes?: LineAttribute[];
  sconto?: number;
};

function useAggiunta() {
  const cart = useCart();
  const [fatto, setFatto] = useState(false);
  function aggiungi(line: Base, kind: "prodotto" | "pacchetto" | "esperienza") {
    cart.add({
      merchandiseId: line.merchandiseId,
      kind,
      title: line.title,
      subtitle: line.subtitle,
      imageUrl: line.imageUrl,
      unitPrice: line.unitPrice,
      attributes: line.attributes ?? [],
      sconto: line.sconto,
    });
    setFatto(true);
    window.setTimeout(() => setFatto(false), 2200);
  }
  return { aggiungi, fatto };
}

/** Scheda prodotto: aggiunge la vettura nuda, senza add-on */
export function AddProductButton(props: Base & { className?: string }) {
  const { aggiungi, fatto } = useAggiunta();
  const { className, ...line } = props;
  return (
    <button
      type="button"
      onClick={() => aggiungi(line, "prodotto")}
      className={
        className ??
        "bg-[var(--champagne)] text-[var(--ink)] label px-10 py-4 hover:bg-white transition-colors duration-200"
      }
    >
      {fatto ? "Aggiunto ✓" : "Aggiungi al carrello"}
    </button>
  );
}

/** Scheda pacchetto: aggiunge l'esperienza preconfigurata */
export function AddPackageButton(props: Base & { className?: string }) {
  const { aggiungi, fatto } = useAggiunta();
  const { className, ...line } = props;
  return (
    <button
      type="button"
      onClick={() => aggiungi(line, "pacchetto")}
      className={
        className ??
        "label border border-[var(--champagne)] text-[var(--champagne)] px-6 py-3 hover:bg-[var(--champagne)] hover:text-[var(--ink)] transition-colors duration-200"
      }
    >
      {fatto ? "Aggiunto ✓" : "Aggiungi"}
    </button>
  );
}
