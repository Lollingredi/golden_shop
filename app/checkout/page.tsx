"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import Image from "next/image";
import { useAccount, useCart, useOperator } from "@/components/StoreProvider";
import { formatAmount } from "@/lib/money";
import { acconto, ACCONTO, type Richiesta } from "@/lib/store";
import PlaceholderMedia from "@/components/PlaceholderMedia";
import Reveal from "@/components/Reveal";

/* ────────────────────────────────────────────────────────────────
   Checkout in tre passi — e non è un pagamento.

   Golden non vende una scatola: vende una giornata che dipende da
   data, città e disponibilità del partner. Chiedere la carta prima
   di aver confermato la data sarebbe scorretto e produrrebbe
   rimborsi. Quindi il flusso è: chi siete → quando e dove →
   conferma della richiesta. L'acconto si versa dopo, sul link che
   arriva insieme alla conferma del partner.

   PER SHOPIFY: i passi 1 e 2 riempiono buyerIdentity e gli
   attributes del Cart; il passo 3, invece di creare una Richiesta
   locale, fa il redirect a `cart.checkoutUrl` — oppure crea una
   DraftOrder se si resta sul modello a preventivo.
   ──────────────────────────────────────────────────────────────── */

const PASSI = ["Chi siete", "Quando e dove", "Conferma"] as const;

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
  const [inviata, setInviata] = useState<Richiesta | null>(null);

  const totale = cart.subtotal;
  const daVersare = acconto(totale);

  function avanti(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPasso((p) => p + 1);
  }

  function conferma() {
    // La sessione si crea qui se non c'era: chi conferma ha un account.
    if (!account) login(email, nome);
    else update({ nome, telefono, citta });

    const r = registraRichiesta({
      lines: cart.lines,
      totale,
      data: data || undefined,
      citta: citta || undefined,
      note: note || undefined,
    });
    cart.clear();
    setInviata(r);
  }

  /* ── Esito ─────────────────────────────────────────────────── */
  if (inviata) {
    return (
      <section className="px-6 lg:px-10 pt-[140px] lg:pt-[180px] pb-24 min-h-[70vh]">
        <div className="max-w-[620px] mx-auto">
          <Reveal>
            <p className="kicker mb-6">Richiesta {inviata.id}</p>
            <h1 className="font-display text-[clamp(30px,4.6vw,46px)] leading-tight mb-6">
              Ci siamo. Adesso tocca a noi.
            </h1>
            <p className="text-[17px] leading-relaxed text-white/70 mb-10">
              Verifichiamo la disponibilità con il partner e vi richiamiamo
              entro poche ore, sempre da parte di una persona. Solo a quel
              punto, se confermate, arriva il link per l&apos;acconto di{" "}
              {formatAmount(acconto(inviata.totale))}.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                href="/account"
                className="bg-[var(--champagne)] text-[var(--ink)] label px-10 py-4 hover:bg-white transition-colors"
              >
                Vedi la richiesta
              </Link>
              <button
                type="button"
                onClick={() => operator.open(`Richiesta ${inviata.id}`)}
                className="border border-[var(--champagne)] text-[var(--champagne)] label px-10 py-4 hover:bg-[var(--champagne)] hover:text-[var(--ink)] transition-colors"
              >
                Parla con un operatore
              </button>
            </div>
          </Reveal>
        </div>
      </section>
    );
  }

  /* ── Carrello vuoto ────────────────────────────────────────── */
  if (cart.hydrated && cart.lines.length === 0) {
    return (
      <section className="px-6 lg:px-10 pt-[140px] lg:pt-[180px] pb-24 min-h-[70vh]">
        <div className="max-w-[520px] mx-auto text-center">
          <h1 className="font-display text-[clamp(28px,4vw,40px)] leading-tight mb-6">
            Il carrello è vuoto.
          </h1>
          <p className="text-[17px] leading-relaxed text-white/60 mb-10">
            Non c&apos;è niente da confermare. Si comincia dal configuratore o
            da uno dei pacchetti.
          </p>
          <Link
            href="/collections/noleggio-auto#pacchetti"
            className="inline-block bg-[var(--champagne)] text-[var(--ink)] label px-10 py-4 hover:bg-white transition-colors"
          >
            Vedi i pacchetti
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="px-6 lg:px-10 pt-[140px] lg:pt-[180px] pb-24">
      <div className="max-w-[1280px] mx-auto">
        <Reveal>
          <p className="kicker mb-6">Conferma</p>
          <h1 className="font-display text-[clamp(30px,4.6vw,46px)] leading-tight mb-4 max-w-[18ch]">
            Nessun pagamento adesso.
          </h1>
          <p className="text-[16px] leading-relaxed text-white/60 max-w-[62ch] mb-12">
            Prima verifichiamo che la vettura sia libera nelle vostre date. Se lo
            è, ricevete il link per l&apos;acconto del {Math.round(ACCONTO * 100)}%.
            Il saldo si regola con il partner, il giorno del servizio.
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
                        ? "text-white/60"
                        : "text-white/25"
                  }`}
                >
                  <span
                    className={`w-7 h-7 grid place-items-center border text-[12px] ${
                      i <= passo ? "border-[var(--champagne)]/60" : "border-white/15"
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
                <button
                  type="submit"
                  className="justify-self-start bg-[var(--champagne)] text-[var(--ink)] label px-10 py-4 hover:bg-white transition-colors"
                >
                  Continua
                </button>
              </form>
            )}

            {passo === 1 && (
              <form onSubmit={avanti} className="grid gap-8 max-w-[520px]">
                <Campo etichetta="Data del servizio" type="date" value={data} onChange={setData} required />
                <Campo etichetta="Città o indirizzo di consegna" value={citta} onChange={setCitta} required />
                <label className="grid gap-3">
                  <span className="kicker">Qualcosa che dobbiamo sapere</span>
                  <textarea
                    rows={4}
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Orario, sorpresa da tenere segreta, accessi difficili…"
                    className="bg-transparent border-b border-[var(--champagne)]/40 pb-3 text-[16px] placeholder:text-white/25 focus:border-[var(--champagne)] outline-none transition-colors resize-none"
                  />
                </label>
                <div className="flex flex-wrap gap-4">
                  <button
                    type="submit"
                    className="bg-[var(--champagne)] text-[var(--ink)] label px-10 py-4 hover:bg-white transition-colors"
                  >
                    Continua
                  </button>
                  <button
                    type="button"
                    onClick={() => setPasso(0)}
                    className="label text-white/50 hover:text-white transition-colors"
                  >
                    Indietro
                  </button>
                </div>
              </form>
            )}

            {passo === 2 && (
              <div className="grid gap-8 max-w-[520px]">
                <dl className="grid gap-3 text-[15px]">
                  {[
                    ["Nome", nome],
                    ["Email", email],
                    ["Telefono", telefono],
                    ["Data", data],
                    ["Consegna", citta],
                    ["Note", note || "—"],
                  ].map(([k, v]) => (
                    <div key={k} className="flex justify-between gap-6 border-b border-white/10 pb-3">
                      <dt className="text-[var(--muted)]">{k}</dt>
                      <dd className="text-right max-w-[60%]">{v}</dd>
                    </div>
                  ))}
                </dl>

                <div className="border border-[var(--champagne)]/35 bg-[var(--champagne)]/[0.06] px-6 py-5">
                  <p className="text-[15px] leading-relaxed text-white/75">
                    Inviando la richiesta non addebitiamo nulla. Vi richiamiamo
                    per confermare la disponibilità, poi arriva il link per
                    l&apos;acconto di{" "}
                    <span className="text-[var(--champagne)]">{formatAmount(daVersare)}</span>.
                  </p>
                </div>

                <div className="flex flex-wrap gap-4">
                  <button
                    type="button"
                    onClick={conferma}
                    className="bg-[var(--champagne)] text-[var(--ink)] label px-10 py-4 hover:bg-white transition-colors"
                  >
                    Invia la richiesta
                  </button>
                  <button
                    type="button"
                    onClick={() => setPasso(1)}
                    className="label text-white/50 hover:text-white transition-colors"
                  >
                    Indietro
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* ── Riepilogo ───────────────────────────────────────── */}
          <aside className="lg:sticky lg:top-[104px] bg-[var(--ink-800)] p-8">
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

            <div className="border-t border-white/10 pt-4 grid gap-2 text-[15px]">
              <div className="flex justify-between">
                <span className="text-[var(--muted)]">Totale indicativo</span>
                <span>{formatAmount(totale)}</span>
              </div>
              <div className="flex justify-between text-[var(--champagne)]">
                <span>Acconto alla conferma</span>
                <span>{formatAmount(daVersare)}</span>
              </div>
              <div className="flex justify-between text-[var(--muted)] text-xs">
                <span>Saldo al partner</span>
                <span>{formatAmount(totale - daVersare)}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => operator.open("Checkout")}
              className="w-full label text-[var(--champagne)] py-4 mt-6 border-t border-white/10 hover:text-white transition-colors"
            >
              Parla con un operatore
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
}: {
  etichetta: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  required?: boolean;
  autoComplete?: string;
}) {
  return (
    <label className="grid gap-3">
      <span className="kicker">{etichetta}</span>
      <input
        type={type}
        required={required}
        autoComplete={autoComplete}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="bg-transparent border-b border-[var(--champagne)]/40 pb-3 text-[16px] placeholder:text-white/25 focus:border-[var(--champagne)] outline-none transition-colors [color-scheme:dark]"
      />
    </label>
  );
}
