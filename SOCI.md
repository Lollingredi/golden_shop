# GOLDEN — a che punto siamo

Documento per chi non scrive codice: cosa stiamo costruendo, cosa si può già
vedere, cosa manca e quali decisioni servono da voi. Sostituisce
`PANORAMICA.md`.

---

## 1. Cosa vendiamo, in una frase

Golden non vende noleggi, matrimoni e cene. Vende **il momento in cui una cosa
viene consegnata a qualcuno**.

Non è una frase da brochure, è una scelta commerciale. Un noleggio auto si
compra al prezzo più basso: c'è sempre qualcuno con la stessa vettura a cento
euro in meno, e su quel confronto si perde sempre. Una rivelazione con telo
nero, fotografo e brindisi non si confronta con niente, perché nessun altro la
mette insieme.

**Il noleggio è la merce. Il momento è il prodotto.** Tutto il sito discende
da qui.

---

## 2. Come facciamo margine

Il modello è tre pezzi:

> **BASE** (l'auto) **+ ADD-ON** (i servizi) **= ESPERIENZA**

**La base** sono le sei vetture, da 1.200 a 3.200 euro al giorno. È la parte
con il margine più compresso, perché il prezzo lo fa il partner.

**Gli add-on** sono otto servizi che si comprano a listino e si vendono dentro
un'esperienza che non ha confronti di prezzo:

| Add-on | Prezzo | Add-on | Prezzo |
|---|---|---|---|
| The Reveal — telo e fiocco | 390 € | Party — palloncini | 150 € |
| Memories — fotografo | 590 € | Celebration — bottiglia e calici | 220 € |
| Cinematic — fotografo e video | 1.200 € | Road Trip — percorso panoramico | 340 € |
| Romance — fiori | 180 € | Birthday — torta e candeline | 160 € |

**I pacchetti** sono quattro combinazioni già pronte, con la vettura a scelta e
il prezzo chiuso. Costano il 15% in meno degli stessi servizi presi uno per
uno — lo sconto serve a spostare le persone dal noleggio secco al pacchetto,
che è dove sta il margine.

| Pacchetto | Cosa contiene | Da |
|---|---|---|
| **The Big Reveal** | Auto + rivelazione + fotografo | 2.033 € |
| **Romantic Surprise** | Auto + fiori + brindisi + fotografo | 2.042 € |
| **VIP Birthday** | Auto + palloncini + torta + fotografo | 1.965 € |
| **Ultimate Experience** | Tutto insieme | 2.501 € |

### Da adesso il prezzo non è più uno solo

Fino a ieri un'esperienza costava la stessa cifra ovunque e sempre. Adesso il
sito la calcola su tre cose:

| | Cosa cambia il prezzo |
|---|---|
| **Dove** | Milano e Nord · Roma e Centro · Costiera, Isole e Resort |
| **Quando** | ferragosto, alta stagione estiva, festività di fine anno |
| **Con quanto anticipo** | sotto i 3 giorni · 3-7 · 7-30 · 30-90 · oltre 90 |

Con i coefficienti provvisori che ho messo io, un Urus con The Big Reveal
(listino 2.180 €) diventa:

| | |
|---|---|
| Milano, novembre, con tre mesi d'anticipo | **1.980 €** |
| Milano, agosto, prenotato due giorni prima | **2.410 €** |
| Porto Cervo, novembre, tre mesi prima | **2.270 €** |
| Porto Cervo, ferragosto, tre mesi prima | **2.860 €** |
| Porto Cervo, ferragosto, cinque giorni prima | **3.260 €** |

Sono 1.280 euro di differenza sullo stesso identico servizio. È il margine che
oggi stiamo lasciando sul tavolo ogni volta che vendiamo Porto Cervo ad agosto
al prezzo di Milano a novembre.

Due conseguenze pratiche:

**Il cliente vede perché.** Nel riepilogo compaiono i coefficienti applicati,
uno per riga. Non è un prezzo che cambia senza spiegazione: è un listino
stagionale come quello di un hotel, e va comunicato così.

**Chi prenota prima paga meno.** Sopra i novanta giorni il prezzo scende del
5%: una prenotazione lontana è capacità venduta in anticipo, e vale la pena
premiarla. Va comunicata come tariffa ("prenotate entro maggio"), mai come
sconto su un prezzo pieno che nessuno paga — su questo la normativa è precisa.

### E la commissione cambia con la zona

Il documento del catalogo servizi fissa la commissione d'intermediazione al
15-20% al nord e al centro, e al 20-25% su Costiera, Isole e Resort. Da adesso
il sito la calcola **nello stesso momento in cui calcola il prezzo**: ogni
riga sa quanto va al fornitore e quanto resta a noi, prima ancora che l'ordine
esista.

È la differenza fra sapere il margine a fine mese e saperlo mentre si vende.

### La cancellazione segue la stessa curva

Se il prezzo sale avvicinandosi alla data, è perché avvicinandosi alla data i
costi si bloccano — l'equipaggio è impegnato, il mezzo è tolto dal mercato, il
fornitore ha già detto di no a qualcun altro. Quegli stessi costi sono quelli
che non si recuperano se il cliente disdice.

Quindi la quota trattenuta usa le stesse fasce: 100% sotto i tre giorni, 75%
fino a sette, 50% fino a trenta, 25% fino a novanta, 10% oltre. **Sono numeri
provvisori come gli altri**, ma la forma è quella giusta e il codice non
permette che le due curve si contraddicano.

### La cosa che vale più di tutto il resto

**Il modello si stacca dalle auto.** Cambia la base, restano gli add-on:
barca + champagne al tramonto, hotel + camera allestita a fiori, cena + musica
dal vivo, villa + fotografo. È il motivo per cui vale la pena costruirlo bene
una volta sola: è la stessa macchina commerciale su qualunque categoria
decidiate di entrare.

---

## 3. Cosa può fare un cliente, oggi

Ci sono due strade, e chi arriva sceglie da solo quale prendere:

```
IL PREVENTIVO   catalogo → modulo di richiesta
                → LA RICHIESTA ARRIVA A NOI → richiamiamo noi

IL CARRELLO     catalogo → pacchetto o configuratore → carrello
                → conferma dati → pagamento
```

Dentro tutt'e due il cliente può: **comporre la sua esperienza** con un
configuratore che aggiorna il prezzo mentre sceglie — e che adesso chiede
anche **dove e quando**, perché senza quei due dati il prezzo è un listino e
non un preventivo — **salvare tutto in un
account** con le sue richieste e i suoi dati, e **parlare con un concierge**
da tredici punti diversi del sito — e chi risponde vede già da dove è partita
la richiesta.

### La decisione che dovete prendere sulla seconda strada

Il carrello oggi finisce con **"si paga tutto adesso"**, e non è la scelta
raccontata nelle prime versioni del progetto (acconto del 30%, saldo al
partner). L'acconto è stato tolto.

Il punto è che il pagamento **non funziona comunque**: il modulo carta è
finto, e per incassare davvero serve Shopify, che serve la partita IVA, che
serve la società. Prima di pubblicare, quindi, le opzioni sono due:

1. **Riportare il carrello a richiesta** — finisce come la prima strada, si
   chiude al telefono, e il pagamento torna quando c'è la società. È il
   consiglio.
2. **Non pubblicare** finché non si incassa davvero.

Quello che non si può fare è pubblicare un sito che annuncia un pagamento che
non esiste.

---

## 4. Il pezzo di cui vado più fiero

Sulla pagina del noleggio le automobili compaiono **al quinto posto**. Prima
ci sono la promessa, i pacchetti e il configuratore. Su un sito di noleggio le
auto sarebbero al primo posto: metterle in fondo è esattamente il punto.

Il titolo dice: *«Non è l'auto. È la faccia di chi la vede arrivare.»*

---

## 5. Cosa è vero e cosa è ancora una demo

Il sito si naviga per intero, su computer e su telefono. Ma:

**Funziona davvero:** tutte le pagine, il catalogo, il configuratore con i
calcoli, il carrello, l'area personale, il pannello concierge. Potete usarlo
per far vedere il progetto a un partner o a un investitore.

**Da adesso funziona anche l'invio.** Era il difetto più grave: un cliente
compilava il modulo, leggeva "vi ricontattiamo entro poche ore", e la
richiesta non arrivava a nessuno. Adesso arriva per email — e se per qualche
motivo non parte, **il sito lo dice al cliente** invece di fingere, e gli dà
il numero. Manca solo l'account gratuito sul servizio che inoltra le email:
cinque minuti, nessun costo.

**Il motore di prezzo invece è vero, i suoi numeri no.** Il calcolo funziona,
è verificato da trentatré prove automatiche, e vale già su tutto il
configuratore. Ma i coefficienti di zona, stagione e anticipo li ho messi io:
finché non li confermate, il sito scrive "prezzo indicativo" accanto a ogni
totale e non promette una cifra definitiva. Il giorno che arrivano i numeri
veri si cambia un file e una spia — e la frase sparisce da sola.

**È ancora finto:** l'accesso non verifica niente (entra chiunque), il
carrello vive solo sul dispositivo di chi naviga, il pagamento non incassa
nulla, e i numeri di telefono e WhatsApp sono ancora segnaposto — finché lo
sono, il sito non li mostra da nessuna parte, per non far chiamare un numero
inesistente.

Tradotto: **si può già raccogliere una richiesta vera, non ancora incassare.**

---

## 6. Cosa manca per aprire

### Le fotografie non sono più un problema

Le 23 immagini che mancavano sono state prodotte e sono sul sito: la
rivelazione con telo nero e nastro rosso, i quattro pacchetti, gli otto
add-on, il sushi, la location, il wedding. Il servizio firma adesso si vede.

### Una questione da chiudere prima di pubblicare

Nelle fotografie d'archivio delle vetture i marchi Lamborghini sono ben
leggibili: il logo, la scritta "URUS SE", il muro "AD PERSONAM". Vanno
sostituite o autorizzate. Non è una preferenza estetica.

### Quello che serve per pubblicare, adesso

Nessuna di queste cose costa denaro o richiede la società:

1. **Un numero di telefono** e chi risponde.
2. **Un account gratuito** sul servizio che inoltra i moduli, e una casella
   che qualcuno legge.
3. **La decisione sul carrello** (vedi § 3): richiesta o pagamento.
4. **Le fotografie con i marchi** sostituite.
5. **Pagine legali** e banner dei cookie.
6. Pubblicazione: l'hosting è gratuito.

Cinque o sei giornate di lavoro in tutto, e da lì il sito raccoglie richieste
vere mentre voi decidete la forma societaria.

### Il backend, dopo

Per **incassare** serve collegare Shopify — catalogo, carrello, pagamenti,
account clienti — e Shopify per pagare vuole partita IVA, IBAN aziendale e il
documento di un legale rappresentante. Cioè la società.

Il sito è già costruito perché quel passaggio tocchi poche righe e non le
pagine: è stata la scelta più costosa in fase di progetto ed è quella che farà
risparmiare di più. Il piano completo dei dodici mesi, front-end e back-end,
sta in `PIANO-TECH.md`.

---

## 7. Le decisioni che servono da voi

1. **Chi risponde al telefono, e con che numero.** Tutto il sito porta lì, ed
   è la cosa che blocca la pubblicazione.
2. **Dove devono arrivare le richieste** — quale casella, e chi la guarda.
3. **Il carrello: richiesta o pagamento?** Vedi § 3. È l'unica decisione con
   una conseguenza legale, non solo commerciale.
4. **Gli orari veri** dell'assistenza (oggi scritto lunedì–sabato 9–20).
5. **I prezzi degli add-on.** Quelli in tabella sono plausibili ma li ho messi
   io: vanno confermati con i fornitori.
6. **Lo sconto pacchetto al 15%** — è la leva che sposta le persone dal
   noleggio secco al pacchetto. Alzarlo o abbassarlo si fa in un secondo.
7. **I coefficienti di zona, stagione e anticipo.** Sono la decisione
   commerciale più pesante di tutto l'elenco: quanto costa in più la Costiera,
   quanto ferragosto, quanto prenotare sotto data. Quelli che trovate al § 2
   sono plausibili e sono miei. Li conosce chi tratta con i fornitori.
8. **La politica di cancellazione.** Va scritta e approvata: è l'unica parte
   del sistema che restituisce denaro, e il cliente la accetta al pagamento.
9. **Una domanda al gestore dei pagamenti, prima di tutto il resto.** Chi
   incassa oggi per erogare fra sessanta giorni è, per chi processa le carte,
   un rischio: la risposta tipica è trattenere una quota degli incassi per
   qualche mese. Se ci applicassero una trattenuta del 20%, cambierebbe il
   piano di cassa molto più di qualunque scelta tecnica — e il motivo per cui
   incassiamo tutto subito è proprio avere la liquidità per i fornitori.

---

## 8. Le due cose che farei subito, se decidessi io

**Estendere il modello ai matrimoni.** Oggi base + add-on ce l'ha solo il
noleggio. Il matrimonio è la categoria dove gli add-on rendono di più — chi
sta spendendo ventimila euro non discute quattrocento euro di rivelazione — e
la pagina è ferma alla resa standard.

**Usare il sushi come porta d'ingresso.** Chi non spende duemila euro per una
macchina ne spende duecentottanta per una cena, e conosce il marchio. Oggi è
solo il terzo servizio in elenco: non c'è niente nel percorso che lo usi per
farsi conoscere e poi risalire.

**Chiudere i coefficienti entro due settimane.** Il motore c'è e funziona; a
girare a vuoto sono i numeri. Ogni settimana che passa è una settimana in cui
il sito vende agosto in Costiera al prezzo di novembre a Milano — e quella
differenza, sui volumi che ci aspettiamo, vale più di qualunque altra cosa in
questo elenco.

---

*GOLDEN è un marchio del gruppo gestionale MarcasEnt.*
