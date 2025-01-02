import Card from 'react-bootstrap/Card'
import PensumTable from '@/components/Pensum/Table'

type Props = {
    pensum: Pensum.Pensum
}

function PensumDisplayCards({ pensum }: Props) {
    const { career, periods, loose, periodType } = pensum

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

            {loose && loose.length > 0 && (
                <Card className="pensum-table-container">
                    <Card.Header>
                        <Card.Title>Demás materias</Card.Title>
                    </Card.Header>
                    <Card.Body>
                        <PensumTable periods={[loose]} periodType={null} periodIndexStart={0} />
                    </Card.Body>
                </Card>
            )}
        </>
    )
}

export default PensumDisplayCards
