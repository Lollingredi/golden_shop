# GOLDEN — account, carrello, checkout, operatore

Come funzionano le quattro funzioni aggiunte, dove stanno nel codice e cosa
cambia il giorno in cui arriva Shopify.

---

## Il punto di partenza: non c'è un server

Il sito è un export statico (`output: "export"` in `next.config.ts`): non c'è
un backend che possa custodire una sessione o un carrello. Quindi **tutto lo
stato vive nel browser di chi naviga**, in `localStorage`.

Cosa significa in pratica:

- il carrello sopravvive alla chiusura del browser, ma solo su quel computer;
- l'accesso non verifica niente, l'email diventa la sessione;
- nessun dato esce dal dispositivo, nessuna richiesta viene davvero inviata.

Va benissimo per costruire e provare l'interfaccia mentre il backend non c'è.
Non va in produzione così: sotto, per ogni funzione, c'è la riga che dice
esattamente cosa va sostituito.

### Le due regole che tengono in piedi tutto

**1. Lo stato non si legge durante il render.** L'HTML è generato a build
time, quando `localStorage` non esiste. Se leggessimo lo storage al primo
render, React troverebbe un HTML diverso da quello servito (*hydration
mismatch*) e sputerebbe errori in console. Perciò si parte sempre dallo stato
vuoto e si legge in `useEffect`, dopo il montaggio.

**2. `hydrated` è la spia che dice "adesso è vero".** Finché è `false`, il
badge del carrello non compare e l'area personale mostra "Un istante…" invece
di rimbalzare al login. È il motivo per cui il contatore non lampeggia a zero
al caricamento di ogni pagina.

### La mappa dei file

| File | Cosa contiene |
|---|---|
| `lib/store.ts` | Forme dati, chiavi di storage, calcolo totali, acconto |
| `components/StoreProvider.tsx` | I tre stati: carrello, account, operatore |
| `components/CartDrawer.tsx` | Il pannello a scorrimento |
| `components/AddToCart.tsx` | I pulsanti che riempiono il carrello |
| `components/Operator.tsx` | Pannello operatore + i suoi quattro inneschi |
| `app/account/login/page.tsx` | Accesso |
| `app/account/page.tsx` | Area personale |
| `app/checkout/page.tsx` | Conferma in tre passi |

`StoreProvider` avvolge tutto in `app/layout.tsx`. `CartDrawer` e
`OperatorDialog` sono montati **una volta sola** lì dentro: le pagine non li
ripetono, chiamano solo `useCart()` e `useOperator()`.

---

## 1. Login e Personal Area

### Come si comporta

L'accesso è **passwordless in due passi**: email, poi un codice a sei cifre.
Non è una scelta estetica — è già la forma del flusso reale di Shopify, così
quando si collega la Customer Account API la schermata non va rifatta. Oggi
qualsiasi sequenza di sei cifre entra.

Dopo l'accesso, l'icona utente nell'header porta a `/account` invece che al
login. L'area personale ha tre blocchi:

**Le vostre richieste.** Ogni conferma inviata dal checkout diventa una scheda
con codice (`GLD-xxxxx`), data, città, righe dell'ordine, totale e stato — *In
lavorazione*, *Confermata*, *Conclusa*. Oggi lo stato resta sempre il primo,
perché non c'è nessuno che lo cambi. Ogni scheda ha il suo "Parla con un
operatore", che apre il pannello già sapendo di quale richiesta si tratta.

**Esperienze salvate.** Elenco dei pacchetti tenuti da parte
(`toggleSalvato`). L'aggancio è pronto; il cuoricino sulle schede non l'ho
messo, si aggiunge in una riga quando decidete dove va.

**I vostri dati.** Nome, telefono, città. Servono a precompilare il checkout e
il modulo di richiamata: chi ha già comprato una volta non riscrive tutto.

### Rotta protetta

`/account` controlla la sessione **dopo** l'idratazione:

```tsx
useEffect(() => {
  if (hydrated && !account) router.replace("/account/login");
}, [hydrated, account, router]);
```

Senza il controllo su `hydrated` rimbalzerebbe sempre, perché al primo render
`account` è `null` per costruzione (regola 1).

### Il giorno di Shopify

Sostituire `login()` con la **Customer Account API**: il codice a sei cifre lo
manda Shopify davvero, e restituisce un token. `richieste` diventa
`Customer.orders`; `salvati` una metafield lista sul Customer.

---

## 2. Carrello a scorrimento

### Perché a scorrimento e non una pagina

Su un sito di esperienze il carrello si apre dieci volte per una conversione:
si aggiunge un pacchetto, si torna a guardare, si cambia vettura. Portare via
l'utente dalla pagina a ogni aggiunta è il modo più rapido per fargli perdere
il filo. Il pannello entra da destra, si chiude con Esc, con un clic fuori o
con la X, e la pagina sotto resta dov'era.

### Cosa sa fare

- **Righe identiche si sommano invece di duplicarsi.** L'identità di una riga
  non è il prodotto: è *prodotto + add-on scelti* (`lineKey()` in
  `lib/store.ts`). Due volte la stessa Urus con The Reveal diventano quantità
  2; la stessa Urus con Romance è un'altra riga. È l'unico comportamento
  corretto quando gli add-on cambiano il prezzo.
- **Gli add-on compaiono come etichette** sotto il titolo della riga.
- **Si apre da solo quando si aggiunge qualcosa**: è la conferma che
  l'aggiunta è andata a buon fine, e costa meno di un messaggio a comparsa.
- **Il badge nell'header** mostra il numero di pezzi, non di righe.
- **Blocca lo scroll di fondo** mentre è aperto, e restituisce il focus alla
  tastiera.

### Da dove si riempie

| Punto | Cosa aggiunge |
|---|---|
| Scheda prodotto | La vettura nuda, senza add-on |
| Scheda pacchetto | L'esperienza preconfigurata, con la vettura meno cara come base |
| Configuratore | La combinazione esatta scelta, add-on compresi |

Il configuratore compone **una riga sola**: la vettura è il prodotto, gli
add-on sono attributi di riga. Questa è la struttura che Shopify chiama *line
item properties*, ed è il motivo per cui in `CartLine` il campo si chiama
`attributes` e non `addons`.

### Il giorno di Shopify

`cart.add()` diventa la mutation `cartLinesAdd`; `merchandiseId` è già il GID
della variante; `attributes` passa così com'è. Il pannello non si tocca.

---

## 3. Checkout

### Non è un pagamento, ed è voluto

Golden non vende una scatola: vende una giornata che dipende dalla data, dalla
città e dalla disponibilità di un partner. Chiedere la carta prima di aver
verificato che la vettura sia libera produce due cose, entrambe brutte:
rimborsi, e clienti arrabbiati. Quindi il flusso è:

> **1. Chi siete** → **2. Quando e dove** → **3. Conferma**

Alla fine parte una *richiesta*, non un ordine. Il messaggio in fondo lo dice
in chiaro: nessun addebito adesso, vi richiamiamo, e solo se confermate arriva
il link per l'acconto.

### L'acconto

Il 30%, definito in un punto solo:

```ts
export const ACCONTO = 0.3;   // lib/store.ts
```

Cambiare quel numero lo cambia nel carrello, nel checkout e nella schermata di
esito. Il saldo si regola con il partner il giorno del servizio — anche questo
è scritto ovunque compaia una cifra, perché è la domanda che il cliente si fa
subito dopo.

### Cosa succede alla conferma

1. Se non c'era una sessione, viene creata (chi conferma ha un account).
2. I dati anagrafici finiscono nell'account, per la volta dopo.
3. Nasce una `Richiesta` con codice e data, in testa all'elenco.
4. **Il carrello si svuota.**
5. Compare la schermata di esito, con il codice e due strade: vedere la
   richiesta, o parlare con un operatore.

Se qualcuno arriva su `/checkout` con il carrello vuoto trova una schermata
dedicata che lo rimanda ai pacchetti, non un modulo vuoto.

### Il giorno di Shopify

I passi 1 e 2 riempiono `buyerIdentity` e gli `attributes` del Cart. Il passo
3 ha due strade, da scegliere:

- **incasso immediato** → redirect a `cart.checkoutUrl`, Shopify fa il resto;
- **preventivo** (più aderente a come lavorate) → si crea una **DraftOrder**,
  l'operatore la conferma e Shopify manda al cliente il link di pagamento
  dell'acconto.

---

## 4. "Parla con un operatore"

### Un pannello solo, quattro inneschi

Il pannello (`OperatorDialog`) è montato una volta nel layout. Tutto il resto
sono pulsanti che chiamano `useOperator().open(contesto)`. **Il contesto è la
cosa importante**: è la stringa che l'operatore vedrà per prima, cioè da dove
è partita la richiesta. Un operatore che sa già che state guardando *The Big
Reveal* parte con dieci minuti di vantaggio.

| # | Dove | Contesto passato | Comportamento |
|---|---|---|---|
| 1 | **Footer**, in ogni pagina | `Footer` | Fascia con una riga di testo e il pulsante bordato |
| 2 | **Popup in homepage** | `Homepage` | Compare in basso a destra, una volta sola |
| 3 | **Fine del catalogo** | `Catalogo` | Fascia larga, con "in linea adesso" se siamo in orario |
| 4 | **Fine schermata dettagli**, dopo gli add-on | `Dettaglio noleggio — add-on` | Fascia larga, testo sulle domande di allestimento |

In più, senza che fosse chiesto ma perché sono i punti dove la domanda nasce
davvero: dentro il carrello, nel riepilogo del checkout, sulla schermata di
esito, su ogni richiesta dell'area personale e nella colonna del
configuratore.

### Il popup, e perché non è fastidioso

Tre regole:

- **Non compare subito.** Serve un segno che la persona stia guardando
  davvero: 40% di scroll, oppure 18 secondi sulla pagina.
- **Una volta sola.** "Chiudi" o "Parla con un operatore" lo spengono per
  sempre su quel dispositivo (`golden.popup-operatore.v1`); "Più tardi" lo
  spegne solo per quella visita.
- **Non copre mai niente.** Se il carrello o il pannello sono aperti, il popup
  si nasconde. Coprire un carrello aperto con un popup è il modo migliore di
  perdere un ordine.

### Dentro il pannello

Tre strade, in ordine di velocità: **chiamata diretta**, **WhatsApp**,
**richiamata** (nome, telefono, fascia oraria — precompilati se c'è una
sessione). In cima, una riga che dice se c'è qualcuno adesso: lunedì–sabato
9–20, calcolata sul browser dopo il montaggio, perché l'ora del server non
c'entra niente con quella di chi guarda.

### Cosa va cambiato prima di pubblicare

In `components/Operator.tsx`, in cima:

```ts
const TELEFONO = "+39 000 000 0000";
const TELEFONO_HREF = "tel:+390000000000";
const WHATSAPP_HREF = "https://wa.me/390000000000";
```

Sono segnaposto. Vanno sostituiti con i numeri veri, e l'orario (`useInLinea`,
poche righe sotto) con quello vero.

Il modulo di richiamata oggi non invia niente: mostra la conferma e basta. Il
punto dove agganciare la POST verso il CRM o l'endpoint di contatto è marcato
nel file con un commento.

---

## Riepilogo di cosa è finto, oggi

| Funzione | Stato | Cosa serve |
|---|---|---|
| Accesso | Simulato — nessuna verifica | Customer Account API |
| Carrello | Reale, in `localStorage` | Cart API per il multi-dispositivo |
| Checkout | Nessun pagamento | `checkoutUrl` oppure DraftOrder |
| Richiamata | Non invia | Endpoint di contatto o CRM |
| Stato richieste | Sempre "In lavorazione" | Gestionale che lo aggiorni |
| Telefono e WhatsApp | Numeri segnaposto | I numeri veri |

## Come si prova

```bash
npm run dev
```

Un giro completo: catalogo → un pacchetto → "Aggiungi" (il pannello si apre da
destra) → configuratore, cambio add-on e vettura → "Aggiungi al carrello" →
badge a 2 → "Vai alla conferma" → i tre passi → l'esito con il codice → "Vedi
la richiesta" → area personale con la richiesta in elenco.

Per ripartire da zero, dalla console del browser:

```js
Object.keys(localStorage)
  .filter(k => k.startsWith("golden."))
  .forEach(k => localStorage.removeItem(k));
```
