"use client";

import { useEffect, useId, useMemo, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { formatAmount } from "@/lib/money";
import { addons, addonById, packages, packageAddonsPrice, PACKAGE_DISCOUNT } from "@/lib/experiences";
import { luoghiPerCluster } from "@/lib/luoghi";
import { quota, type Quotazione } from "@/lib/prezzo";
import { useCart, useOperator } from "./StoreProvider";
import PlaceholderMedia from "./PlaceholderMedia";
import { Bottone } from "./Bottone";

/* I tre cluster del catalogo servizi, come li vede il cliente.
   Il moltiplicatore sta in lib/regole.ts: qui solo il nome. */
const CLUSTER_ETICHETTA: Record<string, string> = {
  nord: "Milano & Nord Italia",
  centro: "Roma & Centro Italia",
  costiera: "Costiera, Isole & Resort",
};

export type BaseOption = {
  handle: string;
  title: string;
  price: number;
  imageUrl: string | null;
  imageAlt: string;
  citta?: string;
  durata?: string;
};

/**
 * Il configuratore: si parte dal momento, non dalla vettura.
 *
 * La base (l'auto) è un passaggio, gli add-on sono il prodotto.
 * Su Shopify questo diventa: variante principale + line item properties,
 * oppure il pacchetto preconfigurato scelto qui sopra.
 */
export default function ExperienceBuilder({ bases }: { bases: BaseOption[] }) {
  const reduced = useReducedMotion();
  const cart = useCart();
  const operator = useOperator();
  const [baseHandle, setBaseHandle] = useState(bases[0]?.handle ?? "");
  const [selected, setSelected] = useState<string[]>(["the-reveal", "memories"]);
  const [preset, setPreset] = useState<string | null>("the-big-reveal");
  const [aggiunto, setAggiunto] = useState(false);
  const notaRaccontoId = useId();

  /* ── Passo 4: quando e dove ───────────────────────────────────
     I due dati che lib/prezzo.ts richiede per quotare davvero.
     Finché mancano, il riepilogo mostra il listino come prima:
     il configuratore continua a funzionare senza. */
  const [luogo, setLuogo] = useState("");
  const [dataEvento, setDataEvento] = useState("");
  const campoLuogoId = useId();
  const campoDataId = useId();

  /* `adesso` si legge DOPO il montaggio, mai durante il render.
     Stessa regola dello stato in StoreProvider: l'HTML è generato
     a build time, e l'orologio di quel momento non significa
     niente. Finché è null, nessuna quotazione. */
  const [adesso, setAdesso] = useState<Date | null>(null);
  useEffect(() => setAdesso(new Date()), []);

  const base = bases.find((b) => b.handle === baseHandle) ?? bases[0];

  function toggle(id: string) {
    setPreset(null);
    setSelected((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      const group = addonById.get(id)?.group;
      const cleaned = group
        ? prev.filter((x) => addonById.get(x)?.group !== group)
        : prev;
      return [...cleaned, id];
    });
  }

  function applyPreset(id: string) {
    const pkg = packages.find((p) => p.id === id);
    if (!pkg) return;
    setPreset(id);
    setSelected(pkg.addonIds);
  }

  const chosen = useMemo(
    () => selected.map((id) => addonById.get(id)!).filter(Boolean),
    [selected]
  );
  const addonsSum = chosen.reduce((s, a) => s + Number(a.price.amount), 0);
  const presetPkg = preset ? packages.find((p) => p.id === preset) : undefined;
  const addonsCharged = presetPkg ? packageAddonsPrice(presetPkg) : addonsSum;
  const saving = addonsSum - addonsCharged;
  const total = (base?.price ?? 0) + addonsCharged;

  /* Il preventivo vero. È LA STESSA funzione che girerà sul server
     prima di aprire la cassa: se qui desse un numero diverso da lì,
     il cliente vedrebbe due cifre. Vedi MOTORE-PREZZO.md, I1 e I4. */
  const esito = useMemo(() => {
    if (!adesso || !base || !luogo || !dataEvento) return null;
    return quota({
      righe: [
        {
          kind: presetPkg ? "pacchetto" : "esperienza",
          titolo: presetPkg ? presetPkg.title : "Esperienza su misura",
          merchandiseId: `gid://golden/ProductVariant/${base.handle}-1`,
          base: base.price,
          addon: chosen.map((a) => ({
            id: a.id,
            titolo: a.title,
            listino: Number(a.price.amount),
          })),
          scontoPacchetto: presetPkg ? PACKAGE_DISCOUNT : undefined,
          quantita: 1,
        },
      ],
      luogo,
      dataEvento,
      adesso,
    });
  }, [adesso, base, luogo, dataEvento, chosen, presetPkg]);

  const preventivo: Quotazione | null = esito?.ok ? esito.quotazione : null;
  const messaggioQuota = esito && !esito.ok ? esito.messaggio : null;
  /* Senza data e luogo si mostra il listino: è il comportamento di prima */
  const totaleMostrato = preventivo ? preventivo.totale : total;

  /**
   * Il configuratore compone una riga sola: la vettura è il merchandise,
   * gli add-on sono attributi di riga. Su Shopify diventano
   * `attributes[]` della CartLine — nessuna ristrutturazione.
   */
  function aggiungiAlCarrello() {
    if (!base) return;
    cart.add({
      merchandiseId: `gid://golden/ProductVariant/${base.handle}-1`,
      kind: presetPkg ? "pacchetto" : "esperienza",
      title: presetPkg ? presetPkg.title : "Esperienza su misura",
      subtitle: base.title,
      imageUrl: base.imageUrl,
      unitPrice: totaleMostrato,
      attributes: [
        ...chosen.map((a) => ({ key: a.title, value: a.contents })),
        /* Data e località viaggiano con la riga: su Shopify sono
           line item properties, ed è così che il concierge e il
           fornitore le leggono senza aprire un altro sistema. */
        ...(preventivo
          ? [
              { key: "Data", value: preventivo.dataEvento },
              { key: "Località", value: preventivo.luogo.nome },
            ]
          : []),
      ],
      sconto: preventivo
        ? preventivo.righe[0].sconto || undefined
        : saving > 0
          ? saving
          : undefined,
    });
    setAggiunto(true);
    window.setTimeout(() => setAggiunto(false), 2200);
  }

  return (
    <div className="grid gap-12 lg:grid-cols-[1fr_380px] lg:gap-16 items-start">
      {/* ── colonna sinistra: i passaggi ─────────────────────────── */}
      <div className="grid gap-14">
        {/* passo 1 — l'esperienza */}
        <div>
          <p className="kicker mb-4">Passo 1 — L&apos;occasione</p>
          <h3 className="h-blocco mb-6">
            Da dove partiamo?
          </h3>
          <div className="flex flex-wrap gap-3">
            {packages.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => applyPreset(p.id)}
                aria-pressed={preset === p.id}
                className={`label px-5 py-3 border transition-colors duration-200 ${
                  preset === p.id
                    ? "bg-[var(--champagne)] text-[var(--ink)] border-[var(--champagne)]"
                    : "border-[var(--l2)] text-[var(--t2)] hover:border-[var(--champagne)] hover:text-[var(--champagne)]"
                }`}
              >
                {p.title}
              </button>
            ))}
            <button
              type="button"
              onClick={() => {
                setPreset(null);
                setSelected([]);
              }}
              aria-pressed={preset === null && selected.length === 0}
              className="label px-5 py-3 border border-[var(--l2)] text-[var(--t3)] hover:border-[var(--l3)] hover:text-[var(--t2)] transition-colors duration-200"
            >
              Parto da zero
            </button>
          </div>
        </div>

        {/* passo 2 — gli add-on: il cuore della pagina */}
        <div>
          <p className="kicker mb-4">Passo 2 — Cosa succede</p>
          <h3 className="h-blocco mb-2">
            Componete il momento.
          </h3>
          <p className="text-[15px] text-[var(--t3)] mb-8 max-w-[60ch]">
            Ogni voce è un servizio a sé, con la sua crew. Si aggiungono e si
            tolgono fino al giorno prima.
          </p>
          {/*
            Erano <button aria-pressed>. Corretto per un interruttore, ma
            non diceva che Memories e Cinematic si escludono: uno screen
            reader leggeva otto interruttori indipendenti.
            Ora sono caselle vere dentro un fieldset, e le due del gruppo
            "racconto" rimandano alla nota che spiega l'esclusione.
          */}
          <fieldset className="grid gap-3 sm:grid-cols-2 border-0 p-0 m-0">
            <legend className="sr-only">Add-on dell&apos;esperienza</legend>
            {addons.map((a) => {
              const on = selected.includes(a.id);
              return (
                <label
                  key={a.id}
                  className={`group text-left border cursor-pointer transition-colors duration-200 has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-[3px] has-[:focus-visible]:outline-[var(--champagne)] ${
                    on
                      ? "border-[var(--champagne)] bg-[var(--champagne)]/[0.07]"
                      : "border-[var(--l1)] hover:border-[var(--l2)] bg-[var(--ink-800)]/40"
                  }`}
                >
                  {/* Miniatura 3:2: l'add-on si riconosce prima di leggerlo.
                      Resta desaturata finché non è selezionato, così la
                      griglia non diventa un mosaico di otto fotografie. */}
                  <div className="relative aspect-[3/2] overflow-hidden">
                    <Image
                      src={a.image}
                      alt={a.imageAlt}
                      fill
                      sizes="(min-width: 640px) 300px, 90vw"
                      className={`object-cover transition-all duration-300 ${
                        on
                          ? "saturate-100 opacity-100"
                          : "saturate-[0.55] opacity-80 group-hover:saturate-100 group-hover:opacity-100"
                      }`}
                    />
                    <div
                      aria-hidden
                      className="absolute inset-0 bg-gradient-to-t from-[var(--ink)]/70 to-transparent"
                    />
                  </div>
                  <div className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <span className="font-display text-xl leading-tight block">
                        {a.title}
                      </span>
                      <span className="text-xs text-[var(--muted)]">{a.contents}</span>
                    </div>
                    <input
                      type="checkbox"
                      className="sr-only"
                      checked={on}
                      onChange={() => toggle(a.id)}
                      aria-describedby={a.group === "racconto" ? notaRaccontoId : undefined}
                    />
                    <span
                      aria-hidden
                      className={`shrink-0 w-6 h-6 border flex items-center justify-center text-[13px] leading-none transition-colors duration-200 ${
                        on
                          ? "bg-[var(--champagne)] border-[var(--champagne)] text-[var(--ink)]"
                          : "border-[var(--l2)] text-transparent group-hover:border-[var(--l3)]"
                      }`}
                    >
                      ✓
                    </span>
                  </div>
                  <p className="text-[14px] leading-relaxed text-[var(--t2)] mt-4">
                    {a.description}
                  </p>
                  <div className="flex justify-between items-baseline mt-5 pt-4 border-t border-[var(--l1)] text-xs">
                    <span className="text-[var(--muted)]">{a.durata}</span>
                    <span className="text-[var(--champagne)]">
                      + {formatAmount(Number(a.price.amount))}
                    </span>
                  </div>
                  </div>
                </label>
              );
            })}
          </fieldset>
          <p id={notaRaccontoId} className="text-xs text-[var(--muted)] mt-4">
            Memories e Cinematic si escludono: Cinematic è Memories con il video.
          </p>
        </div>

        {/* passo 3 — la base, volutamente per ultima */}
        <div>
          <p className="kicker mb-4">Passo 3 — Su cosa</p>
          <h3 className="h-blocco mb-2">
            E poi scegliete la vettura.
          </h3>
          <p className="text-[15px] text-[var(--t3)] mb-8 max-w-[60ch]">
            È la base dell&apos;esperienza. Tutte hanno consegna, coperture e
            partner verificati: cambia il carattere, non il servizio.
          </p>
          <div className="grid gap-3 grid-cols-2 md:grid-cols-3">
            {bases.map((b) => {
              const on = b.handle === baseHandle;
              return (
                <button
                  key={b.handle}
                  type="button"
                  onClick={() => setBaseHandle(b.handle)}
                  aria-pressed={on}
                  className={`text-left border transition-colors duration-200 ${
                    on ? "border-[var(--champagne)]" : "border-[var(--l1)] hover:border-[var(--l2)]"
                  }`}
                >
                  <div className="relative aspect-[16/10] overflow-hidden bg-[var(--ink-800)]">
                    {b.imageUrl ? (
                      <Image
                        src={b.imageUrl}
                        alt={b.imageAlt}
                        fill
                        sizes="(max-width: 640px) 100vw, 220px"
                        className={`object-cover transition-opacity duration-300 ${
                          on ? "opacity-100" : "opacity-60"
                        }`}
                      />
                    ) : (
                      <PlaceholderMedia label={b.title.toLowerCase()} />
                    )}
                  </div>
                  <div className="p-4">
                    <span className="block text-[15px] leading-snug">{b.title}</span>
                    <span className="text-xs text-[var(--champagne)]">
                      da {formatAmount(b.price)}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* passo 4 — quando e dove */}
        <div>
          <p className="kicker mb-4">Passo 4 — Quando e dove</p>
          <h3 className="h-blocco mb-2">Il prezzo dipende da questi due.</h3>
          <p className="text-[15px] leading-relaxed text-[var(--muted)] mb-6 max-w-[54ch]">
            Una consegna in Costiera a ferragosto non costa come una a Milano a
            novembre, e organizzare in tre giorni non costa come organizzare in
            tre mesi. Indicateli e il totale qui accanto diventa il vostro, non
            un listino.
          </p>

          <div className="grid gap-6 sm:grid-cols-2 max-w-[560px]">
            <label htmlFor={campoLuogoId} className="grid gap-3">
              <span className="campo-etichetta">Dove</span>
              {/* Le <option> vanno colorate a mano.
                  Il menu a tendina lo disegna il sistema operativo, non la
                  pagina: su Windows il pannello resta bianco e le voci
                  ereditano il testo chiaro del sito, cioè bianco su bianco.
                  `color-scheme: dark` da solo non basta — servono fondo e
                  colore dichiarati su ogni voce. */}
              <select
                id={campoLuogoId}
                value={luogo}
                onChange={(e) => setLuogo(e.target.value)}
                className="bg-transparent border-b border-[var(--champagne)]/40 pb-4 text-[17px] text-[var(--t1)] focus:border-[var(--champagne)] outline-none transition-colors [color-scheme:dark]"
              >
                <option value="" className="bg-[var(--ink)] text-[var(--t3)]">
                  Scegliete la località
                </option>
                {luoghiPerCluster().map((g) => (
                  <optgroup
                    key={g.cluster}
                    label={CLUSTER_ETICHETTA[g.cluster]}
                    className="bg-[var(--ink)] text-[var(--champagne)]"
                  >
                    {g.luoghi.map((l) => (
                      <option key={l.id} value={l.id} className="bg-[var(--ink)] text-[var(--t1)]">
                        {l.nome}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </label>

            <label htmlFor={campoDataId} className="grid gap-3">
              <span className="campo-etichetta">Quando</span>
              <input
                id={campoDataId}
                type="date"
                value={dataEvento}
                min={adesso ? adesso.toISOString().slice(0, 10) : undefined}
                onChange={(e) => setDataEvento(e.target.value)}
                className="bg-transparent border-b border-[var(--champagne)]/40 pb-4 text-[17px] focus:border-[var(--champagne)] outline-none transition-colors [color-scheme:dark]"
              />
            </label>
          </div>
        </div>
      </div>

      {/* ── colonna destra: il riepilogo ─────────────────────────── */}
      <div className="lg:sticky lg:top-[calc(var(--h-header)+32px)] bg-[var(--ink-800)] p-8">
        <p className="kicker mb-6">La vostra esperienza</p>

        {presetPkg && (
          <p className="font-display text-2xl leading-tight mb-6">{presetPkg.title}</p>
        )}

        <dl className="grid gap-3 text-[15px]">
          <div className="flex justify-between gap-4 pb-3 border-b border-[var(--l1)]">
            <dt className="text-[var(--t2)]">Base — {base?.title}</dt>
            <dd className="shrink-0">
              {formatAmount(preventivo ? preventivo.righe[0].baseQuotata : (base?.price ?? 0))}
            </dd>
          </div>

          <AnimatePresence initial={false}>
            {chosen.map((a) => (
              <motion.div
                key={a.id}
                layout={!reduced}
                initial={reduced ? false : { opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={reduced ? undefined : { opacity: 0, height: 0 }}
                transition={{ duration: 0.22, ease: [0, 0, 0.2, 1] }}
                className="flex justify-between gap-4 pb-3 border-b border-[var(--l1)] overflow-hidden"
              >
                <dt className="text-[var(--t2)]">{a.title}</dt>
                <dd className="shrink-0">
                  {formatAmount(
                    preventivo
                      ? (preventivo.righe[0].addon.find((x) => x.id === a.id)?.quotato ??
                        Number(a.price.amount))
                      : Number(a.price.amount),
                  )}
                </dd>
              </motion.div>
            ))}
          </AnimatePresence>

          {chosen.length === 0 && (
            <p className="text-[14px] text-[var(--muted)] py-2">
              Nessun add-on: resta il noleggio, e basta.
            </p>
          )}

          {/* Lo sconto pacchetto si applica per ultimo, sulla somma già
              moltiplicata: a Porto Cervo vale più che a Milano, ed è giusto
              che il riepilogo lo mostri. */}
          {(preventivo ? preventivo.righe[0].sconto : saving) > 0 && (
            <div className="flex justify-between gap-4 pb-3 border-b border-[var(--l1)] text-[var(--champagne)]">
              <dt>Formula pacchetto</dt>
              <dd className="shrink-0">
                − {formatAmount(preventivo ? preventivo.righe[0].sconto : saving)}
              </dd>
            </div>
          )}
        </dl>

        {/* ── La traccia: perché il prezzo è quello ────────────────
            Si mostrano solo i moltiplicatori diversi da 1: un fattore
            neutro non è un'informazione, è rumore. */}
        {preventivo && (
          <dl className="grid gap-2 text-[13px] mt-5 pt-4 border-t border-[var(--l1)]">
            {preventivo.fattori
              .filter((f) => f.fattore !== 1)
              .map((f) => (
                <div key={f.asse} className="flex justify-between gap-4">
                  <dt className="text-[var(--muted)]">{f.etichetta}</dt>
                  <dd className="shrink-0 text-[var(--t2)]">
                    ×{f.fattore.toLocaleString("it-IT", { minimumFractionDigits: 2 })}
                  </dd>
                </div>
              ))}
            {preventivo.fattori.every((f) => f.fattore === 1) && (
              <p className="text-[var(--muted)]">
                Nessuna variazione: località e periodo sono a tariffa piena.
              </p>
            )}
          </dl>
        )}

        <div className="flex justify-between items-baseline mt-6 mb-2">
          <span className="label text-[var(--t2)]">
            {preventivo ? "Totale" : "Totale indicativo"}
          </span>
          <span className="font-display text-[28px] text-[var(--champagne)]">
            {formatAmount(totaleMostrato)}
          </span>
        </div>

        {messaggioQuota && (
          <p className="text-xs leading-relaxed text-[var(--champagne)] mb-8">
            {messaggioQuota}
          </p>
        )}

        {!messaggioQuota && preventivo && (
          <p className="text-xs leading-relaxed text-[var(--muted)] mb-8">
            {preventivo.luogo.nome}, {preventivo.dataEvento} — IVA esclusa.
            {preventivo.provvisoria
              ? " Prezzo indicativo: i coefficienti di stagione e località sono in taratura, il preventivo lo conferma un concierge."
              : " Preventivo valido fino alle " +
                new Date(preventivo.scadeIl).toLocaleTimeString("it-IT", {
                  hour: "2-digit",
                  minute: "2-digit",
                }) +
                "."}
          </p>
        )}

        {!messaggioQuota && !preventivo && (
          <p className="text-xs leading-relaxed text-[var(--muted)] mb-8">
            Prezzi per una giornata, IVA esclusa. Indicate data e località qui
            accanto e il totale si calcola davvero.
          </p>
        )}

        <Bottone type="button" onClick={aggiungiAlCarrello} pieno>
          {aggiunto ? "Aggiunto al carrello ✓" : "Aggiungi al carrello"}
        </Bottone>
        <Bottone type="button" onClick={() => operator.open("Configuratore noleggio")} aspetto="contorno" pieno className="mt-3">
          Parla con un concierge
        </Bottone>
      </div>
    </div>
  );
}
