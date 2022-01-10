import { OverlayTrigger, Tooltip } from "react-bootstrap"
import { MatOrgChartNode } from "./pensum-to-orgdata"

const matTemplate = {
  name: 'matTemplate',
  itemSize: { width: 200, height: 100 },
  minimizedItemSize: { width: 3, height: 3 },
  onItemRender: ({ context }: { context: MatOrgChartNode }) => (
    // TODO: Add tooltip (double click to open info)
    <OverlayTrigger delay={{show: 250, hide: 0}} overlay={<Tooltip>Doble click para ver mas información</Tooltip>}>
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