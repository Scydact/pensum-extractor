import { RefObject, useEffect } from 'react'

/**
 * Will automatically toggle the given class to rowRef when clicableRef is hovered.
 * @param className Class to add/remove when hovering
 * @param rowRef Element to toggle the class on
 * @param clickableRef Element that will trigger the hovering. By default will be the same rowRef element.
 */
export function useClassOnHover<T extends HTMLElement, U extends HTMLElement>(
    className: string,
    rowRef: RefObject<T>,
    clickableRef?: RefObject<T | U>,
) {
    useEffect(() => {
        const cbMouseEnter = () => {
            rowRef.current?.classList.add(className)
        }
        const cbMouseLeave = () => {
            rowRef.current?.classList.remove(className)
        }

        if (!clickableRef) clickableRef = rowRef
        const clickable = clickableRef.current

        if (!clickable) return

        clickable.addEventListener('mouseenter', cbMouseEnter)
        clickable.addEventListener('mouseleave', cbMouseLeave)
        return () => {
            clickable.removeEventListener('mouseenter', cbMouseEnter)
            clickable.removeEventListener('mouseleave', cbMouseLeave)
        }
    }, [rowRef, clickableRef])
}
