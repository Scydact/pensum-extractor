import { createContext, memo, useReducer } from "react";
import { matSelectionReducer } from "./reducer";

type MatSelectionContextProps = {
  state: MatSelection.Payload,
  dispatch: (action: MatSelection.Action) => any,
}

const createDefaultState = (): MatSelection.Payload => ({
  mode: 'passed',
  tracker: {
    course: new Set(),
    passed: new Set(),
  }
});

const defaultContext: MatSelectionContextProps = ({
  state: createDefaultState(),
  dispatch: () => {},
});

/** Collection of helper functions to use for mat selection. */
export const helpers = {
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
}


export const MatSelectionDispatchContext = createContext(defaultContext.dispatch);
export const MatSelectionModeContext = createContext(defaultContext.state.mode);
export const MatSelectionTrackerContext = createContext(defaultContext.state.tracker);

type Props = { children: any };

export const MatSelectionProvider = memo(function MatSelectionProvider({ children }: Props) {
  const [state, dispatch] = useReducer(matSelectionReducer, defaultContext.state);

  return <MatSelectionDispatchContext.Provider value={dispatch}>
    <MatSelectionModeContext.Provider value={state.mode}>
      <MatSelectionTrackerContext.Provider value={state.tracker}>
        {children}
      </MatSelectionTrackerContext.Provider>
    </MatSelectionModeContext.Provider>
  </MatSelectionDispatchContext.Provider>
})