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

## Udgivelse

GitHub Actions kører test ved push og pull request. GitHub Pages udgiver fra repoet. Efter en udgivelse kontrolleres startsiden og mindst ét helt quizflow med tastatur og skærmlæser; mobilvisning og langsom forbindelse stikprøves også.

Se `PRODUKTIONSPLAN.md` for åbne krav før offentlig lancering.