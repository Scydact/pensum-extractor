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