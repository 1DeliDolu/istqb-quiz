// @vitest-environment node
import request from 'supertest'
import app from '../server'
import { vi, test, expect } from 'vitest'

// Hoisted absolute path for stable mocking
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
const mockedConnectionPath = vi.hoisted(() => {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const path = require('path')
  // eslint-disable-next-line no-undef
  return path.resolve(__dirname, '../database/connection.js')
})

// Mock database layer used by server.js
vi.mock(mockedConnectionPath as unknown as string, () => ({
  query: vi.fn(async () => [{ ok: 1 }]),
  testConnection: vi.fn(async () => true),
  initializeDatabase: vi.fn(async () => undefined),
}))

test('GET /api/health returns OK', async () => {
  const res = await request(app).get('/api/health')
  expect(res.status).toBe(200)
  expect(res.body.status).toBe('OK')
})
