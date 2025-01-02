declare namespace UniversityData {
    /** List of universities/careers. */
    type Payload = {
        universities: PensumJson.University[]
        selected: {
            code: string
            university: PensumJson.University
            careers: PensumJson.Carrera[]
        } | null
        loading: boolean
        error: string | null
    }

    type DispatchAction =
        | {
              type: 'set/universities'
              payload: Payload['universities']
          }
        | {
              type: 'set/selected'
              payload: {
                  code: string
                  data: PensumJson.PensumIndex
              } | null
          }
        | {
              type: 'select'
              payload: string
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
