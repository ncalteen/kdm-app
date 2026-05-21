import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'

vi.mock('@/components/custom/custom-rules-sheet', () => ({
  CustomWeaponTypeRulesIconButton: () => null
}))

vi.mock('@/components/generic/safe-markdown-editor', () => ({
  SafeMarkdownPreview: ({ source }: { source: string }) => <div>{source}</div>
}))

vi.mock('@/components/menu/select-weapon-type', () => ({
  SelectWeaponType: ({ value }: { value?: string | null }) => (
    <span>{value ?? 'Select Type'}</span>
  )
}))

vi.mock('@/lib/dal/survivor', () => ({
  updateSurvivor: vi.fn()
}))

vi.mock('sonner', () => ({
  toast: { error: vi.fn() }
}))

import {
  getVisibleWeaponProficiencyRules,
  WeaponProficiencyCard
} from '@/components/survivor/weapon-proficiency/weapon-proficiency-card'
import { SurvivorDetail, SurvivorsStateSetter } from '@/lib/types'

const axe = {
  id: 'axe',
  custom: false,
  weapon_type_name: 'Axe',
  specialist_proficiency_rules: 'Axe specialist rules',
  master_proficiency_rules: 'Axe master rules',
  author_user_id: null,
  author_username: null,
  author_avatar_url: null
} satisfies NonNullable<SurvivorDetail['weapon_type']>

const bow = {
  id: 'bow',
  custom: false,
  weapon_type_name: 'Bow',
  specialist_proficiency_rules: 'Bow specialist rules',
  master_proficiency_rules: 'Bow master rules',
  author_user_id: null,
  author_username: null,
  author_avatar_url: null
} satisfies NonNullable<SurvivorDetail['weapon_type']>

function survivor(
  id: string,
  weaponTypeId: string | null,
  weaponProficiency: number,
  weaponType: SurvivorDetail['weapon_type'] = null
): SurvivorDetail {
  return {
    id,
    weapon_type_id: weaponTypeId,
    weapon_proficiency: weaponProficiency,
    weapon_type: weaponType
  } as SurvivorDetail
}

describe('getVisibleWeaponProficiencyRules', () => {
  it('grants specialist rules from another survivor with matching mastery', () => {
    const rules = getVisibleWeaponProficiencyRules({
      selectedSurvivorId: 'new-blood',
      survivors: [survivor('master', 'axe', 8)],
      weaponProficiency: 0,
      weaponTypeId: 'axe',
      weaponType: axe
    })

    expect(rules).toEqual([
      {
        label: 'Specialist',
        source: 'Settlement mastery',
        rules: 'Axe specialist rules'
      }
    ])
  })

  it('does not grant specialist rules from mastery of a different weapon', () => {
    const rules = getVisibleWeaponProficiencyRules({
      selectedSurvivorId: 'new-blood',
      survivors: [survivor('master', 'bow', 8)],
      weaponProficiency: 0,
      weaponTypeId: 'axe',
      weaponType: axe
    })

    expect(rules).toEqual([])
  })

  it('shows specialist and master rules when the survivor reaches mastery', () => {
    const rules = getVisibleWeaponProficiencyRules({
      selectedSurvivorId: 'master',
      survivors: [survivor('master', 'axe', 8)],
      weaponProficiency: 8,
      weaponTypeId: 'axe',
      weaponType: axe
    })

    expect(rules).toEqual([
      {
        label: 'Specialist',
        source: 'Rank III',
        rules: 'Axe specialist rules'
      },
      { label: 'Master', source: 'Rank VIII', rules: 'Axe master rules' }
    ])
  })

  it('ignores blank proficiency rules', () => {
    const weaponType = {
      ...bow,
      specialist_proficiency_rules: '   ',
      master_proficiency_rules: null
    }

    const rules = getVisibleWeaponProficiencyRules({
      selectedSurvivorId: 'new-blood',
      survivors: [survivor('master', 'bow', 8)],
      weaponProficiency: 8,
      weaponTypeId: 'bow',
      weaponType
    })

    expect(rules).toEqual([])
  })
})

describe('WeaponProficiencyCard', () => {
  it('renders settlement mastery specialist rules for the selected weapon', () => {
    const html = renderToStaticMarkup(
      <WeaponProficiencyCard
        selectedSurvivor={survivor('new-blood', 'axe', 0, axe)}
        setSurvivors={vi.fn() as unknown as SurvivorsStateSetter}
        survivors={[survivor('master', 'axe', 8)]}
      />
    )

    expect(html).toContain('Settlement mastery')
    expect(html).toContain('Axe specialist rules')
    expect(html).not.toContain('Axe master rules')
  })
})
