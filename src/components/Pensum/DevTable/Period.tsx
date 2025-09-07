import ActivePensumContext from '@/contexts/active-pensum'
import DeveloperModeContext from '@/contexts/developer-mode'
import { MatSelectionDispatchContext } from '@/contexts/mat-selection'
import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { memo, useCallback, useContext } from 'react'
import { Dropdown, DropdownMenu, DropdownToggle } from 'react-bootstrap'
import Row from 'react-bootstrap/Row'
import { BiDotsVerticalRounded, BiEraser, BiLayerMinus, BiMoveVertical, BiPlus } from 'react-icons/bi'
import { CgInsertAfter, CgInsertBefore } from 'react-icons/cg'
import { getPeriod, insertPeriod, setPeriod } from './mat-movement'
import { DevMatRowSortable } from './MatRow'

type PeriodProps = {
    period: Pensum.Mat[]
    periodKey: number | string
    cumlen: number
}

/**
 * Displays a single period from the pensum as table rows.
 * This "Period" is a droppable target
 */
const DevPeriod = memo(function DevPeriod({ period, periodKey, cumlen = 0 }: PeriodProps) {
    const dispatch = useContext(MatSelectionDispatchContext)
    const { setNodeRef } = useDroppable({ id: periodKey })

    const onPeriodClick = useCallback(
        (evt: any) => {
            dispatch({ type: 'selectPeriod', payload: period.map((x) => x.code) })
        },
        [period, dispatch],
    )

    return (
        <div className="row-period">
            <Row className="row-period-dev-sidebar" onClick={onPeriodClick} data-value={periodKey}>
                <DevPeriodToolBar period={period} periodKey={periodKey} />
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
function DevPeriodToolBar({ period, periodKey }: Omit<PeriodProps, 'cumlen'>) {
    const { commands, pensum } = useContext(DeveloperModeContext)
    const {
        state: {
            matData: { codeMap },
        },
    } = useContext(ActivePensumContext)
    const isIrregularPeriod = periodKey === 0 || typeof periodKey === 'string'
    const styleHiddenIfLoose = isIrregularPeriod ? { display: 'none' } : undefined

    function actionDeletePeriod() {
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
    }

    function actionDeleteMats() {
        if (period.length) {
            const msg =
                'Seguro que desea borrar las siguientes materias?\n' +
                period.map((mat) => ` - [${mat.code}] ${mat.name}`).join('\n')
            if (!window.confirm(msg)) return
        }
        const newPensum = { ...pensum }
        setPeriod(newPensum, periodKey, [])
        commands.set(newPensum)
    }

    function actionMoveMats() {
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
        setPeriod(newPensum, periodKey, [])
        commands.set(newPensum)
    }

    function actionAddMat() {
        const newPensum = { ...pensum }
        const newPeriod = Array.from(period)
        let code = ''
        while (!code || codeMap.has(code)) {
            const n = Math.round((Math.random() * 1000) % 1000)
            const l = 'X' + randomLetters(2)
            code = l + n.toString().padStart(3, '0')
        }
        newPeriod.push({ code, name: '*Materia', req: [], cr: 1 })
        setPeriod(newPensum, periodKey, newPeriod)
        commands.set(newPensum)
    }

    function actionInsertPeriodBefore() {
        if (typeof periodKey !== 'number') {
            const msg = `Cannot add period after loose or additional period.`
            console.error(msg)
            alert(msg)
            return
        }
        const newPensum = { ...pensum }
        insertPeriod(newPensum, periodKey, [])
        commands.set(newPensum)
    }

    function actionInsertPeriodAfter() {
        if (typeof periodKey !== 'number') {
            const msg = `Cannot add period after loose or additional period.`
            console.error(msg)
            alert(msg)
            return
        }
        const newPensum = { ...pensum }
        insertPeriod(newPensum, periodKey + 1, [])
        commands.set(newPensum)
    }

    return (
        <div className="d-flex align-items-center flex-wrap align-items-stretch mb-2 mt-3" style={{ gap: '.25rem' }}>
            <b className="col d-flex align-items-center">
                {typeof periodKey === 'string' ? periodKey : `${pensum.periodType.name ?? 'Periodo'} #${periodKey}`}:
            </b>

            <button
                type="button"
                className="col btn btn-primary btn-action"
                onClick={actionAddMat}
                title="Agregar materia"
            >
                <BiPlus />
                <span className="btn-action-label">Nueva materia</span>
            </button>
            <button
                type="button"
                className="col btn btn-secondary btn-action"
                style={styleHiddenIfLoose}
                onClick={actionInsertPeriodBefore}
                title="Agregar periodo antes"
            >
                <CgInsertBefore />
                <span className="btn-action-label">Periodo antes</span>
            </button>
            <button
                type="button"
                className="col btn btn-secondary btn-action"
                style={styleHiddenIfLoose}
                onClick={actionInsertPeriodAfter}
                title="Agregar periodo después"
            >
                <CgInsertAfter />
                <span className="btn-action-label">Periodo después</span>
            </button>

            <Dropdown>
                <DropdownToggle variant="secondary">
                    <BiDotsVerticalRounded />
                </DropdownToggle>
                <DropdownMenu>
                    <Dropdown.Item onClick={actionAddMat}>
                        <BiPlus /> Nueva materia
                    </Dropdown.Item>
                    <Dropdown.Item onClick={actionMoveMats}>
                        <BiMoveVertical /> Mover materias
                    </Dropdown.Item>
                    <Dropdown.Item onClick={actionDeleteMats}>
                        <BiEraser /> Borrar materias
                    </Dropdown.Item>
                    {!isIrregularPeriod && (
                        <>
                            <Dropdown.Divider />
                            <Dropdown.Item onClick={actionInsertPeriodBefore}>
                                <CgInsertBefore /> Agregar periodo antes
                            </Dropdown.Item>
                            <Dropdown.Item onClick={actionInsertPeriodAfter}>
                                <CgInsertAfter /> Agregar periodo después
                            </Dropdown.Item>
                            <Dropdown.Item onClick={actionDeletePeriod}>
                                <BiLayerMinus /> Borrar periodo
                            </Dropdown.Item>
                        </>
                    )}
                </DropdownMenu>
            </Dropdown>
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
