import { type DraggableLocation } from "react-beautiful-dnd";

/** Moves a mat in the pensum. Returns the pensum if the movement was valid. */
export default function moveMat(pensum: Pensum.Pensum, from: DraggableLocation, to: DraggableLocation) {
  const mat = extractMat(pensum, from);
  const newPeriod = insertMat(pensum, to, mat);
  if (newPeriod) {
    return pensum; // Only return if change was valid.
  }
}

/** Extracts a mat from the given location in the pensum. */
export function extractMat(pensum: Pensum.Pensum, target: DraggableLocation) {
  const idx = ~~target.droppableId - 1;
  let period: Pensum.Mat[]
  if (idx == -1) {
    period = Array.from(pensum.loose);
    pensum.loose = period;
  } else {
    period = Array.from(pensum.periods[idx]);
    pensum.periods[idx] = period;
  }
  const mat = period.splice(target.index, 1)[0];
  return mat;
}

/** Inserts a mat at the given location in the pensum. */
export function insertMat(pensum: Pensum.Pensum, target: DraggableLocation, mat: Pensum.Mat) {
  if (!mat) return;
  const idx = ~~target.droppableId - 1;
  if (idx == -1) {
    pensum.loose = insertMatAtPeriod(pensum.loose, mat, target.index);
    return pensum.loose;
  } else {
    pensum.periods[idx] = insertMatAtPeriod(pensum.periods[idx], mat, target.index);
    return pensum.periods[idx];
  }
}

/** [internal] Inserts a mat int the given period, returns the period. */
function insertMatAtPeriod(period: Pensum.Mat[], mat: Pensum.Mat, index: number) {
  return [
    ...period.slice(0, index),
    mat,
    ...period.slice(index),
  ];
}

/** Gets the period from the given pensum. */
export function getPeriod(pensum: Pensum.Pensum, periodIndex: number) {
  const idx = ~~periodIndex - 1;
  if (idx == -1) {
    return pensum.loose
  } else {
    return pensum.periods[idx];
  }
}

/** Updates the period on the pensum. */
export function setPeriod(pensum: Pensum.Pensum, periodIndex: number, period: Pensum.Mat[]): Pensum.Mat[] | undefined {
  const idx = ~~periodIndex - 1;
  if (idx == -1) {
    return pensum.loose = period;
  } else {
    pensum.periods = Array.from(pensum.periods)
    return pensum.periods[idx] = period;
  }
}

/** Find the location of a mat. */
export function findMatLocation(pensum: Pensum.Pensum, code: string): DraggableLocation | undefined {
  let idx = pensum.loose.findIndex(mat => mat.code === code);
  if (idx !== -1) {
    return {
      droppableId: '0',
      index: idx,
    }
  }
  for (let i = 0; i < pensum.periods.length; i++) {
    let period = pensum.periods[i];
    let idx = period.findIndex(mat => mat.code === code);
    if (idx !== -1) {
      return {
        droppableId: String(i + 1),
        index: idx,
      }
    }
  }
}