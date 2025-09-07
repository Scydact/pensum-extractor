export type Id = number | string
export type DraggableId = Id
export type DroppableId = Id
export type DraggableLocation = {
    droppableId: DroppableId
    index: number
}

/** Moves a mat in the pensum. Returns the pensum if the movement was valid. */
export default function moveMat(pensum: Pensum.Pensum, from: DraggableLocation, to: DraggableLocation) {
    const mat = extractMat(pensum, from)
    if (!mat) {
        throw new Error(`Mat at given location does not exist: period=${from.droppableId}; index=${from.index}`)
    }
    const newPeriod = insertMat(pensum, to, mat)
    if (newPeriod) {
        return pensum // Only return if change was valid.
    }
}

/** Locate where a mat currently is. */
export function locateMat(pensum: Pensum.Pensum, code: Pensum.Mat['code']): DraggableLocation | undefined {
    // Check loose first
    const idx = pensum.loose.findIndex((mat) => mat.code === code)
    if (idx != -1) {
        return {
            droppableId: -1,
            index: idx,
        }
    }
    // Check the rest of the pensum
    for (let i = 0; i < pensum.periods.length; i++) {
        const idx = pensum.periods[i].findIndex((mat) => mat.code === code)
        if (idx != -1) {
            return {
                droppableId: i,
                index: idx,
            }
        }
    }
}

/** Extracts a mat from the given location in the pensum. */
export function extractMat(pensum: Pensum.Pensum, target: DraggableLocation): Pensum.Mat | undefined {
    // Additional period case
    if (typeof target.droppableId === 'string') {
        const periodDetails = pensum.additionalPeriods[target.droppableId]
        const mats = Array.from(periodDetails.mats)
        pensum.additionalPeriods[target.droppableId] = { ...periodDetails, mats }
        const mat = mats.splice(target.index, 1)[0]
        return mat
    }

    // Regular period case
    const idx = ~~target.droppableId - 1
    let period: Pensum.Mat[]
    if (idx == -1) {
        // Is this loose? (period == 0)
        period = Array.from(pensum.loose)
        pensum.loose = period
    } else {
        // This is a regular period (period >= 1)
        period = Array.from(pensum.periods[idx])
        pensum.periods[idx] = period
    }
    const mat = period.splice(target.index, 1)[0]
    return mat
}

/** Inserts a mat at the given location in the pensum. */
export function insertMat(pensum: Pensum.Pensum, target: DraggableLocation, mat: Pensum.Mat): Pensum.Mat[] | undefined {
    if (!mat) return
    // Additional period case
    if (typeof target.droppableId === 'string') {
        const periodDetails = pensum.additionalPeriods[target.droppableId]
        periodDetails.mats = insertMatAtPeriod(periodDetails.mats, mat, target.index)
        return periodDetails.mats
    }

    // Regular period case
    const idx = ~~target.droppableId - 1
    if (idx == -1) {
        pensum.loose = insertMatAtPeriod(pensum.loose, mat, target.index)
        return pensum.loose
    } else {
        pensum.periods[idx] = insertMatAtPeriod(pensum.periods[idx], mat, target.index)
        return pensum.periods[idx]
    }
}

/** [internal] Inserts a mat int the given period, returns the period. */
function insertMatAtPeriod(period: Pensum.Mat[], mat: Pensum.Mat, index: number): Pensum.Mat[] {
    return [...period.slice(0, index), mat, ...period.slice(index)]
}

/** Gets the period from the given pensum. */
export function getPeriod(pensum: Pensum.Pensum, periodIndex: number | string) {
    if (typeof periodIndex === 'string') {
        return pensum.additionalPeriods[periodIndex].mats
    }
    const idx = ~~periodIndex - 1
    if (idx == -1) {
        return pensum.loose
    } else {
        return pensum.periods[idx]
    }
}

/** Updates the period on the pensum. */
export function setPeriod(pensum: Pensum.Pensum, periodIndex: number | string, period: Pensum.Mat[]): Pensum.Pensum {
    if (typeof periodIndex === 'string') {
        if (!(periodIndex in pensum.additionalPeriods)) {
            pensum.additionalPeriods[periodIndex] = { description: '', electiveCode: '', mats: [] }
        }
        pensum.additionalPeriods[periodIndex].mats = period
        return pensum
    }
    const idx = ~~periodIndex - 1
    if (idx == -1) {
        pensum.loose = period
    } else {
        pensum.periods = Array.from(pensum.periods)
        pensum.periods[idx] = period
    }
    return pensum
}

/** Insert a period at the given index */
export function insertPeriod(pensum: Pensum.Pensum, periodIndex: number, period: Pensum.Mat[]): Pensum.Pensum {
    const idx = ~~periodIndex - 1
    if (idx == -1) {
        throw new Error('Cannot insert a new loose period (index == 0)')
    }
    pensum.periods = [...pensum.periods.slice(0, idx), period, ...pensum.periods.slice(idx)]
    return pensum
}

/** Find the mat on the given pensum. */
export function findMat(pensum: Pensum.Pensum, code: string): Pensum.Mat | undefined {
    const periods = [
        ...pensum.periods,
        ...Object.values(pensum.additionalPeriods).map((x) => x.mats),
        pensum.loose,
    ].flat()
    return periods.find((mat) => mat.code === code)
}

/** Find the location of a mat. */
export function findMatLocation(pensum: Pensum.Pensum, code: string): DraggableLocation | undefined {
    // Find in additional mats
    for (const [periodName, periodDetails] of Object.entries(pensum.additionalPeriods)) {
        const period = periodDetails.mats
        const idx = period.findIndex((mat) => mat.code === code)
        if (idx !== -1) {
            return {
                droppableId: periodName,
                index: idx,
            }
        }
    }
    // Find in loose
    const idx = pensum.loose.findIndex((mat) => mat.code === code)
    if (idx !== -1) {
        return {
            droppableId: 0,
            index: idx,
        }
    }
    // Find in regular periods
    for (let i = 0; i < pensum.periods.length; i++) {
        const period = pensum.periods[i]
        const idx = period.findIndex((mat) => mat.code === code)
        if (idx !== -1) {
            return {
                droppableId: i + 1,
                index: idx,
            }
        }
    }
}
