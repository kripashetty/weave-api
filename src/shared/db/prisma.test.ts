import { describe, it, expect, vi, afterEach } from 'vitest'

// The singleton relies on globalThis. We clear it between tests so each test
// gets a fresh slate without cross-test pollution.
afterEach(() => {
  const g = globalThis as Record<string, unknown>
  delete g['prisma']
  vi.resetModules()
})

describe('Prisma singleton', () => {
  it('exports a prisma client instance', async () => {
    const { prisma } = await import('./prisma.js')
    expect(prisma).toBeDefined()
    expect(typeof prisma.$connect).toBe('function')
    expect(typeof prisma.$disconnect).toBe('function')
  })

  it('returns the same instance on repeated imports (singleton)', async () => {
    const { prisma: a } = await import('./prisma.js')
    const { prisma: b } = await import('./prisma.js')
    expect(a).toBe(b)
  })

  it('exports disconnectPrisma as a function', async () => {
    const { disconnectPrisma } = await import('./prisma.js')
    expect(typeof disconnectPrisma).toBe('function')
  })

  it('stores the instance on globalThis outside production', async () => {
    process.env['NODE_ENV'] = 'development'
    const { prisma } = await import('./prisma.js')
    const g = globalThis as Record<string, unknown>
    expect(g['prisma']).toBe(prisma)
    delete process.env['NODE_ENV']
  })
})
