'use client'

import { AppSidebar } from '@/components/app-sidebar'
import { SettlementCard } from '@/components/settlement/settlement-card'
import { SiteHeader } from '@/components/side-header'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { useLocal } from '@/contexts/local-context'
import { getSettlement } from '@/lib/dal/settlement'
import { getSurvivors } from '@/lib/dal/survivor'
import { Tables } from '@/lib/database.types'
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

    selectedHuntId,
    selectedHuntMonsterIndex,
    selectedSettlementId,
    selectedSettlementPhaseId,
    selectedShowdownId,
    selectedShowdownMonsterIndex,
    selectedSurvivorId,
    selectedTab,

    setIsCreatingNewHunt,
    setIsCreatingNewSettlement,
    setIsCreatingNewShowdown,
    setIsCreatingNewSurvivor,

    setSelectedHuntId,
    setSelectedHuntMonsterIndex,
    setSelectedSettlementId,
    setSelectedSettlementPhaseId,
    setSelectedShowdownId,
    setSelectedShowdownMonsterIndex,
    setSelectedSurvivorId,
    setSelectedTab,

    updateLocal
  } = useLocal()

  const [error, setError] = useState<string | null>(null)

  const [selectedSettlement, setSelectedSettlement] =
    useState<Tables<'settlement'> | null>(null)
  const [survivors, setSurvivors] = useState<Tables<'survivor'>[]>([])

  useEffect(() => {
    // Guard against out-of-order responses when selectedSettlementId changes
    // quickly
    let isCancelled = false

    // Skip fetch if there is no selected settlement id
    if (!selectedSettlementId) {
      return () => {
        isCancelled = true
      }
    }

    Promise.all([
      getSettlement(selectedSettlementId),
      getSurvivors(selectedSettlementId)
    ])
      .then(([settlement, survivors]) => {
        if (isCancelled) return
        setSelectedSettlement(settlement)
        setSurvivors(survivors)
      })
      .catch((err: unknown) => {
        if (isCancelled) return

        setSelectedSettlement(null)
        setSurvivors([])
        setError(
          err instanceof Error
            ? `Page Load Error: ${err.message}`
            : 'Page Load Error: Unknown Error'
        )
      })

    return () => {
      isCancelled = true
    }
  }, [selectedSettlementId])

  return (
    <div className="[--header-height:calc(--spacing(10))] min-w-[450px]">
      <SidebarProvider>
        <SiteHeader />

        <AppSidebar
          selectedHuntId={selectedHuntId}
          selectedSettlement={selectedSettlement}
          selectedSettlementId={selectedSettlementId}
          selectedSettlementPhaseId={selectedSettlementPhaseId}
          selectedShowdownId={selectedShowdownId}
          selectedTab={selectedTab}
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
              isCreatingNewSurvivor={isCreatingNewSurvivor}
              selectedHuntId={selectedHuntId}
              selectedHuntMonsterIndex={selectedHuntMonsterIndex}
              selectedSettlement={selectedSettlement}
              selectedSettlementId={selectedSettlementId}
              selectedSettlementPhaseId={selectedSettlementPhaseId}
              selectedShowdownId={selectedShowdownId}
              selectedShowdownMonsterIndex={selectedShowdownMonsterIndex}
              selectedSurvivorId={selectedSurvivorId}
              selectedTab={selectedTab}
              setIsCreatingNewSurvivor={setIsCreatingNewSurvivor}
              setSelectedHuntId={setSelectedHuntId}
              setSelectedHuntMonsterIndex={setSelectedHuntMonsterIndex}
              setSelectedSettlementId={setSelectedSettlementId}
              setSelectedSettlementPhase={setSelectedSettlementPhaseId}
              setSelectedShowdownId={setSelectedShowdownId}
              setSelectedShowdownMonsterIndex={setSelectedShowdownMonsterIndex}
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
