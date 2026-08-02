/**
 * Tipi ricalcati sulle forme della Shopify Storefront API.
 *
 * Non sono un'astrazione nostra: sono deliberatamente identici a ciò che
 * restituirà `storefront.query(...)`. Quando arriverà Shopify, cambia solo
 * l'implementazione dentro `lib/catalog.ts` — i componenti restano invariati
 * perché consumano già queste forme.
 */

export type Money = {
  amount: string;        // Shopify restituisce stringhe decimali, non number
  currencyCode: string;  // "EUR"
};

export type Image = {
  url: string;
  altText: string;
  width: number;
  height: number;
} | null;

export type ProductVariant = {
  id: string;
  title: string;
  availableForSale: boolean;
  price: Money;
  selectedOptions: { name: string; value: string }[];
};

export type Product = {
  id: string;
  handle: string;
  title: string;
  description: string;
  vendor: string;
  productType: string;
  tags: string[];
  featuredImage: Image;
  images: Image[];
  priceRange: { minVariantPrice: Money; maxVariantPrice: Money };
  variants: ProductVariant[];
  /** Non-Shopify: metafield previsti in fase di migrazione */
  metafields: {
    citta?: string;
    durata?: string;
    incluso?: string[];
    partner?: string;
  };
};

export type Collection = {
  id: string;
  handle: string;
  title: string;
  description: string;
  image: Image;
  /** Copy editoriale della pagina servizio */
  kicker: string;
  intro: string;
};
