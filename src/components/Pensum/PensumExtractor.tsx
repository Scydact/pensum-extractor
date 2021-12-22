import { useContext } from "react";
import PensumSelector from "./PensumSelector";
import PensumDisplay from "components/Pensum/PensumDisplay";
import ActivePensumContext from "contexts/active-pensum";
import PensumActions from "./Actions";
import PensumInfo from "./PensumInfo";
import PensumProgress from "./PensumProgress";
import PensumSaveActions from "./PensumSaveActions";
import { Col, Row } from "react-bootstrap";


type Props = any;

/** Main tab for the Pensum app. */
function PensumExtractor(props: Props) {
  const { state: { pensum } } = useContext(ActivePensumContext);

  return (<>
    <PensumSelector />

    {pensum && <>
      <div className="d-md-flex gap-3">
        <PensumInfo info={pensum.info} className="flex-fill" />
        <PensumSaveActions />
      </div>
      <PensumProgress />
      <PensumActions />
      <PensumDisplay pensum={pensum} />
    </>
    }
  </>)
} 

export default PensumExtractor;