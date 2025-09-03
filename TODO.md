# ISTQB Quiz - TODO List

## 🔥 Öncelikli Özellikler

### 📚 Dokümantasyon Sistemi

- [ ] **Dokümantasyon modülü oluştur**
  - [ ] Her ISTQB bölümü için ayrı dokümantasyon sayfaları
  - [ ] Markdown formatında içerik desteği
  - [ ] Arama ve filtreleme özellikleri
  - [ ] Navigasyon menüsüne "Dokümantasyon" sekmesi ekle

### 🎯 Akıllı Öneri Sistemi

- [ ] **Yanlış cevap analizi**
  - [ ] Kullanıcının yanlış cevapladığı soruları takip et
  - [ ] Yanlış cevaplanan soruların ait olduğu bölümü tespit et
  - [ ] İlgili ISTQB bölümü dokümantasyonunu öner
  - [ ] "Bu konuyu çalışmak ister misiniz?" popup'ı ekle

### 📖 Dokümantasyon İçeriği

- [ ] **ISTQB Foundation Level konuları**
  - [ ] Chapter 1: Fundamentals of Testing
  - [ ] Chapter 2: Testing Throughout the SDLC
  - [ ] Chapter 3: Static Testing
  - [ ] Chapter 4: Test Analysis and Design
  - [ ] Chapter 5: Managing Test Activities
  - [ ] Chapter 6: Test Tools

### 🔗 Entegrasyon

- [ ] **Quiz-Dokümantasyon bağlantısı**
  - [ ] Quiz sonuç sayfasında ilgili bölüm önerileri
  - [ ] Dokümantasyondan ilgili quiz'lere hızlı erişim
  - [ ] Bookmark sistemi (favori konular)
  - [ ] Okuma ilerlemesi takibi

### 🎨 UI/UX İyileştirmeleri

- [ ] **Dokümantasyon sayfası tasarımı**
  - [ ] Responsive dokümantasyon layout'u
  - [ ] Dark/Light mode desteği
  - [ ] İçindekiler tablosu (TOC)
  - [ ] Syntax highlighting (kod örnekleri için)
  - [ ] Print-friendly format

### 📊 İstatistikler

- [ ] **Öğrenme analizi**
  - [ ] Hangi konularda zayıf olduğunu göster
  - [ ] Dokümantasyon okuma süreleri
  - [ ] Konulara göre quiz başarı oranları
  - [ ] Önerilen çalışma planı

## 🔧 Teknik Detaylar

### Dokümantasyon Yapısı

```
src/
├── components/
│   └── documentation/
│       ├── DocumentationLayout.tsx
│       ├── ChapterContent.tsx
│       ├── TableOfContents.tsx
│       └── RecommendationPopup.tsx
├── pages/
│   └── DocumentationPage.tsx
├── data/
│   └── documentation/
│       ├── chapter1.md
│       ├── chapter2.md
│       └── ...
└── services/
    └── recommendationService.ts
```

### Öneri Algoritması

1. Quiz bitiminde yanlış cevapları analiz et
2. Her yanlış cevabın ait olduğu ISTQB bölümünü belirle
3. En çok hata yapılan 3 bölümü öner
4. Kullanıcıya direkt dokümantasyon linkini sun

## ✅ Tamamlanan Özellikler

- [x] Pagination navigation sistemi
- [x] Beige button teması (tüm proje)
- [x] Hover dropdown navigation
- [x] Two-column layout navigation
- [x] Quiz sistemi (ISTQB, Udemy, Fragen)
- [x] Kullanıcı istatistikleri
- [x] Responsive tasarım
