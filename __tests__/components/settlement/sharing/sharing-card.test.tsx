import { renderToStaticMarkup } from 'react-dom/server'
import { afterEach, describe, expect, it, vi } from 'vitest'

const useLocalMock = vi.fn()

vi.mock('@/contexts/local-context', () => ({
  useLocal: () => useLocalMock()
}))

vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: { success: vi.fn(), info: vi.fn(), error: vi.fn() }
  })
}))

vi.mock('@/lib/dal/settlement-shared-user', () => ({
  getSettlementSharedUsers: vi.fn().mockResolvedValue([]),
  addSettlementSharedUsers: vi.fn(),
  removeSettlementSharedUsers: vi.fn()
}))

vi.mock('@/lib/dal/user', () => ({
  USERNAME_PATTERN: /^[a-zA-Z0-9_]{3,20}$/,
  getUserId: vi.fn(),
  lookupUserByUsername: vi.fn()
}))

vi.mock('@/components/generic/user-avatar', () => ({
  UserAvatar: ({ username }: { username: string }) => (
    <span data-avatar={username} />
  )
}))

import { SharingCard } from '@/components/settlement/sharing/sharing-card'

type SharingCardProps = Parameters<typeof SharingCard>[0]

const baseProps: SharingCardProps = {
  local: {} as SharingCardProps['local']
}

afterEach(() => {
  useLocalMock.mockReset()
})

describe('SharingCard', () => {
  it('renders the share-management panel for the owner', () => {
    useLocalMock.mockReturnValue({
      selectedSettlementId: 'settlement-1',
      selectedSettlement: { id: 'settlement-1', role: 'owner' }
    })

    const html = renderToStaticMarkup(<SharingCard {...baseProps} />)

    expect(html).toContain('Light another lantern')
    expect(html).toContain('Invite a survivor to share this settlement')
  })

  it('renders no panel content when no settlement is selected', () => {
    useLocalMock.mockReturnValue({
      selectedSettlementId: null,
      selectedSettlement: null
    })

    const html = renderToStaticMarkup(<SharingCard {...baseProps} />)

    // The wrapper div is still emitted, but the inner panel short-circuits
    // because `selectedSettlement` is null.
    expect(html).not.toContain('Light another lantern')
  })
})
