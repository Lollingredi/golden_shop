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
};

/** Comparsa allo scroll: stesso timing di sito-corbi (0.55s, ease-out) */
export default function Reveal({ children, delay = 0, y = 24, x = 0, className, as = "div" }: Props) {
  const reduced = useReducedMotion();
  const M = motion[as];
  return (
    <M
      initial={reduced ? { opacity: 1 } : { opacity: 0, y, x }}
      whileInView={{ opacity: 1, y: 0, x: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: reduced ? 0 : 0.55, delay: reduced ? 0 : delay, ease: EASE }}
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
      viewport={{ once: true, amount: 0.05 }}
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
        visible: { opacity: 1, y: 0, transition: { duration: reduced ? 0 : 0.55, ease: EASE } },
      }}
      whileHover={reduced ? {} : { y: -4, transition: { duration: 0.2 } }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
