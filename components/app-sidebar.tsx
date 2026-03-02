'use client'

import { SettlementSwitcher } from '@/components/menu/settlement-switcher'
import { NavMain } from '@/components/nav-main'
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarRail
} from '@/components/ui/sidebar'
import { getCampaignType, getSurvivorType } from '@/lib/dal/settlement'
import { CampaignType, SurvivorType, TabType } from '@/lib/enums'
import {
  HourglassIcon,
  LightbulbIcon,
  NotebookPenIcon,
  PawPrintIcon,
  School2Icon,
  SchoolIcon,
  SettingsIcon,
  SkullIcon,
  SwordsIcon,
  UsersIcon,
  WrenchIcon
} from 'lucide-react'
import { ComponentProps, ReactElement, useEffect, useState } from 'react'

/**
 * Primary Navigation Items
 */
const baseNavPrimary = [
  {
    title: 'Timeline',
    tab: TabType.TIMELINE,
    icon: HourglassIcon
  },
  {
    title: 'Monsters',
    tab: TabType.MONSTERS,
    icon: SwordsIcon
  },
  {
    title: 'Survivors',
    tab: TabType.SURVIVORS,
    icon: UsersIcon
  },
  {
    title: 'Society',
    tab: TabType.SOCIETY,
    icon: SchoolIcon
  },
  {
    title: 'Crafting',
    tab: TabType.CRAFTING,
    icon: WrenchIcon
  },
  {
    title: 'Notes',
    tab: TabType.NOTES,
    icon: NotebookPenIcon
  }
]

/**
 * Squires of the Citadel Navigation Items
 */
const navSquires = [
  {
    title: 'Timeline',
    tab: TabType.TIMELINE,
    icon: HourglassIcon
  },
  {
    title: 'Monsters',
    tab: TabType.MONSTERS,
    icon: SwordsIcon
  },
  {
    title: 'Squires',
    tab: TabType.SQUIRES,
    icon: UsersIcon
  },
  {
    title: 'Society',
    tab: TabType.SOCIETY,
    icon: SchoolIcon
  },
  {
    title: 'Crafting',
    tab: TabType.CRAFTING,
    icon: WrenchIcon
  },
  {
    title: 'Notes',
    tab: TabType.NOTES,
    icon: NotebookPenIcon
  }
]

/**
 * Embark Navigation Items
 */
const navEmbark = [
  {
    title: 'Hunt',
    tab: TabType.HUNT,
    icon: PawPrintIcon
  },
  {
    title: 'Showdown',
    tab: TabType.SHOWDOWN,
    icon: SkullIcon
  },
  {
    title: 'Settlement Phase',
    tab: TabType.SETTLEMENT_PHASE,
    icon: School2Icon
  }
]

/**
 * Settings Navigation Items
 */
const navSettings = [
  {
    title: 'Settings',
    tab: TabType.SETTINGS,
    icon: SettingsIcon
  }
]

/**
 * Application Sidebar Properties
 */
interface AppSidebarProps extends ComponentProps<typeof Sidebar> {
  /** Selected Hunt ID */
  selectedHuntId: string | null
  /** Selected Settlement ID */
  selectedSettlementId: string | null
  /** Selected Settlement Phase ID */
  selectedSettlementPhaseId: string | null
  /** Selected Showdown ID */
  selectedShowdownId: string | null
  /** Selected Tab */
  selectedTab: TabType
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
  /** Set Selected Tab */
  setSelectedTab: (tab: TabType) => void
}

/**
 * Application Sidebar Component
 *
 * @param props Application Sidebar Properties
 * @returns Application Sidebar Component
 */
export function AppSidebar({
  selectedHuntId,
  selectedSettlementId,
  selectedSettlementPhaseId,
  selectedShowdownId,
  selectedTab,
  setSelectedHuntId,
  setSelectedSettlementId,
  setSelectedSettlementPhaseId,
  setSelectedShowdownId,
  setSelectedSurvivorId,
  setSelectedTab,
  ...props
}: AppSidebarProps): ReactElement {
  const [navItems, setNavItems] = useState(baseNavPrimary)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Get the settlement's campaign type and survivor type
    Promise.all([
      getCampaignType(selectedSettlementId),
      getSurvivorType(selectedSettlementId)
    ])
      .then(([campaignType, survivorType]) => {
        const newNavItems =
          campaignType === CampaignType.SQUIRES_OF_THE_CITADEL
            ? [...navSquires]
            : [...baseNavPrimary]

        if (survivorType === SurvivorType.ARC) {
          const notesIndex = newNavItems.findIndex(
            (item) => item.tab === TabType.NOTES
          )

          if (notesIndex !== -1)
            newNavItems.splice(notesIndex, 0, {
              title: 'Arc',
              tab: TabType.ARC,
              icon: LightbulbIcon
            })
        }

        setNavItems(newNavItems)
      })
      .catch((err: unknown) =>
        setError(
          err instanceof Error
            ? `Settlement Load Error: ${err.message}`
            : 'Settlement Load Error: Unknown Error'
        )
      )
  }, [selectedSettlementId])

  if (error)
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-red-500">{error}</p>
      </div>
    )

  return (
    <Sidebar
      collapsible="icon"
      className="top-(--header-height) !h-[calc(100svh-var(--header-height))]"
      {...props}>
      <SidebarHeader>
        <SettlementSwitcher
          selectedHuntId={selectedHuntId}
          selectedSettlementId={selectedSettlementId}
          selectedSettlementPhaseId={selectedSettlementPhaseId}
          selectedShowdownId={selectedShowdownId}
          setSelectedHuntId={setSelectedHuntId}
          setSelectedSettlementId={setSelectedSettlementId}
          setSelectedSettlementPhaseId={setSelectedSettlementPhaseId}
          setSelectedShowdownId={setSelectedShowdownId}
          setSelectedSurvivorId={setSelectedSurvivorId}
        />
      </SidebarHeader>

      <SidebarContent className="group-data-[collapsible=icon]:justify-center">
        <SidebarGroup className="group-data-[collapsible=icon]:p-0 group-data-[collapsible=icon]:flex-1">
          <SidebarGroupLabel>Settlement</SidebarGroupLabel>
          <NavMain
            items={navItems}
            selectedTab={selectedTab}
            setSelectedTab={setSelectedTab}
          />
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Embark</SidebarGroupLabel>
          <NavMain
            items={navEmbark}
            selectedTab={selectedTab}
            setSelectedTab={setSelectedTab}
          />
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Configuration</SidebarGroupLabel>
          <NavMain
            items={navSettings}
            selectedTab={selectedTab}
            setSelectedTab={setSelectedTab}
          />
        </SidebarGroup>
      </SidebarContent>

      <SidebarRail />
    </Sidebar>
  )
}
