import { difference } from '@/lib/set-utils'

// HELPER FUNCTIONS
/** Checks if b is a pre/postreq of a. */
const isReqOf = (a: string, b: string, map: Map<string, string[]>) => {
    const list = map.get(a)
    if (!list) return false
    return list.includes(b)
}
/** Registers b as a post/prereq of a. */
const addReq = (a: string, b: string, map: Map<string, string[]>) => {
    const list = map.get(a)
    if (list) list.push(b)
    else map.set(a, [b])
}
/** Removes the association of b being a pre/postreq of a. */
const removeReq = (a: string, b: string, map: Map<string, string[]>) => {
    const list = map.get(a)
    if (!list) return false
    const index = list.indexOf(b)
    list.splice(index, 1)
    if (list.length === 0) {
        map.delete(a)
    }
}

/** Gets all the extra data of a pensum's mats. */
export default function processPensumMats(pensum: Pensum.Pensum | null): ActivePensum.MatExtraData {
    if (!pensum)
        return {
            list: [],
            periodMap: new Map(),
            codeMap: new Map(),
            postreqMap: new Map(),
            coreqMap: new Map(),
            looseUnhandled: new Set(),
        }

    const matMap = new Map<string, Pensum.Mat>()
    const matPeriod = new Map<string, number>()
    const matPostreq = new Map<string, string[]>()
    const matCoreq = new Map<string, string[]>()
    const mats: Pensum.Mat[] = []
    const warnings: { code: string; text: string }[] = []

    // Helper functions

    const processMat = (mat: Pensum.Mat, periodNum: number) => {
        if (matMap.has(mat.code)) {
            warnings.push({ code: mat.code, text: 'was already registered!' })
        }
        // Add to all lists/maps/sets
        matMap.set(mat.code, mat)
        matPeriod.set(mat.code, periodNum)
        mats.push(mat)
    }

    // Loose mats have period index 0.
    pensum.loose.forEach((mat) => processMat(mat, 0))
    // Normal mats have period index starting from 1.
    pensum.periods.forEach((period, periodIdx) => {
        period.forEach((mat) => processMat(mat, periodIdx + 1))
    })

    // After all mats are registered, get postreqs
    for (const mat of mats) {
        for (const prereq of mat.req) {
            if (typeof prereq === 'string') {
                // Only select codes, not {text: ''}
                addReq(prereq, mat.code, matPostreq)
            }
        }
    }

    // Get unhandled loose mats
    // Codes that are prereqs to something but do not exist on mats.
    const matSet = new Set(matMap.keys())
    const hasPostreqSet = new Set(matPostreq.keys())
    const looseUnhandled = difference(hasPostreqSet, matSet)

    // Get coreqs
    // Codes that are mutual prereqs
    for (const mat of mats) {
        for (const prereq of mat.req) {
            if (typeof prereq === 'string') {
                // Only select codes, not {text: ''}
                // Check mutual postreq
                if (isReqOf(mat.code, prereq, matPostreq) && isReqOf(prereq, mat.code, matPostreq)) {
                    removeReq(mat.code, prereq, matPostreq)
                    removeReq(prereq, mat.code, matPostreq)
                    addReq(mat.code, prereq, matCoreq)
                    addReq(prereq, mat.code, matCoreq)
                }
            }
        }
    }

    // Play all the warnings
    for (const warning of warnings) {
        console.warn(`Warning at pensum-get-extras [${warning.code}]: ${warning.text}`)
    }

    return {
        /** List of all mats */
        list: mats,
        /** Map: code<string> -> period<number> */
        periodMap: matPeriod,
        /** Map : code<string> -> mat<Mat> */
        codeMap: matMap,
        /** Map: code<string> -> postreqs<string> */
        postreqMap: matPostreq,
        /** Map: code<string> -> postreqs<string> */
        coreqMap: matCoreq,
        /** List of mats that are prereqs but are not registered. */
        looseUnhandled: looseUnhandled,
    }
}
