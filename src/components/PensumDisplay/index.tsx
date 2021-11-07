import Card from 'react-bootstrap/Card';
import PensumTable from "./PensumTable";

type Props = {
  pensum: Pensum.Pensum
}

function PensumDisplay({ pensum }: Props) {


  return <>
    <Card>
      <Card.Body className="pensum-table-container">
        <Card.Title>{pensum.career}</Card.Title>
        <PensumTable pensum={pensum} />
      </Card.Body>
    </Card>
  </>
}

export default PensumDisplay;