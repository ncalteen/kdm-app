import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'

function mockCard(name: string) {
  const MockCard = (): React.JSX.Element => <div>{name}</div>
  MockCard.displayName = name
  return MockCard
}

vi.mock('@/components/survivor/abilities-and-impairments/abilities-and-impairments-card', () => ({
  AbilitiesAndImpairmentsCard: mockCard('AbilitiesAndImpairmentsCard')
}))
vi.mock('@/components/survivor/attributes/attribute-card', () => ({
  AttributeCard: mockCard('AttributeCard')
}))
vi.mock('@/components/survivor/bleeding/bleeding-card', () => ({
  BleedingCard: mockCard('BleedingCard')
}))
vi.mock('@/components/survivor/combat/arms-card', () => ({
  ArmsCard: mockCard('ArmsCard')
}))
vi.mock('@/components/survivor/combat/body-card', () => ({
  BodyCard: mockCard('BodyCard')
}))
vi.mock('@/components/survivor/combat/head-card', () => ({
  HeadCard: mockCard('HeadCard')
}))
vi.mock('@/components/survivor/combat/legs-card', () => ({
  LegsCard: mockCard('LegsCard')
}))
vi.mock('@/components/survivor/combat/waist-card', () => ({
  WaistCard: mockCard('WaistCard')
}))
vi.mock('@/components/survivor/courage-understanding/courage-understanding-card', () => ({
  CourageUnderstandingCard: mockCard('CourageUnderstandingCard')
}))
vi.mock('@/components/survivor/cursed-gear/cursed-gear-card', () => ({
  CursedGearCard: mockCard('CursedGearCard')
}))
vi.mock('@/components/survivor/disorders/disorders-card', () => ({
  DisordersCard: mockCard('DisordersCard')
}))
vi.mock('@/components/survivor/fighting-arts/fighting-arts-card', () => ({
  FightingArtsCard: mockCard('FightingArtsCard')
}))
vi.mock('@/components/survivor/gear-grid/gear-grid-card', () => ({
  GearGridCard: mockCard('GearGridCard')
}))
vi.mock('@/components/survivor/hunt-xp/hunt-xp-card', () => ({
  HuntXPCard: mockCard('HuntXPCard')
}))
vi.mock('@/components/survivor/knowledge/knowledge-card', () => ({
  KnowledgeCard: mockCard('KnowledgeCard')
}))
vi.mock('@/components/survivor/next-departure/next-departure-card', () => ({
  NextDepartureCard: mockCard('NextDepartureCard')
}))
vi.mock('@/components/survivor/once-per-lifetime/once-per-lifetime-card', () => ({
  OncePerLifetimeCard: mockCard('OncePerLifetimeCard')
}))
vi.mock('@/components/survivor/philosophy/philosophy-card', () => ({
  PhilosophyCard: mockCard('PhilosophyCard')
}))
vi.mock('@/components/survivor/sanity/sanity-card', () => ({
  SanityCard: mockCard('SanityCard')
}))
vi.mock('@/components/survivor/status/status-card', () => ({
  StatusCard: mockCard('StatusCard')
}))
vi.mock('@/components/survivor/survival/survival-card', () => ({
  SurvivalCard: mockCard('SurvivalCard')
}))
vi.mock('@/components/survivor/wanderer/wanderer-card', () => ({
  WandererCard: mockCard('WandererCard')
}))
vi.mock('@/components/survivor/weapon-proficiency/weapon-proficiency-card', () => ({
  WeaponProficiencyCard: mockCard('WeaponProficiencyCard')
}))
vi.mock('@/lib/utils', async () => {
  const actual = await vi.importActual<typeof import('@/lib/utils')>('@/lib/utils')
  return {
    ...actual,
    getCardColorStyles: () => ({})
  }
})

import { SurvivorCard } from '@/components/survivor/survivor-card'
import { SurvivorCardMode } from '@/lib/enums'

type SurvivorCardProps = Parameters<typeof SurvivorCard>[0]

const baseProps = {
  local: {},
  mode: SurvivorCardMode.SHOWDOWN_CARD,
  selectedHunt: null,
  selectedSettlement: null,
  selectedShowdown: { showdown_survivors: {} },
  selectedSurvivor: { color: 'SLATE', id: 'survivor-1', wanderer: false },
  setSelectedHunt: vi.fn(),
  setSelectedShowdown: vi.fn(),
  setSurvivors: vi.fn(),
  survivors: []
} as unknown as SurvivorCardProps

describe('SurvivorCard', () => {
  it('renders the bleeding card beneath hunt xp during showdowns', () => {
    const html = renderToStaticMarkup(<SurvivorCard {...baseProps} />)

    expect(html).toContain('HuntXPCard')
    expect(html).toContain('BleedingCard')
    expect(html.indexOf('HuntXPCard')).toBeLessThan(html.indexOf('BleedingCard'))
    expect(html.indexOf('BleedingCard')).toBeLessThan(html.indexOf('SurvivalCard'))
  })

  it('does not render the bleeding card outside showdown mode', () => {
    const html = renderToStaticMarkup(
      <SurvivorCard {...baseProps} mode={SurvivorCardMode.HUNT_CARD} />
    )

    expect(html).not.toContain('BleedingCard')
  })
})
