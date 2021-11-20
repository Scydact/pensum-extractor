import { Period, TableHead } from "./PensumTable";
import Container from "react-bootstrap/Container";

type Props = {
  loose: Pensum.Pensum['loose']
}

function PensumLoose({ loose }: Props) {
  if (loose.length === 0) return null;


  return <Container className="pensum-table">
    <TableHead periodNumStr={null} />
    <Period
      period={loose}
      periodNum={-1}
      cumlen={0} />
  </Container>
}

export default PensumLoose;