import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import QuoteTab from "@/components/QuoteTab";

export const metadata: Metadata = {
  title: {
    default: "GOLDEN — Marketplace italiano di esperienze",
    template: "%s | GOLDEN",
  },
  description:
    "Noleggio auto, wedding planner e cena sushi in delivery. Partner verificati, un solo referente, dalla richiesta alla consegna.",
  openGraph: {
    title: "GOLDEN — Marketplace italiano di esperienze",
    description:
      "Noleggio auto, wedding planner e cena sushi in delivery. Partner verificati, un solo referente.",
    type: "website",
    locale: "it_IT",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="it">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Noto+Serif+Display:wght@400;500&family=Jost:wght@300;400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="pb-[60px] lg:pb-0">
        <Header />
        <main>{children}</main>
        <Footer />
        <QuoteTab />
      </body>
    </html>
  );
}
