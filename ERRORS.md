musta@Musta MINGW64 /d/istqb-quiz (main)
$ npm run test

> vite-project@0.0.0 test
> vitest


 DEV  v2.1.9 D:/istqb-quiz

stdout | server/__tests__/auth.test.ts > POST /api/auth/login > returns 401 with invalid credentials (no DB user)
AUTH_RESPONSE 401 { message: 'Invalid username or password' }
DB_QUERY_CALLS 0

 ✓ server/__tests__/auth.test.ts (1)
 ✓ server/__tests__/health.test.ts (1)
 ❯ src/components/__tests__/Navbar.test.tsx (0)

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯ Failed Suites 1 ⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯

 FAIL  src/components/__tests__/Navbar.test.tsx [ src/components/__tests__/Navbar.test.tsx ]
Error: Failed to resolve import "@/components/Navbar" from "src/components/__tests__/Navbar.test.tsx". Does the file exist?
  Plugin: vite:import-analysis
  File: D:/istqb-quiz/src/components/__tests__/Navbar.test.tsx:2:19
  1  |  import { jsxDEV } from "react/jsx-dev-runtime";
  2  |  import { render, screen } from "@testing-library/react";
  3  |  import Navbar from "@/components/Navbar";
     |                      ^
  4  |  describe("Navbar", () => {
  5  |    it("shows login/register links when logged out", () => {
 ❯ TransformPluginContext._formatError node_modules/vitest/node_modules/vite/dist/node/chunks/dep-D_zLpgQd.js:49258:41
 ❯ TransformPluginContext.error node_modules/vitest/node_modules/vite/dist/node/chunks/dep-D_zLpgQd.js:49253:16
 ❯ normalizeUrl node_modules/vitest/node_modules/vite/dist/node/chunks/dep-D_zLpgQd.js:64306:23
 ❯ node_modules/vitest/node_modules/vite/dist/node/chunks/dep-D_zLpgQd.js:64438:39
 ❯ TransformPluginContext.transform node_modules/vitest/node_modules/vite/dist/node/chunks/dep-D_zLpgQd.js:64365:7
 ❯ PluginContainer.transform node_modules/vitest/node_modules/vite/dist/node/chunks/dep-D_zLpgQd.js:49099:18
 ❯ loadAndTransform node_modules/vitest/node_modules/vite/dist/node/chunks/dep-D_zLpgQd.js:51977:27

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/1]⎯

 Test Files  1 failed | 2 passed (3)
      Tests  2 passed (2)
   Start at  10:30:58
   Duration  1.35s (transform 114ms, setup 267ms, collect 645ms, tests 81ms, environment 1.03s, prepare 281ms)

 FAIL  Tests failed. Watching for file changes...
       press h to show help, press q to quit
