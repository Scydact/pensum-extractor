import { useContext, useState } from "react";
import { Button, ButtonProps } from "react-bootstrap";
import { GoCloudUpload } from "react-icons/go";
import { BiReset, BiSave } from "react-icons/bi";

import { MatSelectionTrackerContext, MatSelectionDispatchContext } from "contexts/mat-selection";
import actions from "contexts/mat-selection/actions";
import ActivePensumContext from "contexts/active-pensum";

import { GenericModal} from "components/GenericModal";
import { download, upload } from "lib/file-utils";
import { idDateFormat, toPascalCase } from "lib/format-utils";
import "./style.css";
import TooltipButton from "components/TooltipButton";

const MatColor = ({ children, style, ...rest }: any) =>
  <span
    style={{ ...style, color: 'var(--mat-fg-color, inherit)' }}
    {...rest}>
    {children}
  </span >

export function PortPensumSelectModal(props: any) {

  return (
    <GenericModal {...props} title="Portar progreso">
      <p>
        Las materias <MatColor className="passed">aprobadas</MatColor> y <MatColor className="course">en curso </MatColor> 
        seleccionadas se guardan localmente en la cache del navegador. 
        Al estar guardados en la cache, estos datos podrian
        borrarse espontaneamente.
      </p>
      <p>
        Para evitar la perdida de estos datos, se recomienda exportar la 
        seleccion como un archivo (progreso.json).
      </p>
      <div className="port-select-btn-container">
        <Btns.TrackerExport />
        <Btns.TrackerImport />
        <Btns.TrackerReset />
      </div>
    </GenericModal>
  )
}


export function PortPensumSelectModalBtn({ children, tooltip, ...rest }: ButtonProps & { children: any, tooltip: any }) {
  const [portOpen, setPortOpen] = useState(false);
  return <>
    <TooltipButton tooltip={tooltip} onClick={() => setPortOpen(prev => !prev)} {...rest}>
      {children}
    </TooltipButton>
    <PortPensumSelectModal show={portOpen} onHide={() => setPortOpen(p => !p)} />
  </>
}



const Btns = {
  TrackerExport: () => {
    const tracker = useContext(MatSelectionTrackerContext)
    const { state: { pensum } } = useContext(ActivePensumContext)

    const pensumName = toPascalCase((pensum?.career || 'NA').toLowerCase())
    const date = idDateFormat(new Date())

    const filename = `seleccion_${pensumName}_${date}.json`

    const onClick = () => {
      const txt = actions.export.selection(tracker)
      download(txt, filename)
    }

    return <Button onClick={onClick}>
      <BiSave /> Exportar selección
    </Button>
  },

  
    // TODO: ACTUALLY PRMOPT UPLOAD. Use file-utils.upload
  TrackerImport: () => {
    const dispatch = useContext(MatSelectionDispatchContext)
    const onClick = () => {
      try {
        upload('.json').then(txt => {
          if (typeof txt !== 'string') 
            throw new Error('Error al leer archivo!');

          const obj = JSON.parse(txt || '');

          const tracker = actions.import.selection(obj);

          dispatch({ type: 'setTracker', payload: tracker })
          alert('Cargadas:\n'
            + `  - ${tracker.passed.size} materias pasadas.\n`
            + `  - ${tracker.course.size} materias en curso.\n`)
        })
      }
      catch (e) {
        alert(`Error al cargar: \n ${e}`);
      }
    }

    return <Button onClick={onClick}>
      <GoCloudUpload /> Importar selección
    </Button>
  },

  
  TrackerReset: () => {
    const dispatch = useContext(MatSelectionDispatchContext)
    const onClick = () => {
      try {
        const tracker = actions.import.selection({});
        if (window.confirm('Seguro que quiere reiniciar su progreso?'))
          dispatch({ type: 'setTracker', payload: tracker })
      }
      catch (e) {
        alert(`Error al reiniciar (esto no deberia pasar): \n ${e}`)
      }
    }

    return <Button onClick={onClick}>
      <BiReset /> Reiniciar selección
    </Button>
  },
}