import { fetchCarreras, fetchUniversities } from '@/functions/metadata-fetch'
import { sortByProp } from '@/lib/sort-utils'
import React, { createContext, createElement, memo, useCallback, useEffect, useReducer, useRef } from 'react'

function universityDataReducer(
    state: UniversityData.Payload,
    action: UniversityData.DispatchAction,
): UniversityData.Payload {
    switch (action.type) {
        case 'set/universities': {
            // After reloading the available universities, update the selected one (if any)
            let selected = state.selected
            if (selected) {
                const foundUni = action.payload.find((uni) => uni.code === selected?.code)
                if (foundUni) {
                    selected = { ...selected, university: foundUni }
                }
            }
            return {
                ...state,
                selected,
                universities: action.payload,
            }
        }

        case 'set/selected': {
            if (!action.payload)
                return {
                    ...state,
                    loading: false,
                    selected: null,
                }

            const { code, data: careerIndex } = action.payload
            const { careers } = careerIndex

            const university = state.universities.find((x) => x.code === code) || {
                code,
                imgUrl: null,
                longName: code,
                shortName: code.toUpperCase(),
            }

            // Ignore if already selected.
            if (state.selected?.code === code)
                return {
                    ...state,
                    loading: false,
                }

            // University codes don't match!
            if (university.code !== code) console.warn('University code mismatch!')

            return {
                ...state,
                loading: false,
                selected: {
                    code,
                    university,
                    careers,
                },
            }
        }

        case 'set/loading':
            return {
                ...state,
                loading: action.payload,
            }

        case 'set/error':
            return {
                ...state,
                error: action.payload,
            }

        default:
            console.error('Unknown action: ', action)
            return state
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
    dispatch: {} as React.Dispatch<UniversityData.DispatchAction>,
    select: async (code: string | null) => {},
})
export default UniversityContext

type UniCtxProps = { children: any }

/** Handles automatic load of university list. */
export const UniversityProvider = memo(function UniversityProvider({ children }: UniCtxProps) {
    const [state, dispatch] = useReducer(universityDataReducer, initialUniversityData)
    const lastCode = useRef(state.selected?.code)
    lastCode.current = state.selected?.code

    /** Select a new university from a given code. */
    const select = useCallback(
        async (code: string | null) => {
            // If no code was given, select no pensum.
            if (!code) {
                dispatch({ type: 'set/selected', payload: null })
                return
            }

            // Don't do anything if university code didn't change...
            code = code?.toLowerCase()
            if (code === lastCode.current) {
                return
            }

            // Code was give, select fetch new pensum!
            dispatch({ type: 'set/loading', payload: true })
            try {
                const pensumList = await fetchCarreras(code)
                dispatch({ type: 'set/selected', payload: { code, data: pensumList } })
            } catch (err) {
                console.warn(`Unable to load pensums for ${code}: `, err)
                dispatch({
                    type: 'set/selected',
                    payload: {
                        code: code,
                        data: {
                            api: null,
                            university: code.toUpperCase(),
                            careers: [],
                        },
                    },
                })
            }
            return
        },
        [dispatch],
    )

    // onMount: load universities
    useEffect(() => {
        let ignore = false
        fetchUniversities()
            .then((unis) => {
                if (ignore) return
                const u = unis.universities.sort(sortByProp('longName'))
                dispatch({ type: 'set/universities', payload: u })
            })
            .catch((e) => {
                dispatch({ type: 'set/error', payload: e })
            })
            .finally(() => {
                dispatch({ type: 'set/loading', payload: false })
            })
        return () => {
            ignore = true
        }
    }, [])

    useEffect(() => {
        if (state.selected === null) {
            select('unapec')
        }
    }, [select, state.selected])

    return createElement(UniversityContext.Provider, { value: { state, dispatch, select } }, children)
})
