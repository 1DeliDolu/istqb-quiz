import request from 'supertest'
import path from 'path'
import { fileURLToPath } from 'url'
import { vi, describe, it, expect } from 'vitest'

// Resolve absolute path to the module that server.js requires
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const connectionModulePath = path.resolve(__dirname, '../database/connection.js')

// Mock DB layer before importing the app
vi.mock(connectionModulePath, () => {
  const users = [
    {
      id: 1,
      username: 'testuser',
      email: 'test@example.com',
      password_hash: '$2a$10$not-used-in-tests',
      first_name: 'Test',
      last_name: 'User',
    },
  ]
  return {
    query: vi.fn(async (sql: string, params: any[] = []) => {
      if (typeof sql === 'string' && sql.includes('FROM users WHERE username')) {
        const [username] = params
        const found = users.filter((u) => u.username === username)
        return found
      }
      if (typeof sql === 'string' && sql.trim().startsWith('SELECT 1')) {
        return [{ '1': 1 }]
      }
      return []
    }),
    testConnection: vi.fn(async () => true),
    initializeDatabase: vi.fn(async () => true),
  }
})

// Mock bcrypt to always validate password successfully
vi.mock('bcryptjs', () => {
  return {
    compare: vi.fn(async () => true),
    hash: vi.fn(async () => '$2a$10$mockhash'),
  }
})

// Import the Express app (CJS default export)
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore - CJS interop
import app from '../server.js'

describe('POST /api/auth/login', () => {
  it('logs in successfully with valid credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ username: 'testuser', password: 'secret' })

    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)
    expect(res.body.user).toMatchObject({ username: 'testuser', email: 'test@example.com' })
    expect(typeof res.body.token).toBe('string')
    expect(res.body.token.length).toBeGreaterThan(10)
  })
})

