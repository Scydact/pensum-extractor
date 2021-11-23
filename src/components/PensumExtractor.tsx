import { useCallback, useContext } from "react";
import PensumSelector from "./PensumSelector";
import PensumDisplay from "components/PensumDisplay";
import ActivePensumContext from "contexts/active-pensum";
import { MatSelectionDispatchContext } from "contexts/mat-selection";
import { ToggleButton } from "react-bootstrap";
import "./PensumDisplay/mat-code-colors.scss"
import FilterModeSelector from "./PensumFilter/FilterModeSelector";
import PensumFilter from "./PensumFilter";


type Props = any;

/** Main tab for the Pensum app. */
function PensumExtractor(props: Props) {
  const { state: { pensum } } = useContext(ActivePensumContext);

  return (<>
    <PensumSelector />

    {pensum && <>
      <PensumFilter/>
      <PensumDisplay pensum={pensum} />
    </>
    }
  </>)
} 

export default PensumExtractor;