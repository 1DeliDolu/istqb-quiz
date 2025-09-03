# ISTQB Quiz Application - README

Welcome to the ISTQB Quiz Application! This platform is designed to help users prepare for the ISTQB Foundation Level certification with a modern, multi-source quiz system, advanced statistics, and robust question management.

## 🚀 Features

- **Multiple Quiz Sources:** Supports ISTQB, Udemy, and Fragen question sets.
- **Comprehensive User Statistics:** Track your progress and performance across all quiz types.
- **Advanced Question Management:** Add, edit, and preview questions in real-time.
- **MySQL Database Integration:** Reliable data persistence and scalable backend.
- **Unified Quiz Interface:** Consistent user experience for all quiz types.

## 🏗️ Architecture Overview

### Frontend

- **Tech Stack:** React, TypeScript, Vite, Tailwind CSS
- **Structure:**
    - `components/` – Reusable UI components (Radix UI based)
    - `pages/` – Route-based page components (Quiz, Stats, Forms)
    - `services/` – API and data management
    - `constants/` – Static data and configuration
    - `types/` – TypeScript type definitions

### Backend

- **Tech Stack:** Node.js, Express.js, MySQL
- **Structure:**
    - `database/` – MySQL schema and connection
    - `middleware/` – Express middlewares
    - `routes/` – API endpoints
    - `server.js` – Main server file

## ⚙️ Getting Started

### Prerequisites

- Node.js v18+
- MySQL v8+
- VS Code (recommended)
- Git

### Installation

1. **Clone the repository:**
     ```bash
     git clone https://github.com/your-repo/istqb-quiz.git
     cd istqb-quiz
     ```

2. **Install dependencies:**
     ```bash
     npm install
     cd server && npm install
     ```

3. **Set up the database:**
     ```bash
     mysql -u root -p < server/database/schema.sql
     ```

4. **Configure environment variables:**
     Create a `.env` file in `server/`:
     ```env
     DB_HOST=localhost
     DB_USER=root
     DB_PASSWORD=root
     DB_NAME=istqb_quiz_app
     JWT_SECRET=your_secret_key
     ```

5. **Run the application:**
     - **Frontend:** `npm run dev`
     - **Backend:** `cd server && npm start`

## 🗂️ Project Structure

```
src/
    components/
    pages/
    services/
    constants/
    types/
server/
    database/
    middleware/
    routes/
    server.js
```

## 🛠️ Development Commands

- **Frontend development:** `npm run dev`
- **Backend development:** `cd server && npm start`
- **Type checking:** `npm run type-check`
- **Build for production:** `npm run build`

## 🧪 Testing

- **Unit Testing:** Jest + React Testing Library
- **API Testing:** Supertest
- **E2E Testing:** Cypress

> **Note:** Testing setup is recommended but not fully implemented yet.

## 📊 Database Schema

- `chapters (id VARCHAR, title, description)`
- `sub_chapters (id VARCHAR, chapter_id, title, description)`
- `questions (id BIGINT, chapter_id, sub_chapter_id, question, explanation)`
- `question_options (id BIGINT, question_id, option_text, is_correct, option_order)`
- `users (id INT, username, email, password_hash)`
- `user_question_attempts (id BIGINT, user_id, question_id, chapter_id, sub_chapter_id, selected_answer, is_correct, attempt_number)`

## 📚 Code Standards

- **TypeScript:** Strict type checking, interfaces for all data structures
- **Components:** Functional with hooks, clear props interfaces
- **API:** RESTful, JSON responses, proper HTTP status codes, error handling middleware

## 📝 Roadmap

- [ ] Populate sub-chapters table and ensure foreign key consistency
- [ ] Implement advanced question search and filtering
- [ ] Add analytics dashboard
- [ ] Improve mobile responsiveness and accessibility
- [ ] Add offline support and progressive loading

## 🤝 Contributing

Contributions are welcome! Please open issues or submit pull requests for improvements and bug fixes.

## 📄 License

This project is licensed under the MIT License.

---

**Maintainer:**

- `IstqbQuizPage.tsx` component reuse with props:
  - `quizType: 'istqb' | 'udemy' | 'fragen'`
  - `title: string`
- Route mapping:
  - `/csm/istqb-quiz` → IstqbQuizPage (default)
  - `/csm/udemy-quiz` → IstqbQuizPage quizType="udemy"
  - `/csm/fragen-quiz` → IstqbQuizPage quizType="fragen"

**Benefits:**

- Code reusability
- Consistent UX across quiz types
- Maintainable architecture

## 🔍 Key Technical Decisions

### 1. Sub-Chapter ID Strategy

**Decision:** Set all sub_chapter_id to null initially
**Reasoning:**

- Database schema support hazır ama sub_chapter data'sı henüz populate edilmemiş
- Foreign key constraint'leri koruyor
- İleride sub_chapter data'sı eklendiğinde kolayca genişletilebilir

### 2. Answer Recording Architecture

**Client-side flow:**

```typescript
// 1. Frontend answer selection
handleAnswerSelect(option: string) →

// 2. Sub-chapter ID calculation based on quiz type
calculateSubChapterId(quizType, currentChapter, subChapter) →

// 3. API call
DataService.recordUserAnswer(userId, questionId, chapterId, subChapterId, answer, isCorrect) →

// 4. Backend processing
server.js: /api/user-stats/answer endpoint →

// 5. Database insertion
INSERT INTO user_question_attempts (...)
```

### 3. Statistics System Design

**Multi-source support:**

- UserStatsPage.tsx dinamik chapter title handling
- Backend'den gelen chapter bilgileri frontend constants'larla merge
- Cross-quiz-type performance comparison

## 🐛 Critical Bug Fixes

### 1. Foreign Key Constraint Fix

**Files:** `server.js`
**Issue:** Sub-chapter ID mapping hatası
**Fix:** Null assignment strategy

### 2. Question Update API Fix

**Files:** `server.js`, `dataService.ts`
**Issue:** Column name mismatch (correct_answer vs is_correct)
**Fix:** Options table'da is_correct flag kullanımı

### 3. Route Configuration

**Files:** `App.tsx`, `NavigationMenuDemo.tsx`
**Issue:** Udemy ve Fragen quiz sayfaları eksikti
**Fix:** Unified component approach with props

## 📊 Database Schema Evolution

### Current Schema:

```sql
chapters (id VARCHAR, title, description)
sub_chapters (id VARCHAR, chapter_id, title, description)
questions (id BIGINT, chapter_id, sub_chapter_id, question, explanation)
question_options (id BIGINT, question_id, option_text, is_correct, option_order)
users (id INT, username, email, password_hash)
user_question_attempts (id BIGINT, user_id, question_id, chapter_id, sub_chapter_id, selected_answer, is_correct, attempt_number)
```

### Schema Notes:

- `sub_chapters.id` VARCHAR kullanıyor ama `user_question_attempts.sub_chapter_id` integer foreign key bekliyor
- Bu mismatch'i çözmek için mapping logic kullanılıyor
- Future improvement: Schema consistency sağlanabilir

## 🚀 Performance Optimizations

### 1. API Caching Strategy

- Frontend'de localStorage fallback
- Backend'de MySQL connection pooling
- Question loading optimization

### 2. Component Optimization

- React.memo usage için opportunities
- Lazy loading for large question sets
- State management optimization

## 🔮 Future Development Roadmap

### 1. Database Schema Improvements

- [ ] Sub-chapters table population
- [ ] Foreign key consistency fixes
- [ ] Migration scripts

### 2. Advanced Features

- [ ] Question search and filtering
- [ ] Bulk question operations
- [ ] Export/import improvements
- [ ] Analytics dashboard

### 3. Performance & UX

- [ ] Progressive loading
- [ ] Offline support
- [ ] Mobile responsive improvements
- [ ] Accessibility enhancements

## 🛠️ Development Environment

### Required Tools:

- Node.js v18+
- MySQL v8+
- VS Code (recommended)
- Git

### Development Commands:

```bash
# Frontend development
npm run dev

# Backend development
cd server && npm start

# Database reset
mysql -u root -p < server/database/schema.sql

# Type checking
npm run type-check

# Build for production
npm run build
```

### Environment Variables:

```env
# Backend (.env)
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=root
DB_NAME=istqb_quiz_app
JWT_SECRET=your_secret_key
```

## 📚 Code Style & Standards

### TypeScript Usage:

- Strict type checking enabled
- Interface definitions for all data structures
- Proper error handling with try-catch

### Component Standards:

- Functional components with hooks
- Props interface definitions
- Consistent naming conventions

### API Standards:

- RESTful endpoint design
- JSON response format
- Proper HTTP status codes
- Error handling middleware

## 🧪 Testing Strategy

### Current Testing Status:

- [ ] Unit tests for components
- [ ] API endpoint testing
- [ ] Database integration tests
- [ ] E2E testing setup

### Testing Framework Recommendations:

- Jest + React Testing Library
- Supertest for API testing
- Cypress for E2E testing

---

**Last Updated:** September 2025  
**Project Status:** Active Development  
**Maintainer:** [@1DeliDolu](https://github.com/1DeliDolu)


## Exampels: 

### Soru Ekranı

![Soru Ekranı](public/img/question.png)

### Navigasyon Menüsü

![Navigasyon Menüsü](public/img/navbar.png)

### İçerik Yönetim Sistemi (CMS)

![CMS](public/img/cms.png)

### İstatistikler

![İstatistikler](public/img/statistic.png)


### question update 

![update](update.png)