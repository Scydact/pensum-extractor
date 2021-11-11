import { fetchCarreras, fetchUniversities } from "functions/metadata-fetch";
import UniversityContext, { UniversityData } from "contexts/university-data";
import React, { useContext, useEffect, useMemo, useState } from "react";

import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import Card from "react-bootstrap/Card";
import Container from "react-bootstrap/Container";

import Select from "react-select";
import CreatableSelect from "react-select/creatable";
import selectTheme, { optionStyle } from "lib/DarkMode/select-theme";
import { sortByProp } from "lib/sort-utils";

type SelectProps = { label: string, value: string } | null;
// type SelectProps = React.ComponentProps<typeof Select>['onChange'];

type Props = {
  universityData: UniversityData.Payload,
  universityDispatcher: React.Dispatch<UniversityData.Action>
  /** Click handler for the LOAD button. */
  setPensum: (newPensum: SelectProps) => void,
  /** Initial Pensum */
  initialPensum?: SelectProps,
}


/** Simple form that manages ONLY University and Career selection (Populates the university/career list from the server.). */
function PensumSelector({ setPensum, initialPensum }: Props) {

  
  const { state: universityData, dispatch: universityDispatcher } = useContext(UniversityContext);
  const {universities, selected: selectedUni, loading, error} = universityData;

  const [pensumList, setPensumList] = useState(undefined as PensumJson.PensumIndex | undefined);
  const [pensumOnInput, setPensumOnInput] = useState(initialPensum);


  // Initial pensum override
  useEffect(() => {
    setPensumOnInput(initialPensum);
  }, [initialPensum])


  // University select options
  const universitySelectOptions = useMemo(() =>
    universityData.universities.map(
      x => ({ value: x.code, label: `[${x.shortName}] ${x.longName}` })),
    [universityData.universities]);


  // Update the university list if university changes
  useEffect(() => {
    universityDispatcher({type: "set/selected", payload: universities[0] || null})
    if (setPensum) setPensum(null); // TODO: Change to a reducer... 
  }, [universities]);


  // On user change university selection
  const handleUniversityChange = (newValue: SelectProps) => {
    if (!newValue) {
      universityDispatcher({type: "set/selected", payload: null})
      return;
    }
    
    const selected = universities.find(x => x.code === newValue.value) || null;
    universityDispatcher({ type: "set/selected", payload: selected });
      
    if (newValue.value !== selected?.code)
      setPensumOnInput(null);
  }



  // Carrera select options
  const pensumSelectOptions = useMemo(() => {
    if (!pensumList) return [];

    const o =  pensumList.careers
    .sort(sortByProp("code"))
    

    console.log(o);
    return o.map(x => ({ value: x.code, label: `[${x.code}] ${x.name}` }));
  }, [pensumList]);


  // Fetch new carreras if university changes
  useEffect(() => {
    // No university selected. No pensum on the index.
    if (!selectedUni) {
      setPensumList(undefined);
      setPensumOnInput(null);
      return;
    }

    // Start fetching pensum index list.
    universityDispatcher({ type: "set/loading", payload: true })
    fetchCarreras(selectedUni?.code)
      .then(pensumList => {
        setPensumList(pensumList)
      })
      .catch(e => {
        console.warn(`Unable to load pensums for ${selectedUni?.code}: `, e);
        setPensumList(undefined)
      })
      .finally(() => {
        universityDispatcher({ type: "set/loading", payload: false })
      })
  }, [selectedUni, universityDispatcher]);

  const handlePensumChange = (newValue: SelectProps) => {
    setPensumOnInput(newValue);
  }



  // On submit
  const handleSubmit = (evt: any) => {
    evt.preventDefault();
    if (setPensum) 
      setPensum(pensumOnInput as any);
  }


  const outForm = (
    <Form onSubmit={handleSubmit}>

      <Select
        // defaultValue={universitySelectOptions[0]}
        value={universitySelectOptions.find(x => x.value === selectedUni?.code)}
        options={universitySelectOptions}
        isSearchable={true}
        isLoading={loading}
        onChange={handleUniversityChange as any} // as any to be able to use selectStyles without TS panicking.
        name="university" 
        className="mb-2"
        theme={selectTheme}
        styles={optionStyle}/>

      <CreatableSelect
        isClearable
        value={pensumOnInput}
        options={pensumSelectOptions}
        isLoading={loading}
        loadingMessage={() => <span>Cargando carreras...</span>}
        onChange={handlePensumChange as any} // as any to be able to use selectStyles
        className="mb-2"
        theme={selectTheme}
        styles={optionStyle}/>

      <Button
        type="submit"
        disabled={!pensumOnInput}
        className="w-100">
      Cargar
      </Button>

      {(error) ? <p style={{ color: 'red' }}>{String(error)}</p> : null}
    </Form>)


  return (
    <Card>
      <Card.Body>
        {outForm}
      </Card.Body>
    </Card>
  )
}

export default PensumSelector;