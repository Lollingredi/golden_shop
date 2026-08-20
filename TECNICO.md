# GOLDEN — documentazione tecnica

Come è fatto il sito, come funziona ogni parte, e cosa manca per andare in
produzione. Documento unico: sostituisce `FUNZIONI.md` e `ANALISI-FRONTEND.md`.

Per la parte non tecnica c'è `SOCI.md`. Per la migrazione a Shopify passo per
passo, `SHOPIFY-AVVIO.md`. Per le fotografie, `PROMPT-IMMAGINI.md` — che ormai
è l'archivio dei prompt usati, non un elenco di cose mancanti.

Per il prezzo dinamico — perché si calcola a carrello e non a catalogo, e
perché la cassa resta su Shopify — c'è `MOTORE-PREZZO.md`. Per la distanza fra
il catalogo commerciale e quello che il sito sa vendere, `CONFRONTO-CATALOGO.md`.

---

## 1. In due minuti

**Stack.** Next.js 16.2.4 (App Router), React 19.2.3, Tailwind 4,
framer-motion 12, react-icons 5. TypeScript ovunque.

**Nessun backend.** `next.config.ts` ha `output: "export"`: `npm run build`
produce HTML statico pubblicabile ovunque. Il catalogo è un file TypeScript,
lo stato dell'utente vive in `localStorage`, nessuna richiesta esce dal
browser.

**È deliberato.** Serve a costruire e provare tutta l'interfaccia — carrello,
account, pagamento — mentre il backend non c'è. Ogni punto da sostituire è
marcato nel codice con un commento `PER SHOPIFY`.

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # export statico in ./out
npm test         # gli invarianti del motore di prezzo
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
  checkout/                       pagamento in tre passi
  not-found.tsx                   404
  globals.css                     IL SISTEMA VISIVO — token, scale, ritmo
  layout.tsx                      provider, header, footer, pannelli

lib/
  shopify-types.ts   forme della Storefront API
  catalog.ts         i 15 prodotti e le 3 collezioni + le 5 funzioni da sostituire
  experiences.ts     8 add-on, 4 pacchetti, calcolo sconto
  store.ts           forme di carrello, account, richieste + helper localStorage
  contatti.ts        TELEFONO, WHATSAPP, ORARIO — in un posto solo
  invia.ts           l'invio dei moduli verso l'esterno
  money.ts           formattazione valuta
  prezzo.ts          IL MOTORE — funzione pura: da una richiesta, un preventivo
  regole.ts          i moltiplicatori come dati, dietro REGOLE_VERE
  luoghi.ts          le tredici località e il loro cluster
  cancellazione.ts   la curva di rimborso, sulle stesse fasce dell'anticipo
  prezzo.test.ts     gli invarianti del motore — 33 test

components/
  StoreProvider.tsx  i tre stati globali: carrello, account, concierge
  Bottone.tsx        il pulsante, in un posto solo (Bottone / BottoneLink / BottoneA)
  Header.tsx         barra fissa, tendina catalogo, menu mobile
  Footer.tsx         due righe, non tre
  QuoteTab.tsx       linguetta laterale desktop + barra contatti mobile
  CartDrawer.tsx     carrello a scorrimento
  Operator.tsx       pannello concierge + i suoi cinque tipi di innesco
  ExperienceBuilder  il configuratore
  AddToCart.tsx      i due pulsanti che riempiono il carrello
  ScegliFormula      selettore variante + aggiunta al carrello
  PackageCard · ProductCard · RequestForm
  Reveal / useTrappolaFocus / PlaceholderMedia
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

Quindici prodotti su tre collezioni, ognuno con due varianti generate da
`makeProduct`: *Standard* e *Con Celebrity Experience* (+900 € se non è
indicato un `maxPrice`). In fondo al file:

```ts
getCollections()  getCollection(handle)
getProducts()     getProduct(handle)
getProductsInCollection(handle)
```

Sono già `async`. Per passare a Shopify si sostituisce **solo il loro corpo**
con le query alla Storefront API. Nessuna pagina va toccata.

### `lib/experiences.ts` — il modello esperienza

Otto add-on, quattro pacchetti, sconto pacchetto al 15% (`PACKAGE_DISCOUNT`).
Ogni add-on ha già `shopifyHandle` e la sua fotografia. Il campo `group`
dichiara le esclusioni (Memories e Cinematic sono lo stesso servizio, uno col
video). Anche qui `getAddons()`, `getPackages()` e `getPackage()` sono già
`async`.

Due strade di migrazione, entrambe già supportate dalle forme:

| Strada | Come |
|---|---|
| **Add-on come proprietà di riga** | L'auto è il prodotto; gli add-on diventano `attributes[]` della CartLine (*line item properties*) |
| **Pacchetti come prodotti bundle** | Ogni `ExperiencePackage` diventa un prodotto a sé con l'auto come opzione |

È il motivo per cui in `CartLine` il campo si chiama `attributes` e non
`addons`.

### `lib/prezzo.ts` — il motore di prezzo

Una funzione pura: `quota(richiesta) → { ok }`. Non importa React, non importa
Next, non conosce il catalogo e **non legge l'orologio** — `adesso` si passa da
fuori. Restituisce un esito invece di sollevare, come `inviaModulo`.

```
riga = base × Mc × Ms × Ma  +  Σ(add-on × Mc)  − sconto pacchetto

Mc  cluster geografico   dove si svolge l'evento
Ms  stagione             quando, dentro l'anno
Ma  anticipo             quanti giorni mancano da adesso alla data
```

Tre cose decise, e verificate dai test:

- **gli add-on prendono il cluster ma non l'anticipo.** Un fotografo a Porto
  Cervo costa più che a Milano; un fiocco in raso non costa di più perché lo si
  ordina in fretta. L'urgenza pesa sul mezzo e sull'equipaggio;
- **lo sconto pacchetto si applica per ultimo**, sulla somma già moltiplicata,
  altrimenti in Costiera sconterebbe meno di quanto promette la scheda;
- **`adesso` è un parametro.** Senza, la funzione non è verificabile e i test
  cambierebbero risultato a seconda del giorno in cui girano.

I numeri stanno in `lib/regole.ts` e sono **segnaposto**: `REGOLE_VERE` è
`false`, e finché lo è ogni quotazione esce con `provvisoria: true` e
l'interfaccia dice "prezzo indicativo". Stessa spia di `CONTATTI_VERI`, stessa
ragione — un prezzo sbagliato mostrato come definitivo fa più danno di un
prezzo che non c'è.

`lib/luoghi.ts` è l'elenco chiuso delle località: il cluster non si ricava da
un campo di testo libero. Una località con `attivo: false` (oggi Ibiza) non
produce un prezzo ma un errore, ed è così che si dichiara il perimetro senza
cancellare la riga.

`lib/cancellazione.ts` sta accanto al motore perché è la stessa curva vista dal
lato opposto: **`SCAGLIONI_GIORNI` è dichiarato una volta sola** in `regole.ts`
e lo leggono entrambe. Se un giorno divergessero, sarebbe perché qualcuno ha
cambiato una delle due dimenticando l'altra — e c'è un test che lo impedisce.

Il ricalcolo lato server, il Draft Order e il perché la cassa resta su Shopify
stanno in `MOTORE-PREZZO.md`.

### `lib/store.ts` — carrello, account, richieste

| Forma locale | Diventa su Shopify |
|---|---|
| `CartLine` | `Cart.lines[]` — `merchandiseId` è già il GID |
| `Cart` | `Cart`, `checkoutUrl` compreso |
| `Account` | `Customer` (Customer Account API) |
| `Richiesta` | `Order` oppure `DraftOrder` |

Contiene le chiavi di `localStorage`, tutte prefissate `golden.`.

**Non c'è più l'acconto.** C'erano `ACCONTO = 0.3` e `acconto(totale)`: al
checkout si versava il 30% e il resto si regolava col partner il giorno del
servizio. Sono stati tolti di proposito — adesso si incassa tutto subito. Se
un giorno la formula tornasse, va rimessa lì e da nessun'altra parte.

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

Il provider tiene anche le due cose che valgono per entrambi i pannelli:
`Escape` chiude prima il concierge e poi il carrello, e con un pannello aperto
lo scroll di fondo è bloccato.

---

## 5. Le funzioni

### Navigazione — header, linguetta, footer

**Le categorie non stanno più nella barra.** Erano tre voci in alto: la barra
andava a capo e su telefono l'unica strada per il catalogo era l'hamburger.
Adesso l'header tiene solo ciò che serve ovunque — Catalogo, account,
carrello, *Richiedi* — e i tre servizi si scelgono dal corpo della pagina
(sezione "Le categorie" in homepage e la stessa griglia in cima al catalogo),
dove hanno l'immagine accanto.

Restano due scorciatoie ai tre servizi: una **tendina** sotto "Catalogo" e le
tre voci rientrate nel menu mobile. Tre dettagli non ovvi:

- **La tendina esiste solo dove esiste un puntatore vero**
  (`matchMedia("(hover: hover) and (pointer: fine)")`). Su touch il browser
  emula `mouseenter` ma non manda mai `mouseleave`: se il tocco non cambiava
  pagina, la tendina restava aperta senza via d'uscita. Dove il mouse non c'è,
  "Catalogo" è un link e basta — e la freccia non compare, perché
  prometterebbe un menu che non arriva.
- **Chiusura ritardata di 140ms**, perché uscendo dal link verso il pannello
  il puntatore attraversa qualche pixel di header. Più un `pointerdown` fuori
  come rete di sicurezza.
- **I servizi sono scritti dentro `Header.tsx`**, non importati da
  `lib/catalog`: l'header è un componente client, e importarli da lì
  trascinerebbe l'intero catalogo nel bundle di ogni pagina per tre righe di
  testo. Quando arriveranno da Shopify vanno passati come prop dal layout,
  che è server.

L'header è trasparente solo dove la pagina si apre con un'immagine a tutto
schermo (`usaHeaderPieno`): altrove il gradiente scuro diventerebbe una
macchia sul fondo chiaro dell'area personale.

**`QuoteTab`** è montata nel layout e ha due facce: da 1024px in su una
linguetta verticale "Preventivo gratuito" agganciata a sinistra, sotto una
barra fissa in basso. È il motivo del `pb-[60px] lg:pb-0` sul `<body>`.

### I contatti, e la spia che li governa

Telefono, WhatsApp e orario stanno in **`lib/contatti.ts`**, un file solo.
Erano scritti a mano in `Operator.tsx` e in `QuoteTab.tsx`, con lo stesso
segnaposto ripetuto: due punti da aggiornare, e uno dei due sarebbe rimasto
indietro.

`CONTATTI_VERI` è una costante booleana, oggi **`false`**, e non è cosmetica:
dove è falsa il sito **non mostra** le vie dirette, perché un pulsante
"Chiamate adesso" che compone lo zero fa più danno di un pulsante che non c'è.

| Con `CONTATTI_VERI = false` | Diventa |
|---|---|
| Barra mobile: Telefono · WhatsApp | Catalogo · Preventivo |
| Pannello concierge: le due schede in cima | nascoste, resta il modulo di richiamata |
| Fascia concierge: pulsante WhatsApp | non compare |
| Modulo fallito: chiama o scrivi | "Parla con un concierge" |

Il giorno che arriva il numero vero si cambiano due costanti e si mette la
spia a `true`. Nient'altro.

### L'invio dei moduli

`lib/invia.ts`. Fino a poco fa una richiesta finiva in `localStorage` e basta:
il cliente leggeva "vi ricontattiamo entro poche ore" e non la riceveva
nessuno.

Con `output: "export"` non esiste una rotta `/api` — non c'è nessun server
nostro. Quindi il browser scrive direttamente a un servizio di moduli esterno
(Web3Forms, Formspree o equivalenti) che inoltra per email. Funziona su
hosting gratuito e non richiede partita IVA: si può fare adesso.

```bash
# .env.local — vedi .env.example
NEXT_PUBLIC_FORM_ENDPOINT=https://api.web3forms.com/submit
NEXT_PUBLIC_FORM_KEY=<la chiave del servizio>
```

Due comportamenti da conoscere:

- **`inviaModulo` non solleva mai.** Restituisce `{ ok }`, e chi la chiama
  decide cosa dire. Un modulo che esplode in faccia al cliente è peggio di uno
  che non parte.
- **Se non parte, si dichiara.** La richiesta resta registrata in locale (il
  cliente la ritrova nell'area personale), ma la schermata dice che a noi non
  è arrivata e offre le vie dirette. Senza endpoint configurato il
  comportamento è lo stesso — il sito sa di non poter promettere una chiamata.

I due punti collegati sono il modulo di richiesta libera (`RequestForm`) e la
richiamata del pannello concierge (`Operator`). Quando arriverà il backend si
sostituisce il corpo di `inviaModulo`: firma identica, chi la chiama non
cambia.

### Accesso e area personale

Passwordless in due passi: email, poi codice a sei cifre. Non è estetica — è
già la forma del flusso reale di Shopify, così la schermata non va rifatta.
Oggi entra qualsiasi sequenza di sei cifre.

Il nome si ricava dall'email solo se ne ha la forma: `mario.rossi@` diventa
"mario rossi", `redibako18@` no — finirebbe a 48px in cima all'area personale.

L'area personale ha tre blocchi: **richieste** (con codice `GLD-…`, stato,
righe), **esperienze salvate** (l'aggancio `toggleSalvato` è pronto, manca
solo il pulsante sulle schede pacchetto), **dati** che precompilano il
checkout.

`/account` è una rotta protetta: controlla la sessione **dopo** l'idratazione,
altrimenti rimbalzerebbe sempre.

### Il configuratore, e il prezzo che si forma

`ExperienceBuilder.tsx`, quattro passi: l'occasione, gli add-on, la vettura, e
**quando e dove**. Il quarto è l'unico che tocca il prezzo.

Finché località e data sono vuote il riepilogo mostra il listino e dice "Totale
indicativo": è il comportamento di prima, e il configuratore continua a
funzionare senza. Appena ci sono entrambe, `quota()` gira e il pannello cambia
in tre punti — il totale perde la parola "indicativo", **le righe si riquotano
anche loro** (mostrare "Base 1.900 €" sopra un totale di 2.860 € farebbe
sembrare rotto il carrello), e compare **la traccia**: i moltiplicatori
applicati, uno per riga, e solo quelli diversi da 1. Un fattore neutro non è
un'informazione, è rumore.

Due dettagli non ovvi:

- **`adesso` si legge in `useEffect`, dopo il montaggio.** Vale qui la stessa
  regola dello stato in `StoreProvider`: l'HTML è generato a build time, e
  l'orologio di quel momento non significa niente. Finché è `null` non c'è
  quotazione.
- **Le `<option>` del selettore vanno colorate a mano.** Il menu a tendina lo
  disegna il sistema operativo: su Windows il pannello resta bianco e le voci
  ereditano il testo chiaro del sito — bianco su bianco. `color-scheme: dark`
  da solo non basta, servono fondo e colore dichiarati su ogni voce.

Quando si aggiunge al carrello, **data e località viaggiano come attributi di
riga** insieme agli add-on: sono già la forma delle line item properties di
Shopify, e sono ciò che il concierge e il fornitore leggono dall'ordine senza
aprire un altro sistema.

### Carrello a scorrimento

Entra da destra, non è una pagina: su un sito di esperienze il carrello si
apre dieci volte per una conversione.

- **Righe identiche si sommano.** L'identità è *prodotto + add-on scelti*
  (`lineKey()`), non il prodotto: è l'unico comportamento corretto quando gli
  add-on cambiano il prezzo.
- **Si apre da solo** dal configuratore e dalla scheda prodotto (è la
  conferma). Dalle griglie no (`apri: false` su `AddPackageButton`):
  coprirebbe la griglia da cui si sta scegliendo.
- **Trattiene il focus** (`useTrappolaFocus`) e lo restituisce alla chiusura.

I pulsanti che lo riempiono stanno in `AddToCart.tsx` e sono client component
minuscoli: le pagine del catalogo restano server component e continuano a
essere generate a build time.

### Checkout — è un pagamento

Tre passi: **chi siete → quando e dove → pagamento**. Si versa l'intero
importo del servizio, subito: niente acconto, niente saldo da regolare con il
partner il giorno stesso.

Il modulo carta è simulato — numero, scadenza e CVC restano dentro il
componente, non vengono inviati né salvati, e la schermata lo dichiara. Al
"Paga" nasce una `Richiesta` con `pagato = totale` e stato **Confermata** (le
richieste dal modulo libero nascono invece "In lavorazione"), il carrello si
svuota e l'esito mostra il codice ordine.

Chi paga ha un account: se non c'era sessione, viene creata qui.

> Nota di prodotto. Il flusso a preventivo — si prenota, il partner conferma,
> poi si paga — era la scelta precedente ed è ancora quella che
> `SHOPIFY-AVVIO.md` chiama in causa dove parla di DraftOrder. Oggi il sito
> racconta l'incasso immediato. Se si torna indietro, i punti da toccare sono
> tre: i testi di `app/checkout/page.tsx`, lo `stato` della richiesta e la
> scelta fra `checkoutUrl` e DraftOrder.

### "Parla con un concierge"

Un pannello solo (`OperatorDialog`), montato una volta in `layout.tsx`. Tutto
il resto sono inneschi che chiamano `useOperator().open(contesto)`. **Il
contesto è la parte importante**: è la stringa che il concierge vede per
prima, cioè da dove è partita la richiesta.

Cinque forme, in `Operator.tsx`:

| | Dove |
|---|---|
| `OperatorLink` | riga o pulsante singolo: footer, apertura homepage, scheda prodotto |
| `OperatorRiga` | invito di una riga in mezzo alla pagina, sotto il configuratore |
| `OperatorBand` | fascia larga che chiude una pagina: fine catalogo, fine noleggio |
| `OperatorPopup` | il popup della homepage |
| `OperatorDialog` | il pannello vero, uno solo |

Tredici punti in tutto: footer, apertura homepage, popup homepage, fine
catalogo, riepilogo del configuratore, riga sotto il configuratore, fine
pagina noleggio, scheda prodotto, carrello, riepilogo del checkout, esito
dell'ordine, area personale (per singola richiesta), modulo dopo l'invio.

Il popup compare dopo 40% di scroll o 18 secondi, una volta per dispositivo,
e si nasconde se il carrello o il pannello sono aperti.

`useInLinea` è calcolato dopo il montaggio — l'ora del server non conta nulla
in un export statico — e legge giorni e fasce da `ORARIO` in `lib/contatti.ts`,
perché quando si risponde è una decisione commerciale, non una costante di
componente.

---

## 6. Il sistema visivo

Sta tutto in `app/globals.css` e `components/Bottone.tsx`. **Regola: nelle
pagine non si scrivono valori di dimensione o spaziatura a mano.**

### Token

```
colori     --ink --ink-800 --ivory --champagne --champagne-dk --gold-text --muted
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

`.zona-chiara` è su accesso, area personale, checkout e sulla sezione "Come
funziona" della home. Non è un tema a parte: ribalta le stesse variabili, e
un componente montato lì dentro non sa di esserci.

### Il pulsante

`Bottone` (azione), `BottoneLink` (naviga), `BottoneA` (telefono, WhatsApp).
Quattro aspetti — `primario`, `contorno`, `testo`, `tenue` — e due misure,
`md` (52px) e `sm` (44px, la soglia di tocco). I colori arrivano dalle
variabili: è così che funziona anche dentro `.zona-chiara` senza saperlo.

### Tre trappole da conoscere

**Le classi stanno in `@layer components`.** Le utility di Tailwind vivono in
`@layer utilities`, che nella cascata viene dopo. Fuori dai livelli queste
classi vincerebbero sempre, e un `pb-16` messo di proposito su una `.sezione`
non avrebbe effetto.

**`className="hidden"` su un `<Bottone>` non lo nasconde.** `inline-flex` sta
nelle classi di base del componente, e fra due utility di `display` Tailwind
segue l'ordine nel foglio di stile, non quello scritto nell'attributo. Per
mostrarlo o nasconderlo a certe misure si mette `hidden` / `sm:hidden` su un
contenitore attorno — `<span className="hidden sm:contents">`, come
nell'header.

**`Intl` non raggruppa i numeri a quattro cifre.** Con `useGrouping` di
default uscivano "1900 €" invece di "1.900 €", cioè su quasi tutti i prezzi
del sito. In `lib/money.ts` è forzato a `true`.

### Accessibilità

Contrasti verificati e rientrati: `--muted` da 4,04:1 a **5,91:1** su fondo
scuro, `--gold-text` da 4,04:1 a **4,97:1** su avorio. Focus visibile ovunque,
soglia di tocco 44px garantita da `<Bottone>`, add-on e formule sono caselle e
radio vere dentro `<fieldset>`, i due pannelli trattengono il focus,
`prefers-reduced-motion` rispettato in CSS e in ogni animazione.

---

## 7. Cosa è simulato

| Funzione | Stato oggi | Cosa serve |
|---|---|---|
| Catalogo | File TypeScript | Storefront API — 5 funzioni da riscrivere |
| Carrello | `localStorage` | Cart API, per il multi-dispositivo |
| Accesso | Nessuna verifica | Customer Account API |
| Pagamento | Modulo carta finto, nessun addebito | Redirect a `checkoutUrl` |
| Richiamata concierge | **Invia davvero**, se `.env.local` è configurato | Poi CRM |
| Modulo di richiesta | **Invia davvero**, idem | Poi DraftOrder o CRM |
| Stato richieste | Non cambia mai dopo l'invio | Gestionale che lo aggiorni |
| Telefono e WhatsApp | Segnaposto, ma in **un** file solo | I numeri veri + `CONTATTI_VERI = true` |
| Prezzo dinamico | Motore vero, **moltiplicatori segnaposto** | I coefficienti dai fornitori + `REGOLE_VERE = true` |
| Ricalcolo del prezzo | Solo nel browser | Una rotta server: oggi il prezzo è modificabile da chi naviga |
| Scadenza del preventivo | Calcolata e mostrata, non applicata | Il controllo vive dove si incassa, e la cassa non c'è ancora |

Le fotografie non sono più un buco: le 23 immagini di `PROMPT-IMMAGINI.md`
sono state prodotte e collegate (rivelazione, quattro pacchetti, otto add-on,
sushi, location, wedding). Restano due cose da sapere:

- i JPG in `public/images/` sono qualità 85 progressive, 65–270 KB. Con
  `images: { unoptimized: true }` il file è quello che arriva al browser:
  niente PNG lì dentro. Gli originali stanno in `immagini-originali-png/`,
  fuori dall'export;
- sono sotto la risoluzione chiesta dal documento (es. 922 × 1152 invece di
  1400 × 1750). Proporzioni corrette, nessun upscale — se un giorno serve più
  nitidezza sugli hero, vanno rigenerati;
- `public/images/vecchie/` contiene due file sostituiti e non più
  referenziati.

---

## 8. Cosa implementare, in ordine

### Prima di mostrarlo a chiunque

1. **Numeri veri.** `TELEFONO`, `TELEFONO_E164` e `ORARIO` in
   `lib/contatti.ts`, poi `CONTATTI_VERI` a `true`. Un file, tre minuti.
2. **La chiave del servizio di moduli** in `.env.local` (copiare
   `.env.example`). Senza, il sito dichiara al cliente che la richiesta non è
   partita — che è corretto, ma non è un sito che si pubblica.
3. **Marchi Lamborghini.** Nelle foto d'archivio logo, scritta "URUS SE" e
   muro "AD PERSONAM" sono leggibili. Vanno sostituite o autorizzate.
4. **Decidere se si incassa subito.** Il checkout oggi dice "si paga tutto
   adesso" con un modulo carta finto. Ma incassare richiede Shopify Payments,
   che richiede la partita IVA, che arriva con la società. Finché non c'è, il
   passo 3 andrebbe riportato a richiesta invece che a pagamento — vedi
   `PIANO-TECH.md`, § 4.
5. **Pagine legali** e cookie banner, prima di pubblicare. Fra queste ora c'è
   anche la **politica di cancellazione**: `tabellaCancellazione()` la produce
   già in forma leggibile, così il testo delle condizioni e il codice che le
   applica vengono dallo stesso posto.
6. **I moltiplicatori veri**, e poi `REGOLE_VERE = true` in `lib/regole.ts`.
   Finché è falsa il sito dice "prezzo indicativo" ovunque, che è corretto ma
   non è un sito che incassa.

### Il backend

`SHOPIFY-AVVIO.md` è la procedura operativa — development store, token,
prodotti, metafield, fase per fase. Qui resta solo l'ordine e il perché:

7. **Catalogo.** Sostituire il corpo delle cinque funzioni di `catalog.ts` con
   le query Storefront. Nessuna pagina cambia.
8. **Carrello.** `cart.add()` → mutation `cartLinesAdd`. `merchandiseId` è già
   il GID, `attributes` passa così com'è — data e località comprese. Il
   pannello non si tocca.
9. **Quotazione lato server.** Una rotta che ricalcola con la stessa
   `quota()` e crea un **Draft Order** con `priceOverride`. È il pezzo che
   rende il prezzo non modificabile dal browser, ed è anche il punto in cui il
   progetto smette di essere un export statico. Perché Draft Order e non il
   `checkoutUrl` normale: `MOTORE-PREZZO.md` § 4.
10. **Pagamento.** Il link di pagamento arriva dal Draft Order. Richiede
    partita IVA e IBAN aziendale: è il vero vincolo, non il codice. Le righe a
    prezzo fisso possono continuare a passare da `cart.checkoutUrl`, ma sono
    due casse — va deciso se tenerle entrambe.
11. **Accesso.** Customer Account API: il codice a sei cifre lo manda Shopify
    davvero. `richieste` diventa `Customer.orders`, `salvati` una metafield.
12. **Modulo e richiamata verso il CRM.** Oggi passano da un servizio di moduli
    esterno; il punto da cambiare è il corpo di `inviaModulo` in
    `lib/invia.ts`, uno solo.

**L'export statico non regge più fino in fondo.** Reggeva quando il checkout
era un redirect a un prezzo di catalogo; il punto 9 richiede una rotta nostra,
quindi si toglie `output: "export"` da `next.config.ts` e le pagine del
catalogo passano a ISR. Mezza giornata, non si perde niente — ma da quel
momento il progetto ha un server e un segreto da custodire, tre mesi prima di
quanto `PIANO-TECH.md` prevedesse.

### Poi

11. **Estendere il modello base + add-on a wedding e sushi.** Oggi ce l'ha solo
    il noleggio; le altre due collezioni usano la resa standard. Un matrimonio
    è la categoria dove gli add-on rendono di più.
12. **Il pulsante "salva"** sulle schede pacchetto: `toggleSalvato` e il
    blocco nell'area personale sono già pronti, manca solo l'innesco in
    `PackageCard.tsx`.
13. **Gli hero alla risoluzione piena**, se e quando servono.

---

## 9. Scelte già prese, da non ridiscutere per sbaglio

- **Il carrello non è una pagina.** Portare via l'utente a ogni aggiunta è il
  modo più rapido per fargli perdere il filo.
- **Le categorie non tornano nella barra.** Si scelgono guardando
  un'immagine, non leggendo un menu; la tendina è una scorciatoia, non la
  strada principale.
- **Le vetture stanno al quinto posto** nella pagina noleggio, dopo pacchetti
  e configuratore. Su un sito di noleggio sarebbero al primo: è il punto.
- **Cinque etichette d'azione in tutto il sito**: *Aggiungi al carrello*,
  *Parla con un concierge*, *Vai al pagamento*, *Paga …*, *Invia la
  richiesta*.
- **Il prezzo si calcola a carrello, non si scrive a catalogo.** Un prezzo
  precalcolato non può esprimere l'anticipo, che dipende da quando *quel*
  cliente sta guardando *quella* data. Due persone davanti alla stessa vettura
  nello stesso secondo vedono cifre diverse se una la vuole sabato e l'altra a
  settembre.
- **Una sola funzione calcola il prezzo, e gira in due posti.** Browser e
  server chiamano `quota()`. Se un giorno divergessero, il cliente vedrebbe una
  cifra al riepilogo e un'altra alla cassa.
- **Dove manca una fotografia il sito lo dichiara** con un riquadro
  riconoscibile (`PlaceholderMedia`), invece di riempire con uno stock
  sbagliato. Oggi non se ne vede nessuno: resta la rete di sicurezza per i
  prodotti che arriveranno da Shopify senza immagine.

---

## 10. Come si riparte da zero, in prova

Dalla console del browser:

```js
Object.keys(localStorage)
  .filter(k => k.startsWith("golden."))
  .forEach(k => localStorage.removeItem(k));
```

Giro completo di prova: catalogo → un pacchetto → *Aggiungi al carrello*
(il pannello non si apre, si resta nella griglia) → configuratore, cambio
add-on e vettura → *Aggiungi al carrello* (qui si apre) → badge a 2 → *Vai al
pagamento* → i tre passi, carta `4242 4242 4242 4242` → l'esito con il codice
ordine → *Vedi l'ordine* → area personale, richiesta "Confermata".
