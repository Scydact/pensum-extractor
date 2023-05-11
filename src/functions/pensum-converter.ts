import { japaneseDateFormat } from "lib/format-utils";

/** Converts a pensum from an old format to a new format. */
export function validatePensum(pensum: Pensum.Save.Legacy.Pensum2 | Pensum.Save.Pensum | null, university: string) {
  // Nothing we can do about this :(
  if (!pensum) return null;

  // Legacy version
  if (pensum.version <= 3) {
    const p = convertPensum2(pensum as Pensum.Save.Legacy.Pensum2, university);
    console.warn('Loaded pensum from old version!');
    return p;
  }

  // Current version
  if (pensum.version === 5) {
    const p = convertSavePensum(pensum);
    return p;
  }

  console.warn('Pensum did not load correctly!', pensum);
  return null;
}

/** Fixes the save form of a pensum, making sure that all its properties are set (eg. empty prereqs). */
export function convertSavePensum(save: Pensum.Save.Pensum): Pensum.Pensum {
  const MatConverter = (old: Pensum.Save.Mat): Pensum.Mat => {
    const mat: Pensum.Mat = {
      ...old,
      req: (old.req) ? old.req : [],
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
export function convertPensum2(old: Pensum.Save.Legacy.Pensum2, university: string): Pensum.Pensum {
  const pensum: Pensum.Pensum = {
    version: Number(process.env.REACT_APP_SAVE_VERSION),
    institution: university ?? '',
    code: old.codigo ?? '',
    publishDate: old.vigencia ?? '0000-00-00',
    fetchDate: '2021-04-24',
    career: old.carrera ?? '',
    info: old.infoCarrera ?? [],
    src: {
      type: 'convert',
      date: japaneseDateFormat(new Date()),
      url: `./pensum/${university}/${old.codigo?.toLowerCase()}.json`,
    },
    periodType: {
      name: 'Cuatrimestre',
      acronym: 'Cuat',
      two: 'Ct',
    },
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
      req: [],
    };

    newMat.req.push(...oldReqConverter(oldMat.prereq));
    newMat.req.push(...oldReqConverter(oldMat.prereqExtra).map(x => ({ text: x })));
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
    if (out.req.length === 0) delete out.req;
    
    return out;
  }
  
  const out = {
    ...pensum,
    loose: pensum.loose.map(mat => mat2savemat(mat)),
    periods: pensum.periods.map(p => p.map(mat => mat2savemat(mat))),
  };
  

  return out;
}