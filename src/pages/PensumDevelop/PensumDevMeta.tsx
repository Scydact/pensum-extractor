import DeveloperModeContext from '@/contexts/developer-mode'
import selectTheme, { optionStyle } from '@/lib/DarkMode/select-theme'
import { ChangeEvent, useContext, useMemo } from 'react'
import { Button, ButtonGroup, Card, Col, Form, FormGroup, FormLabel, Row } from 'react-bootstrap'
import { BiEraser } from 'react-icons/bi'
import { BsArrowLeftShort } from 'react-icons/bs'
import { useNavigate } from 'react-router-dom'
import Select from 'react-select'

type PensumSrcType = Pensum.Pensum['src']['type']
type PensumSrcTypeSelectOption = {
    label: string
    value: PensumSrcType
    isDisabled?: boolean
}
const PENSUM_SRC_TYPE_OPTIONS = [
    { value: 'online', label: '[ONLINE] Link de pensum' },
    { value: 'pdf', label: '[PDF] Desde PDF' },
    { value: 'scan', label: '[SCAN] Desde escaneo' },
    { value: 'convert', label: '[CONVERT] Convertido de version anterior', isDisabled: true },
    { value: 'fetch', label: '[FETCH] Generado por scraping', isDisabled: true },
] as PensumSrcTypeSelectOption[]
/** Find the option object for the given PensumSrcType value. */
function getSelectedPensumTypeOption(value: PensumSrcType): PensumSrcTypeSelectOption {
    return (
        PENSUM_SRC_TYPE_OPTIONS.find((x) => x.value === value) ?? {
            label: `[${value.toUpperCase()}] Desconocido`,
            value,
        }
    )
}

function PensumDevMeta() {
    const { pensum, commands } = useContext(DeveloperModeContext)
    const navigate = useNavigate()

    const onPensumDetailsChange = useMemo(
        () => (evt: ChangeEvent<HTMLTextAreaElement>) => {
            evt.preventDefault()
            commands.set({
                ...pensum,
                info: evt.target.value.split('\n'),
            })
        },
        [commands, pensum],
    )

    return (
        <Card>
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
                            const match = value.match(/^(\d\d)\/(\d\d)\/(\d\d\d\d)$/)
                            if (!match) return false
                            const [_, day, month, year] = [...match]
                            const date = new Date(`${year}/${month}/${day}`)
                            return !isNaN(date.getTime())
                        }}
                    />
                    <Form.Group className="mb-3">
                        <Form.Label>Detalles de la carrera</Form.Label>
                        <Form.Control
                            as="textarea"
                            placeholder="Ej. Ingeniería Automotriz..."
                            rows={7}
                            value={pensum.info.join('\n')}
                            onChange={onPensumDetailsChange}
                        ></Form.Control>
                    </Form.Group>

                    <Row>
                        <Col>
                            <FormGroup>
                                <FormLabel>Tipo de fuente</FormLabel>
                                <Select
                                    value={getSelectedPensumTypeOption(pensum.src.type)}
                                    placeholder="Tipo de fuente de pensum"
                                    options={PENSUM_SRC_TYPE_OPTIONS}
                                    onChange={(item) =>
                                        commands.set({
                                            ...pensum,
                                            src: { ...pensum.src, type: (item as PensumSrcTypeSelectOption).value },
                                        })
                                    }
                                    name="pensumSourceType"
                                    className="mb-2"
                                    theme={selectTheme}
                                    styles={optionStyle}
                                />
                            </FormGroup>
                            <MetaControl
                                label="URL de fuente"
                                placeholder=""
                                getter={(pensum) => pensum.src.url ?? ''}
                                setter={(value, pensum) => ({ ...pensum, src: { ...pensum.src, url: value || null } })}
                            />
                            <MetaControl
                                label="Fecha de consulta de la fuente"
                                placeholder=""
                                getter={(pensum) => pensum.src.date}
                                setter={(value, pensum) => ({ ...pensum, src: { ...pensum.src, date: value } })}
                            />
                        </Col>
                    </Row>
                    <Row>
                        <Col>
                            <MetaControl
                                label="Periodo (completo)"
                                placeholder="Periodo"
                                getter={(pensum) => pensum.periodType.name}
                                setter={(value, pensum) => ({
                                    ...pensum,
                                    periodType: { ...pensum.periodType, name: value },
                                })}
                            />
                        </Col>
                        <Col>
                            <MetaControl
                                label="Periodo (abreviatura)"
                                placeholder="Per"
                                getter={(pensum) => pensum.periodType.abbr}
                                setter={(value, pensum) => ({
                                    ...pensum,
                                    periodType: { ...pensum.periodType, abbr: value },
                                })}
                            />
                        </Col>
                        <Col>
                            <MetaControl
                                label="Periodo (corto)"
                                placeholder="Pd"
                                getter={(pensum) => pensum.periodType.two}
                                setter={(value, pensum) => ({
                                    ...pensum,
                                    periodType: { ...pensum.periodType, two: value },
                                })}
                            />
                        </Col>
                    </Row>
                </Form>
            </Card.Body>
        </Card>
    )
}

export default PensumDevMeta

type MetaControlProps = {
    label: string
    placeholder: string
    getter: (pensum: Pensum.Pensum) => string
    setter: (value: string, pensum: Pensum.Pensum) => Pensum.Pensum
    validator?: (value: string) => boolean
    type?: HTMLInputElement['type']
}
function MetaControl({ label, placeholder, getter, setter, type = 'string', validator }: MetaControlProps) {
    const { pensum, commands } = useContext(DeveloperModeContext)
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
                    evt.preventDefault()
                    commands.set(setter(evt.target.value, pensum))
                }}
                style={style}
            ></Form.Control>
        </Form.Group>
    )
}
