import { fetchUniversities } from "functions/metadata-fetch"
import { sortByProp } from "lib/sort-utils"
import React, { createContext, memo, useEffect, useReducer } from "react"

export declare namespace UniversityData {
  
  /** List of universities/careers. */
  type Payload = {
    universities: PensumJson.University[],
    selected: PensumJson.University | null,
    loading: boolean,
    error: string | null,
  }

  type Action = 
    | {
      type: 'set/universities'
      payload: Payload['universities']
    }
    | {
      type: 'set/selected'
      payload: Payload['selected']
    }
    | {
      type: 'set/loading'
      payload: Payload['loading']
    }
    | {
      type: 'set/error'
      payload: Payload['error']
    }
}

function universityDataReducer(
  state: UniversityData.Payload,
  action: UniversityData.Action): UniversityData.Payload {
  switch (action.type) {
    case 'set/universities':
      return {
        ...state,
        universities: action.payload
      }

    case 'set/selected':
      return {
        ...state,
        selected: action.payload
      }

    case 'set/loading':
      return {
        ...state,
        loading: action.payload
      }

    case 'set/error':
      return {
        ...state,
        error: action.payload
      }

    default:
      console.error('Unknown action: ', action);
      return state;
  }
}

/** Initial value for UniversityData */
const initialUniversityData: UniversityData.Payload = {
  universities: [],
  selected: null,
  loading: true,
  error: null,
}


// CONTEXT STUFF
/** University data context. To be used with useContext() for getting selected university/careers. */
export const UniversityContext = createContext({
  state: initialUniversityData, 
  dispatch: {} as React.Dispatch<UniversityData.Action>,
});

type UniCtxProps = { children: any};

/** Handles automatic load of university list. */
export const UniversityProvider = memo(function UniversityProvider({ children }: UniCtxProps) {
  const [state, dispatch] = useReducer(universityDataReducer, initialUniversityData);

  // onMount: load universities
  useEffect(() => {
    fetchUniversities()
      .then(unis => {
        const u = unis.universities.sort(sortByProp('longName'));
        dispatch({ type: 'set/universities', payload: u })
      })
      .catch(e => {
        dispatch({ type: 'set/error', payload: e })
      })
      .finally(() => {
        dispatch({ type: 'set/loading', payload: false })
      })
  }, []);
  
  return <UniversityContext.Provider value={{ state, dispatch }}>
    {children}
  </UniversityContext.Provider>
})

export default UniversityContext;