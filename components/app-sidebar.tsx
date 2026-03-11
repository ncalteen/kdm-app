'use client'

import { SettlementSwitcher } from '@/components/menu/settlement-switcher'
import { NavMain } from '@/components/nav-main'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail
} from '@/components/ui/sidebar'
import { Tables } from '@/lib/database.types'
import {
  DatabaseCampaignType,
  DatabaseSurvivorType,
  TabType
} from '@/lib/enums'
import { ERROR_MESSAGE } from '@/lib/messages'
import { generateSeedData } from '@/lib/seed'
import {
  DatabaseIcon,
  HourglassIcon,
  LightbulbIcon,
  LoaderCircleIcon,
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
import { ComponentProps, ReactElement, useMemo, useTransition } from 'react'
import { toast } from 'sonner'

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
  /** Selected Hunt */
  selectedHunt: Tables<'hunt'> | null
  /** Selected Settlement */
  selectedSettlement: Tables<'settlement'> | null
  /** Selected Settlement Phase */
  selectedSettlementPhase: Tables<'settlement_phase'> | null
  /** Selected Showdown */
  selectedShowdown: Tables<'showdown'> | null
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
  selectedHunt,
  selectedSettlement,
  selectedSettlementPhase,
  selectedShowdown,
  selectedTab,
  setSelectedHuntId,
  setSelectedSettlementId,
  setSelectedSettlementPhaseId,
  setSelectedShowdownId,
  setSelectedSurvivorId,
  setSelectedTab,
  ...props
}: AppSidebarProps): ReactElement {
  const [isSeeding, startSeedTransition] = useTransition()

  const navItems = useMemo(() => {
    const items =
      selectedSettlement?.campaign_type ===
      DatabaseCampaignType['Squires of the Citadel']
        ? [...navSquires]
        : [...baseNavPrimary]

    if (selectedSettlement?.survivor_type === DatabaseSurvivorType['Arc']) {
      const notesIndex = items.findIndex((item) => item.tab === TabType.NOTES)

      if (notesIndex !== -1) {
        items.splice(notesIndex, 0, {
          title: 'Arc',
          tab: TabType.ARC,
          icon: LightbulbIcon
        })
      }
    }

    return items
  }, [selectedSettlement?.campaign_type, selectedSettlement?.survivor_type])

  return (
    <Sidebar
      collapsible="icon"
      className="top-(--header-height) !h-[calc(100svh-var(--header-height))]"
      {...props}>
      <SidebarHeader>
        <SettlementSwitcher
          selectedHunt={selectedHunt}
          selectedSettlement={selectedSettlement}
          selectedSettlementPhase={selectedSettlementPhase}
          selectedShowdown={selectedShowdown}
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

      {process.env.NODE_ENV === 'development' && (
        <SidebarFooter>
          <SidebarGroup className="group-data-[collapsible=icon]:hidden">
            <SidebarGroupLabel>Developer</SidebarGroupLabel>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  disabled={isSeeding}
                  onClick={() => {
                    startSeedTransition(async () => {
                      try {
                        await generateSeedData()
                      } catch (err) {
                        console.error('Seed Data Error:', err)
                        toast.error(ERROR_MESSAGE())
                      }
                    })
                  }}>
                  {isSeeding ? (
                    <LoaderCircleIcon className="animate-spin" />
                  ) : (
                    <DatabaseIcon />
                  )}
                  <span className="text-xs">
                    {isSeeding ? 'Generating...' : 'Generate Seed Data'}
                  </span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroup>
        </SidebarFooter>
      )}
    </Sidebar>
  )
}
