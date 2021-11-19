
declare namespace ActivePensum {

  /** List of universities/careers. */
  type Payload = {
    pensum: Pensum.Pensum | null,
    matData: ReturnType<typeof processPensumMats>,
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