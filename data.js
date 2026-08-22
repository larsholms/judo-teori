// Judo-teori quiz data — 5.-3.kyu (gult, orange og grønt bælte), Børn/Ungdom
// Primær og autoritativ kilde: Judo Danmark, Gradueringsudvalget,
// Pensum 5.kyu-1.kyu, Børn/Ungdom (opdateret februar 2024), side 3-8.

const QUIZ_DATA = {
  "5kyu": {
    label: "5. kyu — Gult bælte",
    minTid: "Minimumstid 3 måneder",
    questions: [
      {
        q: "Hvad betyder O-SOTO-GARI?",
        options: ["Stor udvendig fejning", "Stor indvendig fejning", "Stor hofte", "Skulderkast"],
        answer: 0
      },
      {
        q: "Hvilken kasteteknik er O-GOSHI?",
        options: ["Flydende hofte", "Stor hofte", "Hofte hjul", "Løfte trække hofte"],
        answer: 1
      },
      {
        q: "Hvad er UKI-GOSHI?",
        options: ["Stor hofte", "Skulderkast", "Flydende hofte", "Inderlårskast"],
        answer: 2
      },
      {
        q: "SEOI-NAGE (MOROTE) betyder:",
        options: ["Skulderkast (begge hænder)", "Skulderkast (revers)", "Cirkelkast", "Krop lade falde"],
        answer: 0
      },
      {
        q: "Hvilken kontrolteknik er KESA-GATAME?",
        options: ["Side fire punkts kontrol", "Skærf kontrol", "Top fire punkts kontrol", "Skulder kontrol"],
        answer: 1
      },
      {
        q: "Hvad er KUZURE-KESA-GATAME?",
        options: ["En variation af skærf kontrol", "En variation af side kontrol", "En strangulering", "En armlås"],
        answer: 0
      },
      {
        q: "YOKO-SHIHO-GATAME er:",
        options: ["Skulder kontrol", "Side fire punkts kontrol", "Top fire punkts kontrol", "Ovenpå fire punkts kontrol"],
        answer: 1
      },
      {
        q: "Hvad betyder KUMI-KATA?",
        options: ["Balancebrydning", "Kasteudførelse", "Fundamentalt greb i gien", "Gentagne indgange"],
        answer: 2
      },
      {
        q: "REI betyder på dansk:",
        options: ["Hilsen", "Styrke", "Bevægelse", "Partner"],
        answer: 0
      },
      {
        q: "Hvad er KUZUSHI?",
        options: ["Kasteudførelse", "Åbning, balancebrydning", "Placering", "Gentagne indgange"],
        answer: 1
      },
      {
        q: "TSUKURI betyder:",
        options: ["Placering", "Kasteudførelse", "Balancebrydning", "Gentagne indgange"],
        answer: 0
      },
      {
        q: "Hvad er KAKE?",
        options: ["Placering", "Balancebrydning", "Kasteudførelse", "Aftalte øvelser"],
        answer: 2
      },
      {
        q: "UCHI-KOMI betyder:",
        options: ["Aftalte øvelser, legekamp", "Gentagne indgange", "Solotræning", "Fri træning"],
        answer: 1
      },
      {
        q: "YAKUSOKU-GEIKO er:",
        options: ["Gentagne indgange", "Aftalte øvelser, legekamp", "Fri træning", "Angribe øvelser"],
        answer: 1
      },
      {
        q: "Hvor mange vendeteknikker skal en 5.kyu-elev kende?",
        options: ["1", "2", "3", "4"],
        answer: 1
      },
      {
        q: "Hvad er USHIRO-UKEMI?",
        options: ["Sidefald", "Rullefald", "Rygfald", "Fremadfald"],
        answer: 2
      },
      {
        q: "YOKO-UKEMI betyder:",
        options: ["Rygfald", "Sidefald", "Rullefald", "Stående fald"],
        answer: 1
      },
      {
        q: "Hvad er MAE-MAWARI-UKEMI?",
        options: ["Rygfald", "Sidefald", "Rullefald", "Knæfald"],
        answer: 2
      },
      {
        q: "ZAREI er:",
        options: ["Stående hilsen", "Knælende hilsen", "Håndtryk", "Buk fra siden"],
        answer: 1
      },
      {
        q: "RITSU-REI betyder:",
        options: ["Knælende hilsen", "Stående hilsen", "Dobbelt hilsen", "Ingen hilsen"],
        answer: 1
      },
      {
        q: "Hvad betyder ordet 'JUDO' oversat?",
        options: ["Kampkunst", "Mild vej (overført betydning)", "Styrke og balance", "Ære og respekt"],
        answer: 1
      },
      {
        q: "Hvad kaldes en judoudøver på japansk?",
        options: ["Sensei", "Dojo", "Judoka", "Judogi"],
        answer: 2
      },
      {
        q: "Hvad betyder DOJO?",
        options: ["Judobeklædning", "Træningssal", "Kampkunst", "Elevgrad"],
        answer: 1
      },
      {
        q: "Hvad hedder judodragten på japansk?",
        options: ["Obi", "Judogi", "Tatami", "Gokyo"],
        answer: 1
      },
      {
        q: "Hvad betyder OBI?",
        options: ["Bælte", "Krave", "Ærme", "Måtte"],
        answer: 0
      },
      {
        q: "TATAMI er:",
        options: ["Bæltet", "Judodragten", "Træningsmåtten", "Hædrespladsen"],
        answer: 2
      },
      {
        q: "Hvad betyder GATAME (KATAME)?",
        options: ["Kaste", "Holde fast, kontrolteknik", "Fejning", "Strangulering"],
        answer: 1
      },
      {
        q: "NAGE betyder:",
        options: ["Falde", "Kaste", "Trække", "Skubbe"],
        answer: 1
      },
      {
        q: "Hvad betyder RANDORI?",
        options: ["Fri træning", "Solotræning", "Aftalt øvelse", "Opvarmning"],
        answer: 0
      },
      {
        q: "Hvad hedder tallet 'et' på japansk (bruges bl.a. i dommersprog)?",
        options: ["Ni", "Ichi", "San", "Go"],
        answer: 1
      }
    ]
  },
  "4kyu": {
    label: "4. kyu — Orange bælte",
    minTid: "Minimumstid 5 måneder",
    questions: [
      { q: "Hvad betyder TAI-OTOSHI?", options: ["Krop lade falde", "Hofte hjul", "Lille indvendig fejning", "Stor indvendig fejning"], answer: 0 },
      { q: "Hvilken kasteteknik er KOSHI-GURUMA?", options: ["Stor hofte", "Hofte hjul", "Skulderhjul", "Krop lade falde"], answer: 1 },
      { q: "Hvad betyder KO-UCHI-GARI?", options: ["Stor udvendig fejning", "Lille udvendig fejning", "Lille indvendig fejning", "Stor indvendig fejning"], answer: 2 },
      { q: "Hvad betyder O-UCHI-GARI?", options: ["Stor indvendig fejning", "Lille indvendig fejning", "Stor udvendig fejning", "Fremadgående fodfejning"], answer: 0 },
      { q: "USHIRO-KESA-GATAME er:", options: ["Side fire punkts kontrol", "Omvendt skærf kontrol", "Top fire punkts kontrol", "Skulder kontrol"], answer: 1 },
      { q: "Hvad er KAMI-SHIHO-GATAME?", options: ["Top fire punkts kontrol", "Side fire punkts kontrol", "Ovenpå fire punkts kontrol", "Skærf kontrol"], answer: 0 },
      { q: "KUZURE-KAMI-SHIHO-GATAME er:", options: ["Omvendt skærf kontrol", "Variation af top fire punkts kontrol", "Variation af side fire punkts kontrol", "Skulder kontrol"], answer: 1 },
      { q: "Hvor mange holdegrebsvariationer kræves til 4.kyu?", options: ["1", "2", "3", "4"], answer: 1 },
      { q: "Hvad hedder den naturlige basisposition?", options: ["JIGO-HONTAI", "MIGI-SHIZENTAI", "SHIZEN-HONTAI", "HIDARI-JIGOTAI"], answer: 2 },
      { q: "MIGI-SHIZENTAI betyder:", options: ["Højre naturlig position", "Venstre naturlig position", "Højre kampposition", "Basis kampposition"], answer: 0 },
      { q: "HIDARI-SHIZENTAI betyder:", options: ["Højre naturlig position", "Venstre naturlig position", "Venstre kampposition", "Naturlig basisposition"], answer: 1 },
      { q: "Hvad hedder basis-kamppositionen?", options: ["SHIZEN-HONTAI", "JIGO-HONTAI", "MIGI-JIGOTAI", "HIDARI-SHIZENTAI"], answer: 1 },
      { q: "MIGI-JIGOTAI er:", options: ["Højre kampposition", "Højre naturlig position", "Venstre kampposition", "Basisposition"], answer: 0 },
      { q: "HIDARI-JIGOTAI er:", options: ["Venstre naturlig position", "Højre kampposition", "Venstre kampposition", "Naturlig basisposition"], answer: 2 },
      { q: "Hvilket principområde skal man kende til ved 4.kyu?", options: ["Grundprincipper i Osaekomi-waza", "Grundprincipper i Shime-waza", "Grundprincipper i Kansetsu-waza", "Kata-træning"], answer: 0 },
      { q: "Hvad er OSAE-KOMI?", options: ["Et kast", "Et holdegreb", "En strangulering", "En armlås"], answer: 1 },
      { q: "Hvilke teknikker skal en 4.kyu-elev kende til for at komme fri af kontrol?", options: ["Vendeteknikker", "Frigørelsesteknikker", "Stranguleringsteknikker", "Modkast"], answer: 1 },
      { q: "Hvad betyder TANDOKU-RENSHU?", options: ["Solotræning", "Fri træning", "Aftalte øvelser", "Angribeøvelser"], answer: 0 },
      { q: "Hvad betyder KAKARI-GEIKO i pensummet?", options: ["Solotræning", "Gentagne indgange", "Angribeøvelser", "Fri træning"], answer: 2 },
      { q: "Hvilken dommerregel-rolle skal man kende til ved 4.kyu?", options: ["Som kæmper", "Som dommer", "Som tidstager", "Som listefører"], answer: 0 },
      { q: "Hvordan skal kasteteknikkerne til 4.kyu udføres?", options: ["Kun stillestående og til bedste side", "Under bevægelse og til begge sider", "Kun til venstre side", "Kun som uchi-komi"], answer: 1 },
      { q: "Hvad betyder ordleddet KO i KO-UCHI-GARI?", options: ["Stor", "Lille", "Indvendig", "Fejning"], answer: 1 },
      { q: "Hvad betyder ordleddet O i O-UCHI-GARI?", options: ["Stor", "Lille", "Udvendig", "Fod"], answer: 0 },
      { q: "Hvad betyder UCHI?", options: ["Udvendig", "Indvendig", "Fremad", "Bagfra"], answer: 1 },
      { q: "Hvad betyder GURUMA?", options: ["Hofte", "Hjul", "Fod", "Krop"], answer: 1 },
      { q: "Hvad betyder KUZURE?", options: ["Omvendt", "Variation", "Top", "Side"], answer: 1 },
      { q: "Hvad betyder MIGI?", options: ["Venstre", "Højre", "Naturlig", "Forsvar"], answer: 1 },
      { q: "Hvad betyder HIDARI?", options: ["Højre", "Venstre", "Basis", "Kamp"], answer: 1 },
      { q: "Hvad betyder JIGOTAI?", options: ["Naturlig stilling", "Forsvarsstilling", "Siddende stilling", "Stående kamp"], answer: 1 },
      { q: "Hvad er minimumstiden ved 4.kyu ifølge pensummet?", options: ["3 måneder", "4 måneder", "5 måneder", "6 måneder"], answer: 2 }
    ]
  },
  "3kyu": {
    label: "3. kyu — Grønt bælte",
    minTid: "Minimumstid 5 måneder",
    questions: [
      { q: "Hvad betyder IPPON-SEOI-NAGE?", options: ["En arm skulderkast", "Skulderkast med begge hænder", "Skulderkast i revers", "Skulderhjul"], answer: 0 },
      { q: "Hvilken kasteteknik er HARAI-GOSHI?", options: ["Flydende hofte", "Fejende hofte", "Stor hofte", "Hofte hjul"], answer: 1 },
      { q: "SASAE-TSURIKOMI-ASHI betyder:", options: ["Glidende benfejning", "Fremadgående fodfejning", "Blokering løfte trække fod", "Lille indvendig fejning"], answer: 2 },
      { q: "Hvad er DE-ASHI-HARAI?", options: ["Fremadgående fodfejning", "Glidende benfejning", "Stor indvendig fejning", "Inderlårskast"], answer: 0 },
      { q: "OKURI-ASHI-HARAI er:", options: ["Fremadgående fodfejning", "Glidende benfejning", "Blokering af fod", "Lille indvendig fejning"], answer: 1 },
      { q: "TATE-SHIHO-GATAME betyder:", options: ["Side fire punkts kontrol", "Top fire punkts kontrol", "Ovenpå fire punkts kontrol", "Skulder kontrol"], answer: 2 },
      { q: "NAMI-JUJI-JIME er:", options: ["Normal krydsstrangulering", "Omvendt krydsstrangulering", "Halv krydsstrangulering", "To hånds strangulering"], answer: 0 },
      { q: "GYAKU-JUJI-JIME er:", options: ["Normal krydsstrangulering", "Omvendt krydsstrangulering", "Halv krydsstrangulering", "To hånds strangulering"], answer: 1 },
      { q: "KATA-JUJI-JIME er:", options: ["Normal krydsstrangulering", "Omvendt krydsstrangulering", "Halv krydsstrangulering", "To hånds strangulering"], answer: 2 },
      { q: "RYO-TE-JIME betyder:", options: ["Normal krydsstrangulering", "Omvendt krydsstrangulering", "Halv krydsstrangulering", "To hånds strangulering"], answer: 3 },
      { q: "Hvor mange holdegrebsvariationer kræves til 3.kyu?", options: ["1", "2", "3", "4"], answer: 1 },
      { q: "Hvilke grundprincipper skal en 3.kyu-elev kende til?", options: ["Grundprincipper i Osaekomi-waza", "Grundprincipper i Shime-waza", "Grundprincipper i Kansetsu-waza", "Grundprincipper i Nage-no-kata"], answer: 1 },
      { q: "Hvilket forsvar skal en 3.kyu-elev kende til?", options: ["Forsvar mod Shime-waza", "Forsvar mod Kansetsu-waza", "Forsvar mod kast", "Forsvar mod holdegreb"], answer: 0 },
      { q: "Hvilken type kontrasvar skal man kende til ved 3.kyu?", options: ["Frigørelser", "Modkast", "Vendeteknikker", "Kombinationskast"], answer: 1 },
      { q: "Hvilke funktionærroller skal man kende dommerreglerne for ved 3.kyu?", options: ["Dommer og hjælper", "Træner og sekundant", "Tidstager og listefører", "Kæmper og dommer"], answer: 2 },
      { q: "AYUMI-ASHI betyder:", options: ["Normal gang", "Fod følger fod", "Kropsdrejninger", "Solotræning"], answer: 0 },
      { q: "TSUGI-ASHI betyder:", options: ["Normal gang", "Fod følger fod", "Kropsdrejninger", "Fremadgående fodfejning"], answer: 1 },
      { q: "TAI-SABAKI betyder:", options: ["Normal gang", "Fod følger fod", "Kropsdrejninger", "Balancebrydning"], answer: 2 },
      { q: "Hvad betyder SHIME-WAZA?", options: ["Holdegrebsteknik", "Stranguleringsteknik", "Låseteknik", "Kasteteknik"], answer: 1 },
      { q: "Hvad betyder JIME?", options: ["Kontrol", "Strangulering", "Kryds", "Omvendt"], answer: 1 },
      { q: "Hvad betyder JUJI?", options: ["Kryds", "Normal", "Halv", "To hænder"], answer: 0 },
      { q: "Hvad betyder NAMI i NAMI-JUJI-JIME?", options: ["Omvendt", "Normal", "Halv", "Kryds"], answer: 1 },
      { q: "Hvad betyder GYAKU?", options: ["Normal", "Omvendt eller modsat", "Halv", "Begge hænder"], answer: 1 },
      { q: "Hvad betyder RYOTE?", options: ["En hånd", "To hænder", "Kryds", "Arm"], answer: 1 },
      { q: "Hvad betyder IPPON?", options: ["Punkt eller point", "En arm", "Skulder", "Kast"], answer: 0 },
      { q: "Hvad betyder HARAI (BARAI)?", options: ["Blokering", "Fejning", "Glidende", "Fremad"], answer: 1 },
      { q: "Hvad betyder SASAE?", options: ["Fejning", "Blokering", "Løfte", "Trække"], answer: 1 },
      { q: "Hvad betyder OKURI?", options: ["Fremadgående", "Glidende", "Indvendig", "Fejende"], answer: 1 },
      { q: "Hvad betyder TATE?", options: ["Side", "Top", "Lodret eller ovenpå", "Skulder"], answer: 2 },
      { q: "Hvad er minimumstiden ved 3.kyu ifølge pensummet?", options: ["3 måneder", "4 måneder", "5 måneder", "6 måneder"], answer: 2 }
    ]
  },
  "2kyu": { label: "2. kyu — Blåt bælte", locked: true },
  "1kyu": { label: "1. kyu — Brunt bælte", locked: true }
};
