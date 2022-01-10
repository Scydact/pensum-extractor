import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { FamDiagram } from "basicprimitivesreact";
import { Button, ButtonGroup } from "react-bootstrap";

import { useNavigate, useSearchParams } from "react-router-dom";
import { BiZoomIn, BiZoomOut } from "react-icons/bi";

import { GenericModalNavBack } from "components/GenericModal";
import TooltipButton from "components/TooltipButton";

import ActivePensumContext from "contexts/active-pensum";
import getPeriodType from "functions/pensum-get-period-type";
import { MatSelectionTrackerContext } from "contexts/mat-selection";

import useZoomPanHandler from "./use-zoom-pan-handler";
import matTemplate from "./mat-webtemplate";
import { pensumdata2org } from "./pensum-to-orgdata";
import createOrgChartOptions from "./orgchart-config";

import "./style.css";
import "./mat-webtemplate.css";
import { downloadPdf, downloadPng } from "./orgchart-export";

// Icon to be used to represent the org chart
export { ImTree as OrgChartIcon } from "react-icons/im";


// Hooks
/** Converts the pensum into data usable by basicprimitive's FamChart. */
function usePensumData() {
  const { state: { matData, pensum } } = useContext(ActivePensumContext)
  const tracker = useContext(MatSelectionTrackerContext)
  const periodType = getPeriodType(pensum)
  const items = useMemo(() => pensumdata2org(matData, tracker, periodType.acronym), [matData, tracker, periodType.acronym])
  return { items, pensum }
}

/** Syncs the selected item with the URL search params. */
function useCursorItem() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [cursorItem, setCursorItem] = useState(searchParams.get('mat')) // Selected mat code
  useEffect(() => {
    const code = searchParams.get('mat')
    if (code !== cursorItem) {
      setCursorItem(code)
    }
  }, [searchParams, cursorItem])
  
  const onCursorChanged = useCallback((event: any, data: any) => {
    const {context: item} = data;
    setCursorItem(item.code)
    if (item == null) {
      setSearchParams({}, { replace: true })
    } else {
      setSearchParams({ mat: item.code }, { replace: true })
    }
  }, [setSearchParams])

  return { cursorItem, setCursorItem, onCursorChanged }
}

function getExportTitle(pensum: Pensum.Pensum | null) {
  if (!pensum) return ''
  return `${pensum.institution.toUpperCase()} - ${pensum.career} [${pensum.code}]`
}

/** Mat organigram modal */
export default function MatOrgChart() {
  const { items, pensum } = usePensumData()
  const navigate = useNavigate()
  const config = useMemo(() => createOrgChartOptions([matTemplate]), [])
  
  const { cursorItem, onCursorChanged } = useCursorItem()

  const onDoubleClick = useCallback(() => {
    if (cursorItem) navigate(`/mat/${cursorItem}`)
  }, [cursorItem, navigate])

  const { containerProps, zoom, setZoom, scaleZoom } = useZoomPanHandler(0.1, 5.0)

  return <GenericModalNavBack
    title="Organigrama de materias"
    footer={<>
      <ButtonGroup>
        <Button onClick={() => downloadPng(getExportTitle(pensum), items, 'aaa')}>Descargar PNG</Button>
        <Button onClick={() => downloadPdf(getExportTitle(pensum), items, 'aaa')}>Descargar PDF</Button>
      </ButtonGroup>
      <ButtonGroup>
        <TooltipButton tooltip="Zoom out" placement="top" variant="secondary" onClick={() => scaleZoom(0.8)}><BiZoomOut /></TooltipButton>
        <TooltipButton tooltip="Reset zoom" placement="top" variant="secondary" onClick={() => setZoom(1)}>
          {(zoom * 100).toPrecision(3)}%
        </TooltipButton>
        <TooltipButton tooltip="Zoom in" placement="top" variant="secondary" onClick={() => scaleZoom(1/0.8)}><BiZoomIn /></TooltipButton>
      </ButtonGroup>
    </>}
    dialogClassName="matorgchart">

    <div {...containerProps} onDoubleClick={onDoubleClick}>
      <FamDiagram 
        centerOnCursor={false}
        onCursorChanged={onCursorChanged}
        config={{ ...config, items, cursorItem, scale: zoom }} />

    </div>

  </GenericModalNavBack>
}