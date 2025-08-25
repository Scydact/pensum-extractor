import { useRef } from 'react'

/**
 * Will be true only when the component is re-rendered and the given value has changed.
 *
 * Is the same as:
 * @example
 * const current = useRef(null);
 * const previous = usePrevious(current);
 * const hasChanged = current !== previous;
 */
export function useHasChanged<T>(value: T): boolean {
    const currentRef = useRef(value)
    const previousRef = useRef<T>(undefined)
    if (currentRef.current !== value) {
        previousRef.current = currentRef.current
        currentRef.current = value
        return true
    }
    return false
}
