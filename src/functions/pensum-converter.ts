
/** Converts a pensum from an old format to a new format. */
export function validatePensum(pensum: Pensum.Save.Legacy.Pensum2 | Pensum.Save.Pensum | null, university: string) {
  // Nothing we can do about this :(
  if (!pensum) return null;

  // Legacy version
  if (pensum.version >= 2) {
    const p = loadPensum2(pensum as Pensum.Save.Legacy.Pensum2, university);
    console.warn('Loaded pensum from old version!');
    return p;
  }

  // Current version
  if (pensum.version === 3) {
    const p = loadPensumFromSave(pensum);
    return p;
  }

  console.warn('Pensum did not load correctly!', pensum);
  return null;
}

/** Fixes the save form of a pensum, making sure that all its properties are set (eg. empty prereqs). */
export function loadPensumFromSave(save: Pensum.Save.Pensum): Pensum.Pensum {
  
  const MatConverter = (old: Pensum.Save.Mat): Pensum.Mat => {
    const mat: Pensum.Mat = {
      ...old,
      prereq: (old.prereq) ? old.prereq : [],
      coreq: (old.coreq) ? old.coreq : [],
    };
    
    return mat;
  }

  const loose: Pensum.Mat[] = save.loose.map(mat => MatConverter(mat));
  const periods: Pensum.Mat[][] = save.periods.map(
    period => period.map(mat => MatConverter(mat)));
  

  return {
    ...save,
    loose,
    periods,
  };
}

/** Loads a legacy pensum, mapping the old properties to the new ones. */
export function loadPensum2(old: Pensum.Save.Legacy.Pensum2, university: string): Pensum.Pensum {
  const pensum: Pensum.Pensum = {
    version: 3,
    institution: university,
    code: old.codigo,
    publishDate: old.vigencia,
    fetchDate: '2021-04-24',
    career: old.carrera,
    info: old.infoCarrera,
    loose: [],
    periods: [],
  };

  if (!(old.cuats && old.cuats.length)) {
    console.warn(`Pensum ${old.codigo} (${old.carrera}) did not contain any cuat!`);
    return pensum;
  }

  const oldReqConverter = (req: Pensum.Save.Legacy.Mat['prereq']): string[] => {
    if (!req) return [];
    if (typeof req === 'string') return [req];
    if (Array.isArray(req)) return [...req];

    console.warn('Unknown requirement!: ', req);
    return [];
  }

  // Mat converter
  const oldmat2newmat = (oldMat: Pensum.Save.Legacy.Mat) => {
    const newMat: Pensum.Mat = {
      code: oldMat.codigo,
      name: oldMat.asignatura,
      cr: oldMat.creditos,
      prereq: [],
      coreq: [],
    };

    newMat.prereq.push(...oldReqConverter(oldMat.prereq));
    newMat.prereq.push(...oldReqConverter(oldMat.prereqExtra).map(x => ({ text: x })));
    return newMat;
  }

  
  old.cuats.forEach((oldCuat) => {
    const newCuat = [];

    for (const oldMat of oldCuat) {
      const newMat = oldmat2newmat(oldMat);
      newCuat.push(newMat);
    }
    
    pensum.periods.push(newCuat);
  });

  return pensum;
}

/** Converts a pensum into its save form, reducing its size if no requirements are used for each Mat. */
export function convertPensumToSave(pensum: Pensum.Pensum): Pensum.Save.Pensum {
  
  const mat2savemat = (mat: Pensum.Mat): Pensum.Save.Mat => {
    const out: any = {...mat};
    if (out.prereq.length === 0) delete out.prereq;
    if (out.coreq.length === 0) delete out.coreq;
    
    return out;
  }
  
  const out = {
    ...pensum,
    loose: pensum.loose.map(mat => mat2savemat(mat)),
    periods: pensum.periods.map(p => p.map(mat => mat2savemat(mat))),
  };
  

  return out;
}