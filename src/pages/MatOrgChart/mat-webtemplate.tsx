import { PropsWithChildren } from "react"
import { OverlayTrigger, Tooltip } from "react-bootstrap"
import { MatOrgChartNode } from "./pensum-to-orgdata"

function Chip({ children }: PropsWithChildren<{}>) {
  return <span style={{
    padding: '0 .5em',
    margin: '.1em .25em',
    background: 'rgba(127,127,127,0.5)',
    borderRadius: '1000px',
  }}>
    {children}
  </span>
}

function getTooltip(ctx: MatOrgChartNode) {
  return <Tooltip>
    <div className="d-flex flex-column">
      <span style={{
        fontSize: 'small',
      }}>
        {`[${ctx.code}]`}
      </span>
      <span>
        {ctx.name}
      </span>
      <span>
        <Chip>
          {`Cr: ${ctx.cr}`}
        </Chip>
        <Chip>
          {ctx.period}
        </Chip>
      </span>
      <span style={{
        opacity: '0.6',
        fontStyle: 'italic',
        fontSize: 'small',
      }}>
        Doble click para detalles
      </span>
    </div>
  </Tooltip>
}

const matTemplate = {
  name: 'matTemplate',
  itemSize: { width: 200, height: 100 },
  minimizedItemSize: { width: 3, height: 3 },
  onItemRender: ({ context }: { context: MatOrgChartNode }) => (
    // TODO: Add tooltip (double click to open info)
    <OverlayTrigger delay={{ show: 250, hide: 0 }} overlay={getTooltip(context)}>
    <div className={['bp-container', 'mat-code', 'click-target', context.selectionClass].join(' ')}>

      <div className="bp-cred" data-value={context.cr}>
        {context.cr}
      </div>

      <div
        className="bp-small code"
        style={{
          margin: '0 .5em'
        }}>
        [{context.code}]
      </div>

      <div
        className="bp-title bp-head code"
        style={{
          width: '100%',
          margin: '.5em .5em 0',
        }}>
        {context.name}
      </div>

      <div
        className="bp-small"
        style={{
          margin: '0 .5em',
        }}>
        {context.period}
      </div>

    </div>
    </OverlayTrigger>
  )
}

export default matTemplate