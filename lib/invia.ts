/* ────────────────────────────────────────────────────────────────
   L'INVIO DEI MODULI.

   Fino a ieri una richiesta finiva in localStorage e basta: il
   cliente leggeva "vi ricontattiamo entro poche ore" e non la
   riceveva nessuno. È il difetto più grave che il sito avesse,
   perché è l'unico che fa perdere clienti veri senza accorgersene.

   PERCHÉ NON C'È UNA ROTTA /api
   next.config.ts ha `output: "export"`: il sito è HTML statico, non
   c'è nessun server nostro che possa ricevere una POST. Quindi il
   browser scrive direttamente a un servizio di moduli esterno, che
   inoltra per email. Funziona su qualunque hosting, anche gratuito,
   e non richiede la partita IVA — cioè si può fare adesso.

   COME SI ACCENDE
   In `.env.local` (già escluso da .gitignore):

     NEXT_PUBLIC_FORM_ENDPOINT=https://api.web3forms.com/submit
     NEXT_PUBLIC_FORM_KEY=<la chiave del servizio>

   Con Formspree l'endpoint è `https://formspree.io/f/<id>` e la
   chiave non serve. Con Web3Forms serve la chiave. Il codice manda
   JSON semplice, che entrambi accettano: cambiare servizio è
   cambiare due righe di ambiente, non di codice.

   ⚠️ La chiave è pubblica per costruzione — sta nel JavaScript
   servito al browser. Va bene: è una chiave di solo invio, non dà
   accesso a niente. Non metterci mai altro.

   QUANDO ARRIVERÀ IL BACKEND (Q2, vedi PIANO-TECH.md)
   Si sostituisce solo il corpo di `inviaModulo`: stessa firma, POST
   verso una rotta nostra o verso il CRM. Chi la chiama non cambia.
   ──────────────────────────────────────────────────────────────── */

const ENDPOINT = process.env.NEXT_PUBLIC_FORM_ENDPOINT;
const KEY = process.env.NEXT_PUBLIC_FORM_KEY;

/** C'è un posto vero dove mandare le richieste? */
export const INVIO_ATTIVO = Boolean(ENDPOINT);

export type EsitoInvio =
  | { ok: true }
  /** `motivo` è per noi, non per il cliente: in pagina non si mostra */
  | { ok: false; motivo: "non-configurato" | "rete" | "servizio" };

/**
 * Manda un modulo. Non solleva mai: chi la chiama decide cosa dire
 * al cliente, e in nessun caso deve vedere una schermata rotta.
 *
 * @param tipo    che modulo è — finisce nell'oggetto dell'email
 * @param campi   coppie chiave/valore già pronte da leggere
 */
export async function inviaModulo(
  tipo: string,
  campi: Record<string, string | undefined>
): Promise<EsitoInvio> {
  if (!ENDPOINT) return { ok: false, motivo: "non-configurato" };

  /* Via i campi vuoti: un'email con otto righe "—" non si legge */
  const puliti = Object.fromEntries(
    Object.entries(campi).filter(([, v]) => v != null && v !== "")
  );

  const corpo: Record<string, unknown> = {
    ...puliti,
    subject: `GOLDEN — ${tipo}`,
    /* Il servizio di moduli non sa niente del sito: senza queste due
       righe, in casella non si capisce da dove arriva la richiesta. */
    tipo,
    inviato: new Date().toISOString(),
  };
  if (KEY) corpo.access_key = KEY;

  try {
    const res = await fetch(ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(corpo),
    });
    return res.ok ? { ok: true } : { ok: false, motivo: "servizio" };
  } catch {
    /* Rete assente, dominio bloccato, adblocker: succede davvero */
    return { ok: false, motivo: "rete" };
  }
}
