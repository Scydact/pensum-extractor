import { Card } from 'react-bootstrap'
import { BiSave, BiCalculator } from 'react-icons/bi'

import { PortPensumSelectModalBtn } from './ImportExportSelection'
import { useNavigate } from 'react-router-dom'
import ViewPensumSourceBtn from './ViewPensumSrc'
import { OrgChartIcon } from '@/pages/MatOrgChart/MatOrgChart'
import TooltipButton from '@/components/TooltipButton'

// Todo: Move this to Pensum/Actions, and move the btns to this separate pane.
export default function PensumSaveActions() {
    const navigate = useNavigate()

    const variant = 'secondary'

    return (
        <Card className="flex-shrink-0">
            <Card.Body className="d-flex gap-1 flex-column">
                <PortPensumSelectModalBtn
                    variant="success"
                    tooltip="Se recomienda guardar una copia local de su selección!"
                >
                    <BiSave /> Guardar/Cargar Selección
                </PortPensumSelectModalBtn>

                <ViewPensumSourceBtn variant={variant} />

                <TooltipButton
                    variant={variant}
                    tooltip="Simular el indice resultante de las notas de las materias seleccionadas"
                    onClick={() => navigate('calcular-indice')}
                >
                    <BiCalculator /> Calcular indice
                </TooltipButton>

                <TooltipButton
                    variant={variant}
                    tooltip="Visualizar todas las materias como un organigrama. Permite ver la jerarquía de las materias."
                    onClick={() => navigate('diagrama')}
                >
                    <OrgChartIcon /> Organigrama
                </TooltipButton>

                {/* Not so common, tbh... */}
                {/* <Button variant="outline-secondary"
        onClick={() => matSelectDispatch({ type: 'passOnCourse' })}>
        <BiCheckDouble /> Aprobar materias en curso
      </Button> */}
            </Card.Body>
        </Card>
    )
}
