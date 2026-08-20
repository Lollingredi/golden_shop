# GOLDEN — il catalogo servizi contro il sito che esiste

Confronto fra *GOLDEN – Catalogo Servizi e Modulo Add-Ons Esclusivi* (v2.0) e
quello che il repository contiene davvero oggi: `lib/catalog.ts`,
`lib/experiences.ts`, `lib/store.ts`, e i trimestri di `PIANO-TECH.md`.

Non è una lista di cose da aggiungere. È l'elenco dei punti in cui il
catalogo commerciale e il modello dati del sito **non parlano la stessa
lingua**, e di cosa costa farli combaciare.

Per com'è fatto il sito oggi c'è `TECNICO.md`. Per il piano a dodici mesi,
`PIANO-TECH.md`. Qui si dice solo dove il catalogo li smentisce.

---

## 1. In due minuti

Il documento descrive **3 settori, 12 servizi, circa 57 add-on** — 30 a
prezzo fisso e 27 a prezzo variabile.

Il sito ha **3 collezioni, 15 prodotti, 8 add-on**, tutti a prezzo fisso,
tutti agganciati alla sola pagina noleggio.

La distanza non è di volume. Il codice sa vendere *un prodotto a prezzo
fisso con add-on a prezzo fisso*, ed è l'unica cosa che sa vendere. Il
catalogo chiede tre assi di prezzo che nel codice non esistono: **la scelta
guidata, la durata, la geografia**.

Sovrapposizione reale: **1 servizio su 12** (Supercar Delivery) e **4 add-on
su 57**.

---

## 2. Le tre dimensioni di prezzo che il codice non ha

### La scelta guidata

`Addon` in `experiences.ts` ha `price: Money`. Uno, obbligatorio, fisso.
L'intera macro-categoria "Add-Ons a Prezzo Variabile / Personalizzabile"
della sezione 1 non ha una forma in cui esistere.

E c'è un conflitto diretto con una decisione già presa: `TECNICO.md` § 3 dice
"non c'è più l'acconto, si incassa tutto subito". Un checkout che incassa
tutto subito non può contenere *Estensione oraria notturna: tariffa calcolata
su base effettiva*.

Ma "variabile" nel documento significa due cose diverse, che costano
diversamente:

| | Esempi | Come si risolve | Costo |
|---|---|---|---|
| **Scaglioni** | beverage (Prosecco → Franciacorta → Champagne Prestige), categoria talent, percorsi degustazione, menu high-end | Varianti Shopify dell'add-on: prezzo noto al carrello | basso |
| **Preventivo vero** | ore notturne, drop-off in altra città, numero bodyguard, rotta elicottero su misura, approvvigionamento cantina | DraftOrder o richiesta: non entra in un checkout self-service | alto |

Su 27 add-on variabili, circa 15 sono scaglioni e 12 preventivo vero. Il
catalogo va quindi **a due velocità**: servizi comprabili online e servizi su
richiesta. Shopify lo fa nativamente ed è molto più economico che forzare
tutto dentro una cassa.

### La durata

NCC a disposizione oraria, charter yacht giornaliero o plurigiornaliero,
maggiordomo H24 con turnazione, ore di personal shopping, numero di operatori
di scorta. Sono cinque servizi su dodici dove **il prezzo è una quantità per
un'unità di tempo o di persona**.

Oggi un prodotto di `catalog.ts` ha un prezzo piatto e due varianti sole,
*Standard* e *Con Celebrity Experience*, generate da `makeProduct`. Nessun
asse durata, da nessuna parte.

Il commento in cima a `experiences.ts` dice che il modello non è legato alle
auto — "barca + champagne, hotel + fiori" — ed è vero per lo **strato
add-on**. Non è vero per la base.

### La geografia

Il sito non ha nessuna nozione di luogo. Non esiste un campo `cluster`,
`citta` o `copertura` su prodotto o collezione. `citta` compare solo come
testo libero su `Account` e `Richiesta` in `store.ts`.

Vedi § 4.

---

## 3. Sezione 1 — la politica degli add-on

Quello che il documento dà per acquisito e che nel codice va costruito:

| Il catalogo dice | Nel codice | Lavoro |
|---|---|---|
| Add-on divisi in due macro-categorie | `Addon` ha un solo `price` | Aggiungere `tipo: "fisso" \| "scaglioni" \| "preventivo"` e, per gli scaglioni, una lista di livelli con prezzo |
| "Scelta guidata cliente" | Il configuratore ha caselle on/off | Un secondo livello di UI dentro la card dell'add-on: radio sui livelli. `ExperienceBuilder` regge, ma va esteso |
| Configurazione dinamica per ogni servizio | Gli 8 add-on sono gli stessi per tutti | Serve una relazione servizio ↔ add-on ammessi. Oggi è implicita: gli add-on esistono solo sulla pagina noleggio |

La terza riga è la meno visibile e la più strutturale. Il documento assegna a
**ogni servizio i suoi add-on**: il seggiolino Isofix ha senso sull'NCC e non
sull'elicottero, il kit snorkeling solo sullo yacht. Serve un campo
`serviziAmmessi` sull'add-on, o una lista di `addonIds` sulla collezione.

---

## 4. Sezione 1 — la matrice geografica

Tre cluster, con commissione d'intermediazione 15-20% / 15-20% / 20-25%.
Nel repository non ce n'è traccia in nessun file.

**Cosa manca, in ordine di gravità:**

1. **La commissione non è tracciata.** `PIANO-TECH.md` mette le provvigioni
   in Q3, ma sono quelle degli *hotel partner* che portano clienti — un'altra
   cosa. La commissione GOLDEN sul fornitore non compare in nessun trimestre.
   Il posto giusto è la tabella `partner` del Q2: due colonne, `cluster` e
   `commissione`, costo quasi nullo se si mettono subito.
2. **Le tariffe stagionali dinamiche** del cluster Costiera/Isole sono
   esattamente il motore di regole del Q3 (`PIANO-TECH.md` § 6). Qui la
   notizia è buona: **la matrice della sezione 1 è già la specifica di input
   di quel motore**. Cluster e stagione sono due delle quattro variabili che
   il piano prevede. Si può copiare così com'è.
3. **"Consegne veloci entro 2 ore, disponibilità flotta continua"** è una
   promessa incompatibile con il Q1, dove la disponibilità la conferma il
   concierge "entro poche ore". O si toglie dalla comunicazione, o si
   anticipa un pezzo di disponibilità reale. Il piano dichiara già questo
   rischio (§ 4, *Disponibilità in Q1*): il catalogo lo aggrava.
4. **Ibiza è nella matrice.** È estero: valuta, IVA OSS, fornitori non
   italiani, fatturazione fuori SdI. Nessun trimestre del piano lo contempla.
   O si dichiara fuori perimetro per il primo anno, o cambia il Q1b.

Da notare: le note operative dei cluster (permessi ZTL, accessi VIP
aeroporti, eliporti, logistica marina) non sono add-on né prezzi. Sono
**requisiti sul fornitore**, e vanno a finire nella tabella `documento` del
Q2 accanto ad assicurazioni e visure.

---

## 5. Settore 1 — Luxury Mobility

| Catalogo | Nel sito |
|---|---|
| 2.1 Supercar Delivery & Key Presentation | **è** la collezione `noleggio-auto`, 6 vetture da 1.200 a 3.200 € |
| 2.2 Chauffeur Privato & NCC | assente — compare solo *dentro* un prodotto (`rolls-royce-dawn-transfer-jet`) |
| 2.3 Yacht con equipaggio | assente |
| 2.4 Elicottero | assente |

### 2.1 — la mappatura add-on per add-on

| Catalogo | Sito | Nota |
|---|---|---|
| Kit nastro rosso & fiocco luxury | **The Reveal** — 390 € | coincide |
| Set palloncini personalizzati | **Party** — 150 € | coincide |
| Foto & video reel HD con drone | **Memories** 590 € / **Cinematic** 1.200 € | coincide, e il gruppo `racconto` gestisce già l'esclusione fra i due |
| Welcome kit pelle personalizzato | — | manca. Prezzo fisso, il più facile da aggiungere |
| Beverage on-board, scelta guidata | **Celebration** — 220 € | esiste ma è fisso: va convertito in scaglioni (Prosecco / Franciacorta / Champagne Prestige) |
| Consegna fuori orario 22:00-06:00 | — | manca, ed è preventivo vero |
| Drop-off in altra città / aeroporto | — | manca, ed è preventivo vero |

Tre add-on del sito **non sono nel catalogo**: `road-trip` (340 €),
`birthday` (160 €), `romance` (180 € — riappare al 4.1 come bouquet, ma non
al 2.1). Secondo `SOCI.md` sono fra i più venduti. Il catalogo non è un
soprainsieme del sito: non vanno tolti perché non compaiono qui.

### 2.2, 2.3, 2.4 — il problema comune

Non è che manchino i prodotti. È che tutti e tre hanno il prezzo su un asse
che il codice non ha:

- **NCC**: tariffa oraria, "attesa straordinaria calcolata su base effettiva"
- **Yacht**: charter giornaliero o plurigiornaliero
- **Elicottero**: punto-punto o rotta personalizzata

Aggiungerli come prodotti a prezzo piatto è possibile ed è quello che il
codice consente oggi — ma vende una cosa diversa da quella descritta.

Nota di modello: i loro add-on fissi (Wi-Fi VIP, seggiolino Isofix, Seabob,
kit snorkeling, handling bagagli) sono i più semplici di tutto il documento e
si aggiungono in un pomeriggio. È la base che costa.

---

## 6. Settore 2 — Wine & Cellars

Assente per intero. Tre servizi, dodici add-on, nessuna riga di codice.

| Catalogo | Osservazione |
|---|---|
| 3.1 Private Sommelier a domicilio | Il più vicino al modello che il sito già regge: prezzo base + add-on fissi (calici Riedel, taglieri DOP, schede stampate) + due scaglioni (selezioni bottiglie, food pairing). **Si potrebbe pubblicare senza toccare l'architettura** |
| 3.2 Tour in cantina | Base fissa, ma tre add-on su tre sono variabili — e uno è *Trasporto NCC A/R*, cioè un altro servizio GOLDEN (vedi § 7) |
| 3.3 Cantina privata: progettazione e storage | Fuori modello. È una **consulenza continuativa** con hardware IoT e approvvigionamento su listini riservati. Non è un prodotto da carrello: è un contratto. Da tenere fuori dal catalogo e-commerce e trattare solo a richiesta |

Se si cerca il servizio con il miglior rapporto fra ricavo e lavoro tecnico
in tutto il documento, è **3.1**: entra nel sito così com'è.

---

## 7. Settore 3 — Celebrity & High-End Lifestyle

| Catalogo | Nel sito |
|---|---|
| 4.1 Consegna con Celebrity / VIP | esiste come **variante** *Con Celebrity Experience*, +900 € su ogni prodotto |
| 4.2 Private Chef & fine dining | esiste come `itamae-a-domicilio`, 1.200 €, dentro `sushi-delivery` |
| 4.3 Maggiordomo & concierge H24 | assente |
| 4.4 Personal Security | assente |
| 4.5 Personal Shopper | assente |

### 4.1 — anticipato, ma nella forma sbagliata

Il sito ha già capito che la celebrity è trasversale: `makeProduct` la
aggiunge come seconda variante a tutti e quindici i prodotti, +900 € fissi.

Il catalogo dice un'altra cosa: il prezzo varia per notorietà — **Talent
Locale, Influencer Nazionale, A-List Celebrity**. Un flat di 900 € non copre
quella scala, e l'A-List non è un add-on: è un preventivo.

Inoltre il documento la tratta come **servizio autonomo** con i suoi add-on
(red carpet e photocall, bouquet, video reportage HD), non come opzione di un
altro prodotto.

Da fare: promuoverla a servizio proprio con tre scaglioni, tenendo il +900
come primo livello. Il campo `maxPrice` di `makeProduct` esiste già ed è il
punto da cui partire.

### 4.2 — il riscatto della collezione sushi

`itamae-a-domicilio` **è** un private chef a domicilio, ristretto a una
cucina sola. Generalizzare `sushi-delivery` in "Private Chef" con l'omakase
come una delle formule:

- copre il 4.2 del catalogo senza inventare niente;
- porta i suoi add-on (mise en place luxury, maître dedicato, menu high-end
  con caviale/tartufo/wagyu, wine pairing) su una collezione che oggi usa la
  resa standard;
- chiude il punto 11 di `TECNICO.md` § 8 — estendere base + add-on oltre il
  noleggio — con più ritorno di quanto costi.

### 4.3, 4.4, 4.5 — il tempo e le persone

Tutti e tre sono prezzati su durata o su testa: turnazione H24, numero di
bodyguard più auto civetta, ore di shopping con vettura a disposizione. Stesso
problema del 2.2, moltiplicato.

Il 4.4 porta con sé un peso in più: la security è attività regolata. Licenze,
autorizzazioni, personale abilitato. La tabella `documento` del Q2 —
"assicurazioni, visure, patenti, con scadenza" — modella già la forma giusta,
ma qualcuno deve sapere *quali* documenti chiedere.

### 4.5 — la riga che cambia l'architettura

Gli add-on del personal shopper sono *Transfer NCC Luxury dedicato durante lo
shopping* e *Consulente di stile di fama internazionale*. Il primo **è un
altro servizio GOLDEN**.

Non è un caso isolato. Attraverso tutto il documento:

| Servizio | Ha come add-on |
|---|---|
| 2.3 Yacht | Transfer NCC **o elicottero** per l'imbarco |
| 2.4 Elicottero | Pick-up VIP con limousine alla landing zone |
| 3.1 Sommelier | Food pairing preparato da **uno chef partner** |
| 3.2 Cantine | Trasporto NCC A/R dalla location |
| 4.2 Private chef | Beverage & wine pairing con **sommelier** |
| 4.4 Security | Auto civetta di scorta **NCC** |
| 4.5 Personal shopper | Transfer NCC dedicato |

Sette agganci incrociati. Il catalogo non descrive dodici servizi
indipendenti: descrive un **grafo**, dove un servizio è vendibile da solo o
come componente di un altro.

Oggi `addons` e `products` sono due mondi separati e non comunicanti.

**Conseguenza sulla decisione 1 di `PIANO-TECH.md` § 8** — add-on come
prodotti separati o come line item properties? Il catalogo la chiude: se un
servizio deve essere sia vendibile da solo sia agganciabile a un altro, deve
essere **un prodotto Shopify vero**, con il suo handle, il suo prezzo e le sue
varianti. Le line item properties non bastano. Vale la pena scriverlo nel
piano, che oggi lascia la domanda aperta.

---

## 8. Le due domande che nessun codice risolve

### Il wedding non esiste nel catalogo

Cinque prodotti su quindici — auto per la cerimonia, corteo di supercar,
location e allestimento, celebrity per gli sposi, servizio fotografico — non
compaiono in nessuno dei tre settori. Sono il 33% del catalogo online e la
fascia di prezzo più alta del sito (fino a 6.500 €).

E `PIANO-TECH.md` § 6 lo indica come "la categoria dove gli add-on rendono di
più", con lavoro previsto in Q3.

O il documento v2.0 lo elimina, o il documento è incompleto. **Non è una
domanda tecnica, ma blocca la modellazione Shopify**: non si decide la
struttura del catalogo senza sapere se una collezione su tre resta.

### La scala vera non è il codice

| | Catalogo | Sito |
|---|---|---|
| Settori | 3 | 3 collezioni |
| Servizi | 12 | 15 prodotti, ma su 3 filiere |
| Add-on | ~57 | 8 |
| Filiere fornitori | noleggiatori, NCC, broker yacht, eliporti, sommelier AIS, cantine, chef stellati, maggiordomi, istituti di vigilanza, personal stylist | una |

Scrivere dodici servizi in `catalog.ts` è quasi lineare. **Procurare,
selezionare e verificare dieci filiere di fornitori non lo è**, e il collo di
bottiglia dichiarato in `PIANO-TECH.md` § 11 — un socio e mezzo — è esattamente
lì che si rompe.

Ordine suggerito, se il catalogo va coperto tutto: 2.1 (c'è già) → 2.2 NCC
(la filiera più vicina) → 4.1 celebrity e 4.2 chef (metà del lavoro è fatta)
→ 3.1 sommelier (entra senza toccare l'architettura) → il resto quando il
prezzo su durata esiste.

---

## 9. Cosa cambia in `PIANO-TECH.md`, trimestre per trimestre

| Trimestre | Impatto |
|---|---|
| **Q1a** | Nessuno, anzi: un sito che **raccoglie richieste** è il contenitore naturale per gli add-on a prezzo variabile. Si possono pubblicare tutti e dodici i servizi subito, a preventivo, senza aspettare niente. È l'occasione migliore del catalogo |
| **Q1b** | Qui arriva il costo. Ogni add-on variabile deve diventare variante o restare fuori dal checkout. Va deciso il catalogo a due velocità **prima** di modellare i prodotti su Shopify |
| **Q2** | `cluster` e `commissione` nella tabella `partner`. La tabella `documento` copre già le licenze security e i permessi ZTL, senza modifiche |
| **Q3** | Il motore di regole nasce con la matrice della sezione 1 come primo ruleset. È la parte che si incastra meglio di tutte |
| **Q4** | Invariato |

Una nota sui costi (`PIANO-TECH.md` § 9): dodici servizi con ~57 add-on su
Shopify Basic non cambiano il piano tariffario. Ma se gli scaglioni si
modellassero come varianti del prodotto base invece che come prodotti
separati, la combinatoria arriva al limite di 100 varianti per prodotto in
fretta. È il secondo motivo per cui gli add-on devono essere prodotti a sé.

---

## 10. Le decisioni da prendere prima di toccare codice

1. **Il wedding resta o esce?** Blocca la struttura del catalogo Shopify.
2. **Catalogo a due velocità: quali servizi si comprano online e quali solo a
   preventivo?** La risposta determina quanti add-on vanno modellati come
   varianti e quanti restano moduli di richiesta.
3. **Add-on come prodotti separati.** Il catalogo lo impone (§ 7): va
   registrato come deciso in `PIANO-TECH.md` § 8, non più come aperto.
4. **Ibiza dentro o fuori il primo anno?** Se dentro, cambia il Q1b.
5. **La celebrity: variante o servizio?** Servizio con tre scaglioni, secondo
   questo documento. Comporta rifare `makeProduct`, che oggi la aggiunge a
   tutti e quindici i prodotti come +900 € fissi.
