/** Omits req if empty. */
function mat2savemat(mat: Pensum.Mat): Pensum.Save.Mat {
    const save: Pensum.Save.Mat = { ...mat }

    if (save.req && save.req.length === 0) delete save.req

    return save
}

/** This function removes any empty parameters to make the savepensum smaller. */
function pensumToSavePensum(pensum: Pensum.Pensum): Pensum.Save.Pensum {
    const save = {
        ...pensum,
        loose: pensum.loose.map((x) => mat2savemat(x)),
        periods: pensum.periods.map((x) => x.map((y) => mat2savemat(y))),
    }

    return save
}

export default pensumToSavePensum
