import { fetchPensumFromCode, PensumFetchError } from "functions/pensum-fetch";
import React, { createContext, memo, useCallback, useEffect, useReducer } from "react";
import { ActivePensum, activePensumReducer, createPayload } from "./active-pensum-reducer";


type ActivePensumContextProps = {
  state: ActivePensum.Payload,
  dispatch: (action: ActivePensum.Action) => any,
}

const defaultContext: ActivePensumContextProps = {
  state: createPayload(null),
  dispatch: () => {},
}


/** Context for the current loaded pensum. */
const ActivePensumContext = createContext(defaultContext);

/** Custom dispatch that handles async stuff. */
function customDispatchFactory(dispatch: React.Dispatch<ActivePensum.Action>) {
  return async (action: ActivePensum.Action) => {
    switch (action.type) {
      case 'load':
        dispatch({ type: 'loading', payload: true });
        const { university, code } = action.payload;
        try {
          const pensum = await fetchPensumFromCode(university, code);
          dispatch({ type: 'set', payload: pensum });
        }
        catch (error) {
          const err = { type: 'error' as 'error', payload: undefined as any };
          if (error instanceof SyntaxError)
            err.payload = `JSON could not be parsed for ${university}/${code}.`;
          else if (error instanceof PensumFetchError)
            err.payload = error.message;
          else
            err.payload = error;

          dispatch(err);
        }
        finally {
          break;
        }

      default:
        dispatch(action);
    }
  }
}

type Props = { children: any};

// this double naming thing is so the React chrome extension gets the name correctly.
export const ActivePensumProvider = memo(function ActivePensumProvider({ children }: Props) { 
  const [state, dispatch] = useReducer(activePensumReducer, defaultContext.state);

  // onMount: load saved pensum
  useEffect(() => {
    dispatch({type: 'load/fromSave'});
  }, []);

  // Custom dispatch with async, non-pure code (fetchPensum).
  const customDispatch = useCallback(customDispatchFactory(dispatch), []);
  
  return <ActivePensumContext.Provider value={{ state, dispatch: customDispatch }}>
    {children}
  </ActivePensumContext.Provider>
})


export default ActivePensumContext;