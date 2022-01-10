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
 * Formats a date as YYYYMMDD_HHhMMmSSs
 * @param d Date to convert
 * 
 * @example
 * let d = new Date(2010, 7, 5);
 * idDateFormat(d);
 * // returns "201007050h0m0s";
 * 
 * @returns Date in format YYYYMMDD_HHhMMmSSs.
 */
export function idDateFormat(d: Date) {
  return `${d.getFullYear()}${d.getMonth()}${d.getDate()}_${d.getHours()}h${d.getMinutes()}m${d.getSeconds()}s`;
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
      return txt.charAt(0).toUpperCase() + txt.slice(1).toLowerCase();
    }
  );
}

/**
 * Converts text toCamelCase (initial character lowercase).
 * @param str Text to convert
 * @returns textToConvert
 * @src https://stackoverflow.com/a/2970667/13255686
 */
export function toCamelCase(str: string) {
  return str.replace(/(?:^\w|[A-Z]|\b\w|\s+)/g, function(match, index) {
    if (+match === 0) return ""; // or if (/\s+/.test(match)) for white spaces
    return index === 0 ? match.toLowerCase() : match.toUpperCase();
  });
}


/**
 * Converts text ToPascalCase (initial character UpperCase).
 * @param s Text to convert
 * @returns TextToConvert
 * @src Adapted from https://stackoverflow.com/a/2970667/13255686
 */
export function toPascalCase(str: string) {
  return str.replace(/(?:^\w|[A-Z]|\b\w|\s+)/g, function(match, index) {
    if (+match === 0) return ""; // or if (/\s+/.test(match)) for white spaces
    return match.toUpperCase();
  });
}

/**
 * Custom compact format to be used in filenames.
 * @returns the date in format YYYY-MM-DD HHhMMmSSs
 */
export function getDateIdentifier(d?: Date) {
  if (!d) d = new Date()
  return `${d.getFullYear()}-${d.getMonth()+1}-${d.getDate()} ${d.getHours()}h${d.getMinutes()}m${d.getSeconds()}s`;
}