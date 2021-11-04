export declare namespace UniversityData {
  
  /** List of universities/careers. */
  type Payload = {
    universities: PensumJson.University[],
    selected: PensumJson.University | null,
    careers: [],
    loading: boolean,
    error: string | null,
  }

  type Action = { type: string, payload?: any }
}

export function universityDataReducer(
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

    case 'set/careers':
      return {
        ...state,
        careers: action.payload
      }

    case 'set/error':
      return {
        ...state,
        error: action.payload
      }

    default:
      console.error('Unknown action "' + action.type + '".');
      return state;
  }
}

export const initialUniversityData: UniversityData.Payload = {
  universities: [],
  selected: null,
  careers: [],
  loading: true,
  error: null,
}