import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'

// Stub the shadcn `Dialog` family so server-side rendering doesn't pull in
// Radix's portal / focus-trap machinery (which depends on the DOM). The
// stubs preserve the structural elements the test asserts on (title,
// description, CTAs) without actually mounting a portal.
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

vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: { success: vi.fn(), info: vi.fn(), error: vi.fn() }
  })
}))

vi.mock('@/lib/dal/user-subscription', () => ({
  startCheckout: vi.fn()
}))

import { UpsellModal } from '@/components/settlement/sharing/upsell-modal'

type UpsellModalProps = Parameters<typeof UpsellModal>[0]

const baseProps: UpsellModalProps = {
  open: true,
  onOpenChange: vi.fn(),
  local: {} as UpsellModalProps['local']
}

describe('UpsellModal', () => {
  it('renders the spec-required copy when open', () => {
    const html = renderToStaticMarkup(<UpsellModal {...baseProps} />)

    // Title and body copy from the issue spec.
    expect(html).toContain('Light another lantern')
    expect(html).toContain('$5 a month')

    // Primary and secondary CTAs.
    expect(html).toContain('Subscribe')
    expect(html).toContain('Maybe later')

    // Owner-only nuance from the issue thread.
    expect(html).toContain('Only the keeper subscribes')
  })

  it('renders nothing when closed', () => {
    const html = renderToStaticMarkup(
      <UpsellModal {...baseProps} open={false} />
    )

    // The Dialog stub returns null when `open === false`; nothing to see.
    expect(html).toBe('')
  })
})
