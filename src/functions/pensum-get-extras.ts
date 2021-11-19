import { difference } from "lib/set-utils";

type MatExtraData = {
  /** List of all mats */
  list: Pensum.Mat[],
  /** Map: code<string> -> period<number> */
  periodMap: Map<string, number>,
  /** Map : code<string> -> mat<Mat> */
  codeMap: Map<string, Pensum.Mat>, 
  /** Map: code<string> -> postreqs<string> */
  postreqMap: Map<string, string[]>,
  /** List of mats that are prereqs but are not registered. */
  looseUnhandled: Set<string>,
}

/** Gets all the extra data of a pensum's mats. */
export function processPensumMats(pensum: Pensum.Pensum | null): MatExtraData {
  if (!pensum) return {
    list: [],
    periodMap: new Map(),
    codeMap: new Map(),
    postreqMap: new Map(),
    looseUnhandled: new Set(),
  };

  const matMap = new Map<string, Pensum.Mat>();
  const matPeriod = new Map<string, number>();
  const matPostreq = new Map<string, string[]>();
  const mats: Pensum.Mat[] = [];
  const warnings: { code: string, text: string }[] = [];

  const processMat = (mat: Pensum.Mat, periodNum: number) => {
    if (matMap.has(mat.code)) 
      warnings.push({code: mat.code, text: 'was already registered!'});

    // Add to all lists/maps/sets
    matMap.set(mat.code, mat);
    matPeriod.set(mat.code, periodNum);
    mats.push(mat);
  }


  // Loose mats have period 0
  pensum.loose.forEach(mat => processMat(mat, 0));

  pensum.periods.forEach((period, periodIdx) => {
    period.forEach(mat => processMat(mat, periodIdx + 1));
  });


  // After all mats are registered, get postreqs
  for (const mat of mats) {
    const code = mat.code;

    for (const prereq of mat.prereq) {
      if (typeof prereq === 'string') { // Only select codes, not {text: ''}

        // Add or create new list
        const list = matPostreq.get(prereq);
        if (list) list.push(code);
        else matPostreq.set(prereq, [code]);

      }
    }
  }

  // Get unhandled loose mats
  const matSet = new Set(matMap.keys());
  const hasPostreqSet = new Set(matPostreq.keys());
  
  // Codes that are prereqs to something but do not exist on mats.
  const looseUnhandled = difference(hasPostreqSet, matSet);


  // Play all the warnings
  for (const warning of warnings) {
    console.warn(`Warning at pensum-get-extras [${warning.code}]: ${warning.text}`);
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
    /** List of mats that are prereqs but are not registered. */
    looseUnhandled: looseUnhandled,
  }
}

export default processPensumMats;