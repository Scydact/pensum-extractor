import ActivePensumContext from '@/contexts/active-pensum'
import { activePensumReducer } from '@/contexts/active-pensum/reducer'
import { createContext, createElement, memo, useContext, useEffect, useRef } from 'react'
import useUndo, { Actions } from '@/hooks/use-undo'

type DeveloperModeContextProps = {
    pensum: Pensum.Pensum
    commands: Omit<Actions<Pensum.Pensum>, 'set'> & {
        new: Function
        set: (newPresent: Pensum.Pensum, ignore?: boolean) => void
    }
}

function getNewPensum() {
    return activePensumReducer(null as any, { type: 'new' }).pensum as Pensum.Pensum
}

/** Context for the current loaded pensum. */
export const DeveloperModeContext = createContext(null as any as DeveloperModeContextProps)
export default DeveloperModeContext

type Props = { children: any }

// this double naming thing is so the React chrome extension gets the name correctly.
export const DeveloperModeProvider = memo(function DeveloperModeProvider({ children }: Props) {
    const {
        state: { pensum: contextPensum },
        dispatch: dispatchContextPensum,
    } = useContext(ActivePensumContext)
    const [history, commands] = useUndo(contextPensum as Pensum.Pensum, { useCheckpoints: true }) // TODO: ALWAYS HAVE PENSUM!
    const wasInitialized = useRef(false)

    // Update ACTIVE CONTEXT from DEV.
    // Skip first update, or ACTIVE will become empty on reload.
    useEffect(() => {
        if (!wasInitialized.current) {
            wasInitialized.current = true
        } else {
            dispatchContextPensum({ type: 'set', payload: history.present })
        }
    }, [history.present])

    // Update DEV from ACTIVE CONTEXT.
    useEffect(() => {
        if (contextPensum && history.present !== contextPensum && !history.past.includes(contextPensum)) {
            commands.set(contextPensum)
        }
    }, [contextPensum])

    const value = {
        pensum: history.present || getNewPensum(),
        commands: {
            ...commands,
            set: (newPresent: Pensum.Pensum, ignore = false) => commands.set(newPresent, !ignore),
            new: () => commands.set(getNewPensum()),
        },
    }

    return createElement(DeveloperModeContext.Provider, { value }, children)
})
