import { matSelectHelpers } from '@/contexts/mat-selection'

export type MatOrgChartNode = {
    id: string
    parents: string[] | null
    // primaryParent: string[] | null,
    templateName: string

    code: string
    cr: string
    name: string
    period: string

    selectionClass: string
}
export function pensumdata2org(data: ActivePensum.MatExtraData, tracker: MatSelection.Tracker, periodStr: string) {
    const o: MatOrgChartNode[] = []

    // Mats & loose // TODO: Confirm this list actually has the loose mats.
    o.push(
        ...data.list.map((mat) =>
            mat2org(
                mat,
                data.periodMap.get(mat.code) || 0,
                matSelectHelpers.getTracker(tracker, mat.code) || 'default',
                periodStr,
            ),
        ),
    )

    // Loose unhandled... (error codes?)
    console.log(data.looseUnhandled)
    o.push(
        ...[...data.looseUnhandled].map((str) =>
            mat2org(
                { code: str },
                -1,
                matSelectHelpers.getTracker(tracker, str) || 'missing', // I think this is always default (error)
            ),
        ),
    )

    return o
}

const UNKNOWN = '???'
type Mat2OrgLenient = Partial<Pensum.Mat> & {
    code: string
}
export function mat2org(
    obj: Mat2OrgLenient,
    period: number,
    selectionClass: string = 'default',
    periodStr = 'Per.',
): MatOrgChartNode {
    return {
        id: obj.code,
        parents: (obj.req && (obj.req.filter((x) => typeof x === 'string') as string[])) || [],
        // primaryParent: obj.prereq || null,
        templateName: 'matTemplate',

        code: obj.code || UNKNOWN,
        cr: String(obj.cr || '?'),
        name: obj.name || UNKNOWN,
        period: periodStr + ': ' + String(period),

        selectionClass,
    }
}
