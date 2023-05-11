import { useCallback, useContext } from "react";
import { MatSelectionDispatchContext } from 'contexts/mat-selection';

import Row from 'react-bootstrap/Row';
import MatRow from "./MatRow";
import { Droppable, Draggable } from "react-beautiful-dnd";
import DeveloperModeContext from "contexts/developer-mode";
import { getPeriod, setPeriod } from "./mat-movement";
import ActivePensumContext from "contexts/active-pensum";


type PeriodProps = {
  period: Pensum.Mat[],
  periodNum: number,
  cumlen: number
};

/** Displays a single period from the pensum as table rows. */
export const Period = ({ period, periodNum, cumlen = 0 }: PeriodProps) => {
  const dispatch = useContext(MatSelectionDispatchContext);

  const onClick = useCallback((evt: any) => {
    dispatch({ type: 'selectPeriod', payload: period.map(x => x.code) });
  }, [period, dispatch]);

  const matrows = period.map((mat, i) =>
    <Draggable
      key={mat.code}
      draggableId={mat.code}
      index={i}>
      {(provided, snapshot) => <MatRow
        ref={provided.innerRef}
        {...provided.draggableProps}
        dragHandleProps={provided.dragHandleProps}
        key={mat.code}
        mat={mat}
        idx={i + cumlen} />}
    </Draggable>
  )

  return <div className="row-period">
    <Row
      className="row-period-dev-sidebar"
      onClick={onClick}
      data-value={periodNum}>
      <PeriodSideBar
        period={period}
        periodNum={periodNum}
      />
    </Row>

    <Droppable key={periodNum} droppableId={`${periodNum}`}>
      {(provided, snapshot) => (
        <Row
          className="row-mat-group"
          ref={provided.innerRef}
          {...provided.droppableProps}>
          {matrows}
          {provided.placeholder}
        </Row>
      )}
    </Droppable>


  </div>
}

export default Period;


function PeriodSideBar({ period, periodNum }: Omit<PeriodProps, 'cumlen'>) {
  const { commands, pensum } = useContext(DeveloperModeContext);
  const { state: { matData: { codeMap } } } = useContext(ActivePensumContext);
  const styleHiddenIfLoose = (periodNum === 0) ? { display: 'none' } : undefined; 
  return (
    <div className="d-flex align-items-center flex-wrap align-items-stretch" style={{ gap: '.25rem' }}>
      <b className="col d-flex align-items-center">Periodo #{periodNum}:</b>
      <button
        type="button"
        className="col btn btn-primary"
        style={styleHiddenIfLoose}
        onClick={() => {
          if (period.length) {
            const msg = 'Seguro que desea borrar este periodo?\n'
              + 'Todas las materias de este periodo se moveran a la categoria "Demás materias".\n'
              + period.map(mat => ` - [${mat.code}] ${mat.name}`).join('\n');
            if (!window.confirm(msg)) return;
          }
          const newPeriods = Array.from(pensum.periods);
          const idx = newPeriods.indexOf(period);
          newPeriods.splice(idx, 1);
          const newLoose = [...pensum.loose, ...period];
          commands.set({ ...pensum, periods: newPeriods, loose: newLoose });
        }}
      >
        Borrar periodo
      </button>
      <button
        type="button"
        className="col btn btn-primary"
        disabled={!period.length}
        onClick={() => {
          if (period.length) {
            const msg = 'Seguro que desea borrar las siguientes materias?\n'
              + period.map(mat => ` - [${mat.code}] ${mat.name}`).join('\n');
            if (!window.confirm(msg)) return;
          }
          const newPensum = { ...pensum };
          setPeriod(newPensum, periodNum, []);
          commands.set(newPensum);
        }}
      >
        Borrar materias
      </button>
      <button
        type="button"
        className="col btn btn-primary"
        disabled={!period.length}
        onClick={() => {
          const msg = 'Mover las materias al periodo...?\n'
            + '(0 == "Demás materias").\n'
            + period.map(mat => ` - [${mat.code}] ${mat.name}`).join('\n');
          const userInput = window.prompt(msg);
          if (!userInput) return;
          const idx = parseInt(userInput);
          const newPensum = { ...pensum };
          let nextPeriod = getPeriod(newPensum, idx);
          if (!nextPeriod) {
            window.alert(`Indice invalido! Debe ser entre 0 y ${pensum.periods.length}!`);
            return
          }
          nextPeriod = Array.from(nextPeriod);
          nextPeriod.push(...period);
          setPeriod(newPensum, idx, nextPeriod);
          setPeriod(newPensum, periodNum, []);
          commands.set(newPensum);
        }}
      >
        Mover materias
      </button>
      <button
        type="button"
        className="col btn btn-primary"
        onClick={() => {
          const newPensum = { ...pensum };
          const newPeriod = Array.from(period);
          let code = '';
          while (!code || codeMap.has(code)) {
            const n = Math.round((Math.random() * 1000) % 1000);
            const l = 'X' + randomLetters(2);
            code = l + n.toString().padStart(3, '0');
            console.log(code);
          }
          newPeriod.push({ code, name: '*Materia', req: [], cr: 1 })
          setPeriod(newPensum, periodNum, newPeriod);
          commands.set(newPensum);
        }}
      >
        Nueva materia
      </button>
      <button
        type="button"
        className="col btn btn-primary"
        style={styleHiddenIfLoose}
        onClick={() => {
          const newPensum = { ...pensum };
          const newPeriod = Array.from(period);
          let code = '';
          while (!code || codeMap.has(code)) {
            const n = Math.round((Math.random() * 1000) % 1000);
            const l = 'X' + randomLetters(2);
            code = l + n.toString().padStart(3, '0');
            console.log(code);
          }
          newPeriod.push({ code, name: '', req: [], cr: 1 })
          setPeriod(newPensum, periodNum, newPeriod);
          commands.set(newPensum);
        }}
      >
        Agregar periodo antes
      </button>
    </div>
  )
}

function randomLetter() {
  let lower = 'A'.charCodeAt(0);
  let upper = 'Z'.charCodeAt(0);
  let range = upper - lower;
  let code = ~~(Math.random() * range) + lower;
  return String.fromCharCode(code);
}

function randomLetters(amount: number) {
  return Array(amount).fill('').map(randomLetter).join('');
}