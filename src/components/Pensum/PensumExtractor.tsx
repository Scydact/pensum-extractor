import { useContext } from "react";
import PensumSelector from "./PensumSelector";
import PensumDisplay from "components/Pensum/PensumDisplay";
import ActivePensumContext from "contexts/active-pensum";
import PensumFilter from "./Filter";


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