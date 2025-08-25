/** Format the given date as YYYYMMDD. */
export function fmtDateYYYYMMDD(d?: Date): string {
    if (!d) d = new Date()
    const year = d.getFullYear()
    const month = String(d.getMonth() + 1).padStart(2, '0') // Months are 0-based
    const day = String(d.getDate()).padStart(2, '0')

    return `${year}${month}${day}`
}
