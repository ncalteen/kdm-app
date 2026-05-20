'use client'

import { LanternMark } from '@/components/generic/lantern-mark'
import { ListCard } from '@/components/generic/list-card'
import { HelpCard } from '@/components/help/help-card'
import { HuntCard } from '@/components/hunt/hunt-card'
import { AdminAdoptionCard } from '@/components/settings/admin-adoption-card'
import { AdminDevelopmentCard } from '@/components/settings/admin-development-card'
import { AdminUserManagementCard } from '@/components/settings/admin-user-management-card'
import { SettlementSettingsCard } from '@/components/settings/settlement-settings-card'
import { SubscriptionCard } from '@/components/settings/subscription-card'
import { UserSettingsCard } from '@/components/settings/user-settings-card'
import { SettlementPhaseCard } from '@/components/settlement-phase/settlement-phase-card'
import { CollectiveCognitionRewardsCard } from '@/components/settlement/arc/collective-cognition-rewards-card'
import { CollectiveCognitionVictoriesCard } from '@/components/settlement/arc/collective-cognition-victories-card'
import { KnowledgesCard } from '@/components/settlement/arc/knowledges-card'
import { PhilosophiesCard } from '@/components/settlement/arc/philosophies-card'
import { CreateSettlementCard } from '@/components/settlement/create-settlement-card'
import { GearCard } from '@/components/settlement/gear/gear-card'
import { InnovationsCard } from '@/components/settlement/innovations/innovations-card'
import { LocationsCard } from '@/components/settlement/locations/locations-card'
import { MilestonesCard } from '@/components/settlement/milestones/milestones-card'
import { NemesesCard } from '@/components/settlement/nemeses/nemeses-card'
import { NotesCard } from '@/components/settlement/notes/notes-card'
import { OverviewCard } from '@/components/settlement/overview/overview-card'
import { PatternsCard } from '@/components/settlement/patterns/patterns-card'
import { PrinciplesCard } from '@/components/settlement/principles/principles-card'
import { QuarriesCard } from '@/components/settlement/quarries/quarries-card'
import { ResourceOverviewCard } from '@/components/settlement/resources/resource-overview-card'
import { ResourcesCard } from '@/components/settlement/resources/resources-card'
import { SeedPatternsCard } from '@/components/settlement/seed-patterns/seed-patterns-card'
import { SharingCard } from '@/components/settlement/sharing/sharing-card'
import { SquireProgressionCards } from '@/components/settlement/squires/squire-progression-cards'
import { SquireSuspicionsCard } from '@/components/settlement/squires/squire-suspicions-card'
import { SettlementSurvivorsCard } from '@/components/settlement/survivors/settlement-survivors-card'
import { TimelineCard } from '@/components/settlement/timeline/timeline-card'
import { ShowdownCard } from '@/components/showdown/showdown-card'
import { CreateSurvivorForm } from '@/components/survivor/create-survivor-form'
import { SurvivorCard } from '@/components/survivor/survivor-card'
import { Button } from '@/components/ui/button'
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle
} from '@/components/ui/empty'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from '@/components/ui/tooltip'
import { UserCard } from '@/components/user/user-card'
import { useLocal } from '@/contexts/local-context'
import { FREE_TIER_SETTLEMENT_LIMIT } from '@/lib/common'
import { updateSettlement } from '@/lib/dal/settlement'
import {
  CampaignType,
  DatabaseCampaignType,
  DatabaseSurvivorType,
  SurvivorCardMode,
  SurvivorType,
  TabType
} from '@/lib/enums'
import { FREE_TIER_SETTLEMENT_LIMIT_MESSAGE } from '@/lib/messages'
import { canCreateUnlimitedSettlements } from '@/lib/subscription-entitlements'
import {
  HuntDetail,
  HuntStateSetter,
  SettlementDetail,
  SettlementListEntry,
  SettlementPhaseDetail,
  SettlementStateSetter,
  ShowdownDetail,
  ShowdownStateSetter,
  SurvivorDetail,
  SurvivorsStateSetter,
  SurvivorStateSetter,
  UserSettingsDetail
} from '@/lib/types'
import {
  BookOpenIcon,
  HousePlusIcon,
  MapPinPlusIcon,
  PlusIcon
} from 'lucide-react'
import { ReactElement } from 'react'

/**
 * Settlement Card Props
 */
interface SettlementCardProps {
  /** Is Creating New Settlement */
  isCreatingNewSettlement: boolean
  /** New Survivor Being Created */
  isCreatingNewSurvivor: boolean
  /* Pending Special Showdown */
  pendingSpecialShowdown: boolean
  /** Selected Hunt */
  selectedHunt: HuntDetail | null
  /** Selected Hunt Monster Index */
  selectedHuntMonsterIndex: number
  /** Selected Settlement */
  selectedSettlement: SettlementDetail | null
  /** Selected Settlement Phase */
  selectedSettlementPhase: SettlementPhaseDetail | null
  /** Selected Showdown */
  selectedShowdown: ShowdownDetail | null
  /** Selected Showdown Monster Index */
  selectedShowdownMonsterIndex: number
  /** Selected Survivor */
  selectedSurvivor: SurvivorDetail | null
  /** Selected Tab */
  selectedTab: TabType
  /** Settlement List (owned + shared, sourced from LocalContext) */
  settlementList: SettlementListEntry[]
  /** Set Is Creating New Settlement */
  setIsCreatingNewSettlement: (isCreating: boolean) => void
  /** Set New Survivor Being Created */
  setIsCreatingNewSurvivor: (isCreating: boolean) => void
  /** Set Pending Special Showdown */
  setPendingSpecialShowdown: (pending: boolean) => void
  /** Set Selected Hunt */
  setSelectedHunt: HuntStateSetter
  /** Set Selected Hunt ID */
  setSelectedHuntId: (huntId: string | null) => void
  /** Set Selected Hunt Monster Index */
  setSelectedHuntMonsterIndex: (index: number) => void
  /** Set Selected Settlement */
  setSelectedSettlement: SettlementStateSetter
  /** Set Selected Settlement ID */
  setSelectedSettlementId: (settlementId: string | null) => void
  /** Set Selected Settlement Phase */
  setSelectedSettlementPhase: (
    settlementPhase: SettlementPhaseDetail | null
  ) => void
  /** Set Selected Settlement Phase ID */
  setSelectedSettlementPhaseId: (settlementPhaseId: string | null) => void
  /** Set Selected Showdown */
  setSelectedShowdown: ShowdownStateSetter
  /** Set Selected Showdown ID */
  setSelectedShowdownId: (showdownId: string | null) => void
  /** Set Selected Showdown Monster Index */
  setSelectedShowdownMonsterIndex: (index: number) => void
  /** Set Selected Survivor */
  setSelectedSurvivor: SurvivorStateSetter
  /** Set Selected Survivor ID */
  setSelectedSurvivorId: (survivorId: string | null) => void
  /** Set Selected Tab */
  setSelectedTab: (tab: TabType) => void
  /** Set Survivors */
  setSurvivors: SurvivorsStateSetter
  /** Set User Settings */
  setUserSettings: (settings: UserSettingsDetail | null) => void
  /** Survivors */
  survivors: SurvivorDetail[]
  /** User Settings */
  userSettings: UserSettingsDetail | null
}

/**
 * Main Page Component
 *
 * @param props Settlement Form Properties
 * @returns Main Page Component
 */
export function SettlementCard({
  isCreatingNewSettlement,
  isCreatingNewSurvivor,
  pendingSpecialShowdown,
  selectedHunt,
  selectedHuntMonsterIndex,
  selectedSettlement,
  selectedSettlementPhase,
  selectedShowdown,
  selectedShowdownMonsterIndex,
  selectedSurvivor,
  selectedTab,
  settlementList,
  setIsCreatingNewSettlement,
  setIsCreatingNewSurvivor,
  setPendingSpecialShowdown,
  setSelectedHunt,
  setSelectedHuntId,
  setSelectedHuntMonsterIndex,
  setSelectedSettlement,
  setSelectedSettlementId,
  setSelectedSettlementPhase,
  setSelectedSettlementPhaseId,
  setSelectedShowdown,
  setSelectedShowdownId,
  setSelectedShowdownMonsterIndex,
  setSelectedSurvivor,
  setSelectedSurvivorId,
  setSelectedTab,
  setSurvivors,
  setUserSettings,
  survivors,
  userSettings
}: SettlementCardProps): ReactElement {
  // Defense-in-depth: the Subscription tab is gated by the
  // `subscription-management` feature flag in both the sidebar (which can
  // never select it when the flag is off) and `useStripeReturn` (which
  // skips the post-checkout tab switch). This local check protects against
  // a stale `selectedTab` value persisted to localStorage from a previous
  // session when the user was on the allowlist but has since been removed.
  const { isAdmin, subscriptionManagementEnabled, userSubscription } =
    useLocal()

  // User settings are always accessible, regardless of settlement state.
  if (selectedTab === TabType.SETTINGS)
    return (
      <UserSettingsCard
        setUserSettings={setUserSettings}
        userSettings={userSettings}
      />
    )

  // Settlement settings are settlement-scoped. The component still handles a
  // missing selected settlement so a stale persisted tab does not explode in
  // the darkness.
  if (selectedTab === TabType.SETTLEMENT_SETTINGS)
    return (
      <SettlementSettingsCard
        selectedHunt={selectedHunt}
        selectedSettlement={selectedSettlement}
        selectedSettlementPhase={selectedSettlementPhase}
        selectedShowdown={selectedShowdown}
        setSelectedHunt={setSelectedHunt}
        setSelectedHuntId={setSelectedHuntId}
        setSelectedSettlement={setSelectedSettlement}
        setSelectedSettlementId={setSelectedSettlementId}
        setSelectedSettlementPhase={setSelectedSettlementPhase}
        setSelectedSettlementPhaseId={setSelectedSettlementPhaseId}
        setSelectedShowdown={setSelectedShowdown}
        setSelectedShowdownId={setSelectedShowdownId}
        setSelectedSurvivorId={setSelectedSurvivorId}
      />
    )

  // User tab is always accessible, regardless of settlement state.
  if (selectedTab === TabType.USER)
    return (
      <UserCard setUserSettings={setUserSettings} userSettings={userSettings} />
    )

  // Subscription tab is always accessible, regardless of settlement state.
  // Billing surfaces live entirely on Stripe-hosted pages; this card only
  // renders the user's current plan and the CTAs that hand off to them.
  // Off-allowlist users (flag disabled) fall through to the default
  // settlement-empty UI rather than seeing the card, even if a stale
  // `selectedTab=subscription` value rehydrated from localStorage.
  if (selectedTab === TabType.SUBSCRIPTION && subscriptionManagementEnabled)
    return <SubscriptionCard />

  // Defense-in-depth for stale localStorage or manual tab switching attempts:
  // the sidebar hides this entry from non-admin users, and the route refuses
  // to render it unless Supabase Auth verified the `admin` role.
  if (selectedTab === TabType.ADMIN_ADOPTION && isAdmin)
    return <AdminAdoptionCard />

  if (selectedTab === TabType.ADMIN_DEVELOPMENT && isAdmin)
    return <AdminDevelopmentCard />

  if (selectedTab === TabType.ADMIN_USER_MANAGEMENT && isAdmin)
    return <AdminUserManagementCard />

  // Help tab is always accessible, regardless of settlement state.
  if (selectedTab === TabType.HELP) return <HelpCard />

  if (isCreatingNewSettlement)
    return (
      <CreateSettlementCard
        setIsCreatingNewSettlement={setIsCreatingNewSettlement}
        setSelectedHuntId={setSelectedHuntId}
        setSelectedHuntMonsterIndex={setSelectedHuntMonsterIndex}
        setSelectedSettlementId={setSelectedSettlementId}
        setSelectedSettlementPhaseId={setSelectedSettlementPhaseId}
        setSelectedShowdownId={setSelectedShowdownId}
        setSelectedShowdownMonsterIndex={setSelectedShowdownMonsterIndex}
        setSelectedSurvivorId={setSelectedSurvivorId}
      />
    )

  if (!selectedSettlement) {
    // Mirror the SettlementSwitcher's free-tier ownership cap so the
    // empty-state "Found a settlement" affordance can't lure the user into a
    // form that the DAL will refuse to submit. Active paid settlement tiers
    // skip the cap.
    const ownedSettlementCount = settlementList.filter(
      (s) => s.role === 'owner'
    ).length
    const hasReachedSettlementLimit =
      !canCreateUnlimitedSettlements(userSubscription) &&
      ownedSettlementCount >= FREE_TIER_SETTLEMENT_LIMIT

    return (
      <Empty className="mx-auto mt-8 max-w-xl border bg-card/40">
        <EmptyHeader>
          <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-md border border-amber-400/40 bg-amber-500/10 text-amber-400">
            <LanternMark className="h-6 w-6" />
          </div>
          <EmptyTitle>The lantern is unlit.</EmptyTitle>
          <EmptyDescription>
            Pick an existing settlement from the switcher above, or found one of
            your own.
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          {hasReachedSettlementLimit ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="w-full">
                  <Button disabled className="w-full">
                    <PlusIcon className="h-4 w-4" />
                    Found a settlement
                  </Button>
                </span>
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                {FREE_TIER_SETTLEMENT_LIMIT_MESSAGE(FREE_TIER_SETTLEMENT_LIMIT)}
              </TooltipContent>
            </Tooltip>
          ) : (
            <Button
              onClick={() => setIsCreatingNewSettlement(true)}
              className="w-full">
              <PlusIcon className="h-4 w-4" />
              Found a settlement
            </Button>
          )}
        </EmptyContent>
      </Empty>
    )
  }

  return (
    <div className="pt-(--header-height)">
      {/* Overview Card */}
      <OverviewCard
        selectedSettlement={selectedSettlement}
        selectedSettlementPhase={selectedSettlementPhase}
        setSelectedSettlement={setSelectedSettlement}
        setSelectedSettlementPhase={setSelectedSettlementPhase}
        survivors={survivors}
      />

      <hr className="pt-2" />

      <div className="flex flex-1 flex-col h-full">
        <div className="flex flex-col gap-2 py-2 px-2 flex-1">
          {/* Timeline Tab */}
          {selectedSettlement && selectedTab === TabType.TIMELINE && (
            <div className="flex flex-col lg:flex-row gap-2">
              {/* Timeline */}
              <div className="flex-1 order-2 lg:order-1">
                <TimelineCard
                  selectedSettlement={selectedSettlement}
                  setSelectedSettlement={setSelectedSettlement}
                />
              </div>

              {/* Departure/Arrival Bonuses */}
              <div className="flex flex-col gap-2 order-1 lg:order-2 lg:flex-1">
                <div className="flex flex-col md:flex-row lg:flex-col gap-2">
                  <div className="flex-1">
                    <ListCard
                      icon={<MapPinPlusIcon className="h-4 w-4" />}
                      initialItems={selectedSettlement?.departing_bonuses || []}
                      itemName="Departure Bonus"
                      placeholder="New departure bonus..."
                      saveList={(updateData) =>
                        updateSettlement(selectedSettlement?.id, {
                          departing_bonuses: updateData
                        })
                      }
                      selectedSettlement={selectedSettlement}
                    />
                  </div>
                  <div className="flex-1">
                    <ListCard
                      icon={<HousePlusIcon className="h-4 w-4" />}
                      initialItems={selectedSettlement?.arrival_bonuses || []}
                      itemName="Arrival Bonus"
                      placeholder="New arrival bonus..."
                      saveList={(updateData) =>
                        updateSettlement(selectedSettlement?.id, {
                          arrival_bonuses: updateData
                        })
                      }
                      selectedSettlement={selectedSettlement}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Monsters Tab */}
          {selectedSettlement && selectedTab === TabType.MONSTERS && (
            <div className="flex flex-col pl-2 gap-2">
              <div className="flex flex-col lg:flex-row gap-2">
                {/* Quarries */}
                <div className="flex-1">
                  <QuarriesCard
                    selectedSettlement={selectedSettlement}
                    setSelectedSettlement={setSelectedSettlement}
                  />
                </div>
                {/* Nemeses */}
                <div className="flex-1">
                  <NemesesCard
                    selectedSettlement={selectedSettlement}
                    setSelectedSettlement={setSelectedSettlement}
                  />
                </div>
              </div>

              {/* Monster Volumes (PotL and PotSun) */}
              {(selectedSettlement?.campaign_type ===
                DatabaseCampaignType[CampaignType.PEOPLE_OF_THE_LANTERN] ||
                selectedSettlement?.campaign_type ===
                  DatabaseCampaignType[CampaignType.PEOPLE_OF_THE_SUN]) && (
                <ListCard
                  icon={<BookOpenIcon className="h-4 w-4" />}
                  initialItems={selectedSettlement?.monster_volumes || []}
                  itemName="Monster Volume"
                  placeholder="New monster volume..."
                  saveList={(updateData) =>
                    updateSettlement(selectedSettlement?.id, {
                      monster_volumes: updateData
                    })
                  }
                  selectedSettlement={selectedSettlement}
                />
              )}
            </div>
          )}

          {/* Squires of the Citadel Tab */}
          {selectedSettlement &&
            selectedTab === TabType.SQUIRES &&
            selectedSettlement?.campaign_type ===
              DatabaseCampaignType[CampaignType.SQUIRES_OF_THE_CITADEL] && (
              <>
                <SquireSuspicionsCard
                  setSurvivors={setSurvivors}
                  survivors={survivors}
                />
                <SquireProgressionCards />
              </>
            )}

          {/* Survivors Tab */}
          {selectedSettlement && selectedTab === TabType.SURVIVORS && (
            <>
              {/* Survivors Table */}
              <SettlementSurvivorsCard
                selectedSettlement={selectedSettlement}
                selectedSurvivor={selectedSurvivor}
                setIsCreatingNewSurvivor={setIsCreatingNewSurvivor}
                setSelectedSurvivor={setSelectedSurvivor}
                setSurvivors={setSurvivors}
                survivors={survivors}
              />

              {/* Selected Survivor */}
              {selectedSurvivor && !isCreatingNewSurvivor && (
                <SurvivorCard
                  mode={SurvivorCardMode.SURVIVOR_CARD}
                  selectedHunt={selectedHunt}
                  selectedSettlement={selectedSettlement}
                  selectedShowdown={selectedShowdown}
                  selectedSurvivor={selectedSurvivor}
                  setSurvivors={setSurvivors}
                  survivors={survivors}
                />
              )}

              {/* Create Survivor */}
              {isCreatingNewSurvivor && (
                <CreateSurvivorForm
                  selectedSettlement={selectedSettlement}
                  setIsCreatingNewSurvivor={setIsCreatingNewSurvivor}
                  setSelectedSurvivorId={setSelectedSurvivorId}
                  setSurvivors={setSurvivors}
                  survivors={survivors}
                />
              )}
            </>
          )}

          {/* Society Tab */}
          {selectedSettlement &&
            selectedTab === TabType.SOCIETY &&
            selectedSettlement.campaign_type !==
              DatabaseCampaignType[CampaignType.SQUIRES_OF_THE_CITADEL] && (
              <div className="flex flex-col gap-2 pl-2">
                <div className="flex flex-col lg:flex-row gap-2">
                  {/* Milestones */}
                  <div className="flex-1">
                    <MilestonesCard
                      selectedSettlement={selectedSettlement}
                      setSelectedSettlement={setSelectedSettlement}
                    />
                  </div>
                  {/* Principles */}
                  <div className="flex-1">
                    <PrinciplesCard
                      selectedSettlement={selectedSettlement}
                      setSelectedSettlement={setSelectedSettlement}
                    />
                  </div>
                </div>

                <div className="flex flex-col md:flex-row gap-2">
                  {/* Innovations */}
                  <div className="flex-1">
                    <InnovationsCard
                      selectedSettlement={selectedSettlement}
                      setSelectedSettlement={setSelectedSettlement}
                    />
                  </div>
                  {/* Locations */}
                  <div className="flex-1">
                    <LocationsCard
                      selectedSettlement={selectedSettlement}
                      setSelectedSettlement={setSelectedSettlement}
                    />
                  </div>
                </div>
              </div>
            )}

          {/* Society Tab - Squires of the Citadel */}
          {selectedSettlement &&
            selectedTab === TabType.SOCIETY &&
            selectedSettlement.campaign_type ===
              DatabaseCampaignType[CampaignType.SQUIRES_OF_THE_CITADEL] && (
              <LocationsCard
                selectedSettlement={selectedSettlement}
                setSelectedSettlement={setSelectedSettlement}
              />
            )}

          {/* Crafting Tab */}
          {selectedSettlement && selectedTab === TabType.CRAFTING && (
            <div className="flex flex-col gap-2 pl-2">
              {/* Resource Overview */}
              <ResourceOverviewCard selectedSettlement={selectedSettlement} />

              {/* Resources */}
              <ResourcesCard
                selectedSettlement={selectedSettlement}
                setSelectedSettlement={setSelectedSettlement}
              />
              {/* Gear */}
              <GearCard
                selectedSettlement={selectedSettlement}
                setSelectedSettlement={setSelectedSettlement}
                selectedSettlementPhase={selectedSettlementPhase}
                setSelectedSettlementPhase={setSelectedSettlementPhase}
              />

              {/* Patterns/Seed Patterns */}
              {selectedSettlement?.campaign_type !==
                DatabaseCampaignType[CampaignType.SQUIRES_OF_THE_CITADEL] && (
                <div className="flex flex-col md:flex-row gap-2">
                  <div className="flex-1">
                    <SeedPatternsCard
                      selectedSettlement={selectedSettlement}
                      setSelectedSettlement={setSelectedSettlement}
                      selectedSettlementPhase={selectedSettlementPhase}
                      setSelectedSettlementPhase={setSelectedSettlementPhase}
                    />
                  </div>
                  <div className="flex-1">
                    <PatternsCard
                      selectedSettlement={selectedSettlement}
                      setSelectedSettlement={setSelectedSettlement}
                      selectedSettlementPhase={selectedSettlementPhase}
                      setSelectedSettlementPhase={setSelectedSettlementPhase}
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Arc Tab */}
          {selectedSettlement &&
            selectedTab === TabType.ARC &&
            selectedSettlement.survivor_type ===
              DatabaseSurvivorType[SurvivorType.ARC] && (
              <div className="flex flex-col gap-2 pl-2">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
                  {/* Collective Cognition Victories */}
                  <CollectiveCognitionVictoriesCard
                    selectedSettlement={selectedSettlement}
                    setSelectedSettlement={setSelectedSettlement}
                  />
                  {/* Collective Cognition Rewards */}
                  <CollectiveCognitionRewardsCard
                    selectedSettlement={selectedSettlement}
                    setSelectedSettlement={setSelectedSettlement}
                  />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
                  {/* Philosophies */}
                  <PhilosophiesCard
                    selectedSettlement={selectedSettlement}
                    setSelectedSettlement={setSelectedSettlement}
                  />
                  {/* Knowledges */}
                  <KnowledgesCard
                    selectedSettlement={selectedSettlement}
                    setSelectedSettlement={setSelectedSettlement}
                  />
                </div>
              </div>
            )}

          {/* Notes Tab */}
          {selectedSettlement && selectedTab === TabType.NOTES && (
            <NotesCard
              selectedSettlement={selectedSettlement}
              setSelectedSettlement={setSelectedSettlement}
            />
          )}

          {/* Hunt Tab */}
          {selectedSettlement && selectedTab === TabType.HUNT && (
            <HuntCard
              selectedHunt={selectedHunt}
              selectedHuntMonsterIndex={selectedHuntMonsterIndex}
              selectedSettlement={selectedSettlement}
              selectedShowdown={selectedShowdown}
              selectedSurvivor={selectedSurvivor}
              setSelectedHunt={setSelectedHunt}
              setSelectedHuntMonsterIndex={setSelectedHuntMonsterIndex}
              setSelectedShowdown={setSelectedShowdown}
              setSelectedShowdownMonsterIndex={setSelectedShowdownMonsterIndex}
              setSelectedSurvivor={setSelectedSurvivor}
              setSelectedTab={setSelectedTab}
              setSurvivors={setSurvivors}
              survivors={survivors}
              userSettings={userSettings}
            />
          )}

          {/* Showdown Tab */}
          {selectedSettlement && selectedTab === TabType.SHOWDOWN && (
            <ShowdownCard
              pendingSpecialShowdown={pendingSpecialShowdown}
              selectedHunt={selectedHunt}
              selectedShowdown={selectedShowdown}
              selectedShowdownMonsterIndex={selectedShowdownMonsterIndex}
              selectedSettlement={selectedSettlement}
              selectedSettlementPhase={selectedSettlementPhase}
              selectedSurvivor={selectedSurvivor}
              setPendingSpecialShowdown={setPendingSpecialShowdown}
              setSelectedSettlementPhase={setSelectedSettlementPhase}
              setSelectedShowdown={setSelectedShowdown}
              setSelectedShowdownMonsterIndex={setSelectedShowdownMonsterIndex}
              setSelectedSurvivor={setSelectedSurvivor}
              setSelectedTab={setSelectedTab}
              setSurvivors={setSurvivors}
              survivors={survivors}
              userSettings={userSettings}
            />
          )}

          {/* Settlement Phase Tab */}
          {selectedSettlement && selectedTab === TabType.SETTLEMENT_PHASE && (
            <SettlementPhaseCard
              selectedSettlement={selectedSettlement}
              selectedSettlementPhase={selectedSettlementPhase}
              selectedSurvivor={selectedSurvivor}
              setPendingSpecialShowdown={setPendingSpecialShowdown}
              setSelectedSettlement={setSelectedSettlement}
              setSelectedSettlementPhase={setSelectedSettlementPhase}
              setSelectedSurvivor={setSelectedSurvivor}
              setSelectedTab={setSelectedTab}
              setSurvivors={setSurvivors}
              survivors={survivors}
            />
          )}

          {/*
            Sharing Tab

            The tab itself is gated upstream (sidebar entry) to development
            builds only until the §9 entitlement plumbing exists; rendering here
            is intentionally unconditional so a deep link still works in dev.
            The active settlement is read from `useLocal()` inside the panel, so
            we don't plumb it as a prop.
          */}
          {selectedSettlement && selectedTab === TabType.SHARING && (
            <SharingCard />
          )}
        </div>
      </div>
    </div>
  )
}
