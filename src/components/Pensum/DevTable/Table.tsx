import { memo } from 'react'
import { Col, Container, Row } from 'react-bootstrap'

import { defaultPeriodType } from '@/functions/pensum-get-period-type'
import { MatRowTemplate } from '../Table/MatRow'
import DevPeriod from './Period'
import './table.scss'

/** Headers for the pensum table. */
const TableHead = memo((props: { periodNumStr?: string | null }) => {
    // Memo makes this thing pure, and never update >:D (if props don't change).

    const processedPeriod = props.periodNumStr || ''

    return (
        <Row className="pensum-header row-period">
            <Col className="row-period-num">{processedPeriod}</Col>
            <Col className="row-mat-group">
                <MatRowTemplate
                    rowProps={{ className: 'row-mat' }}
                    elems={{
                        checkmark: null,
                        code: 'Código',
                        name: 'Asignatura',
                        cr: 'Cr.',
                        reqs: 'Requisitos',
                    }}
                />
            </Col>
        </Row>
    )
})

type PensumTableProps = {
    periods: Pensum.Pensum['periods']
    periodIndexStart?: number | string
    periodType?: Pensum.Pensum['periodType'] | null
}

/**
 * Display the given periods.
 * Adds a simple header for each period.
 */
export default function PensumDevTable({
    periods,
    periodIndexStart = 1,
    periodType = defaultPeriodType,
}: PensumTableProps) {
    // https://stackoverflow.com/a/55261098
    // CumLen is passed down to calculate if a row is even or odd.
    const cumulativeSum = (sum: number) => (value: number) => (sum += value)
    const cumlen = periods.map((x) => x.length).map(cumulativeSum(0))

    return (
        <Container className="pensum-table pensum-table-dev">
            <TableHead periodNumStr={periodType?.two} />
            <div className="pensum-table-body" data-empty-text="No hay materias que cumplan con el filtro actual.">
                {periods.map((period, key) => (
                    <DevPeriod
                        key={key}
                        period={period}
                        periodKey={typeof periodIndexStart === 'number' ? key + periodIndexStart : periodIndexStart}
                        cumlen={cumlen[key - 1]}
                    />
                ))}
            </div>
        </Container>
    )
}
