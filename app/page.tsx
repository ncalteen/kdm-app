'use client'

import { AppSidebar } from '@/components/app-sidebar'
import { SettlementCard } from '@/components/settlement/settlement-card'
import { SiteHeader } from '@/components/side-header'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { useLocal } from '@/contexts/local-context'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { ReactElement, Suspense, useEffect, useRef, useState } from 'react'

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
        All-seeing eyes pierce the darkness, looking for settlements.
      </p>
    </div>
  )
}

/**
 * Main Page Content Component
 *
 * @returns Main Page Content Component
 */
function MainPageContent(): ReactElement {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  // Track if the component is mounted
  const isMounted = useRef(false)

  // Verify authentication; redirect to login if unauthenticated
  useEffect(() => {
    isMounted.current = true

    const supabase = createClient()

    supabase.auth.getUser().then(({ data, error }) => {
      if (!isMounted.current) return

      if (error || !data?.user) router.replace('/auth/login')
      else setIsAuthenticated(true)
    })

    return () => {
      isMounted.current = false
    }
  }, [router])

  if (!isAuthenticated) return <MainPageLoading />

  return <MainPage />
}

/**
 * Main Page Component
 *
 * @returns Main Page Component
 */
function MainPage(): ReactElement {
  const {
    isCreatingNewHunt,
    isCreatingNewSettlement,
    isCreatingNewShowdown,
    isCreatingNewSurvivor,

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
    selectedSurvivorId,
    selectedTab,

    setIsCreatingNewHunt,
    setIsCreatingNewSettlement,
    setIsCreatingNewShowdown,
    setIsCreatingNewSurvivor,

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

    updateLocal
  } = useLocal()

  return (
    <div className="[--header-height:calc(--spacing(10))] min-w-[450px]">
      <SidebarProvider>
        <SiteHeader />

        <AppSidebar
          isCreatingNewSettlement={isCreatingNewSettlement}
          selectedHuntId={selectedHuntId}
          selectedSettlement={selectedSettlement}
          selectedSettlementId={selectedSettlementId}
          selectedSettlementPhaseId={selectedSettlementPhaseId}
          selectedShowdownId={selectedShowdownId}
          selectedTab={selectedTab}
          setIsCreatingNewSettlement={setIsCreatingNewSettlement}
          setSelectedHunt={setSelectedHunt}
          setSelectedHuntId={setSelectedHuntId}
          setSelectedSettlement={setSelectedSettlement}
          setSelectedSettlementId={setSelectedSettlementId}
          setSelectedSettlementPhase={setSelectedSettlementPhase}
          setSelectedSettlementPhaseId={setSelectedSettlementPhaseId}
          setSelectedShowdown={setSelectedShowdown}
          setSelectedShowdownId={setSelectedShowdownId}
          setSelectedSurvivor={setSelectedSurvivor}
          setSelectedSurvivorId={setSelectedSurvivorId}
          setSelectedTab={setSelectedTab}
        />
        <SidebarInset>
          <div className="p-4 pt-(--header-height)">
            <SettlementCard
              isCreatingNewSettlement={isCreatingNewSettlement}
              isCreatingNewSurvivor={isCreatingNewSurvivor}
              selectedHunt={selectedHunt}
              selectedHuntId={selectedHuntId}
              selectedHuntMonsterIndex={selectedHuntMonsterIndex}
              selectedSettlement={selectedSettlement}
              selectedSettlementId={selectedSettlementId}
              selectedSettlementPhase={selectedSettlementPhase}
              selectedSettlementPhaseId={selectedSettlementPhaseId}
              selectedShowdown={selectedShowdown}
              selectedShowdownId={selectedShowdownId}
              selectedShowdownMonsterIndex={selectedShowdownMonsterIndex}
              selectedSurvivor={selectedSurvivor}
              selectedSurvivorId={selectedSurvivorId}
              selectedTab={selectedTab}
              setIsCreatingNewSettlement={setIsCreatingNewSettlement}
              setIsCreatingNewSurvivor={setIsCreatingNewSurvivor}
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
              survivors={survivors}
            />
          </div>
        </SidebarInset>
      </SidebarProvider>
    </div>
  )
}
