import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import './style.scss';

type Props = {
  pensum: Pensum.Pensum
}

function TableHead({ hasCoReq }: { hasCoReq: boolean }) {

  return <Row className="pensum-header text-muted">
    <Col className="period-num">Qt.</Col>
    <Col>
      <Mat
        idx={0}
        hasCoReq={hasCoReq}
        mat={{
          code: 'Codigo',
          name: 'Asignatura',
          cr: 'Cr.',
          prereq: ['Pre-req'],
          coreq: ['Co-req'],
        } as any}
      />
    </Col>
  </Row>

  
}

function Mat({ mat, idx, hasCoReq }: { mat: Pensum.Mat, idx: number, hasCoReq: boolean }) {
  var cl = "mat-row";
  if (idx & 1) cl += ' even';

  return <Row className={cl} data-mat={mat.code}>
    <Col className="mat-code">{mat.code}</Col>
    <Col>
      <Row>
        <Col xs={6}>{mat.name}</Col>
        <Col xs={1}>{mat.cr}</Col>
        <Col>{mat.prereq.map(x => <span>{(typeof x === 'string') ? x : x.text} </span>)}</Col>
        {hasCoReq && <Col>{mat.coreq.map(x => <span>{(typeof x === 'string') ? x : x.text} </span>)}</Col>}
      </Row>
    </Col>
  </Row>
}

function Period({ period, cuat, cumlen = 0, hasCoReq }: { period: Pensum.Mat[], cuat: number, cumlen: number, hasCoReq: boolean }) {

  return <Row className="period">
    <Col className="period-num" data-value={cuat + 1}>{cuat + 1}</Col>
    <Col className="mat-group">{period.map((mat, i) =>
      <Mat
        key={mat.code}
        mat={mat}
        idx={i + cumlen}
        hasCoReq={hasCoReq} />
    )}
    </Col>
  </Row>
}

function PensumTable({ pensum }: Props) {
  const { periods } = pensum;

  // https://stackoverflow.com/a/55261098
  const cumulativeSum = (sum: number) => (value: number) => sum += value;
  const cumlen = periods.map(x => x.length).map(cumulativeSum(0))

  const hasCoReq = periods.some(period => period.some(mat => mat.coreq.length))

  return <Container className="pensum-table">
    <TableHead hasCoReq={hasCoReq}/>
    {periods.map((period, key) =>
      <Period
        key={key}
        period={period}
        cuat={key}
        cumlen={cumlen[key - 1]}
        hasCoReq={hasCoReq} />
    )}
  </Container>
}

export default PensumTable;