import { test, expect } from '@playwright/test'

const seedQuestions = (chapterId: string, count = 3) => {
  const questions = Array.from({ length: count }, (_, i) => {
    const idx = i + 1
    return {
      id: idx,
      question: `Q ${idx}: Example question?`,
      options: ['A', 'B', 'C', 'D'],
      correctAnswer: 'A',
      explanation: 'Erklärung: Siehe 1.1 Abschnitt',
      subChapter: '1.1 Was ist Testen?',
    }
  })
  localStorage.setItem(`istqb_chapter_${chapterId}`, JSON.stringify(questions))
}

test('answer selection shows explanation and next', async ({ page }) => {
  const questions = Array.from({ length: 3 }, (_, i) => {
    const idx = i + 1
    return {
      id: idx,
      question: `Q ${idx}: Example question?`,
      options: ['A', 'B', 'C', 'D'],
      correctAnswer: 'A',
      explanation: 'Erklärung: Siehe 1.1 Abschnitt',
      subChapter: '1.1 Was ist Testen?',
    }
  })

  await page.route('**/api/health', route => route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify({ status: 'OK', message: 'mock', database: 'connected' })
  }))
  await page.route('**/api/questions/1*', route => route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify(questions),
  }))

  await page.goto('/quiz/1')

  // Click option labeled with "A:" (first option)
  await page.getByText(/^A:/).first().click()
  await expect(page.getByText('Erklärung:')).toBeVisible()
  await expect(page.getByRole('button', { name: /Nächste Frage|Ergebnisse anzeigen/ })).toBeVisible()

  // Go to next question
  await page.getByRole('button', { name: /Nächste Frage|Ergebnisse anzeigen/ }).click()
  await expect(page.getByText('Q 2: Example question?')).toBeVisible()
})
