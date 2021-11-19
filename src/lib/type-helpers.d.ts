/** 
 * Similar to keyof, but returns the type of a value.
 * @example
 * type foo      = {name: string, phone: number}
 * type fooKey   = keyof foo;   // 'name' | 'phone'
 * type fooValue = ValueOf<foo>;// string | number 
 * @src https://stackoverflow.com/a/49286056/13255686
 */
type ValueOf<T> = T[keyof T];