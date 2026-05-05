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
import { Skeleton } from '@/components/ui/skeleton'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from '@/components/ui/tooltip'
import { LanternMark } from '@/components/generic/lantern-mark'
import { LocalStateType } from '@/contexts/local-context'
import { useToast } from '@/hooks/use-toast'
import { getSettlementForUser } from '@/lib/dal/user'
import { CampaignType, DatabaseCampaignType } from '@/lib/enums'
import { ERROR_MESSAGE } from '@/lib/messages'
import { SettlementDetail, SettlementRole } from '@/lib/types'
import { Check, ChevronsUpDown, House, Plus } from 'lucide-react'
import {
  ComponentProps,
  ReactElement,
  useEffect,
  useRef,
  useState
} from 'react'

/**
 * Settlement Switcher Properties
 */
interface SettlementSwitcherProps extends ComponentProps<typeof Sidebar> {
  /** Is Creating New Settlement */
  isCreatingNewSettlement: boolean
  /** Local State */
  local: LocalStateType
  /** Selected Hunt ID */
  selectedHuntId: string | null
  /** Selected Settlement */
  selectedSettlement: SettlementDetail | null
  /** Selected Settlement ID */
  selectedSettlementId: string | null
  /** Selected Settlement Phase ID */
  selectedSettlementPhaseId: string | null
  /** Selected Showdown ID */
  selectedShowdownId: string | null
  /** Set Is Creating New Settlement */
  setIsCreatingNewSettlement: (isCreating: boolean) => void
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
 * background is highlighted to indicate the settlement is in the
 * corresponding phase.
 *
 * @param props Settlement Switcher Properties
 * @returns Settlement Switcher Component
 */
export function SettlementSwitcher({
  isCreatingNewSettlement,
  local,
  selectedHuntId,
  selectedSettlement,
  selectedSettlementId,
  selectedSettlementPhaseId,
  selectedShowdownId,
  setIsCreatingNewSettlement,
  setSelectedHuntId,
  setSelectedSettlementId,
  setSelectedSettlementPhaseId,
  setSelectedShowdownId,
  setSelectedSurvivorId
}: SettlementSwitcherProps): ReactElement {
  const { toast } = useToast(local)

  const [settlementList, setSettlementList] = useState<
    {
      campaign_type: DatabaseCampaignType
      id: string
      settlement_name: string
      role: SettlementRole
      owner_username: string | null
    }[]
  >([])
  const [isLoading, setIsLoading] = useState(true)
  const fetchedRef = useRef(false)

  /**
   * Load Settlements
   *
   * Gather the list of settlements available to the user. Uses a ref to
   * prevent redundant fetches on re-renders while still refetching when the
   * selected settlement changes.
   */
  useEffect(() => {
    // Always refetch when selectedSettlementId changes, but track initial load
    fetchedRef.current = false

    let isCancelled = false

    getSettlementForUser()
      .then((data) => {
        if (isCancelled) return
        setSettlementList(data)
        fetchedRef.current = true
      })
      .catch((err: unknown) => {
        if (isCancelled) return
        console.error('Settlement List Fetch Error:', err)
        toast.error(ERROR_MESSAGE())
      })
      .finally(() => {
        if (!isCancelled) setIsLoading(false)
      })

    return () => {
      isCancelled = true
    }
  }, [selectedSettlementId, toast])

  /**
   * Handle Settlement Selection
   *
   * @param settlementId Settlement ID
   */
  const handleSettlementSelect = (settlementId: string) => {
    setIsCreatingNewSettlement(false)
    setSelectedSettlementId(settlementId)
  }

  if (isLoading)
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton size="lg" className="pointer-events-none">
            <Skeleton className="flex aspect-square size-8 rounded-lg" />
            <div className="flex flex-col gap-0.5 leading-none flex-1">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-3 w-16" />
            </div>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    )

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
                  {isCreatingNewSettlement
                    ? 'Found a settlement'
                    : (selectedSettlement?.settlement_name ??
                      'Choose a settlement')}
                </span>
                <span className="text-xs text-muted-foreground">
                  {selectedSettlementId
                    ? (selectedSettlement?.campaign_type &&
                        CampaignType[selectedSettlement?.campaign_type]) ||
                      'Unknown Campaign Type'
                    : 'Find on the lantern hoard'}
                </span>
              </div>

              <ChevronsUpDown className="ml-auto" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width)"
            align="start">
            {/* Create settlement option */}
            <DropdownMenuItem
              onSelect={() => {
                setIsCreatingNewSettlement(true)
                setSelectedHuntId(null)
                setSelectedSettlementId(null)
                setSelectedSettlementPhaseId(null)
                setSelectedShowdownId(null)
                setSelectedSurvivorId(null)
              }}>
              <div className="flex items-center">
                <Plus className="mr-2 h-4 w-4" />
                <span>Found a settlement</span>
              </div>
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            {settlementList.length === 0 && (
              <DropdownMenuItem disabled>
                <span className="text-xs text-muted-foreground">
                  No settlements yet — light your first lantern.
                </span>
              </DropdownMenuItem>
            )}

            {/* Existing settlements */}
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
                {settlement.role === 'collaborator' && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span
                        className="ml-auto inline-flex items-center"
                        aria-label={
                          settlement.owner_username
                            ? `Shared by @${settlement.owner_username}`
                            : 'Shared with you'
                        }>
                        <LanternMark className="h-3.5 w-3.5 text-amber-400/90" />
                      </span>
                    </TooltipTrigger>
                    <TooltipContent>
                      {settlement.owner_username
                        ? `Shared by @${settlement.owner_username}`
                        : 'Shared with you'}
                    </TooltipContent>
                  </Tooltip>
                )}
                {settlement.id === selectedSettlementId && (
                  <Check
                    className={
                      settlement.role === 'collaborator' ? 'ml-1' : 'ml-auto'
                    }
                  />
                )}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
