import { classnames } from '@/lib/format-utils'
import { forwardRef, memo, useContext, useMemo, useRef } from 'react'

import EditableInput from '@/components/EditableInput'
import MatCode from '@/components/MatCode'
import DeveloperModeContext from '@/contexts/developer-mode'
import { useCombinedRefs } from '@/hooks/use-combined-refs'
import { useClassOnHover } from '@/hooks/use-hover-class'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { MdDragIndicator } from 'react-icons/md'
import { MatRowProps, MatRowTemplate, MatRowTemplateProps } from '../Table/MatRow'
import { findMatLocation, getPeriod, setPeriod } from './mat-movement'

const pensumReqEditable = {
    req2str(reqs: Pensum.Requirement[]): string {
        return reqs
            .map((req) => (typeof req === 'string' ? req : `"${req.text}"`))
            .map((req) => req.replace(',', '\\,'))
            .join(', ')
    },
    str2req(reqStr: string): Pensum.Requirement[] {
        return reqStr
            .replace(/((?:^|[^\\])(?:\\{2})*),/g, '$1\u1234') // Find unescaped commas, use magic weird character
            .split('\u1234') // Split by unescaped commas
            .map((x) => x.trim().replace(/(?<!\\)\\,/g, ',')) // Replace escaped commas back
            .filter(Boolean)
            .map((x) => (x.startsWith('"') && x.endsWith('"') ? { text: x.slice(1, -1) } : x))
    },
    getter(mat: Pensum.Mat): string {
        return pensumReqEditable.req2str(mat.req)
    },
    setter(reqStr: string): Pensum.Requirement[] {
        return pensumReqEditable.str2req(reqStr)
    },
    display(reqStr: string, baseMat: string) {
        const reqs = pensumReqEditable.str2req(reqStr)
        return (
            <>
                {reqs.map((x, i) => (
                    <MatCode key={i} data={x} fromMat={baseMat} />
                ))}
            </>
        )
    },
}

type DevMatRowProps = MatRowProps & {
    checkmarkProps?: Record<string, any>
    [k: string]: any
}

export const DevMatRow = memo(
    forwardRef<unknown, DevMatRowProps>(function MR(props, ref) {
        const { mat, idx, checkmarkProps, ...rest } = props
        const rowRef = useCombinedRefs<HTMLDivElement>(ref, useRef<HTMLDivElement>(null)) // innerRef in case no ref is given
        const dragHandleRef = useRef<HTMLDivElement>(null)
        const { pensum, commands } = useContext(DeveloperModeContext)

        // On hover INSIDE THE MAT CHECKBOX, change the background of the ENTIRE ROW.
        useClassOnHover('track-hover', rowRef, dragHandleRef)

        // Classes. Any falsy values will be discarded
        const cl = [
            'row-mat',
            'row-mat-dev',
            idx & 1 && 'even', // Mark the mat as even, if the index is odd????? lol.
            'table-hover-default',
        ]

        const updateMat = useMemo(
            () =>
                (arg: keyof Pensum.Mat, converter: (s: string) => any = String) =>
                (val: string) => {
                    try {
                        const newPensum = changeMat(pensum, mat, { ...mat, [arg]: converter(val) })
                        commands.set(newPensum)
                    } catch (err) {
                        alert(err)
                    }
                },
            [commands, mat],
        )

        // TODO Edit mode per row
        /**
         * - Prereqs should be one those fancy selector.
         * - Code should be a selector with any unreferenced type
         * - Headers have a + button
         * - Period number have a <add mat> and <add period after> and <delete>
         * - Loose mats appear, with the option to "formalize" any unregistered mat.
         * - MatFilter disabled. Instead, pensum properties editor is used.
         * - MatProgress disabled. Instead, pensum statistics (amount of mats, loose mats, total cr, etc... is used)
         */
        const elems: MatRowTemplateProps['elems'] = {
            checkmark: (
                <div>
                    <MdDragIndicator />
                </div>
            ),
            code: <EditableInput getter={() => mat.code} setter={updateMat('code')} />,
            name: <EditableInput getter={() => mat.name} setter={updateMat('name')} />,
            cr: <EditableInput min={0} getter={() => String(mat.cr)} setter={updateMat('cr', Number)} />,
            reqs: (
                <EditableInput
                    type="textarea"
                    getter={() => pensumReqEditable.getter(mat)}
                    setter={updateMat('req', pensumReqEditable.setter)}
                    display={(reqStr: string) => pensumReqEditable.display(reqStr, mat.code)}
                />
            ),
        }

        return (
            <MatRowTemplate
                elems={elems}
                checkmarkProps={{
                    ref: dragHandleRef,
                    ...checkmarkProps,
                }}
                rowProps={{
                    ref: rowRef,
                    className: classnames(cl),
                    'data-mat': mat.code,
                    ...rest,
                }}
            />
        )
    }),
)

export function DevMatRowSortable(props: MatRowProps) {
    const { active, attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: props.mat.code })
    const draggableStyle = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: active?.id === props.mat.code ? 0.5 : 1,
    }
    return (
        <DevMatRow
            idx={props.idx}
            mat={props.mat}
            ref={setNodeRef}
            checkmarkProps={{ ...attributes, ...listeners }}
            style={draggableStyle}
        />
    )
}

function changeMat(pensum: Pensum.Pensum, oldMat: Pensum.Mat, newMat: Pensum.Mat) {
    // Set of all codes
    const codeMap = new Set()
    pensum.periods.forEach((period) => period.forEach((mat) => codeMap.add(mat.code)))
    pensum.loose.forEach((mat) => codeMap.add(mat.code))

    // Check if code is valid
    if (!newMat.code) {
        throw 'Codigo no puede estar vacio.'
    }
    if (oldMat.code !== newMat.code) {
        if (codeMap.has(newMat.code)) {
            throw 'Codigo duplicado.'
        }
    }

    // Check if CR is valid
    if (isNaN(newMat.cr)) {
        throw 'Creditos debe ser un numero valido.'
    }
    if (newMat.cr < 0) {
        throw 'Creditos debe ser un numero positivo.'
    }
    const matLocation = findMatLocation(pensum, oldMat.code)
    if (!matLocation) {
        throw 'Codigo de materia previo no encontrado.'
    }
    const period = Array.from(getPeriod(pensum, ~~matLocation.droppableId))
    period[matLocation.index] = newMat
    const newPensum: Pensum.Pensum = { ...pensum }
    const wasValid = !!setPeriod(newPensum, ~~matLocation.droppableId, period)
    if (wasValid) {
        return newPensum
    }
    throw 'Fallo al modificar materia.'
}
