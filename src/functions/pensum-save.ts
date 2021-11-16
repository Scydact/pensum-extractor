/** Omits prereq | coreq if empty. */
function mat2savemat(mat: Pensum.Mat): Pensum.Save.Mat {
  const save: Pensum.Save.Mat = { ...mat };

  if (save.prereq && save.prereq.length === 0)
    delete save.prereq;
  if (save.coreq && save.coreq.length === 0)
    delete save.coreq;

  return save;
}

/** This function removes any empty parameters to make the savepensum smaller. */
function pensumToSavePensum(pensum: Pensum.Pensum): Pensum.Save.Pensum {
  const save = {
    ...pensum,
    loose: pensum.loose.map(x => mat2savemat(x)),
    periods: pensum.periods.map(x => x.map(y => mat2savemat(y))),
  };

  return save;
}

export default pensumToSavePensum;