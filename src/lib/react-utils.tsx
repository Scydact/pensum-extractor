/** 
 * Joins an array of classes into a className string.
 * @example
 * // returns 'card backdrop red'
 * let isRed = true;
 * classnames(['card', 'backdrop', isRed && 'red']);
 * @returns The joined strings, but only from items whose values are truthy.
 * */
export const classnames = (arr: any[]) => arr.filter(Boolean).join(' ');