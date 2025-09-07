import Card from 'react-bootstrap/Card'
import PensumTable from '@/components/Pensum/Table'
import MatCode from '@/components/MatCode'
import { useContext } from 'react'
import PensumRowNodesContext from '@/contexts/pensum-row-nodes'

type Props = {
    pensum: Pensum.Pensum
}

function PensumDisplayCards({ pensum }: Props) {
    const { career, periods, loose, additionalPeriods, periodType } = pensum
    const { scrollToRow } = useContext(PensumRowNodesContext)

    return (
        <>
            <Card className="pensum-table-container">
                <Card.Header>
                    <Card.Title>{career}</Card.Title>
                </Card.Header>
                <Card.Body>
                    <PensumTable periods={periods} periodType={periodType} />
                </Card.Body>
            </Card>

            {loose.length > 0 && (
                <Card className="pensum-table-container">
                    <Card.Header>
                        <Card.Title>Demás materias</Card.Title>
                    </Card.Header>
                    <Card.Body>
                        <PensumTable periods={[loose]} periodIndexStart={0} />
                    </Card.Body>
                </Card>
            )}

            {Object.entries(additionalPeriods).length > 0 &&
                Object.entries(additionalPeriods).map(([periodName, periodDetails]) => (
                    <Card className="pensum-table-container">
                        <Card.Header>
                            <Card.Title className="d-flex align-items-center gap-2">
                                {periodDetails.electiveCode && (
                                    <MatCode
                                        data={periodDetails.electiveCode}
                                        onClick={() => scrollToRow(periodDetails.electiveCode)}
                                    />
                                )}
                                {periodName}
                            </Card.Title>
                        </Card.Header>
                        <Card.Body>
                            {periodDetails.description && (
                                <p style={{ whiteSpace: 'pre-wrap' }}>{periodDetails.description}</p>
                            )}
                            <PensumTable periods={[periodDetails.mats]} periodIndexStart={0} />
                        </Card.Body>
                    </Card>
                ))}
        </>
    )
}

export default PensumDisplayCards
