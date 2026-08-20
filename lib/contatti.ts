/* ────────────────────────────────────────────────────────────────
   I CONTATTI, IN UN POSTO SOLO.

   Erano scritti a mano in due file diversi — components/Operator.tsx
   e components/QuoteTab.tsx — con lo stesso segnaposto ripetuto. Due
   punti da ricordarsi il giorno che arriva il numero vero, e uno dei
   due sarebbe rimasto indietro.

   ⚠️ DA SOSTITUIRE PRIMA DI PUBBLICARE: i valori qui sotto sono
   segnaposto. `CONTATTI_VERI` è la spia — finché è false, il sito
   sa di non avere ancora numeri veri e si comporta di conseguenza.
   ──────────────────────────────────────────────────────────────── */

/** Numero come si legge a schermo */
export const TELEFONO = "+39 000 000 0000";

/** Lo stesso numero in forma internazionale compatta, senza spazi */
const TELEFONO_E164 = "+390000000000";

export const TELEFONO_HREF = `tel:${TELEFONO_E164}`;
export const WHATSAPP_HREF = `https://wa.me/${TELEFONO_E164.replace("+", "")}`;

/**
 * Falso finché il numero è un segnaposto.
 *
 * Serve a non mettere in pagina un pulsante che chiama lo zero: dove
 * questa è false, le due voci della barra mobile portano al modulo di
 * richiesta invece che al telefono. Il giorno che si mette il numero
 * vero basta metterla a true — nient'altro cambia.
 */
export const CONTATTI_VERI = false;

/* ── Orario di assistenza ────────────────────────────────────────
   Usato da useInLinea() in components/Operator.tsx. Il calcolo sta
   lì, i numeri stanno qui: l'orario è una decisione commerciale.
   ──────────────────────────────────────────────────────────────── */

export const ORARIO = {
  /** Giorni della settimana in cui si risponde. 0 = domenica */
  giorniChiusi: [0],
  /** Prima ora buona e prima ora non più buona (24h) */
  dalle: 9,
  alle: 20,
  /** Come si scrive, quando lo si scrive */
  testo: "Lunedì–sabato, 9:00 – 20:00",
} as const;
