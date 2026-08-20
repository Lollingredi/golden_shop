"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { FiX, FiPhone, FiMessageCircle, FiClock } from "react-icons/fi";
import { useAccount, useCart, useOperator } from "./StoreProvider";
import { Bottone, BottoneA, type Aspetto, type Misura } from "./Bottone";
import { useTrappolaFocus } from "./useTrappolaFocus";
import { STORAGE_KEYS, readStorage, writeStorage } from "@/lib/store";
import { inviaModulo } from "@/lib/invia";
import {
  TELEFONO,
  TELEFONO_HREF,
  WHATSAPP_HREF,
  CONTATTI_VERI,
  ORARIO,
} from "@/lib/contatti";

/* ────────────────────────────────────────────────────────────────
   "Parla con un concierge" — un solo pannello, quattro inneschi.

   Il pannello (OperatorDialog) è montato una volta sola nel layout.
   Tutto il resto sono pulsanti che chiamano useOperator().open(contesto).
   Il contesto è la stringa che il concierge vedrà per primo: da dove
   è partita la richiesta.

   I quattro inneschi:
   1. Footer                  → <OperatorLink /> in components/Footer.tsx
   2. Popup in homepage       → <OperatorPopup /> in app/page.tsx
   3. Fine catalogo           → <OperatorBand /> in app/collections/page.tsx
   4. Fine schermata dettagli → <OperatorBand /> dopo il configuratore
   ──────────────────────────────────────────────────────────────── */

/* Numeri e orari stanno in lib/contatti.ts: erano scritti a mano qui e
   in QuoteTab.tsx, cioè in due posti da ricordarsi. */

/** Calcolato dopo il montaggio: l'ora del server non conta niente. */
function useInLinea(): boolean | null {
  const [inLinea, setInLinea] = useState<boolean | null>(null);
  useEffect(() => {
    const ora = new Date();
    const giorno = ora.getDay(); // 0 = domenica
    setInLinea(
      !(ORARIO.giorniChiusi as readonly number[]).includes(giorno) &&
        ora.getHours() >= ORARIO.dalle &&
        ora.getHours() < ORARIO.alle
    );
  }, []);
  return inLinea;
}

/* ── 1. Il pannello ─────────────────────────────────────────────── */

export function OperatorDialog() {
  const operator = useOperator();
  const { account } = useAccount();
  const reduced = useReducedMotion();
  const inLinea = useInLinea();
  const panelRef = useRef<HTMLDivElement>(null);
  const [inviato, setInviato] = useState(false);
  const [inCorso, setInCorso] = useState(false);
  /** null = non ancora inviata. false = non recapitata. */
  const [recapitata, setRecapitata] = useState<boolean | null>(null);

  useEffect(() => {
    if (operator.isOpen) {
      setInviato(false);
      setRecapitata(null);
    }
  }, [operator.isOpen]);

  /* Il focus resta nel pannello finché è aperto, e alla chiusura
     torna al pulsante che l'ha aperto. */
  useTrappolaFocus(panelRef, operator.isOpen);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (inCorso) return;
    setInCorso(true);

    /* I campi si leggono dal form: sono `defaultValue`, non stato
       controllato, perché il pannello si smonta a ogni chiusura. */
    const dati = new FormData(e.currentTarget);
    const esito = await inviaModulo("Richiamata concierge", {
      Nome: String(dati.get("nome") ?? ""),
      Telefono: String(dati.get("telefono") ?? ""),
      Quando: String(dati.get("quando") ?? ""),
      Contesto: operator.contesto ?? "—",
      Email: account?.email,
    });

    setRecapitata(esito.ok);
    setInviato(true);
    setInCorso(false);
  }

  return (
    <AnimatePresence>
      {operator.isOpen && (
        <>
          <motion.div
            key="op-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={operator.close}
            className="fixed inset-0 z-[70] bg-[var(--ink)]/75 backdrop-blur-[2px]"
            aria-hidden
          />
          <motion.div
            key="op-panel"
            ref={panelRef}
            tabIndex={-1}
            role="dialog"
            aria-modal="true"
            aria-label="Parla con un concierge"
            initial={reduced ? { opacity: 0 } : { opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reduced ? { opacity: 0 } : { opacity: 0, y: 16, scale: 0.98 }}
            transition={{ duration: reduced ? 0.15 : 0.3, ease: [0, 0, 0.2, 1] }}
            className="fixed z-[71] inset-x-4 bottom-4 sm:inset-x-auto sm:right-6 sm:bottom-6 sm:w-[420px] max-h-[86vh] overflow-y-auto bg-[var(--ink-800)] border border-[var(--l1)] outline-none"
          >
            <header className="flex items-start justify-between gap-4 px-7 pt-7">
              <div>
                <p className="kicker">Assistenza</p>
                <h2 className="h-blocco mt-2">
                  Parla con un concierge
                </h2>
                {operator.contesto && (
                  <p className="text-xs text-[var(--muted)] mt-2">
                    Richiesta da: <span className="text-[var(--t2)]">{operator.contesto}</span>
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={operator.close}
                aria-label="Chiudi"
                className="w-11 h-11 -mr-2 -mt-2 grid place-items-center text-[var(--t2)] hover:text-[var(--t1)] hover:bg-[var(--l1)] transition-colors shrink-0"
              >
                <FiX className="w-5 h-5" aria-hidden />
              </button>
            </header>

            <div className="px-7 py-6">
              <p className="flex items-center gap-2 text-xs text-[var(--muted)] mb-6">
                <FiClock className="w-3.5 h-3.5" aria-hidden />
                {inLinea === null
                  ? ORARIO.testo
                  : inLinea
                    ? "Adesso c'è qualcuno in linea"
                    : "Fuori orario — lasciate un numero, richiamiamo domani"}
              </p>

              {/* Le due vie dirette compaiono solo con numeri veri: un
                  pulsante "Chiamate adesso" che compone lo zero fa più
                  danno di un pulsante che non c'è. Senza, resta il
                  modulo di richiamata, che invece funziona. */}
              <div className={`grid gap-3 mb-8 ${CONTATTI_VERI ? "" : "hidden"}`}>
                <a
                  href={TELEFONO_HREF}
                  className="flex items-center gap-4 border border-[var(--l2)] px-5 py-4 hover:border-[var(--champagne)] transition-colors group"
                >
                  <FiPhone className="w-5 h-5 text-[var(--champagne)] shrink-0" aria-hidden />
                  <span className="min-w-0">
                    <span className="block text-[15px]">Chiamate adesso</span>
                    <span className="block text-xs text-[var(--muted)]">{TELEFONO}</span>
                  </span>
                </a>
                <a
                  href={WHATSAPP_HREF}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-4 border border-[var(--l2)] px-5 py-4 hover:border-[var(--champagne)] transition-colors"
                >
                  <FiMessageCircle className="w-5 h-5 text-[var(--champagne)] shrink-0" aria-hidden />
                  <span className="min-w-0">
                    <span className="block text-[15px]">Scrivete su WhatsApp</span>
                    <span className="block text-xs text-[var(--muted)]">
                      Di solito rispondiamo entro dieci minuti
                    </span>
                  </span>
                </a>
              </div>

              {inviato ? (
                recapitata ? (
                  <div className="border border-[var(--champagne)]/40 bg-[var(--champagne)]/[0.07] px-5 py-6">
                    <p className="font-display text-xl leading-tight mb-2">Vi richiamiamo noi.</p>
                    <p className="text-[14px] leading-relaxed text-[var(--t2)]">
                      La richiesta è arrivata. Se siamo in orario sentirete
                      squillare entro un&apos;ora, altrimenti domani in mattinata.
                    </p>
                  </div>
                ) : (
                  /* Non recapitata: si dichiara, e si rimanda ai due
                     contatti diretti qui sopra. Mai una finta conferma. */
                  <div className="border border-[var(--l2)] px-5 py-6">
                    <p className="font-display text-xl leading-tight mb-2">
                      Non è partita.
                    </p>
                    <p className="text-[14px] leading-relaxed text-[var(--t2)]">
                      Qualcosa ha bloccato l&apos;invio e la richiesta di
                      richiamata non è arrivata. Usate il telefono o WhatsApp
                      qui sopra: è più veloce comunque.
                    </p>
                    <Bottone
                      type="button"
                      aspetto="testo"
                      misura="sm"
                      className="mt-3 -ml-2"
                      onClick={() => setInviato(false)}
                    >
                      Riprova
                    </Bottone>
                  </div>
                )
              ) : (
                <form onSubmit={onSubmit} className="grid gap-4">
                  <p className="kicker">Oppure fatevi richiamare</p>
                  <label className="grid gap-2">
                    <span className="text-xs text-[var(--muted)]">Nome</span>
                    <input
                      required
                      name="nome"
                      defaultValue={account?.nome ?? ""}
                      autoComplete="name"
                      className="bg-transparent border-b border-[var(--l2)] pb-2 text-[15px] focus:border-[var(--champagne)] outline-none transition-colors"
                    />
                  </label>
                  <label className="grid gap-2">
                    <span className="text-xs text-[var(--muted)]">Telefono</span>
                    <input
                      required
                      type="tel"
                      name="telefono"
                      defaultValue={account?.telefono ?? ""}
                      autoComplete="tel"
                      className="bg-transparent border-b border-[var(--l2)] pb-2 text-[15px] focus:border-[var(--champagne)] outline-none transition-colors"
                    />
                  </label>
                  <label className="grid gap-2">
                    <span className="text-xs text-[var(--muted)]">Quando vi fa comodo</span>
                    <select
                      name="quando"
                      className="bg-[var(--ink-800)] border-b border-[var(--l2)] pb-2 text-[15px] focus:border-[var(--champagne)] outline-none transition-colors"
                    >
                      <option>Appena possibile</option>
                      <option>In mattinata</option>
                      <option>Nel pomeriggio</option>
                      <option>In serata</option>
                    </select>
                  </label>
                  <Bottone type="submit" pieno className="mt-2" disabled={inCorso}>
                    {inCorso ? "Un istante…" : "Richiedi una chiamata"}
                  </Bottone>
                  <p className="text-[11px] leading-relaxed text-[var(--muted)]">
                    Il numero serve solo per questa chiamata. Nessuna newsletter.
                  </p>
                </form>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

/* ── 2. Innesco compatto — footer, carrello, righe di testo ─────── */

export function OperatorLink({
  contesto,
  aspetto = "testo",
  misura = "sm",
  children = "Parla con un concierge",
}: {
  contesto?: string;
  aspetto?: Aspetto;
  misura?: Misura;
  children?: React.ReactNode;
}) {
  const operator = useOperator();
  return (
    <Bottone aspetto={aspetto} misura={misura} onClick={() => operator.open(contesto)}>
      {children}
    </Bottone>
  );
}

/* ── 2-bis. Innesco a riga — dove la domanda nasce ──────────────── */

/**
 * Versione discreta della fascia, per i punti in mezzo alla pagina.
 *
 * La fascia larga dopo il configuratore interrompeva la lettura: la
 * pagina continuava per altre due sezioni, quindi non chiudeva niente.
 * Qui resta un invito di una riga, e la fascia si sposta in fondo.
 */
export function OperatorRiga({ contesto, testo }: { contesto: string; testo: string }) {
  const operator = useOperator();
  const inLinea = useInLinea();
  return (
    <div className="contenuto mt-10 flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-[var(--l1)] pt-6">
      <p className="text-[15px] text-[var(--t2)] flex-1 min-w-[24ch]">
        {testo}
        {inLinea && (
          <span className="text-[var(--champagne)]"> · c&apos;è qualcuno in linea adesso</span>
        )}
      </p>
      <Bottone aspetto="testo" misura="sm" onClick={() => operator.open(contesto)}>
        Parla con un concierge
      </Bottone>
    </div>
  );
}

/* ── 3. Innesco a fascia — fine catalogo, fine pagina ───────────── */

export function OperatorBand({
  contesto,
  titolo = "Non siete sicuri di cosa scegliere?",
  testo = "Un concierge vi accompagna: conosce le vetture, le date libere e i partner. Cinque minuti al telefono valgono mezz'ora di catalogo.",
}: {
  contesto: string;
  titolo?: string;
  testo?: string;
}) {
  const operator = useOperator();
  const inLinea = useInLinea();

  return (
    <section className="sezione-stretta border-t border-[var(--l1)]">
      <div className="contenuto bg-[var(--ink-800)] border border-[var(--l1)] px-8 py-12 lg:px-16 lg:py-16 grid gap-8 lg:grid-cols-[1.3fr_auto] lg:items-center">
        <div>
          <p className="kicker mb-4 flex items-center gap-3">
            Assistenza
            {inLinea && (
              <span className="inline-flex items-center gap-2 text-[var(--champagne)]">
                <span className="w-[6px] h-[6px] rounded-full bg-[var(--champagne)]" aria-hidden />
                in linea adesso
              </span>
            )}
          </p>
          <h2 className="h-sezione mb-4 max-w-[22ch]">
            {titolo}
          </h2>
          <p className="text-[16px] leading-relaxed text-[var(--t2)] max-w-[58ch]">{testo}</p>
        </div>
        <div className="flex flex-wrap gap-4 lg:justify-end">
          <Bottone onClick={() => operator.open(contesto)}>Parla con un concierge</Bottone>
          {CONTATTI_VERI && (
            <BottoneA href={WHATSAPP_HREF} target="_blank" rel="noopener noreferrer">
              WhatsApp
            </BottoneA>
          )}
        </div>
      </div>
    </section>
  );
}

/* ── 4. Popup in homepage ───────────────────────────────────────── */

/**
 * Compare una volta sola per sessione, e solo se l'utente ha dato
 * segno di stare guardando davvero: 40% di scroll oppure 18 secondi.
 * Non compare se il carrello o il pannello sono già aperti — coprire
 * un carrello aperto con un popup è il modo migliore per perdere
 * l'ordine.
 */
export function OperatorPopup({ contesto = "Homepage" }: { contesto?: string }) {
  const operator = useOperator();
  const cart = useCart();
  const reduced = useReducedMotion();
  const [visibile, setVisibile] = useState(false);
  const chiusoRef = useRef(false);

  useEffect(() => {
    if (readStorage<boolean>(STORAGE_KEYS.popup, false)) return;

    let fatto = false;
    const mostra = () => {
      if (fatto || chiusoRef.current) return;
      fatto = true;
      setVisibile(true);
    };

    const timer = window.setTimeout(mostra, 18_000);
    const onScroll = () => {
      const percorso =
        window.scrollY / Math.max(1, document.body.scrollHeight - window.innerHeight);
      if (percorso > 0.4) mostra();
    };
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  function chiudi(perSempre: boolean) {
    chiusoRef.current = true;
    setVisibile(false);
    if (perSempre) writeStorage(STORAGE_KEYS.popup, true);
  }

  const nascosto = cart.isOpen || operator.isOpen;

  return (
    <AnimatePresence>
      {visibile && !nascosto && (
        <motion.div
          initial={reduced ? { opacity: 0 } : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduced ? { opacity: 0 } : { opacity: 0, y: 12 }}
          transition={{ duration: reduced ? 0.15 : 0.35, ease: [0, 0, 0.2, 1] }}
          role="complementary"
          aria-label="Assistenza"
          className="fixed z-[55] left-4 right-4 bottom-[76px] sm:left-auto sm:right-6 sm:bottom-6 sm:w-[360px] bg-[var(--ink-800)] border border-[var(--champagne)]/35 shadow-2xl"
        >
          <button
            type="button"
            onClick={() => chiudi(true)}
            aria-label="Chiudi e non mostrare più"
            className="absolute top-2 right-2 w-9 h-9 grid place-items-center text-[var(--t3)] hover:text-[var(--t1)] transition-colors"
          >
            <FiX className="w-4 h-4" aria-hidden />
          </button>

          <div className="px-6 py-6 pr-12">
            <p className="kicker mb-3">C&apos;è qualcuno</p>
            <p className="font-display text-xl leading-tight mb-3">
              Vi serve una mano a scegliere?
            </p>
            <p className="text-[14px] leading-relaxed text-[var(--t2)] mb-5">
              Un concierge vero, non un assistente automatico. Vi dice in due
              minuti cosa è libero nelle vostre date.
            </p>
            <div className="flex flex-wrap gap-3">
              <Bottone
                misura="sm"
                onClick={() => {
                  chiudi(true);
                  operator.open(contesto);
                }}
              >
                Parla con un concierge
              </Bottone>
              <Bottone aspetto="testo" misura="sm" onClick={() => chiudi(false)}>
                Più tardi
              </Bottone>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
