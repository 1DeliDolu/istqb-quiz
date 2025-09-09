import { test, expect } from '@playwright/test'

test('login flow updates navbar with username', async ({ page }) => {
  await page.route('http://localhost:3002/api/auth/login', async route => {
    const json = {
      success: true,
      user: { id: 1, username: 'testuser', email: 'test@example.com' },
      token: 'mock-token-123',
    }
    await route.fulfill({ status: 200, body: JSON.stringify(json), headers: { 'content-type': 'application/json' } })
  })

  await page.goto('/login')
  await page.getByLabel('Kullanıcı Adı').fill('testuser')
  await page.getByLabel('Şifre').fill('secret')
  await page.getByRole('button', { name: 'Giriş Yap' }).click()

  // After successful login, app navigates to '/' and reloads
  await page.waitForURL('**/')

  await expect(page.getByText('Hoş geldin, testuser')).toBeVisible()
})

