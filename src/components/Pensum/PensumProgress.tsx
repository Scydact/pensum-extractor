import ActivePensumContext from "contexts/active-pensum";
import { MatSelectionTrackerContext } from "contexts/mat-selection";
import { useContext } from "react";
import "./progress.scss";

import Card from "react-bootstrap/Card";
import ProgressBar from "react-bootstrap/ProgressBar";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";

export default function PensumProgress() {
  const data = useGradeProgress();
  
  const percentPassed = 100 * data.creds.passed / data.creds.total;
  const percentCourse = 100 * data.creds.course / data.creds.total;

  return <Card className="pensum-progress-container">

    <Card.Header className="text-center pt-3">
      <ProgressBar>
        <ProgressBar
          striped
          now={percentPassed}
          className="passed"
          style={{ backgroundColor: 'var(--mat-bg)' }} />
        <ProgressBar
          striped
          now={percentCourse}
          className="course"
          style={{ backgroundColor: 'var(--mat-bg)' }} />
      </ProgressBar>
      <Card.Title>Progreso en la carrera</Card.Title>
    </Card.Header>

    <Card.Body>

      <Row>
        <Col className="text-sm-end fw-bold">Materias: </Col>
        <Col>
          <Percent 
            n={data.mats.passed} 
            total={data.mats.total}
            extra={data.mats.course}
            cl="course" />
        </Col>
      </Row>

      <Row>
        <Col className="text-sm-end fw-bold">Creditos: </Col>
        <Col>
        <Percent 
            n={data.creds.passed} 
            total={data.creds.total}
            extra={data.creds.course}
            cl="course" />
        </Col>
      </Row>

    </Card.Body>
  </Card>

} 

type PercentProps = {
  n: number,
  total: number,
  extra?: number,
  cl?: string
}

function Percent({ n, total, extra = 0, cl = '' }: PercentProps) {
  const pBase =  (total !== 0) ? (100 * n     / total).toFixed(2) : '100';
  const pExtra = (total !== 0) ? (100 * extra / total).toFixed(2) : '100';

  const extraText = (extra > 0) ? `en curso: ${extra} (+${pExtra}%)` : '';

  return <div className="pensum-progress-value">
    <div>{n}/{total} ({pBase}%)</div>
    <div className={'extra ' + cl}>{extraText}</div>
  </div>
}

/** Analizes pensum progress */
function useGradeProgress() {
  const tracker = useContext(MatSelectionTrackerContext);
  const { state } = useContext(ActivePensumContext);

  const matList = state.matData.list;

  const out = {
      creds: {
        total: 0,
        passed: 0,
        course: 0,
      },
      mats: {
        total: matList.length,
        passed: 0,
        course: 0,
      }
  };

  for (let i = 0; i < matList.length; i++) {
    const mat = matList[i];
    out.creds.total += mat.cr;

    if (tracker.passed.has(mat.code)) {
      out.creds.passed += mat.cr;
      out.mats.passed++;
    }

    else if (tracker.course.has(mat.code)) {
      out.creds.course += mat.cr;
      out.mats.course++;
    }
  }

  return out;
}