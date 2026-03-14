'use client'

import { getHunt } from '@/lib/dal/hunt'
import { getSettlement } from '@/lib/dal/settlement'
import { getSettlementPhase } from '@/lib/dal/settlement-phase'
import { getShowdown } from '@/lib/dal/showdown'
import { getSurvivor, getSurvivors } from '@/lib/dal/survivor'
import { TabType } from '@/lib/enums'
import {
  HuntDetail,
  SettlementDetail,
  SettlementPhaseDetail,
  ShowdownDetail,
  SurvivorDetail
} from '@/lib/types'
import { saveToLocalStorage } from '@/lib/utils'
import {
  createContext,
  ReactElement,
  ReactNode,
  useContext,
  useEffect,
  useState
} from 'react'

const newLocal = {
  selectedHuntId: null,
  selectedHuntMonsterIndex: 0,
  selectedSettlementId: null,
  selectedSettlementPhaseId: null,
  selectedShowdownId: null,
  selectedShowdownMonsterIndex: 0,
  selectedSurvivorId: null,
  selectedTab: null
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

  /** Selected Hunt */
  selectedHunt: HuntDetail | null
  /** Selected Hunt ID */
  selectedHuntId: string | null
  /** Selected Hunt Monster Index */
  selectedHuntMonsterIndex: number
  /** Selected Settlement */
  selectedSettlement: SettlementDetail | null
  /** Selected Settlement ID */
  selectedSettlementId: string | null
  /** Selected Settlement Phase */
  selectedSettlementPhase: SettlementPhaseDetail | null
  /** Selected Settlement Phase ID */
  selectedSettlementPhaseId: string | null
  /** Selected Showdown */
  selectedShowdown: ShowdownDetail | null
  /** Selected Showdown ID */
  selectedShowdownId: string | null
  /** Selected Showdown Monster Index */
  selectedShowdownMonsterIndex: number
  /** Selected Survivor */
  selectedSurvivor: SurvivorDetail | null
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

  /** Set Selected Hunt */
  setSelectedHunt: (hunt: HuntDetail | null) => void
  /** Set Selected Hunt ID */
  setSelectedHuntId: (huntId: string | null) => void
  /** Set Selected Hunt Monster Index */
  setSelectedHuntMonsterIndex: (index: number) => void
  /** Set Selected Settlement */
  setSelectedSettlement: (settlement: SettlementDetail | null) => void
  /** Set Selected Settlement ID */
  setSelectedSettlementId: (settlementId: string | null) => void
  /** Set Selected Settlement Phase */
  setSelectedSettlementPhase: (
    settlementPhase: SettlementPhaseDetail | null
  ) => void
  /** Set Selected Settlement Phase ID */
  setSelectedSettlementPhaseId: (settlementPhaseId: string | null) => void
  /** Set Selected Showdown */
  setSelectedShowdown: (showdown: ShowdownDetail | null) => void
  /** Set Selected Showdown ID */
  setSelectedShowdownId: (showdownId: string | null) => void
  /** Set Selected Showdown Monster Index */
  setSelectedShowdownMonsterIndex: (index: number) => void
  /** Set Selected Survivor */
  setSelectedSurvivor: (survivor: SurvivorDetail | null) => void
  /** Set Selected Survivor ID */
  setSelectedSurvivorId: (survivorId: string | null) => void
  /** Set Selected Tab */
  setSelectedTab: (tab: TabType) => void

  /** Set Survivors */
  setSurvivors: (survivors: SurvivorDetail[]) => void
  /** Survivors */
  survivors: SurvivorDetail[]

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
  // Get the local state information from local storage, or set to default if
  // not present.
  const [local, setLocalState] = useState<LocalContextType>(() =>
    typeof window === 'undefined'
      ? newLocal
      : JSON.parse(
          localStorage.getItem('kdm-archivist-local') ??
            JSON.stringify(newLocal)
        )
  )

  // Hunt
  const [selectedHunt, setSelectedHuntState] = useState<HuntDetail | null>(null)
  const [selectedHuntId, setSelectedHuntIdState] = useState<string | null>(
    () => local.selectedHuntId ?? null
  )
  const [selectedHuntMonsterIndex, setSelectedHuntMonsterIndexState] =
    useState<number>(() => local.selectedHuntMonsterIndex)

  // Settlement
  const [selectedSettlement, setSelectedSettlementState] =
    useState<SettlementDetail | null>(null)
  const [selectedSettlementId, setSelectedSettlementIdState] = useState<
    string | null
  >(() => local.selectedSettlementId ?? null)

  // Settlement Phase
  const [selectedSettlementPhase, setSelectedSettlementPhaseState] =
    useState<SettlementPhaseDetail | null>(null)
  const [selectedSettlementPhaseId, setSelectedSettlementPhaseIdState] =
    useState<string | null>(() => local.selectedSettlementPhaseId ?? null)

  // Showdown
  const [selectedShowdown, setSelectedShowdownState] =
    useState<ShowdownDetail | null>(null)
  const [selectedShowdownId, setSelectedShowdownIdState] = useState<
    string | null
  >(() => local.selectedShowdownId ?? null)
  const [selectedShowdownMonsterIndex, setSelectedShowdownMonsterIndexState] =
    useState<number>(() => local.selectedShowdownMonsterIndex)

  // Survivor
  const [selectedSurvivor, setSelectedSurvivorState] =
    useState<SurvivorDetail | null>(null)
  const [selectedSurvivorId, setSelectedSurvivorIdState] = useState<
    string | null
  >(() => local.selectedSurvivorId ?? null)

  // Survivors (all for Settlement)
  const [survivors, setSurvivors] = useState<SurvivorDetail[]>([])

  // Tab
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
   * Fetch Hunt Data
   *
   * Triggered whenever the settlement or hunt selection changes. Uses a
   * cancellation flag to prevent state updates on unmounted components or when
   * selections change rapidly.
   */
  useEffect(() => {
    console.log('Fetching Hunt Data')

    let isCancelled = false

    if (!selectedHuntId || !selectedSettlementId)
      return () => {
        isCancelled = true
      }

    getHunt(selectedSettlementId)
      .then((hunt) => {
        if (isCancelled) return
        setSelectedHuntState(hunt)
      })
      .catch((err: unknown) => {
        if (isCancelled) return
        setSelectedHuntState(null)
        console.error('Hunt Fetch Error:', err)
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
    console.log('Fetching Settlement & Survivors Data')

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
        setSelectedSettlementState(settlement)
        setSurvivors(survivors)
      })
      .catch((err: unknown) => {
        if (isCancelled) return
        setSelectedSettlementState(null)
        setSurvivors([])
        console.error('Settlement Fetch Error:', err)
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
    console.log('Fetching Settlement Phase Data')

    let isCancelled = false

    if (!selectedSettlementId || !selectedSettlementPhaseId)
      return () => {
        isCancelled = true
      }

    getSettlementPhase(selectedSettlementId)
      .then((settlementPhase) => {
        if (isCancelled) return
        setSelectedSettlementPhaseState(settlementPhase)
      })
      .catch((err: unknown) => {
        if (isCancelled) return
        setSelectedSettlementPhaseState(null)
        console.error('Settlement Phase Fetch Error:', err)
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
    console.log('Fetching Showdown Data')

    let isCancelled = false

    if (!selectedSettlementId || !selectedShowdownId)
      return () => {
        isCancelled = true
      }

    getShowdown(selectedSettlementId)
      .then((showdown) => {
        if (isCancelled) return
        setSelectedShowdownState(showdown)
      })
      .catch((err: unknown) => {
        if (isCancelled) return
        setSelectedShowdownState(null)
        console.error('Showdown Fetch Error:', err)
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
    console.log('Fetching Survivor Data')

    let isCancelled = false

    if (!selectedSettlementId || !selectedSurvivorId)
      return () => {
        isCancelled = true
      }

    getSurvivor(selectedSurvivorId)
      .then((survivor) => {
        if (isCancelled) return
        setSelectedSurvivorState(survivor)
      })
      .catch((err: unknown) => {
        if (isCancelled) return
        setSelectedSurvivorState(null)
        console.error('Survivor Fetch Error:', err)
      })

    return () => {
      isCancelled = true
    }
  }, [selectedSettlementId, selectedSurvivorId])

  /**
   * Set Selected Hunt
   *
   * @param hunt Selected Hunt
   */
  const setSelectedHunt = (hunt: HuntDetail | null) => {
    // When selecting a hunt, stop creation mode
    if (hunt) setIsCreatingNewHunt(false)

    // Update the state to reflect the changes.
    setSelectedHuntState(hunt)
    setSelectedHuntIdState(hunt ? hunt.id : null)
    setSelectedHuntMonsterIndexState(0)

    // Save the change to local storage.
    setLocalState((local) => {
      const updated = {
        ...local,
        selectedHuntId: hunt ? hunt.id : null,
        selectedHuntMonsterIndex: 0
      }

      saveToLocalStorage(updated)

      return updated
    })
  }

  /**
   * Set Selected Hunt ID
   *
   * @param hunt Selected Hunt ID
   */
  const setSelectedHuntId = (huntId: string | null) => {
    // When selecting a hunt, stop creation mode
    if (huntId) setIsCreatingNewHunt(false)

    // The hunt monster index will always reset.
    setSelectedHuntMonsterIndexState(0)

    // Try to get a hunt with this ID and the current settlement ID. If found,
    // set the selected hunt details. Otherwise, clear the hunt and hunt ID.
    getHunt(selectedSettlementId)
      .then((hunt) => {
        // If no hunt is found, clear the selected hunt ID as well to prevent
        // stale data.
        if (!hunt) setSelectedHuntIdState(null)
        setSelectedHuntState(hunt)

        setLocalState((local) => {
          const updated = {
            ...local,
            selectedHuntId: hunt ? hunt.id : null,
            selectedHuntMonsterIndex: 0
          }

          saveToLocalStorage(updated)

          return updated
        })
      })
      .catch(() => {
        setSelectedHuntState(null)
        setSelectedHuntIdState(null)

        // Clear the local state as well to prevent stale data.
        setLocalState((local) => {
          const updated = {
            ...local,
            selectedHuntId: null,
            selectedHuntMonsterIndex: 0
          }

          saveToLocalStorage(updated)

          return updated
        })
      })
  }

  /**
   * Set Selected Hunt Monster Index
   *
   * @param index Selected Hunt Monster Index
   */
  const setSelectedHuntMonsterIndex = (index: number) => {
    setSelectedHuntMonsterIndexState(index)

    setLocalState((local) => {
      const updated = {
        ...local,
        selectedHuntMonsterIndex: index
      }

      saveToLocalStorage(updated)

      return updated
    })
  }

  /**
   * Set Selected Settlement
   *
   * @param settlement Selected Settlement
   */
  const setSelectedSettlement = (settlement: SettlementDetail | null) => {
    // When selecting a settlement, stop creation mode
    if (settlement) setIsCreatingNewSettlement(false)

    // Update the state to reflect the changes.
    setSelectedSettlementState(settlement)
    setSelectedSettlementIdState(settlement ? settlement.id : null)

    // If a settlement is selected, also attempt to fetch the hunt, settlement
    // phase, and showdown details to update the state.
    if (settlement)
      Promise.all([
        getHunt(settlement.id),
        getSettlementPhase(settlement.id),
        getShowdown(settlement.id),
        getSurvivors(settlement.id)
      ])
        .then(([hunt, settlementPhase, showdown, survivors]) => {
          setSelectedHuntState(hunt)
          setSelectedHuntIdState(hunt ? hunt.id : null)
          setSelectedHuntMonsterIndexState(0)
          setSelectedSettlementPhaseState(settlementPhase)
          setSelectedSettlementPhaseIdState(
            settlementPhase ? settlementPhase.id : null
          )
          setSelectedShowdownState(showdown)
          setSelectedShowdownIdState(showdown ? showdown.id : null)
          setSelectedShowdownMonsterIndexState(0)
          setSurvivors(survivors)

          // Save the change to local storage.
          setLocalState((local) => {
            const updated = {
              ...local,
              selectedHuntId: hunt ? hunt.id : null,
              selectedHuntMonsterIndex: 0,
              selectedSettlementId: settlement ? settlement.id : null,
              selectedSettlementPhaseId: settlementPhase
                ? settlementPhase.id
                : null,
              selectedShowdownId: showdown ? showdown.id : null,
              selectedShowdownMonsterIndex: 0,
              selectedSurvivorId: null,
              selectedTab: TabType.TIMELINE
            }

            saveToLocalStorage(updated)

            return updated
          })
        })
        .catch(() => {
          setSelectedHuntState(null)
          setSelectedHuntIdState(null)
          setSelectedHuntMonsterIndexState(0)
          setSelectedSettlementPhaseState(null)
          setSelectedSettlementPhaseIdState(null)
          setSelectedShowdownState(null)
          setSelectedShowdownIdState(null)
          setSelectedShowdownMonsterIndexState(0)
          setSurvivors([])

          // Save the change to local storage.
          setLocalState((local) => {
            const updated = {
              ...local,
              selectedHuntId: null,
              selectedHuntMonsterIndex: 0,
              selectedSettlementId: null,
              selectedSettlementPhaseId: null,
              selectedShowdownId: null,
              selectedShowdownMonsterIndex: 0,
              selectedSurvivorId: null,
              selectedTab: TabType.TIMELINE
            }

            saveToLocalStorage(updated)

            return updated
          })
        })
  }

  /**
   * Set Selected Settlement ID
   *
   * @param settlementId Selected Settlement ID
   */
  const setSelectedSettlementId = (settlementId: string | null) => {
    // When selecting a settlement, stop creation mode
    if (settlementId) setIsCreatingNewSettlement(false)

    // Update the state to reflect the changes.
    setSelectedSettlementIdState(settlementId)

    // If a settlement is selected, also attempt to fetch the hunt, settlement
    // phase, and showdown details to update the state.
    if (settlementId)
      Promise.all([
        getHunt(settlementId),
        getSettlement(settlementId),
        getSettlementPhase(settlementId),
        getShowdown(settlementId),
        getSurvivors(settlementId)
      ])
        .then(([hunt, settlement, settlementPhase, showdown, survivors]) => {
          setSelectedHuntState(hunt)
          setSelectedHuntIdState(hunt ? hunt.id : null)
          setSelectedHuntMonsterIndexState(0)
          setSelectedSettlementState(settlement)
          setSelectedSettlementPhaseState(settlementPhase)
          setSelectedSettlementPhaseIdState(
            settlementPhase ? settlementPhase.id : null
          )
          setSelectedShowdownState(showdown)
          setSelectedShowdownIdState(showdown ? showdown.id : null)
          setSelectedShowdownMonsterIndexState(0)
          setSurvivors(survivors)

          // Save the change to local storage.
          setLocalState((local) => {
            const updated = {
              ...local,
              selectedHuntId: hunt ? hunt.id : null,
              selectedHuntMonsterIndex: 0,
              selectedSettlementId: settlement ? settlement.id : null,
              selectedSettlementPhaseId: settlementPhase
                ? settlementPhase.id
                : null,
              selectedShowdownId: showdown ? showdown.id : null,
              selectedShowdownMonsterIndex: 0,
              selectedSurvivorId: null,
              selectedTab: TabType.TIMELINE
            }

            saveToLocalStorage(updated)

            return updated
          })
        })
        .catch(() => {
          setSelectedHuntState(null)
          setSelectedHuntIdState(null)
          setSelectedHuntMonsterIndexState(0)
          setSelectedSettlementPhaseState(null)
          setSelectedSettlementPhaseIdState(null)
          setSelectedShowdownState(null)
          setSelectedShowdownIdState(null)
          setSelectedShowdownMonsterIndexState(0)
          setSurvivors([])

          // Save the change to local storage.
          setLocalState((local) => {
            const updated = {
              ...local,
              selectedHuntId: null,
              selectedHuntMonsterIndex: 0,
              selectedSettlementId: null,
              selectedSettlementPhaseId: null,
              selectedShowdownId: null,
              selectedShowdownMonsterIndex: 0,
              selectedSurvivorId: null,
              selectedTab: TabType.TIMELINE
            }

            saveToLocalStorage(updated)

            return updated
          })
        })
  }

  /**
   * Set Selected Settlement Phase
   *
   * @param settlementPhase Selected Settlement Phase
   */
  const setSelectedSettlementPhase = (
    settlementPhase: SettlementPhaseDetail | null
  ) => {
    setSelectedSettlementPhaseState(settlementPhase)
    setSelectedSettlementPhaseIdState(
      settlementPhase ? settlementPhase.id : null
    )

    setLocalState((local) => {
      const updated = {
        ...local,
        selectedSettlementPhaseId: settlementPhase ? settlementPhase.id : null
      }

      saveToLocalStorage(updated)

      return updated
    })
  }

  /**
   * Set Selected Settlement Phase ID
   *
   * @param settlementPhaseId Selected Settlement Phase ID
   */
  const setSelectedSettlementPhaseId = (settlementPhaseId: string | null) => {
    setSelectedSettlementPhaseIdState(settlementPhaseId)

    if (settlementPhaseId)
      getSettlementPhase(settlementPhaseId)
        .then((settlementPhase) => {
          setSelectedSettlementPhaseState(settlementPhase)

          setLocalState((local) => {
            const updated = {
              ...local,
              selectedSettlementPhaseId: settlementPhaseId
            }

            saveToLocalStorage(updated)

            return updated
          })
        })
        .catch(() => {
          setSelectedSettlementPhaseState(null)
          setSelectedSettlementPhaseIdState(null)

          setLocalState((local) => {
            const updated = {
              ...local,
              selectedSettlementPhaseId: null
            }

            saveToLocalStorage(updated)

            return updated
          })
        })
  }

  /**
   * Set Selected Showdown
   *
   * @param showdown Selected Showdown
   */
  const setSelectedShowdown = (showdown: ShowdownDetail | null) => {
    // When selecting a showdown, stop creation mode
    if (showdown) setIsCreatingNewShowdown(false)

    // Update the state to reflect the changes.
    setSelectedShowdownState(showdown)
    setSelectedShowdownIdState(showdown ? showdown.id : null)
    setSelectedShowdownMonsterIndexState(0)

    // Save the change to local storage.
    setLocalState((local) => {
      const updated = {
        ...local,
        selectedShowdownId: showdown ? showdown.id : null,
        selectedShowdownMonsterIndex: 0
      }

      saveToLocalStorage(updated)

      return updated
    })
  }

  /**
   * Set Selected Showdown ID
   *
   * @param showdownId Selected Showdown ID
   */
  const setSelectedShowdownId = (showdownId: string | null) => {
    // When selecting a showdown, stop creation mode
    if (showdownId) setIsCreatingNewShowdown(false)

    // Try to get a showdown with this ID. If found, set the selected showdown
    // details. Otherwise, clear the showdown and showdown ID.
    getShowdown(showdownId)
      .then((showdown) => {
        // If no showdown is found, clear the selected showdown ID as well to
        // prevent stale data.
        if (!showdown) setSelectedShowdownIdState(null)
        setSelectedShowdownState(showdown)
        setSelectedShowdownMonsterIndexState(0)

        setLocalState((local) => {
          const updated = {
            ...local,
            selectedShowdownId: showdown ? showdown.id : null,
            selectedShowdownMonsterIndex: 0
          }

          saveToLocalStorage(updated)

          return updated
        })
      })
      .catch(() => {
        setSelectedShowdownState(null)
        setSelectedShowdownIdState(null)
        setSelectedShowdownMonsterIndexState(0)

        // Clear the local state as well to prevent stale data.
        setLocalState((local) => {
          const updated = {
            ...local,
            selectedShowdownId: null,
            selectedShowdownMonsterIndex: 0
          }

          saveToLocalStorage(updated)

          return updated
        })
      })
  }

  /**
   * Set Selected Showdown Monster Index
   *
   * @param index Selected Showdown Monster Index
   */
  const setSelectedShowdownMonsterIndex = (index: number) => {
    setSelectedShowdownMonsterIndexState(index)

    setLocalState((local) => {
      const updated = {
        ...local,
        selectedShowdownMonsterIndex: index
      }

      saveToLocalStorage(updated)

      return updated
    })
  }

  /**
   * Set Selected Survivor
   *
   * @param survivor Selected Survivor
   */
  const setSelectedSurvivor = (survivor: SurvivorDetail | null) => {
    // When selecting a survivor, stop creation mode
    if (survivor) setIsCreatingNewSurvivor(false)

    setSelectedSurvivorState(survivor)
    setSelectedSurvivorIdState(survivor ? survivor.id : null)

    setLocalState((local) => {
      const updated = {
        ...local,
        selectedSurvivorId: survivor ? survivor.id : null
      }

      saveToLocalStorage(updated)

      return updated
    })
  }

  /**
   * Set Selected Survivor ID
   *
   * @param survivorId Selected Survivor ID
   */
  const setSelectedSurvivorId = (survivorId: string | null) => {
    // When selecting a survivor, stop creation mode
    if (survivorId) setIsCreatingNewSurvivor(false)

    getSurvivor(survivorId)
      .then((survivor) => {
        setSelectedSurvivorState(survivor)
        setSelectedSurvivorIdState(survivorId)

        setLocalState((local) => {
          const updated = {
            ...local,
            selectedSurvivorId: survivorId
          }

          saveToLocalStorage(updated)

          return updated
        })
      })
      .catch(() => {
        setSelectedSurvivorState(null)
        setSelectedSurvivorIdState(null)

        setLocalState((local) => {
          const updated = {
            ...local,
            selectedSurvivorId: null
          }

          saveToLocalStorage(updated)

          return updated
        })
      })
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
