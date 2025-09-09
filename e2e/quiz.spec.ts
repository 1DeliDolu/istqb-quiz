import { test, expect } from '@playwright/test'

const seedQuestions = (chapterId: string, count = 15) => {
  const questions = Array.from({ length: count }, (_, i) => {
    const idx = i + 1
    return {
      id: idx,
      question: `Q ${idx}: Example question?`,
      options: ['A', 'B', 'C', 'D'],
      correctAnswer: 'A',
      explanation: 'See 1.1 section',
      subChapter: '1.1 Was ist Testen?',
    }
  })
  localStorage.setItem(`istqb_chapter_${chapterId}`, JSON.stringify(questions))
}

test('quiz loads from localStorage and paginates', async ({ page }) => {
  // Seed questions before app scripts run
  await page.addInitScript(seedQuestions, '1', 15)

  await page.goto('/quiz/1')

  await expect(page.getByText('Q 1: Example question?')).toBeVisible()

  // There should be multiple pagination links and a Next control
  await expect(page.getByRole('link', { name: 'Next' })).toBeVisible()

  // Click next and verify question changes
  await page.getByRole('link', { name: 'Next' }).click()
  await expect(page.getByText('Q 2: Example question?')).toBeVisible()

  // Jump to page 10 via pagination link
  await page.getByRole('link', { name: '10' }).click()
  await expect(page.getByText('Q 10: Example question?')).toBeVisible()
})

