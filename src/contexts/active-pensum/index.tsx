import { fetchPensumFromCode } from "functions/pensum-fetch";
import { createContext, memo, useCallback, useEffect, useReducer } from "react";
import { ActivePensum, activePensumReducer } from "./local-storage";

type ActivePensumContextProps = {
  state: Pensum.Pensum | null,
  dispatch: (action: ActivePensum.Action) => any,
}

/** Context for the current loaded pensum. */
const ActivePensumContext = createContext({} as ActivePensumContextProps);

type Props = { children: any};

// this double naming thing is so the React chrome extension gets the name correctly.
export const ActivePensumProvider = memo(function ActivePensumProvider({ children }: Props) { 
  const [state, dispatch] = useReducer(activePensumReducer, null);

  // onMount: load saved pensum
  useEffect(() => {
    dispatch({type: 'load/fromSave'});
  }, []);

  const customDispatch = useCallback(async (action) => {
    switch (action.type) {
      case 'load':
        const {university, code} = action.payload;
        const pensum = await fetchPensumFromCode(university, code);
        dispatch({ type: 'set', payload: pensum });
        break;

      default:
        dispatch(action);
    }
  }, []);
  
  return <ActivePensumContext.Provider value={{ state, dispatch: customDispatch }}>
    {children}
  </ActivePensumContext.Provider>
})


export default ActivePensumContext;