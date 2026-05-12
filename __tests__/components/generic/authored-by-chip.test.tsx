import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const useLocalMock = vi.fn()

vi.mock('@/contexts/local-context', () => ({
  useLocal: () => useLocalMock()
}))

// `UserAvatar` is a complex client component that exercises Supabase / image
// loading paths that aren't relevant to chip-visibility unit tests. Stub it
// out so we can assert against simple, deterministic markup.
vi.mock('@/components/generic/user-avatar', () => ({
  UserAvatar: ({
    username,
    userId,
    alt
  }: {
    username: string | null
    userId: string | null
    alt?: string
  }): React.JSX.Element => (
    <span
      data-testid="user-avatar"
      data-username={username ?? ''}
      data-user-id={userId ?? ''}
      data-alt={alt ?? ''}
    />
  )
}))

// shadcn's `Tooltip` family wires into Radix's portal-based runtime, which is
// not compatible with static SSR. Replace it with simple primitives so the
// rendered markup mirrors what the chip would commit to the DOM (avatar +
// tooltip content) without dragging in Radix Tooltip internals.
vi.mock('@/components/ui/tooltip', () => ({
  TooltipProvider: ({
    children
  }: {
    children: React.ReactNode
  }): React.JSX.Element => <>{children}</>,
  Tooltip: ({ children }: { children: React.ReactNode }): React.JSX.Element => (
    <>{children}</>
  ),
  TooltipTrigger: ({
    children
  }: {
    children: React.ReactNode
  }): React.JSX.Element => <>{children}</>,
  TooltipContent: ({
    children
  }: {
    children: React.ReactNode
  }): React.JSX.Element => <span data-testid="tooltip-content">{children}</span>
}))

import { AuthoredByChip } from '@/components/generic/authored-by-chip'

describe('AuthoredByChip', () => {
  beforeEach(() => {
    useLocalMock.mockReset()
  })

  it('renders nothing for built-in catalog rows (null author user id)', () => {
    useLocalMock.mockReturnValue({
      userSettings: { user_id: 'viewer-id' }
    })

    const result = AuthoredByChip({
      authorUserId: null,
      authorUsername: null,
      authorAvatarUrl: null
    })

    expect(result).toBeNull()
  })

  it('renders nothing when the current user authored the row', () => {
    useLocalMock.mockReturnValue({
      userSettings: { user_id: 'viewer-id' }
    })

    const result = AuthoredByChip({
      authorUserId: 'viewer-id',
      authorUsername: 'lantern_bearer',
      authorAvatarUrl: null
    })

    expect(result).toBeNull()
  })

  it('renders avatar and `@username` tooltip when authored by another user', () => {
    useLocalMock.mockReturnValue({
      userSettings: { user_id: 'viewer-id' }
    })

    const html = renderToStaticMarkup(
      <AuthoredByChip
        authorUserId="author-id"
        authorUsername="settlement_smith"
        authorAvatarUrl="https://example.invalid/avatar.png"
      />
    )

    expect(html).toContain('aria-label="Authored by @settlement_smith"')
    expect(html).toContain('data-username="settlement_smith"')
    expect(html).toContain('data-user-id="author-id"')
    expect(html).toContain('@settlement_smith')
  })

  it('falls back to `@unknown` when the author has no username (ghost author)', () => {
    useLocalMock.mockReturnValue({
      userSettings: { user_id: 'viewer-id' }
    })

    const html = renderToStaticMarkup(
      <AuthoredByChip
        authorUserId="ghost-id"
        authorUsername={null}
        authorAvatarUrl={null}
      />
    )

    expect(html).toContain('aria-label="Authored by @unknown"')
    expect(html).toContain('@unknown')
  })

  it('still renders for foreign authors when the viewer has no settings', () => {
    // Defensive: when `userSettings` is null (unauthenticated guard state
    // before hydration), the chip must still surface foreign-authored rows
    // so collaborators can identify content authored by other users.
    useLocalMock.mockReturnValue({ userSettings: null })

    const html = renderToStaticMarkup(
      <AuthoredByChip
        authorUserId="author-id"
        authorUsername="settlement_smith"
        authorAvatarUrl={null}
      />
    )

    expect(html).toContain('@settlement_smith')
  })
})
