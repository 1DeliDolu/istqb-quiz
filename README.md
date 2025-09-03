# ISTQB Quiz Application

Modern ve kapsamlı bir ISTQB Foundation Level sertifikası hazırlık uygulaması. Bu uygulama ile ISTQB, Udemy ve Fragen kaynaklarından quiz soruları çözebilir, performansınızı takip edebilir ve sorularınızı yönetebilirsiniz.

## 🚀 Özellikler

### 📚 Çoklu Quiz Kaynağı

- **ISTQB Foundation Level**: Resmi ISTQB konularına göre organize edilmiş sorular
- **Udemy**: Udemy kurslarından derlenen pratik sorular
- **Fragen**: Genel sınavlarda çıkan sorular ve örnekler

### 🎯 Quiz Özellikleri

- Bölüm ve alt bölüm bazında soru filtreleme
- Anında doğru/yanlış geri bildirim
- Detaylı açıklamalar ile öğrenme desteği
- Skor takibi ve performans analizi
- Quiz sonuçlarını MySQL veritabanında saklama

### 📊 İstatistik Sistemi

- Kullanıcı bazlı performans istatistikleri
- Bölüm ve kaynak bazında başarı oranları
- Geçmiş quiz sonuçlarını görüntüleme
- İlerleme takibi

### ⚙️ Yönetim Paneli

- Soru ekleme, düzenleme ve silme
- Toplu soru içe/dışa aktarma
- Kullanıcı yönetimi
- Veri yönetimi araçları

## 🛠️ Teknoloji Stack

### Frontend

- **React 18** - Modern React hooks ve functional components
- **TypeScript** - Type safety ve geliştirici deneyimi
- **Vite** - Hızlı geliştirme ve build sistemi
- **Tailwind CSS** - Utility-first CSS framework
- **React Router** - Client-side routing
- **Radix UI** - Accessible UI components

### Backend

- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **MySQL** - İlişkisel veritabanı
- **JWT** - Kimlik doğrulama
- **bcrypt** - Şifre hashleme

## 🚀 Kurulum

### Gereksinimler

- Node.js (v18 veya üzeri)
- MySQL (v8 veya üzeri)
- npm veya yarn

### 1. Repository'yi klonlayın

```bash
git clone https://github.com/1DeliDolu/istqb-quiz.git
cd istqb-quiz
```

### 2. Backend Kurulumu

```bash
cd server
npm install

# MySQL veritabanını oluşturun ve yapılandırın
mysql -u root -p < database/schema.sql

# Sunucuyu başlatın
npm start
```

### 3. Frontend Kurulumu

```bash
# Ana dizine dönün
cd ..

# Bağımlılıkları yükleyin
npm install

# Geliştirme sunucusunu başlatın
npm run dev
```

### 4. Uygulama Erişimi

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3002

## 📖 Kullanım

### 🎓 Quiz Çözme

1. Ana sayfadan istediğiniz quiz türünü seçin (ISTQB/Udemy/Fragen)
2. Bölüm ve alt bölüm seçerek quiz başlatın
3. Soruları cevaplayın ve anında geri bildirim alın
4. Quiz sonunda performansınızı görüntüleyin

### 📊 İstatistik Takibi

1. "İstatistikler" menüsünden performansınızı görüntüleyin
2. Bölüm bazında başarı oranlarınızı inceleyin
3. Zayıf olduğunuz konuları tespit edin

### ⚙️ Soru Yönetimi (Admin)

1. CSM menüsünden "Soru Ekle" seçeneklerini kullanın
2. Mevcut soruları "Soruları Görüntüle" sayfasından düzenleyin
3. Toplu işlemler için veri yönetimi araçlarını kullanın

## 🔐 Kimlik Doğrulama

Uygulama JWT tabanlı kimlik doğrulama kullanır:

- Kullanıcı kayıt/giriş sistemi
- Token tabanlı oturum yönetimi
- Güvenli API erişimi

## 🏗️ Proje Yapısı

```
istqb-quiz/
├── src/                    # Frontend kaynak kodu
│   ├── components/         # React bileşenleri
│   ├── pages/             # Sayfa bileşenleri
│   ├── services/          # API servisleri
│   ├── constants/         # Sabit değerler
│   └── types/            # TypeScript tip tanımları
├── server/                # Backend kaynak kodu
│   ├── database/          # Veritabanı şemaları
│   ├── routes/           # API rotaları
│   └── middleware/       # Express middleware'ları
└── public/               # Statik dosyalar
```

## 🤝 Katkıda Bulunma

1. Fork edin
2. Feature branch oluşturun (`git checkout -b feature/AmazingFeature`)
3. Değişikliklerinizi commit edin (`git commit -m 'Add some AmazingFeature'`)
4. Branch'inizi push edin (`git push origin feature/AmazingFeature`)
5. Pull Request oluşturun

## 📄 Lisans

Bu proje MIT lisansı altında lisanslanmıştır.

## 📞 İletişim

Proje Sahibi - [@1DeliDolu](https://github.com/1DeliDolu)

Proje Linki: [https://github.com/1DeliDolu/istqb-quiz](https://github.com/1DeliDolu/istqb-quiz)


demo question.
![demo_question](image.png)
