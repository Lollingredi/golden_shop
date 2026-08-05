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

### La cosa che vale più di tutto il resto

**Il modello si stacca dalle auto.** Cambia la base, restano gli add-on:
barca + champagne al tramonto, hotel + camera allestita a fiori, cena + musica
dal vivo, villa + fotografo. È il motivo per cui vale la pena costruirlo bene
una volta sola: è la stessa macchina commerciale su qualunque categoria
decidiate di entrare.

---

## 3. Cosa può fare un cliente, oggi

Il percorso è pensato per **finire in una telefonata, non in un pagamento**:

```
guarda il catalogo → sceglie un pacchetto (o se lo compone)
→ carrello → conferma i suoi dati
→ LO CHIAMIAMO NOI per verificare la disponibilità
→ solo allora paga l'acconto del 30% → il saldo al partner, il giorno stesso
```

**Perché non chiediamo la carta subito.** Vendiamo una giornata che dipende
dalla disponibilità di un partner. Incassare prima di aver verificato la data
produce due cose, entrambe brutte: rimborsi e clienti arrabbiati.

Dentro questo percorso il cliente può: **comporre la sua esperienza** con un
configuratore che aggiorna il prezzo mentre sceglie, **salvare tutto in un
account** con le sue richieste e i suoi dati, e **parlare con un concierge**
da nove punti diversi del sito — e chi risponde vede già da dove è partita la
richiesta.

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
calcoli, il carrello, l'area personale, il checkout, il pannello concierge.
Potete usarlo per far vedere il progetto a un partner o a un investitore.

**È ancora finto:** l'accesso non verifica niente (entra chiunque), il
carrello vive solo sul dispositivo di chi naviga, **nessuna richiesta viene
davvero inviata a noi**, e i numeri di telefono e WhatsApp sono segnaposto.

Tradotto: non si può ancora prendere una prenotazione vera.

---

## 6. Cosa manca per aprire

### Le fotografie — è il buco più serio

**Il servizio firma non ha nessuna immagine.** La rivelazione con telo nero e
nastro rosso, che è quello che ci distingue, oggi è raccontata solo a parole.
E i quattro pacchetti riciclano foto di altri prodotti: il pacchetto compleanno
mostra uno showroom vuoto.

Servono 23 immagini in tutto, ma **con le prime sei il sito cambia di
categoria**. I testi per generarle o per commissionarle a un fotografo sono
già pronti (`PROMPT-IMMAGINI.md`).

### Una questione da chiudere prima di pubblicare

Nelle fotografie attuali i marchi Lamborghini sono ben leggibili: il logo, la
scritta "URUS SE", il muro "AD PERSONAM". Vanno sostituite o autorizzate. Non
è una preferenza estetica.

### Il backend

Per prendere prenotazioni vere serve collegare Shopify (catalogo, carrello,
pagamenti, account clienti) e un indirizzo dove far arrivare le richieste. Il
sito è già costruito perché quel passaggio tocchi poche righe e non le pagine:
è stata la scelta più costosa in fase di progetto ed è quella che farà
risparmiare di più adesso.

---

## 7. Le decisioni che servono da voi

1. **Chi risponde al telefono, e con che numero.** Tutto il sito porta lì.
2. **Gli orari veri** dell'assistenza (oggi scritto lunedì–sabato 9–20).
3. **I prezzi degli add-on.** Quelli in tabella sono plausibili ma li ho messi
   io: vanno confermati con i fornitori.
4. **Lo sconto pacchetto al 15%** — è la leva che sposta le persone dal
   noleggio secco al pacchetto. Alzarlo o abbassarlo si fa in un secondo.
5. **L'acconto al 30%.** Idem.
6. **Fotografie: generate o scattate?** Cambia il costo e il tempo, non il
   risultato sul sito.

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

---

*GOLDEN è un marchio del gruppo gestionale MarcasEnt.*
