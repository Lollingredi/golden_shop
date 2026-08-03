"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAccount } from "@/components/StoreProvider";
import Reveal from "@/components/Reveal";

/* ────────────────────────────────────────────────────────────────
   Accesso — oggi simulato.

   Non c'è nessun server che verifichi la password: l'email diventa
   la sessione, salvata in localStorage. Serve a costruire e provare
   tutta l'area personale mentre il backend non c'è ancora.

   PER SHOPIFY: qui va la Customer Account API. Il flusso reale è
   passwordless (Shopify manda un codice a sei cifre via email), per
   questo il modulo è già scritto in due passi — email, poi codice.
   ──────────────────────────────────────────────────────────────── */

export default function LoginPage() {
  const { account, login } = useAccount();
  const router = useRouter();
  const [passo, setPasso] = useState<"email" | "codice">("email");
  const [email, setEmail] = useState("");
  const [errore, setErrore] = useState<string | null>(null);

  /* Già dentro: si va all'area personale */
  useEffect(() => {
    if (account) router.replace("/account");
  }, [account, router]);

  function inviaEmail(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!email.includes("@")) {
      setErrore("Serve un indirizzo email valido.");
      return;
    }
    setErrore(null);
    setPasso("codice");
  }

  function verificaCodice(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    // Simulazione: qualsiasi codice di sei cifre va bene.
    login(email);
    router.push("/account");
  }

  return (
    <section className="px-6 lg:px-10 pt-[140px] lg:pt-[180px] pb-24 min-h-[80vh]">
      <div className="max-w-[420px] mx-auto">
        <Reveal>
          <p className="kicker mb-6">Area personale</p>
          <h1 className="font-display text-[clamp(30px,4.4vw,42px)] leading-tight mb-4">
            {passo === "email" ? "Entrate con la vostra email." : "Controllate la posta."}
          </h1>
          <p className="text-[16px] leading-relaxed text-white/60 mb-12">
            {passo === "email"
              ? "Nessuna password da ricordare: vi mandiamo un codice a sei cifre e siete dentro."
              : `Abbiamo mandato un codice a ${email}. Arriva entro un minuto.`}
          </p>
        </Reveal>

        <Reveal delay={0.08}>
          {passo === "email" ? (
            <form onSubmit={inviaEmail} className="grid gap-8">
              <label className="grid gap-3">
                <span className="kicker">Email</span>
                <input
                  autoFocus
                  required
                  type="email"
                  name="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nome@esempio.it"
                  className="bg-transparent border-b border-[var(--champagne)]/40 pb-4 text-[17px] placeholder:text-white/25 focus:border-[var(--champagne)] outline-none transition-colors"
                />
              </label>
              {errore && <p className="text-[14px] text-[var(--champagne)]">{errore}</p>}
              <button
                type="submit"
                className="justify-self-start bg-[var(--champagne)] text-[var(--ink)] label px-10 py-4 hover:bg-white transition-colors"
              >
                Ricevi il codice
              </button>
            </form>
          ) : (
            <form onSubmit={verificaCodice} className="grid gap-8">
              <label className="grid gap-3">
                <span className="kicker">Codice a sei cifre</span>
                <input
                  autoFocus
                  required
                  inputMode="numeric"
                  pattern="[0-9]{6}"
                  maxLength={6}
                  name="codice"
                  autoComplete="one-time-code"
                  placeholder="000000"
                  className="bg-transparent border-b border-[var(--champagne)]/40 pb-4 text-[24px] tracking-[0.4em] placeholder:text-white/20 focus:border-[var(--champagne)] outline-none transition-colors"
                />
              </label>
              <p className="text-xs text-[var(--muted)] -mt-4">
                Versione dimostrativa: va bene qualsiasi sequenza di sei cifre.
              </p>
              <div className="flex flex-wrap gap-4 items-center">
                <button
                  type="submit"
                  className="bg-[var(--champagne)] text-[var(--ink)] label px-10 py-4 hover:bg-white transition-colors"
                >
                  Entra
                </button>
                <button
                  type="button"
                  onClick={() => setPasso("email")}
                  className="label text-white/50 hover:text-white transition-colors"
                >
                  Cambia email
                </button>
              </div>
            </form>
          )}
        </Reveal>

        <Reveal delay={0.16}>
          <p className="text-xs leading-relaxed text-[var(--muted)] mt-16 border-t border-white/10 pt-8">
            L&apos;area personale serve a ritrovare le richieste, le esperienze
            salvate e i dati di consegna. Non è obbligatoria: si può prenotare
            anche senza account.{" "}
            <Link href="/collections" className="text-[var(--champagne)] hover:text-white transition-colors">
              Torna al catalogo
            </Link>
          </p>
        </Reveal>
      </div>
    </section>
  );
}
