import { validatePensum } from '@/functions/pensum-converter'
import processPensumMats from '@/functions/pensum-get-extras'
import pensumToSavePensum from '@/functions/pensum-save'
import { japaneseDateFormat, westernDateFormat } from '@/lib/format-utils'

const PENSUM_STORAGE_KEY = import.meta.env.VITE_PENSUM_STORAGE_PENSUM_KEY || 'PENSUM_DATA'
const LEGACY_PENSUM_STORAGE_KEY = 'pensumData'

export function savePensumToLocalStorage(pensum: Pensum.Pensum | null) {
    if (!pensum) {
        localStorage.removeItem(PENSUM_STORAGE_KEY)
        return
    }

    const save = pensumToSavePensum(pensum)
    localStorage.setItem(PENSUM_STORAGE_KEY, JSON.stringify(save))
}

export function loadPensumFromLocalStorage(): Pensum.Pensum | null {
    const pensumData = localStorage.getItem(PENSUM_STORAGE_KEY)
    if (!pensumData) return null // Could not fetch

    // Parse fetched data
    // TODO: CHECK IF DATA IS VALID
    const pensum = JSON.parse(pensumData) as Pensum.Save.Pensum
    const loadedPensum = validatePensum(pensum, pensum.institution)

    return loadedPensum
}

export function loadLegacyPensumFromLocalStorage(): Pensum.Pensum | null {
    const pensumData = localStorage.getItem(LEGACY_PENSUM_STORAGE_KEY)
    if (!pensumData) return null // Could not fetch

    // Parse fetched data
    // TODO: CHECK IF DATA IS VALID
    const pensum = JSON.parse(pensumData) as Pensum.Save.Legacy.Pensum2
    const loadedPensum = validatePensum(pensum, 'unapec')

    return loadedPensum
}

/** Applies the necesary preprocessing to the pensum and returns a payload object for the context. */
export function createPayload(pensum: ActivePensum.Payload['pensum']): ActivePensum.Payload {
    return {
        pensum,
        matData: processPensumMats(pensum),
        error: null,
        loading: false,
    }
}

export function activePensumReducer(state: ActivePensum.Payload, action: ActivePensum.Action): ActivePensum.Payload {
    if (action.debug && import.meta.env.DEV) {
        console.log('[ActivePensum] %s', action.debug, {
            state,
            actionType: action.type,
            payload: (action as any).payload,
        })
    }
    switch (action.type) {
        case 'clear':
            // savePensumToLocalStorage(null); // Dont clear save!
            return createPayload(null)

        case 'set':
            savePensumToLocalStorage(action.payload)
            return createPayload(action.payload)

        case 'load/fromSave': {
            let pensum = loadPensumFromLocalStorage()

            // new pensum not found. Attempt to load legacy pensum.
            if (!pensum) {
                pensum = loadLegacyPensumFromLocalStorage()
                savePensumToLocalStorage(pensum)
            }

            return createPayload(pensum)
        }

        // Case for 'load' is handled on the Provider, since its async!

        case 'error':
            console.error(action.payload)
            return {
                ...state,
                error: action.payload,
                loading: false,
            }

        case 'loading':
            return {
                ...state,
                loading: true,
            }

        case 'new':
            return createPayload({
                career: '*Nombre de carrera*',
                code: 'C0D1G0',
                fetchDate: westernDateFormat(new Date()),
                publishDate: westernDateFormat(new Date()),
                info: ['Descripcion de la carrera', 'Creditos: 30', 'Requisitos: Aprobar deporte. Pasantia.'],
                institution: 'unapec',
                loose: [],
                periodType: { abbr: 'cuat', name: 'cuatrimestre', two: 'ct' },
                periods: [],
                src: { type: 'online', date: japaneseDateFormat(new Date()), url: null },
                version: 2,
            })

        default:
            console.error('Unknown action "' + action.type + '".')
            return state
    }
}
