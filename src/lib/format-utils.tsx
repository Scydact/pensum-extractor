/** 
 * Joins an array of classes into a className string.
 * @example
 * // returns 'card backdrop red'
 * let isRed = true;
 * classnames(['card', 'backdrop', isRed && 'red']);
 * @returns The joined strings, but only from items whose values are truthy.
 * */
export const classnames = (arr: any[]) => arr.filter(Boolean).join(' ');


/**
 * Formats a date as YYYY-MM-DD
 * @param d Date to convert
 * 
 * @example
 * let d = new Date(2010, 7, 5);
 * japaneseDateFormat(d);
 * // returns "2010-07-05";
 * 
 * @returns Date in format YYYY-MM-DD.
 */
export const japaneseDateFormat = (d: Date) => {
  let ye = new Intl.DateTimeFormat('en', { year:  'numeric' }).format(d);
  let mo = new Intl.DateTimeFormat('en', { month: '2-digit' }).format(d);
  let da = new Intl.DateTimeFormat('en', { day:   '2-digit' }).format(d);
  return `${da}-${mo}-${ye}`;
}

/** 
 * Converts a string to title case. 
 * @example
 * let txt = toTitleCase("john smith");
 * // returns "John Smith"
 * @src https://stackoverflow.com/a/196991/13255686
 */
export function toTitleCase(str: string) {
  return str.replace(
    /\w\S*/g,
    function (txt) {
      return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    }
  );
}
