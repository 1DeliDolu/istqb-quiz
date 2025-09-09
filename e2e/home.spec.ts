import { test, expect } from '@playwright/test'

test('homepage shows welcome heading', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { name: 'ISTQB Quiz Uygulamasına Hoş Geldiniz!' })).toBeVisible()
})

