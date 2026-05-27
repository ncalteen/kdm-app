'use client'

import { AppSidebar } from '@/components/app-sidebar'
import { LanternLoader } from '@/components/generic/lantern-loader'
import { ThematicShell } from '@/components/generic/thematic-shell'
import { SettlementCard } from '@/components/settlement/settlement-card'
import { SiteHeader } from '@/components/side-header'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { useLocal } from '@/contexts/local-context'
import { useStripeReturn } from '@/hooks/use-stripe-return'
import { useRouter } from 'next/navigation'
import { ReactElement, Suspense, useEffect } from 'react'

/**
 * Main Page Component
 *
 * Includes a Suspense boundary for loading state.
 *
 * @returns Main Page Component
 */
export default function Page(): ReactElement {
  return (
    <Suspense fallback={<MainPageLoading />}>
      <MainPageContent />
    </Suspense>
  )
}

/**
 * Loading Component
 *
 * Pre-shell splash shown while authentication and bootstrap data are still in
 * flight. Uses the shared `<ThematicShell>` so the bootstrap surface matches
 * the visual language of the auth and not-found surfaces.
 *
 * @returns Loading Component
 */
function MainPageLoading(): ReactElement {
  return (
    <ThematicShell>
      <LanternLoader variant="splash" />
    </ThematicShell>
  )
}

/**
 * Main Page Content Component
 *
 * Consumes the shared authentication state from `LocalContext` rather than
 * issuing its own `auth.getUser()` call, avoiding a redundant network round
 * trip on bootstrap.
 *
 * @returns Main Page Content Component
 */
function MainPageContent(): ReactElement {
  const router = useRouter()
  const { isAuthenticated } = useLocal()

  // Redirect to login once the provider confirms no user is signed in.
  // `null` means the check is still in flight — keep showing the loader.
  useEffect(() => {
    if (isAuthenticated === false) router.replace('/auth/login')
  }, [isAuthenticated, router])

  if (isAuthenticated !== true) return <MainPageLoading />

  return <MainPage />
}

/**
 * Main Page Component
 *
 * @returns Main Page Component
 */
function MainPage(): ReactElement {
  // Translate Stripe's `?status=success|cancelled` redirect contract into
  // SPA state — toast, tab switch, subscription refetch, URL cleanup —
  // before destructuring `useLocal` so the hook owns its own dependency
  // resolution and the rest of `MainPage` doesn't need to know about it.
  useStripeReturn()

  const {
    // isCreatingNewHunt,
    isCreatingNewSettlement,
    // isCreatingNewShowdown,
    isCreatingNewSurvivor,

    pendingSpecialShowdown,

    selectedEncounter,
    selectedHunt,
    selectedHuntId,
    selectedHuntMonsterIndex,
    selectedSettlement,
    selectedSettlementId,
    selectedSettlementPhase,
    selectedSettlementPhaseId,
    selectedShowdown,
    selectedShowdownId,
    selectedShowdownMonsterIndex,
    selectedSurvivor,
    // selectedSurvivorId,
    selectedTab,

    // setIsCreatingNewHunt,
    setIsCreatingNewSettlement,
    // setIsCreatingNewShowdown,
    setIsCreatingNewSurvivor,

    setPendingSpecialShowdown,

    setSelectedEncounter,
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
    survivors,

    // local,
    // updateLocal,

    userSettings,
    setUserSettings,

    settlementList,
    isSettlementListLoading
  } = useLocal()

  return (
    <div className="[--header-height:calc(--spacing(10))]">
      <SidebarProvider>
        <SiteHeader />

        <AppSidebar
          isCreatingNewSettlement={isCreatingNewSettlement}
          isSettlementListLoading={isSettlementListLoading}
          selectedHuntId={selectedHuntId}
          selectedSettlement={selectedSettlement}
          selectedSettlementId={selectedSettlementId}
          selectedSettlementPhaseId={selectedSettlementPhaseId}
          selectedShowdownId={selectedShowdownId}
          selectedTab={selectedTab}
          settlementList={settlementList}
          setIsCreatingNewSettlement={setIsCreatingNewSettlement}
          setSelectedHuntId={setSelectedHuntId}
          setSelectedSettlementId={setSelectedSettlementId}
          setSelectedSettlementPhaseId={setSelectedSettlementPhaseId}
          setSelectedShowdownId={setSelectedShowdownId}
          setSelectedSurvivorId={setSelectedSurvivorId}
          setSelectedTab={setSelectedTab}
        />
        <SidebarInset>
          <SettlementCard
            isCreatingNewSettlement={isCreatingNewSettlement}
            isCreatingNewSurvivor={isCreatingNewSurvivor}
            pendingSpecialShowdown={pendingSpecialShowdown}
            selectedEncounter={selectedEncounter}
            selectedHunt={selectedHunt}
            selectedHuntMonsterIndex={selectedHuntMonsterIndex}
            selectedSettlement={selectedSettlement}
            selectedSettlementPhase={selectedSettlementPhase}
            selectedShowdown={selectedShowdown}
            selectedShowdownMonsterIndex={selectedShowdownMonsterIndex}
            selectedSurvivor={selectedSurvivor}
            selectedTab={selectedTab}
            settlementList={settlementList}
            setIsCreatingNewSettlement={setIsCreatingNewSettlement}
            setIsCreatingNewSurvivor={setIsCreatingNewSurvivor}
            setPendingSpecialShowdown={setPendingSpecialShowdown}
            setSelectedEncounter={setSelectedEncounter}
            setSelectedHunt={setSelectedHunt}
            setSelectedHuntId={setSelectedHuntId}
            setSelectedHuntMonsterIndex={setSelectedHuntMonsterIndex}
            setSelectedSettlement={setSelectedSettlement}
            setSelectedSettlementId={setSelectedSettlementId}
            setSelectedSettlementPhase={setSelectedSettlementPhase}
            setSelectedSettlementPhaseId={setSelectedSettlementPhaseId}
            setSelectedShowdown={setSelectedShowdown}
            setSelectedShowdownId={setSelectedShowdownId}
            setSelectedShowdownMonsterIndex={setSelectedShowdownMonsterIndex}
            setSelectedSurvivor={setSelectedSurvivor}
            setSelectedSurvivorId={setSelectedSurvivorId}
            setSelectedTab={setSelectedTab}
            setSurvivors={setSurvivors}
            setUserSettings={setUserSettings}
            survivors={survivors}
            userSettings={userSettings}
          />
        </SidebarInset>
      </SidebarProvider>
    </div>
  )
}
