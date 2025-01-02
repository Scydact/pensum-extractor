import { memo } from 'react'
import { Card, Col, Container, Row } from 'react-bootstrap'
import FilterModeSelector from './FilterModeSelector'
import FilterVisibilitySelector from './FilterVisibilitySelector'

const PensumActions = memo(() => {
    const modeEntries: React.ComponentProps<typeof FilterModeSelector>['entries'] = [
        ['passed', 'Aprobar'],
        ['course', 'Cursar'],
    ]

    const visibleEntries: React.ComponentProps<typeof FilterVisibilitySelector>['entries'] = [
        [null, 'Pendientes'],
        ['course', 'Cursando'],
        ['passed', 'Aprobadas'],
    ]

    return (
        <Card>
            <Card.Body>
                <Container className="d-flex flex-column gap-3">
                    <Row>
                        <Col>
                            <Row>
                                <span className="text-center">Modo de selección:</span>
                            </Row>
                            <Row>
                                <FilterModeSelector entries={modeEntries} />
                            </Row>
                        </Col>

                        <Col>
                            <Row>
                                <span className="text-center">Mostrar solo:</span>
                            </Row>
                            <Row>
                                <FilterVisibilitySelector entries={visibleEntries} />
                            </Row>
                        </Col>
                    </Row>
                </Container>
            </Card.Body>
        </Card>
    )
})

export default PensumActions
