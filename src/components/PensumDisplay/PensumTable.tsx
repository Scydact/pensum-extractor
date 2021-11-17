import './table.scss';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import MatCode from './MatCode';
import React from 'react';
import { toTitleCase } from 'lib/format-utils';

type Props = {
  pensum: Pensum.Pensum
}

/** Headers for the pensum table. */
const TableHead = React.memo((props: {periodNumStr: string}) => {  // Memo makes this thing pure, and never update >:D (if props don't change).

  const processedPeriod = `${toTitleCase(props.periodNumStr)}.`;
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

/** Displays a single Mat as from the pensum a table row. */
function MatRow({ mat, idx }: { mat: Pensum.Mat, idx: number }) {
  var cl = "row-mat";
  if (idx & 1) cl += ' even'; // technically should be odd, but i don't care enough.

  const reqs = [] as JSX.Element[];
  // reqs.push(...mat.prereq.map((x, i) => <span key={i}>{(typeof x === 'string') ? x : x.text} </span>));
  // reqs.push(...mat.coreq.map((x, i) => <span key={i+1000}>{(typeof x === 'string') ? x : x.text} </span>));
  reqs.push(...mat.prereq.map((x, i) => <MatCode key={i} data={x} type='prereq'/>));

  return <Row className={cl} data-mat={mat.code}>
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

/** Displays a single period from the pensum as table rows. */
export const Period = React.memo(({ period, periodNum, cumlen = 0 }: { period: Pensum.Mat[], periodNum: number, cumlen: number}) => {

  return <Row className="row-period">
    <Col className="row-period-num" data-value={periodNum + 1}>{periodNum + 1}</Col> {/** TODO: Poner en variable global si se maneja por "cuatrimestre/trimestre/semestre", y reflejar aqui. */}
    <Col className="row-mat-group">{period.map((mat, i) =>
      <MatRow
        key={mat.code}
        mat={mat}
        idx={i + cumlen} />
    )}
    </Col>
  </Row>
});

/** Displays a pensum. */
function PensumTable({ pensum }: Props) {
  const { periods, periodType = {
    name: 'periodo',
    acronym: 'per',
    two: 'pr'
  } } = pensum;

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