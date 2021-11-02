
export const LOCAL_STORAGE_PREFIX = 'pensumextractor';
export const LOCAL_SERVER_PREFIX = './pensum';

/**
 * Tries to load from the given pensum code from a university.
 * 
 * Lookup order:
 *  1. `localStorage`
 *  2. local data (`pensum/university/CODE.json`)
 *  3. from url
 */
export async function fetchPensumFromCode(university: string, code: string) {
    let pensum: DataJson.Pensum | null;

    pensum = await fetchPensumFromCode_localStorage(university, code);
    if (pensum) return pensum;

    pensum = await fetchPensumFromCode_localData(university, code);
    if (pensum) return pensum;

    return null;
}

/** 
 * Tries to fetch the pensum from `localStorage`.
 * 
 * **Important note!** This only does fetch. The saving to `localStorage` will be done at window.unload.
 */
export async function fetchPensumFromCode_localStorage(university: string, code: string) {
    const key = [LOCAL_STORAGE_PREFIX, university, code].join('_');
    const pensumData = localStorage.getItem(key);

    if (!pensumData) return null; // Could not fetch

    // Parse fetched data
    // TODO: CHECK IF DATA IS VALID
    const pensum = JSON.parse(pensumData) as DataJson.Pensum;
    return pensum;
}

/** Tries to fetch the pensum from `./pensum/$UNIVERSIDAD.` */
export async function fetchPensumFromCode_localData(university: string, code: string) {
    const path = [LOCAL_SERVER_PREFIX, university, code].join('/') + '.json';
    const response = await fetch(path);
    const pensumData: DataJson.Pensum = await response.json();

    if (!pensumData) return null; // Could not fetch

    console.log(pensumData);

    // TODO: CHECK IF DATA IS VALID
    // Parse fetched data
    const pensum = pensumData;
    return pensum;
}