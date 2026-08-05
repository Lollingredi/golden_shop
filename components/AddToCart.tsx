"use client";

import { useState } from "react";
import { useCart } from "./StoreProvider";
import { Bottone, type Aspetto, type Misura } from "./Bottone";
import type { LineAttribute } from "@/lib/store";

/* ────────────────────────────────────────────────────────────────
   I pulsanti che riempiono il carrello.

   Sono client component minuscoli, montati dentro pagine che restano
   server component: così l'HTML del catalogo continua a essere
   generato a build time e solo il pulsante diventa interattivo.

   L'aspetto arriva da <Bottone>: qui non si scrivono classi.
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

type Stile = { aspetto?: Aspetto; misura?: Misura; pieno?: boolean; apri?: boolean };

function useAggiunta() {
  const cart = useCart();
  const [fatto, setFatto] = useState(false);
  function aggiungi(
    line: Base,
    kind: "prodotto" | "pacchetto" | "esperienza",
    apri = true
  ) {
    cart.add({
      apri,
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
export function AddProductButton({ aspetto, misura, pieno, apri, ...line }: Base & Stile) {
  const { aggiungi, fatto } = useAggiunta();
  return (
    <Bottone
      aspetto={aspetto}
      misura={misura}
      pieno={pieno}
      onClick={() => aggiungi(line, "prodotto", apri)}
    >
      {fatto ? "Aggiunto ✓" : "Aggiungi al carrello"}
    </Bottone>
  );
}

/** Scheda pacchetto: aggiunge l'esperienza preconfigurata */
export function AddPackageButton({ aspetto, misura, pieno, apri = false, ...line }: Base & Stile) {
  const { aggiungi, fatto } = useAggiunta();
  return (
    <Bottone
      aspetto={aspetto}
      misura={misura}
      pieno={pieno}
      onClick={() => aggiungi(line, "pacchetto", apri)}
    >
      {/* Stessa etichetta della scheda prodotto: una azione, un nome */}
      {fatto ? "Aggiunto ✓" : "Aggiungi al carrello"}
    </Bottone>
  );
}
