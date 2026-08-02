import Link from "next/link";

export default function NotFound() {
  return (
    <section className="min-h-[70vh] grid place-items-center px-6 text-center">
      <div>
        <p className="kicker mb-6">Errore 404</p>
        <h1 className="font-display text-4xl lg:text-5xl mb-8">Questa pagina non esiste.</h1>
        <Link href="/collections"
          className="label border border-[var(--champagne)] text-[var(--champagne)] px-8 py-4 inline-block hover:bg-[var(--champagne)] hover:text-[var(--ink)] transition-colors duration-200">
          Vai al catalogo
        </Link>
      </div>
    </section>
  );
}
