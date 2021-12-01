import { useContext } from "react";
import PensumSelector from "./PensumSelector";
import PensumDisplay from "components/Pensum/PensumDisplay";
import ActivePensumContext from "contexts/active-pensum";
import PensumFilter from "./Filter";
import PensumInfo from "./PensumInfo";
import PensumProgress from "./PensumProgress";


type Props = any;

/** Main tab for the Pensum app. */
function PensumExtractor(props: Props) {
  const { state: { pensum } } = useContext(ActivePensumContext);

  return (<>
    <PensumSelector />

    {pensum && <>
      <PensumInfo info={pensum.info} />
      <PensumProgress />
      <PensumFilter />
      <PensumDisplay pensum={pensum} />
    </>
    }
  </>)
} 

export default PensumExtractor;