import request from 'supertest'
import { vi, describe, it, expect } from 'vitest'

// Hoisted absolute path for stable mocking
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
const mockedConnectionPath = vi.hoisted(() => {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const path = require('path')
  // eslint-disable-next-line no-undef
  return path.resolve(__dirname, '../database/connection.js')
})

// Mock DB layer before importing the app
vi.mock(mockedConnectionPath as unknown as string, () => {
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
      const s = typeof sql === 'string' ? sql : ''
      if (/from\s+users\s+where\s+username/i.test(s)) {
        const [username] = params
        const found = users.filter((u) => u.username === username)
        return found
      }
      if (/^\s*select\s+1/i.test(s)) {
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
import * as db from '../database/connection.js'

describe('POST /api/auth/login', () => {
  it('returns 401 with invalid credentials (no DB user)', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ username: 'testuser', password: 'secret' })

    // Debug output on failure
    // eslint-disable-next-line no-console
    console.log('AUTH_RESPONSE', res.status, res.body)
    // @ts-ignore
    // eslint-disable-next-line no-console
    console.log('DB_QUERY_CALLS', (db.query as any).mock.calls.length)

    expect(res.status).toBe(401)
    expect(res.body).toHaveProperty('message')
  })
})
