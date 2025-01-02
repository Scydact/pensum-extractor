export function sortByProp<T, K extends keyof T>(...propList: K[]) {
    if (propList.length === 0) {
        return (a: T, b: T) => (a > b ? 1 : -1)
    }

    if (propList.length === 1) {
        const prop = propList[0]
        return (a: T, b: T) => (a[prop] > b[prop] ? 1 : -1)
    }

    return (a: T, b: T) => {
        for (const prop of propList) {
            if (a[prop] > b[prop]) {
                return 1
            }
        }
        return -1
    }
}

/**
 * Similar to Array.map(), but for objects.
 * @example
 * const foo = {x: 1, y: 2, z: 3};
 * objectMap(foo, v => v.toString());
 * // returns {x: '1', y: '2', z: '3'}
 */
export function objectMap<T extends {}, F extends (val: T[keyof T], key: keyof T, index: number) => any>(
    obj: T,
    fn: F,
) {
    return Object.fromEntries(
        (Object.entries(obj) as [keyof T, T[keyof T]][]).map(
            ([k, v], i) => [k, fn(v, k, i)] as [keyof T, ReturnType<F>],
        ),
    ) as { [P in keyof T]: ReturnType<F> }
}

/**
 * Returns a hash code for a string.
 * (Compatible to Java's String.hashCode())
 *
 * The hash code for a string object is computed as
 *     s[0]*31^(n-1) + s[1]*31^(n-2) + ... + s[n-1]
 * using number arithmetic, where s[i] is the i th character
 * of the given string, n is the length of the string,
 * and ^ indicates exponentiation.
 * (The hash value of the empty string is zero.)
 *
 * @param {string} s a string
 * @return {number} a hash code value for the given string.
 * @src https://gist.github.com/hyamamoto/fd435505d29ebfa3d9716fd2be8d42f0
 */
export function stringHash(s: string) {
    let h = 0,
        l = s.length,
        i = 0
    if (l > 0) while (i < l) h = ((h << 5) - h + s.charCodeAt(i++)) | 0
    return h
}
