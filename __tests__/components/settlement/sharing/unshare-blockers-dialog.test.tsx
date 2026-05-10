import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'

// Stub the shadcn `Dialog` family so server-side rendering doesn't pull in
// Radix's portal / focus-trap machinery (which depends on the DOM). The
// stubs preserve the structural elements the test asserts on (header
// copy, list contents, close button) without actually mounting a portal.
vi.mock('@/components/ui/dialog', () => {
  const Passthrough = ({ children }: { children?: React.ReactNode }) => (
    <>{children}</>
  )
  const Section = ({ children }: { children?: React.ReactNode }) => (
    <div>{children}</div>
  )
  return {
    Dialog: ({
      open,
      children
    }: {
      open?: boolean
      children?: React.ReactNode
    }) => (open ? <div data-dialog="open">{children}</div> : null),
    DialogClose: ({ children }: { children?: React.ReactNode }) => (
      <>{children}</>
    ),
    DialogContent: Section,
    DialogDescription: Section,
    DialogFooter: Section,
    DialogHeader: Section,
    DialogTitle: ({ children }: { children?: React.ReactNode }) => (
      <h2>{children}</h2>
    ),
    DialogPortal: Passthrough,
    DialogOverlay: Passthrough,
    DialogTrigger: Passthrough
  }
})

import { UnshareBlockersDialog } from '@/components/settlement/sharing/unshare-blockers-dialog'
import type { UnshareBlockerDetail } from '@/lib/dal/settlement-shared-user'

const blockers: UnshareBlockerDetail[] = [
  { kind: 'knowledge', itemName: 'Strange Hand', itemId: 'k-1' },
  { kind: 'knowledge', itemName: 'Whispered Truth', itemId: 'k-2' },
  { kind: 'gear', itemName: 'Bone Cleaver', itemId: 'g-1' },
  { kind: 'quarry', itemName: 'Lurking Brute', itemId: 'q-1' }
]

describe('UnshareBlockersDialog', () => {
  it('does not render any markup when closed', () => {
    const html = renderToStaticMarkup(
      <UnshareBlockersDialog
        open={false}
        onOpenChange={() => {}}
        username="ashen.veil"
        blockers={blockers}
      />
    )

    // The Dialog stub returns null when `open === false`; nothing to see.
    expect(html).toBe('')
  })

  it('renders the blocked-revoke header and the username when open', () => {
    const html = renderToStaticMarkup(
      <UnshareBlockersDialog
        open={true}
        onOpenChange={() => {}}
        username="ashen.veil"
        blockers={blockers}
      />
    )

    expect(html).toContain(
      'They have left their light here. Gather it before they walk in darkness.'
    )
    expect(html).toContain('@ashen.veil')
  })

  it('groups blockers by kind with pretty-printed headings', () => {
    const html = renderToStaticMarkup(
      <UnshareBlockersDialog
        open={true}
        onOpenChange={() => {}}
        username="ashen.veil"
        blockers={blockers}
      />
    )

    // Pretty-printed group headers (mapped from snake_case `kind` values).
    expect(html).toContain('Knowledge')
    expect(html).toContain('Gear')
    expect(html).toContain('Quarries')

    // Item names appear underneath their group headers.
    expect(html).toContain('Strange Hand')
    expect(html).toContain('Whispered Truth')
    expect(html).toContain('Bone Cleaver')
    expect(html).toContain('Lurking Brute')
  })

  it('falls back to a Title Case label for unknown kinds', () => {
    // A kind the RPC might emit ahead of a UI update — the component
    // must NOT crash, and must render something reasonable.
    const html = renderToStaticMarkup(
      <UnshareBlockersDialog
        open={true}
        onOpenChange={() => {}}
        username="ashen.veil"
        blockers={[
          {
            kind: 'unmapped_kind',
            itemName: 'Mystery Item',
            itemId: 'x-1'
          }
        ]}
      />
    )

    expect(html).toContain('Unmapped Kind')
    expect(html).toContain('Mystery Item')
  })

  it('shows an empty-state hint when blockers is empty (defensive render)', () => {
    // The panel should not normally open the dialog with an empty list,
    // but if it does the dialog must still produce a coherent UI rather
    // than an empty void.
    const html = renderToStaticMarkup(
      <UnshareBlockersDialog
        open={true}
        onOpenChange={() => {}}
        username="ashen.veil"
        blockers={[]}
      />
    )

    expect(html).toContain('No items remain attached.')
  })

  it('uses a generic placeholder when username is empty', () => {
    const html = renderToStaticMarkup(
      <UnshareBlockersDialog
        open={true}
        onOpenChange={() => {}}
        username=""
        blockers={blockers}
      />
    )

    expect(html).toContain('@this collaborator')
  })
})
