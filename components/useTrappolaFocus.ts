"use client";

import { useEffect, type RefObject } from "react";

/* ────────────────────────────────────────────────────────────────
   Trattiene il focus dentro un pannello aperto.

   Prima il pannello riceveva il focus all'apertura, ma niente
   impediva al tabulatore di uscire e girare nella pagina di fondo —
   che è oscurata e inerte alla vista, non alla tastiera. Chi naviga
   così si ritrovava a percorrere un catalogo invisibile.

   Fa tre cose:
   1. ricorda chi aveva il focus prima e glielo restituisce alla
      chiusura (senza, si riparte da capo dalla pagina);
   2. sposta il focus sul primo elemento utile del pannello;
   3. cicla con Tab e Maiusc+Tab senza mai uscire.
   ──────────────────────────────────────────────────────────────── */

const FOCUSABILI = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled]):not([type=hidden])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  '[tabindex]:not([tabindex="-1"])',
].join(",");

export function useTrappolaFocus(
  ref: RefObject<HTMLElement | null>,
  attivo: boolean
): void {
  useEffect(() => {
    if (!attivo) return;
    const pannello = ref.current;
    if (!pannello) return;

    const precedente = document.activeElement as HTMLElement | null;

    const elenco = () =>
      Array.from(pannello.querySelectorAll<HTMLElement>(FOCUSABILI)).filter(
        (el) => el.offsetParent !== null || el === pannello
      );

    /* Il primo elemento utile, non il contenitore: chi apre il carrello
       si aspetta di trovarsi sul primo comando, non nel vuoto. */
    const primi = elenco();
    (primi[0] ?? pannello).focus();

    function onKey(e: KeyboardEvent) {
      if (e.key !== "Tab") return;
      const items = elenco();
      if (items.length === 0) return;
      const primo = items[0];
      const ultimo = items[items.length - 1];
      const corrente = document.activeElement;

      if (e.shiftKey && (corrente === primo || corrente === pannello)) {
        e.preventDefault();
        ultimo.focus();
      } else if (!e.shiftKey && corrente === ultimo) {
        e.preventDefault();
        primo.focus();
      }
    }

    pannello.addEventListener("keydown", onKey);
    return () => {
      pannello.removeEventListener("keydown", onKey);
      /* Il focus torna da dove era partito: il pulsante del carrello,
         la fascia, la voce di menu. */
      precedente?.focus?.();
    };
  }, [ref, attivo]);
}
