import { LogoutButton } from '@/components/logout-button'
import { SettlementSwitcher } from '@/components/menu/settlement-switcher'
import { NavMain } from '@/components/nav-main'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarRail
} from '@/components/ui/sidebar'
import { useLocal } from '@/contexts/local-context'
import {
  CampaignType,
  DatabaseCampaignType,
  DatabaseSurvivorType,
  SurvivorType,
  TabType
} from '@/lib/enums'
import { SettlementDetail, SettlementListEntry } from '@/lib/types'
import {
  CircleQuestionMarkIcon,
  CreditCardIcon,
  HourglassIcon,
  LightbulbIcon,
  NotebookPenIcon,
  PawPrintIcon,
  School2Icon,
  SchoolIcon,
  SettingsIcon,
  Share2Icon,
  ShieldCheckIcon,
  SkullIcon,
  SwordsIcon,
  UserIcon,
  UsersIcon,
  WrenchIcon
} from 'lucide-react'
import { ComponentProps, ReactElement, useMemo } from 'react'

/**
 * Primary Navigation Items
 *
 * The Sharing entry is appended at runtime inside `AppSidebar` so the
 * `subscription-management` feature flag can gate it — see the
 * `useMemo`-derived `navItems` below.
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
 *
 * Same Sharing-gating contract as `baseNavPrimary` — the entry is
 * appended in `navItems` when the feature flag resolves true.
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
 * Sharing Navigation Entry
 *
 * Shared between the Primary and Squires settlement variants. Gated
 * behind the `subscription-management` feature flag — the entry is
 * spliced into the per-campaign nav list at runtime so off-allowlist
 * users never see the tab.
 */
const navSharingEntry = {
  title: 'Sharing',
  tab: TabType.SHARING,
  icon: Share2Icon
}

/**
 * Settlement Settings Navigation Entry
 */
const navSettlementSettingsEntry = {
  title: 'Settlement Settings',
  tab: TabType.SETTLEMENT_SETTINGS,
  icon: SettingsIcon
}

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
 * Subscription Navigation Entry
 *
 * Gated behind the `subscription-management` feature flag at runtime in
 * `AppSidebar`'s `navSettings` memo. Off-allowlist users never see the
 * tab; on-allowlist users see it in production.
 */
const navSubscriptionEntry = {
  title: 'Subscription',
  tab: TabType.SUBSCRIPTION,
  icon: CreditCardIcon
}

/**
 * Admin Settings Navigation Entry
 *
 * Added only when Supabase Auth reports the verified user role is `admin`.
 */
const navAdminSettingsEntry = {
  title: 'Admin Settings',
  tab: TabType.ADMIN_SETTINGS,
  icon: ShieldCheckIcon
}

/**
 * Settings Navigation Items (Always Visible)
 *
 * Subscription and Admin entries are appended at runtime by the `navSettings`
 * memo so feature and auth gates can control them.
 */
const baseNavSettings = [
  {
    title: 'User Content',
    tab: TabType.USER,
    icon: UserIcon
  },
  {
    title: 'User Settings',
    tab: TabType.SETTINGS,
    icon: SettingsIcon
  },
  {
    title: 'Help',
    tab: TabType.HELP,
    icon: CircleQuestionMarkIcon
  }
]

/**
 * Application Sidebar Properties
 */
interface AppSidebarProps extends ComponentProps<typeof Sidebar> {
  /** Is Creating New Settlement */
  isCreatingNewSettlement: boolean
  /** Whether the settlement list is still on its initial fetch */
  isSettlementListLoading: boolean
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
  /** Selected Tab */
  selectedTab: TabType
  /** Settlement List (live, sourced from LocalContext) */
  settlementList: SettlementListEntry[]
  /** Set Is Creating New Settlement */
  setIsCreatingNewSettlement: (isCreating: boolean) => void
  /** Set Selected Hunt ID */
  setSelectedHuntId: (huntId: string | null) => void
  /** Set Selected Settlement ID */
  setSelectedSettlementId: (settlementId: string | null) => void
  /** Set Selected Settlement Phase ID */
  setSelectedSettlementPhaseId: (settlementPhaseId: string | null) => void
  /** Set Selected Showdown ID */
  setSelectedShowdownId: (showdownId: string | null) => void
  /** Set Selected Survivor ID */
  setSelectedSurvivorId: (survivorId: string | null) => void
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
  isCreatingNewSettlement,
  isSettlementListLoading,
  selectedHuntId,
  selectedSettlement,
  selectedSettlementId,
  selectedSettlementPhaseId,
  selectedShowdownId,
  selectedTab,
  settlementList,
  setIsCreatingNewSettlement,
  setSelectedHuntId,
  setSelectedSettlementId,
  setSelectedSettlementPhaseId,
  setSelectedShowdownId,
  setSelectedSurvivorId,
  setSelectedTab,
  ...props
}: AppSidebarProps): ReactElement {
  // The `subscription-management` feature flag gates BOTH the Subscription
  // tab (billing surface) and the Sharing tab (the paid feature) behind a
  // single early-access allowlist. When the rollout opens to everyone, the
  // Sharing entry should be re-gated on `canShare` so non-subscribers stop
  // seeing it; see `docs/settlement-sharing-architecture.md` §9.
  const { isAdmin, subscriptionManagementEnabled, userSubscription } =
    useLocal()

  const navItems = useMemo(() => {
    const items =
      selectedSettlement?.campaign_type ===
      DatabaseCampaignType[CampaignType.SQUIRES_OF_THE_CITADEL]
        ? [...navSquires]
        : [...baseNavPrimary]

    // Add Arc tab for ARC survivors (before the Notes tab)
    if (
      selectedSettlement?.survivor_type ===
      DatabaseSurvivorType[SurvivorType.ARC]
    ) {
      const notesIndex = items.findIndex((item) => item.tab === TabType.NOTES)

      if (notesIndex !== -1) {
        items.splice(notesIndex, 0, {
          title: 'Arc',
          tab: TabType.ARC,
          icon: LightbulbIcon
        })
      }
    }

    // Append Sharing only when the user is in the subscription-management
    // early-access cohort. Off-allowlist users never see the entry.
    if (subscriptionManagementEnabled) items.push(navSharingEntry)

    items.push(navSettlementSettingsEntry)

    return items
  }, [
    selectedSettlement?.campaign_type,
    selectedSettlement?.survivor_type,
    subscriptionManagementEnabled
  ])

  // Splice gated settings entries before Help so the Configuration group keeps
  // Help as the last stop while hiding admin controls from non-admin users.
  const navSettings = useMemo(() => {
    const items = [...baseNavSettings]
    const insertBeforeHelp = (entry: (typeof items)[number]) => {
      const helpIndex = items.findIndex((item) => item.tab === TabType.HELP)

      if (helpIndex === -1) items.push(entry)
      else items.splice(helpIndex, 0, entry)
    }

    if (subscriptionManagementEnabled) insertBeforeHelp(navSubscriptionEntry)
    if (isAdmin) insertBeforeHelp(navAdminSettingsEntry)

    return items
  }, [isAdmin, subscriptionManagementEnabled])

  return (
    <Sidebar
      collapsible="icon"
      className="top-(--header-height) h-[calc(100svh-var(--header-height))]!"
      {...props}>
      <SidebarHeader>
        <SettlementSwitcher
          isCreatingNewSettlement={isCreatingNewSettlement}
          isSettlementListLoading={isSettlementListLoading}
          selectedHuntId={selectedHuntId}
          selectedSettlement={selectedSettlement}
          selectedSettlementId={selectedSettlementId}
          selectedSettlementPhaseId={selectedSettlementPhaseId}
          selectedShowdownId={selectedShowdownId}
          settlementList={settlementList}
          userSubscription={userSubscription}
          setIsCreatingNewSettlement={setIsCreatingNewSettlement}
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

      <SidebarFooter>
        <LogoutButton />
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  )
}
