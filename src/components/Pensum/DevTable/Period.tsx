import { memo, useCallback, useContext, useRef } from 'react'
import { MatSelectionDispatchContext } from '@/contexts/mat-selection'

import Row from 'react-bootstrap/Row'
import { DevMatRow, DevMatRowSortable } from './MatRow'
import {
    useDroppable,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragOverlay,
} from '@dnd-kit/core'
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable'
import DeveloperModeContext from '@/contexts/developer-mode'
import { getPeriod, insertPeriod, setPeriod } from './mat-movement'
import ActivePensumContext from '@/contexts/active-pensum'
import { usePrevious } from '@/hooks/use-previous'

type PeriodProps = {
    period: Pensum.Mat[]
    periodNum: number
    cumlen: number
}

export function useHasChanged<T>(value: T): boolean {
    const currentRef = useRef(value)
    const previousRef = useRef<T>()
    if (currentRef.current !== value) {
        previousRef.current = currentRef.current
        currentRef.current = value
        return true
    }
    return false
}

/**
 * Displays a single period from the pensum as table rows.
 * This "Period" is a droppable target
 */
const DevPeriod = memo(function DevPeriod({ period, periodNum, cumlen = 0 }: PeriodProps) {
    const dispatch = useContext(MatSelectionDispatchContext)
    const { setNodeRef } = useDroppable({ id: periodNum })

    const onClick = useCallback(
        (evt: any) => {
            dispatch({ type: 'selectPeriod', payload: period.map((x) => x.code) })
        },
        [period, dispatch],
    )
    const mats = period.map((x) => x.code).join(', ')
    const hasMatsChanged = useHasChanged(mats)

    if ((periodNum === 4 || periodNum === 5) && hasMatsChanged) {
        console.log(`Period ${periodNum} has mats: ${mats}`)
    }

    return (
        <div className="row-period">
            <Row className="row-period-dev-sidebar" onClick={onClick} data-value={periodNum}>
                <DevPeriodToolBar period={period} periodNum={periodNum} />
            </Row>
            <Row className="row-mat-group" ref={setNodeRef}>
                <SortableContext items={period.map((mat) => mat.code)} strategy={verticalListSortingStrategy}>
                    {period.map((mat, i) => (
                        <DevMatRowSortable key={mat.code} mat={mat} idx={i + cumlen} />
                    ))}
                </SortableContext>
                {period.length === 0 && (
                    <div
                        style={{
                            height: '100px',
                            fontStyle: 'italic',
                            opacity: 0.85,
                            display: 'grid',
                            placeItems: 'center',
                        }}
                    >
                        Periodo vacio!
                    </div>
                )}
            </Row>
        </div>
    )
})
export default DevPeriod

/** Toolbar with actions for each period. */
function DevPeriodToolBar({ period, periodNum }: Omit<PeriodProps, 'cumlen'>) {
    const { commands, pensum } = useContext(DeveloperModeContext)
    const {
        state: {
            matData: { codeMap },
        },
    } = useContext(ActivePensumContext)
    const styleHiddenIfLoose = periodNum === 0 ? { display: 'none' } : undefined
    return (
        <div className="d-flex align-items-center flex-wrap align-items-stretch" style={{ gap: '.25rem' }}>
            <b className="col d-flex align-items-center">Periodo #{periodNum}:</b>
            <button
                type="button"
                className="col btn btn-primary"
                style={styleHiddenIfLoose}
                onClick={() => {
                    if (period.length) {
                        const msg =
                            'Seguro que desea borrar este periodo?\n' +
                            'Todas las materias de este periodo se moveran a la categoria "Demás materias".\n' +
                            period.map((mat) => ` - [${mat.code}] ${mat.name}`).join('\n')
                        if (!window.confirm(msg)) return
                    }
                    const newPeriods = Array.from(pensum.periods)
                    const idx = newPeriods.indexOf(period)
                    newPeriods.splice(idx, 1)
                    const newLoose = [...pensum.loose, ...period]
                    commands.set({ ...pensum, periods: newPeriods, loose: newLoose })
                }}
            >
                Borrar periodo
            </button>
            <button
                type="button"
                className="col btn btn-primary"
                disabled={!period.length}
                onClick={() => {
                    if (period.length) {
                        const msg =
                            'Seguro que desea borrar las siguientes materias?\n' +
                            period.map((mat) => ` - [${mat.code}] ${mat.name}`).join('\n')
                        if (!window.confirm(msg)) return
                    }
                    const newPensum = { ...pensum }
                    setPeriod(newPensum, periodNum, [])
                    commands.set(newPensum)
                }}
            >
                Borrar materias
            </button>
            <button
                type="button"
                className="col btn btn-primary"
                disabled={!period.length}
                onClick={() => {
                    const msg =
                        'Mover las materias al periodo...?\n' +
                        '(0 == "Demás materias").\n' +
                        (pensum.periods.length ? `(${1}-${pensum.periods.length} == Periodo N)\n` : '') +
                        '------------------\n' +
                        period.map((mat) => ` - [${mat.code}] ${mat.name}`).join('\n')
                    const userInput = window.prompt(msg)
                    if (!userInput) return
                    const idx = parseInt(userInput)
                    const newPensum = { ...pensum }
                    let nextPeriod = getPeriod(newPensum, idx)
                    if (!nextPeriod) {
                        window.alert(`Indice invalido! Debe ser entre 0 y ${pensum.periods.length}!`)
                        return
                    }
                    nextPeriod = Array.from(nextPeriod)
                    nextPeriod.push(...period)
                    setPeriod(newPensum, idx, nextPeriod)
                    setPeriod(newPensum, periodNum, [])
                    commands.set(newPensum)
                }}
            >
                Mover materias
            </button>
            <button
                type="button"
                className="col btn btn-primary"
                onClick={() => {
                    const newPensum = { ...pensum }
                    const newPeriod = Array.from(period)
                    let code = ''
                    while (!code || codeMap.has(code)) {
                        const n = Math.round((Math.random() * 1000) % 1000)
                        const l = 'X' + randomLetters(2)
                        code = l + n.toString().padStart(3, '0')
                        console.log(code)
                    }
                    newPeriod.push({ code, name: '*Materia', req: [], cr: 1 })
                    setPeriod(newPensum, periodNum, newPeriod)
                    commands.set(newPensum)
                }}
            >
                Nueva materia
            </button>
            <button
                type="button"
                className="col btn btn-primary"
                style={styleHiddenIfLoose}
                onClick={() => {
                    const newPensum = { ...pensum }
                    insertPeriod(newPensum, periodNum, [])
                    commands.set(newPensum)
                }}
            >
                Agregar periodo antes
            </button>
            <button
                type="button"
                className="col btn btn-primary"
                style={styleHiddenIfLoose}
                onClick={() => {
                    const newPensum = { ...pensum }
                    insertPeriod(newPensum, periodNum + 1, [])
                    commands.set(newPensum)
                }}
            >
                Agregar periodo despues
            </button>
        </div>
    )
}

function randomLetter() {
    const lower = 'A'.charCodeAt(0)
    const upper = 'Z'.charCodeAt(0)
    const range = upper - lower
    const code = ~~(Math.random() * range) + lower
    return String.fromCharCode(code)
}

function randomLetters(amount: number) {
    return Array(amount).fill('').map(randomLetter).join('')
}
