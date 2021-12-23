import { GenericModal} from "components/GenericModal";
import { MatSelectionTrackerContext, MatSelectionDispatchContext } from "contexts/mat-selection";
import { useContext, useState } from "react";
import { Button } from "react-bootstrap";
import { GoCloudUpload } from "react-icons/go";
import { BiReset, BiSave } from "react-icons/bi";
import actions from "contexts/mat-selection/actions";
import { download } from "lib/file-utils";
import ActivePensumContext from "contexts/active-pensum";
import { idDateFormat, toPascalCase } from "lib/format-utils";
import "./style.css";

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
        borrarse con una actualización.
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

const s = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
  gap: '.5em',
}


export function PortPensumSelectModalBtn(props: any) {
  const [portOpen, setPortOpen] = useState(false);
  return <>
    <Button onClick={() => setPortOpen(prev => !prev)}>
      {props.children}
    </Button>
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
      const txt = prompt('Insert tracker json');
      try {
        const obj = JSON.parse(txt || '');
        const tracker = actions.import.selection(obj);
        dispatch({ type: 'setTracker', payload: tracker })
        alert('Cargadas:\n'
          + `  - ${tracker.passed.size} materias pasadas.\n`
          + `  - ${tracker.course.size} materias en curso.\n`)
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