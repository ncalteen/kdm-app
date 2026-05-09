import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'

vi.mock('@/components/menu/numeric-input', () => ({
  NumericInput: ({
    label,
    value
  }: {
    label: string
    value: number
  }): React.JSX.Element => <div>{`${label}:${value}`}</div>
}))

vi.mock('@/hooks/use-optimistic-mutation', () => ({
  useOptimisticMutation: () => vi.fn()
}))

vi.mock('@/lib/dal/showdown-survivor', () => ({
  updateShowdownSurvivor: vi.fn()
}))

import { BleedingCard } from '@/components/survivor/bleeding/bleeding-card'

type BleedingCardProps = Parameters<typeof BleedingCard>[0]

const baseProps = {
  local: {},
  selectedShowdown: {
    showdown_survivors: {
      ss1: {
        id: 'ss1',
        bleeding_tokens: 2,
        survivor_id: 'survivor-1'
      }
    }
  },
  selectedSurvivor: {
    id: 'survivor-1'
  },
  setSelectedShowdown: vi.fn()
} as unknown as BleedingCardProps

describe('BleedingCard', () => {
  it('renders bleeding token controls for an active showdown survivor', () => {
    const html = renderToStaticMarkup(<BleedingCard {...baseProps} />)

    expect(html).toContain('Bleeding Tokens:2')
    expect(html).toContain('Bleeding')
  })

  it('does not render when no showdown survivor record exists', () => {
    const html = renderToStaticMarkup(
      <BleedingCard
        {...baseProps}
        selectedShowdown={
          { showdown_survivors: {} } as BleedingCardProps['selectedShowdown']
        }
      />
    )

    expect(html).toBe('')
  })
})
