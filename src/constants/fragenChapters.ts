export const fragenChapters = {
  fragen_genel: {
    title: "Genel Test Soruları",
    description: "Çeşitli konularda genel test soruları",
    subChapters: [
      "Genel.1 Temel Kavramlar",
      "Genel.2 Test Teknikleri",
      "Genel.3 Test Yönetimi",
      "Genel.4 Pratik Uygulamalar",
    ],
  },
  fragen_deutsch: {
    title: "Almanca Test Soruları",
    description: "Almanca dilinde hazırlanmış test soruları",
    subChapters: [
      "Deutsch.1 Grundlagen",
      "Deutsch.2 Fortgeschritten",
      "Deutsch.3 Praxis",
    ],
  },
  fragen_praxis: {
    title: "Pratik Test Soruları",
    description: "Gerçek senaryolara dayalı pratik sorular",
    subChapters: [
      "Praxis.1 Web Testing",
      "Praxis.2 Mobile Testing",
      "Praxis.3 API Testing",
      "Praxis.4 Performance Testing",
    ],
  },
  fragen_mixed: {
    title: "Karışık Sorular",
    description: "Çeşitli kaynaklardan derlenmiş sorular",
    subChapters: [
      "Mixed.1 Kolay Seviye",
      "Mixed.2 Orta Seviye",
      "Mixed.3 Zor Seviye",
    ],
  },
};

export type FragenChapter =
  (typeof fragenChapters)[keyof typeof fragenChapters];
export type FragenChapterKey = keyof typeof fragenChapters;
