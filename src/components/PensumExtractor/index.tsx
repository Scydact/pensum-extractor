import { fetchPensumFromCode } from "functions/pensum-fetch";
import { useContext, useEffect, useReducer, useState } from "react";
import Card from "react-bootstrap/Card";
import Navbar from "react-bootstrap/Navbar";
import PensumSelector from "../PensumSelector";
import PensumDisplay from "components/PensumDisplay";
import UniversityContext from "contexts/university-data";
import ActivePensumContext from "contexts/active-pensum";


type Props = any;

function PensumExtractor(props: Props) {
  const { state: activePensum } = useContext(ActivePensumContext);

  

  useEffect(() => {
    console.log(activePensum);
  }, [activePensum]);

  return (<>  
    <PensumSelector />

    {activePensum && <PensumDisplay pensum={activePensum} />}
    
    {/* <div style={{textAlign: "left", whiteSpace: "pre"}}>{JSON.stringify(currentPensum, null, 4).split('\n').map(x => (<p>{x}</p>))}</div> */}
  </>)
} 

export default PensumExtractor;