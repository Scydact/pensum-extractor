import { Button, Card } from "react-bootstrap";
import { BiSave, BiCalculator } from "react-icons/bi";

import { PortPensumSelectModalBtn } from "./ImportExportSelection";
import { useNavigate } from "react-router-dom";
import ViewPensumSourceBtn from "./ViewPensumSrc";
import { OrgChartIcon } from "pages/MatOrgChart/MatOrgChart";

// Todo: Move this to Pensum/Actions, and move the btns to this separate pane.
export default function PensumSaveActions() {
  const navigate = useNavigate()

  return <Card className="flex-shrink-0">
    <Card.Body className="d-flex gap-1 flex-column">

      <ViewPensumSourceBtn />

      <PortPensumSelectModalBtn><BiSave /> Guardar/Cargar Selección</PortPensumSelectModalBtn>

      <Button
        onClick={() => navigate('calcular-indice')}>
        <BiCalculator /> Calcular indice
      </Button>

      <Button
        onClick={() => navigate('diagrama')}>
        <OrgChartIcon/> Organigrama
      </Button>

      {/* Not so common, tbh... */}
      {/* <Button
        onClick={() => matSelectDispatch({ type: 'passOnCourse' })}>
        <BiCheckDouble /> Aprobar materias en curso
      </Button> */}
    </Card.Body>
  </Card>
}
