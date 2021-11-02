import { fetchCarreras } from "@functions/metadata-fetch";
import React, { FormEventHandler, useEffect, useMemo, useState } from "react";
import UniversitySelect from "./UniversitySelect";

import Select, { ActionMeta, SingleValue } from "react-select";
import CreatableSelect from "react-select/creatable";

type SelectProps = { label: string, value: string } | null;
// type SelectProps = React.ComponentProps<typeof Select>['onChange'];

type Props = {
  /** List of University objects */
  universityList: DataJson.University[],
  /** Selected university (code?) */
  university: string,
  /** Setter for the selected university */
  setUniversity: React.Dispatch<React.SetStateAction<string>>,
  /** Click handler for the LOAD button. */
  setPensum: (newPensum: SelectProps) => void,
  /** Initial Pensum */
  initialPensum?: SelectProps,
}


/** Simple form that manages ONLY University and Career selection. */
function PensumLoaderForm({
  universityList = [], university, setUniversity,
  setPensum, initialPensum }: Props) {

  const [pensumIndex, setPensumIndex] = useState(undefined as DataJson.PensumIndex | undefined);
  const [loadingCarreras, setLoadingCarreras] = useState(false);

  const [carreraInput, setCarreraInput] = useState(initialPensum);


  // Initial pensum override
  useEffect(() => {
    setCarreraInput(initialPensum);
  }, [initialPensum])


  // University select options
  const universitySelectOptions = useMemo(() =>
    universityList.map(x => ({ value: x.code, label: `[${x.shortName}] ${x.longName}` })),
    [universityList]);

  // Update the university list
  useEffect(() => {
    setUniversity(universityList[0]?.code)
    if (setPensum) setPensum(null);
  }, [universityList, setUniversity]);

  const handleUniversityChange = (newValue: SelectProps) => {
    if (!newValue) return;

    const {value, label} = newValue;
    setUniversity(value);
    setLoadingCarreras(true);

    if (newValue.value !== university)
      setCarreraInput(null);
  }



  // Carrera select options
  const pensumSelectOptions = useMemo(() =>
    (!pensumIndex) ? [] : pensumIndex.careers.map(x => ({ value: x.code, label: `[${x.code}] ${x.name}` })),
    [pensumIndex?.university]);

  // Fetch new carreras if university changes
  useEffect(() => {
    fetchCarreras(university)
      .then(pensumIndex => {
        setPensumIndex(pensumIndex)
      })
      .catch(e => {
        console.warn(`Unable to load pensums for ${university}: `, e);
        setPensumIndex(undefined)
      })
      .finally(() => {
        setLoadingCarreras(false);
      })
  }, [university]);

  const handlePensumChange = (newValue: SelectProps) => {
    setCarreraInput(newValue);
  }



  // On submit
  const handleSubmit = (evt: any) => {
    evt.preventDefault();
    if (setPensum) 
      setPensum(carreraInput as any);
  }


  return (
    <form onSubmit={handleSubmit}>

      <Select
        // defaultValue={universitySelectOptions[0]}
        value={universitySelectOptions.find(x => x.value === university)}
        options={universitySelectOptions}
        isSearchable={true}
        onChange={handleUniversityChange}
        name="university" />

      <CreatableSelect
        isClearable
        value={carreraInput}
        options={pensumSelectOptions}
        isLoading={loadingCarreras}
        loadingMessage={() => <span>Cargando carreras...</span>}
        onChange={handlePensumChange} />

      <input 
        type="submit"
        value="Cargar"
        disabled={!carreraInput} />
    </form>)
}

export default PensumLoaderForm;