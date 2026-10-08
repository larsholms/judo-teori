# Judo-Teori Træner

En statisk, tilgængelig dansk quiz til træning af judoteori for børn og unge på 6-14 år. Appen er et uafhængigt træningsværktøj og bygger på Judo Danmarks officielle *Gradueringspensum børn og ungdom 6-14 år*, opdateret februar 2024.

## Lokal kontrol

Kræver Node.js og npm.

```sh
npm ci
npm test
npm audit
```

Testpakken kontrollerer spørgsmålsdata, centrale brugerforløb, kontrastkrav, sikkerhedspolitikker og automatiske axe-tilgængelighedsregler. `index.html` kan derefter åbnes direkte i en browser.

## Opdatering af spørgsmål

Når Judo Danmark ændrer pensummet:

1. Hent den nye officielle udgave fra Judo Danmarks pensumside, og notér dokumentets opdateringsdato.
2. Sammenlign hvert berørt bælteniveau med den eksisterende spørgsmålsbank i `data.js`.
3. Ret spørgsmål og svar ud fra kilden. Undgå faglige antagelser; behold pensummets formulering, når ordlisten og en niveauside kan læses forskelligt.
4. Opdatér niveauets `sourcePages`, hvis sidetallene ændres.
5. Bevar fire unikke svarmuligheder pr. spørgsmål og et gyldigt `answer`-indeks.
6. Opdatér kildedatoen og den synlige “Senest opdateret”-dato i `index.html`.
7. Kør `npm test` og `npm audit`.
8. Få ændringerne stikprøvet af en judofaglig person før offentlig udgivelse.

Kilden skal krediteres, men appen må ikke fremstilles som en officiel Judo Danmark-app. Større ændringer i kildegrundlaget skal også rettighedsafklares med Judo Danmark.

## Feedbackfunktion

Ved hvert spørgsmål kan brugeren klikke “Rapportér fejl i dette spørgsmål” og beskrive en fejl i spørgsmålet eller svaret. Bælteniveau, spørgsmål og det korrekte svar (samt brugerens eget svar, hvis spørgsmålet er besvaret) medsendes automatisk; beskrivelse er obligatorisk, forslag til rettelse og kontaktmail er valgfrie.

Formularen sender til `/api/feedback`, en Vercel Node.js-serverfunktion (`api/feedback.js`, med logik i `lib/`). Den kører bevidst på Node.js-runtimen og ikke Edge Runtime, fordi SMTP-klienten i `lib/smtpClient.js` bruger rå TLS-sockets, som Edge Runtime ikke understøtter.

### Mailafsendelse

Funktionen vælger mailudbyder ud fra miljøvariabler (opsættes hos Vercel, aldrig i koden eller i Git):

- **SMTP.dk (primær)**: `SMTP_HOST`, `SMTP_PORT` (typisk 465), `SMTP_USER`, `SMTP_PASSWORD`, valgfrit `SMTP_FROM` (ellers bruges `SMTP_USER`). Klienten taler kun implicit TLS (port 465) og ikke STARTTLS (587) — det er et bevidst designvalg for at undgå STARTTLS-nedgraderingsangreb og holde den håndskrevne SMTP-klient simpel. Hvis SMTP.dk i praksis ikke tilbyder port 465 fra Vercels servermiljø, er det den konkrete tekniske blokering, der begrunder skiftet til Resend — det kan kun bekræftes, når de rigtige adgangsoplysninger sættes op hos Vercel, hvilket ikke er sket under selve udviklingen af denne funktion.
- **Resend (fallback)**: bruges automatisk, hvis SMTP.dk mangler eller fejler, og `RESEND_API_KEY` og `RESEND_FROM` er sat. Kaldes via Resends almindelige HTTP-API.
- `FEEDBACK_TO_EMAIL`: modtageradressen (Lars' mail). Står kun som miljøvariabel hos Vercel — aldrig i browserkoden eller i repoet.

Den offentlige Vercel-udgave skal desuden have firewallreglen `Judo feedback rate limit`: kun `POST /api/feedback`, højst 5 forespørgsler pr. IP pr. 10 minutter, og afvisning over grænsen. Den fælles Vercel-firewall er den autoritative ratebegrænsning på tværs af serverless-instanser; API'ets lokale tæller er kun ekstra forsvar i en varm instans.

### Spam- og misbrugsbeskyttelse

- Et skjult honeypot-felt (`website`); udfyldes det, svares der stille med succes uden at sende en mail.
- Et minimumstidspunkt på 3 sekunder fra formularen åbnes til den indsendes; hurtigere indsendelser afvises på samme stille måde.
- En simpel pr.-IP-rate-grænse i serverfunktionens hukommelse (bedste forsøg — nulstilles ved en ny, kold serverless-instans).
- Validering af feltlængder og af en eventuel e-mailadresses format, se `lib/feedbackValidation.js`.

Serverfunktionen svarer altid med en generisk, sikker fejltekst til klienten og logger kun tekniske detaljer server-side.

### Test

`npm test` inkluderer enhedstests af validering, SMTP-protokolklienten (kun mod en lokal loopback-testserver — ingen forbindelse til SMTP.dk, Resend eller andre tredjeparter), valg af mailudbyder og selve HTTP-handleren. Se `test-feedback-validation.js`, `test-smtp-client.js`, `test-mail-sender.js` og `test-feedback-handler.js`.

## Udgivelse

GitHub Actions kører test ved push og pull request. GitHub Pages udgiver fra repoet. Efter en udgivelse kontrolleres startsiden og mindst ét helt quizflow med tastatur og skærmlæser; mobilvisning og langsom forbindelse stikprøves også.

Se `PRODUKTIONSPLAN.md` for åbne krav før offentlig lancering.