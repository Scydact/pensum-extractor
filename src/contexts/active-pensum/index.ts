import { fetchPensumFromCode, PensumFetchError } from "functions/pensum-fetch";
import { createContext, createElement, memo, useCallback, useEffect, useReducer } from "react";
import { activePensumReducer, createPayload } from "./reducer";


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

  useEffect(() => {
    (window as any)['data'] = state;
  })

  // Custom fn to load a pensum
  const load = useCallback(async (university: string, code: string) => {
    dispatch({ type: 'loading', payload: true });

    try {
      const pensum = await fetchPensumFromCode(university, code);
      dispatch({ type: 'set', payload: pensum });
	  
	  // TODO: add "payload.loadInfo" (similar to payload.error) to tell user 
	  //       the process of fetching (fetching from proxy #1, proxy#2, etc...)
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

  return createElement(
    ActivePensumContext.Provider,
    { value: { state, dispatch, load } },
    children,
  )
})


export default ActivePensumContext;