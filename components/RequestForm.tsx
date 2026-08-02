import Link from "next/link";
import Reveal from "./Reveal";

/**
 * Modulo statico: nessun backend.
 * Quando arriverà Shopify questo diventa un form controllato che crea
 * un draft order oppure invia a un endpoint di richiesta preventivo.
 */
export default function RequestForm() {
  const fields = [
    { label: "Cosa", hint: "Auto, matrimonio, cena sushi…" },
    { label: "Dove e quando", hint: "Città e data indicativa" },
    { label: "Come ricontattarvi", hint: "Telefono o email" },
  ];
  return (
    <section id="richiesta" className="px-6 lg:px-10 py-20 lg:py-[120px] scroll-mt-[72px]">
      <div className="max-w-[1280px] mx-auto grid gap-16 lg:grid-cols-2 lg:gap-24">
        <Reveal>
          <p className="kicker mb-6">Richiesta</p>
          <h2 className="font-display text-3xl lg:text-[40px] leading-tight mb-10 max-w-[18ch]">
            Raccontateci la giornata.
          </h2>
          <div className="grid gap-10 max-w-[520px]">
            {fields.map((f) => (
              <div key={f.label}>
                <span className="kicker block mb-4">{f.label}</span>
                <div className="border-b border-[var(--champagne)]/40 pb-4 text-[17px] text-white/50">
                  {f.hint}
                </div>
              </div>
            ))}
            <Link
              href="/#richiesta"
              className="justify-self-start bg-[var(--champagne)] text-[var(--ink)] label px-10 py-4 hover:bg-white transition-colors duration-200"
            >
              Invia la richiesta
            </Link>
          </div>
        </Reveal>

        <Reveal delay={0.1}>
          <div className="bg-[var(--ink-800)] rounded-sm p-10 self-start">
            <p className="kicker mb-6">Riepilogo</p>
            <dl className="grid gap-4 text-[17px] leading-relaxed text-white/70">
              {[
                ["Servizio", "Da definire"],
                ["Città", "Da definire"],
                ["Celebrity Experience", "Su richiesta"],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between gap-6 border-b border-white/10 pb-4">
                  <dt>{k}</dt>
                  <dd className="text-white">{v}</dd>
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
