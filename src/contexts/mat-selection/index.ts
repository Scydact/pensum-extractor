import { createContext, memo, useReducer, useEffect } from "react";
import { matSelectionReducer } from "./reducer";
import createDefaultState from "./default";
import { nestComponents } from "lib/react-utils";

type MatSelectionContextProps = {
  state: MatSelection.Payload,
  dispatch: (action: MatSelection.Action) => any,
}

const defaultContext: MatSelectionContextProps = ({
  state: createDefaultState(),
  dispatch: () => {},
});

/** Collection of helper functions to use for mat selection. */
export const matSelectHelpers = {
  /** 
   * Get the current tracker of a mat.
   * @example
   * getTracker(tracker, 'MAT101'); // returns 'passed'
   * getTracker(tracker, 'MAT102'); // returns 'course'
   * getTracker(tracker, 'MAT103'); // returns null
  */
  getTracker(tracker: MatSelection.Payload['tracker'], code: string) {
    for (const [key, set] of Object.entries(tracker)) {
      if (set.has(code)) return key as MatSelection.TrackerMode;
    }
    return null;
  },
  /** 
   * Gets the common tracker for all the given mats. If all the mats don't share a tracker, return null.
  */
  getCommonTracker(tracker: MatSelection.Payload['tracker'], periodStr: string[]) {
    for (const [key, set] of Object.entries(tracker)) {
      if (periodStr.every(code => set.has(code)))
        return key as MatSelection.TrackerMode;
    }
    return null;
  }
}


export const MatSelectionDispatchContext = createContext(defaultContext.dispatch);
export const MatSelectionModeContext = createContext(defaultContext.state.mode);
export const MatSelectionTrackerContext = createContext(defaultContext.state.tracker);
export const MatSelectionTrackerNameContext = createContext(defaultContext.state.currentName);
export const MatSelectionTrackerStorageContext = createContext(defaultContext.state.storage);
export const MatSelectionFilterContext = createContext(defaultContext.state.filter);

type Props = { children: any };

export const MatSelectionProvider = memo(function MatSelectionProvider({ children }: Props) {
  const [state, dispatch] = useReducer(matSelectionReducer, defaultContext.state);

  useEffect(() => {
    // Load data from cookies
    dispatch({ type: 'loadFromStorage' });
  }, []);

  return nestComponents([
    [MatSelectionDispatchContext.Provider, { value: dispatch }],
    [MatSelectionModeContext.Provider, { value: state.mode }],
    [MatSelectionTrackerContext.Provider, { value: state.tracker }],
    [MatSelectionTrackerNameContext.Provider, { value: state.currentName }],
    [MatSelectionTrackerStorageContext.Provider, { value: state.storage }],
    [MatSelectionFilterContext.Provider, { value: state.filter }, children],
  ])
})