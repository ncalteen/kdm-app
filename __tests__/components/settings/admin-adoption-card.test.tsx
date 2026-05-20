import { renderToStaticMarkup } from 'react-dom/server'
import { afterEach, describe, expect, it, vi } from 'vitest'

const useLocalMock = vi.fn()

vi.mock('@/contexts/local-context', () => ({
  useLocal: () => useLocalMock()
}))

vi.mock('@/lib/admin-adoption', () => ({
  getAdminAdoptionMetrics: vi.fn()
}))

import { AdminAdoptionCard } from '@/components/settings/admin-adoption-card'

afterEach(() => {
  useLocalMock.mockReset()
})

describe('AdminAdoptionCard', () => {
  it('renders nothing for non-admin users', () => {
    useLocalMock.mockReturnValue({ isAdmin: false })

    const html = renderToStaticMarkup(<AdminAdoptionCard />)

    expect(html).not.toContain('Adoption')
  })

  it('renders the adoption surface for Supabase admin users', () => {
    useLocalMock.mockReturnValue({ isAdmin: true })

    const html = renderToStaticMarkup(<AdminAdoptionCard />)

    expect(html).toContain('Adoption')
    expect(html).toContain('Refresh')
    expect(html).toContain('Reading adoption signals...')
  })
})
