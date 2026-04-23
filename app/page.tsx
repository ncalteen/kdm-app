'use client'

import { AppSidebar } from '@/components/app-sidebar'
import { SettlementCard } from '@/components/settlement/settlement-card'
import { SiteHeader } from '@/components/side-header'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { useLocal } from '@/contexts/local-context'
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
 * @returns Loading Component
 */
function MainPageLoading(): ReactElement {
  return (
    <div className="grid grid-rows-[1fr] items-center justify-items-center sm:p-8 pb-20 gap-8 sm:gap-16 font-[family-name:var(--font-geist-sans)]">
      <h1 className="text-3xl sm:text-4xl font-bold pt-[20px] text-center">
        Loading...
      </h1>
      <p className="text-md text-center">
        Faces in the sky peer down on your settlements.
      </p>
    </div>
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
  const {
    // isCreatingNewHunt,
    isCreatingNewSettlement,
    // isCreatingNewShowdown,
    isCreatingNewSurvivor,

    pendingSpecialShowdown,

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

    local,
    updateLocal,

    userSettings,
    setUserSettings
  } = useLocal()

  return (
    <div className="[--header-height:calc(--spacing(10))]">
      <SidebarProvider>
        <SiteHeader />

        <AppSidebar
          local={local}
          isCreatingNewSettlement={isCreatingNewSettlement}
          selectedHuntId={selectedHuntId}
          selectedSettlement={selectedSettlement}
          selectedSettlementId={selectedSettlementId}
          selectedSettlementPhaseId={selectedSettlementPhaseId}
          selectedShowdownId={selectedShowdownId}
          selectedTab={selectedTab}
          setIsCreatingNewSettlement={setIsCreatingNewSettlement}
          setSelectedHuntId={setSelectedHuntId}
          setSelectedSettlementId={setSelectedSettlementId}
          setSelectedSettlementPhaseId={setSelectedSettlementPhaseId}
          setSelectedShowdownId={setSelectedShowdownId}
          setSelectedSurvivorId={setSelectedSurvivorId}
          setSelectedTab={setSelectedTab}
        />
        <SidebarInset>
          <div className="p-4 pt-(--header-height)">
            <SettlementCard
              isCreatingNewSettlement={isCreatingNewSettlement}
              isCreatingNewSurvivor={isCreatingNewSurvivor}
              local={local}
              pendingSpecialShowdown={pendingSpecialShowdown}
              selectedHunt={selectedHunt}
              selectedHuntMonsterIndex={selectedHuntMonsterIndex}
              selectedSettlement={selectedSettlement}
              selectedSettlementPhase={selectedSettlementPhase}
              selectedShowdown={selectedShowdown}
              selectedShowdownMonsterIndex={selectedShowdownMonsterIndex}
              selectedSurvivor={selectedSurvivor}
              selectedTab={selectedTab}
              setIsCreatingNewSettlement={setIsCreatingNewSettlement}
              setIsCreatingNewSurvivor={setIsCreatingNewSurvivor}
              setPendingSpecialShowdown={setPendingSpecialShowdown}
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
              updateLocal={updateLocal}
              userSettings={userSettings}
            />
          </div>
        </SidebarInset>
      </SidebarProvider>
    </div>
  )
}
