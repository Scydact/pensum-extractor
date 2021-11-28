import { objectMap } from "lib/sort-utils";

const TRACKER_STORAGE_KEY = process.env.REACT_APP_PENSUM_STORAGE_TRACKER_KEY || 'pensumTracker';

// TODO: IMPLEMENT TRACKER INTO THE PENSUM TABLE >:V
// IMPORTANT: Friendly remined that any method that modifies the state must call saveToStorage.
export function matSelectionReducer(
  state: MatSelection.Payload,
  action: MatSelection.Action): MatSelection.Payload {

  const cloneTracker = (tracker?: MatSelection.Tracker): MatSelection.Tracker => {
    if (!tracker) tracker = state.tracker;

    const o: any = {};
    for (const [key, set] of Object.entries(tracker)) {
      o[key] = new Set(set);
    }
    return o;
  }

  const { mode } = state;

  switch (action.type) {

    case 'selectMode': {
      const newMode = action.payload || 'passed';

      return matSelectionReducer({
        ...state,
        mode: newMode,
      }, { type: 'saveToStorage' });
    }


    case 'select': {
      const mat = action.payload;
      const tracker = cloneTracker();

      if (tracker[mode].has(mat)) {
        tracker[mode].delete(mat);
      } else { // Add to this tracker, and remove from the rest
        tracker[mode].add(mat);
        for (const [key, set] of Object.entries(tracker)) {
          if (key !== mode) set.delete(mat);
        }
      }

      return matSelectionReducer({
        ...state,
        tracker
      }, { type: 'saveToStorage' });
    }


    case 'selectPeriod': {
      const period = action.payload;
      const tracker = cloneTracker();

      const matCount = period.length;
      if (matCount === 0) return state;
      
      
      // Check each tracker.
      const sortedTracker = objectMap(tracker, x => [] as string[]);
      const untracked = [] as string[];

      for (const code of period) {
        let isTracked = false;

        for (const [key, set] of Object.entries(tracker)) {
          if (set.has(code)) {
            (sortedTracker as any)[key].push(code);
            isTracked = true;
          }
        }

        if (!isTracked) {
          untracked.push(code);
        }
      }


      
      /**
       * Cases:
       * - All on main: remove all;
       * - All unselected: just add all
       * - Some holes: set holes only.
       * - All on both (none unselected): finish adding all (same as prev.)
       */
      const allOnMain = sortedTracker[mode].length === matCount;
      const allUnselected = untracked.length === matCount;
      const noneUnselected = untracked.length === 0;
      const someUnselected = !allUnselected && !noneUnselected;

      // Case 1: All on main -> remove all
      if (allOnMain) {
        period.forEach(code => tracker[mode].delete(code));
      } 
      // Case 3: Add only the unselected. Leave the rest intact.
      else if (someUnselected) {
        untracked.forEach(code => tracker[mode].add(code));
      }
      // Case 2 & 4: Add to this set, don't remove from the other.
      else {
        for (const code of period) {
          for (const [key, set] of Object.entries(tracker)) {
            if (key === mode) set.add(code);
            else set.delete(code);
          }
        }
      }

      return matSelectionReducer({
        ...state,
        tracker
      }, { type: 'saveToStorage' });
    }

    


    // TRACKER ID STUFF
    /** Sets/renames the name of the current trackers. */
    case 'setTrackerID': {
      let newName: string | null;

      // Simple check if string is valid.
      // If not valid (or empty), just set to null.
      // This is so the user can remove the tracker by just clearing an input form.
      if (typeof action.payload !== 'string') newName = null;      
      else {
        const t = action.payload.trim();
        newName = (t === '') ? null : t;
      }

      // Check if the newName is a prototype property
      // This is to avoid setting the tracker to something like 'toString'.
      if (typeof newName === 'string'
        && state.storage[newName] // Check if this value exists
        && !state.storage.hasOwnProperty(newName) // Check if this value is from the prototype
      ) {
        throw RangeError(`Given name ${newName} is a prototype property!`);
      }

      // If there was a previous name, remove it so this action is equivalent to "renaming".
      const storage = { ...state.storage };
      if (state.currentName)
        delete storage[state.currentName];

      // saveToStorage will automatically copy the current tracker to the new tracker name.
      return matSelectionReducer({
        ...state,
        currentName: newName,
        storage,
      }, { type: 'saveToStorage' });
    }

    case 'copyTrackerID': {
      const {'old': oldName, 'new': newName} = action.payload;

      if (oldName === newName) return state;
      
      const storage = { ...state.storage };
      const oldTracker = storage[oldName];

      // Nothing to copy!
      if (!oldTracker) return state;
      storage[newName] = cloneTracker(oldTracker);

      // Replace currentName if needed
      // IMPORTANT: Remove this thing if you don't want auto-switching to the new tracker on copy.
      let currentName = state.currentName; 
      if (currentName === oldName)
        currentName = newName;

      return matSelectionReducer({
        ...state,
        storage,
        currentName,
      }, { type: 'saveToStorage' });
    }


    case 'deleteTrackerID': {
      const name = action.payload;

      if (!name || !state.storage[name]) return state;

      // Do the deletion
      const storage = { ...state.storage };
      delete storage[name];
      
      // Replace currentName if needed
      let currentName = state.currentName;
      if (currentName === name)
        currentName = null;

      return matSelectionReducer({
        ...state,
        storage,
        currentName,
      }, { type: 'saveToStorage' });
    }

    // TRACKER SAVE ACTIONS
    case 'saveToStorage': {
      if (state.currentName) {
        state.storage[state.currentName] = state.tracker;
      }
      saveTrackerToLocalStorage(state);
      return state;
    }

    case 'loadFromStorage': {
      const data = loadTrackerFromLocalStorage();
      if (data) return data;
      return state;
    }

    default:
      console.error('Unknown action "' + (action as any)?.type + '".');
      return state;
  }
}


/** Set of utils to convert the tracker's sets into arrays. 
 * Used to save the sets to the localStorage. */
const JSONSetUtils = {
  replacer: function Set_toJSON(key: string, value: any) {
    if (typeof value === 'object' && value instanceof Set) {
      return [...value];
    }
    return value;
  },

  reviver: function Set_fromJSON(key: string, value: any) {
    if (typeof value === 'object' && Array.isArray(value)) {
      return new Set(value);
    }
    return value
  }
}

function saveTrackerToLocalStorage(trackerState: MatSelection.Payload) {
  const json = JSON.stringify(trackerState, JSONSetUtils.replacer);
  localStorage.setItem(TRACKER_STORAGE_KEY, json);
}

function loadTrackerFromLocalStorage() {
  const str = localStorage.getItem(TRACKER_STORAGE_KEY);
  if (!str) return null;

  const data = JSON.parse(str, JSONSetUtils.reviver);

  // Simple check for correct structure
  if (!( // Negate to make it a type guard
    data 
    && data.tracker 
    && typeof data.tracker.passed  === 'object' 
    && data.tracker.passed instanceof Set
    && data.storage
    )) {
    return null;
  }

  return data;
}