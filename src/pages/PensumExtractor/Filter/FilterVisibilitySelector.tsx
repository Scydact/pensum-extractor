import { MatSelectionDispatchContext, MatSelectionFilterContext } from '@/contexts/mat-selection'
import { classnames } from '@/lib/format-utils'
import { useCallback, useContext } from 'react'
import Button from 'react-bootstrap/Button'
import ButtonGroup from 'react-bootstrap/ButtonGroup'
import './filter.scss'

type Props = {
    entries: [MatSelection.TrackerMode | null, string][]
}

export function FilterVisibilitySelector({ entries }: Props) {
    const filter = useContext(MatSelectionFilterContext)
    const dispatch = useContext(MatSelectionDispatchContext)

    const Btns = useCallback(() => {
        const elems = []

        for (const [key, val] of entries) {
            elems.push(
                <Button
                    key={key}
                    className={classnames([key || 'default', !filter.has(key) ? 'active' : 'not-active'])}
                    onClick={() => dispatch({ type: 'toggleFilter', payload: key })}
                >
                    {val}
                </Button>,
            )
        }

        return <>{elems}</>
    }, [entries, filter, dispatch])

    return (
        <ButtonGroup className="filter-selector filter-filter">
            <Btns />
        </ButtonGroup>
    )
}

export default FilterVisibilitySelector
