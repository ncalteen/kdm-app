import { CampaignTemplate } from '@/lib/types'
import { GrabIcon, ScrollIcon } from 'lucide-react'

/**
 * Get Squires of the Citadel Campaign Template
 */
export async function getSquiresOfTheCitadelTemplate(): Promise<CampaignTemplate> {
  return {
    collectiveCognitionRewardIds: [],
    innovationIds: [],
    locationIds: [],
    milestoneIds: [],
    nemesisIds: [],
    principleIds: [],
    quarryIds: [],
    timeline: [
      { year_number: 0, entries: ['The Feral Guardian'] },
      { year_number: 1, entries: ['Mountain Lion'] },
      { year_number: 2, entries: ['The Quest'] },
      { year_number: 3, entries: ['Glimpse into the Future'] },
      { year_number: 4, entries: ['Secrets, Secrets'] }
    ],
    wandererIds: []
  }
}

/**
 * Squire Card Data
 */
export const SquireCardData = [
  {
    name: 'Squire Cain',
    rows: [
      { name: 'Age 1', value: '-' },
      { name: 'Age 2', value: '-' },
      {
        name: 'Age 3',
        value: '+3 grand or +3 sword weapon proficiency levels.'
      },
      {
        name: 'Age 4',
        value:
          'Cain is older than he lets on. Suffer -2 strength and -1 evasion.'
      },
      {
        name: 'Retired',
        value: 'The quest cannot be abandoned; you still hunt.'
      }
    ]
  },
  {
    name: 'Squire Elle',
    rows: [
      { name: 'Age 1', value: '-' },
      {
        name: 'Age 2',
        value: (
          <span className="flex items-center">
            <GrabIcon className="h-4 w-4" />
            &nbsp; Piercer
          </span>
        )
      },
      {
        name: 'Age 3',
        value: '+3 weapon proficiency levels in any weapon type.'
      },
      {
        name: 'Age 4',
        value: '[Story] Black Roots'
      },
      {
        name: 'Retired',
        value: 'The quest cannot be abandoned; you still hunt.'
      }
    ]
  },
  {
    name: 'Squire Owen',
    rows: [
      { name: 'Age 1', value: '-' },
      {
        name: 'Age 2',
        value: (
          <span className="flex items-center">
            <GrabIcon className="h-4 w-4" />
            &nbsp; Escape Artist
          </span>
        )
      },
      {
        name: 'Age 3',
        value: '+1 strength.'
      },
      {
        name: 'Age 4',
        value: (
          <span className="flex items-center">
            <ScrollIcon className="h-4 w-4" />
            &nbsp; Old Body, Old Mind
          </span>
        )
      },
      {
        name: 'Retired',
        value: 'The quest cannot be abandoned; you still hunt.'
      }
    ]
  },
  {
    name: 'Squire Iola',
    rows: [
      { name: 'Age 1', value: '-' },
      { name: 'Age 2', value: '-' },
      {
        name: 'Age 3',
        value: (
          <span className="flex items-center">
            <GrabIcon className="h-4 w-4" />
            &nbsp; Feral Strength
          </span>
        )
      },
      {
        name: 'Age 4',
        value: '+3 club weapon proficiency levels.'
      },
      {
        name: 'Retired',
        value: 'The quest cannot be abandoned; you still hunt.'
      }
    ]
  }
]

/**
 * Default Squires of the Citadel Suspicion
 */
export const DefaultSquiresSuspicion = [
  {
    name: 'Cain',
    level1: false,
    level2: false,
    level3: false,
    level4: false
  },
  {
    name: 'Elle',
    level1: false,
    level2: false,
    level3: false,
    level4: false
  },
  {
    name: 'Iola',
    level1: false,
    level2: false,
    level3: false,
    level4: false
  },
  {
    name: 'Owen',
    level1: false,
    level2: false,
    level3: false,
    level4: false
  }
]
