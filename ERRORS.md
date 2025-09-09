$ npm run e2e

> vite-project@0.0.0 e2e
> playwright test


Running 4 tests using 4 workers

  ✓  1 [chromium] › e2e\login.spec.ts:3:1 › login flow updates navbar with username (709ms)
  ✓  2 [chromium] › e2e\home.spec.ts:3:1 › homepage shows welcome heading (525ms)
  ✘  3 [chromium] › e2e\quiz-answer.spec.ts:18:1 › answer selection shows explanation and next (31.3s)
  ✘  4 [chromium] › e2e\quiz.spec.ts:18:1 › quiz loads and paginates (mocked API) (5.6s)


  1) [chromium] › e2e\quiz-answer.spec.ts:18:1 › answer selection shows explanation and next ───────

    Test timeout of 30000ms exceeded.

    Error: locator.click: Test timeout of 30000ms exceeded.
    Call log:
      - waiting for getByText(/^A:/).first()


      39 |
      40 |   // Click option labeled with "A:" (first option)
    > 41 |   await page.getByText(/^A:/).first().click()
         |                                       ^
      42 |   await expect(page.getByText('Erklärung:')).toBeVisible()
      43 |   await expect(page.getByRole('button', { name: /Nächste Frage|Ergebnisse anzeigen/ })).toBeVisible()
      44 |
        at D:\istqb-quiz\e2e\quiz-answer.spec.ts:41:39

    attachment #1: screenshot (image/png) ──────────────────────────────────────────────────────────
    test-results\quiz-answer-answer-selection-shows-explanation-and-next-chromium\test-failed-1.png
    ────────────────────────────────────────────────────────────────────────────────────────────────

    attachment #2: video (video/webm) ──────────────────────────────────────────────────────────────
    test-results\quiz-answer-answer-selection-shows-explanation-and-next-chromium\video.webm
    ────────────────────────────────────────────────────────────────────────────────────────────────

    Error Context: test-results\quiz-answer-answer-selection-shows-explanation-and-next-chromium\error-context.md

  2) [chromium] › e2e\quiz.spec.ts:18:1 › quiz loads and paginates (mocked API) ────────────────────

    Error: expect(locator).toBeVisible() failed

    Locator:  getByText('Q 1: Example question?')
    Expected: visible
    Received: <element(s) not found>
    Timeout:  5000ms

    Call log:
      - Expect "toBeVisible" with timeout 5000ms
      - waiting for getByText('Q 1: Example question?')


      38 |   await page.goto('/quiz/1')
      39 |
    > 40 |   await expect(page.getByText('Q 1: Example question?')).toBeVisible()
         |                                                          ^
      41 |   await expect(page.getByRole('link', { name: 'Next' })).toBeVisible()
      42 |   await page.getByRole('link', { name: 'Next' }).click()
      43 |   await expect(page.getByText('Q 2: Example question?')).toBeVisible()
        at D:\istqb-quiz\e2e\quiz.spec.ts:40:58

    attachment #1: screenshot (image/png) ──────────────────────────────────────────────────────────
    test-results\quiz-quiz-loads-and-paginates-mocked-API--chromium\test-failed-1.png
    ────────────────────────────────────────────────────────────────────────────────────────────────

    attachment #2: video (video/webm) ──────────────────────────────────────────────────────────────
    test-results\quiz-quiz-loads-and-paginates-mocked-API--chromium\video.webm
    ────────────────────────────────────────────────────────────────────────────────────────────────

    Error Context: test-results\quiz-quiz-loads-and-paginates-mocked-API--chromium\error-context.md

  2 failed
    [chromium] › e2e\quiz-answer.spec.ts:18:1 › answer selection shows explanation and next ────────
    [chromium] › e2e\quiz.spec.ts:18:1 › quiz loads and paginates (mocked API) ─────────────────────
  2 passed (32.4s)

musta@Musta MINGW64 /d/istqb-quiz (main)
$ 