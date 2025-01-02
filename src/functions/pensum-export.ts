import { idDateFormat, toPascalCase, toTitleCase } from '@/lib/format-utils'
import { utils, write, type Range, type CellAddress, type WorkSheet, type WorkBook } from 'xlsx'
import getPeriodType from './pensum-get-period-type'

//#region Excel

const COL = {
    period: 'A',
    code: 'B',
    name: 'C',
    cr: 'D',
    prereq: 'E',
    coreq: 'F',
    passed: 'G',
} as const
const COLS = 'ABCDEFG'

const createMergeCells = (array: Range[]) => (s: CellAddress, e: CellAddress) => array.push({ s, e })

/**
 * Creates a mapping function (to be used with period.forEach(mapFn)) that
 * pushes a single mat into the given worksheet
 */
const getMatMapFn =
    (
        ws: WorkSheet,
        rowIdxRef: { r: number },
        periodNum: number,
        merge: ReturnType<typeof createMergeCells>,
        tracker: MatSelection.Tracker,
    ) =>
    (mat: Pensum.Mat, matIdx: number, period: Pensum.Mat[]) => {
        const rowIdx = rowIdxRef.r++

        ws[COL.period + rowIdx] = { v: periodNum, t: 'n' }
        if (matIdx === 0) {
            merge({ r: rowIdx - 1, c: 0 }, { r: rowIdx - 1 + period.length - 1, c: 0 })
        }

        // Code, Name, Cr
        ws[COL.code + rowIdx] = { v: mat.code, t: 's' }
        ws[COL.name + rowIdx] = { v: mat.name, t: 's' }
        ws[COL.cr + rowIdx] = { v: mat.cr, t: 'n' }

        // Prereqs
        const prereq2str = (req: Pensum.Requirement) => (typeof req === 'string' ? req : req.text)
        ws[COL.prereq + rowIdx] = {
            t: 's',
            // map into safe CSV ('hello im john, "23" years old' -> "hello im john, ""23"" years old")
            v: mat.req
                .map(prereq2str)
                .map((x) => (x.match(/[,"]/) ? '"' + x.replace(/"/g, '""') + '"' : x))
                .join(', '),
        }

        // Passed
        const isPassed = tracker.passed.has(mat.code)
        ws[COL.passed + rowIdx] = { v: Number(isPassed), t: 'n' }

        return ws
    }

export function pensumToExcelWorbook(pensum: Pensum.Pensum, tracker: MatSelection.Tracker) {
    /** Workboox */
    const wb = utils.book_new()
    /** Worksheet */
    const ws = utils.aoa_to_sheet([[]])
    utils.book_append_sheet(wb, ws, pensum.code || 'Pensum')

    /** Working range */
    ws['!ref'] = 'A1:H300'

    /** Merged cells */
    const merges: Range[] = (ws['!merges'] = [])
    const merge = (s: CellAddress, e: CellAddress) => merges.push({ s, e })

    let rowIdx = 1

    ws[COLS[0] + rowIdx] = { v: pensum.career, t: 's' }
    merge({ r: 0, c: 0 }, { r: 0, c: 0 })

    /** Table Headers */
    const headers = [getPeriodType(pensum).two, 'Codigo', 'Asignatura', 'Cr', 'Prereq', 'Coreq', 'Estado']
    for (let i = 0; i < headers.length; i++) {
        ws[COLS[i] + rowIdx] = { v: headers[i], t: 's' }
    }
    // Set column widths
    ws['!cols'] = [{ wch: 2 }, { wch: 8 }, { wch: 64 }, { wch: 2 }, { wch: 28 }, { wch: 16 }, { wch: 6 }]

    const rowIdxRef = { r: ++rowIdx }
    // Periods & loose
    pensum.periods.forEach((period, periodIdx) =>
        period.forEach(getMatMapFn(ws, rowIdxRef, periodIdx + 1, merge, tracker)),
    )

    pensum.loose.forEach(getMatMapFn(ws, rowIdxRef, -1, merge, tracker))

    // Metadata
    let createDate: Date
    try {
        const [d, m, y] = pensum.publishDate.split('/').map(Number)
        createDate = new Date(y, m, d)
    } catch {
        createDate = new Date()
    }

    wb.Props = {
        Title: `Pensum ${pensum.code} ${toTitleCase(pensum.career)}`,
        CreatedDate: createDate,
    }

    return wb
}

export function getXlsxBlob(wb: WorkBook) {
    const data = write(wb, { bookType: 'xlsx', type: 'binary' })
    const buf = new ArrayBuffer(data.length)
    const view = new Uint8Array(buf)
    for (let i = 0; i < data.length; i++) {
        view[i] = data.charCodeAt(i) & 0xff // convert to octet
    }

    return new Blob([buf], { type: 'application/octet-stream' })
}

//#endregion

//#region Utils
export function getExportFilename(pensum: Pensum.Pensum | null) {
    const pensumName = toPascalCase((pensum?.career || 'pensum').toLowerCase())
    const date = idDateFormat(new Date())

    return `${pensumName}_${date}`
}

//#endregion
