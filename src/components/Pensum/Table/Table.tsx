import './table.scss'
import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import { memo } from 'react'
import Period from './Period'
import { defaultPeriodType } from '@/functions/pensum-get-period-type'
import { MatRowTemplate } from './MatRow'

/** Headers for the pensum table. */
export const TableHead = memo((props: { periodNumStr?: string | null }) => {
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
    periodIndexStart?: number
    periodType?: Pensum.Pensum['periodType'] | null
}

/** Displays a pensum. */
function _PensumTable({ periods, periodIndexStart = 1, periodType = defaultPeriodType }: PensumTableProps) {
    // https://stackoverflow.com/a/55261098
    // CumLen is passed down to calculate if a row is even or odd.
    const cumulativeSum = (sum: number) => (value: number) => (sum += value)
    const cumlen = periods.map((x) => x.length).map(cumulativeSum(0))

    const periodElems = periods.map((period, key) => (
        <Period key={key} period={period} periodNum={key + periodIndexStart} cumlen={cumlen[key - 1]} />
    ))

    return (
        <Container className="pensum-table">
            <TableHead periodNumStr={periodType?.two} />
            <div className="pensum-table-body" data-empty-text="No hay materias que cumplan con el filtro actual.">
                {periodElems}
            </div>
        </Container>
    )
}

const PensumTable = memo(_PensumTable)
export default PensumTable
