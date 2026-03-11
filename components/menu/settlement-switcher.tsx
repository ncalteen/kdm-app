'use client'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import {
  Sidebar,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem
} from '@/components/ui/sidebar'
import {
  getHuntId,
  getSettlementPhaseId,
  getShowdownId
} from '@/lib/dal/settlement'
import { getSettlements } from '@/lib/dal/user'
import { CampaignType } from '@/lib/enums'
import { SettlementListItem } from '@/lib/types'
import { Check, ChevronsUpDown, House, Plus } from 'lucide-react'
import { ComponentProps, ReactElement, useEffect, useState } from 'react'

/**
 * Settlement Switcher Properties
 */
interface SettlementSwitcherProps extends ComponentProps<typeof Sidebar> {
  /** Selected Hunt ID */
  selectedHuntId: string | null
  /** Selected Settlement ID */
  selectedSettlementId: string | null
  /** Selected Settlement Phase ID */
  selectedSettlementPhaseId: string | null
  /** Selected Showdown ID */
  selectedShowdownId: string | null
  /** Set Selected Hunt ID */
  setSelectedHuntId: (hunt: string | null) => void
  /** Set Selected Settlement ID */
  setSelectedSettlementId: (settlement: string | null) => void
  /** Set Selected Settlement Phase ID */
  setSelectedSettlementPhaseId: (settlementPhase: string | null) => void
  /** Set Selected Showdown ID */
  setSelectedShowdownId: (showdown: string | null) => void
  /** Set Selected Survivor ID */
  setSelectedSurvivorId: (survivor: string | null) => void
}

/**
 * Settlement Switcher Component
 *
 * Displays a dropdown menu for switching between settlements. When the
 * currently selected settlement has an active hunt or showdown, the
 * background is highlighted in to indicate the settlement is in the
 * corresponding phase.
 *
 * @param props Settlement Switcher Properties
 * @returns Settlement Switcher Component
 */
export function SettlementSwitcher({
  selectedHuntId,
  selectedSettlementId,
  selectedSettlementPhaseId,
  selectedShowdownId,
  setSelectedHuntId,
  setSelectedSettlementId,
  setSelectedSettlementPhaseId,
  setSelectedShowdownId,
  setSelectedSurvivorId
}: SettlementSwitcherProps): ReactElement {
  const [settlementList, setSettlementList] = useState<SettlementListItem[]>([])
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  /**
   * Load Component
   *
   * Gather the list of settlements available to the user.
   */
  useEffect(() => {
    getSettlements()
      .then((data) => setSettlementList(data))
      .catch((err: unknown) =>
        setError(err instanceof Error ? err.message : 'Unknown Error')
      )
      .finally(() => setIsLoading(false))
  }, [])

  /**
   * Handle Settlement Selection
   *
   * Selects a settlement and loads its associated hunt, showdown, settlement
   * phase, etc.
   *
   * @param settlementId Settlement ID
   */
  const handleSettlementSelect = (settlementId: string) => {
    Promise.all([
      getHuntId(settlementId),
      getSettlementPhaseId(settlementId),
      getShowdownId(settlementId)
    ])
      .then(([huntId, settlementPhaseId, showdownId]) => {
        setSelectedSettlementId(settlementId)
        setSelectedHuntId(huntId)
        setSelectedSettlementPhaseId(settlementPhaseId)
        setSelectedShowdownId(showdownId)
        setSelectedSurvivorId(null)
      })
      .catch((err: unknown) => {
        console.error('Settlement Select Error:', err)
        setError(err instanceof Error ? err.message : 'Unknown Error')
      })
  }

  if (isLoading)
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <div className="flex items-center space-x-2">
            <House className="size-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              Loading settlements...
            </span>
          </div>
        </SidebarMenuItem>
      </SidebarMenu>
    )

  if (error)
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <div className="flex items-center space-x-2">
            <House className="size-4 text-destructive" />
            <span className="text-sm text-destructive">{error}</span>
          </div>
        </SidebarMenuItem>
      </SidebarMenu>
    )

  const campaignType = selectedSettlementId
    ? settlementList.find((s) => s.id === selectedSettlementId)?.campaign_type
    : null

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className={`data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground ${
                selectedHuntId
                  ? 'bg-yellow-500/20 hover:bg-yellow-500/30'
                  : selectedShowdownId
                    ? 'bg-red-500/20 hover:bg-red-500/30'
                    : selectedSettlementPhaseId
                      ? 'bg-green-500/20 hover:bg-green-500/30'
                      : ''
              }`}>
              <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                <House className="size-4" />
              </div>

              <div className="flex flex-col gap-0.5 leading-none">
                <span className="text-sm">
                  {selectedSettlementId
                    ? settlementList.find((s) => s.id === selectedSettlementId)
                        ?.settlement_name || 'Unknown Settlement'
                    : 'Create a Settlement'}
                </span>
                <span className="text-xs text-muted-foreground">
                  {selectedSettlementId
                    ? (campaignType && CampaignType[campaignType]) ||
                      'Unknown Campaign Type'
                    : 'Choose your destiny'}
                </span>
              </div>

              <ChevronsUpDown className="ml-auto" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width)"
            align="start">
            {/* Always display the create settlement option */}
            <DropdownMenuItem
              onSelect={() => {
                setSelectedHuntId(null)
                setSelectedSettlementId(null)
                setSelectedSettlementPhaseId(null)
                setSelectedShowdownId(null)
                setSelectedSurvivorId(null)
              }}>
              <div className="flex items-center">
                <Plus className="mr-2 h-4 w-4" />
                <span>Create a Settlement</span>
              </div>
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            {/* Display existing settlements */}
            {settlementList.map((settlement) => (
              <DropdownMenuItem
                key={settlement.id}
                onSelect={() => handleSettlementSelect(settlement.id)}>
                <div className="flex flex-col">
                  <span className="text-sm">{settlement.settlement_name}</span>
                  <span className="text-xs text-muted-foreground">
                    {CampaignType[settlement.campaign_type]}
                  </span>
                </div>
                {settlement.id === selectedSettlementId && (
                  <Check className="ml-auto" />
                )}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
