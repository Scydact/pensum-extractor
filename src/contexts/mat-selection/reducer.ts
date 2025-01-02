import { objectMap } from '@/lib/sort-utils'
import { union } from '@/lib/set-utils'
import createDefaultState, { matSelectionModeTypes } from './default'

const TRACKER_STORAGE_KEY = import.meta.env.VITE_PENSUM_STORAGE_TRACKER_KEY || 'PENSUM_TRACKER'
const LEGACY_TRACKER_STORAGE_KEY = 'saveData'

/** Alias for save to storage */
function STS(state: MatSelection.Payload) {
    return matSelectionReducer(state, { type: 'saveToStorage' })
}

// IMPORTANT: Friendly remined that any method that modifies the state must call saveToStorage.
export function matSelectionReducer(state: MatSelection.Payload, action: MatSelection.Action): MatSelection.Payload {
    const cloneTracker = (tracker?: MatSelection.Tracker): MatSelection.Tracker => {
        if (!tracker) tracker = state.tracker

        const o: any = {}
        for (const [key, set] of Object.entries(tracker)) {
            o[key] = new Set(set)
        }
        return o
    }

    const { mode } = state

    switch (action.type) {
        case 'selectMode': {
            const newMode = action.payload || 'passed'

            return STS({
                ...state,
                mode: newMode,
            })
        }

        case 'select': {
            const mat = action.payload
            const tracker = cloneTracker()

            if (tracker[mode].has(mat)) {
                tracker[mode].delete(mat)
            } else {
                // Add to this tracker, and remove from the rest
                tracker[mode].add(mat)
                for (const [key, set] of Object.entries(tracker)) {
                    if (key !== mode) set.delete(mat)
                }
            }

            return STS({
                ...state,
                tracker,
            })
        }

        case 'selectPeriod': {
            const period = action.payload
            const tracker = cloneTracker()

            const matCount = period.length
            if (matCount === 0) return state

            // Check each tracker.
            const sortedTracker = objectMap(tracker, (x) => [] as string[])
            const untracked = [] as string[]

            for (const code of period) {
                let isTracked = false

                for (const [key, set] of Object.entries(tracker)) {
                    if (set.has(code)) {
                        ;(sortedTracker as any)[key].push(code)
                        isTracked = true
                    }
                }

                if (!isTracked) {
                    untracked.push(code)
                }
            }

            /**
             * Cases:
             * - All on main: remove all;
             * - All unselected: just add all
             * - Some holes: set holes only.
             * - All on both (none unselected): finish adding all (same as prev.)
             */
            const allOnMain = sortedTracker[mode].length === matCount
            const allUnselected = untracked.length === matCount
            const noneUnselected = untracked.length === 0
            const someUnselected = !allUnselected && !noneUnselected

            // Case 1: All on main -> remove all
            if (allOnMain) {
                period.forEach((code) => tracker[mode].delete(code))
            }
            // Case 3: Add only the unselected. Leave the rest intact.
            else if (someUnselected) {
                untracked.forEach((code) => tracker[mode].add(code))
            }
            // Case 2 & 4: Add to this set, don't remove from the other.
            else {
                for (const code of period) {
                    for (const [key, set] of Object.entries(tracker)) {
                        if (key === mode) set.add(code)
                        else set.delete(code)
                    }
                }
            }

            return STS({
                ...state,
                tracker,
            })
        }

        case 'passOnCourse': {
            if (state.tracker.course.size === 0) return state
            const tracker = cloneTracker()

            tracker.passed = union(tracker.passed, tracker.course)
            tracker.course.clear()

            return STS({
                ...state,
                tracker,
            })
        }

        // TRACKER ID STUFF
        /** Sets/renames the name of the current trackers. */
        case 'setTrackerID': {
            let newName: string | null

            // Simple check if string is valid.
            // If not valid (or empty), just set to null.
            // This is so the user can remove the tracker by just clearing an input form.
            if (typeof action.payload !== 'string') newName = null
            else {
                const t = action.payload.trim()
                newName = t === '' ? null : t
            }

            // Check if the newName is a prototype property
            // This is to avoid setting the tracker to something like 'toString'.
            if (
                typeof newName === 'string' &&
                state.storage[newName] && // Check if this value exists
                !state.storage.hasOwnProperty(newName) // Check if this value is from the prototype
            ) {
                throw RangeError(`Given name ${newName} is a prototype property!`)
            }

            // If there was a previous name, remove it so this action is equivalent to "renaming".
            const storage = { ...state.storage }
            if (state.currentName) delete storage[state.currentName]

            // saveToStorage will automatically copy the current tracker to the new tracker name.
            return STS({
                ...state,
                currentName: newName,
                storage,
            })
        }

        case 'copyTrackerID': {
            const { old: oldName, new: newName } = action.payload

            if (oldName === newName) return state

            const storage = { ...state.storage }
            const oldTracker = storage[oldName]

            // Nothing to copy!
            if (!oldTracker) return state
            storage[newName] = cloneTracker(oldTracker)

            // Replace currentName if needed
            // IMPORTANT: Remove this thing if you don't want auto-switching to the new tracker on copy.
            let currentName = state.currentName
            if (currentName === oldName) currentName = newName

            return STS({
                ...state,
                storage,
                currentName,
            })
        }

        case 'deleteTrackerID': {
            const name = action.payload

            if (!name || !state.storage[name]) return state

            // Do the deletion
            const storage = { ...state.storage }
            delete storage[name]

            // Replace currentName if needed
            let currentName = state.currentName
            if (currentName === name) currentName = null

            return STS({
                ...state,
                storage,
                currentName,
            })
        }

        // Filter options
        case 'toggleFilter': {
            const filter = new Set(state.filter)
            const x = action.payload

            if (filter.has(x)) filter.delete(x)
            else filter.add(x)

            return STS({
                ...state,
                filter,
            })
        }

        case 'setTracker': {
            return STS({
                ...state,
                tracker: action.payload,
            })
        }

        // TRACKER SAVE ACTIONS
        case 'saveToStorage': {
            if (state.currentName) {
                state.storage[state.currentName] = state.tracker
            }
            saveTrackerToLocalStorage(state)
            return state
        }

        case 'loadFromStorage': {
            let data = loadTrackerFromLocalStorage()

            // Load legacy data if no previous data was found.
            if (!data) {
                data = loadLegacyTrackerFromLocalStorage()
                if (data) saveTrackerToLocalStorage(data)
            }

            if (!data) return state
            return data
        }

        default:
            console.error('Unknown action "' + (action as any)?.type + '".')
            return state
    }
}

/** Default tracker */

/** Set of utils to convert the tracker's sets into arrays.
 * Used to save the sets to the localStorage. */
const JSONSetUtils = {
    replacer: function Set_toJSON(key: string, value: any) {
        if (typeof value === 'object' && value instanceof Set) {
            return [...value]
        }
        return value
    },

    reviver: function Set_fromJSON(key: string, value: any) {
        if (typeof value === 'object' && Array.isArray(value)) {
            return new Set(value)
        }
        return value
    },
}

function saveTrackerToLocalStorage(trackerState: MatSelection.Payload) {
    const json = JSON.stringify(trackerState, JSONSetUtils.replacer)
    localStorage.setItem(TRACKER_STORAGE_KEY, json)
}

function loadTrackerFromLocalStorage(): MatSelection.Payload | null {
    const str = localStorage.getItem(TRACKER_STORAGE_KEY)
    if (!str) return null

    const data: MatSelection.Payload = JSON.parse(str, JSONSetUtils.reviver)

    // Simple check for minimun structure
    if (
        !(
            // Negate to make it a type guard
            (
                data &&
                data.tracker &&
                typeof data.tracker.passed === 'object' &&
                data.tracker.passed instanceof Set &&
                data.storage
            )
        )
    ) {
        return null
    }

    // Return verified result
    return createPayloadWithDefaults(data)
}

/** Tries to load from the old saves from the original pensumExtractor. */
function loadLegacyTrackerFromLocalStorage(): MatSelection.Payload | null {
    type OldPayload = {
        currentCodeAtInputForm: string
        filterMode: {
            pending: boolean
            onCourse: boolean
            passed: boolean
        }
        saveVer: number
        selectMode: number
        userData: {
            onCourse: string[]
            passed: string[]
        }
    }

    const str = localStorage.getItem(LEGACY_TRACKER_STORAGE_KEY)
    if (!str) return null

    const olddata: OldPayload = JSON.parse(str)

    // Simple check for minimun structure
    if (!(typeof olddata === 'object' && olddata.saveVer === 6)) return null

    // Generate new object, copying old info
    const data: Partial<MatSelection.Payload> = {}

    // Filter
    if (olddata.filterMode) {
        const filter = new Set<any>()
        const pushIfFalse = (x: any, val: any) => {
            if (x === false) filter.add(val)
        }
        data.filter = filter

        pushIfFalse(olddata.filterMode.pending, null)
        pushIfFalse(olddata.filterMode.onCourse, 'course')
        pushIfFalse(olddata.filterMode.passed, 'passed')
    }

    // Select mode (cursor interaction mode)
    if (olddata.selectMode === 0) data.mode = 'passed'
    else if (olddata.selectMode === 1) data.mode = 'course'

    // Saved trackers
    if (olddata.userData) {
        data.tracker = {
            course: new Set(),
            passed: new Set(),
        }

        const addIfTracker = (arr: any, targetSet: Set<string>) => {
            if (Array.isArray(arr) && arr.every((x) => typeof x === 'string')) {
                arr.forEach((x) => targetSet.add(x))
            }
        }

        addIfTracker(olddata.userData.passed, data.tracker.passed)
        addIfTracker(olddata.userData.onCourse, data.tracker.course)
    }

    // Return verified result
    return createPayloadWithDefaults(data)
}

/** Validates the payload from the given, All props are verifier to be valid. */
function createPayloadWithDefaults(data: any): MatSelection.Payload {
    // Correct minimal structure
    /* 1. tracker */
    /* 2. mode. */
    /* 3. tracker name on storage. */
    /* 4. storage for all the saved trackers. */
    /* 5. filter. */

    const base = createDefaultState()

    const tracker = {
        ...base.tracker,
        ...data.tracker,
    }

    const mode = matSelectionModeTypes.includes(data.mode) ? data.mode : base.mode

    const currentName = typeof data.currentName === 'string' ? data.currentName : null

    let storage: MatSelection.Payload['storage'] = base.storage
    if (typeof data.storage === 'object') {
        storage = Object.fromEntries(
            Object.entries(data.storage).filter(
                ([key, val]) =>
                    typeof key === 'string' && // Key is a string
                    // If the key is from the prototype (eg. 'toString', don't include it.)
                    storage[key] &&
                    !storage.hasOwnProperty(key) &&
                    // Verify value is a Set of strings
                    val instanceof Set &&
                    [...val].every((code) => typeof code === 'string'),
            ) as Array<[string, MatSelection.Tracker]>,
        )
    }

    const filter: MatSelection.Payload['filter'] = data.filter instanceof Set ? data.filter : base.filter

    return {
        tracker,
        mode,
        currentName,
        storage,
        filter,
    }
}
