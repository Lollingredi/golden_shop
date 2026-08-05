# GOLDEN — panoramica del sito

Cosa è diventato il progetto fino a oggi: cosa vende, come è organizzato, che
aspetto ha e a che punto è. È il documento da dare in mano a un socio, a un
partner o a chi entra adesso — non spiega come funziona il codice, per quello
ci sono `README.md` e `FUNZIONI.md`.

---

## 1. Cos'è Golden

Un marketplace italiano di esperienze, gestito dal gruppo **MarcasEnt**.

Non vende noleggi, matrimoni e cene. Vende **il momento in cui una cosa viene
consegnata a qualcuno**: la faccia di chi vede arrivare la macchina, gli sposi
che escono dal ricevimento, il tavolo apparecchiato che non hanno dovuto
preparare loro.

È una distinzione commerciale, non poetica. Un noleggio auto si compra al
prezzo più basso: c'è sempre qualcuno con la stessa vettura a cento euro in
meno. Una rivelazione con telo nero, fotografo e brindisi non si confronta con
niente, perché nessun altro la mette insieme. Il noleggio è la merce; il
momento è il prodotto.

Da qui discende tutto il resto del sito.

### Cosa promette, in concreto

Tre cose ripetute ovunque, perché sono le tre obiezioni di chi compra:

- **Partner verificati.** Documenti, coperture e mezzo controllati prima che
  il nome del cliente finisca su un contratto.
- **Un referente unico.** Una persona sola, raggiungibile per tutta la
  giornata, che tiene insieme i fornitori.
- **Prezzi che sono un punto di partenza reale, non un'esca.** Cambiano con
  data, città e formula, e il sito lo dice invece di nasconderlo.

---

## 2. Il modello: base + add-on + pacchetti

È la spina dorsale commerciale del sito, ed è quello che lo rende diverso da
un catalogo di noleggi.

```
BASE            l'auto, la barca, la villa, la cena
  +
ADD-ON          i servizi che trasformano la base in un ricordo
  =
ESPERIENZA      venduta su misura, o preconfezionata in un pacchetto
```

### La base

Oggi sono le **sei vetture** del servizio noleggio, da 1.200 a 3.200 euro al
giorno. Nella pagina compaiono deliberatamente **dopo** i pacchetti e dopo il
configuratore: chi arriva sceglie prima che effetto vuole fare, poi su cosa.

### Gli otto add-on

| Add-on | Cosa contiene | Prezzo |
|---|---|---|
| **The Reveal** | Telo + fiocco | 390 € |
| **Memories** | Fotografo | 590 € |
| **Cinematic** | Fotografo + video | 1.200 € |
| **Romance** | Fiori | 180 € |
| **Party** | Palloncini | 150 € |
| **Celebration** | Bottiglia + calici | 220 € |
| **Road Trip** | Percorso panoramico | 340 € |
| **Birthday** | Torta + candeline | 160 € |

Ognuno ha un nome commerciale proprio — si vende *The Reveal*, non "telo e
fiocco". Memories e Cinematic si escludono a vicenda: il secondo è il primo
con il video.

### I quattro pacchetti

Combinazioni che funzionano, con la vettura a scelta e il prezzo già chiuso.
Costano il **15% in meno** degli stessi servizi presi uno per uno.

| Pacchetto | Composizione | Da |
|---|---|---|
| **The Big Reveal** | Auto + The Reveal + Memories | 2.033 € |
| **Romantic Surprise** | Auto + Romance + Celebration + Memories | 2.042 € |
| **VIP Birthday** | Auto + Party + Birthday + Memories | 1.965 € |
| **Ultimate Experience** | Auto + Reveal + Romance + Party + Celebration + Memories | 2.501 € |

I prezzi partono dalla vettura meno cara e si alzano cambiando base. *The Big
Reveal* è marcato come il più richiesto.

### Perché il modello vale più del noleggio

Due ragioni.

**Il margine sta negli add-on.** L'auto ha un costo fisso e un margine
compresso dal partner. Il fotografo, il telo e i fiori si comprano a listino e
si vendono dentro un'esperienza che non ha confronti di prezzo.

**Si applica a qualsiasi categoria.** Cambia la base, restano gli add-on:
barca + champagne al tramonto, hotel + camera allestita a fiori, cena +
musica dal vivo, villa + fotografo. È il motivo per cui vale la pena
costruirlo bene una volta sola. La pagina noleggio lo dice esplicitamente in
fondo, con una fascia dedicata.

---

## 3. Il catalogo

Quindici proposte su tre servizi.

### Noleggio auto — sei vetture, 1.200–3.200 €

Miura P400 e Miura SV in formula concorso, Urus SE, Ferrari Portofino in
formula serata (18:00–02:00), Murciélago LP670 SV, e una Rolls-Royce Dawn con
transfer da jet privato — quest'ultima l'unica pensata attorno a un vincolo
logistico invece che a una vettura: l'auto aspetta sottobordo, non al
parcheggio, e l'handler dell'aeroporto è coordinato da Golden.

Città: Milano, Modena, Brescia, Linate e Malpensa.

### Wedding planner — cinque proposte, 1.600–6.500 €

Auto per la cerimonia, corteo da tre a otto vetture, location e allestimento
in dimore storiche, servizio fotografico e video, e la **Celebrity Experience
per gli sposi** — la rivelazione all'uscita dal ricevimento.

### Cena sushi in delivery — quattro proposte, 190–1.200 €

Omakase per due con champagne, sashimi selection con Franciacorta pas dosé,
sushi party per sei con magnum, e l'itamae che viene a preparare a domicilio
per un massimo di otto persone.

È il servizio con lo scarto di prezzo più grande rispetto agli altri due, e
serve da porta d'ingresso: chi non spende 2.000 euro per una macchina può
spenderne 280 per una cena e conoscere il marchio.

---

## 4. Le pagine

| Percorso | Cosa fa |
|---|---|
| `/` | Apertura, i tre servizi, la Celebrity Experience, il catalogo in evidenza, come funziona |
| `/collections` | Tutte e quindici le proposte, raggruppate per servizio |
| `/collections/noleggio-auto` | **Pagina dedicata**, costruita sull'esperienza |
| `/collections/wedding-planner` | Servizio due, resa standard |
| `/collections/sushi-delivery` | Servizio tre, resa standard |
| `/products/[handle]` | Quindici schede prodotto |
| `/account/login` · `/account` | Accesso e area personale |
| `/checkout` | Conferma della richiesta in tre passi |

I percorsi ricalcano di proposito quelli di Shopify (`/collections/…`,
`/products/…`): quando si migra, gli indirizzi già indicizzati non cambiano.

### La pagina noleggio, in dettaglio

È l'unica riscritta da zero sul modello dell'esperienza, e l'ordine delle
sezioni è il messaggio:

1. **Apertura** — «Non è l'auto. È la faccia di chi la vede arrivare.»
2. **Come funziona** — una base, otto add-on, un referente solo
3. **I quattro pacchetti** — per chi sa già che effetto vuole fare
4. **Il configuratore** — per chi se la costruisce da sé
5. **Le vetture** — «Le macchine, per chi le vuole guardare»
6. **Non solo auto** — lo stesso modello sulle altre categorie
7. **Parla con un concierge**

Le macchine sono al quinto posto. Su un sito di noleggio sarebbero al primo:
è esattamente il punto.

### Il configuratore

Il pezzo interattivo del sito. Si parte da un pacchetto o da zero, si
accendono e spengono gli add-on, si sceglie la vettura per ultima, e il totale
si aggiorna mentre si sceglie — con lo sconto pacchetto scorporato a vista
quando è applicato. Da lì si aggiunge al carrello, si chiede un preventivo o
si chiama un concierge.

---

## 5. Come si compra

Il percorso è pensato per finire in una telefonata, non in un pagamento.

```
catalogo  →  pacchetto o configuratore  →  carrello  →  conferma
                                                            ↓
                                       telefonata di verifica disponibilità
                                                            ↓
                                            acconto 30%  →  saldo al partner
```

Il checkout **non chiede la carta**. Golden vende una giornata che dipende
dalla disponibilità di un partner: incassare prima di aver verificato la data
produce rimborsi e clienti arrabbiati. Quindi parte una richiesta, arriva una
telefonata, e solo dopo il link per l'acconto del 30%. Il saldo si regola con
il partner il giorno del servizio.

**"Parla con un concierge"** è presente in nove punti del sito — footer, popup
in homepage, fine catalogo, fine della schermata add-on, carrello, checkout,
esito, area personale, configuratore — e ogni pulsante passa al concierge il
contesto da cui è partita la richiesta. Chi risponde sa già cosa stavate
guardando.

---

## 6. Come si presenta

### I colori

Fondo blu-nero quasi ovunque, oro champagne come unico accento, avorio per il
respiro.

| | | |
|---|---|---|
| `#090B22` | **Ink** | fondo dominante |
| `#141833` | **Ink 800** | superfici sollevate: schede, pannelli |
| `#E7D9B4` | **Champagne** | accento su scuro, pulsanti principali |
| `#F7F1E3` | **Avorio** | fondo chiaro alternativo, una sezione per pagina |
| `#8A7345` | **Oro testo** | accento leggibile su bianco |

Nessun colore di stato, nessun rosso, nessun verde. Una tavolozza sola.

### La tipografia

**Noto Serif Display** per i titoli, **Jost** per tutto il resto. I
sopratitoli sono in maiuscolo a 12px con tracciatura molto larga, in
champagne: sono la firma grafica che si ripete in ogni sezione.

### Il movimento

Comparsa allo scroll, una volta sola, 0,55 secondi con ease-out. Le griglie
entrano a scalare, un elemento ogni 0,08 secondi. Le schede si alzano di
quattro pixel al passaggio del mouse. Il carrello entra da destra in 0,35
secondi.

Tutto rispetta `prefers-reduced-motion`: chi ha chiesto al sistema operativo
di non animare le interfacce vede il sito fermo, non una versione rotta.

### Il tono di voce

Italiano, discorsivo, in seconda persona plurale. Frasi brevi. Nessun
superlativo, nessun punto esclamativo, nessuna emoji.

La regola non scritta è che ogni frase deve contenere un fatto verificabile o
un'ammissione. «200 km inclusi», «attesa fino a 90 minuti», «richiede patente
da almeno cinque anni», «serve un piano di lavoro libero di almeno un metro e
mezzo». Dove non c'è un fatto, c'è un limite dichiarato: «Nessun pagamento in
questa fase», «Prezzo indicativo. Varia con data, città e formula».

Vale anche per le immagini mancanti: dove non c'è una fotografia, il sito
mostra un riquadro a righe che dice esplicitamente cosa manca, invece di
riempire con uno stock sbagliato.

---

## 7. Cosa c'è sotto

Next.js con App Router, Tailwind e framer-motion. Il sito è generato in HTML
statico: si pubblica ovunque, non ha bisogno di un server.

Il catalogo è un file TypeScript, non un database, ma le sue forme sono già
quelle della Storefront API di Shopify — i prezzi sono stringhe con valuta
come li restituisce Shopify, gli identificativi sono già GID, i prodotti hanno
già varianti e metafield. Migrare significa sostituire il corpo di cinque
funzioni, non riscrivere le pagine.

Lo stesso vale per il modello esperienza: gli add-on sono già nella forma
delle *line item properties*, i pacchetti in quella dei prodotti bundle. Sono
le due strade che Shopify offre, e il sito è pronto per entrambe.

---

## 8. A che punto siamo

**Funziona davvero:** navigazione completa, catalogo, schede prodotto,
configuratore con calcolo dei prezzi, carrello a scorrimento con quantità e
add-on, area personale con storico richieste, checkout in tre passi, pannello
concierge.

**È simulato:** l'accesso non verifica niente, il carrello vive solo sul
dispositivo di chi naviga, nessuna richiesta viene inviata, gli stati delle
richieste non si aggiornano, telefono e WhatsApp sono numeri segnaposto.

**Manca:** le fotografie. È il vuoto più serio. Il servizio firma — la
rivelazione con telo nero e nastro rosso — non ha **nessuna** immagine, e i
quattro pacchetti riciclano foto di altri prodotti. Ventitré immagini da
generare o scattare, con i prompt già pronti in `PROMPT-IMMAGINI.md`.

C'è anche una questione da chiudere prima di pubblicare: nelle foto attuali i
marchi Lamborghini sono ben leggibili — logo, scritta "URUS SE", muro "AD
PERSONAM". Vanno sostituite o autorizzate.

### Nell'ordine, cosa farei

1. **Le sei immagini della rivelazione e dei pacchetti.** Senza, la pagina
   noleggio racconta a parole il servizio che la regge.
2. **Numeri di telefono e WhatsApp veri**, e l'endpoint per la richiamata.
3. **Backend**: Shopify per catalogo, carrello e checkout; Customer Account
   API per l'accesso.
4. **Estendere il modello base + add-on** a wedding e sushi, che oggi hanno la
   resa standard.

---

*GOLDEN è un marchio del gruppo gestionale MarcasEnt.*
