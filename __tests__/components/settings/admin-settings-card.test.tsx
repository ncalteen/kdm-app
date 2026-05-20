import { renderToStaticMarkup } from 'react-dom/server'
import { afterEach, describe, expect, it, vi } from 'vitest'

const useLocalMock = vi.fn()

vi.mock('@/contexts/local-context', () => ({
  useLocal: () => useLocalMock()
}))

vi.mock('@/lib/seed', () => ({
  generateSeedData: vi.fn()
}))

import { AdminSettingsCard } from '@/components/settings/admin-settings-card'

afterEach(() => {
  useLocalMock.mockReset()
})

describe('AdminSettingsCard', () => {
  it('renders nothing for non-admin users', () => {
    useLocalMock.mockReturnValue({ isAdmin: false })

    const html = renderToStaticMarkup(<AdminSettingsCard />)

    expect(html).not.toContain('Admin Settings')
  })

  it('renders admin settings for Supabase admin users', () => {
    useLocalMock.mockReturnValue({ isAdmin: true })

    const html = renderToStaticMarkup(<AdminSettingsCard />)

    expect(html).toContain('Admin Settings')
  })
})
