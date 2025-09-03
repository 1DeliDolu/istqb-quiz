export const udemyChapters = {
  udemy_1: {
    title: "1. Einführung",
    description: "Über den Ausbilder und ISTQB-Prüfung Einführung",
    subChapters: [
      "1.1 Über den Ausbilder",
      "1.2 ISTQB-Prüfung - Einführung und Ablauf",
    ],
  },
  udemy_2: {
    title: "2. Testgrundlagen",
    description: "Grundlegende Testkonzepte und -prinzipien",
    subChapters: [
      "2.1 Quiz 1 - Grundlagen",
      "2.2 Quiz 2 - Testprinzipien",
      "2.3 Quiz 3 - Testaktivitäten",
    ],
  },
  udemy_3: {
    title: "3. Testen während des SDLC",
    description: "Testen im Softwareentwicklungslebenszyklus",
    subChapters: [
      "3.1 Quiz 4 - SDLC Grundlagen",
      "3.2 Quiz 5 - Teststufen",
      "3.3 Quiz 6 - Testarten",
    ],
  },
  udemy_4: {
    title: "4. Statisches Testen",
    description: "Statische Testverfahren und Reviews",
    subChapters: [
      "4.1 Quiz 7 - Statische Analyse",
      "4.2 Quiz 8 - Review-Prozess",
      "4.3 Quiz 9 - Review-Arten",
    ],
  },
  udemy_5: {
    title: "5. Testanalyse und Testentwurf",
    description: "Black-Box und White-Box Testverfahren",
    subChapters: [
      "5.1 Quiz 10 - Black-Box Verfahren",
      "5.2 Quiz 11 - White-Box Verfahren",
      "5.3 Quiz 12 - Testfallentwurf",
      "5.4 Quiz 13 - Äquivalenzklassen",
    ],
  },
  udemy_6: {
    title: "6. Verwaltung der Testaktivitäten",
    description: "Testplanung, -steuerung und -organisation",
    subChapters: [
      "6.1 Quiz 14 - Testplanung",
      "6.2 Quiz 15 - Teststeuerung",
      "6.3 Quiz 16 - Testorganisation",
      "6.4 Quiz 17 - Risikomanagement",
    ],
  },
  udemy_7: {
    title: "7. Testwerkzeuge",
    description: "Werkzeugunterstützung für das Testen",
    subChapters: [
      "7.1 Quiz 18 - Testwerkzeuge",
      "7.2 Quiz 19 - Testautomatisierung",
    ],
  },
  udemy_8: {
    title: "8. Komplette Probeklausuren",
    description: "Vollständige Übungsprüfungen",
    subChapters: [
      "8.1 Beispielprüfung 1",
      "8.2 Beispielprüfung 2",
      "8.3 Beispielprüfung 3",
    ],
  },
};

export type UdemyChapter = (typeof udemyChapters)[keyof typeof udemyChapters];
export type UdemyChapterKey = keyof typeof udemyChapters;
