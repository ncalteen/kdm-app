'use client'

import { AttributeCard } from '@/components/survivor/attributes/attribute-card'
import { Avatar } from '@/components/ui/avatar'
import { CardContent } from '@/components/ui/card'
import { SurvivorCardMode } from '@/lib/enums'
import { SurvivorDetail } from '@/lib/types'
import { AvatarFallback } from '@radix-ui/react-avatar'
import { ReactElement } from 'react'

/**
 * Survivor Details Panel Props
 */
interface SurvivorDetailsPanelProps {
  /** Survivor to Display */
  survivor: SurvivorDetail | null
  /** Survivors */
  survivors: SurvivorDetail[] | null
}

/**
 * Survivor Details Panel Component
 *
 * This component displays detailed information about a survivor.
 *
 * @param props Survivor Details Panel Properties
 * @returns Survivor Details Panel Component
 */
export function SurvivorDetailsPanel({
  survivor,
  survivors
}: SurvivorDetailsPanelProps): ReactElement {
  return survivor === null ? (
    <div className="w-[450px] h-full flex items-center justify-center text-muted-foreground">
      <div className="text-center">
        {survivors && survivors.length > 0 ? (
          <>
            <p className="text-lg font-medium">Hover over a survivor</p>
            <p className="text-sm">to view their details</p>
          </>
        ) : (
          <>
            <p className="text-lg font-medium">No survivors available</p>
          </>
        )}
      </div>
    </div>
  ) : (
    <div className="w-[450px] h-full bg-gradient-to-br from-background to-background/95 border-2 border-border rounded-lg">
      {/* Header */}
      <div className="bg-muted/30 border-b border-border/30 p-4">
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16 border-2 border-background shadow-lg items-center justify-center">
            <AvatarFallback className="font-bold text-xl from-primary/20 to-primary/10 flex items-center justify-center">
              {survivor.survivor_name
                ? survivor.survivor_name
                    .split(' ')
                    .map((n) => n[0])
                    .join('')
                    .slice(0, 2)
                : '??'}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-lg leading-tight truncate text-primary">
              {survivor.survivor_name}
            </h3>
            <p className="text-sm text-muted-foreground">{survivor.gender}</p>
          </div>
        </div>
      </div>

      <CardContent className="p-4 space-y-4 max-h-[calc(60vh-120px)] overflow-y-auto">
        <AttributeCard
          mode={SurvivorCardMode.SURVIVOR_CARD}
          selectedHunt={null}
          selectedSettlement={null}
          selectedShowdown={null}
          selectedSurvivor={survivor}
          setSurvivors={() => {}}
          survivors={[]}
          disabled={true}
        />

        {/* Additional Attributes Section */}
        <div className="bg-muted/20 rounded-lg border border-border/30 overflow-hidden">
          <div className="p-3 grid grid-cols-2 gap-3">
            <div className="text-center">
              <div className="text-xs font-medium text-muted-foreground">
                Courage
              </div>
              <div className="text-lg font-bold">{survivor.courage}</div>
            </div>
            <div className="text-center">
              <div className="text-xs font-medium text-muted-foreground">
                Understanding
              </div>
              <div className="text-lg font-bold">{survivor.understanding}</div>
            </div>
          </div>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Fighting Arts */}
          {(survivor.fighting_arts.length > 0 ||
            survivor.secret_fighting_arts.length > 0) && (
            <div className="bg-muted/20 rounded-lg border border-border/30 overflow-hidden">
              <div className="bg-muted/40 px-3 py-2 border-b border-border/30">
                <h4 className="text-sm font-semibold">Fighting Arts</h4>
              </div>
              <div className="p-3 space-y-1 max-h-32 overflow-y-auto">
                {survivor.fighting_arts.map((art, index) => (
                  <div
                    key={index}
                    className="text-xs bg-background/60 rounded px-2 py-1">
                    {art.fighting_art_name}
                  </div>
                ))}
                {survivor.secret_fighting_arts.map((art, index) => (
                  <div
                    key={index}
                    className="text-xs bg-gradient-to-r from-yellow-100 to-yellow-50 dark:from-yellow-900/30 dark:to-yellow-800/20 border border-yellow-200/50 dark:border-yellow-700/30 rounded px-2 py-1">
                    {art.secret_fighting_art_name}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Disorders */}
          {survivor.disorders.length > 0 && (
            <div className="bg-muted/20 rounded-lg border border-border/30 overflow-hidden">
              <div className="bg-muted/40 px-3 py-2 border-b border-border/30">
                <h4 className="text-sm font-semibold">Disorders</h4>
              </div>
              <div className="p-3 space-y-1 max-h-32 overflow-y-auto">
                {survivor.disorders.map((disorder, index) => (
                  <div
                    key={index}
                    className="text-xs bg-red-50 dark:bg-red-950/30 border border-red-200/50 dark:border-red-800/30 rounded px-2 py-1">
                    {disorder.disorder_name}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Abilities & Impairments */}
          {survivor.abilities_impairments.length > 0 && (
            <div className="bg-muted/20 rounded-lg border border-border/30 overflow-hidden">
              <div className="bg-muted/40 px-3 py-2 border-b border-border/30">
                <h4 className="text-sm font-semibold">
                  Abilities & Impairments
                </h4>
              </div>
              <div className="p-3 space-y-1 max-h-32 overflow-y-auto">
                {survivor.abilities_impairments.map((ability, index) => (
                  <div
                    key={index}
                    className="text-xs bg-background/60 rounded px-2 py-1">
                    {ability}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Philosophy */}
          {survivor.philosophy && (
            <div className="bg-muted/20 rounded-lg border border-border/30 overflow-hidden">
              <div className="bg-muted/40 px-3 py-2 border-b border-border/30">
                <h4 className="text-sm font-semibold">Philosophy</h4>
              </div>
              <div className="p-3 space-y-2">
                <div className="bg-background/60 rounded px-2 py-1">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-medium">
                      {survivor.philosophy.philosophy_name}
                    </span>
                    <span className="text-muted-foreground">
                      Rank {survivor.philosophy_rank}
                    </span>
                  </div>
                </div>
                {survivor.tenet_knowledge && (
                  <div className="text-xs bg-background/40 rounded px-2 py-1">
                    {survivor.tenet_knowledge.knowledge_name}
                  </div>
                )}
                {survivor.neurosis && (
                  <div className="text-xs bg-orange-50 dark:bg-orange-950/30 border border-orange-200/50 dark:border-orange-800/30 rounded px-2 py-1">
                    {survivor.neurosis.neurosis_name}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Knowledge */}
          {(survivor.knowledge_1 || survivor.knowledge_2) && (
            <div className="bg-muted/20 rounded-lg border border-border/30 overflow-hidden">
              <div className="bg-muted/40 px-3 py-2 border-b border-border/30">
                <h4 className="text-sm font-semibold">Knowledge</h4>
              </div>
              <div className="p-3 space-y-1">
                {survivor.knowledge_1 && (
                  <div className="text-xs bg-blue-50 dark:bg-blue-950/30 border border-blue-200/50 dark:border-blue-800/30 rounded px-2 py-1">
                    {survivor.knowledge_1.knowledge_name}
                  </div>
                )}
                {survivor.knowledge_2 && (
                  <div className="text-xs bg-blue-50 dark:bg-blue-950/30 border border-blue-200/50 dark:border-blue-800/30 rounded px-2 py-1">
                    {survivor.knowledge_2.knowledge_name}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Cursed Gear */}
          {survivor.cursed_gear && survivor.cursed_gear.length > 0 && (
            <div className="bg-muted/20 rounded-lg border border-border/30 overflow-hidden">
              <div className="bg-muted/40 px-3 py-2 border-b border-border/30">
                <h4 className="text-sm font-semibold">Cursed Gear</h4>
              </div>
              <div className="p-3 space-y-1 max-h-32 overflow-y-auto">
                {survivor.cursed_gear.map((gear, index) => (
                  <div
                    key={index}
                    className="text-xs bg-gradient-to-r from-purple-100 to-purple-50 dark:from-purple-900/30 dark:to-purple-800/20 border border-purple-200/50 dark:border-purple-700/30 rounded px-2 py-1">
                    {gear.gear_name}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Next Departure */}
          {survivor.next_departure && survivor.next_departure.length > 0 && (
            <div className="bg-muted/20 rounded-lg border border-border/30 overflow-hidden">
              <div className="bg-muted/40 px-3 py-2 border-b border-border/30">
                <h4 className="text-sm font-semibold">Next Departure</h4>
              </div>
              <div className="p-3 space-y-1 max-h-32 overflow-y-auto">
                {survivor.next_departure.map((departure, index) => (
                  <div
                    key={index}
                    className="text-xs bg-gradient-to-r from-teal-100 to-teal-50 dark:from-teal-900/30 dark:to-teal-800/20 border border-teal-200/50 dark:border-teal-700/30 rounded px-2 py-1">
                    {departure}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </div>
  )
}
