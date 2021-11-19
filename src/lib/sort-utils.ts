export function sortByProp<T, K extends keyof T>(...propList: K[]) {
  if (propList.length === 0) {
    return (a: T, b: T) => (a > b) ? 1 : -1;
  }

  if (propList.length === 1) {
    const prop = propList[0];
    return (a: T, b: T) => (a[prop] > b[prop]) ? 1 : -1; 
  }

  return (a: T, b: T) => {
    for (let prop of propList) {
      if (a[prop] > b[prop]) {
        return 1;
      }
    }
    return -1;
  }
}

/** 
 * Similar to Array.map(), but for objects. 
 * @example
 * const foo = {x: 1, y: 2, z: 3};
 * objectMap(foo, v => v.toString());
 * // returns {x: '1', y: '2', z: '3'}
 */
export function objectMap
  <T, F extends (val: T[keyof T], key: keyof T, index: number) => any>
  (obj: T, fn: F) {
  return Object.fromEntries(
    (Object.entries(obj) as [keyof T, T[keyof T]][]).map(
      ([k, v], i) => [k, fn(v, k, i)] as [keyof T, ReturnType<F>])
  ) as { [P in keyof T]: ReturnType<F> }
}