import './table.scss';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import MatCode from './MatCode';
import React, { useCallback, useContext, useEffect, useRef } from 'react';
import { classnames, toTitleCase } from 'lib/format-utils';
import { matSelectHelpers, MatSelectionDispatchContext, MatSelectionFilterContext, MatSelectionModeContext, MatSelectionTrackerContext } from 'contexts/mat-selection';

/** Headers for the pensum table. */
export const TableHead = React.memo((props: { periodNumStr?: string | null }) => {
  // Memo makes this thing pure, and never update >:D (if props don't change).
  
  const processedPeriod = (props.periodNumStr) ? `${toTitleCase(props.periodNumStr)}.` : '';
  
  return <Row className="pensum-header row-period">
    <Col className="row-period-num">{processedPeriod}</Col>
    <Col className="row-mat-group">
      <Row className="row-mat">
        <Col className="row-check"></Col>
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

const trackerCheckmarks = new Map([
  ['passed', '✅'],
  ['course', '🔳'],
  [null, '⬜'],
]);

/** Displays a single Mat as from the pensum a table row. */
function MatRow({ mat, idx }: MatRowProps) {
  const rowRef = useRef<HTMLDivElement>(null);
  const clickableRef = useRef<HTMLDivElement>(null);

  const dispatch = useContext(MatSelectionDispatchContext);
  const tracker = useContext(MatSelectionTrackerContext);
  const trackerMode = useContext(MatSelectionModeContext);

  const currentTracker = matSelectHelpers.getTracker(tracker, mat.code);
  
  // Classes. Any falsy values will be discarded
  const cl = [
    "row-mat",
    (idx & 1) && 'even',  // Mark the mat as even, if the index is odd????? lol.
    currentTracker,       // Color according to the tracker.

    // On hover, will clicking this set the tracker or not?
    'mat-hover-' + (currentTracker === trackerMode ? 'default' : trackerMode),
  ];

  const reqs = [
    ...mat.prereq.map((x, i) => <MatCode key={i       } data={x} type='prereq'/>),
    ...mat.coreq.map( (x, i) => <MatCode key={i + 1000} data={x} type='coreq' />),
  ] as JSX.Element[];

  // On hover INSIDE THE MAT CHECKBOX, change the background of the ENTIRE ROW.
  useEffect(() => {
    const cbMouseEnter = () => {
      rowRef.current?.classList.add('track-hover');
    }
    const cbMouseLeave = () => {
      rowRef.current?.classList.remove('track-hover');
    }

    const clickable = clickableRef.current;

    if (!clickable) return;

    clickable.addEventListener('mouseenter', cbMouseEnter);
    clickable.addEventListener('mouseleave', cbMouseLeave);
    return () => {
      clickable.removeEventListener('mouseenter', cbMouseEnter);
      clickable.removeEventListener('mouseleave', cbMouseLeave);
    }
  }, [rowRef, clickableRef]);

  const onClick = useCallback((evt: any) => {
    dispatch({ type: 'select', payload: mat.code });
  }, [mat.code, dispatch])

  return <Row
    ref={rowRef}
    className={classnames(cl)}
    data-mat={mat.code}>
    <Col ref={clickableRef} onClick={onClick} className="row-check click-target">
      {trackerCheckmarks.get(currentTracker) || '⬜x'}
    </Col>
    <Col className="row-code code">{mat.code}</Col>
    <Col>
      <Row>
        <Col className="row-name">{mat.name}</Col>
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
  const trackerMode = useContext(MatSelectionModeContext);
  const tracker = useContext(MatSelectionTrackerContext);
  const filter = useContext(MatSelectionFilterContext);

  const isAllMatsOnSameTracker = period.every(mat => tracker[trackerMode]?.has(mat.code));
  const commonTracker = matSelectHelpers.getCommonTracker(tracker, period.map(mat => mat.code));

  // css classes
  const cl = [
    'row-period-num', 
    'click-target',

    // Hover color according to tracker mode.
    'table-hover-' + ((isAllMatsOnSameTracker) ? 'default' : trackerMode),

    // Common tracker sets period color only if all mats have a tracker in common.
    commonTracker,
  ];


  const filteredPeriod = period.filter(mat => {
    const tr = matSelectHelpers.getTracker(tracker, mat.code);
    return !filter.has(tr);
  });


  const onClick = useCallback((evt: any) => {
    dispatch({ type: 'selectPeriod', payload: filteredPeriod.map(x => x.code) });
  }, [filteredPeriod, dispatch]);

  if (filteredPeriod.length === 0) return null;

  const matrows = filteredPeriod.map((mat, i) =>
    <MatRow
      key={mat.code}
      mat={mat}
      idx={i + cumlen} />
  )

  return <Row className="row-period">
    <Col
      className={classnames(cl)}
      onClick={onClick}
      data-value={periodNum}>
      {periodNum}
    </Col>
    <Col className="row-mat-group">
      {matrows}
    </Col>
  </Row>
}


type PensumTableProps = {
  periods: Pensum.Pensum['periods'],
  periodIndexStart?: number,
  periodType?: Pensum.Pensum['periodType'] | null
}

const defaultPeriodType = {
  name: 'periodo',
  acronym: 'per',
  two: 'pr'
};

/** Displays a pensum. */
function PensumTable({ periods, periodIndexStart = 1, periodType = defaultPeriodType }: PensumTableProps) {
  
  // https://stackoverflow.com/a/55261098
  // CumLen is passed down to calculate if a row is even or odd.
  const cumulativeSum = (sum: number) => (value: number) => sum += value;
  const cumlen = periods.map(x => x.length).map(cumulativeSum(0))

  const periodElems = periods.map((period, key) =>
    <Period
      key={key}
      period={period}
      periodNum={key + periodIndexStart}
      cumlen={cumlen[key - 1]} />
  );
  
  return <Container className="pensum-table">
    <TableHead periodNumStr={periodType?.two} />
    <div 
    className="pensum-table-body"
    data-empty-text="No hay materias que cumplan con el filtro actual.">
      {periodElems}
    </div>
  </Container>
}

export default PensumTable;