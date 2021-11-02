import { fetchCarreras } from "@functions/metadata-fetch";
import { fetchPensumFromCode } from "@functions/pensum-fetch";
import { FormEventHandler, useEffect, useMemo, useState } from "react";
import PensumLoaderForm from "./PensumLoaderForm";
import UniversitySelect from "./UniversitySelect";

type Props = {
  universityList: DataJson.University[],
}

type SelectType = { label: string, value: string } | null

function PensumExtractor({universityList = []}: Props) {
  const [university, setUniversity] = useState('');
  const [currentPensumCode, setCurrentPensumCode] = useState(null as SelectType);

  const [currentPensum, setCurrentPensum] = useState(null as (DataJson.Pensum | null))


  const handlePensumChange = (newPensum: SelectType) => {
    (async function() {
      // Do loading here
      setCurrentPensumCode(newPensum);

      if (!newPensum) {
        // TODO: Remove current table
        return;
      }

      const data = await fetchPensumFromCode(university, newPensum.value);
      setCurrentPensum(data);
    })()
  }

  return (<>
    <header className="App-header">
      PENSUMS UNAPEC
    </header>
    
    <PensumLoaderForm 
      initialPensum={currentPensumCode}
      setPensum={handlePensumChange}
      universityList={universityList}
      university={university}
      setUniversity={setUniversity}/>


    <p>{JSON.stringify(currentPensum)}</p>
  </>)
} 

export default PensumExtractor;