'use client'

import { AppSidebar } from '@/components/app-sidebar'
import { SettlementCard } from '@/components/settlement/settlement-card'
import { SiteHeader } from '@/components/side-header'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { useLocal } from '@/contexts/local-context'
import { getHunt } from '@/lib/dal/hunt'
import { getSettlement } from '@/lib/dal/settlement'
import { getSettlementPhase } from '@/lib/dal/settlement-phase'
import { getShowdown } from '@/lib/dal/showdown'
import { getSurvivor, getSurvivors } from '@/lib/dal/survivor'
import { ERROR_MESSAGE } from '@/lib/messages'
import { createClient } from '@/lib/supabase/client'
import {
  HuntDetail,
  SettlementDetail,
  SettlementPhaseDetail,
  ShowdownDetail,
  SurvivorDetail
} from '@/lib/types'
import { useRouter } from 'next/navigation'
import { ReactElement, Suspense, useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'

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

  const [selectedHunt, setSelectedHunt] = useState<HuntDetail | null>(null)
  const [selectedSettlement, setSelectedSettlement] =
    useState<SettlementDetail | null>(null)
  const [selectedSettlementPhase, setSelectedSettlementPhase] =
    useState<SettlementPhaseDetail | null>(null)
  const [selectedShowdown, setSelectedShowdown] =
    useState<ShowdownDetail | null>(null)
  const [selectedSurvivor, setSelectedSurvivor] =
    useState<SurvivorDetail | null>(null)
  const [survivors, setSurvivors] = useState<SurvivorDetail[]>([])

  /**
   * Fetch Hunt Data
   *
   * Triggered whenever the settlement or hunt selection changes. Uses a
   * cancellation flag to prevent state updates on unmounted components or when
   * selections change rapidly.
   */
  useEffect(() => {
    let isCancelled = false

    if (!selectedHuntId || !selectedSettlementId)
      return () => {
        isCancelled = true
      }

    getHunt(selectedHuntId, selectedSettlementId)
      .then((hunt) => {
        if (isCancelled) return

        setSelectedHunt(hunt)
      })
      .catch((err: unknown) => {
        if (isCancelled) return

        setSelectedHunt(null)

        console.error('Hunt Fetch Error:', err)
        toast.error(ERROR_MESSAGE())
      })

    return () => {
      isCancelled = true
    }
  }, [selectedHuntId, selectedSettlementId])

  /**
   * Fetch Settlement & Survivors Data
   *
   * Triggered whenever the settlement selection changes. Uses a cancellation
   * flag to prevent state updates on unmounted components or when selections
   * change rapidly.
   */
  useEffect(() => {
    let isCancelled = false

    if (!selectedSettlementId)
      return () => {
        isCancelled = true
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

        console.error('Settlement Fetch Error:', err)
        toast.error(ERROR_MESSAGE())
      })

    return () => {
      isCancelled = true
    }
  }, [selectedSettlementId])

  /**
   * Fetch Settlement Phase Data
   *
   * Triggered whenever the settlement or phase selection changes. Uses a
   * cancellation flag to prevent state updates on unmounted components or when
   * selections change rapidly.
   */
  useEffect(() => {
    let isCancelled = false

    if (!selectedSettlementId || !selectedSettlementPhaseId)
      return () => {
        isCancelled = true
      }

    getSettlementPhase(selectedSettlementPhaseId, selectedSettlementId)
      .then((settlementPhase) => {
        if (isCancelled) return

        setSelectedSettlementPhase(settlementPhase)
      })
      .catch((err: unknown) => {
        if (isCancelled) return

        setSelectedSettlementPhase(null)

        console.error('Settlement Phase Fetch Error:', err)
        toast.error(ERROR_MESSAGE())
      })

    return () => {
      isCancelled = true
    }
  }, [selectedSettlementId, selectedSettlementPhaseId])

  /**
   * Fetch Showdown Data
   *
   * Triggered whenever the settlement or showdown selection changes. Uses a
   * cancellation flag to prevent state updates on unmounted components or when
   * selections change rapidly.
   */
  useEffect(() => {
    let isCancelled = false

    if (!selectedSettlementId || !selectedShowdownId)
      return () => {
        isCancelled = true
      }

    getShowdown(selectedShowdownId, selectedSettlementId)
      .then((showdown) => {
        if (isCancelled) return

        setSelectedShowdown(showdown)
      })
      .catch((err: unknown) => {
        if (isCancelled) return

        setSelectedShowdown(null)

        console.error('Showdown Fetch Error:', err)
        toast.error(ERROR_MESSAGE())
      })

    return () => {
      isCancelled = true
    }
  }, [selectedSettlementId, selectedShowdownId])

  /**
   * Fetch Survivor Data
   *
   * Triggered whenever the settlement or survivor selection changes. Uses a
   * cancellation flag to prevent state updates on unmounted components or when
   * selections change rapidly.
   */
  useEffect(() => {
    let isCancelled = false

    if (!selectedSettlementId || !selectedSurvivorId)
      return () => {
        isCancelled = true
      }

    getSurvivor(selectedSurvivorId, selectedSettlementId)
      .then((survivor) => {
        if (isCancelled) return

        setSelectedSurvivor(survivor)
      })
      .catch((err: unknown) => {
        if (isCancelled) return

        setSelectedSurvivor(null)

        console.error('Survivor Fetch Error:', err)
        toast.error(ERROR_MESSAGE())
      })

    return () => {
      isCancelled = true
    }
  }, [selectedSettlementId, selectedSurvivorId])

  return (
    <div className="[--header-height:calc(--spacing(10))] min-w-[450px]">
      <SidebarProvider>
        <SiteHeader />

        <AppSidebar
          selectedHunt={selectedHunt}
          selectedSettlement={selectedSettlement}
          selectedSettlementPhase={selectedSettlementPhase}
          selectedShowdown={selectedShowdown}
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
              selectedHunt={selectedHunt}
              selectedHuntMonsterIndex={selectedHuntMonsterIndex}
              selectedSettlement={selectedSettlement}
              selectedSettlementPhase={selectedSettlementPhase}
              selectedShowdown={selectedShowdown}
              selectedShowdownMonsterIndex={selectedShowdownMonsterIndex}
              selectedSurvivor={selectedSurvivor}
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
