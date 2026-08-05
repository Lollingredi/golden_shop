"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAccount, useOperator } from "@/components/StoreProvider";
import { formatAmount } from "@/lib/money";
import Reveal from "@/components/Reveal";
import { packages } from "@/lib/experiences";
import { Bottone, BottoneLink } from "@/components/Bottone";

/* ────────────────────────────────────────────────────────────────
   Area personale.

   Tre cose e basta: le richieste inviate, le esperienze salvate, i
   dati che evitano di riscrivere tutto al prossimo giro.

   PER SHOPIFY: `richieste` diventa Customer.orders (o le draft order
   se il flusso resta a preventivo); `salvati` è una metafield lista
   sul Customer.
   ──────────────────────────────────────────────────────────────── */

const STATO_COLORE: Record<string, string> = {
  "In lavorazione": "text-[var(--champagne)] border-[var(--champagne)]/40",
  Confermata: "text-white border-[var(--l2)]",
  Conclusa: "text-[var(--muted)] border-[var(--l2)]",
};

export default function AccountPage() {
  const { account, richieste, salvati, hydrated, logout, update, toggleSalvato } = useAccount();
  const operator = useOperator();
  const router = useRouter();
  const [modifica, setModifica] = useState(false);

  /* Rotta protetta: senza sessione si torna al login.
     Il controllo aspetta l'idratazione, altrimenti rimbalzerebbe
     sempre — al primo render l'account è null per costruzione. */
  useEffect(() => {
    if (hydrated && !account) router.replace("/account/login");
  }, [hydrated, account, router]);

  if (!hydrated || !account) {
    return (
      <section className="zona-chiara pagina-top px-6 lg:px-10 pb-24 min-h-[60vh]">
        <p className="contenuto text-[var(--muted)]">Un istante…</p>
      </section>
    );
  }

  const salvatiPkg = packages.filter((p) => salvati.includes(p.id));

  return (
    /* Tutta l'area personale su fondo chiaro: è la zona amministrativa */
    <div className="zona-chiara pb-4">
      <section className="pagina-top px-6 lg:px-10 pb-16">
        <div className="contenuto flex flex-wrap gap-8 justify-between items-end">
          <Reveal>
            <p className="kicker mb-6">Area personale</p>
            <h1 className="h-pagina capitalize">
              {account.nome || "Il vostro account"}
            </h1>
            <p className="text-sm text-[var(--muted)] mt-3">
              {account.email} · dal{" "}
              {new Date(account.dal).toLocaleDateString("it-IT", {
                month: "long",
                year: "numeric",
              })}
            </p>
          </Reveal>
          <Reveal delay={0.08}>
            <Bottone
              aspetto="tenue"
              misura="sm"
              onClick={() => {
                logout();
                router.push("/");
              }}
            >
              Esci
            </Bottone>
          </Reveal>
        </div>
      </section>

      {/* ── Richieste ──────────────────────────────────────────── */}
      <section className="px-6 lg:px-10 pb-20">
        <div className="contenuto">
          <Reveal>
            <h2 className="h-sezione mb-8 border-t border-[var(--l1)] pt-10">
              Le vostre richieste
            </h2>
          </Reveal>

          {richieste.length === 0 ? (
            <Reveal delay={0.08}>
              <div className="border border-[var(--l1)] px-8 py-12 text-center">
                <p className="text-[17px] text-[var(--t2)] mb-6">
                  Nessuna richiesta, per ora.
                </p>
                <BottoneLink href="/collections/noleggio-auto#configura">
                  Componi un&apos;esperienza
                </BottoneLink>
              </div>
            </Reveal>
          ) : (
            <div className="grid gap-4">
              {richieste.map((r) => (
                <Reveal key={r.id} delay={0.04}>
                  <article className="border border-[var(--l1)] px-6 py-6 grid gap-5">
                    <div className="flex flex-wrap gap-4 justify-between items-start">
                      <div>
                        <p className="text-xs text-[var(--muted)] tracking-[0.15em]">{r.id}</p>
                        <p className="text-[15px] mt-1">
                          {new Date(r.createdAt).toLocaleDateString("it-IT", {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          })}
                          {r.citta && ` · ${r.citta}`}
                          {r.data && ` · per il ${r.data}`}
                        </p>
                      </div>
                      <span
                        className={`label px-4 py-2 border ${STATO_COLORE[r.stato] ?? ""}`}
                      >
                        {r.stato}
                      </span>
                    </div>

                    {/* Richiesta dal carrello: le righe. Richiesta libera dal
                        modulo: `lines` è vuoto e vale `oggetto`. */}
                    {r.lines.length > 0 ? (
                      <ul className="grid gap-2 border-t border-[var(--l1)] pt-4">
                        {r.lines.map((l) => (
                          <li key={l.id} className="flex flex-wrap gap-x-4 justify-between text-[15px]">
                            <span className="text-[var(--t2)]">
                              {l.quantity > 1 && `${l.quantity} × `}
                              {l.title}
                              {l.subtitle && (
                                <span className="text-[var(--muted)]"> — {l.subtitle}</span>
                              )}
                            </span>
                            <span className="text-[var(--t3)]">
                              {formatAmount(l.unitPrice * l.quantity)}
                            </span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <div className="border-t border-[var(--l1)] pt-4 text-[15px]">
                        <span className="text-[var(--t2)]">{r.oggetto ?? "Richiesta libera"}</span>
                        {r.origine && (
                          <span className="text-[var(--muted)]"> — {r.origine}</span>
                        )}
                      </div>
                    )}

                    <div className="flex flex-wrap gap-4 justify-between items-baseline border-t border-[var(--l1)] pt-4">
                      <Bottone type="button" onClick={() => operator.open(`Richiesta ${r.id}`)} aspetto="testo">
                        Parla con un concierge
                      </Bottone>
                      <span className="text-right">
                        <span className="font-display text-xl text-[var(--champagne)] block">
                          {r.totale > 0 ? formatAmount(r.totale) : "Da quotare"}
                        </span>
                        {r.pagato != null && r.pagato > 0 && (
                          <span className="text-xs text-[var(--muted)]">
                            Pagato per intero
                          </span>
                        )}
                      </span>
                    </div>
                  </article>
                </Reveal>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── Salvati ────────────────────────────────────────────── */}
      <section className="px-6 lg:px-10 pb-20">
        <div className="contenuto">
          <Reveal>
            <h2 className="h-sezione mb-8 border-t border-[var(--l1)] pt-10">
              Esperienze salvate
            </h2>
          </Reveal>
          {salvatiPkg.length === 0 ? (
            <Reveal delay={0.08}>
              <p className="text-[17px] text-[var(--t3)] max-w-[56ch] leading-relaxed">
                Niente di salvato. Dalle schede dei pacchetti potete tenere da
                parte quello che vi interessa e ritrovarlo qui.
              </p>
            </Reveal>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {salvatiPkg.map((p) => (
                <Reveal key={p.id} delay={0.04}>
                  <div className="border border-[var(--l1)] px-6 py-5 flex justify-between gap-4 items-center">
                    <div>
                      <p className="font-display text-xl">{p.title}</p>
                      <p className="text-xs text-[var(--muted)] mt-1">{p.claim}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => toggleSalvato(p.id)}
                      className="text-xs text-[var(--muted)] hover:text-[var(--t1)] transition-colors shrink-0"
                    >
                      Togli
                    </button>
                  </div>
                </Reveal>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── Dati ───────────────────────────────────────────────── */}
      <section className="px-6 lg:px-10 pb-24">
        <div className="contenuto">
          <Reveal>
            <div className="flex flex-wrap gap-4 justify-between items-baseline border-t border-[var(--l1)] pt-10 mb-8">
              <h2 className="h-sezione">I vostri dati</h2>
              <Bottone type="button" onClick={() => setModifica((v) => !v)} aspetto="testo">
                {modifica ? "Chiudi" : "Modifica"}
              </Bottone>
            </div>
          </Reveal>

          <Reveal delay={0.08}>
            <dl className="grid gap-4 max-w-[520px] text-[15px]">
              {(
                [
                  ["nome", "Nome"],
                  ["telefono", "Telefono"],
                  ["citta", "Città"],
                ] as const
              ).map(([campo, etichetta]) => (
                <div key={campo} className="flex justify-between gap-6 border-b border-[var(--l1)] pb-3">
                  <dt className="text-[var(--muted)]">{etichetta}</dt>
                  <dd className="text-right">
                    {modifica ? (
                      <input
                        value={account[campo] ?? ""}
                        onChange={(e) => update({ [campo]: e.target.value })}
                        className="bg-transparent border-b border-[var(--champagne)]/40 text-right outline-none focus:border-[var(--champagne)] transition-colors"
                      />
                    ) : (
                      account[campo] || <span className="text-[var(--t4)]">non indicato</span>
                    )}
                  </dd>
                </div>
              ))}
            </dl>
            <p className="text-xs leading-relaxed text-[var(--muted)] mt-6 max-w-[56ch]">
              Questi dati restano su questo dispositivo e servono solo a
              precompilare la conferma. Non vengono inviati da nessuna parte.
            </p>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
