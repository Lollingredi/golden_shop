import type { NextConfig } from "next";

/**
 * Export statico: nessun backend, nessun server.
 * Quando arriverà Shopify basterà togliere `output: "export"`
 * per abilitare il rendering server-side sulle rotte del catalogo.
 */
const nextConfig: NextConfig = {
  output: "export",
  images: { unoptimized: true },
  trailingSlash: true,
};

export default nextConfig;
