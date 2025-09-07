import PensumDevTable from '@/components/Pensum/DevTable'
import { ChangeEvent, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import Card from 'react-bootstrap/Card'

import { DevMatRow } from '@/components/Pensum/DevTable/MatRow'
import DeveloperModeContext from '@/contexts/developer-mode'
import {
    closestCenter,
    CollisionDetection,
    DndContext,
    DragCancelEvent,
    DragOverEvent,
    DragOverlay,
    DragStartEvent,
    getFirstCollision,
    KeyboardSensor,
    MeasuringStrategy,
    PointerSensor,
    pointerWithin,
    rectIntersection,
    UniqueIdentifier,
    useSensor,
    useSensors,
    type DragEndEvent,
} from '@dnd-kit/core'
import { restrictToVerticalAxis } from '@dnd-kit/modifiers'
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable'
import { Form } from 'react-bootstrap'
import { BiPlus, BiTrash } from 'react-icons/bi'
import { extractMat, findMat, findMatLocation, getPeriod, insertMat } from './mat-movement'

type Props = { [k: string]: any }

/**
 * Layout of two cards:
 * 1. All the normal periods
 * 2. "Loose mats" period
 *
 * Each of those periods is a special "PensumTable" that renders
 * the headers, and each period as a Sortable.
 */
function PensumDevDisplayCards(props: Props) {
    const { commands, pensum } = useContext(DeveloperModeContext)
    const { career, periods, loose, periodType, additionalPeriods } = pensum

    const [activeMatId, setActiveMatId] = useState<UniqueIdentifier | null>(null)
    const activeMat = typeof activeMatId === 'string' ? findMat(pensum, activeMatId) : null
    const lastOverId = useRef<UniqueIdentifier | null>(null)
    const recentlyMovedToNewContainer = useRef(false)
    const [clonedPensum, setClonedPensum] = useState<Pensum.Pensum | null>(null)

    const findPeriod = (id: UniqueIdentifier) => {
        if (typeof id === 'number') return id
        if (typeof id === 'string' && id in pensum.additionalPeriods) return id
        if (!(typeof id === 'string')) return -1
        const location = findMatLocation(pensum, id)
        if (!location) return -1
        return location.droppableId
    }

    function actionAddAdditionalPeriod() {
        const newPeriodName = prompt('Nombre del nuevo periodo?')?.trim()
        if (!newPeriodName) return
        if (newPeriodName in additionalPeriods) {
            alert(`Periodo '${newPeriodName}' ya existe!`)
            return
        }
        commands.set({
            ...pensum,
            additionalPeriods: {
                ...additionalPeriods,
                [newPeriodName]: { description: '', electiveCode: '', mats: [] },
            },
        })
    }

    function actionDeleteAdditionalPeriod(periodKey: string) {
        const periodDetails = pensum.additionalPeriods[periodKey]
        if (!periodDetails) return
        if (!confirm(`Seguro que desea eliminar el grupo '${periodKey}'?`)) return
        const additionalPeriods = Object.fromEntries(
            Object.entries(pensum.additionalPeriods).filter(([k, v]) => k !== periodKey),
        )
        const loose = [...pensum.loose, ...periodDetails.mats]
        commands.set({ ...pensum, additionalPeriods, loose })
    }

    function actionSetAdditionalPeriodValue<T extends keyof Pensum.AdditionalPeriod>(
        periodKey: string,
        key: T,
        value: Pensum.AdditionalPeriod[T],
    ) {
        commands.set({
            ...pensum,
            additionalPeriods: {
                ...pensum.additionalPeriods,
                [periodKey]: {
                    ...pensum.additionalPeriods[periodKey],
                    [key]: value,
                },
            },
        })
    }

    /**
     * Custom collision detection strategy optimized for multiple containers
     *
     * - First, find any droppable containers intersecting with the pointer.
     * - If there are none, find intersecting containers with the active draggable.
     * - If there are no intersecting containers, return the last matched intersection
     *
     */
    const collisionDetectionStrategy: CollisionDetection = useCallback(
        (args) => {
            if (typeof activeMatId === 'number') {
                return closestCenter({
                    ...args,
                    droppableContainers: args.droppableContainers.filter(
                        (container) => typeof container.id === 'number',
                    ),
                })
            }

            // Start by finding any intersecting droppable
            const pointerIntersections = pointerWithin(args)
            const intersections =
                pointerIntersections.length > 0
                    ? // If there are droppables intersecting with the pointer, return those
                      pointerIntersections
                    : rectIntersection(args)
            let overId = getFirstCollision(intersections, 'id')

            if (overId != null) {
                // Period is matched?
                if (typeof overId === 'number') {
                    const periodMats = getPeriod(pensum, overId)

                    // If a container is matched and it contains items (columns 'A', 'B', 'C')
                    if (periodMats.length > 0) {
                        // Return the closest droppable within that container
                        overId = closestCenter({
                            ...args,
                            droppableContainers: args.droppableContainers.filter(
                                (container) =>
                                    container.id !== overId && periodMats.some((mat) => mat.code === container.id),
                            ),
                        })[0]?.id
                    }
                }

                lastOverId.current = overId

                return [{ id: overId }]
            }

            // When a draggable item moves to a new container, the layout may shift
            // and the `overId` may become `null`. We manually set the cached `lastOverId`
            // to the id of the draggable item that was moved to the new container, otherwise
            // the previous `overId` will be returned which can cause items to incorrectly shift positions
            if (recentlyMovedToNewContainer.current) {
                lastOverId.current = activeMatId
            }

            // If no droppable is matched, return the last match
            return lastOverId.current ? [{ id: lastOverId.current }] : []
        },
        [activeMatId, pensum],
    )

    useEffect(() => {
        requestAnimationFrame(() => {
            recentlyMovedToNewContainer.current = false
        })
    }, [pensum])

    const onDragStart = (event: DragStartEvent) => {
        setActiveMatId(String(event.active.id))
        setClonedPensum(pensum)
    }

    // Handle move between containers
    const onDragOver = ({ active, over }: DragOverEvent) => {
        const overId = over?.id
        if (overId == null) return

        const overPeriod = findPeriod(overId)
        const activePeriod = findPeriod(active.id)
        console.log({ activePeriod, overPeriod })
        if (overPeriod == null || activePeriod == null) return

        if (activePeriod !== overPeriod) {
            const activeItems = getPeriod(pensum, activePeriod)
            const activeIndex = activeItems.findIndex((x) => x.code === active.id)
            const overItems = getPeriod(pensum, overPeriod)
            const overIndex = overItems.findIndex((x) => x.code === overId)

            let newIndex: number
            if (overIndex === -1) {
                newIndex = overItems.length + 1
            } else {
                const isBelowOverItem =
                    over &&
                    active.rect.current.translated &&
                    active.rect.current.translated.top > over.rect.top + over.rect.height
                const modifier = isBelowOverItem ? 1 : 0
                newIndex = overIndex >= 0 ? overIndex + modifier : overItems.length + 1
            }
            console.log({ activeItems, activeIndex, overItems, overIndex, newIndex })
            recentlyMovedToNewContainer.current = true
            const newPensum = { ...pensum }
            const mat = extractMat(newPensum, { droppableId: activePeriod, index: activeIndex })!
            insertMat(newPensum, { droppableId: overPeriod, index: newIndex }, mat)
            commands.set(newPensum, true)
        }
    }

    const onDragEnd = ({ active, over }: DragEndEvent) => {
        const activePeriod = findPeriod(active.id)
        if (activePeriod == null) {
            setActiveMatId(null)
            return
        }

        const overId = over?.id
        if (overId == null) {
            setActiveMatId(null)
            return
        }

        const overPeriod = findPeriod(overId)
        if (overPeriod != null) {
            const activeItems = getPeriod(pensum, activePeriod)
            const activeIndex = activeItems.findIndex((x) => x.code === active.id)
            const overItems = getPeriod(pensum, overPeriod)
            const overIndex = overItems.findIndex((x) => x.code === overId)

            if (activeIndex !== overIndex) {
                const newPensum = { ...pensum }
                const mat = extractMat(newPensum, { droppableId: activePeriod, index: activeIndex })!
                insertMat(newPensum, { droppableId: overPeriod, index: overIndex }, mat)
                commands.set(newPensum)
            } else {
                commands.set(pensum) // Set checkpoint in history anyways
            }
            setActiveMatId(null)
        }
        setActiveMatId(null)
    }

    const onDragCancel = (event: DragCancelEvent) => {
        if (clonedPensum) {
            commands.set(clonedPensum) // TODO: Check!
        }
        setActiveMatId(null)
        setClonedPensum(null)
    }

    // Drag and drop sensors
    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        }),
    )
    return (
        <DndContext
            sensors={sensors}
            collisionDetection={collisionDetectionStrategy}
            measuring={{
                droppable: {
                    strategy: MeasuringStrategy.Always,
                },
            }}
            onDragCancel={onDragCancel}
            onDragStart={onDragStart}
            onDragOver={onDragOver}
            onDragEnd={onDragEnd}
        >
            <Card className="pensum-table-container">
                <Card.Header>
                    <Card.Title>{career}</Card.Title>
                </Card.Header>
                <Card.Body>
                    <PensumDevTable periods={periods} periodType={periodType} />
                </Card.Body>
            </Card>

            {/* Loose mats */}
            <Card className="pensum-table-container">
                <Card.Header>
                    <Card.Title className="d-flex align-items-center gap-2">
                        <span className="badge bg-warning fs-5">Loose</span>
                        Materias sin periodo
                    </Card.Title>
                </Card.Header>
                <Card.Body>
                    <PensumDevTable periods={useMemo(() => [loose], [loose])} periodIndexStart={0} />
                </Card.Body>
            </Card>

            {/* Custom periods */}
            <hr />
            <h1>Periodos adicionales</h1>
            {Object.entries(additionalPeriods).map(([periodName, periodDetails]) => (
                <Card className="pensum-table-container">
                    <Card.Header>
                        <Card.Title className="d-flex align-items-center gap-2">
                            <span className="badge bg-secondary fs-5">Adicional</span> {periodName}
                            <span className="flex-grow-1"></span>
                            <button
                                type="button"
                                className="col btn btn-danger btn-action"
                                onClick={() => actionDeleteAdditionalPeriod(periodName)}
                                title="Eliminar grupo"
                            >
                                <BiTrash />
                                <span className="btn-action-label">Eliminar grupo</span>
                            </button>
                        </Card.Title>
                    </Card.Header>
                    <Card.Body>
                        <Form.Group className="mb-3">
                            <Form.Label className="fw-bold">Detalles de {periodName}</Form.Label>
                            <Form.Control
                                as="textarea"
                                placeholder="¿Por qué estas materias no están en un periodo regular? ¿Son electivas?"
                                rows={7}
                                value={periodDetails.description}
                                onChange={(evt: ChangeEvent<HTMLTextAreaElement>) => {
                                    evt.preventDefault()
                                    actionSetAdditionalPeriodValue(periodName, 'description', evt.target.value)
                                }}
                            ></Form.Control>
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label className="fw-bold">Codigo electiva (opcional)</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Codigo de la electiva en el pensum (opcional)"
                                value={periodDetails.electiveCode}
                                onChange={(evt: ChangeEvent<HTMLTextAreaElement>) => {
                                    evt.preventDefault()
                                    actionSetAdditionalPeriodValue(periodName, 'electiveCode', evt.target.value)
                                }}
                            ></Form.Control>
                        </Form.Group>
                        <PensumDevTable periods={[periodDetails.mats]} periodIndexStart={periodName} />
                    </Card.Body>
                </Card>
            ))}

            <div className="d-flex mb-3">
                <button
                    type="button"
                    className="col btn btn-primary btn-action"
                    onClick={actionAddAdditionalPeriod}
                    title="Agregar grupo"
                >
                    <BiPlus />
                    <span className="btn-action-label">Nuevo grupo</span>
                </button>
            </div>

            <DragOverlay
                modifiers={[restrictToVerticalAxis]}
                style={{ marginLeft: '0.75rem', userSelect: 'none' }}
                className="row track-dragging"
            >
                {activeMat && <DevMatRow idx={0} mat={activeMat} />}
            </DragOverlay>
        </DndContext>
    )
}

export default PensumDevDisplayCards
