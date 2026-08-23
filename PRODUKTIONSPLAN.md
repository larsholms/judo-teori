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

- Krediter Judo Danmark som kilde med dokumenttitel og opdateringsdato.
- Gør det klart, at appen er uafhængig og ikke en officiel Judo Danmark-app.
- Afklar med Judo Danmark, om brugen og bearbejdningen af deres ophavsretligt beskyttede pensum kan godkendes, især før markedsføring eller monetisering.
- Tilføj kontaktoplysninger og en kort ansvarstekst.

### 4. Domæne og hosting

- `judoteori.dk` gav ingen registrering i Punktum dk's WHOIS og ingen DNS-opslag ved kontrollen; domænet ser derfor ledigt ud, men tilgængeligheden skal kontrolleres igen umiddelbart før køb.
- GitHub Pages kan fortsat bruges som hosting til den statiske app.
- Efter køb skal domænet forbindes til GitHub Pages via DNS og konfigureres med HTTPS.
- Tilføj domænet i repoets Pages-indstillinger og test både `judoteori.dk` og en eventuel `www`-adresse.

### 5. Privatliv og sikkerhed

- Bevar første lancering uden konti, tracking og cookies. Det minimerer sikkerheds- og GDPR-arbejdet.
- Tilføj en kort privatlivsside, som forklarer, at appen ikke indsamler personoplysninger.
- Tilføj en restriktiv Content Security Policy og relevante sikkerhedsmeta-oplysninger, hvor GitHub Pages tillader det.
- Kør `npm audit`, automatiske tests og live tilgængelighedstest før hver udgivelse.
- Undgå tredjepartsanalyse i første version. Hvis analyse senere tilføjes, skal privatliv, databehandler og eventuelt samtykke vurderes først.

### 6. Feedback

Første version bør bruge en tydelig, tastatur- og skærmlæsertilgængelig kontaktmulighed til en dedikeret feedbackmail. Den skal bede om:

- bælteniveau,
- spørgsmålet eller fejlen,
- hvad brugeren mener er korrekt,
- valgfri kontaktmail.

Et egentligt webformularsystem kan tilføjes senere. Det kræver en backend eller tredjepart og dermed mere arbejde med spam, opbevaring og privatliv.

### 7. Kvalitet og drift

- Kør CI automatisk ved hvert push.
- Test alle fem bælter med tastatur og mindst NVDA/Firefox eller Chrome samt VoiceOver/Safari.
- Test mobilvisning og langsom forbindelse.
- Bevar kildefiler, pensumreference og versionshistorik i Git.
- Dokumentér, hvordan spørgsmål opdateres, når Judo Danmark ændrer pensummet.
- Tilføj en synlig versions- eller opdateringsdato i appen.

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
3. Tilføj kilde-, målgruppe- og kontakttekst.
4. Afklar Judo Danmarks tilladelse.
5. Køb og forbind domænet.
6. Lancér den første offentlige version uden tracking og betaling.
