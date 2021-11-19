import { objectMap } from "lib/sort-utils";

// TODO: IMPLEMENT TRACKER INTO THE PENSUM TABLE >:V
export function matSelectionReducer(
  state: MatSelection.Payload,
  action: MatSelection.Action): MatSelection.Payload {

  const cloneTracker = (): MatSelection.Payload['tracker'] => {
    const o: any = {};
    for (const [key, set] of Object.entries(state.tracker)) {
      o[key] = new Set(set);
    }
    return o;
  }

  const { mode } = state;

  switch (action.type) {

    case 'selectMode': {
      const newMode = action.payload || 'passed';

      return {
        ...state,
        mode: newMode,
      }
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

      return {
        ...state,
        tracker
      };
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


      return {
        ...state,
        tracker
      };
    }

    default:
      console.error('Unknown action "' + (action as any)?.type + '".');
      return state;
  }
}