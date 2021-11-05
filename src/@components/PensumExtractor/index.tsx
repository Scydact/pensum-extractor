import { fetchPensumFromCode } from "@functions/pensum-fetch";
import {  initialUniversityData, universityDataReducer } from "@reducers/university-data";
import { useReducer, useState } from "react";
import PensumSelector from "../PensumSelector";


type Props = any;
type SelectType = { label: string, value: string } | null

function PensumExtractor(props: Props) {

  const [uniList, uniListDispatch] = useReducer(
    universityDataReducer,
    initialUniversityData,
  );

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
      setCurrentPensum(data as any); // TODO: Convert SavePensum to an actual pensum.
    })()
  }

  return (<>
    <header className="App-header">
      PENSUMS UNAPEC
    </header>
    
    <PensumSelector 
      initialPensum={currentPensumCode}
      setPensum={handlePensumChange}
      universityData={uniList}
      universityDispatcher={uniListDispatch}/>


    <div style={{textAlign: "left", whiteSpace: "pre"}}>{JSON.stringify(currentPensum, null, 4).split('\n').map(x => (<p>{x}</p>))}</div>
  </>)
} 

export default PensumExtractor;