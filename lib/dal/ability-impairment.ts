import { createCustomCatalogCrud } from '@/lib/dal/generic-catalog'
import { AbilityImpairmentDetail } from '@/lib/types'

export const ABILITY_IMPAIRMENT_SELECT = `
  id,
  custom,
  ability_impairment_name,
  rules
`

export const ABILITY_IMPAIRMENT_SELECT_DETAIL = `
  id,
  custom,
  ability_impairment_name,
  rules
`

const abilityImpairmentCrud = createCustomCatalogCrud<
  'ability_impairment',
  AbilityImpairmentDetail
>({
  friendlyTypeNames: {
    plural: 'Abilities/Impairments',
    singular: 'Ability/Impairment'
  },
  select: ABILITY_IMPAIRMENT_SELECT,
  selectDetail: ABILITY_IMPAIRMENT_SELECT_DETAIL,
  tableName: 'ability_impairment'
})

export const { add, getAll, getUserCustom, remove, update } =
  abilityImpairmentCrud
