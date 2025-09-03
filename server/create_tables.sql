-- ISTQB Quiz App için MySQL Table Creation Script
-- Bu dosyayı MySQL'de çalıştırın

-- Veritabanını oluştur
CREATE DATABASE IF NOT EXISTS istqb_quiz_app
    DEFAULT CHARACTER SET = 'utf8mb4'
    DEFAULT COLLATE = 'utf8mb4_unicode_ci';

USE istqb_quiz_app;

-- Mevcut tabloları sil (temiz başlangıç için)
DROP TABLE IF EXISTS question_options;
DROP TABLE IF EXISTS questions;
DROP TABLE IF EXISTS sub_chapters;
DROP TABLE IF EXISTS chapters;

-- Ana bölümler tablosu
CREATE TABLE chapters (
    id VARCHAR(50) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Alt bölümler tablosu
CREATE TABLE sub_chapters (
    id VARCHAR(50) PRIMARY KEY,
    chapter_id VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (chapter_id) REFERENCES chapters(id) ON DELETE CASCADE
);

-- Sorular tablosu
CREATE TABLE questions (
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
CREATE TABLE question_options (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    question_id BIGINT NOT NULL,
    option_text TEXT NOT NULL,
    is_correct BOOLEAN DEFAULT FALSE,
    option_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE
);

-- ISTQB Bölümler
INSERT INTO chapters (id, title, description) VALUES
('0', '0. Einführung', 'ISTQB Giriş bölümü'),
('1', '1. Grundlagen des Testens', 'Test temellerini kapsayan bölüm'),
('2', '2. Testen im Softwarelebenszyklus', 'Yazılım yaşam döngüsünde test'),
('3', '3. Statisches Testen', 'Statik test teknikleri'),
('4', '4. Testanalyse und -entwurf', 'Test analizi ve tasarımı'),
('5', '5. Testmanagement', 'Test yönetimi süreçleri'),
('6', '6. Testwerkzeuge', 'Test araçları ve teknikleri');

-- UDEMY Bölümler
INSERT INTO chapters (id, title, description) VALUES
('udemy_1', 'Udemy Bölüm 1', 'Udemy kursu bölüm 1'),
('udemy_2', 'Udemy Bölüm 2', 'Udemy kursu bölüm 2'),
('udemy_3', 'Udemy Bölüm 3', 'Udemy kursu bölüm 3'),
('udemy_4', 'Udemy Bölüm 4', 'Udemy kursu bölüm 4'),
('udemy_5', 'Udemy Bölüm 5', 'Udemy kursu bölüm 5'),
('udemy_6', 'Udemy Bölüm 6', 'Udemy kursu bölüm 6');

-- FRAGEN (Manuel) Bölümler - bunlar dinamik olarak eklenecek
INSERT INTO chapters (id, title, description) VALUES
('fragen_genel', 'Fragen - Genel Sorular', 'Manuel eklenen genel sorular');

-- ISTQB Alt Bölümler
INSERT INTO sub_chapters (id, chapter_id, title) VALUES
-- Bölüm 0
('0-1', '0', '0.1 Zweck dieses Dokuments'),
('0-2', '0', '0.2 ISTQB Certified Tester'),
('0-3', '0', '0.3 Foundation Level Lehrplan'),

-- Bölüm 1
('1-1', '1', '1.1 Was ist Testen?'),
('1-2', '1', '1.2 Warum ist Testen notwendig?'),
('1-3', '1', '1.3 Grundsätze des Testens'),
('1-4', '1', '1.4 Testprozess'),
('1-5', '1', '1.5 Psychologie des Testens'),

-- Bölüm 2
('2-1', '2', '2.1 Entwicklungsmodelle'),
('2-2', '2', '2.2 Teststufen'),
('2-3', '2', '2.3 Testarten'),
('2-4', '2', '2.4 Wartungstests'),

-- Bölüm 3
('3-1', '3', '3.1 Statisches Testen - Grundlagen'),
('3-2', '3', '3.2 Review-Prozess'),
('3-3', '3', '3.3 Statische Analyse'),

-- Bölüm 4
('4-1', '4', '4.1 Testentwicklungsprozess'),
('4-2', '4', '4.2 Black-Box-Testentwurfsverfahren'),
('4-3', '4', '4.3 White-Box-Testentwurfsverfahren'),
('4-4', '4', '4.4 Erfahrungsbasierte Testentwurfsverfahren'),

-- Bölüm 5
('5-1', '5', '5.1 Testorganisation'),
('5-2', '5', '5.2 Testplanung und -schätzung'),
('5-3', '5', '5.3 Testfortschrittüberwachung'),
('5-4', '5', '5.4 Konfigurationsmanagement'),
('5-5', '5', '5.5 Risiken und Testen'),
('5-6', '5', '5.6 Fehlermanagement'),

-- Bölüm 6
('6-1', '6', '6.1 Testwerkzeuge'),
('6-2', '6', '6.2 Effektiver Einsatz von Werkzeugen');

-- Test için örnek veriler
SELECT 'Tables created successfully!' as Status;
SHOW TABLES;
