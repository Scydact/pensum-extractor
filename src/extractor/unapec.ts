import { japaneseDateFormat } from '@/lib/format-utils'

const UNAPEC_API_URL = 'https://apiestudiante.azurewebsites.net/pensum/'

/** Fetches a pensum from UNAPEC. */
export default async function fetchPensum(code: string, apiUrl = UNAPEC_API_URL) {
    let url = apiUrl + code.toUpperCase()
    const proxyUrl = JSON.parse(localStorage.getItem(import.meta.env.VITE_PENSUM_STORAGE_CORSPROXY_KEY) ?? '""')
    if (proxyUrl) {
        url = proxyUrl + url
    }
    console.log('Fetching URL ', url)

    const json = await fetch(url).then((response) => response.json())

    try {
        const pensum = extractPensum(json, url, code)
        return pensum
    } catch (err) {
        console.warn(`Failed to extract pensum: ${err}`)
        return null
    }
}

/** Shape of each mat in the API response.  */
type ApiMat = {
    /**
     * Cuatrimestre de esta materia.
     * @example "IEL CUATRIMESTRE 10"
     */
    cuatrimestre: string

    /**
     * Codigo de asignatura
     * @example "ING113"
     */
    codigo_asignatura: string

    /**
     * Nombre de asignatura
     * @example "AUTOMATIZACION Y ROBOTICA Y LABORATORIO"
     */
    asignatura: string

    /**
     * Creditos de esta materia
     * @example "2"
     */
    creditos: string

    /**
     * Prerequisitos de esta materia
     * @example
     * "" // Sin prerequisitos
     * "IND423" // Una materia
     * "ING720, MAT410" // Dos materias
     * "IND500 - 50% de los créditos aprobados" // Prerequisito y condicion
     */
    prerequisito: string

    /**
     * Numero de secuancia de esta asignatura dentro del cuatrimestre
     * Suele ser un numero ascendente empezando desde el 1
     * @example
     * "1"
     * "2"
     * "8"
     * "16"
     */
    asignatura_secuencia: string
}

/**
 * Extracts the pensum data from the given DOM node.
 * @param response JSON API response.
 */
export function extractPensum(response: any, url: string, code: string): Pensum.Pensum {
    if (!Array.isArray(response)) throw new Error('Response must be an array')
    if (!response.length) throw new Error('Pensum has no registered Mats; is the pensum code valid?')

    const today = japaneseDateFormat(new Date())
    const out: Pensum.Pensum = {
        version: Number(import.meta.env.VITE_PENSUM_FORMAT_VERSION),
        institution: 'unapec',
        career: '',
        code: code.toUpperCase(),
        publishDate: '',
        fetchDate: today,
        info: [],
        src: {
            type: 'fetch',
            url,
            date: today,
        },
        periodType: {
            name: 'Cuatrimestre',
            abbr: 'Cuat',
            two: 'Ct',
        },
        loose: [],
        periods: [],
        additionalPeriods: {},
    }

    /** Might be a loose array... We need to rectify later. */
    const foundPeriods: Record<string, Pensum.Mat>[] = []
    for (const apiMat of response as ApiMat[]) {
        // Extract the requirements
        const [prereqStr, ...prereqConditionsStr] = apiMat.prerequisito.split('-')
        const prereqs = prereqStr
            .split(',')
            .map((x) => x.trim())
            .filter(Boolean)
        const prereqConditions = prereqConditionsStr
            .join('-')
            .split(',')
            .map((x) => x.trim())
            .filter(Boolean)
            .map((x) => ({ text: x }))

        // Extract the rest of this mat object
        const extractedMat: Pensum.Mat = {
            code: apiMat.codigo_asignatura,
            cr: parseInt(apiMat.creditos),
            name: apiMat.asignatura,
            req: [...prereqs, ...prereqConditions],
        }

        // Extract the period number "cuatrimestre": "ISO CUATRIMESTRE 1" --> (1)
        const period = parseInt(apiMat.cuatrimestre.split(' ').slice(-1)[0]) - 1
        // Create a new map for this period
        if (!foundPeriods[period]) foundPeriods[period] = {}
        // Warn if mat already exists
        if (extractedMat.code in foundPeriods[period]) {
            console.log('Mat already exists!', {
                period,
                existing: foundPeriods[period][extractedMat.code],
                new: extractedMat,
            })
        }
        // Add the mat to the period
        foundPeriods[period][extractedMat.code] = extractedMat
    }

    // Filter to avoid any issues with the sparce array.
    out.periods = foundPeriods.filter(Boolean).map((x) => Object.values(x))

    return out
}
