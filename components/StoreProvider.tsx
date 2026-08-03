"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  STORAGE_KEYS,
  cartCount,
  cartSubtotal,
  lineKey,
  makeId,
  readStorage,
  writeStorage,
  type Account,
  type CartLine,
  type LineAttribute,
  type Richiesta,
} from "@/lib/store";

/* ────────────────────────────────────────────────────────────────
   Un solo provider per tre stati che si parlano fra loro:
   carrello, account, operatore.

   Sta tutto qui perché sono tre cose che si intrecciano: il checkout
   legge il carrello e scrive nell'account, il popup operatore deve
   sapere se il carrello è aperto per non coprirlo.

   IDRATAZIONE — importante
   Il sito è a export statico: l'HTML viene generato a build time,
   quando localStorage non esiste. Se leggessimo lo storage durante
   il primo render, React troverebbe un HTML diverso da quello servito
   e segnalerebbe un hydration mismatch. Perciò si parte sempre dallo
   stato vuoto e si legge lo storage in useEffect, dopo il montaggio.
   `hydrated` serve ai componenti per non mostrare "0 articoli" per
   una frazione di secondo.
   ──────────────────────────────────────────────────────────────── */

type CartApi = {
  lines: CartLine[];
  count: number;
  subtotal: number;
  hydrated: boolean;
  isOpen: boolean;
  open: () => void;
  close: () => void;
  add: (line: Omit<CartLine, "id" | "quantity"> & { quantity?: number }) => void;
  setQuantity: (id: string, q: number) => void;
  remove: (id: string) => void;
  clear: () => void;
};

type AccountApi = {
  account: Account | null;
  richieste: Richiesta[];
  salvati: string[];
  hydrated: boolean;
  login: (email: string, nome?: string) => void;
  logout: () => void;
  update: (patch: Partial<Account>) => void;
  registraRichiesta: (r: Omit<Richiesta, "id" | "createdAt" | "stato">) => Richiesta;
  toggleSalvato: (handle: string) => void;
};

type OperatorApi = {
  isOpen: boolean;
  /** Contesto mostrato nel pannello: "Noleggio auto", "The Big Reveal"… */
  contesto: string | null;
  open: (contesto?: string) => void;
  close: () => void;
};

const CartCtx = createContext<CartApi | null>(null);
const AccountCtx = createContext<AccountApi | null>(null);
const OperatorCtx = createContext<OperatorApi | null>(null);

export function useCart(): CartApi {
  const c = useContext(CartCtx);
  if (!c) throw new Error("useCart va usato dentro <StoreProvider>");
  return c;
}
export function useAccount(): AccountApi {
  const c = useContext(AccountCtx);
  if (!c) throw new Error("useAccount va usato dentro <StoreProvider>");
  return c;
}
export function useOperator(): OperatorApi {
  const c = useContext(OperatorCtx);
  if (!c) throw new Error("useOperator va usato dentro <StoreProvider>");
  return c;
}

export default function StoreProvider({ children }: { children: ReactNode }) {
  const [hydrated, setHydrated] = useState(false);

  const [lines, setLines] = useState<CartLine[]>([]);
  const [cartOpen, setCartOpen] = useState(false);

  const [account, setAccount] = useState<Account | null>(null);
  const [richieste, setRichieste] = useState<Richiesta[]>([]);
  const [salvati, setSalvati] = useState<string[]>([]);

  const [operatorOpen, setOperatorOpen] = useState(false);
  const [contesto, setContesto] = useState<string | null>(null);

  /* Lettura dopo il montaggio: mai durante il render */
  useEffect(() => {
    setLines(readStorage<CartLine[]>(STORAGE_KEYS.cart, []));
    setAccount(readStorage<Account | null>(STORAGE_KEYS.account, null));
    setRichieste(readStorage<Richiesta[]>(STORAGE_KEYS.richieste, []));
    setSalvati(readStorage<string[]>(STORAGE_KEYS.salvati, []));
    setHydrated(true);
  }, []);

  /* Scrittura: solo dopo l'idratazione, altrimenti si azzererebbe */
  useEffect(() => {
    if (hydrated) writeStorage(STORAGE_KEYS.cart, lines);
  }, [lines, hydrated]);
  useEffect(() => {
    if (hydrated) writeStorage(STORAGE_KEYS.account, account);
  }, [account, hydrated]);
  useEffect(() => {
    if (hydrated) writeStorage(STORAGE_KEYS.richieste, richieste);
  }, [richieste, hydrated]);
  useEffect(() => {
    if (hydrated) writeStorage(STORAGE_KEYS.salvati, salvati);
  }, [salvati, hydrated]);

  /* Esc chiude il pannello che è aperto — prima l'operatore, poi il carrello */
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key !== "Escape") return;
      if (operatorOpen) setOperatorOpen(false);
      else if (cartOpen) setCartOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [operatorOpen, cartOpen]);

  /* Blocco dello scroll di fondo quando c'è un pannello aperto */
  useEffect(() => {
    const bloccato = cartOpen || operatorOpen;
    document.body.style.overflow = bloccato ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [cartOpen, operatorOpen]);

  /* ── Carrello ─────────────────────────────────────────────────── */

  const add = useCallback<CartApi["add"]>((incoming) => {
    const id = lineKey(incoming.merchandiseId, incoming.attributes);
    const q = incoming.quantity ?? 1;
    setLines((prev) => {
      const esistente = prev.find((l) => l.id === id);
      if (esistente) {
        return prev.map((l) => (l.id === id ? { ...l, quantity: l.quantity + q } : l));
      }
      return [...prev, { ...incoming, id, quantity: q }];
    });
    setCartOpen(true);
  }, []);

  const setQuantity = useCallback<CartApi["setQuantity"]>((id, q) => {
    setLines((prev) =>
      q <= 0 ? prev.filter((l) => l.id !== id) : prev.map((l) => (l.id === id ? { ...l, quantity: q } : l))
    );
  }, []);

  const remove = useCallback<CartApi["remove"]>((id) => {
    setLines((prev) => prev.filter((l) => l.id !== id));
  }, []);

  const clear = useCallback(() => setLines([]), []);

  const cart = useMemo<CartApi>(
    () => ({
      lines,
      count: cartCount(lines),
      subtotal: cartSubtotal(lines),
      hydrated,
      isOpen: cartOpen,
      open: () => setCartOpen(true),
      close: () => setCartOpen(false),
      add,
      setQuantity,
      remove,
      clear,
    }),
    [lines, hydrated, cartOpen, add, setQuantity, remove, clear]
  );

  /* ── Account ──────────────────────────────────────────────────── */

  const registraRichiesta = useCallback<AccountApi["registraRichiesta"]>((r) => {
    const nuova: Richiesta = {
      ...r,
      id: makeId("GLD"),
      createdAt: new Date().toISOString(),
      stato: "In lavorazione",
    };
    setRichieste((prev) => [nuova, ...prev]);
    return nuova;
  }, []);

  const accountApi = useMemo<AccountApi>(
    () => ({
      account,
      richieste,
      salvati,
      hydrated,
      login: (email, nome) =>
        setAccount((prev) =>
          prev?.email === email
            ? prev
            : {
                email,
                nome: nome ?? email.split("@")[0].replace(/[._-]+/g, " "),
                dal: new Date().toISOString(),
              }
        ),
      logout: () => setAccount(null),
      update: (patch) => setAccount((prev) => (prev ? { ...prev, ...patch } : prev)),
      registraRichiesta,
      toggleSalvato: (handle) =>
        setSalvati((prev) =>
          prev.includes(handle) ? prev.filter((h) => h !== handle) : [...prev, handle]
        ),
    }),
    [account, richieste, salvati, hydrated, registraRichiesta]
  );

  /* ── Operatore ────────────────────────────────────────────────── */

  const operator = useMemo<OperatorApi>(
    () => ({
      isOpen: operatorOpen,
      contesto,
      open: (c) => {
        setContesto(c ?? null);
        setCartOpen(false); // mai due pannelli sovrapposti
        setOperatorOpen(true);
      },
      close: () => setOperatorOpen(false),
    }),
    [operatorOpen, contesto]
  );

  return (
    <CartCtx.Provider value={cart}>
      <AccountCtx.Provider value={accountApi}>
        <OperatorCtx.Provider value={operator}>{children}</OperatorCtx.Provider>
      </AccountCtx.Provider>
    </CartCtx.Provider>
  );
}

/** Helper per costruire gli attributi di riga dagli add-on scelti */
export function attributiDaAddon(
  addon: { title: string; contents: string }[],
  extra: LineAttribute[] = []
): LineAttribute[] {
  return [
    ...addon.map((a) => ({ key: a.title, value: a.contents })),
    ...extra,
  ];
}
