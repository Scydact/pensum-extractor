import { GenericModal} from "components/GenericModal";
import { MatSelectionTrackerContext, MatSelectionTrackerNameContext, MatSelectionTrackerStorageContext, MatSelectionDispatchContext } from "contexts/mat-selection";
import { useContext, useState } from "react";
import { Button } from "react-bootstrap";
import { GoCloudDownload, GoCloudUpload } from "react-icons/go";
import { BiReset } from "react-icons/bi";
import actions from "contexts/mat-selection/actions";

export function PortPensumSelectModal(props: any) {

  return (
    <GenericModal {...props} title="Portar progreso">
      <p>
        Las materias aprobadas seleccionadas se guardan localmente en la cache
        del navegador. Al estar guardados en la cache, estos datos podrian
        borrarse con una actualización.
      </p>
      <p>
        Para evitar la perdida de estos datos, se recomienda exportar la 
        seleccion como un archivo (progreso.json).
      </p>

      <Btns.TrackerImport />
      <Btns.TrackerExport />
      <Btns.TrackerReset />
    </GenericModal>
  )
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
    const onClick = () => {
      const txt = actions.export.selection(tracker);
      console.log(txt);
    }

    // TODO: ACTUALLY PROmPT DOWNLOAD. Use file-utils.download
    return <Button onClick={onClick}>
      <GoCloudDownload /> Exportar selección
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
        dispatch({ type: 'setTracker', payload: tracker })
        alert('No tiene materias en seguimiento');
      }
      catch (e) {
        alert(`Error al cargar: \n ${e}`)
      }
    }

    return <Button onClick={onClick}>
      <BiReset /> Reiniciar selección
    </Button>
  },
}