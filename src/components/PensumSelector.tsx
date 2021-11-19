import UniversityContext from "contexts/university-data";
import React, { memo, useCallback, useContext, useEffect, useMemo, useState } from "react";

import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import Card from "react-bootstrap/Card";
import Spinner from "react-bootstrap/Spinner";

import Select from "react-select";
import CreatableSelect from "react-select/creatable";
import selectTheme, { optionStyle } from "lib/DarkMode/select-theme";
import { sortByProp } from "lib/sort-utils";
import ActivePensumContext from "contexts/active-pensum";
import { usePreviousValue } from "beautiful-react-hooks";

// type SelectProps = React.ComponentProps<typeof Select>['onChange'];
type SelectProps = { label: string, value: string } | null;

/** Creates a formatted label, for use with this component's <Select> labels. */
function createLabelString(code: string, name: string) {
  return `[${code}] ${name}`;
}


/** Simple form that manages University and Career selection 
 * (Populates the university/career list from the server.). */
function PensumSelector() {
  // Quite awful, just read this context from right to left.
  const { state: {
      pensum:   activePensum,
      error:    error_pensum,
      loading:  loading_pensum,
    },
    load: loadPensum,
  } = useContext(ActivePensumContext);

  const {
    state:  universityData,
    select: selectUniversity,
  } = useContext(UniversityContext);

  const {
    universities,
    selected: selected_uni,
    loading:  loading_uni,
    error:    error_uni,
  } = universityData;

  const [pensumOnInput, setPensumOnInput] = useState(null as SelectProps);
  const previousPensum = usePreviousValue(activePensum);


  // ***************************************************************************
  // Carrera select form <options>
  // Maps careers from {code, name} to {value, label}
  // ***************************************************************************
  const careerSelectOptions = useMemo(() => {
    const pensumList = selected_uni?.careers;
    if (!pensumList) return [];

    const o = pensumList.sort(sortByProp("code"));

    return o.map(x => ({ value: x.code, label: createLabelString(x.code, x.name) }));
  }, [selected_uni]);

  
  // ***************************************************************************
  // On pensum change
  //  If the pensum changed, do:
  //  1. Auto select university from the active pensum.
  //  2. Update the selected career <select> value.
  // ***************************************************************************
  useEffect(() => {
    // If pensums are the same, nothing to change!
    if (activePensum === previousPensum) return;
    // If no pensum is selected, there's nothing to "select"!
    if (!activePensum) return;
    
    // Select university
    selectUniversity(activePensum.institution);

    // Try to find existing label
    const careerOption = careerSelectOptions.find(x => x.value === activePensum.code)
      || {
      value: activePensum.code,
      label: createLabelString(activePensum.code, activePensum.career),
    };
    setPensumOnInput(careerOption);

  }, [activePensum, previousPensum, careerSelectOptions, selectUniversity]);


  // ***************************************************************************
  // University select
  // ***************************************************************************
  const universitySelectOptions = useMemo(() => universities.map(
    x => ({ value: x.code, label: createLabelString(x.shortName, x.longName) })),
    [universities]);

  const selectedUniversity = useMemo(() => (universitySelectOptions.find(
    x => x.value === selected_uni?.code) || null),
    [universitySelectOptions, selected_uni]);

  // On user change university selection
  const handleUniversityChange = useCallback((newValue: SelectProps) => {
    selectUniversity(newValue?.value || null);
  }, [selectUniversity]);


  // ***************************************************************************
  // On submit
  // ***************************************************************************
  const handleSubmit = useCallback((evt?: any) => {
    if (evt) evt.preventDefault();
    const uni = selected_uni?.code || '';
    const code = pensumOnInput?.value || '';
    loadPensum(uni, code);
  }, [loadPensum, selected_uni, pensumOnInput]);

  return (
    <Card>
      <Card.Body>
        <Form onSubmit={handleSubmit}>
          <SelectUni
            value={selectedUniversity}
            options={universitySelectOptions}
            isLoading={loading_uni}
            onChange={handleUniversityChange} />

          <SelectCareer
            value={pensumOnInput}
            options={careerSelectOptions}
            isLoading={loading_uni}
            onChange={setPensumOnInput}/>

          <Button
            type="submit"
            disabled={!pensumOnInput}
            className="w-100">
            {(!loading_pensum) ?
              'Cargar' :
              <Spinner animation="border" size="sm"><span className="visually-hidden">Cargando...</span></Spinner>}
          </Button>

          {error_uni && <p style={{ color: 'red' }}>{'Error @ uni: ' + String(error_uni)}</p>}
          {error_pensum && <p style={{ color: 'red' }}>{'Error @ pensum: ' + String(error_pensum)}</p>}
        </Form>
      </Card.Body>
    </Card>
  )
}


// ***************************************************************************
// University select
// ***************************************************************************
type CustomSelectProps = {
  value: SelectProps,
  options: SelectProps[],
  isLoading: boolean,
  onChange: Function,
}

const SelectUni = memo(
  function SelectUni({ value, options, isLoading, onChange }: CustomSelectProps) {
    return (<>
      <label className="form-label mb-0 small">Universidad</label>
      <Select
        // defaultValue={universitySelectOptions[0]}
        value={value}
        options={options}
        isSearchable={true}
        isLoading={isLoading}
        onChange={onChange as any} // as any to be able to use selectStyles without TS panicking.
        name="university"
        className="mb-2"
        theme={selectTheme}

        placeholder="Seleccione una universidad..."
        styles={optionStyle} />
    </>
    )
  }
);


// ***************************************************************************
// Career select
// ***************************************************************************
const SelectCareer = memo(
  function SelectCareer({ value, options, isLoading, onChange }: CustomSelectProps) {
    return (<>
      <label className="form-label mb-0 small">Carrera</label>
      <CreatableSelect
        isClearable
        value={value}
        options={options}
        isLoading={isLoading}
        loadingMessage={() => <span>Cargando carreras...</span>}
        onChange={onChange as any} // as any to be able to use selectStyles
        className="mb-2"
        theme={selectTheme}

        placeholder="Seleccione o escriba una carrera o su codigo..."
        styles={optionStyle} />
    </>
    )
  }
);



export default PensumSelector;