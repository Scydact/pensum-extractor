import { convertPensum2 } from "functions/pensum-converter";
import fetchCORS from "lib/fetch-cors";
import { japaneseDateFormat } from "lib/format-utils";

/** Fetches a pensum from UNAPEC. */
export default async function fetchPensum(
  code: string,
  requestCallback: Parameters<typeof fetchCORS>[2],
  api_url = 'https://servicios.unapec.edu.do/pensum/Main/Detalles/') {
  const url = api_url + code;

  const opts: RequestInit = { cache: 'force-cache' };
  const text = await fetchCORS(url, opts, requestCallback);

  if (!text) return null;

  const parser = new DOMParser();
  const doc = parser.parseFromString(text, 'text/xml');

  const pensum = extractPensum(doc, url);
  return pensum;
}

/**
 * Extracts the pensum data from the given DOM node.
 * @param node DOM node. Can be made from the GET request using `new DOMParser().parseFromString(msg, 'text/xml');`
 */
export function extractPensum(node: Document, url: string) {
  // Legacy pensum
  try {
    const old = legactExtractPensum(node);
    const pensum = convertPensum2(old, 'unapec');

    pensum.fetchDate = japaneseDateFormat(new Date());
    pensum.src = {
      type: 'online',
      date: pensum.fetchDate,
      url,
    }

    return pensum;
  } catch (err) {
    console.error(err);
    return null;
  }
}

/** Directly taken from the original project */
export function legactExtractPensum(node: Document): Pensum.Save.Legacy.Pensum2 {
  let out: Pensum.Save.Legacy.Pensum2 = {
    carrera: '',
    codigo: '',
    vigencia: '',
    infoCarrera: [],
    cuats: [],
    version: 2,
  };

  // Verify if pensum is actually valid data
  if (
    node.getElementsByClassName('contPensum').length === 0 ||
    node.getElementsByClassName('contPensum')[0].children.length < 2
  ) {
    throw new Error('Document has no pensum inside!');
  }

  // Extract basic data
  var cabPensum = node.getElementsByClassName('cabPensum')[0];
  if (!cabPensum) throw new Error('Unable to get table element.');

  out.carrera = cabPensum?.firstElementChild?.textContent?.trim() || '';

  var pMeta = cabPensum.getElementsByTagName('p')[0].children;
  out.codigo = pMeta[0]?.textContent?.trim() || '';
  out.vigencia = pMeta[1]?.textContent?.trim() || '';

  if (out.carrera === '') throw new Error('Unable to get pensum name');
  if (out.codigo === '') throw new Error('Unable to get pensum code');

  // Extract infoCarrera
  var infoCarrera = node.getElementsByClassName('infoCarrera')[0].children;
  for (let i = 0; i < infoCarrera.length; ++i) {
    out.infoCarrera.push(
      infoCarrera[i]?.textContent?.replace(/\n/g, ' ')?.trim() || ''
    );
  }

  // Extract cuats
  var cuatrim = node.getElementsByClassName('cuatrim');

  for (let i = 0; i < cuatrim.length; ++i) {
    /**
     * @type {HTMLTableElement}
     */
    let currentCuatTable = cuatrim[i];
    let rows = currentCuatTable.children;

    let outCuat: Pensum.Save.Legacy.Mat[] = [];

    for (let j = 1; j < rows.length; ++j) {
      let outMat: Pensum.Save.Legacy.Mat = {
        codigo: '',
        asignatura: '',
        creditos: 0,
      };

      const prereq: string[] = [];
      const prereqExtra: string[] = [];

      outMat.prereq = prereq;
      outMat.prereqExtra = prereqExtra;


      let currentRows = rows[j].children;
      outMat.codigo = currentRows[0]?.textContent?.trim() || '';
      outMat.asignatura = currentRows[1]?.textContent?.trim() || '';
      outMat.creditos = parseFloat(currentRows[2]?.textContent || '-Infinity');

      if (outMat.codigo === '') throw new Error(`Unable to get code for mat ${outMat.asignatura} @ cuat ${i + 1}`);
      if (outMat.asignatura === '') throw new Error(`Unable to get name for mat ${outMat.codigo} @ cuat ${i + 1}`);
      if (outMat.creditos === -Infinity) throw new Error(`Unable to get creds for mat ${outMat.codigo}:${outMat.asignatura} @ cuat ${i + 1}`);

      // Prerequisitos
      var splitPrereq = (currentRows[3]?.textContent || '')
        .replace(/\n/g, ',')
        .split(',')
        .map((x) => x.trim())
        .filter((e) => e !== '');

      for (let i = 0; i < splitPrereq.length; i++) {
        let a = splitPrereq[i];
        if (a.length < 8) prereq.push(a);
        else prereqExtra.push(a);
      }

      outCuat.push(outMat);
    }
    out.cuats.push(outCuat);
  }
  return out;
}

