import { RefObject, useEffect, useRef } from 'react'

/**
 * Reuse the ref from forwardref
 * @param refs
 * @returns Reusable ref object
 * @src https://itnext.io/reusing-the-ref-from-forwardref-with-react-hooks-4ce9df693dd
 */
export function useCombinedRefs<T>(...refs: any[]) {
    const targetRef = useRef<T>(null)

    useEffect(() => {
        refs.forEach((ref) => {
            if (!ref) return

            if (typeof ref === 'function') {
                ref(targetRef.current)
            } else {
                ref.current = targetRef.current
            }
        })
    }, [refs])

    return targetRef as RefObject<T>
}
