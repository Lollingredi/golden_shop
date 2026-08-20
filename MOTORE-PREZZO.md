# GOLDEN — il flusso di prenotazione e dove vive il prezzo

Due cose in un documento solo, perché sono la stessa domanda.

La prima: **cosa esegue il back-end**, passo per passo, dal momento in cui
qualcuno sceglie un servizio a quando il fornitore viene saldato. È la forma
del sistema, scritta prima di costruirlo.

La seconda: **conviene appoggiarsi a Shopify o scrivere il back-end da
zero?** La risposta dipende interamente dalla prima parte, ed è il motivo per
cui le due cose stanno insieme.

Presuppone `TECNICO.md` (com'è fatto il sito), `PIANO-TECH.md` (i dodici mesi)
e `CONFRONTO-CATALOGO.md` (add-on fissi, a scaglioni, a preventivo).

---

## 1. Il flusso, in sette stadi

```
   ┌─ 1. SELEZIONE ────────────────────────────────────────────┐
   │  servizio o evento + formula                              │
   │  + DATA dell'evento        ← nuovo, oggi non è richiesta  │
   │  + LUOGO dell'evento       ← nuovo, oggi non esiste       │
   └───────────────────────────────────────────────────────────┘
                              ↓
   ┌─ 2. CONFIGURAZIONE ───────────────────────────────────────┐
   │  add-on fissi        prezzo noto                          │
   │  add-on a scaglioni  livello scelto → prezzo noto         │
   │  add-on a preventivo prezzo assente → riga "da quotare"   │
   └───────────────────────────────────────────────────────────┘
                              ↓
   ┌─ 3. QUOTAZIONE ───────────────────────────────────────────┐
   │  cluster = f(luogo)                                       │
   │  stagione = f(data evento, cluster)                       │
   │  anticipo = data evento − adesso                          │
   │  prezzo, costo fornitore e margine, calcolati insieme     │
   └───────────────────────────────────────────────────────────┘
                              ↓
   ┌─ 4. BLOCCO ───────────────────────────────────────────────┐
   │  la quotazione si congela per una finestra dichiarata     │
   │  (id preventivo + scadenza + traccia delle regole)        │
   └───────────────────────────────────────────────────────────┘
                              ↓
   ┌─ 5. CASSA ────────────────────────────────────────────────┐
   │  si incassa il TOTALE dell'evento, non un acconto         │
   │  ricalcolo lato server prima di aprire il pagamento       │
   └───────────────────────────────────────────────────────────┘
                              ↓
   ┌─ 6. ORDINE ───────────────────────────────────────────────┐
   │  assegnazione ai fornitori, quota dovuta a ciascuno       │
   │  conferma o rifiuto dello slot                            │
   └───────────────────────────────────────────────────────────┘
                              ↓
   ┌─ 7. SALDO FORNITORE ──────────────────────────────────────┐
   │  a servizio erogato, sul riepilogo periodico              │
   └───────────────────────────────────────────────────────────┘
```

Gli stadi 1 e 2 esistono già nel sito, a metà: manca la data, manca il luogo,
mancano gli scaglioni. Gli stadi da 3 a 7 non esistono affatto.

---

## 2. La formula, e le tre decisioni dentro di essa

Forma proposta, per riga di carrello:

```
riga = base × Mc × Ms × Ma  +  Σ ( addon_i × Mc )

Mc  moltiplicatore di cluster      Milano/Nord · Roma/Centro · Costiera/Isole
Ms  moltiplicatore di stagione     f(mese, settimana, cluster)
Ma  moltiplicatore di anticipo     f(giorni fra oggi e la data dell'evento)
```

Tre cose non ovvie, che vanno decise adesso perché cambiano il codice:

**Gli add-on prendono il cluster ma non l'anticipo.** Il costo di un
fotografo a Porto Cervo ad agosto è più alto che a Milano a novembre: il
cluster va applicato. Ma un fiocco in raso non costa di più perché lo si
ordina con tre giorni di anticipo: l'urgenza pesa sulla disponibilità del
mezzo e dell'equipaggio, non sull'accessorio. Applicare `Ma` anche agli add-on
gonfia il carrello proprio dove sta il margine (`SOCI.md` § 2) e rende i
pacchetti incomprensibili.

**L'anticipo può andare in due direzioni.** Sotto i sette giorni è una
maggiorazione — si stanno spostando persone e mezzi in fretta. Sopra i
novanta giorni può essere uno sconto, perché una prenotazione lontana è
capacità venduta in anticipo. Se `Ma` scende sotto 1, va detto come sconto e
non come prezzo: cambia l'obbligo di trasparenza (vedi § 9).

**Lo sconto pacchetto del 15% si applica per ultimo**, sulla somma degli
add-on già moltiplicata. Altrimenti a Porto Cervo il pacchetto sconterebbe
meno di quanto promette la scheda.

### Gli invarianti

Cinque regole che il sistema non può violare, e che vanno scritte come test
prima del codice:

**I1 — Il prezzo mostrato è il prezzo pagato.** Nessuna cifra diversa fra
configuratore, carrello, riepilogo e cassa. È la ragione tecnica che uccide
metà delle soluzioni del § 4.

**I2 — Ogni quotazione ha una scadenza dichiarata.** Se il preventivo di
martedì vale ancora venerdì, l'anticipo è cambiato e la formula si contraddice
da sola.

**I3 — Il prezzo si congela all'ordine, con la sua traccia.** Non basta
salvare il totale: vanno salvati i moltiplicatori applicati e la regola che li
ha prodotti. Serve per rispondere al cliente che chiede perché, al fornitore
che contesta la quota, e a noi fra sei mesi quando le regole saranno cambiate.

**I4 — Il prezzo si calcola sul server, sempre.** Il browser può calcolarlo
per mostrarlo, ma il server ricalcola prima di aprire la cassa. Un prezzo
che arriva dal client è un prezzo che si può modificare dal client.

**I5 — Prezzo e costo fornitore nascono nello stesso istante.** Il margine si
conosce all'ordine, non a fine mese. È l'unico modo per sapere se una regola
sta vendendo in perdita mentre lo sta facendo.

---

## 3. La conseguenza che riapre `PIANO-TECH.md`

Il piano attuale (§ 6, Q3) prevede un motore di regole che **scrive i prezzi
su Shopify con un job giornaliero**. Era la soluzione giusta per il problema
di ieri: stagione e località dipendono dal servizio, non dal cliente, e si
possono precalcolare.

**L'anticipo rompe quel disegno.** Non è una proprietà del prodotto: è la
distanza fra *adesso* e la data che *quel* cliente ha scelto, in *quel*
momento. Due persone che guardano la stessa Ferrari nello stesso secondo
vedono due prezzi diversi se una la vuole sabato e l'altra a settembre.
Nessun prezzo scritto in anticipo su un catalogo può esprimerlo.

Quindi il prezzo si calcola **al volo, a carrello, sul nostro server**. E
questo ha due conseguenze che vanno accettate insieme:

1. **Il server serve dal primo incasso, non dal Q2.** `PIANO-TECH.md` § 2
   colloca l'uscita dall'export statico nel Q2, con il portale fornitori, e ne
   fa la ragione per cui il Q1 chiude in poche settimane. Con il prezzo
   dinamico, il server si anticipa al Q1b. Non è tutto il Q2: è una rotta
   sola più un segreto da custodire. Ma il costo di gestione smette di essere
   zero tre mesi prima.
2. **Il catalogo non è più la sorgente di verità dei prezzi.** Lo diventano le
   nostre regole. Qualunque cosa stia nel catalogo è un listino di partenza.

---

## 4. Cosa Shopify consente davvero — le sei strade, e quali sono vere

Questo è il punto in cui la scelta si decide, e i vincoli non sono opinabili.

| # | Strada | Funziona? |
|---|---|---|
| 1 | **Cart Transform, operazione `lineUpdate`** — la funzione riscrive il prezzo della riga a carrello | **No.** Shopify: *"Only development stores or stores on a Shopify Plus plan can use apps with `lineUpdate` operations"*. E in più: *"Only stores on a Shopify Plus plan can use custom apps that contain Shopify Function APIs"* — su Basic non si può nemmeno installare una funzione scritta da noi |
| 2 | **Job giornaliero che riscrive i prezzi di catalogo** | **Parziale.** Regge cluster e stagione, non l'anticipo (§ 3) |
| 3 | **Varianti precalcolate** — una variante per combinazione | **No.** Tre cluster × sei fasce stagionali × cinque fasce di anticipo = 90 varianti per il solo prezzo base, contro un limite di 100 varianti per prodotto, prima ancora di aggiungere le formule |
| 4 | **Riga "supplemento" separata** — un prodotto tecnico da 1 € aggiunto in quantità N | **Sì, su ogni piano, senza backend.** Ma la maggiorazione compare come voce a sé in carrello e in fattura, e ogni pacchetto scontato diventa un esercizio di aritmetica visibile al cliente |
| 5 | **Codice sconto creato al volo via Admin API** — si listina al massimo e si sconta verso il basso | **Sì, ma sconsigliata.** Funziona su ogni piano e richiede comunque un nostro server. Il problema è normativo prima che tecnico: presentare come "sconto" un prezzo che non è mai stato praticato tocca le regole sull'indicazione dei prezzi (§ 9) |
| 6 | **Draft Order con `priceOverride`** — l'ordine si crea via Admin API con prezzi arbitrari, il cliente paga da un link di pagamento | **Sì.** Shopify: *"you can now set custom prices on draft order line items. When set, the prices will be locked and used as the basis for all further calculations, including taxes, discounts, order totals"*. Nessuna restrizione di piano documentata |

**Il risultato, detto senza giri:** su un piano Basic, l'unico modo pulito di
far pagare un prezzo che calcoliamo noi è il **Draft Order**, che richiede un
nostro server con un token Admin. Il che significa che **il motore di prezzo è
nostro in ogni scenario**. Shopify non è mai il candidato a calcolare il
prezzo: è il candidato a incassarlo e a gestire cosa succede dopo.

Shopify Plus, che risolverebbe il problema in modo elegante con il Cart
Transform, costa un ordine di grandezza fuori scala per il primo anno.

---

## 5. Quindi la domanda vera

Non è *"Shopify o backend nostro"*. È:

> Il motore di prezzo è nostro comunque. **La cassa e il gestionale li
> compriamo o li scriviamo?**

Con "cassa e gestionale" si intende, in concreto: pagina di pagamento
conforme, 3-D Secure e SCA, antifrode, ricevute, rimborsi, elenco ordini
consultabile da chi non sa programmare, email transazionali, account clienti,
gestione IVA, aggancio alla fatturazione elettronica verso SdI.

---

## 6. Il confronto, voce per voce

| | **Shopify + motore nostro** | **Backend ad hoc + Stripe** |
|---|---|---|
| Prezzo dinamico per carrello | Draft Order con `priceOverride`. Il nostro server calcola, Shopify incassa | Nativo: si calcola e si apre una sessione di pagamento con quell'importo |
| Incasso del totale | Standard | Standard |
| Pagina di pagamento | Checkout Shopify, conforme, 3DS incluso | Stripe Checkout ospitato: SCA e 3DS inclusi, ambito PCI ridotto (SAQ-A) |
| Commissione carte SEE | ~1,9% + 0,25 € (Basic) | ~1,5% + 0,25 € |
| Canone | ~28-36 €/mese (~21 € annuale) | 0 € |
| Penale gateway esterno | +2% su Basic se **non** si usa Shopify Payments | non applicabile |
| Contestazione | gestita da Shopify Payments | 20 € per contestazione ricevuta |
| Elenco ordini per chi non programma | **incluso** | **da scrivere** |
| Rimborsi e cancellazioni parziali | **incluso**, dall'admin | **da scrivere** |
| Email transazionali | **incluse** | **da scrivere** (o servizio esterno) |
| Account clienti | Customer Account API | **da scrivere** |
| Fatturazione elettronica SdI | app di collegamento, ~10-25 €/mese | integrazione via API, **da scrivere** |
| Catalogo modificabile senza deploy | **sì** | **da scrivere** (o resta un file TypeScript) |
| Tempo al primo incasso | ~1 mese | ~2-3 mesi |
| Manutenzione | di Shopify | nostra, per sempre |
| Portale fornitori (Q2) | nostro comunque | nostro comunque |

### Il conto, con numeri veri

Ipotesi prudente del primo anno: 20 servizi al mese, ticket medio 3.000 € →
60.000 € di transato mensile.

| | Shopify | Stripe |
|---|---|---|
| Commissioni su 60.000 € | ~1.145 € | ~905 € |
| Canone | ~36 € | 0 € |
| App fatturazione | ~20 € | 0 € (ma va integrata) |
| **Totale mensile** | **~1.200 €** | **~905 €** |

**Differenza: circa 295 € al mese, 3.500 € l'anno.**

Contro cui va messo quello che si dovrebbe scrivere: admin ordini, rimborsi,
email, fatturazione, account, riconciliazione. Ordine di grandezza realistico:
**sei-otto settimane di lavoro**, più la manutenzione perpetua. Anche
valutando il tempo del socio tech al minimo sindacale, il risparmio annuo non
copre neanche la costruzione — figuriamoci il mantenimento.

E il costo vero non è quello. È che quelle sei-otto settimane arrivano
**esattamente nel trimestre in cui bisogna incassare**, in un progetto che
`PIANO-TECH.md` § 11 dichiara limitato da un socio e mezzo.

---

## 7. Il vincolo che pesa più di tutti: si incassa tutto, subito

L'incasso totale alla prenotazione serve ad avere la liquidità per saldare i
fornitori. È una scelta di cassa prima che di prodotto, e cambia poco fra le
due strade — ma porta con sé cinque cose che vanno affrontate comunque.

**Il denaro incassato non è ancora ricavo.** Fra la prenotazione e l'evento,
quella somma è un impegno verso il cliente. Usarla per pagare gli acconti dei
fornitori è normale nel settore, ma è finanziare l'operatività con denaro
altrui: se il tasso di cancellazione sale, il buco si scopre tardi. Non è una
questione tecnica e questo documento non la risolve — va posta al socio che
tiene i conti, prima di scrivere il codice del rimborso.

**I gestori di pagamento trattano male i servizi a erogazione futura.** Chi
incassa oggi per un servizio che eroga fra sessanta giorni è, per un processore
di pagamenti, un rischio: se l'azienda chiude, i rimborsi li paga il
processore. La conseguenza tipica è una **riserva rotativa** — una quota degli
incassi trattenuta per mesi — o un tetto sul transato iniziale. Vale per
Shopify Payments come per Stripe. **Va sondato prima di costruire**, perché una
riserva del 20% cambia il piano di cassa molto più di qualunque scelta di
architettura.

**I biglietti alti non passano su carta.** Un corteo di supercar a 6.500 € o
un charter plurigiornaliero superano il massimale giornaliero di molte carte
consumer. Serve un **secondo metodo di pagamento** — bonifico su Shopify come
metodo manuale, bonifico o addebito SEPA su Stripe — altrimenti l'ordine più
redditizio è quello che non si chiude. Su Shopify il metodo manuale lascia
l'ordine "in attesa di pagamento", e qualcuno deve riconciliare a mano.

**La finestra di contestazione è lunga quanto l'attesa.** Un cliente che paga
a giugno per agosto può contestare l'addebito prima ancora che il servizio
esista. La difesa è documentale: termini accettati al momento del pagamento,
data e luogo dell'evento scritti nell'ordine, politica di cancellazione
registrata **nell'ordine stesso** e non solo in una pagina del sito. Questo va
costruito in entrambe le strade, e va costruito subito.

**La politica di cancellazione è codice, non una pagina legale.** Se il prezzo
sale quando ci si avvicina alla data, la quota trattenuta in caso di
cancellazione deve seguire la stessa curva — perché è lo stesso costo che si
sta coprendo. Vive nella stessa tabella di regole del pricing, e si scrive
insieme a quella. È l'unico modo perché le due cose non si contraddicano fra
sei mesi.

---

## 8. La raccomandazione

**Motore di prezzo nostro. Cassa e gestionale su Shopify. Draft Order come
ponte fra i due.**

Il flusso, in concreto:

```
browser         calcola e mostra il prezzo (stessa funzione, stesse regole)
   ↓
nostro server   RICALCOLA  → crea il Draft Order con priceOverride
   ↓                          (add-on e data come proprietà di riga)
Shopify         restituisce il link di pagamento
   ↓
cliente         paga il totale sul checkout Shopify
   ↓
webhook         → nostro backend: assegnazione fornitore, quota, notifica
```

Le ragioni, in ordine di peso:

1. **Il motore di prezzo è nostro in ogni scenario** (§ 4). Non si sta
   scegliendo dove scriverlo: si sta scegliendo cosa comprare intorno.
2. **Il risparmio del fai-da-te è 3.500 € l'anno** contro sei-otto settimane
   di costruzione più manutenzione perpetua (§ 6). Non si ripaga.
3. **Il tempo speso a scrivere una cassa è tempo tolto al portale fornitori**,
   che è la cosa che nessuno vende e che regge il Q2.
4. **È reversibile.** Se un giorno Shopify diventa stretto — Plus troppo caro,
   Draft Order troppo rigido, il catalogo che va a Stripe Connect per gli
   split — quello che si butta è l'integrazione di cassa. Il motore di prezzo,
   le regole, i fornitori, gli ordini restano nostri. È l'opposto della
   situazione in cui la logica di business vive dentro la piattaforma.

**Quando questa raccomandazione va rimessa in discussione:** se la maggior
parte del catalogo finisce a preventivo puro (yacht, elicottero, security,
maggiordomo H24 — vedi `CONFRONTO-CATALOGO.md` § 2), il checkout self-service
serve a una minoranza di ordini, e Shopify diventa un gestionale costoso per
gestire poche vendite dirette. La soglia è semplice: **se meno di un ordine su
tre si chiude senza parlare con nessuno, il canone Shopify non si giustifica**
e conviene un pannello ordini nostro con Stripe accanto.

---

## 9. Due avvertenze normative, da verificare con chi di dovere

Non siamo avvocati, e queste due vanno confermate prima della pubblicazione.

**Prezzi personalizzati.** La normativa europea a tutela del consumatore
richiede di informare l'acquirente quando il prezzo è personalizzato sulla
base di un processo decisionale automatizzato riferito alla *persona*. Un
prezzo che varia per luogo dell'evento, stagione e anticipo è riferito al
*servizio*, non al cliente, e in linea di principio è un normale listino
dinamico come quello di un hotel. La distinzione è sottile: va tenuta pulita,
cioè **le regole non devono mai leggere niente dell'utente** — non il
dispositivo, non la cronologia, non da dove arriva.

**Sconti e prezzo di riferimento.** È il motivo per cui la strada 5 del § 4 va
evitata: presentare come sconto una riduzione da un prezzo mai praticato è
scorretto. Se `Ma` scende sotto 1 per le prenotazioni molto anticipate, si
comunica come **tariffa** ("prenota entro maggio"), non come sconto su un
prezzo pieno che nessuno paga.

---

## 10. Cosa cambia nei documenti esistenti

| Documento | Cosa va corretto |
|---|---|
| `PIANO-TECH.md` § 6 | Il motore che "scrive i prezzi su Shopify una volta al giorno" non regge l'anticipo. Va sostituito con il calcolo a carrello + Draft Order |
| `PIANO-TECH.md` § 2 | "Si esce dal sito statico in Q2" diventa **Q1b**: serve una rotta server per la quotazione e il Draft Order |
| `PIANO-TECH.md` § 8, decisione 2 | Confermata: bonifico ai fornitori su riepilogo. Il Draft Order non cambia nulla su questo fronte |
| `SHOPIFY-AVVIO.md` | La migrazione punta a Cart API + `checkoutUrl`. Vale per le righe a prezzo fisso; le righe calcolate passano da Draft Order. Sono due casse: va deciso se tenerle entrambe o solo la seconda |
| `TECNICO.md` § 3 | "Si incassa tutto subito" adesso ha una ragione operativa scritta: la liquidità per i fornitori. Va annotata lì, perché è la nota che impedisce di reintrodurre l'acconto per sbaglio |
| `lib/experiences.ts` | Il calcolo prezzi diventa un modulo a sé (`lib/prezzo.ts`), funzione pura, condivisa fra browser e server. È il pezzo da scrivere per primo, e si può scrivere **subito**, senza server e senza Shopify |

---

## 11. Da dove si comincia, questa settimana

1. **`lib/prezzo.ts` come funzione pura**, con le regole in un file di dati e
   non nel codice. Entra da subito nel preventivo del Q1a: la stessa funzione
   che oggi mostra una stima domani apre la cassa.
2. **Data e luogo dell'evento nel configuratore.** Senza questi due campi il
   resto non ha input. Vanno anche in `RequestForm`, dove oggi c'è solo un
   testo libero.
3. **La tabella delle regole**, in tre fogli: cluster → moltiplicatore,
   stagione → moltiplicatore per cluster, anticipo → moltiplicatore. Sono
   numeri commerciali, non tecnici: li decide chi conosce i fornitori.
4. **La politica di cancellazione**, scritta come curva sugli stessi
   intervalli dell'anticipo.
5. **La domanda al processore di pagamento**, prima di tutto il resto: quale
   riserva applicano a chi incassa oggi per erogare fra sessanta giorni.

---

## Fonti

- Cart Transform Function API — https://shopify.dev/docs/api/functions/latest/cart-transform
- Function APIs, disponibilità per piano — https://shopify.dev/docs/api/functions/latest
- Prezzi personalizzati sui Draft Order — https://shopify.dev/changelog/set-custom-prices-in-draft-orders
- Costi Shopify in Italia 2026 — https://ifgecommerce.com/en/blogs/articoli-shopify/quanto-costa-aprire-shopify-italia
- Tariffe Stripe Italia — https://stripe.com/it/pricing

Le cifre vanno riverificate al momento della sottoscrizione.
