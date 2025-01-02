import Card from 'react-bootstrap/Card'
import PensumDevTable from '@/components/Pensum/DevTable'
import { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'

import {
    DndContext,
    useDroppable,
    closestCenter,
    closestCorners,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    type DragEndEvent,
    DragOverlay,
    DragStartEvent,
    DragOverEvent,
    UniqueIdentifier,
    DragCancelEvent,
    CollisionDetection,
    pointerWithin,
    rectIntersection,
    getFirstCollision,
    MeasuringStrategy,
} from '@dnd-kit/core'
import { restrictToVerticalAxis } from '@dnd-kit/modifiers'
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable'
import DeveloperModeContext from '@/contexts/developer-mode'
import { DevMatRow } from '@/components/Pensum/DevTable/MatRow'
import ActivePensumContext from '@/contexts/active-pensum'
import { extractMat, findMat, findMatLocation, getPeriod, insertMat } from './mat-movement'

type Props = {}

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
    const { career, periods, loose, periodType } = pensum

    const [activeMatId, setActiveMatId] = useState<UniqueIdentifier | null>(null)
    const activeMat = typeof activeMatId === 'string' ? findMat(pensum, activeMatId) : null
    const lastOverId = useRef<UniqueIdentifier | null>(null)
    const recentlyMovedToNewContainer = useRef(false)
    const [clonedPensum, setClonedPensum] = useState<Pensum.Pensum | null>(null)

    const findPeriod = (id: UniqueIdentifier) => {
        if (typeof id === 'number') return id
        if (!(typeof id === 'string')) return -1
        const location = findMatLocation(pensum, id)
        if (!location) return -1
        return location.droppableId
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

            <Card className="pensum-table-container">
                <Card.Header>
                    <Card.Title>Demás materias</Card.Title>
                </Card.Header>
                <Card.Body>
                    <PensumDevTable periods={useMemo(() => [loose], [loose])} periodType={null} periodIndexStart={0} />
                </Card.Body>
            </Card>

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
