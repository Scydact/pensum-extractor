import Card from 'react-bootstrap/Card';
import { Period, TableHead } from "./PensumTable";
import Container from "react-bootstrap/Container";

type Props = {
  pensum: Pensum.Pensum
}

function PensumLoose({ pensum }: Props) {
  const { loose, periodType = {
    name: 'periodo',
    acronym: 'per',
    two: 'pr'
  } } = pensum;
  if (loose.length === 0) return null;


  return <Card>
    <Card.Body className="pensum-table-container">
      <Card.Title>Demás materias</Card.Title>
      <Container className="pensum-table">
        <TableHead periodNumStr={periodType.two} />
        <Period
          period={loose}
          periodNum={-1}
          cumlen={0} />
      </Container>
    </Card.Body>
  </Card>
}

export default PensumLoose;