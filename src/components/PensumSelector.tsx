import { fetchCarreras } from "functions/metadata-fetch";
import UniversityContext from "contexts/university-data";
import { useContext, useEffect, useMemo, useState } from "react";

import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import Card from "react-bootstrap/Card";

import Select from "react-select";
import CreatableSelect from "react-select/creatable";
import selectTheme, { optionStyle } from "lib/DarkMode/select-theme";
import { sortByProp } from "lib/sort-utils";
import ActivePensumContext from "contexts/active-pensum";

// type SelectProps = React.ComponentProps<typeof Select>['onChange'];
type SelectProps = { label: string, value: string } | null;

/** Creates a formatted label, for use with this component's <Select> labels. */
function createLabelString(code: string, name: string) {
  return `[${code}] ${name}`;
}

/** Simple form that manages University and Career selection 
 * (Populates the university/career list from the server.). 
 * Also loads the required pensum. */
function PensumSelector() {
  const { state: { pensum: activePensum, error: error_pensum }, dispatch: activePensumDispatcher } = useContext(ActivePensumContext);
  const { state: universityData, dispatch: universityDispatcher } = useContext(UniversityContext);
  const {universities, selected: selectedUni, loading, error: error_uni} = universityData;

  const [pensumList, setPensumList] = useState(undefined as PensumJson.PensumIndex | undefined);
  const [pensumOnInput, setPensumOnInput] = useState(null as SelectProps);


  // On active pensum change (may be triggered by this same element, or not?)
  useEffect(() => {
    if (activePensum) {
      // Set selected university
      const uni = universities.find(x => x.code === activePensum.institution);
      if (uni) universityDispatcher({ type: 'set/selected', payload: uni });

      // Set career
      const careerOption = careerSelectOptions.find(x => x.value === activePensum.code)
        || {
        value: activePensum.code,
        label: createLabelString(activePensum.code, activePensum.career),
      };
      setPensumOnInput(careerOption);

    } else {
      setPensumOnInput(null);
    }
  }, [
    activePensum,
    activePensum?.code,
    activePensum?.career,
    activePensum?.institution
  ]);


  // University select options
  const universitySelectOptions = useMemo(() =>
    universityData.universities.map(
      x => ({ value: x.code, label: createLabelString(x.shortName, x.longName) })),
    [universityData, universityData.universities]);


  // Update the university list if university changes
  useEffect(() => {
    universityDispatcher({type: "set/selected", payload: universities[0] || null});
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
  const careerSelectOptions = useMemo(() => {
    if (!pensumList) return [];

    const o = pensumList.careers.sort(sortByProp("code"));

    return o.map(x => ({ value: x.code, label: createLabelString(x.code, x.name) }));
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
    activePensumDispatcher({type: 'load', payload: {
      university: selectedUni?.code || '',
      code: pensumOnInput?.value || '',
    }});
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
        options={careerSelectOptions}
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

      {error_uni && <p style={{ color: 'red' }}>{'Error @ uni: ' + String(error_uni)}</p>}
      {error_pensum && <p style={{ color: 'red' }}>{'Error @ pensum: ' + String(error_pensum)}</p>}
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