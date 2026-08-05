# GOLDEN — avvio su Shopify

Come si passa dal sito attuale (catalogo in un file TypeScript, stato in
`localStorage`) a un negozio Shopify che incassa davvero. Documento
operativo: ogni fase dice cosa si tocca, dove, e come si verifica che
funzioni.

Presuppone `TECNICO.md` letto: qui si dà per noto dov'è ogni file.

---

## 0. Due cose da sapere prima di cominciare

**Il piano gratuito non esiste.** Quello che si chiama "gratis" sono due
cose diverse:

| | Costa | Incassa denaro vero | A cosa serve |
|---|---|---|---|
| **Development store** (Shopify Partner) | 0 € per sempre | No — solo checkout di prova | Costruire, collegare il codice, provare tutto il flusso |
| **Prova del negozio vero** | 3 giorni gratis, poi 1 €/mese per 3 mesi | Sì | Aprire davvero |
| **Basic** a regime | ~29 €/mese annuale, ~39 €/mese mensile | Sì | Il piano su cui resterete |

Si parte dal **development store**: è gratuito, ha l'admin completo, e
tutto quello che ci si costruisce dentro (prodotti, collezioni, metafield,
tema, configurazione) si trasferisce al negozio a pagamento quando si apre.
Non si butta via niente.

**L'architettura resta quella di adesso.** Il sito continua a essere un
export statico Next.js. Shopify non serve il sito: serve il catalogo (a
build time) e il checkout (dove si va a pagare). Con questa forma basta il
piano Basic — le complicazioni da Shopify Plus (checkout su dominio
proprio, Cart Permissions API) non ci riguardano.

Il flusso finale:

```
catalogo Shopify ──build time──> HTML statico su Vercel/Netlify
carrello nel browser ──Storefront API (token pubblico)──> Cart Shopify
"Paga" ──redirect──> checkout ospitato da Shopify ──> incasso
```

---

## Fase 1 — Aprire il development store

**Tempo: mezz'ora.**

1. Registrarsi su `partners.shopify.com` (account Partner, gratuito).
   Serve un'email e i dati anagrafici; non serve la P.IVA in questa fase.
2. Nel pannello Partner: **Stores → Add store → Create development store**.
3. Tipo di negozio: **Store for testing and development** (non "client
   store"). Nome: `golden-dev`. Valuta **EUR**, paese **Italia**, lingua
   italiana.
4. In **Settings → Payments** attivare il **Bogus Gateway** per i test.
   Carta di prova: `4242 4242 4242 4242`, scadenza futura qualsiasi, CVC
   qualsiasi.

Limite noto: dopo ~10 ordini di prova il dev store blocca i checkout. È
normale, si cancellano gli ordini o si crea un secondo dev store.

**Verifica:** riuscite a creare un prodotto fittizio, comprarlo con la
carta di test e vedere l'ordine in **Orders**.

---

## Fase 2 — Modellare il catalogo

**Tempo: mezza giornata. È la fase che decide tutto il resto.**

Golden vende servizi, non scatole. Su Shopify sono comunque "prodotti", ma
vanno configurati diversamente.

### Le tre collezioni

Creare tre **collezioni manuali** con gli stessi handle di adesso, perché
le rotte del sito ci si appoggiano:

- `noleggio-auto`
- `wedding-planner`
- `sushi-delivery`

Per ognuna: titolo, descrizione, immagine di copertina. Il `kicker` e
l'`intro` (copy editoriale di `lib/catalog.ts`) non esistono su Shopify:
diventano **metafield di collezione**, tipo "riga di testo".

### I quindici prodotti

Per ogni prodotto di `lib/catalog.ts`, in admin:

- **Titolo, descrizione, immagine, handle** identici a quelli attuali —
  l'handle è l'URL, cambiarlo rompe i link esistenti.
- **Vendor** = il partner. **Product type** = "Noleggio", "Wedding",
  "Delivery".
- **Varianti**: le due che esistono già nel codice — `Standard` e
  `Con Celebrity Experience` — come opzione "Formula", con i due prezzi.
- **Spedizione: togliere la spunta "This is a physical product"**. Sono
  servizi: senza questo, il checkout chiede l'indirizzo di spedizione e
  calcola costi di consegna che non c'entrano niente.
- **Inventario**: non tracciare, oppure "continua a vendere quando esaurito".
  La disponibilità reale la decide il partner, non un contatore.

### I metafield

`lib/shopify-types.ts` prevede già quattro metafield di prodotto. Vanno
creati in **Settings → Custom data → Products** con questi handle esatti:

| Metafield | Tipo | Esempio |
|---|---|---|
| `citta` | Single line text | "Milano, Roma" |
| `durata` | Single line text | "Giornata intera" |
| `incluso` | List of single line text | ["Autista", "Carburante"] |
| `partner` | Single line text | "Autonoleggio Rossi" |

### Il punto delicato: add-on e pacchetti

Oggi `ExperienceBuilder` calcola il prezzo a mano: base + add-on scelti,
e i pacchetti applicano uno sconto. Sul checkout Shopify **il prezzo non
lo decidiamo noi**: si paga la somma delle varianti nel carrello. Se il
totale mostrato nel carrello non coincide, il cliente vede due cifre
diverse e la vendita salta.

Tre modi di risolverlo, in ordine di fatica:

1. **Ogni add-on è un prodotto suo** (fotografo, videomaker, nastro…),
   aggiunto al carrello come riga separata. Il totale torna da solo. È la
   strada consigliata: nessun codice da inventare, e in admin si vede
   esattamente cosa è stato venduto.
2. **Ogni pacchetto è un prodotto suo**, con il prezzo scontato già dentro.
   I quattro pacchetti di `lib/experiences.ts` diventano quattro prodotti.
3. **Sconti automatici** su Shopify che replicano la regola del pacchetto.
   Più elegante, ma la regola vive in due posti e prima o poi divergono.

Scegliere 1 + 2. Va deciso **prima** di scrivere codice, perché cambia la
forma delle righe di carrello.

**Verifica:** in admin, i tre cataloghi hanno i prodotti giusti, con prezzi
e metafield, e nessun prodotto chiede la spedizione.

---

## Fase 3 — Headless channel e token

**Tempo: dieci minuti.**

1. Dallo Shopify App Store installare il canale **Headless** sul dev store.
2. **Create storefront** → nome "Golden web".
3. Copiare i due token che genera:
   - **Public access token** — va nel browser, non è un segreto.
   - **Private access token** — sta solo lato build, è un segreto.
4. Nei permessi del canale, abilitare almeno: leggere prodotti, collezioni,
   inventario; scrivere carrelli.

Nel progetto, file `.env.local` (che `.gitignore` già esclude):

```bash
NEXT_PUBLIC_SHOPIFY_DOMAIN=golden-dev.myshopify.com
NEXT_PUBLIC_SHOPIFY_STOREFRONT_TOKEN=<token pubblico>
SHOPIFY_STOREFRONT_PRIVATE_TOKEN=<token privato>
NEXT_PUBLIC_SHOPIFY_API_VERSION=2026-07
```

Regola secca: tutto ciò che si chiama `NEXT_PUBLIC_` finisce nel
JavaScript servito al browser. Il token privato non deve **mai** avere
quel prefisso.

---

## Fase 4 — Collegare il catalogo

**Tempo: un giorno.**

Qui il lavoro è già stato preparato: `lib/catalog.ts` espone cinque
funzioni asincrone con le firme definitive, e i tipi di
`lib/shopify-types.ts` sono già le forme della Storefront API. Le pagine
non si toccano.

**Nuovo file `lib/shopify.ts`** — il client, in un posto solo:

```ts
const dominio = process.env.NEXT_PUBLIC_SHOPIFY_DOMAIN!;
const versione = process.env.NEXT_PUBLIC_SHOPIFY_API_VERSION ?? "2026-07";

/** A build time si usa il token privato; nel browser quello pubblico. */
export async function storefront<T>(query: string, variables = {}): Promise<T> {
  const privato = process.env.SHOPIFY_STOREFRONT_PRIVATE_TOKEN;
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (privato) headers["Shopify-Storefront-Private-Token"] = privato;
  else headers["X-Shopify-Storefront-Access-Token"] =
    process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_TOKEN!;

  const res = await fetch(`https://${dominio}/api/${versione}/graphql.json`, {
    method: "POST",
    headers,
    body: JSON.stringify({ query, variables }),
  });
  const { data, errors } = await res.json();
  if (errors?.length) throw new Error(errors[0].message);
  return data as T;
}
```

Poi si sostituisce **solo il corpo** delle cinque funzioni in fondo a
`lib/catalog.ts`, lasciando firme e tipi come sono. Il catalogo statico
resta nel file, commentato, finché il collegamento non è provato.

Due cose che rompono se ci si dimentica:

- **Immagini.** Oggi stanno in `/public/images`. Da Shopify arrivano da
  `cdn.shopify.com`: va aggiunto `images.remotePatterns` in
  `next.config.ts` (con `unoptimized: true` che c'è già, serve comunque
  perché Next validi l'host).
- **Rotte dinamiche.** Con `output: "export"`,
  `app/products/[handle]/page.tsx` deve esportare `generateStaticParams()`
  che legge gli handle da Shopify a build time. Prodotto nuovo in admin =
  rebuild del sito. È il compromesso dello statico; se diventa fastidioso
  si passa a Vercel con ISR (mezza giornata, non si perde niente di quanto
  fatto).

**Verifica:** `npm run build` genera le quindici schede prodotto con i
prezzi presi da Shopify, e cambiare un prezzo in admin + rebuild lo cambia
sul sito.

---

## Fase 5 — Carrello e checkout

**Tempo: un giorno.**

Il carrello oggi vive in `localStorage` dentro `StoreProvider.tsx`. Con
Shopify diventa un **Cart** vero, creato via Storefront API dal browser
con il token pubblico. In `localStorage` resta solo il `cartId`.

Le mutation che servono: `cartCreate`, `cartLinesAdd`, `cartLinesUpdate`,
`cartLinesRemove`, e la query `cart` per rileggerlo. La forma `CartLine`
di `lib/store.ts` è già quella giusta: `merchandiseId` è il GID della
variante e `attributes` sono le *line item properties* — è lì che finiscono
data del servizio, città, note e add-on scelti.

Il checkout: la pagina `app/checkout/page.tsx` oggi ha un modulo carta
simulato. Nella versione Shopify quel modulo **sparisce**, e il pulsante
"Paga" fa un redirect a `cart.checkoutUrl`. Pagamento, antifrode, ricevuta
e IVA li gestisce Shopify.

Nota utile: la scelta fatta di recente — niente acconto, si incassa tutto
subito — è esattamente ciò che il checkout Shopify sa fare senza
acrobazie. Una formula ad acconto avrebbe richiesto pagamenti parziali,
che su Basic non esistono.

I passi 1 e 2 del checkout (chi siete, quando e dove) restano nostri: i
dati raccolti si passano al Cart come `buyerIdentity` e `attributes`, così
arrivano nell'ordine.

**Verifica:** aggiungere due esperienze al carrello, arrivare al checkout
Shopify, pagare con `4242 4242 4242 4242`, e vedere l'ordine in admin con
gli attributi (data, città, add-on) leggibili nella riga d'ordine.

---

## Fase 6 — Account clienti

**Tempo: un giorno, e si può rimandare.**

`app/account/login/page.tsx` è già scritto a due passi (email → codice a
sei cifre) perché è esattamente il flusso passwordless di Shopify. Per
collegarlo serve la **Customer Account API**, che ha tre requisiti da
sapere prima:

- **OAuth 2.0 con PKCE** — il sito è un client pubblico, non ha un server
  dove custodire il refresh token.
- **HTTPS obbligatorio, `localhost` non è ammesso.** In sviluppo serve un
  tunnel (ngrok o simili).
- Gli **origin JavaScript** vanno dichiarati nella configurazione del
  client.

Consiglio: aprire senza. L'area personale continua a funzionare in locale
com'è adesso, gli ordini reali si vedono nell'email di conferma Shopify,
e questa fase si fa quando il resto è in produzione da qualche settimana.

---

## Fase 7 — Dal dev store al negozio vero

**Tempo: due giorni, più i tempi delle verifiche bancarie.**

Quando il flusso completo funziona sul dev store:

1. **Scegliere il piano.** Basic basta. Se conviene, si attiva la prova (3
   giorni gratis, poi 1 €/mese per 3 mesi) e si paga annuale solo quando
   si è sicuri.
2. **Trasferire il negozio**: dal pannello Partner, il dev store si
   converte in negozio a pagamento. Prodotti, collezioni, metafield e
   configurazione restano.
3. **Shopify Payments**: serve P.IVA, IBAN aziendale, documento del legale
   rappresentante. Usare Shopify Payments evita la commissione extra di
   Shopify sulle transazioni (con altri gateway sul Basic è ~2%).
4. **Dominio**: puntare `golden.it` (o quello che sarà) al sito statico,
   e lasciare il checkout su `checkout.shopify.com` — sul Basic il
   checkout su dominio proprio non c'è.
5. **Fiscale italiano**: Shopify non emette fatture elettroniche verso SdI.
   Serve un'app di collegamento (Fatture in Cloud, TeamSystem e simili),
   che costa a parte. Va configurata l'IVA italiana: il noleggio, i servizi
   di catering e i servizi di wedding hanno aliquote diverse — questa parte
   va vista con il commercialista, non improvvisata.
6. **Pagine legali**: termini e condizioni, privacy, cookie banner (GDPR),
   politica di cancellazione. Da sapere: per i servizi con data fissata —
   noleggio veicoli, ristorazione, tempo libero — il diritto di recesso di
   14 giorni normalmente **non** si applica, ma la cosa va scritta
   correttamente e fatta verificare da chi di dovere. Non è un parere
   legale.
7. **Ordine di prova reale** con carta vera, poi rimborso. È l'unico modo
   di sapere che l'incasso arriva davvero sul conto.

---

## Costi, per non avere sorprese

| Voce | Quanto | Quando |
|---|---|---|
| Development store | 0 € | Fase 1-6 |
| Shopify Basic | ~29 €/mese annuale, ~39 €/mese mensile | Dall'apertura |
| Prova | 3 giorni gratis + 1 €/mese × 3 mesi | All'apertura |
| Commissioni Shopify Payments | ~1,5-2% + 0,25 € per transazione europea | Per ordine |
| Commissione extra senza Shopify Payments | ~2% sul Basic | Per ordine |
| Dominio | ~15 €/anno | Una volta l'anno |
| App fatturazione elettronica | ~10-25 €/mese | Dall'apertura |
| Hosting del sito statico | 0 € (Vercel/Netlify piano gratuito) | — |

Le cifre in euro oscillano con il cambio e le promozioni: vanno
riverificate sulla pagina prezzi di Shopify il giorno che si sottoscrive.

---

## Ordine dei lavori, in breve

- [ ] **1.** Account Partner + development store (mezz'ora)
- [ ] **2.** Decidere la modellazione di add-on e pacchetti — *prima del codice*
- [ ] **3.** Caricare 3 collezioni, 15 prodotti, metafield, add-on, pacchetti (mezza giornata)
- [ ] **4.** Canale Headless + token in `.env.local` (dieci minuti)
- [ ] **5.** `lib/shopify.ts` e le cinque funzioni di `lib/catalog.ts` (un giorno)
- [ ] **6.** Carrello via Cart API + redirect a `checkoutUrl` (un giorno)
- [ ] **7.** Ordine di prova completo con carta 4242 (mezz'ora)
- [ ] **8.** Piano Basic, Shopify Payments, dominio, fatturazione, pagine legali (due giorni)
- [ ] **9.** Customer Account API — dopo l'apertura, senza fretta

Da soli, senza imprevisti: **circa una settimana di lavoro effettivo**, più
i tempi morti delle verifiche bancarie.

---

## Fonti

- [Shopify — Building with the Storefront API](https://shopify.dev/docs/storefronts/headless/building-with-the-storefront-api)
- [Shopify — Manage the Headless channel](https://shopify.dev/docs/storefronts/headless/building-with-the-storefront-api/manage-headless-channels)
- [Shopify — Getting started with the Customer Account API](https://shopify.dev/docs/storefronts/headless/building-with-the-customer-account-api/getting-started)
- [Shopify — Testing orders in development stores](https://help.shopify.com/en/partners/manage-clients-stores/development-stores/test-orders-in-dev-stores)
- [Prezzi Shopify 2026 — riepilogo piani](https://www.demandsage.com/shopify-pricing/)
- [Costi Shopify in Italia 2026](https://blog.smart-dato.com/it/post/quanto-costa-shopify-italia)
