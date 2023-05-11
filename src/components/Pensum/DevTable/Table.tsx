import { memo, useContext } from 'react';
import { Col, Row, Container } from 'react-bootstrap';
import { DragDropContext, DropResult } from "react-beautiful-dnd";

import './table.scss';
import Period from './Period';
import { defaultPeriodType } from 'functions/pensum-get-period-type';
import DeveloperModeContext from 'contexts/developer-mode';
import moveMat from './mat-movement';
import { MatRowTemplate } from '../Table/MatRow';
 

/** Headers for the pensum table. */
export const TableHead = memo((props: { periodNumStr?: string | null }) => {
  // Memo makes this thing pure, and never update >:D (if props don't change).

  const processedPeriod = props.periodNumStr || '';

  return <Row className="pensum-header row-period">
    <Col className="row-period-num">{processedPeriod}</Col>
    <Col className="row-mat-group">
      <MatRowTemplate
        rowProps={{ className: "row-mat" }}
        elems={{
          checkmark: null,
          code: 'Código',
          name: 'Asignatura',
          cr: 'Cr.',
          reqs: 'Requisitos',
        }}
      />
    </Col>
  </Row>
})








type PensumTableProps = {
  periods: Pensum.Pensum['periods'],
  periodIndexStart?: number,
  periodType?: Pensum.Pensum['periodType'] | null
}

/** Displays a pensum. */
function PensumTable({ periods, periodIndexStart = 1, periodType = defaultPeriodType }: PensumTableProps) {
  const { commands, pensum } = useContext(DeveloperModeContext);
  // https://stackoverflow.com/a/55261098
  // CumLen is passed down to calculate if a row is even or odd.
  const cumulativeSum = (sum: number) => (value: number) => sum += value;
  const cumlen = periods.map(x => x.length).map(cumulativeSum(0))

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    const newPensum = moveMat({ ...pensum }, result.source, result.destination);
    if (newPensum) {
      commands.set(newPensum);
    } else {
      console.warn('Invalid movement!');
    }
  } 


  const periodElems = periods.map((period, key) =>
    <Period
      key={key}
      period={period}
      periodNum={key + periodIndexStart}
      cumlen={cumlen[key - 1]} />
  );
  
  return <DragDropContext onDragEnd={onDragEnd} > 
    <Container className="pensum-table">
      <TableHead periodNumStr={periodType?.two} />
      <div 
      className="pensum-table-body"
      data-empty-text="No hay materias que cumplan con el filtro actual.">
        {periodElems}
      </div>
    </Container>
  </DragDropContext>
}

export default PensumTable;