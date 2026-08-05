# GOLDEN — documentazione tecnica

Come è fatto il sito, come funziona ogni parte, e cosa manca per andare in
produzione. Documento unico: sostituisce `FUNZIONI.md` e `ANALISI-FRONTEND.md`.

Per la parte non tecnica c'è `SOCI.md`. Per le fotografie mancanti,
`PROMPT-IMMAGINI.md`.

---

## 1. In due minuti

**Stack.** Next.js 16 (App Router), React 19, Tailwind 4, framer-motion,
react-icons. TypeScript ovunque.

**Nessun backend.** `next.config.ts` ha `output: "export"`: `npm run build`
produce HTML statico pubblicabile ovunque. Il catalogo è un file TypeScript,
lo stato dell'utente vive in `localStorage`, nessuna richiesta esce dal
browser.

**È deliberato.** Serve a costruire e provare tutta l'interfaccia — carrello,
account, checkout — mentre il backend non c'è. Ogni punto da sostituire è
marcato nel codice con un commento `PER SHOPIFY`.

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # export statico in ./out
npx tsc --noEmit # controllo dei tipi
```

Se `npm install` si comporta in modo strano, vedi `RIPARTI.txt`: il progetto è
passato per due sistemi operativi e i binari nativi vanno reinstallati puliti.

---

## 2. La mappa

```
app/
  page.tsx                        home
  collections/page.tsx            catalogo completo
  collections/noleggio-auto/      pagina dedicata: base + add-on + pacchetti
  collections/[handle]/           wedding e sushi, resa standard
  products/[handle]/              15 schede prodotto
  account/login/ · account/       accesso e area personale
  checkout/                       conferma in tre passi
  globals.css                     IL SISTEMA VISIVO — token, scale, ritmo
  layout.tsx                      provider, header, footer, pannelli

lib/
  shopify-types.ts   forme della Storefront API
  catalog.ts         i 15 prodotti e le 3 collezioni + le 5 funzioni da sostituire
  experiences.ts     8 add-on, 4 pacchetti, calcolo sconto
  store.ts           forme di carrello, account, richieste + helper localStorage
  money.ts           formattazione valuta

components/
  StoreProvider.tsx  i tre stati globali: carrello, account, concierge
  Bottone.tsx        il pulsante, in un posto solo
  CartDrawer.tsx     carrello a scorrimento
  Operator.tsx       pannello concierge + i suoi inneschi
  ExperienceBuilder  il configuratore
  ScegliFormula      selettore variante + aggiunta al carrello
  RequestForm        modulo di richiesta libera
  Reveal / useTrappolaFocus / PlaceholderMedia / …
```

Le rotte ricalcano di proposito Shopify (`/collections/…`, `/products/…`):
quando si migra, gli indirizzi già indicizzati non cambiano.

---

## 3. I dati

### `lib/shopify-types.ts` — le forme

Non sono un'astrazione nostra: sono **identiche** a ciò che restituirà
`storefront.query(...)`. `Money` è `{ amount: string, currencyCode: string }`,
non un `number`. Gli `id` sono già GID. Ogni prodotto ha già `variants` con
`selectedOptions` e `availableForSale`. I campi non standard stanno in
`metafields`, che è dove finiranno davvero.

### `lib/catalog.ts` — cinque funzioni da sostituire

In fondo al file:

```ts
getCollections()  getCollection(handle)
getProducts()     getProduct(handle)
getProductsInCollection(handle)
```

Sono già `async`. Per passare a Shopify si sostituisce **solo il loro corpo**
con le query alla Storefront API. Nessuna pagina va toccata.

### `lib/experiences.ts` — il modello esperienza

Otto add-on, quattro pacchetti, sconto pacchetto al 15% (`PACKAGE_DISCOUNT`).
Ogni add-on ha già `shopifyHandle`. Il campo `group` dichiara le esclusioni
(Memories e Cinematic sono lo stesso servizio, uno col video).

Due strade di migrazione, entrambe già supportate dalle forme:

| Strada | Come |
|---|---|
| **Add-on come proprietà di riga** | L'auto è il prodotto; gli add-on diventano `attributes[]` della CartLine (*line item properties*) |
| **Pacchetti come prodotti bundle** | Ogni `ExperiencePackage` diventa un prodotto a sé con l'auto come opzione |

È il motivo per cui in `CartLine` il campo si chiama `attributes` e non
`addons`.

### `lib/store.ts` — carrello, account, richieste

| Forma locale | Diventa su Shopify |
|---|---|
| `CartLine` | `Cart.lines[]` — `merchandiseId` è già il GID |
| `Cart` | `Cart`, `checkoutUrl` compreso |
| `Account` | `Customer` (Customer Account API) |
| `Richiesta` | `Order` oppure `DraftOrder` |

Contiene anche `ACCONTO = 0.3` (l'acconto del 30%, in un punto solo) e le
chiavi di `localStorage`, tutte prefissate `golden.`.

---

## 4. Lo stato client

`components/StoreProvider.tsx` avvolge tutto in `layout.tsx` ed espone tre
hook: `useCart()`, `useAccount()`, `useOperator()`. Stanno insieme perché si
parlano: il checkout legge il carrello e scrive nell'account, il popup
concierge deve sapere se il carrello è aperto per non coprirlo.

### Le due regole che tengono in piedi tutto

**1. Lo stato non si legge durante il render.** L'HTML è generato a build
time, quando `localStorage` non esiste. Leggerlo al primo render produrrebbe
un *hydration mismatch*. Si parte dallo stato vuoto e si legge in `useEffect`,
dopo il montaggio.

**2. `hydrated` è la spia che dice "adesso è vero".** Finché è `false` il
badge del carrello non compare e l'area personale mostra "Un istante…" invece
di rimbalzare al login.

---

## 5. Le quattro funzioni

### Accesso e area personale

Passwordless in due passi: email, poi codice a sei cifre. Non è estetica — è
già la forma del flusso reale di Shopify, così la schermata non va rifatta.
Oggi entra qualsiasi sequenza di sei cifre.

L'area personale ha tre blocchi: **richieste** (con codice `GLD-…`, stato,
righe), **esperienze salvate** (l'aggancio `toggleSalvato` è pronto, manca
solo il pulsante sulle schede), **dati** che precompilano il checkout.

`/account` è una rotta protetta: controlla la sessione **dopo** l'idratazione,
altrimenti rimbalzerebbe sempre.

### Carrello a scorrimento

Entra da destra, non è una pagina: su un sito di esperienze il carrello si
apre dieci volte per una conversione.

- **Righe identiche si sommano.** L'identità è *prodotto + add-on scelti*
  (`lineKey()`), non il prodotto: è l'unico comportamento corretto quando gli
  add-on cambiano il prezzo.
- **Si apre da solo** dal configuratore e dalla scheda prodotto (è la
  conferma). Dalle griglie no: coprirebbe la griglia da cui si sta scegliendo.
- **Trattiene il focus** (`useTrappolaFocus`) e lo restituisce alla chiusura.

### Checkout

Tre passi — chi siete, quando e dove, conferma — e **non è un pagamento**.
Golden vende una giornata che dipende dalla disponibilità di un partner:
incassare prima della verifica produce rimborsi. Parte una *richiesta*; se il
partner conferma, arriva il link per l'acconto del 30%.

### "Parla con un concierge"

Un pannello solo, montato una volta in `layout.tsx`. Tutto il resto sono
inneschi che chiamano `useOperator().open(contesto)`. **Il contesto è la parte
importante**: è la stringa che il concierge vede per prima, cioè da dove è
partita la richiesta.

Nove punti: footer, popup homepage, fine catalogo, sotto il configuratore,
fine pagina noleggio, carrello, checkout, esito, area personale.

Il popup compare dopo 40% di scroll o 18 secondi, una volta per dispositivo,
e si nasconde se il carrello o il pannello sono aperti.

---

## 6. Il sistema visivo

Sta tutto in `app/globals.css` e `components/Bottone.tsx`. **Regola: nelle
pagine non si scrivono valori di dimensione o spaziatura a mano.**

### Token

```
colori     --ink --ink-800 --ivory --champagne --gold-text --muted
testo      --t1 pieno · --t2 corrente · --t3 secondario · --t4 tenue
filetti    --l1 filetto · --l2 contorno · --l3 attivo
azione     --azione-fondo --azione-testo --azione-hover --su-champagne
misure     --h-header 72px · --ancora 96px · --contenuto 1280px
```

### Classi

| | |
|---|---|
| `.h-hero .h-pagina .h-sezione .h-blocco` | quattro livelli di titolo |
| `.sezione .sezione-stretta .pagina-top .sotto-header` | il ritmo verticale |
| `.contenuto .ancora` | contenitore centrato, offset delle ancore |
| `.kicker .label .campo-etichetta` | i tre ruoli del testo maiuscolo |
| `.zona-chiara` | ribalta i token per la parte amministrativa |

`.zona-chiara` è su accesso, area personale, conferma e sulla sezione "Come
funziona" della home. Non è un tema a parte: ribalta le stesse variabili, e
un componente montato lì dentro non sa di esserci.

### Due trappole da conoscere

**Le classi stanno in `@layer components`.** Le utility di Tailwind vivono in
`@layer utilities`, che nella cascata viene dopo. Fuori dai livelli queste
classi vincerebbero sempre, e un `pb-16` messo di proposito su una `.sezione`
non avrebbe effetto.

**`Intl` non raggruppa i numeri a quattro cifre.** Con `useGrouping` di
default uscivano "1900 €" invece di "1.900 €", cioè su quasi tutti i prezzi
del sito. In `lib/money.ts` è forzato a `true`.

### Accessibilità

Contrasti verificati e rientrati: `--muted` da 4,04:1 a **5,91:1** su fondo
scuro, `--gold-text` da 4,04:1 a **4,97:1** su avorio. Focus visibile ovunque,
soglia di tocco 44px garantita da `<Bottone>`, add-on e formule sono caselle e
radio vere dentro `<fieldset>`, i due pannelli trattengono il focus.

---

## 7. Cosa è simulato

| Funzione | Stato oggi | Cosa serve |
|---|---|---|
| Catalogo | File TypeScript | Storefront API — 5 funzioni da riscrivere |
| Carrello | `localStorage` | Cart API, per il multi-dispositivo |
| Accesso | Nessuna verifica | Customer Account API |
| Checkout | Nessun pagamento | `checkoutUrl` oppure DraftOrder |
| Richiamata concierge | Non invia | Endpoint di contatto o CRM |
| Stato richieste | Sempre "In lavorazione" | Gestionale che lo aggiorni |
| Telefono e WhatsApp | Segnaposto | I numeri veri, in `components/Operator.tsx` |
| Fotografie | 9, alcune sbagliate | 23 da produrre — vedi `PROMPT-IMMAGINI.md` |

---

## 8. Cosa implementare, in ordine

### Prima di mostrarlo a chiunque

1. **Numeri veri.** `TELEFONO`, `TELEFONO_HREF`, `WHATSAPP_HREF` in cima a
   `components/Operator.tsx`, e l'orario in `useInLinea` poche righe sotto.
2. **Le sei immagini prioritarie.** Il servizio firma — la rivelazione con
   telo nero — non ha nessuna fotografia, e i quattro pacchetti riciclano foto
   di altri prodotti.
3. **Marchi Lamborghini.** Nelle foto attuali logo, scritta "URUS SE" e muro
   "AD PERSONAM" sono leggibili. Vanno sostituite o autorizzate.

### Il backend, nell'ordine giusto

4. **Catalogo.** Sostituire il corpo delle cinque funzioni di `catalog.ts` con
   le query Storefront. Togliere `output: "export"` da `next.config.ts` per
   abilitare il rendering server-side. Nessuna pagina cambia.
5. **Carrello.** `cart.add()` → mutation `cartLinesAdd`. `merchandiseId` è già
   il GID, `attributes` passa così com'è. Il pannello non si tocca.
6. **Checkout.** Due strade, da scegliere: redirect a `cart.checkoutUrl` se si
   incassa subito, oppure **DraftOrder** se resta il modello a preventivo —
   che è quello che il flusso attuale racconta.
7. **Accesso.** Customer Account API: il codice a sei cifre lo manda Shopify
   davvero. `richieste` diventa `Customer.orders`, `salvati` una metafield.
8. **Modulo e richiamata.** POST verso il CRM o un endpoint di contatto. I due
   punti sono marcati a commento in `RequestForm.tsx` e `Operator.tsx`.

### Poi

9. **Estendere il modello base + add-on a wedding e sushi.** Oggi ce l'ha solo
   il noleggio; le altre due collezioni usano la resa standard. Un matrimonio
   è la categoria dove gli add-on rendono di più.
10. **Il pulsante "salva"** sulle schede pacchetto: l'aggancio nell'area
    personale è già pronto, manca l'innesco.
11. **Le restanti 17 fotografie.**

---

## 9. Scelte già prese, da non ridiscutere per sbaglio

- **Il carrello non è una pagina.** Portare via l'utente a ogni aggiunta è il
  modo più rapido per fargli perdere il filo.
- **Il checkout non chiede la carta.** Vedi sopra: dipende dal partner.
- **Le vetture stanno al quinto posto** nella pagina noleggio, dopo pacchetti
  e configuratore. Su un sito di noleggio sarebbero al primo: è il punto.
- **Quattro etichette d'azione in tutto il sito**: *Aggiungi al carrello*,
  *Parla con un concierge*, *Vai alla conferma*, *Invia la richiesta*.
- **Dove manca una fotografia il sito lo dichiara** con un riquadro
  riconoscibile, invece di riempire con uno stock sbagliato.

---

## 10. Come si riparte da zero, in prova

Dalla console del browser:

```js
Object.keys(localStorage)
  .filter(k => k.startsWith("golden."))
  .forEach(k => localStorage.removeItem(k));
```

Giro completo di prova: catalogo → un pacchetto → *Aggiungi al carrello* →
configuratore, cambio add-on e vettura → *Aggiungi al carrello* → badge a 2 →
*Vai alla conferma* → i tre passi → l'esito con il codice → *Vedi la
richiesta* → area personale.
