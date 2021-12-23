import { useContext } from "react";
import PensumSelector from "./PensumSelector";
import PensumDisplay from "./PensumDisplayCards";
import ActivePensumContext from "contexts/active-pensum";
import PensumFilter from "./Filter/FilterCard";
import PensumInfo from "./PensumInfo";
import PensumProgress from "./PensumProgress";
import PensumActions from "./Actions/ActionsCard";


type Props = any;

/** Main tab for the Pensum app. */
function PensumExtractor(props: Props) {
  const { state: { pensum } } = useContext(ActivePensumContext);

  return (<>
    <PensumSelector />

    {pensum && <>
      <div className="d-md-flex gap-3">
        <PensumInfo info={pensum.info} className="flex-fill" />
        <PensumActions />
      </div>
      <PensumProgress />
      <PensumFilter />
      <PensumDisplay pensum={pensum} />
    </>
    }
  </>)
} 

export default PensumExtractor;