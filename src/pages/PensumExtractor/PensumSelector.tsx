import UniversityContext from "contexts/university-data";
import { memo, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { usePreviousValue } from "beautiful-react-hooks";

import { Button, Card, Container, Dropdown, DropdownButton, Form, InputGroup, Spinner } from "react-bootstrap";
import { FiSettings, FiDelete } from "react-icons/fi";
import { HiRefresh, HiUpload } from "react-icons/hi";
import { BiEraser } from "react-icons/bi";
import { MdOutlineCreate } from "react-icons/md";

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
 * (Populates the university/career list from the server.). */
function PensumSelector() {
  // Quite awful, just read this context from right to left.
  const { state: {
    pensum:   activePensum,
    error:    error_pensum,
    loading:  loading_pensum,
  },
    load:     loadPensum,
    dispatch: pensumDispatch,
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

  // ***************************************************************************
  // Submit btn content & state.
  // ***************************************************************************
  const submitBtnOpt = {
    disabled: false,
    content: 'Cargar' as React.ReactNode,
  }

  if (!pensumOnInput) {
    submitBtnOpt.disabled = true;
  }

  if (loading_pensum) {
    submitBtnOpt.content =
      <Spinner animation="border" size="sm">
        <span className="visually-hidden">Cargando...</span>
      </Spinner>
  }


  return (
    <Card>
      <Card.Body>
        <Container>
          {/* zIndex so that <Select> options are not covered by <MatFilter>. */}
          <Form onSubmit={handleSubmit} style={{ zIndex: 2, position: 'relative' }}>
            <SelectUni
              value={selectedUniversity}
              options={universitySelectOptions}
              isLoading={loading_uni}
              onChange={handleUniversityChange} />

            <SelectCareer
              value={pensumOnInput}
              options={careerSelectOptions}
              isLoading={loading_uni}
              onChange={setPensumOnInput} />

            <InputGroup className="w-100 d-flex">
              <Button
                type="submit"
                disabled={submitBtnOpt.disabled}
                className="flex-fill">
                {submitBtnOpt.content}
              </Button>
              <DropdownButton title={<FiSettings />}>
                <Dropdown.Item
                  disabled={!activePensum || !activePensum.src.url}>
                  <HiRefresh /> Forzar recarga
                </Dropdown.Item>
                <Dropdown.Item
                  disabled={!activePensum}
                  onClick={() => pensumDispatch({ type: 'clear' })}>
                  <FiDelete /> Remover pensum
                </Dropdown.Item>
                <Dropdown.Divider />
                <Dropdown.Item>
                  <HiUpload /> Subir pensum.json
                </Dropdown.Item>
                <Dropdown.Item>
                  <MdOutlineCreate /> Modo desarrollo
                </Dropdown.Item>
                <Dropdown.Item
                  onClick={() => pensumDispatch({ type: 'new' })}>
                  <BiEraser /> Crear desde cero
                </Dropdown.Item>
              </DropdownButton>
            </InputGroup>

            {error_uni && <p style={{ color: 'red' }}>{'Error @ uni: ' + String(error_uni)}</p>}
            {error_pensum && <p style={{ color: 'red' }}>{'Error @ pensum: ' + String(error_pensum)}</p>}
          </Form>
        </Container>
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