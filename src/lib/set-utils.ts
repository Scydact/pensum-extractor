// Almost everything extracted from https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set

/**
 * Checks if all the elements of `subset` are inside `set`.
 * @param set Global set
 * @param subset Smaller set
 * @returns True if the smaller set is inside the global set.
 * @example
 * const setA = new Set([1, 2, 3, 4])
 * const setB = new Set([2, 3])
 * isSuperset(setA, setB) // returns true
 * @src https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set
 */
export function isSuperset<T>(set: Set<T>, subset: Set<T>) {
  for (let elem of subset) {
      if (!set.has(elem)) {
          return false
      }
  }
  return true
}

/**
 * Returns the union of both sets.
 * @param setA 
 * @param setB 
 * @returns Union of setA and setB.
 * @example
 * const setA = new Set([1, 2, 3, 4])
 * const setC = new Set([3, 4, 5, 6])
 * union(setA, setC) // returns Set {1, 2, 3, 4, 5, 6}
 * @src https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set
 */
export function union<T>(setA: Set<T>, setB: Set<T>) {
  let _union = new Set(setA)
  for (let elem of setB) {
      _union.add(elem)
  }
  return _union
}

/**
 * Returns the elements that both sets have in common with each other.
 * @param setA 
 * @param setB 
 * @returns Intersection of both sets
 * @example
 * const setA = new Set([1, 2, 3, 4])
 * const setC = new Set([3, 4, 5, 6])
 * intersection(setA, setC) // returns Set {3, 4}
 * @src https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set
 */
export function intersection<T>(setA: Set<T>, setB: Set<T>) {
  let _intersection = new Set()
  for (let elem of setB) {
      if (setA.has(elem)) {
          _intersection.add(elem)
      }
  }
  return _intersection
}
  
/**
 * Returns the elements that are not shared between `setA` and `setB`.
 * Same as union(A,B) - intersect(A,B);
 * @param setA 
 * @param setB 
 * @returns Elements not shared between sets.
 * @example
 * const setA = new Set([1, 2, 3, 4])
 * const setC = new Set([3, 4, 5, 6])
 * symmetricDifference(setA, setC) // returns Set {1, 2, 5, 6}
 * @src https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set
 */
export function symmetricDifference<T>(setA: Set<T>, setB: Set<T>) {
    let _difference = new Set(setA)
    for (let elem of setB) {
      if (_difference.has(elem)) {
          _difference.delete(elem)
      } else {
          _difference.add(elem)
      }
  }
  return _difference
}

/**
 * Returns the elements of `setA` that are not in `setB`. 
 * @param setA 
 * @param setB 
 * @returns setA - setB
 * @example
 * const setA = new Set([1, 2, 3, 4])
 * const setC = new Set([3, 4, 5, 6])
 * difference(setA, setC) // returns Set {1, 2}
 * @src https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set
 */
export function difference<T>(setA: Set<T>, setB: Set<T>) {
  let _difference = new Set(setA)
  for (let elem of setB) {
      _difference.delete(elem)
  }
  return _difference
}