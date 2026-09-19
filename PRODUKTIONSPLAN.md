# Produktionsplan for Judo-Teori Træner

## Nuværende udgangspunkt

- Statisk HTML, CSS og JavaScript på GitHub Pages.
- Ingen brugerkonti, database, cookies eller analyseværktøjer.
- Fem elevgrader fra 5. kyu til 1. kyu er dækket med 30 spørgsmål pr. niveau.
- Indholdet er baseret på Judo Danmarks pensum for børn og unge, 6-14 år, opdateret februar 2024.
- Automatiske data-, browser-, kontrast- og axe-tests findes.

## Skal være på plads før offentlig lancering

### 1. Indhold og afgrænsning

- Få blåt og brunt bælte uafhængigt faktatjekket mod det officielle pensum.
- Få en judofaglig person til at stikprøve hele spørgsmålsbanken.
- Beslut, om første offentlige version stopper ved brunt bælte. Sort bælte er ikke en del af det nuværende 5.-1. kyu-pensum.
- Skriv tydeligt, at appen er et træningshjælpemiddel og ikke erstatter trænerens undervisning eller den praktiske graduering.

### 2. Målgruppe

Anbefalet første positionering:

> Judo-teori for børn og unge på 6-14 år, deres forældre og trænere.

Det matcher den officielle kilde. Voksne kan godt bruge appen, men deres graduering kan følge et andet pensum, så appen bør ikke markedsføres som dækkende for voksne, før voksenpensummet er undersøgt og valideret særskilt.

### 3. Rettigheder og afsender

- Judo Danmark krediteres nu som kilde med dokumenttitel og opdateringsdato.
- Gør det klart, at appen er uafhængig og ikke en officiel Judo Danmark-app.
- Afklar med Judo Danmark, om offentliggørelsen samt brugen og bearbejdningen af deres ophavsretligt beskyttede pensum kan godkendes, især før markedsføring eller monetisering. En konkret beskrivelse, verificeret kontaktvej, et personligt henvendelsesudkast og en svar-checkliste ligger i `RETTIGHEDSAFKLARING.md`. Udkastet skal godkendes af Lars før afsendelse.
- Tilføj kontaktoplysninger og en kort ansvarstekst.

### 4. Domæne og hosting

- `judoteori.dk` gav ingen registrering i Punktum dk's WHOIS og ingen DNS-opslag ved kontrollen; domænet ser derfor ledigt ud, men tilgængeligheden skal kontrolleres igen umiddelbart før køb.
- Besluttet målarkitektur: GitHub bevares som kodearkiv og versionshistorik, mens Vercel bliver permanent host for både appen og dens serverfunktioner.
- Det eksisterende repository forbindes med Vercel, så godkendte ændringer kan udgives derfra. GitHub Pages beholdes kun som nuværende/midlertidig udgivelse, indtil Vercel-versionen er verificeret.
- Efter køb skal `judoteori.dk` forbindes til Vercel via DNS og konfigureres med HTTPS. Test både `judoteori.dk` og en eventuel `www`-adresse før omlægningen.
- Flyt først den offentlige trafik, når Vercel-previewet er kontrolleret med automatiske tests, tastatur, skærmlæser og mobilvisning, så der ikke opstår unødig nedetid.

### 5. Privatliv og sikkerhed

- Bevar første lancering uden konti, tracking og cookies. Det minimerer sikkerheds- og GDPR-arbejdet.
- Privatlivsside tilføjet 23. august 2026; den forklarer, at appen ikke bruger konti, cookies, sporing eller analyseværktøjer.
- Restriktiv Content Security Policy og referrer-politik er tilføjet som meta-oplysninger 24. august 2026. Politikken spærrer blandt andet eksterne forbindelser, objekter, formularindsendelse og ændring af base-URL; inline CSS og appens nuværende inline JavaScript er fortsat tilladt.
- Feedbacklydene er altid slået til; tekst og ikoner giver samme feedback uafhængigt af lyd.
- Kør `npm audit`, automatiske tests og live tilgængelighedstest før hver udgivelse.
- Undgå tredjepartsanalyse i første version. Hvis analyse senere tilføjes, skal privatliv, databehandler og eventuelt samtykke vurderes først.

### 6. Feedback

Der skal bygges en tydelig, tastatur- og skærmlæsertilgængelig feedbackformular. Den skal bede om:

- bælteniveau,
- spørgsmålet eller fejlen,
- hvad brugeren mener er korrekt,
- valgfri kontaktmail.

Formularen sender til en serverfunktion i samme Vercel-projekt, planlagt som `/api/feedback`. Modtageradresse og mailtjenestens nøgle opbevares som beskyttede miljøvariabler hos Vercel og må ikke ligge i den offentlige browserkode. Løsningen skal have validering, spambegrænsning, tilgængelig statusmeddelelse samt en opdateret privatlivstekst om, hvilke oplysninger der sendes og eventuelt opbevares.

### 7. Kvalitet og drift

- CI kører automatisk data-, browser- og axe-tests ved hvert push og pull request.
- Test alle fem bælter med tastatur og mindst NVDA/Firefox eller Chrome samt VoiceOver/Safari.
- Test mobilvisning og langsom forbindelse.
- Bevar kildefiler, pensumreference og versionshistorik i Git.
- Vedligeholdelses- og udgivelsesflowet for spørgsmål er dokumenteret i `README.md`.
- Appen viser en synlig opdateringsdato.

## Kan komme efter første lancering

- Installerbar PWA og offlinebrug.
- Statistik over træningsresultater gemt lokalt på brugerens enhed.
- Frivillig, privatlivsvenlig brugsstatistik.
- Feedbackformular med serverless backend.
- Delbare resultater.
- Separat voksenspor baseret på et valideret voksenpensum.
- Flere spørgsmål og øvelsestyper pr. bælte.

## Monetisering

Foreslået rækkefølge:

1. Lancér gratis og mål reel brug og feedback.
2. Afklar rettighederne til pensummet.
3. Undersøg en lovlig erhvervsløsning til en frivillig “Støt med 20 kr.”-betaling via MobilePay.
4. Overvej senere klubstøtte eller sponsorat som alternativer til betaling fra børn.
5. Undgå abonnement og brugerbetaling, indtil appen har dokumenteret brug og værdi.

Priser og konkrete MobilePay-vilkår skal verificeres på det tidspunkt, hvor betalingsløsningen vælges.

## Markedsføring

Første markedsføringsindsats bør være lille og målbar:

- Kontakt nogle få danske judoklubber og trænere for faglig feedback før bred lancering.
- Lav et kort opslag til relevante danske judogrupper med målgruppe, gratis adgang og kildegrundlag.
- Planlæg opslag nogle uger før klubbernes typiske gradueringer.
- Bed brugerne rapportere fejl og foreslå forbedringer.
- Mål succes på brug, gentagne besøg og konkret feedback frem for omsætning i første omgang.

## Næste milepæl

1. Udgiv versionen med blåt og brunt bælte.
2. Indhent Lars' test og faglig stikprøve.
3. Forbind repositoryet med et Vercel-preview og implementér den tilgængelige feedbackformular med `/api/feedback`; vælg mailtjeneste og modtageradresse som del af dette arbejde.
4. Afklar Judo Danmarks tilladelse.
5. Køb `judoteori.dk`, forbind det til den verificerede Vercel-udgivelse, og behold GitHub som kodearkiv.
6. Lancér den første offentlige version uden tracking og betaling.
