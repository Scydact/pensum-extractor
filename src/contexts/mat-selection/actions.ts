import { objectMap } from "lib/sort-utils";

/** Functions related to map-selection. */
const actions = {
  /** Mat selection exporting */
  export: {
    /** Converts the given tracker sets into arrays. */
    selection: (tracker: MatSelection.Tracker) => {
      return JSON.stringify(tracker, JSONSelectionReplacer)
    },
    /** Converts the entire storage into a JSON payload */
    storage: (
      storage: MatSelection.Payload['storage'],
      currentName: MatSelection.Payload['currentName'],
      tracker: MatSelection.Payload['tracker']) => {
      return JSON.stringify({
        currentName,
        storage,
        tracker,
      }, JSONSelectionReplacer)
    }
  },
  /** Mat selection importing */
  import: {
    /** Converts a JSON object into a valid tracker object */
    selection: (trackerObj: any): MatSelection.Tracker => {
      return {
        passed: any2tracker(trackerObj['passed']),
        course: any2tracker(trackerObj['course']),
      }
    },

    storage: (storageObj: any) => {
      let storage: MatSelection.Payload['storage']; 
      let tracker: MatSelection.Payload['tracker'];
      let currentName: MatSelection.Payload['currentName'];

      currentName = storageObj['currentName'] || null;

      /** Map of Record<string, {passed: Set, course: Set} */
      storage = objectMap(storageObj['storage'], (val) => actions.import.selection(val))

      tracker = actions.import.selection(storageObj['tracker'])

      return {
        storage,
        tracker,
        currentName,
      }
    }

  }
};

function isValidTrackerJSON(obj: any) {
  return (Array.isArray(obj) && obj.every(x => typeof x === 'string'))
}

/** Always returns a tracker type */
function any2tracker(obj: any): Set<string> {
  if (isValidTrackerJSON(obj)) return new Set(obj)
  return new Set()
}


/** Converts sets into arrays */
function JSONSelectionReplacer(key: string, value: any) {
  if (value instanceof Set) return [...value]
  return value
}

export default actions;