import { fetchCarreras, fetchUniversities } from "@functions/metadata-fetch";
import { UniversityData, universityDataReducer } from "@reducers/university-data";
import React, { FormEventHandler, useEffect, useMemo, useState } from "react";

import Select, { ActionMeta, SingleValue } from "react-select";
import CreatableSelect from "react-select/creatable";

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
function PensumSelector({
  universityData,
  universityDispatcher,
  setPensum, initialPensum }: Props) {

  const {universities, selected: selectedUni, careers, loading, error} = universityData;

  const [pensumList, setPensumList] = useState(undefined as PensumJson.PensumIndex | undefined);
  const [pensumOnInput, setPensumOnInput] = useState(initialPensum);

  // Load university list
  useEffect(() => {
    fetchUniversities()
      .then(unis => {
        universityDispatcher({ type: 'set/universities', payload: unis.universities })
      })
      .catch(e => {
        universityDispatcher({ type: 'set/error', payload: e })
      })
      .finally(() => {
        universityDispatcher({ type: 'set/loading', payload: false })
      })
  }, [])


  // Initial pensum override
  useEffect(() => {
    setPensumOnInput(initialPensum);
  }, [initialPensum])


  // University select options
  const universitySelectOptions = useMemo(() =>
    universityData.universities.map(
      x => ({ value: x.code, label: `[${x.shortName}] ${x.longName}` })),
    [universityData.universities]);

  // Update the university list
  useEffect(() => {
    universityDispatcher({type: "set/selected", payload: universities[0] || null})
    if (setPensum) setPensum(null);
  }, [universityData.universities]);

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
  const pensumSelectOptions = useMemo(() =>
    (!pensumList) ? [] : pensumList.careers.map(x => ({ value: x.code, label: `[${x.code}] ${x.name}` })),
    [pensumList?.university]);

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
  }, [selectedUni]);

  const handlePensumChange = (newValue: SelectProps) => {
    setPensumOnInput(newValue);
  }



  // On submit
  const handleSubmit = (evt: any) => {
    evt.preventDefault();
    if (setPensum) 
      setPensum(pensumOnInput as any);
  }


  return (
    <form onSubmit={handleSubmit}>

      <Select
        // defaultValue={universitySelectOptions[0]}
        value={universitySelectOptions.find(x => x.value === selectedUni?.code)}
        options={universitySelectOptions}
        isSearchable={true}
        isLoading={loading}
        onChange={handleUniversityChange}
        name="university" />

      <CreatableSelect
        isClearable
        value={pensumOnInput}
        options={pensumSelectOptions}
        isLoading={loading}
        loadingMessage={() => <span>Cargando carreras...</span>}
        onChange={handlePensumChange} />

      <input 
        type="submit"
        value="Cargar"
        disabled={!pensumOnInput} />

      {(error) ? <p>{String(error)}</p> : null}
    </form>)
}

export default PensumSelector;