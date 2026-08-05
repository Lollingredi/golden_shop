# GOLDEN — analisi front-end

Revisione di UI, UX e coesione visiva su tutte le pagine, dopo l'aggiunta di
carrello, account, checkout e concierge. I numeri qui sotto sono misurati sul
codice, non stimati.

**Il verdetto in una riga:** le singole pagine sono curate, ma non esiste un
sistema che le tenga insieme — e si vede soprattutto dove il sito è cresciuto
di più, cioè fra la pagina noleggio nuova e tutto il resto.

---

## Sommario per priorità

| | Problema | Impatto | Stato |
|---|---|---|---|
| **A1** | Il modulo di richiesta è finto e porta a se stesso | Alto — è un vicolo cieco | **Risolto** |
| **A2** | Cinque parole diverse per due sole azioni | Alto — confusione | **Risolto** |
| **A3** | `--muted` non passa il contrasto minimo | Alto — leggibilità | **Risolto** |
| **A4** | Tre solleciti persistenti contemporanei su desktop | Alto — fastidio | Non si tocca |
| **B1** | Sette scale di titolo diverse | Medio — coesione | **Risolto** |
| **B2** | Due ritmi verticali che convivono | Medio — coesione | **Risolto** |
| **B3** | Dieci opacità di bordo, dodici di testo | Medio — coesione | **Risolto** |
| **B4** | Nessun componente pulsante: quattordici varianti | Medio | **Risolto** |
| **B5** | Schede prodotto e schede pacchetto non si parlano | Medio | **Risolto** |
| **B8** | Offset di appiccicamento e ancore tutti diversi | Basso | **Risolto** |
| **B6** | Le pillole tonde sono l'unico elemento arrotondato | Basso | **Risolto** |
| **B7** | Lo sfondo avorio è rimasto orfano | Basso | **Risolto** |
| **C1** | La fascia concierge spezza la pagina noleggio a metà | Medio | **Risolto** |
| **C2** | La scheda prodotto ha quattro azioni impilate | Medio | **Risolto** |
| **C3** | Il selettore di formula sembra cliccabile e non lo è | Medio | **Risolto** |
| **C4** | Il nome dell'account è ricavato dall'email | Basso | **Risolto** |
| **C5** | Il carrello si apre da solo anche quando disturba | Basso | **Risolto** |
| **D1** | Il carrello non trattiene il focus da tastiera | Medio — a11y | **Risolto** |
| **D2** | Gli add-on sono `<button>` ma si comportano da checkbox | Basso — a11y | **Risolto** |
| **D3** | Quattro segnaposto fanno leggere quattro volte "Segnaposto" | Basso — a11y | **Risolto** |
| **D4** | Il carrello annuncia un numero prima dell'idratazione | Basso — a11y | **Risolto** |

*Corretto durante la revisione:* "Catalogo" era sparito dall'header desktop
quando ho aggiunto le icone di account e carrello. Rimesso, visibile da `xl`
in su.

---

## Cosa è stato fatto nel primo giro

**A1 — il modulo funziona.** `RequestForm` è diventato un client component
con campi veri: quattro pulsanti per il servizio, data, città, nome e
contatto. All'invio nasce una `Richiesta` con `lines: []` e `oggetto`
valorizzato — la stessa entità che produce il checkout, quindi finisce nello
stesso elenco dell'area personale, dove compare come "Da quotare" invece che
con un totale. Il riepilogo a destra si riempie mentre si scrive. Se il
contatto è un'email e non c'è sessione, la richiesta crea anche l'accesso,
così la si ritrova. Ogni pagina passa la propria `origine`
("Modulo — Homepage", "Modulo — Noleggio auto"), che il concierge vede.

**A2 — vocabolario fissato su "concierge".** Sostituito ovunque: nove punti
di interfaccia, i tre documenti, i commenti nel codice. Le etichette d'azione
sono ora quattro, ognuna con un solo nome:

| Azione | Etichetta | Volte |
|---|---|---|
| Riempie il carrello | **Aggiungi al carrello** | 3 |
| Apre il pannello | **Parla con un concierge** | 13 |
| Va al checkout | **Vai alla conferma** | 1 |
| Invia il modulo libero | **Invia la richiesta** | 1 |

Spariti: *Richiedi disponibilità*, *Chiedi un preventivo*, *Parla con un
esperto*, e l'*Aggiungi* corto della scheda pacchetto.

**A3 — contrasto rientrato.** `--muted` da `#6E7186` a `#8A8DA0`:

| Sfondo | Prima | Ora |
|---|---|---|
| Ink | 4,04 : 1 ✗ | **5,91 : 1** ✓ |
| Ink 800 | 3,62 : 1 ✗ | **5,30 : 1** ✓ |

**C2 — scheda prodotto rimessa a due azioni.** *Aggiungi al carrello* e
*Parla con un concierge*. La nota sul configuratore, che era la riga più
piccola della pagina pur essendo quella che porta all'upsell, è diventata un
riquadro cliccabile in champagne.

**In più, non previsto:** la scheda pacchetto aveva due pulsanti affiancati
che a 360px si accavallavano; ora ha un pulsante principale e "Cambia
vettura" come link di testo. E le ancore atterrano a 96px invece di 72,
cioè con 24px di aria sotto l'header invece che a filo.

---

## Cosa è stato fatto nel secondo giro

Il secondo giro non aggiunge niente di visibile: fissa il sistema che prima non
c'era. Tutto sta in `app/globals.css` e `components/Bottone.tsx`.

**La regola:** nelle pagine non si scrivono più valori di dimensione o di
spaziatura a mano. Se serve un valore nuovo si aggiunge ai token e si motiva.

### B1 — quattro livelli di titolo, da sette scale

| Classe | Misura | Dove |
|---|---|---|
| `.h-hero` | clamp(40 → 76px) | aperture con immagine a tutto schermo |
| `.h-pagina` | clamp(30 → 48px) | pagine senza apertura: catalogo, checkout, account |
| `.h-sezione` | clamp(26 → 40px) | titoli di sezione |
| `.h-blocco` | 24px | titoli di scheda o di colonna |

Applicate a 41 titoli. Nessun `h1`/`h2`/`h3` porta più una misura scritta a mano.

### B2 — un ritmo solo

`.sezione` (80/120px), `.sezione-stretta` (64/96px), `.pagina-top`,
`.sotto-header`, `.contenuto`, `.ancora`. Il `py-28` della pagina noleggio è
sparito: adesso respira come le altre. Il contenitore centrato, che era
`max-w-[1280px] mx-auto` ripetuto 31 volte, è una classe.

### B3 — da 22 valori a 6

| | Prima | Ora |
|---|---|---|
| Bordi | 10 opacità | `/10` filetto · `/20` contorno · `/40` attivo |
| Testo | 12 opacità | pieno · `/70` corrente · `/50` secondario · `/25` tenue |

`border-white/10` e `/12` erano lo stesso bordo scritto due volte.

### B4 — `components/Bottone.tsx`

Quattro aspetti (`primario`, `contorno`, `testo`, `tenue`) per due misure,
in tre forme: `<Bottone>` per le azioni, `<BottoneLink>` per la navigazione,
`<BottoneA>` per i collegamenti esterni. **32 pulsanti** ci passano attraverso.

L'unico `px-6 py-[11px]` dell'header — 41px di altezza, sotto la soglia di
tocco — ne è la prova: adesso la misura arriva dal componente, che parte da
44px e non può scendere.

Restano fuori, di proposito: le pillole dell'apertura in homepage (decisione
di terzo giro), gli interruttori del configuratore e i due distintivi
("Il più richiesto", lo stato della richiesta), che non sono pulsanti.

### B5 — le due schede si parlano

Formati diversi perché i ruoli sono diversi (4:5 in griglia da tre, 16:9 in
griglia da due), ma stessa lingua: stesso titolo `.h-blocco`, **stesso
trattamento del prezzo** — display, champagne, riga propria, metadati sotto in
muted. Prima il prezzo era enorme sulla scheda pacchetto e a 12px schiacciato
fra città e durata su quella prodotto, pur essendo la prima cosa che si cerca.

La regola sul bordo è dichiarata: ce l'ha la scheda con un corpo di testo, non
quella fatta di immagine più riga di metadati.

### B8 — una variabile per l'altezza dell'header

`--h-header: 72px`, e tutto ne discende: `.pagina-top`, `.sotto-header`,
`.ancora` (72 + 24px d'aria), l'altezza dell'header stesso. Cambiare
l'header adesso è una riga.

### Una nota tecnica che vale la pena conoscere

Le classi del sistema stanno dentro `@layer components`. Non è formalità: le
utility di Tailwind vivono in `@layer utilities`, che nella cascata viene
dopo. Fuori dai livelli queste classi vincerebbero *sempre*, e un `pb-16`
messo di proposito su una `.sezione` non avrebbe effetto. Dentro components,
l'eccezione puntuale può ancora scavalcare la regola — che è il
comportamento che serve.

### Sistemato strada facendo

- La 404 centrava il contenuto in `70vh` sotto un header fisso, quindi
  otticamente basso. Adesso ha `pagina-top`.
- Il titolo del pannello concierge era diventato `.h-sezione`, cioè fino a
  40px dentro un riquadro largo 420px. È un titolo di blocco.

---

## Cosa è stato fatto nel terzo giro

### B7 — l'avorio diventa un ruolo: `.zona-chiara`

Il pezzo più grosso. L'avorio era usato in **una** sezione di tutto il sito.
Adesso è il fondo della parte amministrativa — accesso, area personale,
conferma — che così si distingue a colpo d'occhio dal catalogo.

Non è un tema a parte. `.zona-chiara` ribalta le stesse variabili che il
resto del sito già usa:

```css
.zona-chiara {
  --champagne: var(--gold-text);   /* l'accento diventa leggibile su chiaro */
  --ink-800:   #fff;               /* le superfici sollevate diventano bianche */
  --t1…--t4, --l1…--l3             /* testo e filetti si invertono */
  --azione-fondo: var(--ink);      /* il pulsante principale diventa scuro */
}
```

Perché funzioni ho dovuto prima **portare gli ultimi valori fissi dentro le
variabili**: le 22 opacità del secondo giro erano diventate 6 classi, ma erano
ancora `text-white/70` — bianco fisso, invisibile su avorio. Ora sono
`text-[var(--t2)]` e simili, applicate a 200 punti. Un componente montato
dentro la zona chiara non sa di esserci, e funziona lo stesso.

Contrasti verificati: `--gold-text` è passato da `#8A7345` a `#7A653B` (era
**4,04:1** su avorio, sotto soglia; ora **4,97:1**), e `--muted` in zona
chiara è `#5F6274` (**5,35:1** su avorio, **6,02:1** su bianco).

### B6 — via le pillole

I due pulsanti a raggio pieno dell'apertura erano l'unico elemento
arrotondato del sito, e la prima cosa che si vedeva. Adesso sono
`<BottoneLink>` e `<OperatorLink>` come tutto il resto — e il secondo **apre
il pannello** invece di rimandare al modulo, che è quello che dice di fare.
Spariti anche i due `rounded-sm`. Restano due `rounded-full`: il contatore
del carrello e il pallino "in linea", che sono cerchi per natura.

### D1 — `useTrappolaFocus`

Il focus entra nel pannello, ci resta finché è aperto, e **alla chiusura
torna al pulsante da cui era partito**. Prima il tabulatore usciva e girava
nella pagina di fondo, che è oscurata e inerte alla vista ma non alla
tastiera: chi naviga così percorreva un catalogo invisibile. Vale per il
carrello e per il pannello concierge.

### D2 — gli add-on sono caselle vere

Erano `<button aria-pressed>`: corretto per un interruttore, ma uno screen
reader leggeva **otto interruttori indipendenti** senza sapere che Memories e
Cinematic si escludono. Ora sono `<input type="checkbox">` dentro un
`<fieldset>`, e i due del gruppo "racconto" puntano con `aria-describedby`
alla nota che spiega l'esclusione. L'aspetto non cambia di un pixel; il
riquadro riceve il contorno di focus tramite `has-[:focus-visible]`.

### C1 — la fascia non spezza più

Dopo il configuratore resta un `<OperatorRiga>`: una riga, un filetto, un
invito. La fascia larga si è spostata in fondo alla pagina, dove chiudere ha
un senso — la pagina continuava ancora per due sezioni.

### C3 — il selettore di formula adesso seleziona

Erano due `<div>` con il primo evidenziato in champagne: sembrava un
selettore, non lo era, e il carrello riceveva comunque la variante 1. Con un
carrello vero è una promessa non mantenuta. Ora sono radio in
`components/ScegliFormula.tsx`: cambiano il prezzo mostrato **e** la variante
che finisce nel carrello — già la forma di `selectedOptions` su Shopify.

### Le rifiniture

- **C4** — `redibako18@…` diventava "Redibako18" a 48px in cima all'area
  personale. Il nome si ricava dall'email solo se ne ha la forma
  (`mario.rossi` sì, con cifre dentro no); altrimenti il saluto è "Il vostro
  account".
- **C5** — il carrello si apre da configuratore e scheda prodotto, dove è la
  conferma. Dalle griglie no: coprirebbe la griglia da cui si sta ancora
  scegliendo. Il pulsante che dice "Aggiunto ✓" per due secondi basta.
- **D3** — il segnaposto immagine è `aria-hidden`: su una griglia di quattro
  prodotti senza foto faceva leggere quattro volte "Segnaposto", e il titolo
  della scheda lo dice già.
- **D4** — il carrello non annuncia più "0 articoli" prima di sapere quanti
  ne ha.
- **E** — nel configuratore le vetture erano su tre colonne già da 640px:
  schede da 190px con immagine alta 118px. Ora due colonne fino a `md`.
- **F** — `.campo-etichetta` separa l'etichetta di campo dal sopratitolo di
  sezione: `.kicker` faceva due mestieri e il secondo toglieva forza al primo.
- **F** — il configuratore non è più avvolto in `<Reveal>`: la trasformata
  temporanea faceva assestare con un sussulto la colonna `sticky` che
  contiene.
- **B8** — gli offset appiccicati sono tutti
  `calc(var(--h-header) + 32px)`. Non resta un solo `104px` scritto a mano.

---

### Deciso di non fare

**A4 — restano tutti e tre i solleciti.** La linguetta "Preventivo gratuito"
e la barra mobile Telefono/WhatsApp rimangono come sono. Va tenuto presente
che "Preventivo gratuito" è ora il terzo nome per la stessa destinazione, dopo
"Richiedi" nell'header e "Invia la richiesta" nel modulo: se un giorno si
vuole chiudere del tutto A2, è la stringa da allineare.

---

## A. Le cose che rompono qualcosa

### A1. Il modulo di richiesta è una finta, e ora si vede

`components/RequestForm.tsx` compare in fondo a home, pagina noleggio e alle
due pagine servizio. Ha tre "campi" che non sono campi — sono `<div>` con
dentro il testo di suggerimento — e un pulsante *Invia la richiesta* che è un
`<Link href="/#richiesta">`, cioè **punta a se stesso**. Chi lo preme dalla
home non vede succedere niente; chi lo preme da una pagina servizio viene
sbalzato in cima alla homepage.

Finché non c'era altro, era un segnaposto onesto. Adesso che esiste un
checkout vero in tre passi, è la superficie più debole del sito, ed è quella
che chiude ogni pagina.

**Da fare:** o diventa un modulo vero con gli stessi campi del checkout
(nome, contatto, cosa, quando) che apre il pannello concierge o crea una
richiesta, oppure sparisce e al suo posto va la fascia concierge, che quella
funziona davvero.

### A2. Cinque parole per due azioni

Contate sul sito, oggi convivono:

> Preventivo gratuito · Richiedi · Richiedi disponibilità · Chiedi un
> preventivo · Parla con un concierge · Parla con un concierge · Parla con un
> concierge · Invia la richiesta · Aggiungi al carrello

Le azioni vere sono **due**: mettere qualcosa nel carrello, oppure parlare
con qualcuno. Nove etichette per due azioni costringono chi legge a decidere
ogni volta se "Richiedi disponibilità" e "Chiedi un preventivo" siano la
stessa cosa. (Non lo sono? Anche noi dobbiamo pensarci.)

**Da fare:** fissare un vocabolario e non derogare.

| Azione | Etichetta unica |
|---|---|
| Riempie il carrello | **Aggiungi al carrello** |
| Apre il pannello concierge | **Parla con un concierge** |
| Va al checkout | **Vai alla conferma** |

"Operatore", "esperto" e "concierge" sono la stessa persona: uno dei tre nomi
va scelto e usato ovunque, compresa la homepage.

### A3. Il grigio dei metadati non è leggibile abbastanza

`--muted` è `#6E7186`. Misurato:

| Sfondo | Rapporto | Soglia WCAG AA |
|---|---|---|
| Ink `#090B22` | **4,04 : 1** | 4,5 : 1 ✗ |
| Ink 800 `#141833` | **3,62 : 1** | 4,5 : 1 ✗ |

Non è un dettaglio da spuntare per conformità: `--muted` è usato in tredici
file, quasi sempre su testo da 11 a 13px — città, durata, note legali, prezzi
secondari, orari del concierge. È esattamente il testo che si legge male su
un portatile a mezzogiorno.

**Da fare:** portare `--muted` a circa `#8A8DA0` (≈ 5,3:1 su ink) e
verificare che continui a leggersi anche su ink-800. Costa una riga in
`globals.css` e si aggiusta ovunque.

Nota positiva: il champagne su ink è a **13,8:1**, ottimo. Le opacità di
bianco dal 50% in su sono tutte sopra 5:1.

### A4. Su desktop si viene sollecitati da tre parti insieme

Aprendo la homepage su un portatile, dopo diciotto secondi coesistono:

1. la linguetta verticale **"Preventivo gratuito"** fissa a sinistra
   (`QuoteTab`, `z-40`);
2. il **popup concierge** in basso a destra (`z-55`);
3. la fascia **"Parla con un concierge"** nel footer, appena si scorre.

Tre inviti a contattarci sullo stesso schermo. Su mobile va anche peggio: la
barra fissa in fondo con *Telefono* e *WhatsApp* offre gli stessi due canali
che il pannello concierge offre di nuovo appena si apre, e il popup deve
schivarla posizionandosi a `bottom-76px`.

**Da fare:** scegliere uno. La proposta è togliere `QuoteTab` — il pannello
concierge fa la stessa cosa meglio (tre canali invece di due, contesto,
orario, richiamata) ed è già in nove punti. In alternativa, la linguetta
diventa essa stessa un innesco del pannello invece di un link a `/#richiesta`.

---

## B. Coesione visiva: manca il sistema, non il gusto

Le scelte di fondo sono buone e riconoscibili — blu-nero, champagne, serif
display, angoli vivi. Il problema è che ogni pagina le riapplica a modo suo.

### B1. Sette scale di titolo

| Pagina | `h1` |
|---|---|
| Home | `clamp(44px, 7.4vw, 80px)` |
| Servizio generico | `clamp(40px, 6.4vw, 72px)` |
| Noleggio | `clamp(38px, 6.2vw, 72px)` |
| Catalogo | `clamp(36px, 5.4vw, 64px)` |
| Area personale | `clamp(32px, 5vw, 52px)` |
| Checkout | `clamp(30px, 4.6vw, 46px)` |
| Scheda prodotto | `clamp(30px, 4vw, 44px)` |
| Accesso | `clamp(30px, 4.4vw, 42px)` |

Sette valori diversi, nessuno derivato dagli altri. Un'idea di gerarchia c'è
(la home grida, il checkout parla piano) ma è a occhio: fra 46px e 44px non
c'è nessuna intenzione, c'è solo che sono stati scritti in giorni diversi.

Anche i `h2` hanno quattro trattamenti: `text-3xl lg:text-[40px]` (dodici
volte), `text-2xl lg:text-3xl` (cinque), `text-2xl lg:text-[32px]`, `text-2xl`
nudo.

**Da fare:** tre livelli e basta, dichiarati in `globals.css` come classi
(`.h-hero`, `.h-pagina`, `.h-sezione`) e usati ovunque. Il sito non ha
bisogno di più di tre.

### B2. Due ritmi verticali che convivono

Tutto il sito respira su `py-20 lg:py-[120px]`. La pagina noleggio — l'ultima
scritta — usa `py-20 lg:py-28`, cioè **112px invece di 120px**.

Otto pixel non si notano da soli. Si notano passando da `/collections` a
`/collections/noleggio-auto`: le sezioni sembrano leggermente più compresse
senza che si capisca perché. La fascia concierge aggiunge un terzo valore,
`py-16 lg:py-24`.

Stessa storia sopra: le pagine senza apertura a immagine partono da
`pt-[140px] lg:pt-[180px]`, ma la scheda prodotto parte da
`pt-[100px] lg:pt-[120px]` e lo stato di caricamento dell'area personale da
`pt-[160px]` senza variante desktop.

**Da fare:** un solo ritmo (`py-20 lg:py-[120px]`), una sola partenza
(`pt-[140px] lg:pt-[180px]`), e le eccezioni motivate a commento.

### B3. Dieci opacità di bordo, dodici di testo

Misurate:

```
bordi   /5  /10  /12  /15  /20  /25  /30  /35  /50  /60      → 10 valori
testo   /20 /25  /30  /50  /55  /60  /65  /70  /75  /80 /85 /90 → 12 valori
```

`border-white/10` è usato 33 volte, `/12` sette. La differenza fra i due è
invisibile: sono lo stesso bordo scritto due volte.

**Da fare:** tre bordi (`/10` filetto, `/20` contorno, `/40` attivo) e quattro
livelli di testo (primario bianco, `/70` corrente, `/50` secondario, `--muted`
metadati). Diciannove valori diventano sette.

### B4. Quattordici varianti di pulsante, nessun componente

`px-10 py-4` compare quattordici volte, `px-8 py-4` sette, `px-6 py-3`
quattro, `px-5 py-3` due, `px-6 py-[11px]` una (l'unica nell'header, e infatti
è alta 41px invece di 44 — sotto la soglia di tocco raccomandata).

Ogni pulsante ripete anche la propria riga di colori e transizioni. Cambiare
lo stato hover del pulsante principale oggi significa cercarlo in undici file.

**Da fare:** un `components/Bottone.tsx` con tre varianti (`primario`,
`contorno`, `testo`) e due misure. Non è raffinatezza: è la sola cosa che
impedisce alla quindicesima variante di nascere.

### B5. Le due schede non si parlano

Sulla pagina noleggio convivono `PackageCard` e `ProductCard`, a poche
sezioni di distanza:

| | PackageCard | ProductCard |
|---|---|---|
| Proporzione | 16 : 9 | 4 : 5 |
| Contorno | Bordo pieno | Nessuno |
| Titolo | Sull'immagine, 28px | Sull'immagine, 24px |
| Prezzo | 24px champagne, in evidenza | 12px in fila coi metadati |
| Azioni | Due pulsanti | Nessuna, tutta la scheda è un link |

Sono due linguaggi. Il prezzo in particolare: enorme sulla scheda pacchetto,
minuscolo e appiattito fra città e durata su quella prodotto — quando il
prezzo è l'informazione che si cerca per prima.

**Da fare:** stessa proporzione o proporzioni dichiaratamente diverse per
ruolo, stesso trattamento del prezzo, stessa regola sul bordo.

### B6. Angoli: tre linguaggi in una pagina

Il sito è a spigolo vivo, con due eccezioni: `rounded-sm` (due volte, nel
riquadro "Come funziona" della home e nel riepilogo del modulo) e
`rounded-full` (sei volte, i due pulsanti a pillola dell'apertura).

Le pillole della home sono l'unico elemento tondo di tutto il sito, e sono la
prima cosa che si vede. **Da fare:** o diventano il linguaggio dei pulsanti
principali ovunque, o tornano squadrate. Oggi sembrano prese da un altro
progetto.

### B7. Lo sfondo avorio è rimasto orfano

`--ivory` compare in una sola sezione, "Come funziona" in homepage. Quando le
pagine erano quattro era un respiro; adesso che sono dieci è un'anomalia
isolata. O guadagna un secondo impiego — l'area personale è la candidata
naturale, è la zona "amministrativa" del sito — o va tolto dai token.

### B8. Offset di appiccicamento tutti diversi

`lg:top-[96px]` nel configuratore, `lg:top-[104px]` nella scheda prodotto e
nel checkout, `scroll-mt-[72px]` sulle ancore. L'header è alto 72px: le ancore
atterrano quindi **esattamente a filo** sotto l'header, senza un margine di
respiro. **Da fare:** una variabile `--h-header: 72px` e tutti gli offset
derivati da lì, con 24px di aria sulle ancore.

---

## C. Percorsi e comportamento

### C1. La fascia concierge spezza la pagina noleggio a metà

La richiesta era «al termine della schermata dettagli, dove scegli gli
add-on», e letteralmente è dove l'ho messa: subito dopo il configuratore. Ma
la pagina continua per altre due sezioni (le vetture, "Non solo auto"), quindi
la fascia — che è larga, bordata e con due pulsanti — **interrompe** invece di
chiudere.

**Da fare:** decidere quale delle due letture vale. Se la fascia deve chiudere
la pagina, va spostata in fondo, prima del modulo. Se deve intercettare la
domanda nel momento in cui nasce, va rimpicciolita a una riga sotto il
riepilogo del configuratore — non a una fascia a tutta larghezza.

### C2. La scheda prodotto chiede quattro cose insieme

Dopo le ultime aggiunte, la colonna d'acquisto presenta in sequenza: *Aggiungi
al carrello*, *Richiedi disponibilità*, *Parla con un concierge*, e la nota
che rimanda al configuratore. Quattro strade, tre delle quali portano a
parlare con noi.

**Da fare:** una azione principale (aggiungi), una secondaria (concierge), e
la nota sul configuratore promossa a riquadro — è la più utile delle quattro,
perché è quella che porta all'upsell, ed è quella scritta più in piccolo.

### C3. Il selettore di formula sembra cliccabile e non lo è

Sulla scheda prodotto, il `fieldset` "Formula" mostra due varianti con la
prima evidenziata in champagne. Sembra un selettore. Non lo è: sono due `div`
statici, e il carrello riceve comunque la variante 1. Con un carrello vero,
questa è una promessa non mantenuta.

### C4. Il nome dell'account è ricavato dall'email

`login()` costruisce il nome da `email.split("@")[0]`, quindi
`redibako18@…` diventa **"Redibako18"**, mostrato a 52px in cima all'area
personale con `capitalize`. **Da fare:** chiedere il nome al primo accesso, o
salutare senza nome finché non lo si conosce.

### C5. Il carrello si apre da solo anche quando disturba

`cart.add()` apre sempre il pannello. Sulla griglia dei pacchetti, aggiungerne
uno copre la griglia da cui si stava scegliendo, e per aggiungere il secondo
bisogna chiudere. **Da fare:** aprire solo se l'aggiunta arriva dal
configuratore o dalla scheda prodotto; dalle griglie basta far pulsare il
badge.

---

## D. Accessibilità

**D1. Il carrello non trattiene il focus.** All'apertura il pannello riceve il
focus, ma nulla impedisce al tabulatore di uscire e girare nella pagina sotto,
che è oscurata e inerte alla vista ma non alla tastiera. Vale anche per il
pannello concierge. Serve un ciclo di focus, o `inert` sul contenuto di fondo.

**D2. Gli add-on sono pulsanti che si comportano da caselle.** Hanno
`aria-pressed`, che è corretto per un interruttore ma non comunica il gruppo:
uno screen reader non sa che Memories e Cinematic si escludono. Serve un
`fieldset` con `role="radiogroup"` per quella coppia, e checkbox vere per le
altre sei.

**D3. Il segnaposto immagine ha `role="img"`** con etichetta "Segnaposto: …":
corretto e onesto, ma su una pagina sushi con quattro prodotti senza foto uno
screen reader legge quattro volte "Segnaposto". Meglio `aria-hidden` sul
riquadro e l'informazione nel testo della scheda.

**D4. Il pulsante carrello annuncia sempre un numero**, anche prima
dell'idratazione: `aria-label="Carrello, 0 articoli"` viene letto come vero
mentre lo stato non è ancora caricato.

---

## E. Mobile

- **La barra fissa in fondo mangia 60px** su ogni pagina (`pb-[60px]` sul
  body) per offrire due canali che il pannello concierge già offre. Su uno
  schermo da 667px è il 9% dello spazio, sempre.
- **Il popup deve schivarla** (`bottom-[76px]`): due elementi fissi in fondo
  che negoziano fra loro sono un sintomo, non una soluzione.
- **Nel configuratore, le vetture stanno su tre colonne da `sm`**: a 640px
  sono schede da circa 190px, con immagine 16:10 alta 118px. Sotto la soglia
  del riconoscibile. Meglio due colonne fino a `md`, o uno scorrimento
  orizzontale.
- **Le schede pacchetto hanno due pulsanti affiancati** che a 360px vanno a
  capo sotto un prezzo già su due righe: il piede della scheda diventa alto
  quanto il testo.

---

## F. Dettagli minori

- La pagina 404 non ha padding superiore: centra in `70vh` sotto un header
  fisso di 72px, quindi il contenuto è otticamente basso.
- La classe `.kicker` fa due mestieri: sopratitolo di sezione ed etichetta di
  campo nei moduli. Sono ruoli diversi e la seconda ne indebolisce la prima.
- `formatMoney` e `formatAmount` producono lo stesso risultato da tipi
  diversi. Va bene, ma `fromPrice` aggiunge "da " e viene usato anche dove il
  prezzo è unico.
- Il configuratore è avvolto in `<Reveal>`, che applica una trasformata
  temporanea: la colonna di riepilogo appiccicata può assestarsi con un
  sussulto mentre l'animazione finisce. Meglio animare i figli, non il
  contenitore che contiene un elemento `sticky`.
- La pagina servizio generica (`[handle]`) è rimasta quella vecchia: wedding e
  sushi hanno l'apertura, l'introduzione e la griglia, mentre noleggio ha sei
  sezioni. È voluto, ma il salto è visibile passando dall'una all'altra dal
  menu.

---

## Piano in tre giri

**Primo giro — mezza giornata, cambia molto**

1. Alzare `--muted` a `#8A8DA0`.
2. Fissare il vocabolario delle azioni (A2) e riscrivere le etichette.
3. Togliere `QuoteTab`, o trasformarlo in innesco del pannello concierge.
4. Sostituire `RequestForm` con la fascia concierge, o farlo funzionare.

**Secondo giro — il sistema**

5. Tre livelli di titolo, un ritmo verticale, sette valori di bordo e testo.
6. `components/Bottone.tsx` e sostituzione delle quattordici varianti.
7. Variabile `--h-header` e offset derivati.
8. Allineare `PackageCard` e `ProductCard`.

**Terzo giro — rifinitura**

9. Ciclo di focus nei due pannelli.
10. Add-on come caselle vere, con gruppo dichiarato.
11. Decidere gli angoli: pillole ovunque o da nessuna parte.
12. Un secondo impiego per l'avorio, o via dai token.
