"use client";

import { useId, useState } from "react";
import type { ProductVariant } from "@/lib/shopify-types";
import { formatMoney } from "@/lib/money";
import { AddProductButton } from "./AddToCart";
import { OperatorLink } from "./Operator";

/* ────────────────────────────────────────────────────────────────
   Selettore di formula + aggiunta al carrello.

   Prima le due formule erano `<div>` statici con la prima evidenziata
   in champagne: sembrava un selettore, non lo era, e il carrello
   riceveva comunque la variante 1. Con un carrello vero è una
   promessa non mantenuta.

   Ora sono radio: cambiano il prezzo mostrato e la variante che
   finisce nel carrello. È già la forma del selettore di varianti di
   Shopify — `selectedOptions` su `merchandiseId`.
   ──────────────────────────────────────────────────────────────── */

export default function ScegliFormula({
  variants,
  titolo,
  imageUrl,
}: {
  variants: ProductVariant[];
  titolo: string;
  imageUrl: string | null;
}) {
  const [id, setId] = useState(variants[0]?.id ?? "");
  const gruppo = useId();
  const scelta = variants.find((v) => v.id === id) ?? variants[0];

  return (
    <>
      <p className="font-display text-3xl text-[var(--champagne)] mb-2">
        {formatMoney(scelta.price)}
      </p>
      <p className="text-xs text-[var(--muted)] mb-10">
        Prezzo indicativo. Varia con data, città e formula.
      </p>

      <fieldset className="mb-10 border-0 p-0 m-0">
        <legend className="campo-etichetta mb-4">Formula</legend>
        <div className="grid gap-3">
          {variants.map((v) => {
            const on = v.id === scelta.id;
            return (
              <label
                key={v.id}
                className={`flex justify-between items-center gap-4 border px-5 py-4 text-sm cursor-pointer transition-colors duration-200 has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-[3px] has-[:focus-visible]:outline-[var(--champagne)] ${
                  on
                    ? "border-[var(--champagne)] text-[var(--t1)]"
                    : "border-[var(--l2)] text-[var(--t2)] hover:border-[var(--l3)]"
                }`}
              >
                <input
                  type="radio"
                  name={gruppo}
                  className="sr-only"
                  checked={on}
                  onChange={() => setId(v.id)}
                  disabled={!v.availableForSale}
                />
                <span>{v.title}</span>
                <span className={on ? "text-[var(--champagne)]" : ""}>
                  {formatMoney(v.price)}
                </span>
              </label>
            );
          })}
        </div>
      </fieldset>

      {/* Due azioni sole: riempire il carrello, o parlare con qualcuno. */}
      <div className="flex flex-wrap gap-4 mb-8">
        <AddProductButton
          merchandiseId={scelta.id}
          title={titolo}
          subtitle={scelta.title}
          imageUrl={imageUrl}
          unitPrice={Number(scelta.price.amount)}
        />
        <OperatorLink contesto={titolo} aspetto="contorno" misura="md" />
      </div>
    </>
  );
}
