declare namespace ActivePensum {
    type MatExtraData = {
        /** List of all mats */
        list: Pensum.Mat[]
        /** Map: code<string> -> period<number> or additionalPeriod<string> */
        periodMap: Map<string, number | string>
        /** Map : code<string> -> mat<Mat> */
        codeMap: Map<string, Pensum.Mat>
        /** Map: code<string> -> postreqs<string> */
        postreqMap: Map<string, string[]>
        /** Map: code<string> -> coreqs<string> */
        coreqMap: Map<string, string[]>
        /** List of mats that are prereqs but are not registered. */
        looseUnhandled: Set<string>
        /** All mats that are counted towards the career progression. */
        careerMats: Set<string>
    }

    /** List of universities/careers. */
    type Payload = {
        pensum: Pensum.Pensum | null
        matData: MatExtraData
        error: any | null
        loading: boolean
    }

    type Action = { debug?: string } & (
        | {
              type: 'set'
              payload: Payload['pensum']
          }
        | {
              type: 'clear' | 'load/fromSave' | 'new'
          }
        | {
              type: 'load'
              payload: {
                  university: string
                  code: string
              }
          }
        | {
              type: 'error'
              payload: Payload['error']
          }
        | {
              type: 'loading'
              payload: Payload['loading']
          }
    )
}
