-- ISTQB Quiz App Database Schema
CREATE DATABASE IF NOT EXISTS istqb_quiz_app
    DEFAULT CHARACTER SET = 'utf8mb4'
    DEFAULT COLLATE = 'utf8mb4_unicode_ci';

USE istqb_quiz_app;

-- Bölümler tablosu (Ana bölümler)
CREATE TABLE IF NOT EXISTS chapters (
    id VARCHAR(50) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Alt bölümler tablosu
CREATE TABLE IF NOT EXISTS sub_chapters (
    id VARCHAR(50) PRIMARY KEY,
    chapter_id VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (chapter_id) REFERENCES chapters(id) ON DELETE CASCADE
);

-- Sorular tablosu
CREATE TABLE IF NOT EXISTS questions (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    chapter_id VARCHAR(50) NOT NULL,
    sub_chapter_id VARCHAR(50),
    question TEXT NOT NULL,
    explanation TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (chapter_id) REFERENCES chapters(id) ON DELETE CASCADE,
    FOREIGN KEY (sub_chapter_id) REFERENCES sub_chapters(id) ON DELETE SET NULL
);

-- Seçenekler tablosu
CREATE TABLE IF NOT EXISTS question_options (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    question_id BIGINT NOT NULL,
    option_text TEXT NOT NULL,
    is_correct BOOLEAN DEFAULT FALSE,
    option_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE
);

-- Ana bölümler için başlangıç verileri
INSERT INTO chapters (id, title, description) VALUES
-- ISTQB Bölümleri
('0', '0. Einführung', 'Giriş bölümü ve temel kavramlar'),
('1', '1. Test Temelleri', 'Yazılım test sürecinin temel kavramları'),
('2', '2. Yazılım Geliştirme Yaşam Döngüsü Boyunca Test', 'Test etkinliklerinin SDLC içerisindeki yeri'),
('3', '3. Statik Test', 'Kod çalıştırılmadan yapılan test türleri'),
('4', '4. Test Analizi ve Tasarımı', 'Test senaryolarının oluşturulması ve tasarımı'),
('5', '5. Test Yönetimi', 'Test süreçlerinin yönetimi ve planlaması'),
('6', '6. Test Araçları', 'Test süreçlerinde kullanılan araçlar'),
('chapter1', '1. Test Temelleri (Legacy)', 'Eski format - geriye dönük uyumluluk'),
('chapter2', '2. SDLC Test (Legacy)', 'Eski format - geriye dönük uyumluluk'),
('chapter3', '3. Statik Test (Legacy)', 'Eski format - geriye dönük uyumluluk'),
('chapter4', '4. Test Analizi (Legacy)', 'Eski format - geriye dönük uyumluluk'),
('chapter5', '5. Test Yönetimi (Legacy)', 'Eski format - geriye dönük uyumluluk'),
('chapter6', '6. Test Araçları (Legacy)', 'Eski format - geriye dönük uyumluluk'),

-- Udemy Bölümleri
('udemy_1', '1. Einführung', 'Über den Ausbilder und ISTQB-Prüfung Einführung'),
('udemy_2', '2. Testgrundlagen', 'Grundlegende Testkonzepte und -prinzipien'),
('udemy_3', '3. Testen während des SDLC', 'Testen im Softwareentwicklungslebenszyklus'),
('udemy_4', '4. Statisches Testen', 'Statische Testverfahren und Reviews'),
('udemy_5', '5. Testanalyse und Testentwurf', 'Black-Box und White-Box Testverfahren'),
('udemy_6', '6. Verwaltung der Testaktivitäten', 'Testplanung, -steuerung und -organisation'),
('udemy_7', '7. Testwerkzeuge', 'Werkzeugunterstützung für das Testen'),
('udemy_8', '8. Komplette Probeklausuren', 'Vollständige Übungsprüfungen'),

-- Fragen Bölümleri
('fragen_genel', 'Genel Test Soruları', 'Çeşitli konularda genel test soruları'),
('fragen_deutsch', 'Almanca Test Soruları', 'Almanca dilinde hazırlanmış test soruları'),
('fragen_praxis', 'Pratik Test Soruları', 'Gerçek senaryolara dayalı pratik sorular'),
('fragen_mixed', 'Karışık Sorular', 'Çeşitli kaynaklardan derlenmiş sorular')
ON DUPLICATE KEY UPDATE title = VALUES(title), description = VALUES(description);

-- Alt bölümler için başlangıç verileri  
INSERT INTO sub_chapters (id, chapter_id, title) VALUES
-- ISTQB Bölüm 0 alt başlıkları
('0-1', '0', '0.1 Zweck dieses Dokuments'),
('0-2', '0', '0.2 ISTQB Certified Tester'),
('0-3', '0', '0.3 Foundation Level Lehrplan'),

-- ISTQB Bölüm 1 alt başlıkları
('1-1', '1', '1.1 Test Nedir ve Neden Gereklidir?'),
('1-2', '1', '1.2 Test İlkeleri'),
('1-3', '1', '1.3 Test Süreçleri'),
('1-4', '1', '1.4 Test Psikolojisi'),
('1-5', '1', '1.5 Etik Kodlar'),

-- ISTQB Bölüm 2 alt başlıkları
('2-1', '2', '2.1 Yazılım Geliştirme Yaşam Döngüsü Modelleri'),
('2-2', '2', '2.2 Test Seviyeleri'),
('2-3', '2', '2.3 Test Türleri'),
('2-4', '2', '2.4 Bakım Testi'),

-- ISTQB Bölüm 3 alt başlıkları
('3-1', '3', '3.1 Statik Test Temelleri'),
('3-2', '3', '3.2 İnceleme Süreci'),
('3-3', '3', '3.3 Statik Analiz Araçları'),

-- ISTQB Bölüm 4 alt başlıkları
('4-1', '4', '4.1 Test Geliştirme Süreci'),
('4-2', '4', '4.2 Test Tasarım Teknikleri'),
('4-3', '4', '4.3 Kara Kutu Test Teknikleri'),
('4-4', '4', '4.4 Beyaz Kutu Test Teknikleri'),
('4-5', '4', '4.5 Deneyim Temelli Test Teknikleri'),

-- ISTQB Bölüm 5 alt başlıkları
('5-1', '5', '5.1 Test Organizasyonu'),
('5-2', '5', '5.2 Test Planlama ve Tahmin'),
('5-3', '5', '5.3 Test İzleme ve Kontrol'),
('5-4', '5', '5.4 Konfigurasyon Yönetimi'),
('5-5', '5', '5.5 Risk ve Test'),
('5-6', '5', '5.6 Defekt Yönetimi'),

-- ISTQB Bölüm 6 alt başlıkları
('6-1', '6', '6.1 Test Aracı Konuları'),
('6-2', '6', '6.2 Test Araçlarının Etkili Kullanımı'),

-- Legacy chapter formatları için alt başlıklar
('legacy-1-1', 'chapter1', '1.1 Test Nedir ve Neden Gereklidir?'),
('legacy-1-2', 'chapter1', '1.2 Test İlkeleri'),
('legacy-2-1', 'chapter2', '2.1 SDLC Modelleri'),
('legacy-3-1', 'chapter3', '3.1 Statik Test Temelleri'),
('legacy-4-1', 'chapter4', '4.1 Test Geliştirme Süreci'),
('legacy-5-1', 'chapter5', '5.1 Test Organizasyonu'),
('legacy-6-1', 'chapter6', '6.1 Test Aracı Konuları'),

-- Udemy Bölümleri Alt Başlıkları
('udemy_1_1', 'udemy_1', '1.1 Über den Ausbilder'),
('udemy_1_2', 'udemy_1', '1.2 ISTQB-Prüfung - Einführung und Ablauf'),

('udemy_2_1', 'udemy_2', '2.1 Quiz 1 - Grundlagen'),
('udemy_2_2', 'udemy_2', '2.2 Quiz 2 - Testprinzipien'),
('udemy_2_3', 'udemy_2', '2.3 Quiz 3 - Testaktivitäten'),

('udemy_3_1', 'udemy_3', '3.1 Quiz 4 - SDLC Grundlagen'),
('udemy_3_2', 'udemy_3', '3.2 Quiz 5 - Teststufen'),
('udemy_3_3', 'udemy_3', '3.3 Quiz 6 - Testarten'),

('udemy_4_1', 'udemy_4', '4.1 Quiz 7 - Statische Analyse'),
('udemy_4_2', 'udemy_4', '4.2 Quiz 8 - Review-Prozess'),
('udemy_4_3', 'udemy_4', '4.3 Quiz 9 - Review-Arten'),

('udemy_5_1', 'udemy_5', '5.1 Quiz 10 - Black-Box Verfahren'),
('udemy_5_2', 'udemy_5', '5.2 Quiz 11 - White-Box Verfahren'),
('udemy_5_3', 'udemy_5', '5.3 Quiz 12 - Testfallentwurf'),
('udemy_5_4', 'udemy_5', '5.4 Quiz 13 - Äquivalenzklassen'),

('udemy_6_1', 'udemy_6', '6.1 Quiz 14 - Testplanung'),
('udemy_6_2', 'udemy_6', '6.2 Quiz 15 - Teststeuerung'),
('udemy_6_3', 'udemy_6', '6.3 Quiz 16 - Testorganisation'),
('udemy_6_4', 'udemy_6', '6.4 Quiz 17 - Risikomanagement'),

('udemy_7_1', 'udemy_7', '7.1 Quiz 18 - Testwerkzeuge'),
('udemy_7_2', 'udemy_7', '7.2 Quiz 19 - Testautomatisierung'),

('udemy_8_1', 'udemy_8', '8.1 Beispielprüfung 1'),
('udemy_8_2', 'udemy_8', '8.2 Beispielprüfung 2'),
('udemy_8_3', 'udemy_8', '8.3 Beispielprüfung 3'),

-- Fragen Bölümleri Alt Başlıkları
('fragen_genel_1', 'fragen_genel', 'Genel.1 Temel Kavramlar'),
('fragen_genel_2', 'fragen_genel', 'Genel.2 Test Teknikleri'),
('fragen_genel_3', 'fragen_genel', 'Genel.3 Test Yönetimi'),
('fragen_genel_4', 'fragen_genel', 'Genel.4 Pratik Uygulamalar'),

('fragen_deutsch_1', 'fragen_deutsch', 'Deutsch.1 Grundlagen'),
('fragen_deutsch_2', 'fragen_deutsch', 'Deutsch.2 Fortgeschritten'),
('fragen_deutsch_3', 'fragen_deutsch', 'Deutsch.3 Praxis'),

('fragen_praxis_1', 'fragen_praxis', 'Praxis.1 Web Testing'),
('fragen_praxis_2', 'fragen_praxis', 'Praxis.2 Mobile Testing'),
('fragen_praxis_3', 'fragen_praxis', 'Praxis.3 API Testing'),
('fragen_praxis_4', 'fragen_praxis', 'Praxis.4 Performance Testing'),

('fragen_mixed_1', 'fragen_mixed', 'Mixed.1 Kolay Seviye'),
('fragen_mixed_2', 'fragen_mixed', 'Mixed.2 Orta Seviye'),
('fragen_mixed_3', 'fragen_mixed', 'Mixed.3 Zor Seviye')
ON DUPLICATE KEY UPDATE title = VALUES(title);
