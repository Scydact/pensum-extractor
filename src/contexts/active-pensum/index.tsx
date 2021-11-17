import { fetchPensumFromCode, PensumFetchError } from "functions/pensum-fetch";
import React, { createContext, memo, useCallback, useEffect, useReducer } from "react";
import { ActivePensum, activePensumReducer, createPayload } from "./active-pensum-reducer";


type ActivePensumContextProps = {
  state: ActivePensum.Payload,
  dispatch: (action: ActivePensum.Action) => any,
  load: (university: string, code: string) => any,
}

const defaultContext: ActivePensumContextProps = {
  state: createPayload(null),
  dispatch: () => {},
  load: () => {},
}


/** Context for the current loaded pensum. */
const ActivePensumContext = createContext(defaultContext);

type Props = { children: any};

// this double naming thing is so the React chrome extension gets the name correctly.
export const ActivePensumProvider = memo(function ActivePensumProvider({ children }: Props) { 
  const [state, dispatch] = useReducer(activePensumReducer, defaultContext.state);

  // onMount: load saved pensum
  useEffect(() => {
    dispatch({type: 'load/fromSave'});
  }, []);

  // Custom fn to load a pensum
  const load = useCallback(async (university: string, code: string) => {
    dispatch({ type: 'loading', payload: true });

    try {
      const pensum = await fetchPensumFromCode(university, code);
      dispatch({ type: 'set', payload: pensum });
    }
    catch (error) {
      let m: any;

      if (error instanceof SyntaxError)
        m = `JSON could not be parsed for ${university}/${code}.`;
      else if (error instanceof PensumFetchError)
        m = error.message;
      else
        m = error;

      dispatch({ type: 'error' as 'error', payload: m });
    }
  }, []);
  
  return <ActivePensumContext.Provider value={{ state, dispatch, load }}>
    {children}
  </ActivePensumContext.Provider>
})


export default ActivePensumContext;