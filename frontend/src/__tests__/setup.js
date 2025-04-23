import '@testing-library/jest-dom'
import { afterEach, beforeAll, afterAll, vi } from 'vitest'
import { cleanup } from '@testing-library/react'
import fetch, { Request, Response } from 'cross-fetch'
import { server } from '../mocks/server'

global.alert = vi.fn()

global.fetch = vi.fn(() =>
  Promise.resolve({
    json: () => Promise.resolve({}),
  })
)

global.Request = Request
global.Response = Response

vi.mock('axios', async () => {
  return {
    default: {
      create: vi.fn(() => ({
        get: vi.fn().mockResolvedValue({ data: {} }),
        post: vi.fn().mockResolvedValue({ data: {} }),
        put: vi.fn().mockResolvedValue({ data: {} }),
        delete: vi.fn().mockResolvedValue({ data: {} }),
        interceptors: {
          request: { use: vi.fn() },
          response: { use: vi.fn() },
        },
      })),
    },
  }
})

const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  clear: vi.fn(),
  removeItem: vi.fn(),
}
global.localStorage = localStorageMock

global.console = {
  ...console,
  warn: vi.fn(),
  error: vi.fn(),
  log: vi.fn(),
}

beforeAll(() => {
  if (process.env.NODE_ENV !== 'test') {
    server.listen({ onUnhandledRequest: 'bypass' })
  }
})

afterEach(() => {
  cleanup()
  localStorage.clear()
  if (process.env.NODE_ENV !== 'test') {
    server.resetHandlers()
  }
})

afterAll(() => {
  if (process.env.NODE_ENV !== 'test') {
    server.close()
  }
})
