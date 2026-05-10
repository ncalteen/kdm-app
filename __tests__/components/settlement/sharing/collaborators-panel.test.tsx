import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'

vi.mock('@/contexts/local-context', () => ({
  useLocal: () => ({
    selectedSettlementId: 'settlement-1',
    selectedSettlement: { id: 'settlement-1', role: 'owner' }
  })
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

import { CollaboratorsPanel } from '@/components/settlement/sharing/collaborators-panel'

type CollaboratorsPanelProps = Parameters<typeof CollaboratorsPanel>[0]

const baseProps: CollaboratorsPanelProps = {
  local: {} as CollaboratorsPanelProps['local'],
  selectedSettlement: {
    id: 'settlement-1',
    role: 'owner'
  } as CollaboratorsPanelProps['selectedSettlement']
}

describe('CollaboratorsPanel', () => {
  it('renders the share form when the caller is the owner', () => {
    const html = renderToStaticMarkup(<CollaboratorsPanel {...baseProps} />)

    expect(html).toContain('Light another lantern')
    expect(html).toContain('Invite a survivor to share this settlement')
    expect(html).toContain('Lanterns shared with')
    expect(html).toContain('placeholder="Username…"')
    expect(html).toContain('Invite')
  })

  it('renders nothing when no settlement is selected', () => {
    const html = renderToStaticMarkup(
      <CollaboratorsPanel {...baseProps} selectedSettlement={null} />
    )

    expect(html).toBe('')
  })

  it('shows the loading copy on the initial render before the fetch resolves', () => {
    const html = renderToStaticMarkup(<CollaboratorsPanel {...baseProps} />)

    expect(html).toContain('Gathering the watch')
  })
})
