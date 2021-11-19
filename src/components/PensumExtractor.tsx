import { useCallback, useContext } from "react";
import PensumSelector from "./PensumSelector";
import PensumDisplay from "components/PensumDisplay";
import ActivePensumContext from "contexts/active-pensum";
import { MatSelectionDispatchContext } from "contexts/mat-selection";
import { ToggleButton } from "react-bootstrap";


type Props = any;

function PensumExtractor(props: Props) {
  const { state: { pensum } } = useContext(ActivePensumContext);
  const dispatch = useContext(MatSelectionDispatchContext);

  // TODO: This is not it... move it to its own component.
  const changeMode1 = useCallback(() => {
    dispatch({type: 'selectMode', payload: 'course'})
  }, [dispatch])
  const changeMode2 = useCallback(() => {
    dispatch({type: 'selectMode', payload: 'passed'})
  }, [dispatch])

  return (<>  
    <PensumSelector />

    <ToggleButton onClick={changeMode1} value="Course" />
    <ToggleButton onClick={changeMode2} value="Passed" />

    {pensum && <PensumDisplay pensum={pensum} />}
  </>)
} 

export default PensumExtractor;