'use client'

import { AbilitiesAndImpairmentsCard } from '@/components/survivor/abilities-and-impairments/abilities-and-impairments-card'
import { AttributeCard } from '@/components/survivor/attributes/attribute-card'
import { ArmsCard } from '@/components/survivor/combat/arms-card'
import { BodyCard } from '@/components/survivor/combat/body-card'
import { HeadCard } from '@/components/survivor/combat/head-card'
import { LegsCard } from '@/components/survivor/combat/legs-card'
import { WaistCard } from '@/components/survivor/combat/waist-card'
import { CourageUnderstandingCard } from '@/components/survivor/courage-understanding/courage-understanding-card'
import { CursedGearCard } from '@/components/survivor/cursed-gear/cursed-gear-card'
import { DisordersCard } from '@/components/survivor/disorders/disorders-card'
import { FightingArtsCard } from '@/components/survivor/fighting-arts/fighting-arts-card'
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
import {
  ColorChoice,
  DatabaseSurvivorType,
  SurvivorCardMode,
  SurvivorType
} from '@/lib/enums'
import {
  HuntDetail,
  SettlementDetail,
  ShowdownDetail,
  SurvivorDetail
} from '@/lib/types'
import { getCardColorStyles } from '@/lib/utils'
import { ReactElement } from 'react'

/**
 * Survivor Card Props
 */
interface SurvivorCardProps extends Partial<SurvivorDetail> {
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
  setSelectedHunt?: (hunt: HuntDetail | null) => void
  /** Set Selected Showdown (for optimistic token updates) */
  setSelectedShowdown?: (showdown: ShowdownDetail | null) => void
  /** Set Survivors */
  setSurvivors: (survivors: SurvivorDetail[]) => void
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
      className="w-full min-w-[430px] border-2 rounded-xl py-2 gap-2 transition-all duration-200 hover:shadow-lg bg-secondary"
      style={{
        ...getCardColorStyles(
          (selectedSurvivor?.color as ColorChoice) ?? ColorChoice.SLATE
        ),
        borderColor: 'var(--card-border-color)'
      }}>
      <CardContent className="px-2">
        <div className="flex flex-col xl:flex-row xl:flex-wrap gap-2 w-full">
          {/* First Column - Essential Stats */}
          <div className="flex flex-col flex-1 gap-1 xl:min-w-[450px]">
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
            <SurvivalCard
              mode={mode}
              selectedHunt={selectedHunt}
              selectedSettlement={selectedSettlement}
              selectedShowdown={selectedShowdown}
              selectedSurvivor={selectedSurvivor}
              setSelectedHunt={setSelectedHunt}
              setSelectedShowdown={setSelectedShowdown}
              setSurvivors={setSurvivors}
              survivors={survivors}
            />
            <WeaponProficiencyCard
              selectedSurvivor={selectedSurvivor}
              setSurvivors={setSurvivors}
              survivors={survivors}
            />
            <CourageUnderstandingCard
              selectedSettlement={selectedSettlement}
              selectedSurvivor={selectedSurvivor}
              setSurvivors={setSurvivors}
              survivors={survivors}
            />
            <DisordersCard
              selectedSurvivor={selectedSurvivor}
              setSurvivors={setSurvivors}
              survivors={survivors}
            />
            <AbilitiesAndImpairmentsCard
              selectedSurvivor={selectedSurvivor}
              setSurvivors={setSurvivors}
              survivors={survivors}
            />
            <OncePerLifetimeCard
              selectedSurvivor={selectedSurvivor}
              setSurvivors={setSurvivors}
              survivors={survivors}
            />
          </div>

          {/* Second Column - Combat */}
          <div className="flex flex-col flex-1 gap-1 xl:min-w-[450px]">
            <AttributeCard
              mode={mode}
              selectedHunt={selectedHunt}
              selectedSettlement={selectedSettlement}
              selectedShowdown={selectedShowdown}
              selectedSurvivor={selectedSurvivor}
              setSelectedHunt={setSelectedHunt}
              setSelectedShowdown={setSelectedShowdown}
              setSurvivors={setSurvivors}
              survivors={survivors}
            />
            <SanityCard
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
              survivors={survivors}
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
            <FightingArtsCard
              selectedSettlement={selectedSettlement}
              selectedSurvivor={selectedSurvivor}
              setSurvivors={setSurvivors}
              survivors={survivors}
            />
            <CursedGearCard
              selectedSettlement={selectedSettlement}
              selectedSurvivor={selectedSurvivor}
              setSurvivors={setSurvivors}
              survivors={survivors}
            />
            {mode === SurvivorCardMode.SURVIVOR_CARD && (
              <NextDepartureCard
                selectedSurvivor={selectedSurvivor}
                setSurvivors={setSurvivors}
                survivors={survivors}
              />
            )}
          </div>

          {/* Third Column - ARC */}
          {selectedSettlement?.survivor_type ===
            DatabaseSurvivorType[SurvivorType.ARC] && (
            <div className="flex flex-col flex-1 gap-1 xl:min-w-[450px] order-3">
              <PhilosophyCard
                selectedSettlement={selectedSettlement}
                selectedSurvivor={selectedSurvivor}
                setSurvivors={setSurvivors}
                survivors={survivors}
              />
              <KnowledgeCard
                selectedSettlement={selectedSettlement}
                selectedSurvivor={selectedSurvivor}
                setSurvivors={setSurvivors}
                survivors={survivors}
              />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
