declare namespace MatSelection {
  type TrackerMode = 'course' | 'passed'

  type Tracker = Record<TrackerMode, Set<string>>

  type Payload = {
    /** Current tracker. */
    tracker: Tracker
    /** Current mode. */
    mode: TrackerMode,
    /** Current tracker name on storage. */
    currentName: string | null,
    /** Current storage for all the saved trackers. */
    storage: Record<string, Tracker>
  }

  type Action =
    /** Changes the selection mode */
    | {
      type: 'selectMode'
      payload: 'course' | 'passed' | null
    }

    /** Selects a new mat */
    | {
      type: 'select',
      payload: string
    }

    /** Selects a group of mats (a period) */
    | {
      type: 'selectPeriod',
      payload: string[]
    }
    
    // TRACKER SAVE STUFF
    /** Sets/replaces the name of the current trackers */
    | {
      type: 'setTrackerID',
      payload: string
    }

    /** Deletes the given tracker from the storage */
    | {
      type: 'deleteTrackerID',
      payload: string
    }

     /** Creates a copy of the given tracker from the storage */
     | {
      type: 'copyTrackerID',
      payload: { old: string, new: string }
    }

    /** Updates the current tracker on 'storage' and saves to localStorage. */
    | {
      type: 'saveToStorage',
    }
    /** Updates the current tracker on 'storage' and saves to localStorage. */
    | {
      type: 'loadFromStorage',
    }
}
