import { renderToStaticMarkup } from 'react-dom/server'
import { afterEach, describe, expect, it, vi } from 'vitest'

const useLocalMock = vi.fn()

vi.mock('@/contexts/local-context', () => ({
  useLocal: () => useLocalMock()
}))

vi.mock('@/lib/seed', () => ({
  generateSeedData: vi.fn()
}))

import { AdminDevelopmentCard } from '@/components/settings/admin-development-card'

afterEach(() => {
  useLocalMock.mockReset()
})

describe('AdminDevelopmentCard', () => {
  it('renders nothing for non-admin users', () => {
    useLocalMock.mockReturnValue({ isAdmin: false })

    const html = renderToStaticMarkup(<AdminDevelopmentCard />)

    expect(html).not.toContain('Development')
  })

  it('renders the development tab for Supabase admin users', () => {
    useLocalMock.mockReturnValue({ isAdmin: true })

    const html = renderToStaticMarkup(<AdminDevelopmentCard />)

    expect(html).toContain('Development')
    expect(html).toContain('Development tools are only available')
    expect(html).not.toContain('Seed Data')
  })
})
