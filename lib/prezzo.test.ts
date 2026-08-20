/* ────────────────────────────────────────────────────────────────
   GLI INVARIANTI, COME TEST

   Non si prova che i numeri siano giusti: i numeri sono provvisori
   e cambieranno. Si prova che le REGOLE del calcolo reggano
   qualunque numero — che è l'unica cosa che non deve rompersi
   quando il socio operations consegnerà i moltiplicatori veri.

   Per questo quasi tutti i test girano su un set di regole finto,
   dichiarato qui sotto: se domani cambia `regole.ts`, questi test
   continuano a valere.
   ──────────────────────────────────────────────────────────────── */

import { describe, expect, it } from "vitest";

import { calcolaRimborso, tabellaCancellazione } from "./cancellazione";
import { luoghi } from "./luoghi";
import { ETICHETTE_FASCIA, fascia, periodoContiene, regole, stagioneDi, type Regole } from "./regole";
import { arrotonda, quota, scaduta, totaleCoincide, type RichiestaQuotazione } from "./prezzo";

/* Regole di prova: numeri tondi e riconoscibili, scelti perché
   un errore di ordine dei fattori salti all'occhio. */
const prova: Regole = {
  versione: "test",
  cluster: {
    nord: { etichetta: "Nord", moltiplicatore: 1, commissione: 0.2 },
    centro: { etichetta: "Centro", moltiplicatore: 1, commissione: 0.2 },
    costiera: { etichetta: "Costiera", moltiplicatore: 2, commissione: 0.25 },
  },
  stagioni: [
    { id: "alta", etichetta: "Alta", da: "07-01", a: "08-31", fattori: { costiera: 3, nord: 1 } },
    { id: "capodanno", etichetta: "Capodanno", da: "12-20", a: "01-06", fattori: { nord: 2 } },
  ],
  anticipo: [5, 4, 1, 1, 1],
  trattenuta: [1, 0.75, 0.5, 0.25, 0.1],
  moltiplicatoreLuogo: {},
  scadenzaPreventivoMinuti: 30,
  arrotondamento: 10,
  anticipoMinimoGiorni: 1,
};

const ADESSO = new Date("2026-03-01T10:00:00Z");

function richiesta(p: Partial<RichiestaQuotazione> = {}): RichiestaQuotazione {
  return {
    righe: [
      {
        kind: "prodotto",
        titolo: "Lamborghini Urus SE",
        merchandiseId: "gid://golden/ProductVariant/urus-1",
        base: 1000,
        addon: [{ id: "the-reveal", titolo: "The Reveal", listino: 100 }],
        quantita: 1,
      },
    ],
    luogo: "milano",
    dataEvento: "2026-04-15", // 45 giorni: fascia neutra nelle regole di prova
    adesso: ADESSO,
    ...p,
  };
}

const ok = (e: ReturnType<typeof quota>) => {
  if (!e.ok) throw new Error(`quotazione fallita: ${e.errore}`);
  return e.quotazione;
};

describe("il calcolo è deterministico", () => {
  it("stessa richiesta, stesso istante, stesso totale", () => {
    const a = ok(quota(richiesta(), prova));
    const b = ok(quota(richiesta(), prova));
    expect(a.totale).toBe(b.totale);
    expect(a.fattori).toEqual(b.fattori);
  });

  it("non legge l'orologio: cambiando solo `adesso` cambia il prezzo", () => {
    const lontano = ok(quota(richiesta(), prova));
    const sottoData = ok(quota(richiesta({ adesso: new Date("2026-04-13T10:00:00Z") }), prova));
    expect(sottoData.totale).toBeGreaterThan(lontano.totale);
  });
});

describe("un prezzo si rifiuta invece di inventarlo", () => {
  it("località sconosciuta", () => {
    const e = quota(richiesta({ luogo: "montecarlo" }), prova);
    expect(e.ok).toBe(false);
    if (!e.ok) expect(e.errore).toBe("luogo-sconosciuto");
  });

  it("località dichiarata fuori perimetro", () => {
    const e = quota(richiesta({ luogo: "ibiza" }), prova);
    expect(e.ok).toBe(false);
    if (!e.ok) expect(e.errore).toBe("luogo-non-attivo");
  });

  it("data già passata", () => {
    const e = quota(richiesta({ dataEvento: "2026-02-01" }), prova);
    expect(e.ok).toBe(false);
    if (!e.ok) expect(e.errore).toBe("data-passata");
  });

  it("data malformata", () => {
    const e = quota(richiesta({ dataEvento: "15/04/2026" }), prova);
    expect(e.ok).toBe(false);
    if (!e.ok) expect(e.errore).toBe("data-non-valida");
  });

  it("carrello vuoto", () => {
    const e = quota(richiesta({ righe: [] }), prova);
    expect(e.ok).toBe(false);
    if (!e.ok) expect(e.errore).toBe("carrello-vuoto");
  });

  it("sotto il preavviso minimo si parla con un concierge", () => {
    const e = quota(richiesta({ dataEvento: "2026-03-01" }), prova);
    expect(e.ok).toBe(false);
    if (!e.ok) expect(e.errore).toBe("anticipo-insufficiente");
  });
});

describe("l'ordine dei fattori", () => {
  it("gli add-on prendono il cluster ma non l'anticipo", () => {
    const tardi = ok(quota(richiesta({ dataEvento: "2026-03-05" }), prova)); // 4 giorni → fascia 3-7 → ×4
    const presto = ok(quota(richiesta(), prova)); // fascia neutra → ×1

    // la base si muove...
    expect(tardi.righe[0].baseQuotata).toBe(presto.righe[0].baseQuotata * 4);
    // ...l'add-on no
    expect(tardi.righe[0].addonLordo).toBe(presto.righe[0].addonLordo);
  });

  it("il cluster invece tocca anche gli add-on", () => {
    const milano = ok(quota(richiesta(), prova));
    const capri = ok(quota(richiesta({ luogo: "capri" }), prova)); // cluster ×2

    expect(capri.righe[0].addonLordo).toBe(milano.righe[0].addonLordo * 2);
  });

  it("lo sconto pacchetto si applica per ultimo, sulla somma già moltiplicata", () => {
    const r = richiesta({
      luogo: "capri", // cluster ×2
      righe: [
        {
          kind: "pacchetto",
          titolo: "The Big Reveal",
          merchandiseId: "gid://golden/ProductVariant/pkg-1",
          base: 1000,
          addon: [
            { id: "the-reveal", titolo: "The Reveal", listino: 100 },
            { id: "memories", titolo: "Memories", listino: 100 },
          ],
          scontoPacchetto: 0.15,
          quantita: 1,
        },
      ],
    });
    const q = ok(quota(r, prova));

    // add-on: (100 + 100) × 2 = 400 → sconto 15% = 60, non 30
    expect(q.righe[0].addonLordo).toBe(400);
    expect(q.righe[0].sconto).toBe(60);
    expect(q.righe[0].sconto).toBeGreaterThan(200 * 0.15);
  });
});

describe("l'aritmetica visibile al cliente", () => {
  it("i totali sono arrotondati verso l'alto, mai in su e in giù a caso", () => {
    expect(arrotonda(2847, 10)).toBe(2850);
    expect(arrotonda(2850, 10)).toBe(2850);
    expect(arrotonda(2841, 10)).toBe(2850);
  });

  it("il totale è la somma delle righe, quantità comprese", () => {
    const r = richiesta();
    r.righe[0].quantita = 3;
    const q = ok(quota(r, prova));
    expect(q.totale).toBe(q.righe[0].unitario * 3);
  });

  it("nessun totale con i centesimi in vetrina", () => {
    const q = ok(quota(richiesta({ luogo: "capri", dataEvento: "2026-07-20" }), prova));
    expect(Number.isInteger(q.totale)).toBe(true);
    expect(q.totale % prova.arrotondamento).toBe(0);
  });
});

describe("margine e costo fornitore", () => {
  it("si conoscono all'ordine, non a fine mese", () => {
    const q = ok(quota(richiesta(), prova));
    expect(q.costoFornitore + q.margine).toBeCloseTo(q.totale, 2);
    expect(q.margine).toBeCloseTo(q.totale * 0.2, 2);
  });

  it("la commissione segue il cluster", () => {
    const q = ok(quota(richiesta({ luogo: "capri" }), prova));
    expect(q.margine).toBeCloseTo(q.totale * 0.25, 2);
  });
});

describe("la quotazione scade", () => {
  it("vale dentro la finestra e non fuori", () => {
    const q = ok(quota(richiesta(), prova));
    expect(scaduta(q, new Date(ADESSO.getTime() + 29 * 60_000))).toBe(false);
    expect(scaduta(q, new Date(ADESSO.getTime() + 31 * 60_000))).toBe(true);
  });

  it("il totale atteso dal browser si confronta con quello ricalcolato", () => {
    const q = ok(quota(richiesta(), prova));
    expect(totaleCoincide(q, q.totale)).toBe(true);
    expect(totaleCoincide(q, q.totale + 10)).toBe(false);
  });
});

describe("la traccia", () => {
  it("dice quale regola ha prodotto il prezzo", () => {
    const q = ok(quota(richiesta({ luogo: "capri", dataEvento: "2026-07-20" }), prova));
    const assi = q.fattori.map((f) => f.asse);
    expect(assi).toContain("cluster");
    expect(assi).toContain("stagione");
    expect(assi).toContain("anticipo");
    expect(q.versioneRegole).toBe("test");
  });

  it("dichiara che i moltiplicatori non sono ancora quelli veri", () => {
    const q = ok(quota(richiesta(), prova));
    expect(q.provvisoria).toBe(true); // finché REGOLE_VERE è falsa
  });
});

describe("le stagioni", () => {
  it("un periodo che scavalca il capodanno contiene entrambi i lati", () => {
    const s = prova.stagioni[1];
    expect(periodoContiene(s, new Date("2026-12-31T00:00:00Z"))).toBe(true);
    expect(periodoContiene(s, new Date("2026-01-03T00:00:00Z"))).toBe(true);
    expect(periodoContiene(s, new Date("2026-01-10T00:00:00Z"))).toBe(false);
  });

  it("il primo periodo che contiene la data vince", () => {
    // nelle regole vere Ferragosto sta prima dell'alta stagione estiva
    const ferragosto = stagioneDi(new Date("2026-08-15T00:00:00Z"), "costiera");
    expect(ferragosto.id).toBe("ferragosto");
    const luglio = stagioneDi(new Date("2026-07-10T00:00:00Z"), "costiera");
    expect(luglio.id).toBe("estate");
  });

  it("un cluster non elencato in un periodo non viene toccato", () => {
    expect(stagioneDi(new Date("2026-07-10T00:00:00Z"), "centro", prova).fattore).toBe(1);
  });
});

describe("le fasce sono un asse solo", () => {
  it("prezzo e cancellazione hanno lo stesso numero di fasce", () => {
    expect(regole.anticipo).toHaveLength(ETICHETTE_FASCIA.length);
    expect(regole.trattenuta).toHaveLength(ETICHETTE_FASCIA.length);
  });

  it("le soglie cadono dove ci si aspetta", () => {
    expect(fascia(0)).toBe(0);
    expect(fascia(2)).toBe(0);
    expect(fascia(3)).toBe(1);
    expect(fascia(6)).toBe(1);
    expect(fascia(7)).toBe(2);
    expect(fascia(89)).toBe(3);
    expect(fascia(90)).toBe(4);
    expect(fascia(9999)).toBe(4);
  });

  it("prenotare prima non costa mai di più", () => {
    for (let i = 1; i < regole.anticipo.length; i++) {
      expect(regole.anticipo[i]).toBeLessThanOrEqual(regole.anticipo[i - 1]);
    }
  });

  it("cancellare prima non rende mai di meno", () => {
    for (let i = 1; i < regole.trattenuta.length; i++) {
      expect(regole.trattenuta[i]).toBeLessThanOrEqual(regole.trattenuta[i - 1]);
    }
  });
});

describe("la cancellazione", () => {
  it("trattiene tutto sotto data e quasi niente molto prima", () => {
    const sotto = calcolaRimborso(1000, "2026-03-02", ADESSO, prova);
    expect(sotto.trattenuto).toBe(1000);
    expect(sotto.rimborso).toBe(0);

    const lontano = calcolaRimborso(1000, "2026-09-01", ADESSO, prova);
    expect(lontano.rimborso).toBe(900);
  });

  it("un evento già passato non è una cancellazione", () => {
    const e = calcolaRimborso(1000, "2026-02-01", ADESSO, prova);
    expect(e.quotaTrattenuta).toBe(1);
    expect(e.fascia).toBe("Evento già trascorso");
  });

  it("trattenuto e rimborso sommano sempre l'incassato", () => {
    for (const giorni of [0, 2, 5, 20, 60, 200]) {
      const data = new Date(ADESSO.getTime() + giorni * 86_400_000).toISOString().slice(0, 10);
      const e = calcolaRimborso(1234.56, data, ADESSO, prova);
      expect(e.trattenuto + e.rimborso).toBeCloseTo(1234.56, 2);
    }
  });

  it("la tabella per i termini ha una riga per fascia", () => {
    expect(tabellaCancellazione()).toHaveLength(ETICHETTE_FASCIA.length);
  });
});

describe("i luoghi", () => {
  it("ogni località ha un cluster fra i tre del catalogo", () => {
    for (const l of luoghi) {
      expect(["nord", "centro", "costiera"]).toContain(l.cluster);
      expect(regole.cluster[l.cluster]).toBeDefined();
    }
  });

  it("gli id sono unici", () => {
    expect(new Set(luoghi.map((l) => l.id)).size).toBe(luoghi.length);
  });
});
