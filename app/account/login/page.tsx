"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAccount } from "@/components/StoreProvider";
import Reveal from "@/components/Reveal";
import { Bottone } from "@/components/Bottone";

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
  /* Il codice ha uno stato suo: senza, l'input restava non controllato e
     React — che vede due <input> nella stessa posizione dell'albero —
     riusava lo stesso nodo del DOM. Risultato: l'email restava dentro il
     campo delle sei cifre, spaziata a 0.4em. Il `key` sul form rende la
     sostituzione esplicita. */
  const [codice, setCodice] = useState("");
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
    setCodice("");
    setPasso("codice");
  }

  function verificaCodice(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!/^\d{6}$/.test(codice)) {
      setErrore("Il codice è di sei cifre.");
      return;
    }
    // Simulazione: qualsiasi codice di sei cifre va bene.
    setErrore(null);
    login(email);
    router.push("/account");
  }

  function tornaAllEmail() {
    setCodice("");
    setErrore(null);
    setPasso("email");
  }

  return (
    <section className="zona-chiara pagina-top px-6 lg:px-10 pb-24 min-h-[80vh]">
      <div className="max-w-[420px] mx-auto">
        <Reveal>
          <p className="kicker mb-6">Area personale</p>
          <h1 className="h-pagina mb-4">
            {passo === "email" ? "Entrate con la vostra email." : "Controllate la posta."}
          </h1>
          {passo === "email" ? (
            <p className="text-[16px] leading-relaxed text-[var(--t2)] mb-12">
              Nessuna password da ricordare: vi mandiamo un codice a sei cifre e
              siete dentro.
            </p>
          ) : (
            /* L'email va a capo su una riga sua: gli indirizzi lunghi
               sfondavano la colonna da 420px. */
            <p className="text-[16px] leading-relaxed text-[var(--t2)] mb-12">
              Abbiamo mandato un codice a{" "}
              <span className="block break-all text-[var(--t1)] mt-1">{email}</span>
              <span className="block mt-1">Arriva entro un minuto.</span>
            </p>
          )}
        </Reveal>

        <Reveal delay={0.08}>
          {passo === "email" ? (
            <form key="form-email" onSubmit={inviaEmail} className="grid gap-8">
              <label className="grid gap-3">
                <span className="campo-etichetta">Email</span>
                <input
                  autoFocus
                  required
                  type="email"
                  name="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nome@esempio.it"
                  className="bg-transparent border-b border-[var(--champagne)]/40 pb-4 text-[17px] placeholder:text-[var(--t4)] focus:border-[var(--champagne)] outline-none transition-colors"
                />
              </label>
              {errore && <p className="text-[14px] text-[var(--champagne)]">{errore}</p>}
              <Bottone type="submit" className="justify-self-start">
                Ricevi il codice
              </Bottone>
            </form>
          ) : (
            <form key="form-codice" onSubmit={verificaCodice} className="grid gap-8">
              <label className="grid gap-3">
                <span className="campo-etichetta">Codice a sei cifre</span>
                <input
                  autoFocus
                  required
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]{6}"
                  maxLength={6}
                  name="codice"
                  autoComplete="one-time-code"
                  placeholder="000000"
                  value={codice}
                  /* Si accettano solo cifre: incollando "1 2 3 4 5 6" o un
                     codice con trattini il campo resta pulito. */
                  onChange={(e) => setCodice(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  className="bg-transparent border-b border-[var(--champagne)]/40 pb-4 text-[24px] tracking-[0.4em] placeholder:text-[var(--t4)] focus:border-[var(--champagne)] outline-none transition-colors"
                />
              </label>
              {errore && <p className="text-[14px] text-[var(--champagne)] -mt-4">{errore}</p>}
              <p className="text-xs text-[var(--muted)] -mt-4">
                Versione dimostrativa: va bene qualsiasi sequenza di sei cifre.
              </p>
              <div className="flex flex-wrap gap-4 items-center">
                <Bottone type="submit" className="justify-self-start">
                  Entra
                </Bottone>
                <Bottone type="button" onClick={tornaAllEmail} aspetto="tenue">
                  Cambia email
                </Bottone>
              </div>
            </form>
          )}
        </Reveal>

        <Reveal delay={0.16}>
          <p className="text-xs leading-relaxed text-[var(--muted)] mt-16 border-t border-[var(--l1)] pt-8">
            L&apos;area personale serve a ritrovare le richieste, le esperienze
            salvate e i dati di consegna. Non è obbligatoria: si può prenotare
            anche senza account.{" "}
            <Link href="/collections" className="text-[var(--champagne)] hover:text-[var(--t1)] transition-colors">
              Torna al catalogo
            </Link>
          </p>
        </Reveal>
      </div>
    </section>
  );
}
