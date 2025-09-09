# Repository Guidelines

## Project Structure & Module Organization
- `src/`: React + TypeScript app (components, pages, constants, styles). Uses `@/` path alias.
- `server/`: Express + MySQL backend (`server.js`, `database/connection.js`, SQL schema).
- `public/`: Static assets served by Vite; additional images in `public/img`.
- `json/`: Source question datasets; processed/imported by server scripts.
- Conventions: pages in `src/pages/*Page.tsx`, shared UI in `src/components` and `src/components/ui`.

## Build, Test, and Development Commands
- `npm run dev`: Starts Vite frontend and the backend (`server/npm start`) concurrently.
- `npm run build`: Type‑checks (TS) and builds the frontend with Vite.
- `npm run preview`: Serves the built frontend locally for verification.
- `npm run lint`: Runs ESLint against TS/TSX sources.
- Server only: `cd server && npm start` (prod) or `npm run dev` (nodemon).

## Coding Style & Naming Conventions
- **TypeScript**: strict mode enabled; favor functional React components and hooks.
- **ESLint**: TS recommended + React Hooks + Vite refresh; run `npm run lint` before PRs.
- **Indentation**: 2 spaces; keep imports sorted and prefer `@/` aliases over relative paths.
- **Naming**: Components `PascalCase` (e.g., `Navbar.tsx`), hooks/vars `camelCase`, constants in `src/constants`.

## Testing Guidelines
- Current status: no test runner wired. Recommended setup:
  - Frontend: Vitest + React Testing Library.
  - Backend: Vitest/Jest + Supertest for HTTP.
- Place tests beside code as `*.test.ts`/`*.test.tsx`. Add `npm test` once configured; target key flows (routing, quiz fetch, auth).

## Commit & Pull Request Guidelines
- Prefer Conventional Commits: `feat:`, `fix:`, `docs:`, `refactor:`, `chore:`; imperative tone, ≤72 chars.
- PRs must include: clear description, scope (frontend/server), screenshots for UI, repro/verify steps, and linked issues.
- CI‑like checks locally: `npm run lint`, `npm run build`, and server start without errors.

## Security & Configuration Tips
- Create `server/.env` with: `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, `JWT_SECRET`, `PORT`.
- Do not commit secrets or database dumps; sample values may live in a local `.env` only.
- MySQL must be reachable; `server/database/schema.sql` initializes tables on boot.

