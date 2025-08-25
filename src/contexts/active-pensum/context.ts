import { fetchPensumFromCode, fetchPensumFromSource, PensumFetchError } from '@/functions/pensum-fetch'
import { createContext, createElement, memo, useCallback, useEffect, useReducer, useRef } from 'react'
import { activePensumReducer, createPayload } from './reducer'

type ActivePensumContextProps = {
    state: ActivePensum.Payload
    dispatch: (action: ActivePensum.Action) => any
    load: (university: string, code: string) => any
    loadWithExtractor: (university: string, code: string) => any
}

const defaultContext: ActivePensumContextProps = {
    state: createPayload(null),
    dispatch: () => {},
    load: () => {},
    loadWithExtractor: () => {},
}

/** Context for the current loaded pensum. */
export const ActivePensumContext = createContext(defaultContext)
export default ActivePensumContext

type Props = { children: any }

// this double naming thing is so the React chrome extension gets the name correctly.
export const ActivePensumProvider = memo(function ActivePensumProvider({ children }: Props) {
    const [state, dispatch] = useReducer(activePensumReducer, defaultContext.state)

    // onMount: load saved pensum
    const initialized = useRef(false)
    useEffect(() => {
        if (!initialized.current) {
            dispatch({ type: 'load/fromSave', debug: 'Initializing ActivePensum' })
            initialized.current = true
        }
    }, [])

    useEffect(() => {
        ;(window as any)['data'] = state
    })

    // Custom fn to load a pensum
    const load = useCallback(async (university: string, code: string) => {
        dispatch({ type: 'loading', payload: true })
        try {
            const pensum = await fetchPensumFromCode(university, code)
            dispatch({
                type: 'set',
                payload: pensum,
                debug: `Setting from built-in load of uni=${university}, code=${code}`,
            })
        } catch (error) {
            let m: any
            if (error instanceof SyntaxError) m = `JSON could not be parsed for ${university}/${code}.`
            else if (error instanceof PensumFetchError) m = error.message
            else m = error

            dispatch({ type: 'error' as const, payload: m })
        }
    }, [])

    // Custom fn to load a pensum
    const loadWithExtractor = useCallback(async (university: string, code: string) => {
        dispatch({ type: 'loading', payload: true })
        try {
            const pensum = await fetchPensumFromSource(university, code)
            dispatch({
                type: 'set',
                payload: pensum,
                debug: `Setting from extractor load of uni=${university}, code=${code}`,
            })
        } catch (error) {
            let m: any
            if (error instanceof SyntaxError) m = `JSON could not be parsed for ${university}/${code}.`
            else if (error instanceof PensumFetchError) m = error.message
            else m = error

            dispatch({ type: 'error' as const, payload: m })
        }
    }, [])

    return createElement(
        ActivePensumContext.Provider,
        { value: { state, dispatch, load, loadWithExtractor } },
        children,
    )
})
