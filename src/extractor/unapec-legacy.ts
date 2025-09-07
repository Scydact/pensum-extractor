import { convertPensum2 } from '@/functions/pensum-converter'
import { japaneseDateFormat } from '@/lib/format-utils'

/** Fetches a pensum from UNAPEC. */
export default async function fetchPensum(
    code: string,
    apiUrl = 'https://servicios.unapec.edu.do/pensum/Main/Detalles/',
) {
    let url = apiUrl + code
    const proxyUrl = JSON.parse(localStorage.getItem(import.meta.env.VITE_PENSUM_STORAGE_CORSPROXY_KEY) ?? '""')
    if (proxyUrl) {
        url = proxyUrl + url
    }
    console.log('Fetching URL ', url)

    const opts: RequestInit = { cache: 'force-cache' }
    const text = await fetch(url, opts).then((response) => response.text())

    if (!text) return null

    const parser = new DOMParser()
    const doc = parser.parseFromString(text, 'text/xml')

    const pensum = extractPensum(doc, url)
    return pensum
}

/**
 * Extracts the pensum data from the given DOM node.
 * @param node DOM node. Can be made from the GET request using `new DOMParser().parseFromString(msg, 'text/xml');`
 */
export function extractPensum(node: Document, url: string) {
    // Legacy pensum
    try {
        const old = legactExtractPensum(node)
        const pensum = convertPensum2(old, 'unapec')

        pensum.fetchDate = japaneseDateFormat(new Date())
        pensum.src = {
            type: 'online',
            date: pensum.fetchDate,
            url,
        }

        return pensum
    } catch (err) {
        console.error(err)
        return null
    }
}

/** Directly taken from the original project */
export function legactExtractPensum(node: Document): Pensum.Save.Legacy.Pensum2 {
    const out: Pensum.Save.Legacy.Pensum2 = {
        carrera: '',
        codigo: '',
        vigencia: '',
        infoCarrera: [],
        cuats: [],
        version: 2,
    }

    // Verify if pensum is actually valid data
    if (
        node.getElementsByClassName('contPensum').length === 0 ||
        node.getElementsByClassName('contPensum')[0].children.length < 2
    ) {
        throw new Error('Document has no pensum inside!')
    }

    // Extract basic data
    const cabPensum = node.getElementsByClassName('cabPensum')[0]
    if (!cabPensum) throw new Error('Unable to get table element.')

    out.carrera = cabPensum?.firstElementChild?.textContent?.trim() || ''

    const pMeta = cabPensum.getElementsByTagName('p')[0].children
    out.codigo = pMeta[0]?.textContent?.trim() || ''
    out.vigencia = pMeta[1]?.textContent?.trim() || ''

    if (out.carrera === '') throw new Error('Unable to get pensum name')
    if (out.codigo === '') throw new Error('Unable to get pensum code')

    // Extract infoCarrera
    const infoCarrera = node.getElementsByClassName('infoCarrera')[0].children
    for (let i = 0; i < infoCarrera.length; ++i) {
        out.infoCarrera.push(infoCarrera[i]?.textContent?.replace(/\n/g, ' ')?.trim() || '')
    }

    // Extract cuats
    const cuatrim = node.getElementsByClassName('cuatrim')

    for (let i = 0; i < cuatrim.length; ++i) {
        /**
         * @type {HTMLTableElement}
         */
        const currentCuatTable = cuatrim[i]
        const rows = currentCuatTable.children

        const outCuat: Pensum.Save.Legacy.Mat[] = []

        for (let j = 1; j < rows.length; ++j) {
            const outMat: Pensum.Save.Legacy.Mat = {
                codigo: '',
                asignatura: '',
                creditos: 0,
            }

            const prereq: string[] = []
            const prereqExtra: string[] = []

            outMat.prereq = prereq
            outMat.prereqExtra = prereqExtra

            const currentRows = rows[j].children
            outMat.codigo = currentRows[0]?.textContent?.trim() || ''
            outMat.asignatura = currentRows[1]?.textContent?.trim() || ''
            outMat.creditos = parseFloat(currentRows[2]?.textContent || '-Infinity')

            if (outMat.codigo === '') throw new Error(`Unable to get code for mat ${outMat.asignatura} @ cuat ${i + 1}`)
            if (outMat.asignatura === '') throw new Error(`Unable to get name for mat ${outMat.codigo} @ cuat ${i + 1}`)
            if (outMat.creditos === -Infinity)
                throw new Error(`Unable to get creds for mat ${outMat.codigo}:${outMat.asignatura} @ cuat ${i + 1}`)

            // Prerequisitos
            const splitPrereq = (currentRows[3]?.textContent || '')
                .replace(/\n/g, ',')
                .split(',')
                .map((x) => x.trim())
                .filter((e) => e !== '')

            for (let i = 0; i < splitPrereq.length; i++) {
                const a = splitPrereq[i]
                if (a.length < 8) prereq.push(a)
                else prereqExtra.push(a)
            }

            outCuat.push(outMat)
        }
        out.cuats.push(outCuat)
    }
    return out
}
