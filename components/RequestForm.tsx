"use client";

import { useState, type FormEvent } from "react";
import { useAccount, useOperator } from "./StoreProvider";
import type { Richiesta } from "@/lib/store";
import { inviaModulo } from "@/lib/invia";
import { TELEFONO, TELEFONO_HREF, WHATSAPP_HREF, CONTATTI_VERI } from "@/lib/contatti";
import Reveal from "./Reveal";
import { Bottone, BottoneLink, BottoneA } from "./Bottone";

/* ────────────────────────────────────────────────────────────────
   Modulo di richiesta libera.

   È la strada per chi non passa dal carrello: non sa ancora cosa
   vuole, ha una data e una città e basta. All'invio nasce una
   Richiesta senza righe (`lines: []`) e con `oggetto` valorizzato —
   la stessa entità che produce il checkout, così finisce nello
   stesso elenco dell'area personale.

   L'invio vero passa da `lib/invia.ts`. Due cose importanti:

   1. La richiesta si registra in locale **comunque**, anche se
      l'invio fallisce: il cliente la ritrova nell'area personale e
      noi non perdiamo quello che aveva scritto.
   2. Se l'invio non riesce non si dice "vi ricontattiamo": si dice
      che non è arrivata e si danno telefono e WhatsApp. Una finta
      conferma è peggio di un errore dichiarato.

   PER SHOPIFY: qui si crea una DraftOrder vuota con note, oppure si
   fa una POST al CRM. Cambia il corpo di `inviaModulo`, non questa
   schermata.
   ──────────────────────────────────────────────────────────────── */

const COSA = [
  "Noleggio auto",
  "Matrimonio o cerimonia",
  "Cena sushi in delivery",
  "Non lo so ancora",
] as const;

export default function RequestForm({ origine = "Modulo" }: { origine?: string }) {
  const { account, login, update, registraRichiesta } = useAccount();
  const operator = useOperator();

  const [cosa, setCosa] = useState<string>(COSA[0]);
  const [quando, setQuando] = useState("");
  const [dove, setDove] = useState(account?.citta ?? "");
  const [nome, setNome] = useState(account?.nome ?? "");
  const [contatto, setContatto] = useState(account?.telefono ?? account?.email ?? "");
  const [inviata, setInviata] = useState<Richiesta | null>(null);
  const [inCorso, setInCorso] = useState(false);
  /** null = non ancora inviata. false = registrata ma non recapitata. */
  const [recapitata, setRecapitata] = useState<boolean | null>(null);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (inCorso) return;
    setInCorso(true);

    /* Se il contatto è un'email e non c'è sessione, la richiesta
       diventa anche il primo accesso: così la si ritrova. */
    if (!account && contatto.includes("@")) login(contatto, nome);
    else if (account) update({ nome, citta: dove });

    const r = registraRichiesta({
      lines: [],
      totale: 0,
      oggetto: cosa,
      data: quando || undefined,
      citta: dove || undefined,
      origine,
    });

    const esito = await inviaModulo("Richiesta dal sito", {
      Codice: r.id,
      Servizio: cosa,
      Quando: quando,
      Dove: dove,
      Nome: nome,
      Contatto: contatto,
      Origine: origine,
    });

    setRecapitata(esito.ok);
    setInviata(r);
    setInCorso(false);
  }

  return (
    <section id="richiesta" className="sezione ancora">
      <div className="contenuto grid gap-16 lg:grid-cols-2 lg:gap-24">
        <Reveal>
          <p className="kicker mb-6">Richiesta</p>
          <h2 className="h-sezione mb-6 max-w-[18ch]">
            {!inviata
              ? "Raccontateci la giornata."
              : recapitata
                ? "Ci siamo."
                : "Scrivetela a noi a voce."}
          </h2>

          {inviata ? (
            <div className="max-w-[520px]">
              {recapitata ? (
                <>
                  <p className="text-[17px] leading-relaxed text-[var(--t2)] mb-8">
                    La richiesta <span className="text-[var(--champagne)]">{inviata.id}</span> è
                    arrivata. Vi ricontattiamo entro poche ore, sempre da parte di
                    una persona. Nessun pagamento in questa fase.
                  </p>
                  <div className="flex flex-wrap gap-4">
                    <BottoneLink href="/account">
                      Vedi la richiesta
                    </BottoneLink>
                    <Bottone type="button" onClick={() => setInviata(null)} aspetto="tenue">
                      Mandane un&apos;altra
                    </Bottone>
                  </div>
                </>
              ) : (
                /* Invio fallito, o endpoint non ancora configurato. Si dice
                   com'è: la richiesta è salvata qui ma a noi non è arrivata.
                   Promettere una chiamata che non arriverà è il modo più
                   rapido di perdere il cliente due volte. */
                <>
                  <p className="text-[17px] leading-relaxed text-[var(--t2)] mb-8">
                    Non siamo riusciti a inoltrarla: resta salvata qui come{" "}
                    <span className="text-[var(--champagne)]">{inviata.id}</span>, ma
                    a noi non è ancora arrivata. Il modo più rapido è dircelo a
                    voce — bastano due minuti.
                  </p>
                  <div className="flex flex-wrap gap-4">
                    {CONTATTI_VERI ? (
                      <>
                        <BottoneA href={TELEFONO_HREF} aspetto="primario">
                          {TELEFONO}
                        </BottoneA>
                        <BottoneA
                          href={WHATSAPP_HREF}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          WhatsApp
                        </BottoneA>
                      </>
                    ) : (
                      <Bottone type="button" onClick={() => operator.open(origine)}>
                        Parla con un concierge
                      </Bottone>
                    )}
                    <Bottone type="button" onClick={() => setInviata(null)} aspetto="tenue">
                      Riprova
                    </Bottone>
                  </div>
                </>
              )}
            </div>
          ) : (
            <form onSubmit={onSubmit} className="grid gap-10 max-w-[520px]">
              <fieldset>
                <legend className="campo-etichetta mb-4">Cosa</legend>
                <div className="flex flex-wrap gap-2">
                  {COSA.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setCosa(c)}
                      aria-pressed={cosa === c}
                      className={`text-[14px] px-4 py-3 border transition-colors duration-200 ${
                        cosa === c
                          ? "border-[var(--champagne)] text-[var(--champagne)] bg-[var(--champagne)]/[0.07]"
                          : "border-[var(--l2)] text-[var(--t2)] hover:border-[var(--l3)]"
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </fieldset>

              <div className="grid gap-10 sm:grid-cols-2">
                <Campo
                  etichetta="Quando"
                  type="date"
                  value={quando}
                  onChange={setQuando}
                />
                <Campo
                  etichetta="Dove"
                  value={dove}
                  onChange={setDove}
                  placeholder="Città"
                  required
                />
              </div>

              <div className="grid gap-10 sm:grid-cols-2">
                <Campo
                  etichetta="Nome"
                  value={nome}
                  onChange={setNome}
                  autoComplete="name"
                  required
                />
                <Campo
                  etichetta="Telefono o email"
                  value={contatto}
                  onChange={setContatto}
                  autoComplete="tel"
                  required
                />
              </div>

              <div className="flex flex-wrap gap-4 items-center">
                <Bottone type="submit" disabled={inCorso}>
                  {inCorso ? "Un istante…" : "Invia la richiesta"}
                </Bottone>
                <Bottone type="button" onClick={() => operator.open(origine)} aspetto="testo">
                  Parla con un concierge
                </Bottone>
              </div>
            </form>
          )}
        </Reveal>

        {/* Riepilogo dal vivo: si riempie mentre si scrive */}
        <Reveal delay={0.1}>
          <div className="bg-[var(--ink-800)] p-10 self-start">
            <p className="kicker mb-6">Riepilogo</p>
            <dl className="grid gap-4 text-[17px] leading-relaxed text-[var(--t2)]">
              {(
                [
                  ["Servizio", inviata?.oggetto ?? cosa],
                  ["Quando", (inviata?.data ?? quando) || "Da definire"],
                  ["Dove", (inviata?.citta ?? dove) || "Da definire"],
                  ["Contatto", contatto || "Da definire"],
                ] as const
              ).map(([k, v]) => (
                <div key={k} className="flex justify-between gap-6 border-b border-[var(--l1)] pb-4">
                  <dt>{k}</dt>
                  <dd className="text-[var(--t1)] text-right">{v}</dd>
                </div>
              ))}
            </dl>
            <p className="text-xs leading-relaxed text-[var(--muted)] mt-6">
              Rispondiamo entro poche ore, sempre da parte di una persona.
              Nessun pagamento in questa fase.
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* Stessa riga sottile del checkout: un solo campo di testo in tutto il sito */
function Campo({
  etichetta,
  value,
  onChange,
  type = "text",
  required,
  autoComplete,
  placeholder,
}: {
  etichetta: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  required?: boolean;
  autoComplete?: string;
  placeholder?: string;
}) {
  return (
    <label className="grid gap-4">
      <span className="campo-etichetta">{etichetta}</span>
      <input
        type={type}
        required={required}
        autoComplete={autoComplete}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="bg-transparent border-b border-[var(--champagne)]/40 pb-4 text-[17px] placeholder:text-[var(--t4)] focus:border-[var(--champagne)] outline-none transition-colors [color-scheme:dark]"
      />
    </label>
  );
}
