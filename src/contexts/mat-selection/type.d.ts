declare namespace MatSelection {
  type TrackerMode = 'course' | 'passed'

  type Payload = {
    tracker: Record<TrackerMode, Set<string>>
    mode: TrackerMode
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
}
