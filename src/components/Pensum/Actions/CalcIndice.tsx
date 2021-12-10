import ActivePensumContext from "contexts/active-pensum";
import { MatSelectionTrackerContext } from "contexts/mat-selection";
import React, { useContext, useEffect, useState, useCallback, memo } from "react";
import { Button, Col, Container, Form, Modal, Table, Row, InputGroup, FormControl } from "react-bootstrap";
import { Outlet, useNavigate } from "react-router-dom";
import MatCode from "components/Pensum/Mat/MatCode";
import { useLocalStorage } from "beautiful-react-hooks";

type FormValue = {
  code: string,
  name: string,
  weight: number,
  value: number,
}

export default function CalcIndice() {
  const {
    formValues,
    setFormValues,

    periodGPA,

    cumHours,
    setCumHours,

    cumGPA,
    setCumGPA,

    newCumGPA, } = useGPA()
  const navigate = useNavigate();
  
  const handleHide = () => {
    navigate(-1)
  }

  const formHeaders = (
  <tr>
    <th>Codigo / Asignatura</th>
    <th>Cr.</th>
    <th style={{minWidth: '5em'}}>Grado</th>
  </tr>)

  const centerY = "align-middle"

  const formRows = formValues.map(f => (
    <tr key={f.code}>
      <td className={centerY}>
        <MatCode
          data={f.code}
          className="me-2"
          onClick={() => navigate(`/mat/${f.code}`)} />
          {f.name}
      </td>

      <td className={centerY}>{f.weight}</td>

      <td className={centerY}>
        <Form.Select
          value={f.value}
          onChange={(evt) => {
            const val = evt.target.value;
            setFormValues(prev => prev.map(x => {
              if (x !== f) return x;
              return {
                ...x,
                value: Number(val),
              }
            }))
          }}>
          <option value={4}>A</option>
          <option value={3}>B</option>
          <option value={2}>C</option>
          <option value={1}>D</option>
          <option value={0}>F</option>
        </Form.Select>
      </td>
    </tr>))
  


  const numFormCl = "code text-end"

  const validOut = (formValues.length === 0) ?
    (<span>
      Para usar esta calculadora, primero debe seleccionar alguna materia
      como <span className='course' style={{ color: 'var(--mat-fg-color, inherit)' }}>Cursando</span>.
    </span>) : (<>
      <Container>
        <Table size="sm">
          <thead>
            {formHeaders}
          </thead>
          <tbody>
            {formRows}
          </tbody>
        </Table>
      </Container>

      <Container>
        <InputGroup>
          <InputGroup.Text>Índice Periodo: </InputGroup.Text>
          <FormControl
            type="number"
            disabled
            className={numFormCl}
            value={periodGPA.toPrecision(5)} />
        </InputGroup>
      </Container>


      <Container>
        <details className="container border rounded p-1 px-3">
          <summary className="fw-bold">Cómo conseguir el indice acumulado exacto</summary>
          <InfoGetGPAFromBanner />
        </details>

        <InputGroup>
          <InputGroup.Text>Horas PGA (créditos acumulados): </InputGroup.Text>
          <FormControl
            type="number"
            className={numFormCl}
            onChange={(evt) => {
              const val = +evt.target.value
              setCumHours(~~Math.abs(val)) // rounded positive val
            }}
            min={0}
            step={1}
            value={cumHours} />
        </InputGroup>

        <InputGroup>
          <InputGroup.Text>PGA (índice acumulado actual): </InputGroup.Text>
          <FormControl
            type="number"
            className={numFormCl}
            onChange={(evt) => {
              const val = +evt.target.value
              setCumGPA(Math.max(0, Math.min(4, val)))
            }}
            min={0}
            max={4}
            step={0.01}
            value={cumGPA} />
        </InputGroup>
      </Container>

      <Container>
        <InputGroup>
          <InputGroup.Text className="fw-bold">Índice Acumulado: </InputGroup.Text>
          <FormControl
            type="number"
            disabled
            className={numFormCl + " fw-bold"}
            value={newCumGPA.toPrecision(5)} />
        </InputGroup>
      </Container>
    </>)

  return (
    <Modal show={true} onHide={handleHide}>
      <Modal.Header closeButton>
        <Modal.Title>Calculadora de índice</Modal.Title>
      </Modal.Header>

      <Container className="d-flex flex-column gap-3 my-3">

        {validOut}
        
        <Outlet />
      </Container>

      <Modal.Footer>
        <Button variant="primary" onClick={handleHide}>
          Cerrar
        </Button>
      </Modal.Footer>
    </Modal>)
}


const useGPA = () => {
  const [formValues, setFormValues, totalPassedCr] = useFormValues()
  const { pga: periodGPA, total: currentCr } = getPeriodPGA(formValues)

  const [cumHours, setCumHours] = useState(totalPassedCr) 
  const [cumGPA, setCumGPA] = useLocalStorage<number>('PENSUM_CALCULATOR_GPA', 3.55)

  // Reset cumulative hours if new mats added
  useEffect(() => {
    setCumHours(totalPassedCr)
  }, [totalPassedCr])

  const newCumGPA = (periodGPA * currentCr + cumGPA * cumHours) / (currentCr + cumHours)

  return {
    formValues, 
    setFormValues,
    
    periodGPA,

    cumHours,
    setCumHours,

    cumGPA,
    setCumGPA,

    newCumGPA,
  }
}



/** Gets mats, cr, and handles any weird edge cases (eg. no mats shown on refresh) */
const useFormValues = () => {
  const { course, passed } = useContext(MatSelectionTrackerContext)
  const { state: activePensumState } = useContext(ActivePensumContext)
  const { matData: { codeMap } } = activePensumState;

  const updateFormValues = useCallback((mats: Pensum.Mat[], prev: FormValue[]) =>
    mats.map(mat => {
      const old = prev.find(x => x.code === mat.code);
      if (old) return old;
      return {
        code: mat.code,
        name: mat.name,
        weight: mat.cr,
        value: 4, // Initial value A
      }
    }), [])

  const [formValues, setFormValues] = useState([] as ReturnType<typeof updateFormValues>)

  useEffect(() => {
    const trackedMats = [...course]
      .map(code => codeMap.get(code))
      .filter(Boolean) as Pensum.Mat[]

    setFormValues(prev => updateFormValues(trackedMats, prev))
  }, [course, codeMap, updateFormValues])

  const passedCr = [...passed]
    .map(code => codeMap.get(code)?.cr ?? 0)
    .reduce((cum, x) => x + cum, 0)

  type O = [FormValue[], React.Dispatch<React.SetStateAction<FormValue[]>>, number];
  return [formValues, setFormValues, passedCr] as O;
}


function getPeriodPGA(arr: FormValue[]) {
  const { total, weightSum } = arr.reduce((cum, x) => {
    cum.total += x.weight
    cum.weightSum += x.weight * x.value
    return cum
  }, { total: 0, weightSum: 0 })

  return {
    total,
    weightSum,
    pga: weightSum / total
  }
}

const InfoGetGPAFromBanner = memo(() => {
  const OutLink = ({ href, children, ...rest }: any) => (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      {...rest}>
      {children}
    </a>)

  return <Container>
    <ol>
      <li>Entrar a <OutLink href="https://landing.unapec.edu.do/banner/">Banner</OutLink>.</li>
      <li>En "Servicios academicos", ingresar a <OutLink href="https://sso.unapec.edu.do/ssomanager/c/SSB?pkg=bwskotrn.P_ViewTermTran">"Histórico académico"</OutLink>.</li>
      <li>Se le presenta un historial de todas las notas de todas las materias en todos los cuatrimestres.
        Una vez aquí, se debe bajar hasta que se encuentre la tabla "TOTALES DE HISTÓRICO ACADÉMICO (GRADO)" (antes de la tabla "CURSOS EN PROGRESO").</li>
    </ol>
    <ul>
      <li>El valor de "Horas PGA" es la cantidad de creditos acumulados.</li>
      <li>Para conseguir el indice acumulado exacto, dividir los "Puntos de Calidad" entre las "Horas PGA".</li>
    </ul>
  </Container>
})