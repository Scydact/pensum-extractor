/**
 * This context is used to store the react nodes of each pensum row.
 * Used to scroll a specific mat into view.
 *
 * This thing probably is a memory leaks when there's a lot of pensum changes,
 * since new mats will be added while keeping the old mats empty refs.
 */

import { createContext, createElement, memo, RefObject, useCallback, useRef } from 'react'

type mapArg = RefObject<HTMLElement>

type PensumRowNodesContextProps = {
    /** Map that contains pensum row references.  */
    map: RefObject<Map<string, mapArg>>
    /** Scrolls to the pensum row of the given mat code. */
    scrollToRow: (code: string) => void
    /** Updates the row reference on map. */
    updateNode: (code: string, node: mapArg) => void
}

const defaultContext: PensumRowNodesContextProps = {
    map: { current: new Map() },
    scrollToRow: () => {},
    updateNode: () => {},
}

export const PensumRowNodesContext = createContext(defaultContext)

type Props = { children: any }

export const PensumRowNodesProvider = memo(function PensumRowNodesProvider({ children }: Props) {
    const map = useRef(new Map())

    const updateNode: PensumRowNodesContextProps['updateNode'] = useCallback((code, node) => {
        map.current.set(code, node)
    }, [])

    const scrollToRow: PensumRowNodesContextProps['scrollToRow'] = useCallback((code) => {
        setTimeout(() => {
            // Without this timeout, scrollIntoView won't work on navigation URL changes.
            const n = map.current.get(code)
            if (n) {
                n.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
                n.current?.classList.remove('highlight-row')
                n.current?.classList.add('highlight-row')
                setTimeout(() => n?.current?.classList.remove('highlight-row'), 3e3)
            }
        }, 0)
    }, [])

    return createElement(PensumRowNodesContext.Provider, { value: { map, scrollToRow, updateNode } }, children)
})
