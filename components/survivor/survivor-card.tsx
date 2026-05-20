'use client'

import { AbilitiesAndImpairmentsCard } from '@/components/survivor/abilities-and-impairments/abilities-and-impairments-card'
import { AttributeCard } from '@/components/survivor/attributes/attribute-card'
import { BleedingCard } from '@/components/survivor/bleeding/bleeding-card'
import { ArmsCard } from '@/components/survivor/combat/arms-card'
import { BodyCard } from '@/components/survivor/combat/body-card'
import { HeadCard } from '@/components/survivor/combat/head-card'
import { LegsCard } from '@/components/survivor/combat/legs-card'
import { WaistCard } from '@/components/survivor/combat/waist-card'
import { CourageUnderstandingCard } from '@/components/survivor/courage-understanding/courage-understanding-card'
import { CursedGearCard } from '@/components/survivor/cursed-gear/cursed-gear-card'
import { DisordersCard } from '@/components/survivor/disorders/disorders-card'
import { FightingArtsCard } from '@/components/survivor/fighting-arts/fighting-arts-card'
import { GearGridCard } from '@/components/survivor/gear-grid/gear-grid-card'
import { HuntXPCard } from '@/components/survivor/hunt-xp/hunt-xp-card'
import { KnowledgeCard } from '@/components/survivor/knowledge/knowledge-card'
import { NextDepartureCard } from '@/components/survivor/next-departure/next-departure-card'
import { OncePerLifetimeCard } from '@/components/survivor/once-per-lifetime/once-per-lifetime-card'
import { PhilosophyCard } from '@/components/survivor/philosophy/philosophy-card'
import { SanityCard } from '@/components/survivor/sanity/sanity-card'
import { StatusCard } from '@/components/survivor/status/status-card'
import { SurvivalCard } from '@/components/survivor/survival/survival-card'
import { WandererCard } from '@/components/survivor/wanderer/wanderer-card'
import { WeaponProficiencyCard } from '@/components/survivor/weapon-proficiency/weapon-proficiency-card'
import { Card, CardContent } from '@/components/ui/card'
import { LocalStateType } from '@/contexts/local-context'
import {
  ColorChoice,
  DatabaseSurvivorType,
  SurvivorCardMode,
  SurvivorType
} from '@/lib/enums'
import {
  HuntDetail,
  HuntStateSetter,
  SettlementDetail,
  ShowdownDetail,
  ShowdownStateSetter,
  SurvivorDetail,
  SurvivorsStateSetter
} from '@/lib/types'
import { getCardColorStyles } from '@/lib/utils'
import { ReactElement } from 'react'

/**
 * Survivor Card Props
 */
interface SurvivorCardProps extends Partial<SurvivorDetail> {
  /** Local State */
  local: LocalStateType
  /** Mode */
  mode: SurvivorCardMode
  /** Selected Hunt */
  selectedHunt: HuntDetail | null
  /** Selected Settlement */
  selectedSettlement: SettlementDetail | null
  /** Selected Showdown */
  selectedShowdown: ShowdownDetail | null
  /** Selected Survivor */
  selectedSurvivor: SurvivorDetail | null
  /** Set Selected Hunt (for optimistic token updates) */
  setSelectedHunt?: HuntStateSetter
  /** Set Selected Showdown (for optimistic token updates) */
  setSelectedShowdown?: ShowdownStateSetter
  /** Set Survivors */
  setSurvivors: SurvivorsStateSetter
  /** Survivors */
  survivors: SurvivorDetail[]
}

/**
 * Survivor Form Component
 *
 * This component is used to display/edit a survivor.
 *
 * @param props Survivor Card Props
 * @returns Survivor Card Component
 */
export function SurvivorCard({
  local,
  mode,
  selectedHunt,
  selectedSettlement,
  selectedShowdown,
  selectedSurvivor,
  setSelectedHunt,
  setSelectedShowdown,
  setSurvivors,
  survivors
}: SurvivorCardProps): ReactElement {
  return (
    <Card
      className="w-full border-2 rounded-xl py-2 gap-2 transition-all duration-200 hover:shadow-lg bg-secondary"
      style={{
        ...getCardColorStyles(
          (selectedSurvivor?.color as ColorChoice) ?? ColorChoice.SLATE
        ),
        borderColor: 'var(--card-border-color)'
      }}>
      <CardContent className="px-2">
        <div className="flex flex-col xl:flex-row xl:flex-wrap gap-2 w-full">
          {/* First Column - Essential Stats */}
          <div className="flex flex-col flex-1 gap-1 xl:min-w-112.5">
            <StatusCard
              selectedSurvivor={selectedSurvivor}
              setSurvivors={setSurvivors}
              survivors={survivors}
            />
            {selectedSurvivor?.wanderer && (
              <WandererCard
                selectedSurvivor={selectedSurvivor}
                setSurvivors={setSurvivors}
                survivors={survivors}
              />
            )}
            <HuntXPCard
              selectedSettlement={selectedSettlement}
              selectedSurvivor={selectedSurvivor}
              setSurvivors={setSurvivors}
              survivors={survivors}
            />
            {mode === SurvivorCardMode.SHOWDOWN_CARD && (
              <BleedingCard
                local={local}
                selectedShowdown={selectedShowdown}
                selectedSurvivor={selectedSurvivor}
                setSelectedShowdown={setSelectedShowdown}
              />
            )}
            <SurvivalCard
              mode={mode}
              selectedHunt={selectedHunt}
              selectedSettlement={selectedSettlement}
              selectedShowdown={selectedShowdown}
              selectedSurvivor={selectedSurvivor}
              setSelectedHunt={setSelectedHunt}
              setSelectedShowdown={setSelectedShowdown}
              setSurvivors={setSurvivors}
            />
            <WeaponProficiencyCard
              selectedSurvivor={selectedSurvivor}
              setSurvivors={setSurvivors}
            />
            <CourageUnderstandingCard
              local={local}
              selectedSettlement={selectedSettlement}
              selectedSurvivor={selectedSurvivor}
              setSurvivors={setSurvivors}
              survivors={survivors}
            />
            <DisordersCard local={local} selectedSurvivor={selectedSurvivor} />
            <AbilitiesAndImpairmentsCard
              local={local}
              selectedSurvivor={selectedSurvivor}
              setSurvivors={setSurvivors}
            />
            <OncePerLifetimeCard
              selectedSurvivor={selectedSurvivor}
              setSurvivors={setSurvivors}
            />
          </div>

          {/* Second Column - Combat */}
          <div className="flex flex-col flex-1 gap-1 xl:min-w-112.5">
            <AttributeCard
              mode={mode}
              selectedHunt={selectedHunt}
              selectedSettlement={selectedSettlement}
              selectedShowdown={selectedShowdown}
              selectedSurvivor={selectedSurvivor}
              setSelectedHunt={setSelectedHunt}
              setSelectedShowdown={setSelectedShowdown}
              setSurvivors={setSurvivors}
            />
            <SanityCard
              local={local}
              displayText={true}
              displayTormentInput={true}
              mode={mode}
              selectedHunt={selectedHunt}
              selectedSettlement={selectedSettlement}
              selectedShowdown={selectedShowdown}
              selectedSurvivor={selectedSurvivor}
              setSelectedHunt={setSelectedHunt}
              setSelectedShowdown={setSelectedShowdown}
              setSurvivors={setSurvivors}
            />
            <HeadCard
              selectedSurvivor={selectedSurvivor}
              setSurvivors={setSurvivors}
              survivors={survivors}
            />
            <ArmsCard
              selectedSurvivor={selectedSurvivor}
              setSurvivors={setSurvivors}
              survivors={survivors}
            />
            <BodyCard
              selectedSurvivor={selectedSurvivor}
              setSurvivors={setSurvivors}
              survivors={survivors}
            />
            <WaistCard
              selectedSurvivor={selectedSurvivor}
              setSurvivors={setSurvivors}
              survivors={survivors}
            />
            <LegsCard
              selectedSurvivor={selectedSurvivor}
              setSurvivors={setSurvivors}
              survivors={survivors}
            />
            {mode === SurvivorCardMode.SURVIVOR_CARD && (
              <NextDepartureCard
                selectedSurvivor={selectedSurvivor}
                setSurvivors={setSurvivors}
              />
            )}
          </div>

          {/* Third Column - ARC */}
          {selectedSettlement?.survivor_type ===
            DatabaseSurvivorType[SurvivorType.ARC] && (
            <div className="flex flex-col flex-1 gap-1 xl:min-w-112.5 order-3">
              <PhilosophyCard
                local={local}
                selectedSettlement={selectedSettlement}
                selectedSurvivor={selectedSurvivor}
                setSurvivors={setSurvivors}
                survivors={survivors}
              />
              <KnowledgeCard
                local={local}
                selectedSettlement={selectedSettlement}
                selectedSurvivor={selectedSurvivor}
                setSurvivors={setSurvivors}
                survivors={survivors}
              />
            </div>
          )}

          {/* Fourth Column - Gear Grid */}
          <div className="flex flex-col flex-1 gap-1 xl:min-w-[320px] xl:max-w-105">
            <GearGridCard
              selectedSettlement={selectedSettlement}
              selectedSurvivor={selectedSurvivor}
              setSurvivors={setSurvivors}
              survivors={survivors}
            />
            <CursedGearCard
              selectedSettlement={selectedSettlement}
              selectedSurvivor={selectedSurvivor}
              setSurvivors={setSurvivors}
            />
            <FightingArtsCard
              local={local}
              selectedSettlement={selectedSettlement}
              selectedSurvivor={selectedSurvivor}
              setSurvivors={setSurvivors}
              survivors={survivors}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
