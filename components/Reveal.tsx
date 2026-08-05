"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";

const EASE = [0, 0, 0.2, 1] as const;

type Props = {
  children: ReactNode;
  delay?: number;
  y?: number;
  x?: number;
  className?: string;
  as?: "div" | "section" | "article" | "li";
  /**
   * Per il contenuto dell'apertura, che è già in vista al caricamento.
   * Non aspetta lo scroll e dura meno: con i tempi da scroll il titolo
   * principale ci metteva quasi otto decimi a comparire, e chi arriva
   * vede una fotografia senza parole sopra.
   */
  immediato?: boolean;
};

/** Comparsa allo scroll: stesso timing di sito-corbi (0.55s, ease-out) */
export default function Reveal({
  children,
  delay = 0,
  y = 24,
  x = 0,
  className,
  as = "div",
  immediato = false,
}: Props) {
  const reduced = useReducedMotion();
  const M = motion[as];
  const durata = reduced ? 0 : immediato ? 0.35 : 0.45;
  const ritardo = reduced ? 0 : immediato ? delay * 0.4 : delay;
  const moto = { opacity: 1, y: 0, x: 0 };
  return (
    <M
      initial={reduced ? { opacity: 1 } : { opacity: 0, y, x }}
      {...(immediato
        ? { animate: moto }
        : { whileInView: moto, viewport: { once: true, amount: 0.05, margin: "0px 0px -40px 0px" } })}
      transition={{ duration: durata, delay: ritardo, ease: EASE }}
      className={className}
    >
      {children}
    </M>
  );
}

/** Griglia con stagger: i figli entrano a 0.08s di distanza */
export function RevealGrid({ children, className }: { children: ReactNode; className?: string }) {
  const reduced = useReducedMotion();
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.02, margin: "0px 0px -40px 0px" }}
      variants={{ hidden: {}, visible: { transition: { staggerChildren: reduced ? 0 : 0.08 } } }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function RevealItem({ children, className }: { children: ReactNode; className?: string }) {
  const reduced = useReducedMotion();
  return (
    <motion.div
      variants={{
        hidden: reduced ? { opacity: 1 } : { opacity: 0, y: 24 },
        visible: { opacity: 1, y: 0, transition: { duration: reduced ? 0 : 0.45, ease: EASE } },
      }}
      whileHover={reduced ? {} : { y: -4, transition: { duration: 0.2 } }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
