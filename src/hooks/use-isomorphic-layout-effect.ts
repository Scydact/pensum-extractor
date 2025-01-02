import { useEffect, useLayoutEffect } from 'react'

/** Custom hook that uses either useLayoutEffect or useEffect based on the environment (client-side or server-side). */
export const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect
