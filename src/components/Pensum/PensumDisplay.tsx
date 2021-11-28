import Card from 'react-bootstrap/Card';
import PensumTable from "./Table";

type Props = {
  pensum: Pensum.Pensum
}

function PensumDisplay({ pensum }: Props) {
  const { career, periods, loose, periodType } = pensum;

  return <>
    <Card>
      <Card.Body className="pensum-table-container">
        <Card.Title>{career}</Card.Title>
        <PensumTable periods={periods} periodType={periodType} />
      </Card.Body>
    </Card>

    {loose && (loose.length > 0) &&
      <Card>
        <Card.Body className="pensum-table-container">
          <Card.Title>Demás materias</Card.Title>
          <PensumTable periods={[loose]} periodType={null} periodIndexStart={0} />
        </Card.Body>
      </Card>
    }

  </>
}

export default PensumDisplay;