import './table.scss';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import MatCode from './MatCode';
import React, { useCallback, useContext } from 'react';
import { classnames, toTitleCase } from 'lib/format-utils';
import { matSelectHelpers, MatSelectionDispatchContext, MatSelectionTrackerContext } from 'contexts/mat-selection';

/** Headers for the pensum table. */
export const TableHead = React.memo((props: { periodNumStr: string | null }) => {
  // Memo makes this thing pure, and never update >:D (if props don't change).
  
  const processedPeriod = (props.periodNumStr) ? `${toTitleCase(props.periodNumStr)}.` : '';
  
  return <Row className="pensum-header row-period">
    <Col className="row-period-num">{processedPeriod}</Col>
    <Col className="row-mat-group">
      <Row className="row-mat">
        <Col className="row-code">Código</Col>
        <Col>
          <Row>
            <Col className="row-name">Asignatura</Col>
            <Col className="row-cr">Cr.</Col>
            <Col className="row-prereq">Requisitos</Col>
          </Row>
        </Col>
      </Row>
    </Col>
  </Row>
})



type MatRowProps = {
  mat: Pensum.Mat,
  idx: number
};

/** Displays a single Mat as from the pensum a table row. */
function MatRow({ mat, idx }: MatRowProps) {
  const dispatch = useContext(MatSelectionDispatchContext);
  const tracker = useContext(MatSelectionTrackerContext);

  // Classes. Any falsy values will be discarded
  const cl = [
    "row-mat",
    (idx & 1) && 'even', // technically should be odd, but i don't care enough.
    matSelectHelpers.getTracker(tracker, mat.code),
  ];

  const reqs = [
    ...mat.prereq.map((x, i) => <MatCode key={i       } data={x} type='prereq'/>),
    ...mat.coreq.map( (x, i) => <MatCode key={i + 1000} data={x} type='coreq' />),
  ] as JSX.Element[];

  const onClick = useCallback((evt: any) => {
    dispatch({ type: 'select', payload: mat.code });
  }, [mat, dispatch])

  return <Row className={classnames(cl)} data-mat={mat.code}>
    <Col className="row-code code">{mat.code}</Col>
    <Col>
      <Row>
        <Col className="row-name click-target" onClick={onClick}>{mat.name}</Col>
        <Col className="row-cr">{mat.cr}</Col>
        <Col className="row-req">{reqs}</Col>
      </Row>
    </Col>
  </Row>
}



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

  if (period.length === 0) return null;

  return <Row className="row-period">
    <Col
      className="row-period-num click-target"
      onClick={onClick}
      data-value={periodNum + 1}>
      {periodNum + 1}
    </Col>
    <Col className="row-mat-group">
      {period.map((mat, i) =>
        <MatRow
          key={mat.code}
          mat={mat}
          idx={i + cumlen} />
      )}
    </Col>
  </Row>
}


type PensumTableProps = {
  periods: Pensum.Pensum['periods']
  periodType?: Pensum.Pensum['periodType']
}

const defaultPeriodType = {
  name: 'periodo',
  acronym: 'per',
  two: 'pr'
};

/** Displays a pensum. */
function PensumTable({ periods, periodType = defaultPeriodType }: PensumTableProps) {

  // https://stackoverflow.com/a/55261098
  // CumLen is passed down to calculate if a row is even or odd.
  const cumulativeSum = (sum: number) => (value: number) => sum += value;
  const cumlen = periods.map(x => x.length).map(cumulativeSum(0))

  return <Container className="pensum-table">
    <TableHead periodNumStr={periodType.two} />
    {periods.map((period, key) =>
      <Period
        key={key}
        period={period}
        periodNum={key}
        cumlen={cumlen[key - 1]} />
    )}
  </Container>
}

export default PensumTable;