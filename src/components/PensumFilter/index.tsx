import Card from "react-bootstrap/Card";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import FilterModeSelector from "./FilterModeSelector";
import FilterVisibilitySelector from "./FilterVisibilitySelector";



function PensumFilter() {
  return <Card >
    <Card.Body>
    <Container>

      <Row>
        <Col>
          <Row><span className="text-center">Modo de selección:</span></Row>
          <Row><FilterModeSelector /></Row>
        </Col>
        <Col>
          <Row><span className="text-center">Mostrar solo:</span></Row>
          <Row><FilterVisibilitySelector /></Row>
        </Col>
      </Row>
      
    </Container>
    </Card.Body>
  </Card>
}

export default PensumFilter;