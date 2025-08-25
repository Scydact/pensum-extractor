import { download } from '@/lib/file-utils'
import { fetchCarreras } from '../metadata-fetch'
import { fetchPensumFromCode_localData } from '../pensum-fetch'

function asyncTimeout(ms = 0) {
    return new Promise((resolve) => setTimeout(resolve, ms))
}

/** Fetch all old-format JSON pensums and redownload them as new format JSON. */
export default async function downloadAllAsNewFormat() {
    const UNIVERSITY = 'unapec'
    const index = await fetchCarreras(UNIVERSITY)

    // const codes = ['MER11', 'PUB11', 'LES11', 'LIE11', 'LMS11', 'TAF11']
    // index.careers = codes.map((code) => ({ code, name: '', school: '' }))

    console.log(`Downloading ${index.careers.length} pensums`)
    for (let i = 0; i < index.careers.length; i++) {
        const career = index.careers[i]
        const { code } = career
        const pensum = await fetchPensumFromCode_localData(UNIVERSITY, code)
        if (pensum) {
            console.log(`Download pensum ${code} [${i + 1}/${index.careers.length}]`)
            download(JSON.stringify(pensum, null, 2), `${code}.json`)
            await asyncTimeout(1000)
        } else {
            console.log(`Failed to load pensum ${code} [${i + 1}/${index.careers.length}]`)
        }
    }
}
