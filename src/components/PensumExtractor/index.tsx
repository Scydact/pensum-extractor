import { fetchPensumFromCode } from "functions/pensum-fetch";
import { useContext, useReducer, useState } from "react";
import Card from "react-bootstrap/Card";
import Navbar from "react-bootstrap/Navbar";
import PensumSelector from "../PensumSelector";
import PensumDisplay from "components/PensumDisplay";
import UniversityContext from "contexts/university-data";


type Props = any;
type SelectType = { label: string, value: string } | null

function PensumReducer(
  state: any,
  action: { type: string, payload?: any }): any {

    switch (action.type) {


      default:
        console.warn('Unknown action "' + action.type + '".')
        return state;
    }
}


function PensumExtractor(props: Props) {
  const { state: uniList, dispatch: uniListDispatch } = useContext(UniversityContext);
  const [currentPensumCode, setCurrentPensumCode] = useState(null as SelectType);
  const [currentPensum, setCurrentPensum] = useState(null as (Pensum.Pensum | null))

  const handlePensumChange = (newPensum: SelectType) => {
    (async function() {
      // Do loading here
      setCurrentPensumCode(newPensum);

      if (!newPensum) {
        // TODO: Remove current table
        return;
      }

      const data = await fetchPensumFromCode(uniList.selected?.code, newPensum.value);
      setCurrentPensum(data); // TODO: Convert SavePensum to an actual pensum.
    })()
  }

  



  return (<>  
    <PensumSelector
      initialPensum={currentPensumCode}
      setPensum={handlePensumChange}
      universityData={uniList}
      universityDispatcher={uniListDispatch} />

    {currentPensum && <PensumDisplay pensum={currentPensum} />}
    
    {/* <div style={{textAlign: "left", whiteSpace: "pre"}}>{JSON.stringify(currentPensum, null, 4).split('\n').map(x => (<p>{x}</p>))}</div> */}
  </>)
} 

export default PensumExtractor;