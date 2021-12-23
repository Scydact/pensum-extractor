import { useContext } from "react";

import { Button, Card, OverlayTrigger, Tooltip } from "react-bootstrap";
import { BiSave, BiCalculator, BiCheckDouble } from "react-icons/bi";

import { PortPensumSelectModalBtn } from "./PortSelection";
import { useNavigate } from "react-router-dom";
import { MatSelectionDispatchContext } from "contexts/mat-selection";
import ViewPensumSourceBtn from "./ViewPensumSrc";

// Todo: Move this to Pensum/Actions, and move the btns to this separate pane.
export default function PensumSaveActions() {
  const navigate = useNavigate()

  return <Card>
    <Card.Body className="d-flex gap-1 flex-column">

      <ViewPensumSourceBtn />

      <PortPensumSelectModalBtn><BiSave /> Guardar/Cargar Selección</PortPensumSelectModalBtn>

      <Button
        onClick={() => navigate('calcular-indice')}>
        <BiCalculator /> Calcular indice
      </Button>

      {/* Not so common, tbh... */}
      {/* <Button
        onClick={() => matSelectDispatch({ type: 'passOnCourse' })}>
        <BiCheckDouble /> Aprobar materias en curso
      </Button> */}
    </Card.Body>
  </Card>
}
