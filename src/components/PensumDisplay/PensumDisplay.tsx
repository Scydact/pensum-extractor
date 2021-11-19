import Card from 'react-bootstrap/Card';
import PensumLoose from './PensumLoose';
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
    
    <PensumLoose pensum={pensum} />
  </>
}

export default PensumDisplay;