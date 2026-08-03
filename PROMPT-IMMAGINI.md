# GOLDEN — prompt per le immagini mancanti o sbagliate

Audit di `public/images/` fatto sul sito attuale. I prompt sono in inglese
perché i modelli di generazione lavorano molto meglio in inglese; le note e i
riferimenti al codice sono in italiano.

**Regola sui nomi file:** `contesto-soggetto[-formato].jpg`, tutto minuscolo,
trattini. I prefissi sono quelli del modello dati: `reveal-`, `pacchetto-`,
`addon-`, `wedding-`, `sushi-`, `auto-`.

---

## Blocco di stile — da anteporre a ogni prompt

Serve a tenere insieme le immagini: senza questo blocco ogni foto sembrerà
uscita da un sito diverso.

```
Editorial luxury photography, full-frame 35mm, 50mm lens at f/2, shallow depth
of field, natural available light only, deep blue-black shadows (#090B22),
warm champagne highlights (#E7D9B4), muted desaturated palette, subtle film
grain, cinematic color grade, restrained and expensive-looking, Italian
setting, documentary feel — real moment, not posed for the camera.
```

## Blocco negativo — da anteporre o incollare nel campo negative

```
no visible car manufacturer logos or badges, no brand names, no legible
license plates, no text or watermark, no HDR, no oversaturation, no heavy
vignette, no stock-photo grins, no distorted hands, no extra fingers,
no plastic skin retouching, no fisheye distortion.
```

> **Nota legale, non estetica.** Le foto oggi in `public/images/` mostrano
> marchi Lamborghini ben leggibili (logo, scritta "URUS SE", muro "AD
> PERSONAM"). Sulle immagini generate conviene tenere le vetture senza marchi:
> il prompt sopra lo impone già.

---

# A. La rivelazione — il servizio firma, oggi assente

È il cuore della nuova pagina noleggio e non esiste una sola fotografia che la
racconti. Priorità massima.

### 1. `reveal-telo-nero-wide.jpg` — 2000 × 700

**Dove:** apertura di `app/collections/noleggio-auto/page.tsx`
(oggi usa `urus-nastro-wide.jpg`, che è un'auto da matrimonio con tulle rosa —
sbagliata per un'apertura che parla di rivelazione).

```
A low-slung sports car completely covered by a taut matte-black fabric cover,
parked in the courtyard of an Italian villa at blue hour. A single wide red
satin ribbon crosses the car and ends in a hand-tied bow on the bonnet. The
shape of the car is unmistakable under the cloth but no detail is visible.
Warm light spilling from a doorway on the left, cool dusk sky above.
Wide cinematic crop, car placed to the right third, empty gravel and negative
space to the left for a headline. Nobody in frame yet.
```

### 2. `reveal-momento.jpg` — 1400 × 1750

**Dove:** nuova — da usare nella sezione "Come funziona" o come seconda
immagine di `The Big Reveal`.

```
The exact instant a black cover is pulled off a car: the fabric is still in
the air, caught mid-fall, blurred with motion. In the foreground, slightly out
of focus, the back of a woman's head and her raised hands. Her face is not
visible; what reads is the posture of surprise. Evening, a crew member in dark
clothes barely visible at the edge of frame. Vertical portrait crop, the
falling cloth occupying the upper half.
```

---

# B. I quattro pacchetti

Oggi riciclano foto di altri prodotti. Formato **1600 × 900** (le schede usano
`aspect-[16/9]`), gradiente scuro applicato dal CSS in basso: **lasciare il
terzo inferiore visivamente calmo**, ci va sopra il titolo.

### 3. `pacchetto-big-reveal.jpg` — 1600 × 900

**Dove:** `lib/experiences.ts` → pacchetto `the-big-reveal` (oggi
`urus-nastro-wide.jpg`).

```
A covered car under a matte-black cloth with a red satin bow, seen three-
quarters from the front, in an empty private courtyard at dusk. A small group
of three people walks toward it from the right, seen from behind, one of them
holding a phone up to film. Warm lamp light on the wet stone paving. The lower
third of the frame is dark, uncluttered paving — room for a title.
```

### 4. `pacchetto-romantic-surprise.jpg` — 1600 × 900

**Dove:** pacchetto `romantic-surprise` (oggi `ferrari-notte.jpg`).

```
Night. Two champagne flutes resting on the bonnet of a dark sports car, a
bottle in a steel ice bucket beside them, condensation on the glass. A loose
bouquet of pale garden roses lies on the passenger seat, door open, interior
light on. A couple stands out of focus in the deep background, close together.
City lights bokeh behind. Warm gold reflections on black paint, everything
else in shadow. Lower third dark and quiet.
```

### 5. `pacchetto-vip-birthday.jpg` — 1600 × 900

**Dove:** pacchetto `vip-birthday` (oggi `urus-showroom.jpg`, uno showroom
Lamborghini senza nulla di festivo — è l'immagine più fuori posto del sito).

```
A dark sports car parked in a private garage at night, framed by an arch of
matte black, deep red and champagne-gold balloons anchored to the floor on
both sides. On a small side table, a single round cake with lit candles, the
only warm light source in the frame besides the garage lamps. No people, or
one silhouette at the far edge. Elegant and adult — not a children's party.
Lower third dark.
```

### 6. `pacchetto-ultimate-experience.jpg` — 1600 × 900

**Dove:** pacchetto `ultimate-experience` (oggi `showroom.jpg`, che ritrae un
uomo in giacca in un museo Lamborghini).

```
Wide shot of a private villa courtyard fully staged at blue hour: a car still
under its black cover with a red bow at the centre, balloon columns at the
sides, a flower arrangement on a console table, an ice bucket with two flutes,
and a photographer with a camera crouching low on the left, already working.
Golden lamp light, cool sky, everything coordinated in black, deep red and
champagne. Nobody is celebrating yet — the scene is ready and empty.
```

---

# C. Gli otto add-on

Oggi il configuratore è tutto testo. Con una miniatura per add-on le schede
diventano molto più vendibili. Formato **900 × 600** (3:2), soggetto
riconoscibile in un colpo d'occhio anche a 300px di larghezza.

### 7. `addon-the-reveal.jpg`

```
Close-up detail of a hand-tied wide red satin ribbon and bow against taut
matte-black fabric stretched over a car body. Raking evening light picks out
the weave of the satin. Almost abstract, no car detail visible.
```

### 8. `addon-memories.jpg`

```
A photographer seen from behind, crouched low, camera raised, shooting a
couple who are out of focus in the background beside a dark car at dusk. The
photographer is a silhouette; the subject is the act of photographing.
```

### 9. `addon-cinematic.jpg`

```
A videographer with a gimbal-mounted cinema camera walking backwards beside a
dark car on an evening road, motion blur on the ground, camera monitor glowing
faintly. Seen from a low angle, cinematic and slightly kinetic.
```

### 10. `addon-romance.jpg`

```
A fresh bouquet of pale garden roses and eucalyptus resting on the cream
leather passenger seat of a dark car, door open, warm interior light. Shallow
focus on the petals, stitching of the seat visible behind.
```

### 11. `addon-party.jpg`

```
A column of matte black, deep red and champagne-gold balloons rising beside a
dark car in a private garage at night. Shallow focus, the balloons in the
foreground crisp, the car a dark shape behind them.
```

### 12. `addon-celebration.jpg`

```
An open bottle of champagne in a steel ice bucket with two crystal flutes,
placed on the bonnet of a dark car at night. Condensation and beading water,
warm light from the side, black paint reflecting the gold of the label area
(label blank, no brand).
```

### 13. `addon-road-trip.jpg`

```
Aerial view from behind of a single dark car on an empty hairpin mountain road
in the Italian Alps, early morning, low sun, long shadows, mist in the valley
below. The car is small in frame — the road is the subject.
```

### 14. `addon-birthday.jpg`

```
A round chocolate-and-gold pastry cake with slim lit candles, on a dark
surface at night, out-of-focus car headlight and balloon shapes glowing behind
it. The candle flames are the brightest thing in the frame.
```

---

# D. Sushi delivery — quattro prodotti e la collezione, tutti vuoti

Oggi mostrano il `PlaceholderMedia` a righe. Formato prodotti **1400 × 1750**
(verticale, come le schede auto), collezione **1400 × 1750**.

### 15. `sushi-collection-hero.jpg` — 1400 × 1750

**Dove:** `lib/catalog.ts` → collection `sushi-delivery`, oggi `image: null`.

```
An itamae's hands pressing a single piece of nigiri on a dark wooden counter,
seen from a low three-quarter angle. Steam-free, precise, minimal. Deep shadow
background, one warm overhead light on the hands and the fish. Vertical crop
with space above the hands.
```

### 16. `sushi-omakase-champagne.jpg` — 1400 × 1750

**Dove:** prodotto `omakase-due-champagne`.

```
An overhead-angled view of a black lacquer tray with twenty pieces of nigiri
arranged in two precise rows, on a dark home dining table set for two. A
bottle of champagne in a steel ice bucket and two flutes at the edge of frame,
condensation visible. Warm low light, candle out of focus. Bottle label blank.
```

### 17. `sushi-sashimi-franciacorta.jpg` — 1400 × 1750

**Dove:** prodotto `sashimi-selection-bollicine`.

```
Close-up of sliced sashimi — tuna, amberjack, scallop — fanned on a dark
ceramic plate with fresh grated wasabi and a shiso leaf. No rice. A single
glass of sparkling wine slightly out of focus behind. Cold precise light on
the fish, everything else in shadow.
```

### 18. `sushi-party-magnum.jpg` — 1400 × 1750

**Dove:** prodotto `sushi-party-sei-magnum`.

```
A long dark dining table seen from above at an angle, two large serving
platters of assorted sushi at the centre, a magnum champagne bottle standing
in a large ice bucket beside them, six place settings with ceramic plates and
chopsticks. Evening, warm light from above, a few hands reaching in from the
edges of frame. Label blank.
```

### 19. `sushi-itamae-domicilio.jpg` — 1400 × 1750

**Dove:** prodotto `itamae-a-domicilio`.

```
An itamae in a clean white jacket working at a private kitchen island in a
modern Italian home, slicing fish with a long yanagiba knife. Two guests sit
out of focus in the foreground, watching. Warm domestic light, dark cabinetry,
documentary angle from behind the guests' shoulders.
```

---

# E. Immagini presenti ma sbagliate

### 20. `location-dimora-storica.jpg` — 1400 × 1750

**Sostituisce:** `piazza.jpg`, dichiarata segnaposto nel README. Oggi è una
foto turistica di Piazza dei Signori a Treviso: non è una location, è una
piazza pubblica.

**Dove:** `lib/catalog.ts` → prodotto `location-allestimento`.

```
The gravel forecourt of a 17th-century Venetian villa at golden hour, cypress
trees along the drive, long banquet tables set under a colonnade with white
linen and low flower arrangements, warm festoon lights strung overhead, not
yet switched on. Empty of guests. Vertical crop, the villa facade filling the
upper half.
```

### 21. `wedding-servizio-fotografico.jpg` — 1400 × 1750

**Sostituisce:** l'uso di `showroom.jpg` (un uomo in giacca in un museo
Lamborghini) per il prodotto "Servizio fotografico e video".

**Dove:** `lib/catalog.ts` → prodotto `servizio-fotografico-matrimonio`.

```
Two photographers working a wedding from different angles at golden hour, seen
in the middle distance, both crouched, cameras up, shooting a couple that is
mostly hidden behind them. Villa garden, warm backlight, lens flare avoided.
Documentary — the crew at work, not the result.
```

### 22. `wedding-corteo-supercar.jpg` — 1400 × 1750

**Sostituisce:** l'uso di `miura-concorso.jpg` per "Corteo di supercar".
Quella è una singola auto a un concorso d'eleganza, non un corteo.

**Dove:** `lib/catalog.ts` → prodotto `corteo-supercar`.

```
Five sports cars in a staggered line on a tree-lined country road in Italy,
seen from a slightly elevated three-quarter angle, headlights on, moving
together at low speed. Late afternoon, long shadows across the asphalt, dust
in the light. Cars unbranded, mixed dark colours.
```

### 23. `wedding-celebrity-experience-sposi.jpg` — 1400 × 1750

**Sostituisce:** l'uso di `ferrari-notte.jpg` per "Celebrity Experience per
gli sposi", che è solo un dettaglio notturno generico.

**Dove:** `lib/catalog.ts` → prodotto `celebrity-experience-sposi`.

```
Night, the exit of a wedding reception. A bride and groom seen from behind
walking toward a car still covered in black cloth with a red bow, guests
lining both sides holding sparklers. Warm sparkler light on the dress, the
covered car dark at the end of the corridor of people. Vertical crop.
```

---

# Riepilogo — 23 file

| # | File | Formato | Priorità |
|---|---|---|---|
| 1 | `reveal-telo-nero-wide.jpg` | 2000 × 700 | Alta |
| 2 | `reveal-momento.jpg` | 1400 × 1750 | Alta |
| 3 | `pacchetto-big-reveal.jpg` | 1600 × 900 | Alta |
| 4 | `pacchetto-romantic-surprise.jpg` | 1600 × 900 | Alta |
| 5 | `pacchetto-vip-birthday.jpg` | 1600 × 900 | Alta |
| 6 | `pacchetto-ultimate-experience.jpg` | 1600 × 900 | Alta |
| 7–14 | `addon-*.jpg` (otto) | 900 × 600 | Media |
| 15 | `sushi-collection-hero.jpg` | 1400 × 1750 | Media |
| 16–19 | `sushi-*.jpg` (quattro) | 1400 × 1750 | Media |
| 20 | `location-dimora-storica.jpg` | 1400 × 1750 | Media |
| 21 | `wedding-servizio-fotografico.jpg` | 1400 × 1750 | Bassa |
| 22 | `wedding-corteo-supercar.jpg` | 1400 × 1750 | Bassa |
| 23 | `wedding-celebrity-experience-sposi.jpg` | 1400 × 1750 | Bassa |

Con 1–6 la pagina noleggio smette di raccontare a parole il servizio che la
regge. Il resto si può fare in un secondo giro.

## Dopo la generazione

Le immagini vanno in `public/images/`. I riferimenti da aggiornare sono tutti
in due file: `lib/experiences.ts` (pacchetti e, se si aggiungono, add-on) e
`lib/catalog.ts` (prodotti e collezioni). L'apertura della pagina noleggio ha
il percorso scritto direttamente in
`app/collections/noleggio-auto/page.tsx`.
