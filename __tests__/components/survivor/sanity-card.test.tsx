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

vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: {
      error: vi.fn(),
      success: vi.fn()
    }
  })
}))

vi.mock('@/lib/dal/hunt-survivor', () => ({
  updateHuntSurvivor: vi.fn()
}))

vi.mock('@/lib/dal/showdown-survivor', () => ({
  updateShowdownSurvivor: vi.fn()
}))

vi.mock('@/lib/dal/survivor', () => ({
  updateSurvivor: vi.fn()
}))

import { SanityCard } from '@/components/survivor/sanity/sanity-card'
import { SurvivorCardMode } from '@/lib/enums'

type SanityCardProps = Parameters<typeof SanityCard>[0]

const baseProps = {
  displayText: true,
  displayTormentInput: false,
  local: {},
  selectedHunt: null,
  selectedSettlement: { survivor_type: 'STANDARD' },
  selectedShowdown: {
    showdown_survivors: {
      ss1: {
        id: 'ss1',
        bleeding_tokens: 2,
        insanity_tokens: 1,
        survivor_id: 'survivor-1'
      }
    }
  },
  selectedSurvivor: {
    id: 'survivor-1',
    brain_light_damage: false,
    insanity: 3,
    torment: 0
  },
  setSelectedHunt: vi.fn(),
  setSelectedShowdown: vi.fn(),
  setSurvivors: vi.fn()
} as unknown as SanityCardProps

describe('SanityCard', () => {
  it('renders insanity token controls in showdown mode without bleeding controls', () => {
    const html = renderToStaticMarkup(
      <SanityCard
        {...baseProps}
        mode={SurvivorCardMode.SHOWDOWN_CARD}
        setSelectedShowdown={vi.fn()}
      />
    )

    expect(html).toContain('Insanity Tokens:1')
    expect(html).not.toContain('Bleeding Tokens')
    expect(html).not.toContain('Bleeding')
  })

  it('does not render showdown token controls outside showdown mode', () => {
    const html = renderToStaticMarkup(
      <SanityCard {...baseProps} mode={SurvivorCardMode.SURVIVOR_CARD} />
    )

    expect(html).not.toContain('Bleeding Tokens')
    expect(html).not.toContain('Insanity Tokens')
  })
})
