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

vi.mock('@/lib/dal/user-subscription', () => ({
  startCheckout: vi.fn(),
  openPortal: vi.fn()
}))

vi.mock('@/components/generic/user-avatar', () => ({
  UserAvatar: ({ username }: { username: string }) => (
    <span data-avatar={username} />
  )
}))

import { CollaboratorsPanel } from '@/components/settlement/sharing/collaborators-panel'

type CollaboratorsPanelProps = Parameters<typeof CollaboratorsPanel>[0]

const baseProps: CollaboratorsPanelProps = {
  local: {} as CollaboratorsPanelProps['local']
}

const ownerContext = {
  selectedSettlementId: 'settlement-1',
  selectedSettlement: { id: 'settlement-1', role: 'owner' },
  canShare: true
}

const freeOwnerContext = {
  selectedSettlementId: 'settlement-1',
  selectedSettlement: { id: 'settlement-1', role: 'owner' },
  canShare: false
}

afterEach(() => {
  useLocalMock.mockReset()
})

describe('CollaboratorsPanel', () => {
  it('renders the share form when the caller is the owner', () => {
    useLocalMock.mockReturnValue(ownerContext)

    const html = renderToStaticMarkup(<CollaboratorsPanel {...baseProps} />)

    expect(html).toContain('Light another lantern')
    expect(html).toContain('Invite a survivor to share this settlement')
    expect(html).toContain('Shared lanterns')
    expect(html).toContain('placeholder="Username…"')
    expect(html).toContain('Invite')
  })

  it('renders nothing when no settlement is selected', () => {
    useLocalMock.mockReturnValue({
      selectedSettlementId: null,
      selectedSettlement: null,
      canShare: true
    })

    const html = renderToStaticMarkup(<CollaboratorsPanel {...baseProps} />)

    expect(html).toBe('')
  })

  it('renders nothing when the caller is a collaborator (non-owner)', () => {
    useLocalMock.mockReturnValue({
      selectedSettlementId: 'settlement-1',
      selectedSettlement: { id: 'settlement-1', role: 'collaborator' },
      canShare: true
    })

    const html = renderToStaticMarkup(<CollaboratorsPanel {...baseProps} />)

    expect(html).toBe('')
  })

  it('shows the loading copy on the initial render before the fetch resolves', () => {
    useLocalMock.mockReturnValue(ownerContext)

    const html = renderToStaticMarkup(<CollaboratorsPanel {...baseProps} />)

    expect(html).toContain('Gathering the watch')
  })

  it('swaps the invite form for the paywall upsell trigger when canShare is false', () => {
    useLocalMock.mockReturnValue(freeOwnerContext)

    const html = renderToStaticMarkup(<CollaboratorsPanel {...baseProps} />)

    // Header stays the same so a downgraded user still sees a familiar
    // panel — the description switches to the gating copy.
    expect(html).toContain('Light another lantern')
    expect(html).toContain(
      'Sharing this settlement requires lighting a new lantern.'
    )

    // The invite input is gone for free users.
    expect(html).not.toContain('placeholder="Username…"')
    expect(html).not.toContain('id="invite-username"')

    // The paywall trigger surfaces the price and the owner-only nuance.
    expect(html).toContain('Your lantern burns alone.')
    expect(html).toContain('$5 a month')
    expect(html).toContain('Only you, the keeper of the lantern')

    // Loading copy is still shown on the initial render (the static
    // markup is captured before the fetch resolves) — but the "invite
    // above" hint must never appear in the paywalled view, even after
    // the collaborator list loads.
    expect(html).not.toContain('Invite a survivor above.')
  })
})
