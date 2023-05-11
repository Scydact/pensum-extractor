
import { useParams, Navigate, useNavigate } from "react-router-dom";
import { useContext } from "react";
import ActivePensumContext from "contexts/active-pensum";

import Modal from "react-bootstrap/Modal";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Button from "react-bootstrap/Button";
import MatCode, { LongMatCode } from "components/MatCode";
import PensumRowNodesContext from "contexts/pensum-row-nodes";
import getPeriodType from "functions/pensum-get-period-type";
import { OrgChartIcon } from "pages/MatOrgChart/MatOrgChart";
import { ButtonGroup } from "react-bootstrap";
import { FaRegListAlt } from "react-icons/fa";
import { difference } from "lodash";


export default function Details() {
  const { state: { matData, pensum } } = useContext(ActivePensumContext);
  const { map: rowNodeMap, scrollToRow } = useContext(PensumRowNodesContext);

  const navigate = useNavigate();
  const params = useParams();
  const code = params.code;

  if (!code) return <Navigate to="/mat" />;

  const mat = matData.codeMap.get(code);
  if (!mat) return <Invalid code={code} />;

  const title = <><MatCode data={mat.code} /> <span>{mat.name}</span></>;

  const periodName = (getPeriodType(pensum).name) + ':';
  const generalInfo = <Container>
    <Row>
      <Col className="text-end">Código:</Col>
      <Col>{mat.code}</Col>
    </Row>
    <Row>
      <Col className="text-end">Créditos:</Col>
      <Col>{mat.cr}</Col>
    </Row>
    <Row>
      <Col className="text-end">{periodName}</Col>
      <Col>{matData.periodMap.get(mat.code)}</Col>
    </Row>
  </Container>;

  const isMatHiddenOnPensum = !rowNodeMap.current.get(mat.code)?.current;
  const locateBtn = <ButtonGroup vertical>
      <Button 
      disabled={isMatHiddenOnPensum}
      onClick={() => {
        navigate('/');
        scrollToRow(mat.code);
      }}>
        <FaRegListAlt /> Localizar en pensum
      </Button>

      <Button 
      disabled={isMatHiddenOnPensum}
      onClick={() => {
        navigate(`/diagrama?mat=${mat.code}`);
      }}>
        <OrgChartIcon /> Localizar en organigrama
      </Button>
  </ButtonGroup>

  /** Requirement callback factory.
   * Creates a onClick handler for the mat reqs.
   */
  const reqCbFactory = (mat: Pensum.Requirement) =>
    (typeof mat === 'string') ? () => navigate('/mat/' + mat) : undefined;

  const prereqs = difference(mat.req, matData.coreqMap.get(mat.code) ?? []);
  const reqInfo = (prereqs.length > 0) && <Container>
    <Row>Pre-requisitos:</Row>
    <Row>
      {prereqs.map((req, idx) =>
        <LongMatCode
          key={idx}
          data={req}
          onClick={reqCbFactory(req)}
          fromMat={mat.code} />)}
    </Row>
  </Container>;

  // TODO: Split coreqs from reqs.
  const coreqs = matData.coreqMap.get(mat.code) ?? [];
  const coreqInfo = (coreqs.length > 0) && <Container>
    <Row>Co-requisitos:</Row>
    <Row>
      {coreqs.map((req, idx) =>
        <LongMatCode
          key={idx}
          data={req}
          onClick={reqCbFactory(req)}
          fromMat={mat.code} />)}
    </Row>
  </Container>;

  const postreqs = matData.postreqMap.get(mat.code) ?? [];
  const postreqInfo = (postreqs.length > 0) && <Container>
    <Row>Es requisito de:</Row>
    <Row>
      {postreqs.map((req, idx) =>
        <LongMatCode
          key={idx}
          data={req}
          onClick={reqCbFactory(req)} />)}
    </Row>
  </Container>;


  return (<>
    <Modal.Header closeButton>
      <Modal.Title>{title}</Modal.Title>
    </Modal.Header>

    <Modal.Body className="d-flex flex-column gap-3">
      {generalInfo}
      {locateBtn}

      {reqInfo}
      {coreqInfo}
      {postreqInfo}
    </Modal.Body>
  </>)
}

function Invalid({ code }: { code: string }) {
  return <>
    <Modal.Header closeButton>
      <Modal.Title>{`Materia no encontrada: ${code}`}</Modal.Title>
    </Modal.Header>
    <Modal.Body>
      Intente usando mayusculas o guiones de por medio.
    </Modal.Body>
  </>
}