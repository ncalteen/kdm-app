'use client'

import { TabType } from '@/lib/enums'
import { saveToLocalStorage } from '@/lib/utils'
import {
  createContext,
  ReactElement,
  ReactNode,
  useContext,
  useState
} from 'react'

const newLocal = {
  selectedHuntId: undefined,
  selectedSettlementId: undefined,
  selectedSettlementPhaseId: undefined,
  selectedShowdownId: undefined,
  selectedSurvivorId: undefined,
  selectedTab: undefined
}

/**
 * Local Context Type
 */
interface LocalContextType {
  /** Is Creating New Hunt */
  isCreatingNewHunt: boolean
  /** Is Creating New Settlement */
  isCreatingNewSettlement: boolean
  /** Is Creating New Showdown */
  isCreatingNewShowdown: boolean
  /** Is Creating New Survivor */
  isCreatingNewSurvivor: boolean

  /** Selected Hunt ID */
  selectedHuntId: string | null
  /** Selected Hunt Monster Index */
  selectedHuntMonsterIndex: number | null
  /** Selected Settlement ID */
  selectedSettlementId: string | null
  /** Selected Settlement Phase ID */
  selectedSettlementPhaseId: string | null
  /** Selected Showdown ID */
  selectedShowdownId: string | null
  /** Selected Showdown Monster Index */
  selectedShowdownMonsterIndex: number | null
  /** Selected Survivor ID */
  selectedSurvivorId: string | null
  /** Selected Tab */
  selectedTab: TabType

  /** Set Is Creating New Hunt */
  setIsCreatingNewHunt: (isCreating: boolean) => void
  /** Set Is Creating New Settlement */
  setIsCreatingNewSettlement: (isCreating: boolean) => void
  /** Set Is Creating New Showdown */
  setIsCreatingNewShowdown: (isCreating: boolean) => void
  /** Set Is Creating New Survivor */
  setIsCreatingNewSurvivor: (isCreating: boolean) => void

  /** Set Selected Hunt ID */
  setSelectedHuntId: (hunt: string | null) => void
  /** Set Selected Hunt Monster Index */
  setSelectedHuntMonsterIndex: (index: number | null) => void
  /** Set Selected Settlement ID */
  setSelectedSettlementId: (settlement: string | null) => void
  /** Set Selected Settlement Phase ID */
  setSelectedSettlementPhaseId: (settlement: string | null) => void
  /** Set Selected Showdown ID */
  setSelectedShowdownId: (showdown: string | null) => void
  /** Set Selected Showdown Monster Index */
  setSelectedShowdownMonsterIndex: (index: number | null) => void
  /** Set Selected Survivor ID */
  setSelectedSurvivorId: (survivor: string | null) => void
  /** Set Selected Tab */
  setSelectedTab: (tab: TabType) => void

  /** Update Local Context */
  updateLocal: (local: LocalContextType) => void
}

/**
 * Local Context Provider Properties
 */
interface LocalProviderProps {
  /** Children */
  children: ReactNode
}

/**
 * Local Context
 */
const LocalContext = createContext<LocalContextType | undefined>(undefined)

/**
 * Local Context Provider
 *
 * @param props Local Provider Properties
 * @returns Local Context Provider Component
 */
export function LocalProvider({ children }: LocalProviderProps): ReactElement {
  const [local, setLocalState] = useState<LocalContextType>(() =>
    typeof window === 'undefined'
      ? newLocal
      : JSON.parse(
          localStorage.getItem('kdm-recordkeeper-local') ??
            JSON.stringify(newLocal)
        )
  )

  const [selectedHuntId, setSelectedHuntIdState] = useState<string | null>(
    () => local.selectedHuntId ?? null
  )
  const [selectedHuntMonsterIndex, setSelectedHuntMonsterIndexState] =
    useState<number>(() => local.selectedHuntMonsterIndex ?? 0)
  const [selectedSettlementId, setSelectedSettlementIdState] = useState<
    string | null
  >(() => local.selectedSettlementId ?? null)
  const [selectedSettlementPhaseId, setSelectedSettlementPhaseIdState] =
    useState<string | null>(() => local.selectedSettlementPhaseId ?? null)
  const [selectedShowdownId, setSelectedShowdownIdState] = useState<
    string | null
  >(() => local.selectedShowdownId ?? null)
  const [selectedShowdownMonsterIndex, setSelectedShowdownMonsterIndexState] =
    useState<number>(() => local.selectedShowdownMonsterIndex ?? 0)
  const [selectedSurvivorId, setSelectedSurvivorIdState] = useState<
    string | null
  >(() => local.selectedSurvivorId ?? null)
  const [selectedTab, setSelectedTabState] = useState<TabType>(
    () => local.selectedTab ?? TabType.TIMELINE
  )

  const [isCreatingNewHunt, setIsCreatingNewHunt] = useState<boolean>(false)
  const [isCreatingNewSettlement, setIsCreatingNewSettlement] =
    useState<boolean>(false)
  const [isCreatingNewShowdown, setIsCreatingNewShowdown] =
    useState<boolean>(false)
  const [isCreatingNewSurvivor, setIsCreatingNewSurvivor] =
    useState<boolean>(false)

  /**
   * Set Selected Hunt ID
   *
   * @param hunt Selected Hunt ID
   */
  const setSelectedHuntId = (hunt: string | null) => {
    setSelectedHuntIdState(hunt)
    setLocalState((local) => {
      const updated = {
        ...local,
        selectedHuntId: hunt ?? null,
        selectedHuntMonsterIndex: 0
      }

      saveToLocalStorage(updated)

      return updated
    })

    // When selecting a hunt, stop creation mode
    if (hunt) setIsCreatingNewHunt(false)
  }

  /**
   * Set Selected Hunt Monster Index
   *
   * @param index Selected Hunt Monster Index
   */
  const setSelectedHuntMonsterIndex = (index: number | null) => {
    setSelectedHuntMonsterIndexState(index ?? 0)
    setLocalState((local) => {
      const updated = {
        ...local,
        selectedHuntMonsterIndex: index ?? 0
      }

      saveToLocalStorage(updated)

      return updated
    })
  }

  /**
   * Set Selected Settlement
   *
   * @param settlement Selected Settlement ID
   */
  const setSelectedSettlementId = (settlement: string | null) => {
    setLocalState((local) => {
      const currentSettlementId = local.selectedSettlementId
      const updated = {
        ...local,
        selectedSettlementId: settlement ?? null
      }

      saveToLocalStorage(updated)

      // If the selected settlement changed, also clear selected hunt, showdown,
      // etc.
      if (currentSettlementId !== settlement) {
        setSelectedHuntIdState(null)
        setSelectedHuntMonsterIndexState(0)
        setSelectedSettlementPhaseIdState(null)
        setSelectedShowdownIdState(null)
        setSelectedShowdownMonsterIndexState(0)
        setSelectedSurvivorIdState(null)
      }

      return updated
    })

    setSelectedSettlementIdState(settlement)

    // Stop creation mode
    if (settlement) setIsCreatingNewSettlement(false)
  }

  /**
   * Set Selected Settlement Phase ID
   *
   * @param settlementPhaseId Selected Settlement Phase ID
   */
  const setSelectedSettlementPhaseId = (settlementPhase: string | null) => {
    setSelectedSettlementPhaseIdState(settlementPhase)
    setLocalState((local) => {
      const updated = {
        ...local,
        selectedSettlementPhaseId: settlementPhase ?? null
      }

      saveToLocalStorage(updated)

      return updated
    })
  }

  /**
   * Set Selected Showdown ID
   *
   * @param showdown Selected Showdown ID
   */
  const setSelectedShowdownId = (showdown: string | null) => {
    setSelectedShowdownIdState(showdown)
    setLocalState((local) => {
      const updated = {
        ...local,
        selectedShowdownId: showdown ?? null,
        selectedShowdownMonsterIndex: 0
      }

      saveToLocalStorage(updated)

      return updated
    })

    // When selecting a showdown, stop creation mode
    if (showdown) setIsCreatingNewShowdown(false)
  }

  /**
   * Set Selected Showdown Monster Index
   *
   * @param index Selected Showdown Monster Index
   */
  const setSelectedShowdownMonsterIndex = (index: number | null) => {
    setSelectedShowdownMonsterIndexState(index ?? 0)
    setLocalState((local) => {
      const updated = {
        ...local,
        selectedShowdownMonsterIndex: index ?? 0
      }

      saveToLocalStorage(updated)

      return updated
    })
  }

  /**
   * Set Selected Survivor ID
   *
   * @param survivor Selected Survivor ID
   */
  const setSelectedSurvivorId = (survivor: string | null) => {
    setSelectedSurvivorIdState(survivor)
    setLocalState((local) => {
      const updated = {
        ...local,
        selectedSurvivorId: survivor ?? null
      }

      saveToLocalStorage(updated)

      return updated
    })

    // When selecting a survivor, stop creation mode
    if (survivor) setIsCreatingNewSurvivor(false)
  }

  /**
   * Set Selected Tab
   *
   * @param tab Selected Tab
   */
  const setSelectedTab = (tab: TabType) => {
    setSelectedTabState(tab)
    setLocalState((local) => {
      const updated = {
        ...local,
        selectedTab: tab
      }

      saveToLocalStorage(updated)

      return updated
    })
  }

  /**
   * Update Local State
   *
   * @param local Updated Local Data
   */
  const updateLocal = (local: LocalContextType) => {
    saveToLocalStorage(local)
    setLocalState(local)
  }

  return (
    <LocalContext.Provider
      value={{
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
      }}>
      {children}
    </LocalContext.Provider>
  )
}

/**
 * Local Context Hook
 */
export function useLocal(): LocalContextType {
  const context = useContext(LocalContext)

  if (!context)
    throw new Error('Context hook useLocal must be used within a LocalProvider')

  return context
}
