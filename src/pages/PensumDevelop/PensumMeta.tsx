import { ChangeEvent, ChangeEventHandler, useContext, useMemo } from "react";
import _ from "lodash"

import { Button, ButtonGroup, Card, Container, Dropdown, Form, Row } from "react-bootstrap"
import { useNavigate } from "react-router-dom";
import { BiEraser } from "react-icons/bi";

import PensumDisplay from "./PensumDisplayCards";
import ActivePensumContext from "contexts/active-pensum";
import { BsArrowLeftShort } from "react-icons/bs";
import DeveloperModeContext from "contexts/developer-mode";



function PensumMeta() {
  const { pensum, commands } = useContext(DeveloperModeContext);
  const navigate = useNavigate();

  return <Card>
    <Card.Body style={{ display: 'flex', gap: '.5em', flexDirection: 'column' }}>

      <Row>
        <ButtonGroup>
          <Button onClick={() => navigate('/')}>
            <BsArrowLeftShort /> Volver a modo normal
          </Button>
        </ButtonGroup>
      </Row>

      <Row>
        <ButtonGroup>
          <Button onClick={() => commands.new()}>
            <BiEraser /> Crear desde cero
          </Button>
        </ButtonGroup>
      </Row>

      <Form>
        <MetaControl 
          label="Código universidad"
          placeholder="Ej. unapec, pucmm, uasd..."
          getter={(pensum) => pensum.institution}
          setter={(value, pensum) => ({ ...pensum, institution: value })}
        />
        <MetaControl 
          label="Código carrera"
          placeholder="Ej. CDM12"
          getter={(pensum) => pensum.code}
          setter={(value, pensum) => ({ ...pensum, code: value })}
        />
        <MetaControl 
          label="Nombre de carrera"
          placeholder="Ej. Ingeniería Automotriz..."
          getter={(pensum) => pensum.career}
          setter={(value, pensum) => ({ ...pensum, career: value })}
        />
        <MetaControl 
          label="Fecha de publicación"
          placeholder="Ej. 01/03/2003"
          getter={(pensum) => pensum.publishDate}
          setter={(value, pensum) => ({ ...pensum, publishDate: value })}
          validator={(value: string) => {
            const match = value.match(/^(\d\d)\/(\d\d)\/(\d\d\d\d)$/);
            if (!match) return false;
            const [_, day, month, year] = [...match];
            const date = new Date(`${year}/${month}/${day}`);
            return !isNaN(date.getTime());
          }}
        />
        <Form.Group className="mb-3">
          <Form.Label>Detalles de la carrera</Form.Label>
          <Form.Control
            as="textarea"
            placeholder="Ej. Ingeniería Automotriz..."
            rows={7}
            value={pensum.info.join('\n')}
            onChange={useMemo(() => (evt: ChangeEvent<HTMLTextAreaElement>) => {
              evt.preventDefault();
              commands.set({
                ...pensum,
                info: evt.target.value.split('\n'),
              })
            }, [commands])}
          ></Form.Control>
        </Form.Group>
      </Form>

    </Card.Body>
  </Card>
}

export default PensumMeta

type MetaControlProps = {
  label: string
  placeholder: string
  getter: (pensum: Pensum.Pensum) => string
  setter: (value: string, pensum: Pensum.Pensum) => Pensum.Pensum
  validator?: (value: string) => boolean
  type?: HTMLInputElement['type']
}
function MetaControl({ label, placeholder, getter, setter, type = 'string', validator }: MetaControlProps) {
  const { pensum, commands } = useContext(DeveloperModeContext);
  let style = {}
  if (validator && !validator(getter(pensum))) {
    style = { color: 'red', fontWeight: 'bold' }
  }
  return (
    <Form.Group className="mb-3">
      <Form.Label>{label}</Form.Label>
      <Form.Control
        type={type}
        placeholder={placeholder}
        value={getter(pensum)}
        onChange={(evt: ChangeEvent<HTMLTextAreaElement>) => {
          evt.preventDefault();
          commands.set(setter(evt.target.value, pensum));
        }}
        style={style}
      ></Form.Control>
    </Form.Group>
  )
}