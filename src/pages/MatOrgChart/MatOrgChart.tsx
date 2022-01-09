import { GenericModalNavBack } from "components/GenericModal";
import { Button, ButtonGroup, Modal } from "react-bootstrap";
import Chart from "./Chart";
import "./style.css";
import "./mat-webtemplate.css";
import React, { useContext, useEffect, useRef, useState } from "react";
import ActivePensumContext from "contexts/active-pensum";
import { FamDiagram } from "basicprimitivesreact";
import { Enabled, GroupByType, PageFitMode, Size, TemplateConfig } from "basicprimitives";
import { matSelectHelpers, MatSelectionTrackerContext, MatSelectionTrackerStorageContext } from "contexts/mat-selection";
import getPeriodType from "functions/pensum-get-period-type";

const zoomoutLimit = 0.2
const zoominLimit = 5
const clamp = (n: number, min: number, max: number) => (max < n) ? max : (min > n) ? min : n

export default function MatOrgChart() {
  const { state: { matData, pensum } } = useContext(ActivePensumContext)
  const tracker = useContext(MatSelectionTrackerContext)

  const periodType = getPeriodType(pensum)
  const ds = pensumdata2org(matData, tracker, periodType.acronym)
  const options = createOrgChartOptions(null, ds)

  const { containerProps, zoom, setZoom, scaleZoom } = useZoomPanHandler()
  // TODO: Handle user click:
  //https://www.basicprimitives.com/reactusecases/selectingcursoritem

  return <GenericModalNavBack
    title="Organigrama de materias"
    footer={<>
      <ButtonGroup>
        <Button disabled>Descargar PNG</Button>
        <Button disabled>Descargar PDF</Button>
      </ButtonGroup>
      <ButtonGroup>
        <Button onClick={() => scaleZoom(0.8)}>-</Button>
        <Button onClick={() => setZoom(1)}>R</Button>
        <Button onClick={() => scaleZoom(1.2)}>+</Button>
      </ButtonGroup>
    </>}
    dialogClassName="matorgchart">

    <div {...containerProps}>
      <FamDiagram config={{ ...options, scale: zoom }} />

    </div>

  </GenericModalNavBack>
}


function useZoomPanHandler() {
  // Zooming & panning stuff
  const panPos = useRef({ x: 0, y: 0, panning: false })
  // const [transform, setTransform] = useState("")
  const [zoom, setZoom] = useState(1)
  const [cursor, setCursor] = useState("default")

  console.log(zoom)

  const containerRef = useRef<HTMLDivElement>(null)

  const panEndHandler = () => {
    panPos.current.panning = false
    setCursor("default");
  };

  const panHandler = (e: any) => {
    let x = 0;
    let y = 0;
    if (!e.targetTouches) {
      // pand on desktop
      x = e.pageX;
      y = e.pageY;
    } else if (e.targetTouches.length === 1) {
      // pan on mobile device
      x = e.targetTouches[0].pageX;
      y = e.targetTouches[0].pageY;
    } else if (e.targetTouches.length > 1) {
      return;
    }

    

    if (panPos.current.panning) {
      const { x: startX, y: startY } = panPos.current
  
      const parentNode = containerRef.current?.children[0]
      if (!parentNode) return
  
      [...parentNode.children].forEach(node => {
        node.scrollLeft = node.scrollLeft - (x - startX)
        node.scrollTop = node.scrollTop - (y - startY)
      })
    }

    panPos.current.x = x
    panPos.current.y = y

  };

  const panStartHandler = (e: any) => {
    if (e.target.closest(".oc-node")) {
      panPos.current.panning = false
      return;
    } else {
      panPos.current.panning = true
      setCursor("move");
    }

    let newX = 0;
    let newY = 0;

    if (!e.targetTouches) {
      // pand on desktop
      newX = e.pageX;
      newY = e.pageY;
    } else if (e.targetTouches.length === 1) {
      // pan on mobile device
      newX = e.targetTouches[0].pageX;
      newY = e.targetTouches[0].pageY;
    } else if (e.targetTouches.length > 1) {
      return;
    }

    panPos.current.x = newX
    panPos.current.y = newY

  };

  const setZoomClamped = (newScale: number) =>
    setZoom(p => clamp(p * newScale, zoomoutLimit, zoominLimit))

  const zoomHandler = (e: WheelEvent) => {
    e.preventDefault()
    let newScale = 1 - 0.2 * e.deltaY / 100;
    setZoomClamped(newScale)
  };

  useEffect(() => {
    const node = containerRef.current

    if (node) {
      node.addEventListener('wheel', zoomHandler)
      return () => node.removeEventListener('wheel', zoomHandler)
    }
  }, [])

  return {
    containerProps: {
      ref: containerRef,
      style: {
        width: '100%',
        height: '100%',
      },
      onMouseUp: panEndHandler,
      onMouseDown: panStartHandler,
      onMouseMove: panHandler,
    },
    zoom,
    scaleZoom: setZoomClamped, // For use in + - buttons
    setZoom,
  }
}




type MatOrgChartNode = {
  id: string,
  parents: string[],
  primaryParent: string[] | null,
  templateName: string,

  code: string,
  cr: string,
  name: string,
  period: string,
  
  selectionClass: string
}
function pensumdata2org(data: ActivePensum.MatExtraData, tracker: MatSelection.Tracker, periodStr: string) {
  const o: MatOrgChartNode[] = []

  // Mats & loose // TODO: Confirm this list actually has the loose mats.
  o.push(...data.list.map(
    mat => mat2org(
      mat, 
      data.periodMap.get(mat.code) || 0,
      matSelectHelpers.getTracker(tracker, mat.code) || 'default',
      periodStr,
    )
  ))

  // Loose unhandled... (error codes?)
  o.push(...[...data.looseUnhandled].map(
    str => mat2org(
      { code: str }, 
      -1,
      matSelectHelpers.getTracker(tracker, str) || 'default', // I think this is always default?
      )
  ))

  return o
}





const UNKNOWN = '???'
type Mat2OrgLenient = {
  code: string,
  [k: string]: any
}
function mat2org(obj: Mat2OrgLenient, period: number, selectionClass: string = 'default', periodStr = 'Per.'): MatOrgChartNode {
  return {
    id: obj.code,
    parents: obj.prereq || 'base',
    primaryParent: obj.prereq || null,
    templateName: 'matTemplate',

    code: obj.code || UNKNOWN,
    cr: String(obj.cr || UNKNOWN),
    name: obj.name || UNKNOWN,
    period: periodStr + ': ' + String(period),

    selectionClass,
  }
}

const matTemplate = {
  name: 'matTemplate',
  itemSize: { width: 200, height: 100 },
  minimizedItemSize: { width: 3, height: 3 },
  onItemRender: ({ context }: { context: MatOrgChartNode }) => (
    // TODO: Add tooltip (double click to open info)
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
  )
}


function createOrgChartOptions(onTemplateRender: any, items: any) {
  const options: any = {}
  return {
    ...options,
    items,
    pageFitMode: PageFitMode.None,

    // Rendering
    arrowsDirection: GroupByType.Children,
    linesWidth: 3,
    linesColor: 'var(--bs-body-color, black)',
    normalLevelShift: 30,
    lineLevelShift: 20,
    dotLevelShift: 20,
    alignBylevels: true,
    hideGrandParentsConnectors: true,

    // templates
    templates: [matTemplate],
    onItemRender: onTemplateRender,

    // Buttons
    hasButtons: Enabled.True,
    buttonsPanelSize: 38,

    // Extras
    hasSelectorCheckbox: Enabled.False,
    showCallout: false,

  }


}