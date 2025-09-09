import request from 'supertest'
import path from 'path'
import { fileURLToPath } from 'url'
import { vi, describe, it, expect, beforeAll } from 'vitest'

// Resolve absolute path to the module that server.js requires
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const connectionModulePath = path.resolve(__dirname, '../database/connection.js')

// Mock DB layer before importing the app
vi.mock(connectionModulePath, () => {
  return {
    query: vi.fn(async () => [{ '1': 1 }]),
    testConnection: vi.fn(async () => true),
    initializeDatabase: vi.fn(async () => true),
  }
})

// Import the Express app (CJS default export)
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore - CJS interop
import app from '../server.js'

describe('GET /api/health', () => {
  it('returns OK when DB is reachable (mocked)', async () => {
    const res = await request(app).get('/api/health')
    expect(res.status).toBe(200)
    expect(res.body.status).toBe('OK')
    expect(res.body.database).toBe('connected')
  })
})

