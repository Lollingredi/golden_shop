/**
 * Segnaposto dichiarato: usato dove non abbiamo ancora una fotografia.
 * È volutamente riconoscibile — meglio un vuoto onesto di un'immagine sbagliata.
 *
 * `aria-hidden`: era role="img" con etichetta "Segnaposto: …", corretto per
 * un elemento solo ma su una griglia di quattro prodotti senza foto faceva
 * leggere quattro volte la stessa parola. Il titolo della scheda accanto dice
 * già di cosa si tratta.
 */
export default function PlaceholderMedia({ label, className = "" }: { label: string; className?: string }) {
  return (
    <div
      className={`relative w-full h-full flex items-center justify-center bg-[var(--ink-800)] ${className}`}
      style={{
        backgroundImage:
          "repeating-linear-gradient(135deg, #141833 0 14px, #101430 14px 28px)",
      }}
      aria-hidden
    >
      <span className="font-mono text-[11px] tracking-[0.1em] text-[var(--muted)] px-6 text-center">
        [ {label} ]
      </span>
    </div>
  );
}
