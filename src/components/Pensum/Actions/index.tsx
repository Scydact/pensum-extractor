import { memo, useContext } from "react";
import { FilterModeSelector, FilterVisibilitySelector } from "components/Pensum/Filter";
import { Card, Col, Container, Row, Button, ButtonGroup } from "react-bootstrap";
import { MatSelectionDispatchContext } from "contexts/mat-selection";
import { useNavigate } from "react-router-dom";



const PensumActions = memo(() => {
  const modeEntries: React.ComponentProps<typeof FilterModeSelector>['entries'] = [
    ['passed', 'Aprobar'],
    ['course', 'Cursar'],
  ];

  const visibleEntries: React.ComponentProps<typeof FilterVisibilitySelector>['entries'] = [
    [null, 'Pendientes'],
    ['course', 'Cursando'],
    ['passed', 'Aprobadas'],
  ];

  return <Card >
    <Card.Body>
      <Container className="d-flex flex-column gap-3">

        <Row>
          <Col>
            <Row><span className="text-center">Acciones:</span></Row>
            <Row><ActionButtons /></Row>
          </Col>
        </Row>

        <Row>

          <Col>
            <Row><span className="text-center">Modo de selección:</span></Row>
            <Row><FilterModeSelector entries={modeEntries} /></Row>
          </Col>

          <Col>
            <Row><span className="text-center">Mostrar solo:</span></Row>
            <Row><FilterVisibilitySelector entries={visibleEntries} /></Row>
          </Col>
        </Row>

      </Container>
    </Card.Body>
  </Card>
})


const ActionButtons = () => {
  const matSelectDispatch = useContext(MatSelectionDispatchContext)
  const navigate = useNavigate()

  const btnVariant = "outline-secondary"
  
  return <ButtonGroup vertical>
    <Button
      variant={btnVariant}
      onClick={() => matSelectDispatch({ type: 'passOnCourse' })}>
      Aprobar materias en curso
    </Button>
    
    <Button
      variant={btnVariant}
      onClick={() => navigate('calcular-indice')}>
      Calcular indice
    </Button>
  </ButtonGroup>
}

export default PensumActions;