import { BottoneLink } from "@/components/Bottone";

export default function NotFound() {
  return (
    /* pagina-top: senza, il blocco centrato in 70vh finisce otticamente
       basso sotto l'header fisso */
    <section className="pagina-top min-h-[70vh] grid place-items-center px-6 pb-24 text-center">
      <div>
        <p className="kicker mb-6">Errore 404</p>
        <h1 className="h-pagina mb-8">Questa pagina non esiste.</h1>
        <BottoneLink href="/collections" aspetto="contorno">
          Vai al catalogo
        </BottoneLink>
      </div>
    </section>
  );
}
