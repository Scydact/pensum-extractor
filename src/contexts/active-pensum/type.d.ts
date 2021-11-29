declare namespace ActivePensum {
  type MatExtraData = {
    /** List of all mats */
    list: Pensum.Mat[],
    /** Map: code<string> -> period<number> */
    periodMap: Map<string, number>,
    /** Map : code<string> -> mat<Mat> */
    codeMap: Map<string, Pensum.Mat>, 
    /** Map: code<string> -> postreqs<string> */
    postreqMap: Map<string, string[]>,
    /** List of mats that are prereqs but are not registered. */
    looseUnhandled: Set<string>,
  }

  /** List of universities/careers. */
  type Payload = {
    pensum: Pensum.Pensum | null,
    matData: MatExtraData,
    error: any | null,
    loading: boolean
  };

  type Action =
    | {
      type: 'set'
      payload: Payload['pensum']
    }
    | {
      type: 'clear' | 'load/fromSave'
    }
    | {
      type: 'load'
      payload: {
        university: string,
        code: string,
      }
    }
    | {
      type: 'error',
      payload: Payload['error']
    }
    | {
      type: 'loading'
      payload: Payload['loading']
    }
}