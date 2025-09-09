import { test, expect } from '@playwright/test'
import fs from 'fs'
import path from 'path'

function readCredentials() {
  const ymlPath = path.resolve(process.cwd(), 'provisioning/datasources/datasources.yml')
  const content = fs.readFileSync(ymlPath, 'utf8')
  const userMatch = content.match(/\buser:\s*'?([\w.-]+)'?/)
  const passMatch = content.match(/\bpassword:\s*'?([^'\n]+)'?/)
  const username = userMatch?.[1] || 'testuser'
  const password = passMatch?.[1] || 'secret'
  return { username, password }
}

test('login with credentials from datasources.yml', async ({ page }) => {
  const { username, password } = readCredentials()

  // Mock backend login to validate provided credentials
  await page.route('**/api/auth/login', async (route, request) => {
    let body: any = {}
    try { body = JSON.parse(request.postData() || '{}') } catch {}
    if (body?.username === username && body?.password === password) {
      const json = {
        success: true,
        user: { id: 1, username, email: `${username}@example.com` },
        token: 'mock-token-123',
      }
      await route.fulfill({ status: 200, headers: { 'content-type': 'application/json' }, body: JSON.stringify(json) })
    } else {
      await route.fulfill({ status: 401, headers: { 'content-type': 'application/json' }, body: JSON.stringify({ message: 'Invalid username or password' }) })
    }
  })

  await page.goto('/login')
  await page.getByLabel('Kullanıcı Adı').fill(username)
  await page.getByLabel('Şifre').fill(password)
  await page.getByRole('button', { name: 'Giriş Yap' }).click()

  // After successful login, app navigates to '/' and reloads
  await page.waitForURL('**/')

  await expect(page.getByText(`Hoş geldin, ${username}`)).toBeVisible()
})
