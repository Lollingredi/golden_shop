# GOLDEN — piano tech a 12 mesi

Front-end e back-end estratti dalla *Roadmap Operativa Globale*, riscritti a
partire da quello che esiste davvero nel repository. Le altre due macro-aree
della roadmap — Servizi & Partner, Legal & Operations — non sono qui: restano
nel documento originale.

**Fuori dal piano: la native app iOS/Android.** Le due funzioni che la
roadmap le appoggiava sopra — multilingua e tracking in tempo reale —
restano, ma sul web.

Chi legge questo documento dovrebbe avere in mente `TECNICO.md` (com'è fatto
il sito oggi) e `SHOPIFY-AVVIO.md` (la procedura per collegarlo a Shopify).
Qui non si ripetono: si dice quando si fanno e cosa viene dopo.

---

## 1. Da dove si parte davvero

Il front-end della roadmap Q1 — "web app responsive, catalogo dinamico con
filtri, modulo di configurazione add-on fissi e variabili" — **è già
costruito**. Next.js 16, tre collezioni, quindici schede prodotto,
configuratore base + otto add-on + quattro pacchetti, carrello, checkout in
tre passi, area personale, pannello concierge con tredici inneschi. Trentadue
fotografie prodotte.

Quello che non c'è è tutto ciò che sta dietro: il catalogo è un file
TypeScript, il carrello vive in `localStorage`, il modulo carta è finto.

Quindi il Q1 non è "costruire il front-end". È **staccare la spina alla
simulazione**, nell'ordine giusto.

---

## 2. La decisione che regge tutti i dodici mesi

La roadmap dice: architettura cloud, PostgreSQL, Stripe Connect con trattenuta
automatica del margine, dal mese uno. È l'architettura giusta per il Golden
del terzo anno. È anche tre mesi di lavoro prima del primo euro incassato, per
un team con **un socio tech e mezzo**.

La strada di questo piano è l'opposta: **si compra tutto ciò che si può
comprare, si costruisce solo ciò che nessuno vende.**

| | Chi lo fa | Perché |
|---|---|---|
| Catalogo, carrello, checkout, incasso, antifrode, ricevute, IVA | **Shopify** | È un problema risolto. Rifarlo non ci distingue da nessuno |
| Vetrina, configuratore, racconto, concierge | **Il nostro codice** | È l'unica cosa che i clienti confrontano |
| Disponibilità partner, accettazione slot, documenti, provvigioni, pricing stagionale | **Backend nostro, da Q2** | Nessuno lo vende nella forma che ci serve |
| Split del pagamento ai partner | **A mano, finché non fa male** | Vedi sotto |

### Lo split commissionale, detto chiaro

Stripe Connect trattiene la commissione e paga il fornitore in automatico.
Shopify no: incassa tutto su un conto Golden, e i partner si pagano dopo, per
bonifico, sulla base di un riepilogo.

Con dieci-venti servizi al mese è mezza giornata di lavoro amministrativo. Con
duecento è insostenibile. **La soglia da tenere d'occhio è quella, non una
data**: quando i pagamenti ai partner superano la mezza giornata a settimana,
si valuta il passaggio a Stripe Connect — che a quel punto significa
riscrivere il checkout, non aggiungere una funzione. È l'unico scostamento
dalla roadmap che vale la pena rimettere in discussione ogni trimestre.

### Il momento in cui si esce dal sito statico

Oggi `next.config.ts` ha `output: "export"`: HTML puro, hosting gratuito,
nessun server. Regge il Q1 senza problemi.

Il portale fornitori del Q2 non ci sta dentro — servono sessioni, scritture,
un database. **Lì si passa a Vercel con rendering server-side**, e da quel
momento il progetto ha un server, un database e delle credenziali da
custodire. Non è un dettaglio di deploy: è il punto in cui il costo di gestione
smette di essere zero. Metterlo in Q2 e non in Q1 è la ragione per cui il Q1
può chiudersi in poche settimane.

---

## 3. Scostamenti dalla roadmap, in una tabella

| Roadmap | Questo piano | Perché |
|---|---|---|
| PostgreSQL e architettura cloud in Q1 | Database in Q2, con il portale fornitori | In Q1 non c'è niente da scriverci dentro che Shopify non tenga già |
| Stripe Connect in Q1 | Checkout Shopify; Connect solo oltre una soglia di volume | Tre mesi di sviluppo contro due giorni, per incassare la stessa cifra |
| Native app iOS/Android in Q2 | Web app + PWA installabile | Due codebase, due store, due cicli di review, per un catalogo che si consulta due volte l'anno |
| Multilingua IT/EN/RU/AR nell'app | Multilingua sul sito, in Q2 | Sposta sede, non priorità. RU e AR portano il testo da destra a sinistra: va messo in conto |
| Mappa tracking driver in tempo reale | Pagina di tracking pubblica via link, in Q3 | Non serve un'app per mandare un link con una mappa e un orario |
| Modulo prenotazioni e calendario in Q1 | Disponibilità confermata dal concierge in Q1, automatizzata in Q2 | Il calendario serve quando i partner lo aggiornano da soli. Prima è un database che mente |
| Dynamic pricing "automatizzato" in Q3 | Motore di regole nostro che scrive i prezzi su Shopify una volta al giorno | Il checkout Shopify usa i prezzi del catalogo: non si possono calcolare al volo nel carrello senza far vedere al cliente due cifre diverse |

---

## 4. Q1 — Dalla simulazione all'incasso

**Obiettivo: il sito prende soldi veri.** Nient'altro.

> **Il vincolo che riordina tutto il trimestre: la partita IVA.** Shopify
> Payments vuole P.IVA, IBAN aziendale e documento del legale rappresentante,
> e la S.r.l. nella roadmap sta al Q3. Finché non c'è, la settimana di lavoro
> di `SHOPIFY-AVVIO.md` non porta a un euro incassato.
>
> Quindi il Q1 si spezza in due. **Prima si pubblica un sito che raccoglie
> richieste** — gratis, senza società, chiudendo le vendite al telefono. Poi,
> il giorno che la P.IVA esiste, si collega Shopify.

### Q1a — Il sito che raccoglie richieste

Nessun costo ricorrente, nessun prerequisito societario.

| Cosa | Dove | Stato |
|---|---|---|
| Contatti in un file solo, con spia `CONTATTI_VERI` | `lib/contatti.ts` | **fatto** |
| Moduli che inviano davvero, con fallimento dichiarato | `lib/invia.ts`, `RequestForm.tsx`, `Operator.tsx` | **fatto** |
| Numeri di telefono e WhatsApp veri | `lib/contatti.ts` | serve il numero |
| Chiave del servizio di moduli | `.env.local` | serve l'account |
| Checkout riportato a richiesta invece che a pagamento | `app/checkout/page.tsx` | da fare |
| Foto con marchi Lamborghini leggibili | `public/images/` | da fare |
| Pagine legali, cookie banner | nuove rotte | da fare |
| Pubblicazione su Vercel o Netlify | — | da fare |

Le prime due righe erano il difetto più grave che il sito avesse: una
richiesta inviata non arrivava a nessuno, mentre la schermata prometteva una
chiamata entro poche ore. Adesso l'invio passa da `inviaModulo`, e **se non
riesce il sito lo dice** invece di fingere.

La quinta riga è una decisione, non un lavoro. Oggi il passo 3 del checkout è
un modulo carta finto che annuncia "si paga tutto adesso": pubblicato così è
una promessa che non si può mantenere. Il percorso a preventivo esiste già nel
codice e il modulo carta torna con Shopify.

### Q1b — Shopify, il giorno dopo la partita IVA

| Cosa | Dove |
|---|---|
| Dev store, catalogo, metafield, token | tutta la procedura di `SHOPIFY-AVVIO.md` |
| Le cinque funzioni di `catalog.ts` sulle query Storefront | `lib/catalog.ts` |
| Carrello via Cart API | `StoreProvider.tsx` — in `localStorage` resta il `cartId` |
| Modulo carta → redirect a `cart.checkoutUrl` | `app/checkout/page.tsx` |
| Fatturazione elettronica verso SdI | app di collegamento |

**Modellazione di add-on e pacchetti come prodotti veri** (strada 1 + 2 del
documento): va decisa prima di scrivere codice, perché cambia la forma delle
righe di carrello.

### Back-end

Nessun backend proprio, in nessuna delle due metà del trimestre.

**Le richieste** non passano da un server nostro: con l'export statico non
esiste una rotta `/api`, quindi il browser scrive direttamente a un servizio
di moduli esterno che inoltra per email (`lib/invia.ts`, configurato in
`.env.local`). Costa zero, non richiede società, e si sostituisce con una POST
al CRM cambiando il corpo di una funzione sola.

Dove arrivano, all'inizio: una casella operativa che qualcuno legge davvero,
più una riga su un foglio condiviso. **Un CRM in Q1 è prematuro** — si compra
quando le richieste non stanno più in una casella.

**La fatturazione elettronica** verso SdI serve un'app di collegamento
(Fatture in Cloud o simili): Shopify da solo non emette. Vale dal Q1b, non
prima.

### Disponibilità, in Q1

Non c'è motore di disponibilità. Il cliente indica una data, il concierge
conferma entro poche ore. **Il rischio è dichiarato**: si può prendere una
data che poi il partner non copre. Va gestito con una regola scritta di
rimborso immediato, non con del codice.

### Verifica di fine trimestre

Due verifiche, una per metà.

**Q1a:** una persona che non siamo noi manda una richiesta dal sito
pubblicato, e la riceviamo in casella entro pochi secondi con tutti i campi
leggibili.

**Q1b:** un ordine reale, con carta vera, con data e add-on leggibili nella
riga d'ordine in admin — e il partner avvisato entro un'ora.

---

## 5. Q2 — Il primo backend: portale fornitori e multilingua

È il trimestre che cambia l'architettura. Da qui in poi Golden ha un server.

### Back-end

**Passaggio a Vercel con rendering server-side.** Si toglie
`output: "export"`, le rotte del catalogo passano a ISR. Mezza giornata,
non si perde niente di quanto fatto.

**Database.** PostgreSQL gestito (Neon o Supabase, piano gratuito fino a
volumi che non vedremo nel primo anno). Quattro tabelle bastano per aprire:

```
partner        anagrafica, contatti, stato di verifica
documento      assicurazioni, visure, patenti — con scadenza
disponibilita  slot per partner e per mezzo/persona
assegnazione   ordine Shopify ↔ partner ↔ stato
```

Il catalogo **non** entra nel database: resta su Shopify, che è la sorgente di
verità dei prezzi. Duplicarlo è il modo più rapido per farli divergere.

**Portale fornitori.** Login separato dai clienti (i partner non sono
`Customer` di Shopify). Tre cose e basta:

1. accettare o rifiutare uno slot di prenotazione, con notifica;
2. caricare e rinnovare certificazioni e assicurazioni, con avviso di
   scadenza automatico;
3. aggiornare la propria disponibilità.

I documenti dei partner sono dati sensibili di terzi: storage privato con URL
firmati a scadenza, non una cartella pubblica. Va deciso in questa fase, non
dopo il primo caricamento.

**Webhook Shopify → nostro backend.** `orders/create` crea l'assegnazione e
fa partire la notifica al partner. È il pezzo che collega le due metà del
sistema.

### Front-end

| Cosa | Note |
|---|---|
| Multilingua IT / EN / RU / AR | `next-intl`, rotte `/[locale]/…`. Arabo e russo: l'arabo è RTL, e il sistema visivo di `globals.css` va verificato specchiato. Non è una traduzione, è un layout in più |
| PWA installabile | Manifest, icone, offline sul catalogo. Sostituisce la native app: si aggiunge alla schermata home senza store |
| Interfaccia del portale fornitori | Sobria e funzionale, non "luxury": la usano dei fornitori, dieci volte al giorno |
| Concierge WhatsApp Business API | Sostituisce il link `wa.me` di oggi con una conversazione tracciabile |

### Verifica di fine trimestre

Un partner riceve la notifica di un ordine, la accetta dal portale dal suo
telefono, e il cliente ne è informato — senza che nessuno di noi tocchi niente.

---

## 6. Q3 — Pricing, CRM, canale B2B

### Back-end

**Dynamic pricing, fatto in modo che regga.** Il checkout Shopify vende ai
prezzi del catalogo Shopify: qualunque prezzo calcolato al volo nel nostro
carrello produrrebbe due cifre diverse fra riepilogo e cassa, e la vendita
salta.

Quindi: motore di regole nostro (stagione, località, giorno della settimana,
anticipo della prenotazione) che **scrive i prezzi su Shopify via Admin API**
con un job giornaliero. I prezzi restano una cosa sola, e in admin si vede
sempre cosa si sta vendendo e a quanto.

Le regole partono dagli add-on, che sono il margine vero: la Costiera in
agosto e la Costa Smeralda a ferragosto non costano come Milano a novembre.

**CRM.** Non un CRM da comprare: una tabella `cliente` alimentata dagli ordini
Shopify, con storico, valore, preferenze e note del concierge. Serve a
riconoscere chi torna, che è il presupposto della membership del Q4.

**Provvigioni B2B.** Codice di riferimento per hotel e concierge partner,
tracciato dall'ordine alla provvigione maturata. È la sola parte del sistema
che tocca il denaro di terzi: va scritta con dei test veri e riconciliata a
mano per i primi mesi.

### Front-end

| Cosa | Note |
|---|---|
| Modulo "Custom Luxury Request" | Estensione del `RequestForm` esistente: richieste fuori catalogo, con budget e occasione |
| Dashboard B2B per hotel concierge | Le loro prenotazioni, le provvigioni maturate, i materiali da mostrare al cliente |
| Pagina di tracking pubblica | Link con mappa e orario stimato, aperto senza login. È l'erede del tracking dell'app |
| Estendere base + add-on a wedding e sushi | Oggi ce l'ha solo il noleggio. Il matrimonio è la categoria dove gli add-on rendono di più |

L'ultima riga viene da `TECNICO.md` ed è probabilmente la voce con il miglior
rapporto fra lavoro e ricavo di tutto il piano.

### Verifica di fine trimestre

Un prezzo di agosto a Porto Cervo si forma da solo, un hotel vede la sua
provvigione senza chiedercela, e una richiesta bespoke arriva a qualcuno con
tutto ciò che serve per rispondere.

---

## 7. Q4 — Membership, fatturazione, misurazione

### Front-end

**Golden VIP Membership, su invito.** Area riservata con trattamenti
prioritari, badge e reward. Prerequisito tecnico: la **Customer Account API**
di Shopify, rimandabile fino a qui ma non oltre — senza account veri non c'è
membership. Il login a due passi del sito è già scritto nella forma giusta.

Il livello si assegna con un tag sul `Customer` Shopify, non con una logica
nostra: così vale anche in checkout e nelle email.

### Back-end

- **Fatturazione elettronica automatizzata** per la S.r.l. costituita in Q3:
  emissione da ordine, senza passaggi manuali.
- **Business intelligence**: marginalità per servizio, per add-on, per
  partner, per città. La domanda a cui deve rispondere è una sola — *quale
  add-on ci fa guadagnare davvero* — e da lì si decide il catalogo dell'anno 2.
- **Consolidamento**: backup verificati (non solo attivati), monitoraggio
  degli errori, tempi di risposta, e una prova di ripristino fatta almeno una
  volta.

### Verifica di fine trimestre

Il bilancio del primo anno si compila leggendo la dashboard, non ricostruendo
le fatture a mano.

---

## 8. Le tre decisioni da prendere prima di scrivere codice

1. **Add-on e pacchetti su Shopify: prodotti separati o sconti automatici?**
   Cambia la forma delle righe di carrello, quindi cambia il codice. La
   raccomandazione di `SHOPIFY-AVVIO.md` è prodotti separati più pacchetti
   come prodotti bundle.
2. **Chi paga i partner, e come.** Bonifico su riepilogo mensile finché il
   volume lo consente. Se la risposta cambia, cambia il gateway, e con lui il
   checkout.
3. **Il portale fornitori è nostro o è un'app di terze parti?** Questo piano
   dice nostro, perché la logica di accettazione slot con documenti in scadenza
   non esiste in commercio nella forma che ci serve. Se si trova qualcosa che
   la copre, si risparmiano sei settimane e vale la pena guardarla prima.

---

## 9. Costi tech ricorrenti, primo anno

| Voce | Da quando | Quanto |
|---|---|---|
| Hosting statico (Vercel/Netlify, piano gratuito) | Q1a | 0 € |
| Servizio di moduli (Web3Forms/Formspree, piano gratuito) | Q1a | 0 € fino a qualche centinaio di invii al mese |
| Shopify Basic | Q1b | ~29-39 €/mese |
| Commissioni Shopify Payments | Q1 | ~1,5-2% + 0,25 € per transazione |
| App fatturazione elettronica | Q1 | ~10-25 €/mese |
| Dominio | Q1 | ~15 €/anno |
| Vercel Pro (serve dal server-side) | Q2 | ~20 €/mese |
| PostgreSQL gestito | Q2 | 0 € sul piano gratuito, poi ~25 €/mese |
| Storage documenti partner | Q2 | pochi euro/mese |
| WhatsApp Business API | Q2 | a conversazione, variabile |
| Monitoraggio errori | Q4 | 0 € sul piano gratuito |

Ordine di grandezza: **sotto i 100 €/mese fino al Q2**, sotto i 200 €/mese a
fine anno, commissioni escluse. Le cifre vanno riverificate al momento della
sottoscrizione.

---

## 10. Cosa questo piano non fa, di proposito

- **Native app.** Rientra solo se i dati d'uso la chiedono, cioè se una quota
  significativa di clienti torna più di due volte l'anno.
- **Pricing predittivo o "AI".** Le regole stagionali scritte a mano bastano
  per il primo anno, e sono spiegabili a un partner che chiede perché il suo
  servizio costa diverso ad agosto.
- **Checkout su dominio proprio.** Richiede Shopify Plus. Non vale la
  differenza di prezzo per un dettaglio di URL.
- **Marketplace multi-vendor con onboarding self-service.** I partner li
  seleziona una persona, ed è il punto: la selezione è il prodotto.

---

## 11. Il rischio principale, detto una volta sola

Il collo di bottiglia di tutto il piano non è tecnico: è che **un socio e mezzo
scrivano tutto questo in dodici mesi mentre gli stessi due seguono anche il
resto**. Il Q1 è dimensionato per essere finito da una persona in poche
settimane proprio per questo. Il Q2 è il primo trimestre che non lo è.

Prima di aprire il Q2, la domanda da farsi è una: il portale fornitori lo
scriviamo noi, o lo compriamo e ci mettiamo sopra solo le notifiche? La
risposta onesta dipende da quanti partner ci sono a quel punto, e quella cifra
la conosce il socio operations, non il socio tech.
