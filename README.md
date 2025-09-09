# ISTQB Quiz Anwendung

Eine moderne und umfassende Vorbereitungsanwendung für die ISTQB Foundation Level Zertifizierung. Mit dieser Anwendung können Sie Quiz-Fragen aus ISTQB-, Udemy- und Fragen-Quellen lösen, Ihre Leistung verfolgen und Ihre Fragen verwalten.

## 🚀 Funktionen

### 📚 Multiple Quiz-Quellen

- **ISTQB Foundation Level**: Nach offiziellen ISTQB-Themen organisierte Fragen
- **Udemy**: Aus Udemy-Kursen zusammengestellte praktische Fragen
- **Fragen**: Fragen und Beispiele aus allgemeinen Prüfungen

### 🎯 Quiz-Funktionen

- Fragenfilterung nach Kapiteln und Unterkapiteln
- Sofortiges richtig/falsch Feedback
- Lernunterstützung mit detaillierten Erklärungen
- Punkteverfolgung und Leistungsanalyse
- Speicherung der Quiz-Ergebnisse in MySQL-Datenbank

### 📊 Statistiksystem

- Benutzerspezifische Leistungsstatistiken
- Erfolgsraten nach Kapiteln und Quellen
- Anzeige vergangener Quiz-Ergebnisse
- Fortschrittsverfolgung

### ⚙️ Verwaltungspanel

- Hinzufügen, Bearbeiten und Löschen von Fragen
- Massenimport/-export von Fragen
- Benutzerverwaltung
- Datenverwaltungstools

## 🛠️ Technologie-Stack

### Frontend

- **React 18** - Moderne React Hooks und funktionale Komponenten
- **TypeScript** - Typsicherheit und Entwicklererfahrung
- **Vite** - Schnelle Entwicklung und Build-System
- **Tailwind CSS** - Utility-first CSS Framework mit angepassten Design-Tokens
- **React Router** - Client-side Routing
- **Radix UI** - Barrierefreie UI-Komponenten

### UI/UX Design

- **Dark/Light Mode** - Automatische Themenerkennung mit CSS Custom Properties
- **Responsive Design** - Mobile-first Ansatz mit flexiblen Layouts
- **Accessibility** - WCAG-konforme UI-Komponenten mit Fokus-Management
- **Custom Design System** - Konsistente Farbpalette und Designtokens
- **Animationen** - Sanfte Übergänge und Hover-Effekte für bessere UX

### Styling-Features

- **CSS Custom Properties** - Dynamische Farbthemes (Light/Dark)
- **Component-Level Styling** - Modulare CSS-Architektur
- **Prose Styling** - Optimierte Typografie für Dokumentationsseiten
- **Navigation Animations** - Interaktive Menü-Hover-Effekte

### Backend

- **Node.js** - JavaScript Runtime
- **Express.js** - Web Application Framework
- **MySQL** - Relationale Datenbank
- **JWT** - Authentifizierung
- **bcrypt** - Passwort-Hashing

### Entwicklung & Testing

- **Vite** - Build-Tool und Entwicklungsserver
- **Vitest** - Unit Testing Framework
- **Playwright** - End-to-End Testing
- **Testing Library** - React Component Testing
- **ESLint** - Code-Qualität und Stil-Überprüfung

### Datenbank & Import

- **MySQL2** - MySQL Datenbankverbindung
- **JSON Data Import** - Automatisierte Datenimport-Scripts
- **Schema Migration** - Strukturierte Datenbank-Setups

## 🚀 Installation

### Voraussetzungen

- Node.js (v18 oder höher)
- MySQL (v8 oder höher)
- npm oder yarn

### 1. Repository klonen

```bash
git clone https://github.com/1DeliDolu/istqb-quiz.git
cd istqb-quiz
```

### 2. Backend Installation

```bash
cd server
npm install

# MySQL Datenbank erstellen und konfigurieren
mysql -u root -p < database/schema.sql

# Umgebungsvariablen konfigurieren
cp .env.example .env
# Bearbeiten Sie .env mit Ihren Datenbankdaten

# Server starten
npm start
```

### 3. Frontend Installation

```bash
# Zum Hauptverzeichnis zurückkehren
cd ..

# Abhängigkeiten installieren
npm install

# Entwicklungsserver starten
npm run dev
```

### 4. Datenbank-Setup und Import

```bash
# Erstelle Tabellen
cd server
node setup_database.js

# Importiere Quiz-Daten
node import_all_json.cjs
```

### 5. Anwendungszugriff

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3002

## 📖 Nutzung

### 🎓 Quiz lösen

1. Wählen Sie von der Startseite den gewünschten Quiz-Typ (ISTQB/Udemy/Fragen)
2. Starten Sie das Quiz durch Auswahl von Kapitel und Unterkapitel
3. Beantworten Sie die Fragen und erhalten Sie sofortiges Feedback
4. Betrachten Sie Ihre Leistung am Ende des Quiz

### 📊 Statistik-Verfolgung

1. Zeigen Sie Ihre Leistung über das "Statistiken"-Menü an
2. Analysieren Sie Ihre Erfolgsraten nach Kapiteln
3. Identifizieren Sie Ihre schwachen Bereiche

### ⚙️ Fragen-Verwaltung (Admin)

1. Verwenden Sie die "Frage hinzufügen"-Optionen aus dem CMS-Menü
2. Bearbeiten Sie bestehende Fragen über die "Fragen anzeigen"-Seite
3. Nutzen Sie Datenverwaltungstools für Massenoperationen

## 🔐 Authentifizierung

Die Anwendung verwendet JWT-basierte Authentifizierung:

- Benutzerregistrierung/-anmeldesystem
- Token-basierte Sitzungsverwaltung
- Sicherer API-Zugriff

## 🏗️ Projekt-Struktur

```
istqb-quiz/
├── src/                         # Frontend React Anwendung
│   ├── components/              # Wiederverwendbare UI-Komponenten
│   │   ├── ui/                  # Radix UI Komponenten-Bibliothek
│   │   ├── Navbar.tsx           # Hauptnavigation
│   │   ├── NavigationMenuDemo.tsx # Navigationsmenü-Demo
│   │   ├── ErrorBoundary.tsx    # Fehlerbehandlung
│   │   └── __tests__/           # Component Tests
│   ├── pages/                   # Route-Komponenten
│   │   ├── IstqbQuizPage.tsx    # ISTQB Quiz-Interface
│   │   ├── UdemyQuizPage.tsx    # Udemy Quiz-Interface
│   │   ├── FragenQuizPage.tsx   # Fragen Quiz-Interface
│   │   ├── QuizPage.tsx         # Allgemeine Quiz-Seite
│   │   ├── UserStatsPage.tsx    # Statistik-Dashboard
│   │   ├── DataManagementPage.tsx # Datenverwaltung
│   │   ├── DocumentationPage.tsx # Dokumentationsseiten
│   │   ├── DocumentationIndexPage.tsx # Dokumentations-Index
│   │   ├── IstqbFormPage.tsx    # ISTQB Fragen-Formular
│   │   ├── FragenPage.tsx       # Fragen-Formular
│   │   ├── UdemyPage.tsx        # Udemy Fragen-Formular
│   │   ├── LoginPage.tsx        # Benutzer-Authentifizierung
│   │   └── RegisterPage.tsx     # Benutzer-Registrierung
│   ├── services/                # API Services
│   │   └── dataService.ts       # Haupt-Datenservice
│   ├── constants/               # Statische Daten und Konfiguration
│   │   ├── istqbChapters.ts     # ISTQB Kapitel-Definitionen
│   │   ├── udemyChapters.ts     # Udemy Kapitel-Definitionen
│   │   └── fragenChapters.ts    # Fragen Kapitel-Definitionen
│   ├── types/                   # TypeScript Typ-Definitionen
│   │   └── chapters.ts          # Kapitel-Typ-Definitionen
│   ├── lib/                     # Hilfsfunktionen
│   │   └── utils.ts             # Utility-Funktionen
│   ├── assets/                  # Statische Assets
│   ├── istqb-foundation-level/  # ISTQB Dokumentations-Dateien
│   ├── pdf/                     # PDF-Dokumente
│   └── test/                    # Test-Dateien
├── server/                      # Backend Node.js Anwendung
│   ├── database/                # Datenbank-Konfiguration
│   │   ├── connection.js        # MySQL Verbindungspool
│   │   └── schema.sql           # Datenbank-Schema
│   ├── sync_question/           # Synchronisations-Scripts
│   │   ├── sync_import_istqb.cjs
│   │   └── sync_import_udemy.cjs
│   ├── __tests__/               # Backend Tests
│   │   ├── auth.test.ts
│   │   └── health.test.ts
│   ├── server.js                # Haupt-Server-Datei
│   ├── package.json             # Backend Dependencies
│   └── *.cjs                    # Datenbank-Import Scripts
├── json/                        # Quiz-Daten (JSON Format)
│   ├── istqb/                   # ISTQB Fragen nach Kapiteln
│   ├── udemy/                   # Udemy Fragen nach Kapiteln
│   └── fragen/                  # Allgemeine Fragen
├── e2e/                         # End-to-End Tests
│   ├── home.spec.ts
│   ├── login.spec.ts
│   ├── quiz.spec.ts
│   └── quiz-answer.spec.ts
├── provisioning/                # Infrastruktur-Konfiguration
│   └── datasources/
├── public/                      # Öffentliche statische Dateien
│   └── img/                     # Bilder und Icons
├── package.json                 # Frontend Dependencies
├── vite.config.ts              # Vite Konfiguration
├── tsconfig.json               # TypeScript Konfiguration
├── tailwind.config.js          # Tailwind CSS Konfiguration
└── playwright.config.ts        # Playwright Test-Konfiguration
```

## 🤝 Mitwirken

1. Fork das Repository
2. Feature-Branch erstellen (`git checkout -b feature/AwesomeFeature`)
3. Änderungen committen (`git commit -m 'Add some AwesomeFeature'`)
4. Branch pushen (`git push origin feature/AwesomeFeature`)
5. Pull Request erstellen

## 🧪 Testing

### Unit Tests

```bash
# Frontend Unit Tests
npm run test

# Backend Unit Tests
cd server && npm run test

# Tests im Watch-Modus
npm run test:watch
```

### End-to-End Tests

```bash
# Playwright E2E Tests
npm run e2e
```

### Test Coverage

```bash
# Test Coverage Report
npm run coverage
```

**Hinweis:** Falls Sie Probleme mit vitest haben, können Sie die Tests auch direkt mit npx ausführen:

```bash
npx vitest
```

## 🛠️ Entwicklungskommandos

```bash
# Frontend Entwicklung
npm run dev

# Backend Entwicklung (separates Terminal)
cd server && npm run dev

# Gleichzeitige Frontend/Backend Entwicklung
npm run dev

# Produktions-Build
npm run build

# Code-Linting
npm run lint

# Type-Checking
npx tsc --noEmit
```

## 📄 Lizenz

Dieses Projekt ist unter der MIT-Lizenz lizenziert.

## 📞 Kontakt

Projekt-Inhaber - [@1DeliDolu](https://github.com/1DeliDolu)

Projekt-Link: [https://github.com/1DeliDolu/istqb-quiz](https://github.com/1DeliDolu/istqb-quiz)

demo question.
![demo_question](./public/img/question.png)

## 🎨 Design & Styling

### Theme System

- **Dual Theme Support**: Automatisches Light/Dark Mode mit CSS Custom Properties
- **Color Tokens**: Konsistente OKLCH-basierte Farbpalette für optimale Kontraste
- **Responsive Layout**: Mobile-first Design mit flexiblen Grid-Systemen

### CSS Architektur

- **Tailwind CSS Integration**: Utility-first Ansatz mit benutzerdefinierten Design-Tokens
- **Component Styling**: Modulare CSS-Struktur für wartbaren Code
- **Animation Framework**: Sanfte Übergänge und interaktive Hover-Effekte
- **Typography System**: Optimierte Schriftarten und Zeilenhöhen für bessere Lesbarkeit

### Accessibility Features

- **WCAG-konform**: Barrierefreie UI-Komponenten mit Fokus-Management
- **Keyboard Navigation**: Vollständige Tastaturunterstützung
- **Screen Reader Support**: Semantische HTML-Struktur und ARIA-Labels
- **Color Contrast**: Optimierte Kontrastverhältnisse für alle Themes
