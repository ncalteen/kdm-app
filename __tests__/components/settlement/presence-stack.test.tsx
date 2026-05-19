import type { PresenceUser } from '@/hooks/use-presence'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'

// `PresenceStack` ultimately mounts the shadcn Tooltip primitive, which
// in jsdom-less node tests pulls in Radix internals (`useId`, layout
// effects) that don't gracefully render to static markup. Stubbing the
// tooltip primitives keeps the unit assertions focused on the stack
// layout (avatar count, overflow badge, self treatment) — the tooltip
// content is asserted indirectly via the `title` shim below.
vi.mock('@/components/ui/tooltip', () => ({
  TooltipProvider: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
  Tooltip: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  TooltipTrigger: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
  TooltipContent: ({ children }: { children: React.ReactNode }) => (
    <span data-tooltip>{children}</span>
  )
}))

vi.mock('@/components/generic/user-avatar', () => ({
  UserAvatar: ({ username }: { username?: string | null }) => (
    <span data-avatar={username ?? ''} />
  )
}))

import { PresenceStack } from '@/components/settlement/presence-stack'

/**
 * Build A Presence User With Sensible Defaults
 *
 * Lets each test declare only the fields it cares about. The `online_at`
 * default is deterministic and incrementing so dedupe / order assertions
 * stay stable.
 */
function buildUser(
  user_id: string,
  overrides: Partial<PresenceUser> = {}
): PresenceUser {
  return {
    user_id,
    username: overrides.username ?? user_id,
    avatar_url: overrides.avatar_url ?? null,
    online_at: overrides.online_at ?? `2026-05-19T00:00:0${user_id}.000Z`
  }
}

describe('PresenceStack', () => {
  it('renders nothing when there are no users', () => {
    const html = renderToStaticMarkup(<PresenceStack users={[]} />)
    expect(html).toBe('')
  })

  it('renders one avatar chip for each user (under the visible cap)', () => {
    const users = [buildUser('1'), buildUser('2'), buildUser('3')]
    const html = renderToStaticMarkup(<PresenceStack users={users} />)

    expect(html.match(/data-avatar="/g)?.length ?? 0).toBe(3)
    // No overflow badge for counts ≤ 5
    expect(html).not.toMatch(/\+\d+/)
  })

  it('renders exactly five inline avatars plus a +N overflow badge', () => {
    const users = Array.from({ length: 8 }, (_, i) => buildUser(String(i + 1)))
    const html = renderToStaticMarkup(<PresenceStack users={users} />)

    expect(html.match(/data-avatar="/g)?.length ?? 0).toBe(5)
    // Three users beyond the visible cap → "+3" badge
    expect(html).toContain('+3')
  })

  it('lists overflow usernames inside the +N badge tooltip', () => {
    const users = Array.from({ length: 7 }, (_, i) =>
      buildUser(String(i + 1), { username: `survivor${i + 1}` })
    )
    const html = renderToStaticMarkup(<PresenceStack users={users} />)

    // Every user's tooltip copy must appear — the visible five render
    // with their per-avatar "keeps watch" tooltip, and the overflow
    // pair appears inside the +N badge's stacked tooltip.
    expect(html).toContain('@survivor1 keeps watch')
    expect(html).toContain('@survivor5 keeps watch')
    // Overflow names are rendered inside a `flex-col` tooltip block,
    // so look for the contiguous stack of @user spans that the
    // overflow tooltip wraps in `<div class="flex flex-col …">`.
    expect(html).toMatch(
      /flex flex-col[^"]*"><span>@survivor6<\/span><span>@survivor7<\/span>/
    )
  })

  it("marks the caller's own avatar with the self treatment", () => {
    const users = [
      buildUser('me', { username: 'lantern_keeper' }),
      buildUser('other', { username: 'shadow_walker' })
    ]
    const html = renderToStaticMarkup(
      <PresenceStack users={users} currentUserId="me" />
    )

    // The self treatment applies an amber lantern ring; the collaborator
    // treatment uses the neutral background ring. Both should be
    // present in the markup.
    expect(html).toContain('ring-amber-400')
    expect(html).toContain('ring-background')
    // Self tooltip copy switches to `(you)` to disambiguate.
    expect(html).toContain('@lantern_keeper (you)')
    expect(html).toContain('@shadow_walker keeps watch')
  })

  it('renders the same neutral ring for every avatar when no caller id is supplied', () => {
    const users = [buildUser('a'), buildUser('b')]
    const html = renderToStaticMarkup(<PresenceStack users={users} />)

    expect(html).not.toContain('ring-amber-400')
    expect(html).toContain('ring-background')
  })
})
