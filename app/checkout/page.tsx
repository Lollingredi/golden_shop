"use client";

import { useState, type FormEvent } from "react";
import Image from "next/image";
import { useAccount, useCart, useOperator } from "@/components/StoreProvider";
import { formatAmount } from "@/lib/money";
import { type Richiesta } from "@/lib/store";
import PlaceholderMedia from "@/components/PlaceholderMedia";
import Reveal from "@/components/Reveal";
import { Bottone, BottoneLink } from "@/components/Bottone";

/* ────────────────────────────────────────────────────────────────
   Checkout in tre passi: chi siete → quando e dove → pagamento.

   Si paga l'intero importo del servizio, subito. Niente acconto e
   niente saldo da regolare con il partner il giorno stesso: chi
   arriva alla consegna ha già pagato tutto.

   OGGI il pagamento è simulato — i dati della carta non escono dal
   modulo e non vengono salvati da nessuna parte.

   PER SHOPIFY: i passi 1 e 2 riempiono buyerIdentity e gli
   attributes del Cart; il passo 3, invece del modulo carta finto,
   fa il redirect a `cart.checkoutUrl`, che incassa l'intero totale.
   ──────────────────────────────────────────────────────────────── */

const PASSI = ["Chi siete", "Quando e dove", "Pagamento"] as const;

export default function CheckoutPage() {
  const cart = useCart();
  const { account, login, update, registraRichiesta } = useAccount();
  const operator = useOperator();

  const [passo, setPasso] = useState(0);
  const [nome, setNome] = useState(account?.nome ?? "");
  const [email, setEmail] = useState(account?.email ?? "");
  const [telefono, setTelefono] = useState(account?.telefono ?? "");
  const [data, setData] = useState("");
  const [citta, setCitta] = useState(account?.citta ?? "");
  const [note, setNote] = useState("");
  /* Carta: simulata, non lascia il componente e non viene salvata */
  const [carta, setCarta] = useState("");
  const [scadenza, setScadenza] = useState("");
  const [cvc, setCvc] = useState("");
  const [inCorso, setInCorso] = useState(false);
  const [inviata, setInviata] = useState<Richiesta | null>(null);

  const totale = cart.subtotal;

  function avanti(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPasso((p) => p + 1);
  }

  function paga(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (inCorso) return;
    setInCorso(true);

    // La sessione si crea qui se non c'era: chi paga ha un account.
    if (!account) login(email, nome);
    else update({ nome, telefono, citta });

    const r = registraRichiesta({
      lines: cart.lines,
      totale,
      pagato: totale,
      data: data || undefined,
      citta: citta || undefined,
      note: note || undefined,
      origine: "Checkout",
      stato: "Confermata",
    });
    cart.clear();
    setInviata(r);
  }

  /* ── Esito ─────────────────────────────────────────────────── */
  if (inviata) {
    return (
      <section className="zona-chiara pagina-top px-6 lg:px-10 pb-24 min-h-[70vh]">
        <div className="max-w-[620px] mx-auto">
          <Reveal>
            <p className="kicker mb-6">Ordine {inviata.id}</p>
            <h1 className="h-pagina mb-6">
              Pagamento ricevuto. Adesso tocca a noi.
            </h1>
            <p className="text-[17px] leading-relaxed text-[var(--t2)] mb-10">
              Abbiamo incassato l&apos;intero importo:{" "}
              {formatAmount(inviata.totale)}. Non resta niente da versare, né
              adesso né il giorno del servizio. Un referente vi chiama entro
              poche ore per gli ultimi dettagli — orario, indirizzo, sorprese da
              tenere segrete.
            </p>
            <div className="flex flex-wrap gap-4">
              <BottoneLink href="/account">
                Vedi l&apos;ordine
              </BottoneLink>
              <Bottone type="button" onClick={() => operator.open(`Ordine ${inviata.id}`)} aspetto="contorno">
                Parla con un concierge
              </Bottone>
            </div>
          </Reveal>
        </div>
      </section>
    );
  }

  /* ── Carrello vuoto ────────────────────────────────────────── */
  if (cart.hydrated && cart.lines.length === 0) {
    return (
      <section className="zona-chiara pagina-top px-6 lg:px-10 pb-24 min-h-[70vh]">
        <div className="max-w-[520px] mx-auto text-center">
          <h1 className="h-pagina mb-6">
            Il carrello è vuoto.
          </h1>
          <p className="text-[17px] leading-relaxed text-[var(--t2)] mb-10">
            Non c&apos;è niente da pagare. Si comincia dal configuratore o da
            uno dei pacchetti.
          </p>
          <BottoneLink href="/collections/noleggio-auto#pacchetti">
            Vedi i pacchetti
          </BottoneLink>
        </div>
      </section>
    );
  }

  return (
    <section className="zona-chiara pagina-top px-6 lg:px-10 pb-24">
      <div className="contenuto">
        <Reveal>
          <p className="kicker mb-6">Pagamento</p>
          <h1 className="h-pagina mb-4 max-w-[18ch]">
            Si paga tutto adesso.
          </h1>
          <p className="text-[16px] leading-relaxed text-[var(--t2)] max-w-[62ch] mb-12">
            Nessun acconto e nessun saldo da regolare con il partner: l&apos;importo
            del servizio si versa per intero qui, e il giorno della consegna non
            c&apos;è più niente da pagare.
          </p>
        </Reveal>

        <div className="grid gap-12 lg:grid-cols-[1fr_400px] lg:gap-16 items-start">
          {/* ── I passi ─────────────────────────────────────────── */}
          <div>
            <ol className="flex flex-wrap gap-x-8 gap-y-3 mb-12">
              {PASSI.map((p, i) => (
                <li
                  key={p}
                  className={`label flex items-center gap-3 ${
                    i === passo
                      ? "text-[var(--champagne)]"
                      : i < passo
                        ? "text-[var(--t2)]"
                        : "text-[var(--t4)]"
                  }`}
                >
                  <span
                    className={`w-7 h-7 grid place-items-center border text-[12px] ${
                      i <= passo ? "border-[var(--champagne)]/60" : "border-[var(--l2)]"
                    }`}
                  >
                    {i < passo ? "✓" : i + 1}
                  </span>
                  {p}
                </li>
              ))}
            </ol>

            {passo === 0 && (
              <form onSubmit={avanti} className="grid gap-8 max-w-[520px]">
                <Campo etichetta="Nome e cognome" value={nome} onChange={setNome} autoComplete="name" required />
                <Campo etichetta="Email" type="email" value={email} onChange={setEmail} autoComplete="email" required />
                <Campo etichetta="Telefono" type="tel" value={telefono} onChange={setTelefono} autoComplete="tel" required />
                <p className="text-xs leading-relaxed text-[var(--muted)]">
                  Il telefono serve per la conferma della data: è l&apos;unico
                  modo per non perdere una disponibilità che dura poche ore.
                </p>
                <Bottone type="submit" className="justify-self-start">
                  Continua
                </Bottone>
              </form>
            )}

            {passo === 1 && (
              <form onSubmit={avanti} className="grid gap-8 max-w-[520px]">
                <Campo etichetta="Data del servizio" type="date" value={data} onChange={setData} required />
                <Campo etichetta="Città o indirizzo di consegna" value={citta} onChange={setCitta} required />
                <label className="grid gap-3">
                  <span className="campo-etichetta">Qualcosa che dobbiamo sapere</span>
                  <textarea
                    rows={4}
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Orario, sorpresa da tenere segreta, accessi difficili…"
                    className="bg-transparent border-b border-[var(--champagne)]/40 pb-3 text-[16px] placeholder:text-[var(--t4)] focus:border-[var(--champagne)] outline-none transition-colors resize-none"
                  />
                </label>
                <div className="flex flex-wrap gap-4">
                  <Bottone type="submit" className="justify-self-start">
                    Continua
                  </Bottone>
                  <Bottone type="button" onClick={() => setPasso(0)} aspetto="tenue">
                    Indietro
                  </Bottone>
                </div>
              </form>
            )}

            {passo === 2 && (
              <form onSubmit={paga} className="grid gap-8 max-w-[520px]">
                <dl className="grid gap-3 text-[15px]">
                  {[
                    ["Nome", nome],
                    ["Email", email],
                    ["Telefono", telefono],
                    ["Data", data],
                    ["Consegna", citta],
                    ["Note", note || "—"],
                  ].map(([k, v]) => (
                    <div key={k} className="flex justify-between gap-6 border-b border-[var(--l1)] pb-3">
                      <dt className="text-[var(--muted)]">{k}</dt>
                      <dd className="text-right max-w-[60%] break-words">{v}</dd>
                    </div>
                  ))}
                </dl>

                {/* Modulo carta simulato: niente esce da qui */}
                <div className="grid gap-8 border-t border-[var(--l1)] pt-8">
                  <Campo
                    etichetta="Numero della carta"
                    value={carta}
                    onChange={(v) => setCarta(formattaCarta(v))}
                    inputMode="numeric"
                    autoComplete="cc-number"
                    placeholder="0000 0000 0000 0000"
                    required
                  />
                  <div className="grid gap-8 sm:grid-cols-2">
                    <Campo
                      etichetta="Scadenza"
                      value={scadenza}
                      onChange={(v) => setScadenza(formattaScadenza(v))}
                      inputMode="numeric"
                      autoComplete="cc-exp"
                      placeholder="MM/AA"
                      required
                    />
                    <Campo
                      etichetta="CVC"
                      value={cvc}
                      onChange={(v) => setCvc(v.replace(/\D/g, "").slice(0, 4))}
                      inputMode="numeric"
                      autoComplete="cc-csc"
                      placeholder="123"
                      required
                    />
                  </div>
                </div>

                <div className="border border-[var(--champagne)]/35 bg-[var(--champagne)]/[0.06] px-6 py-5">
                  <p className="text-[15px] leading-relaxed text-[var(--t2)]">
                    Addebitiamo{" "}
                    <span className="text-[var(--champagne)]">{formatAmount(totale)}</span>,
                    cioè l&apos;intero importo del servizio. Il giorno della
                    consegna non c&apos;è nulla da saldare.
                  </p>
                  <p className="text-xs text-[var(--muted)] mt-3">
                    Versione dimostrativa: nessun addebito reale, i dati della
                    carta non vengono inviati né salvati.
                  </p>
                </div>

                <div className="flex flex-wrap gap-4">
                  <Bottone type="submit" disabled={inCorso}>
                    {inCorso ? "Un istante…" : `Paga ${formatAmount(totale)}`}
                  </Bottone>
                  <Bottone type="button" onClick={() => setPasso(1)} aspetto="tenue">
                    Indietro
                  </Bottone>
                </div>
              </form>
            )}
          </div>

          {/* ── Riepilogo ───────────────────────────────────────── */}
          <aside className="lg:sticky lg:top-[calc(var(--h-header)+32px)] bg-[var(--ink-800)] p-8">
            <p className="kicker mb-6">Riepilogo</p>
            <ul className="grid gap-5 mb-6">
              {cart.lines.map((l) => (
                <li key={l.id} className="flex gap-4">
                  <div className="relative w-[56px] h-[70px] shrink-0 bg-[var(--ink)] overflow-hidden">
                    {l.imageUrl ? (
                      <Image src={l.imageUrl} alt="" fill sizes="56px" className="object-cover" />
                    ) : (
                      <PlaceholderMedia label={l.title.toLowerCase()} />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[15px] leading-snug">
                      {l.quantity > 1 && `${l.quantity} × `}
                      {l.title}
                    </p>
                    {l.subtitle && (
                      <p className="text-xs text-[var(--muted)] truncate">{l.subtitle}</p>
                    )}
                    {l.attributes.length > 0 && (
                      <p className="text-[11px] text-[var(--champagne)] mt-1 leading-relaxed">
                        {l.attributes.map((a) => a.key).join(" · ")}
                      </p>
                    )}
                  </div>
                  <span className="text-[15px] shrink-0">
                    {formatAmount(l.unitPrice * l.quantity)}
                  </span>
                </li>
              ))}
            </ul>

            <div className="border-t border-[var(--l1)] pt-4 grid gap-2 text-[15px]">
              <div className="flex justify-between text-[var(--champagne)]">
                <span>Totale da pagare</span>
                <span className="font-display text-xl">{formatAmount(totale)}</span>
              </div>
              <div className="flex justify-between text-[var(--muted)] text-xs">
                <span>Da saldare il giorno del servizio</span>
                <span>{formatAmount(0)}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => operator.open("Checkout")}
              className="w-full label text-[var(--champagne)] py-4 mt-6 border-t border-[var(--l1)] hover:text-[var(--t1)] transition-colors"
            >
              Parla con un concierge
            </button>
          </aside>
        </div>
      </div>
    </section>
  );
}

/* Campo di testo: stessa riga sottile usata in tutto il sito */
function Campo({
  etichetta,
  value,
  onChange,
  type = "text",
  required,
  autoComplete,
  inputMode,
  placeholder,
}: {
  etichetta: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  required?: boolean;
  autoComplete?: string;
  inputMode?: "numeric" | "text" | "tel" | "email";
  placeholder?: string;
}) {
  return (
    <label className="grid gap-3">
      <span className="campo-etichetta">{etichetta}</span>
      <input
        type={type}
        required={required}
        autoComplete={autoComplete}
        inputMode={inputMode}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="bg-transparent border-b border-[var(--champagne)]/40 pb-3 text-[16px] placeholder:text-[var(--t4)] focus:border-[var(--champagne)] outline-none transition-colors [color-scheme:dark]"
      />
    </label>
  );
}

/* "4242424242424242" → "4242 4242 4242 4242". Solo cifre, massimo 16. */
function formattaCarta(v: string): string {
  const cifre = v.replace(/\D/g, "").slice(0, 16);
  return cifre.replace(/(.{4})/g, "$1 ").trim();
}

/* "1228" → "12/28". La barra si mette da sé, e cancellarla non blocca. */
function formattaScadenza(v: string): string {
  const cifre = v.replace(/\D/g, "").slice(0, 4);
  return cifre.length <= 2 ? cifre : `${cifre.slice(0, 2)}/${cifre.slice(2)}`;
}
