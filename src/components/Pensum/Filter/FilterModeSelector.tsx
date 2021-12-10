import Button from "react-bootstrap/Button";
import ButtonGroup from "react-bootstrap/ButtonGroup";
import { MatSelectionDispatchContext, MatSelectionModeContext } from "contexts/mat-selection";
import { useCallback, useContext } from "react";
import { classnames } from "lib/format-utils";
import "./filter.scss";

type Props = {
  entries: [MatSelection.TrackerMode, string][]
}

export function FilterModeSelector({ entries }: Props) {
  const mode = useContext(MatSelectionModeContext);
  const dispatch = useContext(MatSelectionDispatchContext);

  const Btns = useCallback(() => {
    const elems = [];

    for (const [key, val] of entries) {
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
  }, [entries, mode, dispatch]);

  return <ButtonGroup className="filter-selector filter-mode">
    <Btns />
  </ButtonGroup>
}


export default FilterModeSelector;