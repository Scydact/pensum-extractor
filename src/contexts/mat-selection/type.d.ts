declare namespace MatSelection {
  /** Array of all the possible tracker types. 
   * Used in ./default to compare if filter is valid. */
  type TrackerModeTypes = readonly ['passed', 'course']

  /** Idendifier of the current tracking mode.
   * (When user clicks a mat, will be added to the given tracker.) */
  type TrackerMode = TrackerModeTypes[number]

  /** Record of all trackers. */
  type Tracker = Record<TrackerMode, Set<string>>

  /** The actual state to save to the reducer. */
  type Payload = {
    /** Current tracker. */
    tracker: Tracker
    /** Current mode. */
    mode: TrackerMode,
    /** Current tracker name on storage. */
    currentName: string | null,
    /** Current storage for all the saved trackers. */
    storage: Record<string, Tracker>
    /** Current hidden mat trackers, for use in mat filtering. */
    filter: Set<(TrackerMode | null)>;
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
    
    /** Pass all mats on course. */
    | {
      type: 'passOnCourse',
    }

    | {
      type: 'toggleFilter',
      payload: TrackerMode | null,
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

    /** Sets the entire current tracker */
    | {
      type: 'setTracker',
      payload: Tracker,
    }
}
