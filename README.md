# GOLDEN — sito statico

Next.js (App Router) + Tailwind + framer-motion. Nessun backend: il catalogo è
un file TypeScript, il modulo di richiesta non invia nulla.

## Avvio

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # export statico in ./out
```

`next.config.ts` ha `output: "export"`: `npm run build` produce HTML statico
pubblicabile ovunque (Vercel, Netlify, un bucket S3).

## Rotte

| Percorso | Cosa |
|---|---|
| `/` | Home |
| `/collections` | Catalogo completo, i tre servizi in un colpo d'occhio |
| `/collections/noleggio-auto` | Servizio 1 — 6 vetture |
| `/collections/wedding-planner` | Servizio 2 — 5 proposte |
| `/collections/sushi-delivery` | Servizio 3 — 4 proposte |
| `/products/[handle]` | Scheda prodotto, 15 generate staticamente |

I percorsi ricalcano di proposito quelli di Shopify (`/collections/…`,
`/products/…`): quando si migra, gli URL già indicizzati non cambiano.

## Migrazione a Shopify

Tutto il lavoro sta in **`lib/catalog.ts`**, in fondo al file:

```ts
export async function getProducts(): Promise<Product[]>
export async function getProduct(handle: string): Promise<Product | undefined>
export async function getCollections(): Promise<Collection[]>
export async function getCollection(handle: string): Promise<Collection | undefined>
export async function getProductsInCollection(handle: string): Promise<Product[]>
```

Cinque funzioni, già `async`. Per passare a Shopify si sostituisce solo il loro
corpo con le query alla Storefront API. Nessuna pagina va toccata, perché:

- i tipi in `lib/shopify-types.ts` sono le forme della Storefront API, non
  un'astrazione nostra — `Money` è `{ amount: string, currencyCode: string }`,
  non un `number`, esattamente come lo restituisce Shopify;
- gli `id` sono già in formato GID (`gid://…/Product/handle`);
- ogni prodotto ha già `variants` con `selectedOptions` e `availableForSale`;
- i campi non standard stanno in `metafields`, che è dove finiranno davvero.

Restano da fare, in quel momento: il carrello (`/cart` con Cart API), il
checkout (redirect a `checkoutUrl`) e togliere `output: "export"` da
`next.config.ts` per abilitare il rendering server-side sul catalogo.

## Immagini

In `public/images/`. Due sono segnaposto dichiarati:

- **`piazza.jpg`** — usata per "Location e allestimento", va sostituita.
- I quattro prodotti sushi non hanno foto: il componente
  `PlaceholderMedia` mostra un riquadro riconoscibile invece di
  un'immagine sbagliata.

Manca ancora una fotografia della Celebrity Experience — telo nero, nastro
rosso — che è il servizio firma e oggi è raccontato solo a parole.

## Note di implementazione

- **Header** (`components/Header.tsx`): fisso, trasparente in cima e
  `bg-[var(--ink)]/95 backdrop-blur-md` dopo 20px di scroll. Hook
  `useScrollPosition` con listener passivo, ripreso da `sito-corbi`.
- **Animazioni** (`components/Reveal.tsx`): comparsa allo scroll con
  `whileInView`, `once: true`, durata 0.55s, ease `[0,0,0.2,1]`; griglie con
  `staggerChildren: 0.08`. `useReducedMotion` rispettato ovunque.
- **Token di colore** in `app/globals.css`, gli stessi del brief di design.
