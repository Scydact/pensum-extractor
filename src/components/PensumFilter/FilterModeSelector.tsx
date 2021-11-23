import Button from "react-bootstrap/Button";
import ButtonGroup from "react-bootstrap/ButtonGroup";
import { MatSelectionDispatchContext, MatSelectionModeContext } from "contexts/mat-selection";
import { useCallback, useContext } from "react";
import InputGroup from "react-bootstrap/InputGroup";
import Card from "react-bootstrap/Card";
import { classnames } from "lib/format-utils";
import "./filter.css";

function FilterModeSelector() {
  const mode = useContext(MatSelectionModeContext);
  const dispatch = useContext(MatSelectionDispatchContext);

  const Btns = useCallback(() => {
    const obj = {
      'passed': 'Aprobar',
      'course': 'Cursar',
    };

    const elems = [];

    for (const [key, val] of Object.entries(obj)) {
      elems.push(<Button
        key={key}
        className={classnames([
          key,
          (mode === key) ? 'active' : 'not-active',
        ])}
        onClick={() => dispatch({ type: 'selectMode', payload: key as any })}>
        {val}
      </Button>)
    }

    return <>{elems}</>;
  }, [mode, dispatch]);

  return <ButtonGroup className="filter-selector filter-mode">
    <Btns />
  </ButtonGroup>
}


export default FilterModeSelector;