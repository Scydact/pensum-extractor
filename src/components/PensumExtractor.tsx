import { useContext } from "react";
import PensumSelector from "./PensumSelector";
import PensumDisplay from "components/PensumDisplay";
import ActivePensumContext from "contexts/active-pensum";


type Props = any;

function PensumExtractor(props: Props) {
  const { state: activePensum } = useContext(ActivePensumContext);

  return (<>  
    <PensumSelector />

    {activePensum && <PensumDisplay pensum={activePensum} />}
  </>)
} 

export default PensumExtractor;