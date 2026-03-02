'use client'

import { AppSidebar } from '@/components/app-sidebar'
import { UserSettingsCard } from '@/components/settlement/user-settings'
import { SiteHeader } from '@/components/side-header'
import { SidebarProvider } from '@/components/ui/sidebar'
import { useLocal } from '@/contexts/local-context'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { ReactElement, Suspense, useEffect, useRef } from 'react'

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

  // Track if the component is mounted and loading state
  const isMounted = useRef(false)

  // Verify authentication; redirect to login if unauthenticated
  useEffect(() => {
    isMounted.current = true

    const supabase = createClient()

    supabase.auth.getUser().then(({ data, error }) => {
      if (!isMounted.current) return
      if (error || !data?.user) router.replace('/auth/login')
    })

    return () => {
      isMounted.current = false
    }
  }, [router])

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

  return (
    <div className="[--header-height:calc(--spacing(10))] min-w-[450px]">
      <SidebarProvider className="flex flex-col">
        <SiteHeader />

        <div className="flex flex-1 pt-(--header-height)">
          <div className="p-4 w-full max-w-xl">
            <AppSidebar
              selectedHuntId={selectedHuntId}
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
            <UserSettingsCard />
          </div>
        </div>
      </SidebarProvider>
    </div>
  )
}
