import { useContext } from "react";
import PensumSelector from "./PensumSelector";
import PensumDisplay from "components/PensumDisplay";
import ActivePensumContext from "contexts/active-pensum";


type Props = any;

function PensumExtractor(props: Props) {
  const { state: activePensum } = useContext(ActivePensumContext);
  const pensum = activePensum.pensum;

  return (<>  
    <PensumSelector />

    {pensum && <PensumDisplay pensum={pensum} />}
  </>)
} 

export default PensumExtractor;